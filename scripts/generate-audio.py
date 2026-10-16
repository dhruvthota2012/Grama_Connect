#!/usr/bin/env python3
"""
GramaConnect Audio Asset Generator using edge-tts
=================================================
Generates pre-recorded MP3 audio clips for GramaConnect kiosk from scripts/audio-manifest.json.

PREREQUISITES:
    pip install edge-tts

USAGE:
    # Generate missing clips only (skips already existing files):
    python scripts/generate-audio.py

    # Force re-generation of all clips:
    python scripts/generate-audio.py --force

    # Filter by specific language:
    python scripts/generate-audio.py --lang te
"""

import sys
import os
import json
import argparse
import asyncio
import time
import shutil

# Voice configuration
VOICES = {
    'te': 'te-IN-ShrutiNeural',
    'hi': 'hi-IN-SwaraNeural',
    'en': 'en-IN-NeerjaNeural',
}

def check_edge_tts():
    """Verify edge-tts is installed either as a python package or CLI tool."""
    try:
        import edge_tts
        return 'module'
    except ImportError:
        pass

    if shutil.which('edge-tts'):
        return 'cli'

    return None

async def generate_with_module(text: str, voice: str, output_path: str):
    import edge_tts
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(output_path)

async def generate_with_cli(text: str, voice: str, output_path: str):
    proc = await asyncio.create_subprocess_exec(
        'edge-tts',
        '--voice', voice,
        '--text', text,
        '--write-media', output_path,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(f"edge-tts CLI failed with returncode {proc.returncode}: {stderr.decode('utf-8', errors='ignore')}")

async def main():
    parser = argparse.ArgumentParser(description="Generate GramaConnect audio assets using edge-tts")
    parser.add_argument('--force', action='store_true', help="Force re-generation of existing files")
    parser.add_argument('--lang', choices=['en', 'te', 'hi'], help="Generate only for specified language")
    args = parser.parse_args()

    engine_mode = check_edge_tts()
    if not engine_mode:
        print("\n" + "=" * 60)
        print("ERROR: edge-tts is not installed.")
        print("=" * 60)
        print("Please install edge-tts using pip:")
        print("    pip install edge-tts")
        print("\nThen rerun:")
        print("    python scripts/generate-audio.py")
        print("=" * 60 + "\n")
        sys.exit(1)

    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    manifest_path = os.path.join(project_root, 'scripts', 'audio-manifest.json')

    if not os.path.exists(manifest_path):
        print(f"Error: audio manifest not found at: {manifest_path}")
        sys.exit(1)

    with open(manifest_path, 'r', encoding='utf-8') as f:
        manifest = json.load(f)

    target_langs = [args.lang] if args.lang else ['te', 'hi', 'en']
    total_clips = len(manifest) * len(target_langs)
    processed = 0
    generated = 0
    skipped = 0
    failed = 0

    print("=" * 60)
    print(f"GramaConnect Audio Generator ({engine_mode} mode)")
    print(f"Target languages: {', '.join(target_langs)}")
    print(f"Manifest items:   {len(manifest)}")
    print(f"Force overwrite:  {args.force}")
    print("=" * 60)

    for key, lang_map in manifest.items():
        for lang in target_langs:
            processed += 1
            text = lang_map.get(lang)
            if not text:
                continue

            voice = VOICES[lang]
            out_dir = os.path.join(project_root, 'public', 'audio', lang)
            os.makedirs(out_dir, exist_ok=True)
            out_file = os.path.join(out_dir, f"{key}.mp3")

            if os.path.exists(out_file) and not args.force:
                skipped += 1
                continue

            print(f"[{processed}/{total_clips}] [{lang}] Generating '{key}' -> {voice} ...", end="", flush=True)
            try:
                if engine_mode == 'module':
                    await generate_with_module(text, voice, out_file)
                else:
                    await generate_with_cli(text, voice, out_file)
                print(" OK")
                generated += 1
                await asyncio.sleep(0.15)  # respectful rate limiting
            except Exception as e:
                print(f" FAILED: {e}")
                failed += 1

    print("\n" + "=" * 60)
    print("Generation complete:")
    print(f"  Generated: {generated}")
    print(f"  Skipped (already exists): {skipped}")
    print(f"  Failed:    {failed}")
    print("=" * 60)

if __name__ == '__main__':
    asyncio.run(main())
