# Real assets note

This project now supports place illustrations and audio playback from local files under `public/`.

## About the current audio
The included MP3 files are placeholder/generated ambience samples.
If you want **real recorded Mongolian narration** or **real morin khuur / khoomei recordings**, replace these files with your own licensed recordings:

- `public/audio/map/karakorum.mp3`
- `public/audio/map/khentii.mp3`
- `public/audio/map/altai.mp3`
- `public/audio/map/gobi.mp3`
- `public/audio/map/uvs.mp3`
- `public/audio/culture/ger-ambience.mp3`
- `public/audio/culture/morin-khuur.mp3`
- `public/audio/culture/khoomei.mp3`
- `public/audio/culture/steppe-atmosphere.mp3`
- `public/audio/culture/script-chime.mp3`

Use the same filenames and the UI will play them automatically.

## About the current images
The included place images are local SVG illustrations:
- `public/images/places/karakorum.svg`
- `public/images/places/khentii.svg`
- `public/images/places/altai.svg`
- `public/images/places/gobi.svg`
- `public/images/places/uvs.svg`

You can replace them with real JPG/PNG artwork using the same path or update the `imageSrc` fields in `src/components/MapExplorer.tsx`.
