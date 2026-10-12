#!/usr/bin/env python3
"""Build Reinforce MP4s: JPG stills + mood BGM + burn-in captions (no voice)."""

from __future__ import annotations

import json
import re
import shutil
import subprocess
import tempfile
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
MEDIA = ROOT / "public" / "media" / "reinforce"
STILLS = MEDIA / "stills"
MUSIC = MEDIA / "music"
HEALTH = ROOT / "public" / "media" / "health"
FFMPEG = shutil.which("ffmpeg") or "/opt/homebrew/bin/ffmpeg"
RSVG = shutil.which("rsvg-convert") or "/opt/homebrew/bin/rsvg-convert"
MIN_BEAT_SECS = 3.4
MAX_BEAT_SECS = 9

# (beat_id, still_key, line, mood) — clear short lines; mood: troubled | hopeful
SCRIPTS: dict[str, list[tuple[str, str, str, str]]] = {
    "script-monsters": [
        (
            "s1-intro",
            "s1-intro",
            "Smoking feels like help. It creates the discomfort, then briefly pauses it.",
            "troubled",
        ),
        (
            "s1-bucket",
            "s1-underwater",
            "Picture your head held under water in a bucket. You cannot breathe.",
            "troubled",
        ),
        (
            "s1-lift",
            "s1-underwater",
            "You lift your head out. The air feels wonderful. That feeling is only relief.",
            "troubled",
        ),
        (
            "s1-same",
            "s1-pinch",
            "A cigarette does the same thing. It only lifts your head out for a moment.",
            "troubled",
        ),
        (
            "s1-return",
            "s1-underwater",
            "Then the discomfort returns, and your head goes back under the water.",
            "troubled",
        ),
        (
            "s1-little",
            "s1-stress",
            "The little monster is that body discomfort — nicotine asking to be fed.",
            "troubled",
        ),
        (
            "s1-big",
            "s1-stress",
            "The big monster is the belief that this relief is pleasure, calm, or focus.",
            "troubled",
        ),
        (
            "s1-deceptions",
            "s1-lunch",
            "After coffee, food, or stress, that belief returns. It is still the same trap.",
            "troubled",
        ),
        (
            "s1-law",
            "s1-punchline",
            "The law of smoking: you never need one. One puff puts you back under water.",
            "troubled",
        ),
        (
            "s1-harm",
            "s1-trap",
            "It costs breath, money, voice, and energy, and it keeps you coming back.",
            "troubled",
        ),
        (
            "s1-free",
            "s1-free",
            "I have quit. My head is out of the water, and I will not go back.",
            "hopeful",
        ),
        (
            "s1-health",
            "s1-health",
            "My lungs, heart, and circulation can recover.",
            "hopeful",
        ),
        (
            "s1-voice",
            "s1-voice",
            "My voice clears. My breath feels steady when I speak.",
            "hopeful",
        ),
        (
            "s1-energy",
            "s1-energy",
            "My energy returns. I feel more awake.",
            "hopeful",
        ),
        (
            "s1-reproductive",
            "s1-reproductive",
            "Quitting supports fertility and the long-term health I want.",
            "hopeful",
        ),
        (
            "s1-pity",
            "s1-pity",
            "I feel for people still smoking. They are not weak. They mistake relief for pleasure.",
            "hopeful",
        ),
        (
            "s1-close",
            "s1-close",
            "I am free. I stay smoke-free.",
            "hopeful",
        ),
    ],
    "script-urge": [
        (
            "s2-notice",
            "s2-notice",
            "An urge is your body asking for relief. You do not have to obey it.",
            "hopeful",
        ),
        (
            "s2-name",
            "s2-accept",
            "Name it: this is nicotine withdrawal, not a real need.",
            "hopeful",
        ),
        (
            "s2-bucket",
            "s1-underwater",
            "Smoking would only lift your head out of the water, then push it back under.",
            "hopeful",
        ),
        (
            "s2-breathe",
            "s2-breathe",
            "Breathe in for five seconds. Hold for five. Breathe out for five.",
            "hopeful",
        ),
        (
            "s2-pass",
            "s2-exhale",
            "The urge rises, peaks, and falls. You can watch it pass.",
            "hopeful",
        ),
        (
            "s2-close",
            "s2-close",
            "You already chose freedom. Return to your day without a cigarette.",
            "hopeful",
        ),
    ],
    "script-affirm": [
        (
            "a1-mindful",
            "s1-free",
            "I notice where my attention is, and I return it to the task in front of me.",
            "hopeful",
        ),
        (
            "a2-day",
            "s1-energy",
            "One bad event does not own my day. I pause, learn, and move on.",
            "hopeful",
        ),
        (
            "a3-career",
            "s1-voice",
            "I prepare for the next career move with skill and steady speaking practice.",
            "hopeful",
        ),
        (
            "a4-smoking",
            "s1-health",
            "A cigarette does not fix the problem. It only pauses nicotine discomfort.",
            "hopeful",
        ),
        (
            "a5-better",
            "s1-stamina",
            "Change is not one day. I get one percent better, and I keep going.",
            "hopeful",
        ),
    ],
}


