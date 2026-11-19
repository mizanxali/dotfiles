---
name: launch-video
description: Make a complete app launch video, from a shot-by-shot script to a rendered Remotion MP4 (a product video with mock UI, each feature introduced by side-by-side text beside the phone, Screen Studio zooms, iOS-style screen transitions, and optional SFX and music). Use when the user asks for a launch video, promo video, demo video or video script for their app.
argument-hint: "[--no-audio]"
---

# Launch video

Two phases: **write the script**, then **build it in Remotion**, verify it frame by frame and render when asked. If the user only wants the script, stop after phase 1. If they have a notes or script file, read it first: their notes override these defaults.

**`--no-audio`:** if the arguments include this flag, the video has no sound effects and no music at all, whatever the vibe or the worked example does. Don't ask about or offer sound, write `**Sound:** none` in the script header, skip section 5, add no audio components, packages or files, and render with `--muted`.

Worked examples, both React Native apps. Each `video-script.md` is the script format, and each `src/` is the build pattern described below. Read the one closer to your app's vibe when building:
- **WeCare** (calm and cozy healthcare, light, silent, side-by-side layout): `github.com/mizanxali/wecare/tree/main/video` (locally `~/carerounds/video`). This is the current layout.
- **Radius** (upbeat launch, dark, music and SFX): `github.com/mizanxali/radius/tree/main/video` (locally `~/radius/video`). It predates the side-by-side layout and still uses a subtitle band; borrow its upbeat styling, not its layout.

## Writing rule: no em dashes

Never use an em dash (—) in anything you write for the video: the feature text, the opening and closing, the script, code comments. Use a colon, a comma, a full stop or parentheses instead. Write ranges with "to" rather than an en dash (0:07 to 0:22, 1.4 to 1.5×), because an en dash reads as an em dash. The only exception is UI copied verbatim from the app, such as the minus sign on a stepper button.

---

## Phase 1: the script

