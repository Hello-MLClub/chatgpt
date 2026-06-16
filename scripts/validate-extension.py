#!/usr/bin/env python3
"""Validate that a directory is loadable by Chrome as an unpacked extension."""
from __future__ import annotations

import json
import sys
from pathlib import Path

required = ["manifest.json", "background.js", "popup.html", "popup.js", "options.html", "options.js", "styles.css", "viralTopic.js"]
root = Path(sys.argv[1] if len(sys.argv) > 1 else "chrome-extension")
missing = [name for name in required if not (root / name).is_file()]
if missing:
    raise SystemExit(f"Missing extension files in {root}: {', '.join(missing)}")
manifest = json.loads((root / "manifest.json").read_text(encoding="utf-8"))
if manifest.get("manifest_version") != 3:
    raise SystemExit("manifest_version must be 3")
for size, relative in manifest.get("icons", {}).items():
    if not (root / relative).is_file():
        raise SystemExit(f"Missing icon {size}: {relative}")
print(f"OK: {root} contains a readable Chrome Manifest V3 extension")
