#!/usr/bin/env python3
"""Prepare a loadable Chrome extension directory from repo sources."""
from __future__ import annotations

import argparse
import shutil
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = ROOT / "chrome-extension"
FILES = [
    "manifest.json",
    "background.js",
    "viralTopic.js",
    "popup.html",
    "popup.js",
    "options.html",
    "options.js",
    "styles.css",
]
ICON_DIR = "icons"


def copy_sources() -> None:
    TARGET.mkdir(exist_ok=True)
    (TARGET / ICON_DIR).mkdir(exist_ok=True)
    for relative in FILES:
        shutil.copy2(ROOT / relative, TARGET / relative)
    for icon in (ROOT / ICON_DIR).glob("*.svg"):
        shutil.copy2(icon, TARGET / ICON_DIR / icon.name)


def make_zip() -> Path:
    dist = ROOT / "dist"
    dist.mkdir(exist_ok=True)
    archive = dist / "viral-topic-finder.zip"
    if archive.exists():
        archive.unlink()
    with zipfile.ZipFile(archive, "w", zipfile.ZIP_DEFLATED) as zf:
        for path in sorted(TARGET.rglob("*")):
            if path.is_file():
                zf.write(path, path.relative_to(TARGET))
    return archive


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--zip", action="store_true", help="also create dist/viral-topic-finder.zip")
    args = parser.parse_args()
    copy_sources()
    if args.zip:
        print(make_zip())
    else:
        print(TARGET)


if __name__ == "__main__":
    main()