def run(cmd: list[str], cwd: Path | None = None) -> None:
    subprocess.run(cmd, check=True, cwd=str(cwd) if cwd else None)


def beat_duration_seconds(text: str) -> float:
    words = max(1, len(text.split()))
    secs = 2.4 + words * 0.42
    return max(MIN_BEAT_SECS, min(MAX_BEAT_SECS, secs))


def ensure_bgm() -> None:
    """Prefer committed music/*.mp3. Only synthesize a loud fallback if missing."""
    MUSIC.mkdir(parents=True, exist_ok=True)
    troubled = MUSIC / "troubled.mp3"
    hopeful = MUSIC / "hopeful.mp3"

    if not troubled.exists():
        print("WARNING: music/troubled.mp3 missing — generating temporary fallback")
        run(
            [
                FFMPEG,
                "-y",
                "-hide_banner",
                "-loglevel",
                "error",
                "-f",
                "lavfi",
                "-i",
                "sine=frequency=110:duration=90",
                "-f",
                "lavfi",
                "-i",
                "sine=frequency=164.81:duration=90",
                "-filter_complex",
                "[0][1]amix=inputs=2,tremolo=f=2:d=0.5,loudnorm=I=-14:TP=-1.5:LRA=8",
                "-ac",
                "2",
                "-c:a",
                "libmp3lame",
                "-q:a",
                "3",
                str(troubled),
            ]
        )

    if not hopeful.exists():
        print("WARNING: music/hopeful.mp3 missing — generating temporary fallback")
        run(
            [
                FFMPEG,
                "-y",
                "-hide_banner",
                "-loglevel",
                "error",
                "-f",
                "lavfi",
                "-i",
                "sine=frequency=261.63:duration=90",
                "-f",
                "lavfi",
                "-i",
                "sine=frequency=329.63:duration=90",
                "-f",
                "lavfi",
                "-i",
                "sine=frequency=392:duration=90",
                "-filter_complex",
                "[0][1][2]amix=inputs=3,tremolo=f=3:d=0.3,loudnorm=I=-14:TP=-1.5:LRA=8",
                "-ac",
                "2",
                "-c:a",
                "libmp3lame",
                "-q:a",
                "3",
                str(hopeful),
            ]
        )


def ensure_benefit_stills() -> None:
    STILLS.mkdir(parents=True, exist_ok=True)
    copies: list[tuple[str, Path]] = [
        ("s1-free.jpg", STILLS / "s2-close.jpg"),
        ("s1-health.jpg", HEALTH / "2w-3m.jpg"),
        ("s1-mood.jpg", STILLS / "s2-breathe.jpg"),
        ("s1-energy.jpg", HEALTH / "24h.jpg"),
        ("s1-reproductive.jpg", HEALTH / "reproductive.jpg"),
        ("s1-stamina.jpg", HEALTH / "20m.jpg"),
        ("s1-relationships.jpg", STILLS / "s1-social.jpg"),
        ("s1-close.jpg", STILLS / "s2-close.jpg"),
    ]
    for dest_name, src in copies:
        dest = STILLS / dest_name
        if dest.exists() or not src.exists():
            continue
        shutil.copy2(src, dest)
        print(f"  still {dest_name} <- {src.name}")


def scale_still_to_png(source: Path, png: Path) -> None:
    run(
        [
            FFMPEG,
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(source),
            "-vf",
            "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x134E4A",
            str(png),
        ]
    )


def svg_to_png(svg: Path, png: Path) -> None:
    tmp = png.with_suffix(".raw.png")
    run(
        [
            RSVG,
            "-w",
            "1280",
            "-h",
            "720",
            "--keep-aspect-ratio",
            "-b",
            "#134E4A",
            "-o",
            str(tmp),
            str(svg),
        ]
    )
    scale_still_to_png(tmp, png)
    tmp.unlink(missing_ok=True)


def resolve_still_source(beat_id: str, still_key: str) -> Path:
    for candidate in (
        STILLS / f"{beat_id}.jpg",
        STILLS / f"{still_key}.jpg",
        STILLS / f"{beat_id}.jpeg",
        STILLS / f"{beat_id}.webp",
        STILLS / f"{beat_id}.png",
        MEDIA / f"{still_key}.svg",
    ):
        if candidate.exists():
            return candidate
    raise FileNotFoundError(f"No still for beat {beat_id} (key {still_key})")


def prepare_still_png(beat_id: str, still_key: str, png: Path) -> None:
    source = resolve_still_source(beat_id, still_key)
    if source.suffix.lower() == ".svg":
        svg_to_png(source, png)
    else:
        scale_still_to_png(source, png)


