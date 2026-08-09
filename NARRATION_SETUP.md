# Real Mongolian narration MP3

SteppeQuest vNext.2 is wired for pre-generated Mongolian MP3 narration. The actual files
must be synthesized under your own Google Cloud project because authentication and billing
cannot be embedded in a public GitHub Pages site.

Google Cloud Gemini-TTS currently lists Mongolian (`mn-MN`) as a Preview language and can
return MP3 from the Cloud Text-to-Speech API.

## One-time setup on Mac

```bash
gcloud auth application-default login
export GOOGLE_CLOUD_PROJECT="YOUR_GOOGLE_CLOUD_PROJECT_ID"
gcloud services enable texttospeech.googleapis.com --project "$GOOGLE_CLOUD_PROJECT"
```

Your account/project also needs permission to use the Gemini-TTS model endpoint.

## Generate every SteppeQuest narration file

From the project root:

```bash
python3 scripts/generate_mongolian_narration.py
```

Output goes to:

```text
public/audio/narration/*.mp3
```

Then test and deploy:

```bash
npm run build
git add -A
git commit -m "Add real Mongolian narration and vNext.2 games"
git push origin main
```

## Voice/model overrides

Defaults:
- model: `gemini-2.5-flash-tts`
- voice: `Kore`
- locale: `mn-MN`

Optional:

```bash
export STEPPEQUEST_TTS_MODEL="gemini-2.5-pro-tts"
export STEPPEQUEST_TTS_VOICE="Charon"
python3 scripts/generate_mongolian_narration.py
```

The TTS credential is used only by the local generation script; it is never shipped to the browser.
