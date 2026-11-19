---
name: mitv
description: Control, inspect and debug the user's living-room Xiaomi Android TV (MiTV-AXSO0, Mi TV 4A Pro / 4C Pro, Android 9) over ADB from any folder. Use this whenever the user mentions their TV or anything happening on it - opening an app, switching HDMI, volume, sound or dialogue problems, screenshots of the TV, an app misbehaving, the Home screen or launcher, dock or wallpaper changes, re-enabling a disabled app, Wi-Fi or DNS on the TV, or scripting or automating the TV - even if they don't say "ADB".
---

# The user's TV (MiTV-AXSO0)

| | |
|---|---|
| Model | Xiaomi MiTV-AXSO0, codename `dangal`, Amlogic/droidlogic |
| OS | Android TV 9 (SDK 28), firmware PI.6036 |
| Screen | Reports 1280x720 at density 213; about 1 GB of RAM, so keep anything running on it light |
| Address | `192.168.29.50`, also `android.local`; ADB on port 5555 |
| Network | Wi-Fi. Nothing on USB |
| Sound | The TV's own speakers. HDMI-CEC off, no soundbar |
| Home | `com.gathin.tvhome` (the cleanyourtv launcher). Stock `com.google.android.tvlauncher` is disabled |
| Live TV / HDMI app | `com.android.tv` |

It was cleaned up with the cleanyourtv repo at `/Users/mizanxali/cleanyourtv`, and this skill's client uses that
checkout. If the checkout moves, update `REPO` in `scripts/tv`.

## Talking to it

The scripts are `~/.claude/skills/mitv/scripts/tv` and `~/.claude/skills/mitv/scripts/onscreen`, written as `scripts/...`
below. Call them by full path; they work from any directory.

```sh
scripts/tv --probe                                # connect, print model and Android version
scripts/tv '<shell command>'                      # quote it: pipes and ; run on the TV
scripts/onscreen                                  # what is on screen right now
scripts/tv --screenshot /tmp/a.png [KEY ...] [--wait S]   # press keys, capture, pull. Then read the PNG
scripts/tv --push <local> <remote>                # small files
scripts/tv --pull <remote> <local>
scripts/tv --reboot                               # `svc power reboot` gets killed on this firmware
```

If it can't connect:
- **Refused or timed out:** USB debugging is probably off, which is how the user should normally leave it. Ask them
  to turn it on in Settings > Device Preferences > Developer options, and to accept "Allow USB debugging?" on the TV.
- **Address changed:** `ping -c1 android.local` gives the new one; run with `TV_HOST=<ip>`.
- **`tools/venv` missing:** `python3 -m venv tools/venv && tools/venv/bin/pip install -r tools/requirements.txt` in the repo.

## Someone may be watching

This is a family TV in real use. Actions land on whatever is on screen, so:

- **Run `scripts/onscreen` before sending keys, and again after opening anything.** Key presses meant for a settings
  panel once went into a movie, because the panel had crashed on launch and nobody checked it had opened.
- **Ask before a reboot, or before anything that interrupts what's playing.** The user has declined a reboot before.
  Reading state (`dumpsys`, `settings get`, `logcat -d`) is silent, so do that freely.
- **Ask before changing what the household uses:** apps, voice, casting, the updater. A question costs less than a
  surprise on the TV.

## Common actions

**Remote keys:** `scripts/tv input keyevent HOME` (also `BACK`, `DPAD_UP/DOWN/LEFT/RIGHT`, `DPAD_CENTER`,
`VOLUME_UP/DOWN`, `MEDIA_PLAY_PAUSE`). Send one per call when the order matters.

**Open an app:** `scripts/tv am start -n <component>`

| App | Component |
|---|---|
| Netflix | `com.netflix.ninja/.MainActivity` |
| Prime Video | `com.amazon.amazonvideo.livingroom/com.amazon.ignition.IgnitionActivity` |
| YouTube | `com.google.android.youtube.tv/com.google.android.apps.youtube.tv.activity.ShellActivity` |
| YouTube Music | `com.google.android.youtube.tvmusic/com.google.android.apps.youtube.tvmusic.activity.MainActivity` |
| JioHotstar | `in.startv.hotstar/com.hotstar.MainActivity` |
| SonyLIV | `com.sonyliv/.ui.splash.SplashActivity` |
| ZEE5 | `com.graymatrix.did/com.zee5.android.launch.presentation.AppStartActivity` |
| Windscribe | `com.windscribe.vpn/com.windscribe.tv.splash.SplashActivity` |
| Play Store | `com.android.vending/com.google.android.finsky.tvmainactivity.TvMainActivity` |
| Media Player (USB) | `com.xiaomi.mitv.mediaexplorer/.NewScraperMainEntryActivity` |

**Volume (0 to 100):** `scripts/tv media volume --stream 3 --get`, and `--set N` to change it. `--set` has only been run with the
current value, so read the level back after changing it.

**HDMI / AV:** the input IDs are below. Android resolves this to `com.android.tv`, but it hasn't been run in this form;
the launcher's Inputs menu does the same thing and HDMI 1 worked from there. Check with `scripts/onscreen` afterwards.

```sh
scripts/tv "am start -a android.intent.action.VIEW -t vnd.android.cursor.item/channel \
  -d content://android.media.tv/passthrough/com.droidlogic.tvinput%2F.services.Hdmi1InputService%2FHW5"
```

| Input | ID |
|---|---|
| HDMI 1 / 2 / 3 | `com.droidlogic.tvinput/.services.Hdmi{1,2,3}InputService/HW{5,6,7}` |
| AV | `com.droidlogic.tvinput/.services.AV1InputService/HW1` |
| Tuner | `com.droidlogic.tvinput/.services.ADTVInputService/HW16` |