def burn_captions_on_png(png: Path, text: str) -> None:
    """Burn large anthem captions onto still."""
    img = Image.open(png).convert("RGBA")
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    font_candidates = (
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\arial.ttf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
        "/Library/Fonts/Arial Bold.ttf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    )
    font = None
    for path in font_candidates:
        try:
            size = 30 if path.lower().endswith("arial.ttf") else 32
            font = ImageFont.truetype(path, size)
            break
        except OSError:
            continue
    if font is None:
        font = ImageFont.load_default()

    lines = textwrap.wrap(text, width=34) or [""]
    line_sizes = [draw.textbbox((0, 0), line, font=font) for line in lines]
    line_heights = [b[3] - b[1] for b in line_sizes]
    line_widths = [b[2] - b[0] for b in line_sizes]
    gap = 10
    block_h = sum(line_heights) + gap * (len(lines) - 1)
    block_w = max(line_widths) if line_widths else 0
    pad_x, pad_y = 36, 22
    box_w = min(img.width - 48, block_w + pad_x * 2)
    box_h = block_h + pad_y * 2
    box_x = (img.width - box_w) // 2
    box_y = img.height - box_h - 48
    draw.rounded_rectangle(
        (box_x, box_y, box_x + box_w, box_y + box_h),
        radius=16,
        fill=(0, 0, 0, 165),
    )
    y = box_y + pad_y
    for line, h, w in zip(lines, line_heights, line_widths):
        x = box_x + (box_w - w) // 2
        draw.text((x, y), line, font=font, fill=(255, 255, 255, 255))
        y += h + gap
    Image.alpha_composite(img, overlay).convert("RGB").save(png)


def strip_svg_text() -> None:
    for path in MEDIA.glob("*.svg"):
        text = path.read_text()
        cleaned = re.sub(r"<text[\s\S]*?</text>", "", text)
        if cleaned != text:
            path.write_text(cleaned)


def build_script(
    script_id: str,
    beats: list[tuple[str, str, str, str]],
    work: Path,
) -> None:
    print(f"Building {script_id}...")
    concat_list = work / f"{script_id}-concat.txt"
    cues: list[dict] = []
    t_ms = 0
    lines: list[str] = []
    troubled_bgm = MUSIC / "troubled.mp3"
    hopeful_bgm = MUSIC / "hopeful.mp3"

    for beat_id, still_key, line, mood in beats:
        print(f"  {beat_id} ({mood}): {line}")
        png = work / f"{beat_id}.png"
        clip = work / f"{beat_id}.mp4"
        bgm = hopeful_bgm if mood == "hopeful" else troubled_bgm
        total = beat_duration_seconds(line)

        prepare_still_png(beat_id, still_key, png)
        burn_captions_on_png(png, line)

        run(
            [
                FFMPEG,
                "-y",
                "-hide_banner",
                "-loglevel",
                "error",
                "-loop",
                "1",
                "-i",
                str(png),
                "-stream_loop",
                "-1",
                "-i",
                str(bgm),
                "-filter_complex",
                # Keep music prominent; normalize so it is clearly audible in browsers
                "[1:a]loudnorm=I=-14:TP=-1.2:LRA=8,volume=1.35[a]",
                "-map",
                "0:v",
                "-map",
                "[a]",
                "-c:v",
                "libx264",
                "-tune",
                "stillimage",
                "-pix_fmt",
                "yuv420p",
                "-r",
                "24",
                "-c:a",
                "aac",
                "-b:a",
                "192k",
                "-ac",
                "2",
                "-ar",
                "44100",
                "-t",
                f"{total:.3f}",
                str(clip),
            ]
        )

        clip_ms = int(round(total * 1000))
        cues.append(
            {
                "id": beat_id,
                "startMs": t_ms,
                "durationMs": clip_ms,
                "text": line,
            }
        )
        t_ms += clip_ms
        lines.append(f"file '{clip}'")

    concat_list.write_text("\n".join(lines) + "\n")
    out = MEDIA / f"{script_id}.mp4"
    run(
        [
            FFMPEG,
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-f",
            "concat",
            "-safe",
            "0",
            "-i",
            str(concat_list),
            "-c",
            "copy",
            str(out),
        ]
    )
    cues_json = json.dumps(cues, indent=2)
    data_dir = ROOT / "src" / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    (data_dir / f"{script_id}-cues.json").write_text(cues_json)
    print(f"  wrote {out.name} ({out.stat().st_size // 1024} KB), {t_ms} ms, {len(cues)} cues")


def main() -> None:
    STILLS.mkdir(parents=True, exist_ok=True)
    strip_svg_text()
    ensure_bgm()
    ensure_benefit_stills()
    with tempfile.TemporaryDirectory(prefix="smokefree-reinforce-") as tmp:
        work = Path(tmp)
        for script_id, beats in SCRIPTS.items():
            build_script(script_id, beats, work)
    print("Done.")


if __name__ == "__main__":
    main()