Write `video/video-script.md` (create `video/` if needed; never overwrite the user's own notes).

### 0. Read the vibe first

Every later choice follows from the product's vibe, so decide it before writing a line. Read it from the domain, the audience, the app's palette (light or dark, loud or muted) and the tone of its copy, and state it in the script header as a **Vibe:** line. If it's unclear, propose one and say so.

| | Upbeat launch (a social or crypto app) | Calm and cozy (healthcare, wellbeing, care work) |
|---|---|---|
| **Wallpaper** | dark, slow gradient | light, built from the app's own background colours, with a warm tint |
| **Feature text** | white, bold sans | the app's ink, titles in the app's own title face |
| **Type motion** | words snap up with a blur | phrases fade and rise slowly (about 0.9 s), with no snap |
| **Camera** | 1.6 to 2× punch-ins, shake on payoffs | 1.4 to 1.5× punch-ins, slow eases, no shake |
| **Easing** | overshoot springs | long soft settles, never an overshoot |
| **Sound** | bright effects and an upbeat bed | silent, or effects well under a warm, steady bed |
| **Hooks** | punchy kinetic phrase, "built for …" list | a short human scene, then a one-line promise and the app's mark |

Other vibes (premium, playful, serious B2B) sit between these; pick each row deliberately. The table is a starting point, not a template.

### 1. Gather before writing

- **Features:** the README feature list, or the user's list, with one beat per feature. Include the setup feature: the profile, onboarding or "build your X" flow. Users expect it, and it's easy to forget.
- **Sub-features:** list the secondary actions inside each feature (an AI icebreaker inside AI matching, hiding an exact number behind a tier, an offline fallback). Show each one on the phone, and name the important ones in the feature's text, because a missing one reads as "completely omitted".
- **Real UI copy:** grep the screens for button labels, headings, placeholders and status strings, and use them verbatim.
- **Real layout:** read each screen's component order, the shared kit (cards, chips, buttons) and the theme tokens. The mock rebuilds these.
- **Real navigation:** note how each screen is reached (pushed, presented as a sheet, swapped at the root), so the mock moves between screens the same way.
- **Cast:** reuse seeded or demo data (names, roles, numbers, ids) and invent one "you" user. Never guess pronouns from names in copy.
- **Design:** fonts, colours and theme rules (for example, "colour only on avatars, icons and dots").
- **Hooks:** the opening and the closing. Use the user's; if there are none, write new ones from **this** product's story and vibe, and say they're proposals. Never reuse an earlier video's lines: "the ultimate networking tool" and "built for events, conferences … on X" belonged to Radius. A calm product might open on a person and a problem ("Ruth lives an hour from the nearest clinic. / There's no signal at the door.") and close on a promise and the mark ("Every visit finds its way to the clinic.", then the app's icon and name, then "Built on X"). Use synthetic names from the app's demo data.

### 2. Style vocabulary

- **Mock UI:** the app is rebuilt from scratch, not screen-captured. The phone sits in a device frame on a slow-moving wallpaper that suits the app's UI: dark behind a dark app, light and pastel behind a light one (built from the app's background colour, never plain black).
- **Side-by-side feature intros:** each feature opens with the phone on one side of the frame and its title and description on the other (section 3).
- **Choreographed touch:** a soft touch dot glides on eased paths and taps exactly on the beat (a cursor for desktop apps).
- **Screen Studio-style punch-ins:** the camera zooms toward the action and pushes in while typing.
- **Ken Burns drift:** the frame is never static.
- **Hero cutaway:** a 1 to 2 s full-frame close-up of the payoff (a badge, a number, a row of risk bands) over a backdrop in the wallpaper's tone (a dark veil or a pastel one).
- **iOS-style screen transitions, never cuts.** A screen change inside the phone that hard-cuts looks like the whole phone flickered into another one. Move between screens the way the app does: a push slides the new screen in from the right while the old one drifts a third of the way and shades; a pop reverses it; a full-screen modal rises from the bottom and sinks away; a change that isn't navigation (a root swap after onboarding, say) fades through the app's background so no two screens overlap. Let the camera glide across the change rather than cut. Keep the same screen and scroll position across beat boundaries.
- **Split-screen:** two devices side by side for anything that syncs between phones (three for a relay). Put those features back to back so the other phones stay on screen.

### 3. Layout: the phone beside its text, then the phone alone

No subtitle band, no caption scrim and no overlays on the phone. Each feature carries its words in an intro beside the phone; after that the phone plays alone.

1. **Intro (about 4.8 s).** The phone glides from the centre to one side of the frame (0.9 s) and settles at about 0.92×. The title and a description rise in on the other side (from 0.35 s). Alternate the phone's side from feature to feature (left, right, left …), choosing the sides so a split-screen beat's main phone is already on the side it will keep.
2. **Hand-over (the last 0.9 s of the intro).** The text slides out toward its own edge, and the phone glides back to the centre, or to its place in a split, as the feature's own timeline starts. The camera then eases in on the action.
3. **The feature plays out** on the phone alone, with holds so every screen can be read.
4. **The end.** The camera eases back out to the centred phone, and the next feature's intro carries it to the next side, so features flow into one another without a cut.

Text rules:
- **Title:** about 78 px in the vibe's title face. **Description:** two or three sentences, about 20 to 28 words, about 34 px, in muted ink (or 80% white on dark). Left-aligned in a column about 760 px wide, centred vertically on the phone.
- **The intro text is the only text a feature gets**, so it must carry the story: what the feature does and the one or two sub-features that matter most. Specific beats vague: "AI ranks the room for you: who has what you need, and who needs what you offer", not "AI ranks everyone nearby".
- **Say "AI", not the model vendor**, unless the user wants the vendor named. Mock UI copy stays verbatim from the app.
- Design for sound-off: the intro text and the phone must tell the story on their own.
- With no band, aim punch-ins at the middle of the frame (a touch above centre).
- In split-screen and three-phone beats, the intro carries the main phone to the side; the other phones only enter once the text has gone.
- Split-screen layouts don't survive a 9:16 crop, so don't promise vertical crops if you use them.

### 4. Structure and pacing (about 2:00 to 2:20)

Viewers must be able to read the phone screen. Earlier 6 s beats were too fast, so after every state change hold for 1 to 2 s.

1. **Cold open (about 4 s):** the opening, in the vibe's type motion. Upbeat: black, one word at a time (snap up from 12 px, blur-to-sharp), then fade into the wallpaper. Calm: on the wallpaper itself, one or two quiet lines rising in slowly. **The gap before the phone is about 0.5 s, no more.**
2. **Phone enters (about 3 s):** it rises into the centre on the app's liveliest screen (a spring for upbeat, a soft settle for calm), then transitions to the first feature's opening screen before that feature's intro begins.
3. **Feature beats (about 15 to 20 s each, including the 4.8 s intro):** intro, hand-over, the feature with holds, ease back out (section 3). Typing runs at about 0.06 to 0.13 s per character, and AI text types out word by word at about 0.12 s per word.
4. **Exit (about 1.2 s):** the phone leaves: upbeat drops it off the frame (ease-in, 0.6 s); calm lets it sink a little and fade (1 s). **The outro text starts about 0.4 s after the phone has gone.**
5. **Close (about 7 s):** the closing, written for this product. **Every word or phrase lands separately**, never two at once. Upbeat: cut to black near the end. Calm: fade everything back into the wallpaper.
   - One pattern for a long closing sentence with a list (Radius: "built for events, conferences, parties … on X"): land the lead, cycle the list items through one big slot (0.5 s each), collapse the slot into one smaller line with the whole list, then land the last phrase underneath.
   - Another (WeCare): a promise in three phrases ("Every visit · finds its way · to the clinic."), then the app's icon and name, then "Built on X" small underneath.

**Feature order:** follow the user's story, not the README's. For a social app that's discover, AI pick, you (profile, AI summary, net worth), the room, reach, find, confirm, remember.

### 5. Sound (optional)

A silent video is a good default when the text and the phone tell the story; WeCare is silent. Ask, or offer sound as an option. If the user wants sound:

Every sound lands on the frame of its visual event. Keep the palette small; extra sounds that don't map to a clear event feel random.

| Sound | Plays on |
|-------|----------|
| Tap (soft click) | every touch-dot tap; cards landing; stepped indicators |
| Key clicks | each character typed, and each AI word, quieter and with varied volume |
| Whoosh | something moving: a sheet rising, a send, a share, a device leaving |
| Toggle | switches and a verification ticking in |
| Chime | **only notifications arriving** (an incoming banner). Never use it for avatars appearing, AI results, payoffs or the outro |

**Music:** a royalty-free bed under everything, with its volume set by keyframes: quiet under the cold open, full once it ends (calm: settling in as the phone arrives, at a lower overall level), ducked about 3 dB under the one or two hero moments, and silent at the end.

Pick the track for the vibe. Ask the user for one if they have it. Otherwise:
- **Kevin MacLeod (incompetech.com), CC BY 4.0:** downloads directly with curl from `https://incompetech.com/music/royalty-free/mp3-royaltyfree/<Title>.mp3` (URL-encode spaces).
  - Upbeat: "Hackbeat" (242 s, electronic) worked well; "Dispersion Relation" and "Electrodoodle" are alternatives.
  - Calm and cozy: "Wholesome" (363 s, warm and very steady, loudness range 1.4); "Easy Lemon" (126 s) and "Gymnopedie No 1" (187 s, quiet piano) are alternatives.
  - Measure candidates before choosing: `ffmpeg -i x.mp3 -af ebur128 -f null - 2>&1 | grep -E "I:|LRA:"`. A low LRA means a steady bed; a high one swells and drops.
  - The user must credit it in the post: `Music: "<Title>" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0`. Always tell them this.
- **Mixkit** returns 403 to direct downloads, so skip it.

You can't hear downbeats, so tell the user the cuts aren't beat-synced and offer to nudge any cut they flag.

### 6. Script format

```
# <App> launch video: script
**Vibe / Length / Format / Sound / Look / Touch / Camera / Cast:** one bold-led line each
### The repeating feature beat   (intro, hand-over, play, ease out; the sides; how screens transition)
---
## 0:00 to 0:04 · Cold open
## 0:04 to 0:07 · Phone enters
## <timecode> · <n>. <Title> (<length>)
**Phone:** shot by shot with times on the feature's own timeline, real UI labels in bold, transitions and hero cutaways marked
**Intro:** phone on the <side>, with the text (quoted)
... (each feature)
## Exit
## Close
---
## Side text sheet   (#, Title, Phone side, Text)
## Where it lives    (once built: which file holds what, preview and render commands)
```

Timecodes must add up. Tell the user in a few bullets what you changed from their notes and why.

---

## Phase 2: build it in Remotion

### Setup

1. Load the **`remotion-create`** skill and follow it. If the repo isn't empty, scaffold into `video/` (`npx create-video@latest --yes --blank --no-tailwind video`).
2. `npx remotion add @remotion/fonts` (and `@remotion/media` only if the video has sound). Install the app's own icon and avatar libraries at the app's versions. `lucide-react` stands in for `lucide-react-native`; its icon files are `.mjs`.
3. Copy the app's font files into `video/public/fonts/` (and any music into `public/music/`).
4. Start Studio in the background (`npx remotion studio --no-open`, then open the URL) before writing scenes. Keep it running.

### File layout (as in the WeCare example)

| File | Holds |
|------|-------|
| `theme.ts` | The app's tokens copied over, with fonts loaded via `loadFont` from `@remotion/fonts`. RN line heights are px, so write them as `"20px"` strings (bare CSS numbers are multipliers). |
| `data.ts` | The demo cast with the **same ids/seeds as the app**, so generated avatars match. Import the app's pure domain code (scores, rosters) rather than copying it. |
| `ui.tsx` | The device and kit: `Phone` (390×844 screen in a bezel with a dynamic island), `Screen` (fixed header, status bar, `scroll`), `Transition` (push, pop, present, dismiss, fade-through between two screens by progress `p`), `Keyboard` (`show`, `pressed`), `TouchDot`, and Card/Chip/Tag/Button/Field mirrors of the app kit. |
| `screens.tsx` | Dumb mock screens driven by state props (`scroll`, `typed`, `selected`, `show` 0…1). No `useCurrentFrame` inside. |
| `scenes.tsx` | `Featured` (the side-by-side intro and hand-over around a beat), then one component per beat on its own timeline. All times in seconds. Helpers are below. |
| `type.tsx` | `Wallpaper`, `Drift` (Ken Burns) and the opening/closing type (kinetic `Words` for upbeat, a slow `Fade` for calm), coloured for the vibe. |
| `Launch.tsx` | The timeline: beat lengths (each feature's own timeline plus the intro), starts derived from them, and each feature wrapped in `Featured` with its side, title and text. A `Type` track holds the cold open and close, outside the drift. |
| `Root.tsx` | One `Composition`: 1920×1080, 60 fps, its length taken from `Launch.tsx`. |

### The feature intro (`Featured`)

```tsx
<Featured side="L" at={place} title="…" body="…"><Beat /></Featured>
```

- Until the hand-over ends (about 4.8 s), render the beat inside `<Freeze frame={0.6 s}>`; after it, inside `<Sequence from={(4.8 − 0.6) s} layout="none">`, so the beat's own timeline picks up exactly where the frozen frame left it. Each beat is therefore 4.2 s longer than its own timeline.
- Move the phone by transforming the whole frozen scene: scale `r` and shift `d`, interpolated through three states. Start: the main phone looks centred at 1× (as the last beat left it), so `r0 = 1 / ps` and `d0 = −r0 · p`. Side: `r1 = ss / ps` and `d1 = side − r1 · p`. End: `r = 1`, `d = 0`. Here `p` and `ps` are the main phone's place and scale when its beat starts (`at`), and `side` and `ss` the side position.
- Keep other phones that enter later well off-frame (about ±1800 px), so the scene's scaling during the intro doesn't pull them into view, and start their entrances only after the hand-over.

### Camera and touch helpers (scenes.tsx)

```ts
type Key = [sec: number, scale: number, tx: number, ty: number];
const ACTION_Y = -20; // a touch above the middle; there is no caption band
// land point (x, y), relative to frame centre at scale 1, on the action spot
const aimAt = (sec, S, x, y): Key => [sec, S, -S * x, ACTION_Y - S * y];
// screen point (sx, sy) on the centred 390×844 phone
const aim = (sec, S, sx, sy) => aimAt(sec, S, sx - 195, sy - 422);
const home = (sec): Key => [sec, 1, 0, 0];
// Camera interpolates scale/translate across keys with an ease-in-out; optional shake (upbeat only).
// For a calm vibe, shrink every punch-in inside aimAt (z = 1 + (S - 1) * 0.75) so the aim stays exact.
// Glide the camera across a screen transition (keys about 0.7 s apart), never a 0.01 s camera cut.
```

- **Touch dot:** `<Touch path={[[sec, sx, sy], …]} taps={[sec, …]} end={sec} />`, in screen points inside `Phone`.
- **Typing:** a `typing(text, s, start, per)` helper returns `{value, pressed}` for the field and the keyboard key.
- **Transitions:** `<Transition p={swap(s, a, b)} kind="push" from={…} to={…} />`, with `swap` easing on iOS's navigation curve (`Easing.bezier(0.2, 0.9, 0.25, 1)`) over about 0.55 to 0.65 s, starting just after the tap.
- **Split-screen:** place `Phone`s with `[x, y, scale]` each: 0.95× at ±250 for two, 0.75× at ±560 for three. In a split, aim with `aimAt` and the phone's offset.
- **Live state** for continuous motion (a radar sweep, a pulse) comes from a clock prop, so beat boundaries stay continuous.

### Verify every tap with stills (do this; estimates are off)

Flex layouts make tap targets hard to predict, and first guesses are often 40 to 60 pt off. After writing each beat:

```sh
npx remotion still Launch /tmp/rv/f<frame>.png --frame=<frame> --scale=0.5 --port=3123 --log=error
```

- Use a port other than Studio's (default 3000; start Studio on another port if something local already holds 3000), or the still command attaches to Studio and fails.
- To measure targets fast, add a temporary composition that lays the mock screens side by side at 1:1 with a 50 px grid, read coordinates straight off it, then delete it.
- Loop over frames in a bash script, not inline zsh: zsh doesn't word-split `$FRAMES`, so `for f in $FRAMES` passes one string and the still fails with "Frame NaN".
- A feature's frame is its beat start + 4.2 s + the time on its own timeline. Render the exact frame of each tap and read the image. If the dot misses, measure the target in the still: double the half-scale pixel coordinates, then invert the camera with `sy = 422 + (Y − 540 − ty) / S` and `sx = 195 + (X − 960 − tx) / S`, and fix the path.
- Also check: each intro's text against its phone, the midpoint of every screen transition (no two headers ghosting over each other), the keyboard not covering the focused field (scroll the form like iOS does), cutaways centred, and tight intro and outro gaps.
- Run `npx tsc --noEmit && npx eslint src` after each change, and grep everything you wrote for `—` (the writing rule above).

### Gotchas

- The scaffold's `tsconfig` lib is ES2015, so there's no `findLastIndex`; use `reduce`.
- The ESLint rule `@remotion/from-0` flags `from={0}`; leave it out.
- Animate with `interpolate` on the frame, never CSS transitions. Use the `scale`/`translate`/`rotate` style properties.
- A plain cross-fade between two app screens ghosts both fixed headers over each other. Fade through the background instead: the old screen fades out, then the new one fades in.
- An overlay inside the phone (a dim veil, a transition's shade) must sit above every layer inside the screen. A sticky header with `zIndex: 1`, or a status bar with its own `zIndex`, stays bright above an un-indexed overlay. Give such overlays a high `zIndex`.
- If sound is used, effects from `https://remotion.media/*.wav` (`mouse-click`, `whoosh`, `switch`, `ding`) stream at render time, so rendering needs internet.
- For a scale bump in text-heavy frames, scale the element rather than changing its font size, so the layout doesn't shift.
- Derive beat starts from their lengths in `Launch.tsx`, so inserting or lengthening a beat shifts everything after it, and take `Root`'s length from the same numbers.
- `git mv` silently skips untracked files, so use `mv`. `mv file dir/` keeps the file's own name.
- If the video lives inside the app's repo, exclude `video` in the app's root `tsconfig.json`; otherwise the app's type check picks up the Remotion sources.
- Importing the app's pure domain code (a score, a roster) from `../src` keeps the numbers on screen identical to the app's. Widen the video's `tsconfig` lib (for example `["es2020", "dom"]`) if that code needs it.

### Render (only when the user asks)

```sh
npx remotion render Launch out/launch.mp4 --codec=h264 --crf=18 --port=3123 --overwrite
```

Run it in the background. Then verify with `ffprobe` (duration, 1920×1080, 60 fps, and an AAC stream only if the video has sound), `open` the file, and give the path, length and size. `out/` is gitignored by the scaffold.

### Wrap-up

- Update `video/video-script.md` to match what was built (timings, intro texts, transitions, a "Where it lives" section) whenever the build drifts from the script.
- If the video has music, remind the user of the credit line.
- Commit only when asked, following the repo's commit conventions.