**Is it awake?** `scripts/tv 'dumpsys power | grep -E "mWakefulness=|Display Power: state"'`. The POWER key hasn't been
tried over ADB, and waking the TV may need the real remote.

## Screenshots

- Live TV, HDMI and some streaming video may not capture: expect black behind any overlay, or an empty file (0 bytes,
  exit 1). Prime Video has captured normally at times. A blank shot is the TV working normally, so use `scripts/onscreen`
  to see what is playing.
- Screenshots can show sign-in codes and Wi-Fi names. Keep them local, and don't commit them to any repo.

## What was changed, and how to change it

Details and undo steps: `/Users/mizanxali/cleanyourtv/work/README.md`. The original state: `backup/` in the repo.

- **Disabled (24):** the 23 in `work/debloat.txt` plus the stock launcher. That includes PatchWall, telemetry, TV
  Manager, the firmware updater (`com.xiaomi.mitv.updateservice`), Google Assistant (the mic button does nothing),
  Mi Cast/Miracast, Mi Music, Mi Gallery, Play Games and Play Movies. Chromecast stays on.
- **Re-enable one:** `scripts/tv 'pm enable --user 0 <package>'`.
- **Undo the whole cleanup:** `work/restore.sh` in the repo. It has only been syntax-checked, never run, and it leaves
  the two sound settings alone. Ask first.
- **Private DNS:** `dns.adguard-dns.com`. Off: `settings put global private_dns_mode opportunistic`.
- **Location is off by choice,** so the Wi-Fi pill says "Wi-Fi", not the network name.
- **Launcher:** edit `launcher/app/src/main/res/values/config.xml` (`dock_apps`, `columns`, currently 5), then run
  `work/build-and-install.sh`. Or push a look without rebuilding: `TV_HOST=<ip> tools/theme.sh themes/<name>`, listed in
  `themes/README.md`, with `--reset` to undo.

## Sound

Fixing quiet dialogue and loud music took two settings: **AGC on** and **DTS > Dialog Clarity on high**. The user
confirmed by ear that this sounded good on Prime Video. Netflix and JioHotstar weren't tested, and neither was
whether the settings survive a reboot. Check `sound_effect_agc_on` (1) and `sound_effect_dialog_clarity` (2) with
`settings get global` if dialogue goes quiet again.

- Prime Video was seen sending stereo PCM to the speaker mixer, where the TV's effects can act on it. No Dolby
  processing is on that path (`support_dolby=0`).
- Use the sound panel, not `settings put`: ticking AGC there reached the engine (`Avl_Effect: Set status -> Enable`
  in logcat). Whether `settings put` would do the same is unknown.
  `scripts/tv am start -n com.droidlogic.tv.soundeffectsettings/.SoundModeActivity`
  Rows: Sound Mode, Treblebass, Balance, AGC, DTS, Virtual Surround, Sound Output Device.
- **The panel can crash on launch** (`NullPointerException` in `AudioEffectManager.getSurroundStatus`) and drop back to
  the app behind it. Wait a few seconds, confirm with `scripts/onscreen`, and only then send keys. Starting it again
  has worked.
- Sound Mode logs `getSoundModeStatus creat fail`, so it may do nothing here. Nobody has tested it.
- `tinymix` can't open the mixer from the shell.

## Debugging notes for this build

- `dumpsys activity activities | grep mFocusedApp` prints nothing here; use `mResumedActivity` (what `scripts/onscreen` does).
- Activity history is `logcat -b events -d | grep am_set_resumed_activity` (`am_`, not `wm_`). Crashes: `am_crash`, or
  `logcat -d | grep -A14 "FATAL EXCEPTION"`.
- If power-on lands on Live TV's "Set up your sources": `settings put global set_auto_play 0`. So far it starts on Home.
- For anything else, search `docs/TROUBLESHOOTING.md` in the repo. `examples/xiaomi-mitv-axso0/debloat.txt` has notes
  on this exact firmware.
- Mac shell: there is no `timeout`, and zsh doesn't split a command held in a variable.

## Don't

- **Don't uninstall system packages.** Disable only, and through the repo's `tools/disable.sh`, which refuses lists that
  would stop Android booting (permission controller, package installer, `com.android.providers.*`, `com.android.systemui`,
  `com.android.settings`, `com.android.tv.settings` and others). `AGENTS.md` in the repo has the full rules.
- **Don't disable what the TV needs:** `com.android.tv`, `com.droidlogic.tvinput`, `mitv.service`, Bluetooth and remote
  services, Gboard, Play Store, Play Services.
- **Don't open debug or factory tools,** even to look. `com.xiaomi.android.TV.audio` is Xiaomi's `AudioDebugTool`, a
  system-level debug app, and anything named factory or fac menu can flip flags the shell can't undo. `dumpsys package <name>`
  tells you what a package is without starting it.

## When you're done: close ADB

Port 5555 is unencrypted, so leave it closed. When the task is finished, ask the user to go to Developer options, choose
"Revoke USB debugging authorisations", and turn off Network debugging and USB debugging, unless they want it kept on. Then
check it:

```sh
/Users/mizanxali/cleanyourtv/tools/venv/bin/python /Users/mizanxali/cleanyourtv/tools/adb-closed.py 192.168.29.50
```

Only that tool saying "closed" counts. The port was once found open again a week after it was confirmed closed, and
it's unknown whether the TV or a person reopened it, so check after a restart too.
