# SteppeQuest vNext.2

## 1. Mongolian narration
- `AudioGuide` now tries a pre-generated Mongolian MP3 first.
- If the MP3 is missing it falls back to a local `mn-MN` browser voice when available.
- Map, historical timeline, culture/script, and historical-figure narration paths are wired.
- `scripts/generate_mongolian_narration.py` generates all narration clips with Google Cloud Gemini-TTS under the user's own Cloud project.
- API credentials are never embedded in GitHub Pages.

## 2. Mounted archery
The old stationary target game is replaced by a more gameplay-heavy 2.5D riding challenge:
- perspective targets approach from the horizon
- horse/rider gallop animation
- aim sway caused by riding
- wind correction
- hold/release bow draw
- Shift focus mode
- focus resource
- combo bonuses
- gold/small target variants
- timed multi-stage progression
- score, hit count and accuracy result

## 3. Relay courier
The courier game now uses a 2.5D perspective road:
- three lanes
- left/right lane changes
- jumping
- Shift boost
- obstacles and pickups approaching in depth
- scroll/seal/water mission objectives
- horse-specific speed, jump and stamina
- dawn, daytime and night stages
- collision camera shake and game feedback

## 4. Ger
- Uses real ger interior photos supplied in the project.
- The ger-specific listening panel remains removed as requested.
- Real-photo hotspots remain interactive.

## Deploy note
The GitHub Actions workflow no longer uses `cache: npm`, so a missing package-lock file will not fail Setup Node.
