#!/usr/bin/env python3
"""Generate SteppeQuest Mongolian narration MP3 files with Google Cloud Gemini-TTS.

Requirements:
  1) gcloud CLI installed
  2) gcloud auth application-default login
  3) export GOOGLE_CLOUD_PROJECT="your-project-id"
  4) Cloud Text-to-Speech API enabled and the account permitted to use Gemini-TTS

No API key is stored in the website or repository. This script runs locally and writes
finished MP3 assets into public/audio/narration/.
"""

from __future__ import annotations

import base64
import json
import os
import pathlib
import subprocess
import sys
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCRIPT_FILE = ROOT / "scripts" / "narration_mn.json"
OUT_DIR = ROOT / "public" / "audio" / "narration"
ENDPOINT = "https://texttospeech.googleapis.com/v1/text:synthesize"
MODEL = os.getenv("STEPPEQUEST_TTS_MODEL", "gemini-2.5-flash-tts")
VOICE = os.getenv("STEPPEQUEST_TTS_VOICE", "Kore")
LANGUAGE = "mn-MN"
PROMPT = (
    "Монгол хэлээр төрөлх монгол нэвтрүүлэгч шиг дулаан, байгалийн, итгэл төрүүлэх өнгөөр унш. "
    "Дуудлагыг тод, хэт хурдан биш байлга. Түүх, өв соёлын музейн тайлбар шиг тайван, хүнлэг хэмнэл хэрэглэ. "
    "Монгол нэр, он цагийг монгол аялгаар зөв, ойлгомжтой дууд. Англи аялга бүү оруул."
)


def access_token() -> str:
    try:
        return subprocess.check_output(
            ["gcloud", "auth", "application-default", "print-access-token"],
            text=True,
        ).strip()
    except (FileNotFoundError, subprocess.CalledProcessError) as exc:
        raise SystemExit(
            "gcloud authentication not ready. Run: gcloud auth application-default login"
        ) from exc


def synthesize(project: str, token: str, text: str) -> bytes:
    body = {
        "input": {"prompt": PROMPT, "text": text},
        "voice": {
            "languageCode": LANGUAGE,
            "name": VOICE,
            "modelName": MODEL,
        },
        "audioConfig": {"audioEncoding": "MP3"},
    }
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(body, ensure_ascii=False).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {token}",
            "x-goog-user-project": project,
            "Content-Type": "application/json; charset=utf-8",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=180) as response:
            payload = json.load(response)
    except urllib.error.HTTPError as exc:
        details = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Google TTS HTTP {exc.code}: {details}") from exc
    if "audioContent" not in payload:
        raise RuntimeError(f"No audioContent returned: {payload}")
    return base64.b64decode(payload["audioContent"])


def main() -> int:
    project = os.getenv("GOOGLE_CLOUD_PROJECT")
    if not project:
        print('Set project first: export GOOGLE_CLOUD_PROJECT="your-project-id"', file=sys.stderr)
        return 2

    items = json.loads(SCRIPT_FILE.read_text(encoding="utf-8"))
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    token = access_token()
    print(f"Generating {len(items)} Mongolian MP3 files with {MODEL} / {VOICE} ...")

    for index, item in enumerate(items, 1):
        out = OUT_DIR / item["file"]
        print(f"[{index}/{len(items)}] {out.name}")
        audio = synthesize(project, token, item["text"])
        out.write_bytes(audio)

    print(f"Done. MP3 files: {OUT_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
