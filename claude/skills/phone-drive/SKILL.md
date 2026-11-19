---
name: phone-drive
description: Drive the USB-plugged iPhone (WebDriverAgent) and Samsung (adb) from the shell for any app on them: screenshots, accessibility trees, taps by label or point, typing, system alerts, Wi-Fi on/off. Use when a task needs to operate an app on the physical phones, e.g. device tests of Fernweh or the offline-protocol SDK example app.
---

# Drive the plugged-in phones

```bash
P=~/.claude/skills/phone-drive/scripts
```

## iPhone: `$P/ios.sh`

Default device: iPhone 16, `UDID=00008140-0004453A212B001C` (override with the `UDID` env var). The phone must be **unlocked**. Its passcode is **1998** (given by the user). WDA cannot lock iOS 26.6, so the user locks it with the side button; `unlock` gets back in.

| Command | Does |
|---------|------|
| `start` / `stop` / `status` | WDA on the phone plus the `localhost:8100` forward (`start` is idempotent) |
| `build` | Build and sign WDA from Appium's bundled copy into `~/.cache/phone-drive`. Needed once, and again after an Xcode or iOS update, or when `start` reports no build |
| `tree [raw]` | Compact accessibility tree: `Type 'label' @centerX,centerY [x,y,w,h]` |
| `tapl "<label>"` | Tap the first visible element whose label or name matches exactly (prefer this) |
| `tap x y` / `swipe x1 y1 x2 y2 [s]` | Coordinates in **points** (393x852 on iPhone 16) |
| `type "<text>"` | Type into the focused field (`\b` = backspace). Fast typing drops characters in per-box OTP fields: type one character at a time |
| `shot <file.png>` | Screenshot (1179x2556 px, 3x the points) |
| `app <bundleId>` / `home` | Foreground an app / go home |
| `unlock [pin]` | Wake, open the keypad and tap the passcode (default 1998). Does nothing unless the passcode screen is up. Proven 2026-10-30 |
| `alerts` | Answer every system alert: Allow, Allow Full Access, OK, or Cancel on "Unable to Verify App" |
| `wifi on\|off` | Toggle Wi-Fi in Settings. `on` waits for the network to join. Return to your app afterwards with `app` |

Logs: `idevicesyslog -u $UDID --no-colors -p <process>`. Filter at capture time, since a Debug React Native app logs millions of lines an hour.

iOS facts that bite:
- A freshly installed development-signed app needs internet **once** to verify developer trust. Without it, the launch fails with "Unable to Verify App".
- A Debug React Native build loads JS from any Metro it can reach on :8081, even with `FORCE_BUNDLING=1`.

## Samsung: adb plus `$P/and-ui.sh`

- `$P/and-ui.sh` prints visible nodes as `text | content-desc @x,y` in **pixels** (1080x2340). It prints nothing while an animation runs; take a screenshot instead: `adb exec-out screencap -p > f.png`.
- Input: `adb shell input tap x y`, `input text "a%sb"` (`%s` = space), `input keyevent KEYCODE_BACK`.
- Before pressing Back to close the keyboard, check it is up (`adb shell dumpsys input_method | grep -q mInputShown=true`). Otherwise Back leaves the screen.
- Network: `adb shell cmd wifi set-wifi-enabled enabled|disabled` and `cmd bluetooth_manager enable|disable`. Confirm with `adb shell ping -c1 -W2 8.8.8.8`.
- Lock and unlock (screen-lock PIN is **1998**, given by the user). Lock: `adb shell input keyevent 26` (`dumpsys power` shows `mWakefulness=Dozing`). Unlock: `input keyevent 224; sleep 1; input swipe 540 1900 540 600 250; sleep 1; input text 1998; input keyevent 66`. Confirm with `adb shell dumpsys window | grep isKeyguardShowing` (expect `false`).

## Habit

Verify every action from the screen (`tree`, `and-ui.sh` or a screenshot) before trusting a downstream timeout. A missed tap looks exactly like a failed delivery.
