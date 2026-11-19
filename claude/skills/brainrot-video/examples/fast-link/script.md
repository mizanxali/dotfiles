# Fast Link: brainrot script (v1, approved)

**Topic:** Fast Link (ADR 0038), BLE-to-Wi-Fi handover in the Offline Protocol SDK
**Length:** about 65 s at Peter Griffin speed 1.1
**Gameplay:** Minecraft parkour (https://www.youtube.com/watch?v=s600FYgI5-s)

## 1. Hook (0:00 to 0:04)
> VO: "Your iPhone and your friend's Android are right next to each other. Sending one file between them takes over three minutes."

Label: **3 MINUTES. ONE FILE. 💀** · SFX: vine boom on "minutes"

## 2. The problem (0:04 to 0:11)
> VO: "No shared Wi-Fi. No internet. The only thing both phones can talk over is Bluetooth, and Bluetooth crawls at about five kilobytes a second."

Label: **BLUETOOTH ≈ 5 KB/s 🐌** · SFX: record scratch, whoosh, "bruh" on "crawls"

## 3. The reveal (0:11 to 0:14)
> VO: "So we built Fast Link into the Offline Protocol SDK."

Label: **⚡ FAST LINK ⚡** · SFX: anime wow on "Fast"

## 4. How it works (0:14 to 0:38)
> VO: "Step one: the phones find each other over Bluetooth and set up an end-to-end encrypted session."
> VO: "Step two: the app asks for a fast link, and the Android phone spins up its own private Wi-Fi network, with a brand new random password made just for this link."
> VO: "Step three: that password goes to the iPhone inside the encrypted session. Nobody else ever sees it."
> VO: "Step four: the iPhone joins, the phones open a direct Wi-Fi stream, and each one proves who it is before a single byte moves."
> VO: "Bluetooth stays on the whole time, so no message drops during the switch."

Labels: **STEP 1 · MEET OVER BLUETOOTH 🔐** to **STEP 4 · IPHONE JOINS ✅** · SFX: whip per step, Snapchat ping on "Nobody"

## 5. The numbers (0:38 to 0:52)
> VO: "We tested it on a Samsung and an iPhone 16. A one megabyte file over Bluetooth took one hundred ninety-seven seconds. Over Fast Link it took two and a half. That's almost eighty times faster."
> VO: "Getting the link up takes about ten seconds and one tap on the iPhone. When you leave the app or stop sending, it shuts itself down."

Card: compare, BLUETOOTH 197.7s (fills while the line is read) vs FAST LINK 2.5s (snaps), then stamp **~80x FASTER 🤯** · SFX: loading lag, whoosh, ding on "half", vine boom on "eighty", click on "tap"

## 6. Outro (0:52 to 0:58)
> VO: "No router. No internet. No cloud. Just two phones. Offline Protocol."

Label: **NO ROUTER · NO INTERNET · NO CLOUD** · SFX: whoosh, vine boom on "Protocol"

## Fact-check notes
- 197.7 s: measured BLE time for 1 MiB Android to iPhone (ADR 0038).
- 2.5 s: ADR figure; final runs 2.04 to 2.6 s. 197.7 / 2.5 = 79x, so "almost eighty".
- "About ten seconds": join to link up measured 10.1 to 12.4 s.
- Spoken numbers are written out ("one hundred ninety-seven") and the ".7" dropped; the card keeps the digits.
