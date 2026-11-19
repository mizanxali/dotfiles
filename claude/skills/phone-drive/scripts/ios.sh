#!/bin/bash
# Drive a USB-attached iPhone through WebDriverAgent (WDA) over HTTP.
# Coordinates are in POINTS (iPhone 16: 393 x 852; screenshots are 3x = 1179 x 2556 px).
set -euo pipefail

UDID=${UDID:-00008140-0004453A212B001C}
PORT=${WDA_PORT:-8100}
STATE=${PHONE_DRIVE_STATE:-$HOME/.cache/phone-drive}
WDA_PROJECT=${WDA_PROJECT:-$HOME/.appium/node_modules/appium-xcuitest-driver/node_modules/appium-webdriveragent/WebDriverAgent.xcodeproj}
URL=http://localhost:$PORT
mkdir -p "$STATE"
XCTESTRUN=$(ls "$STATE"/wda-dd/Build/Products/*.xctestrun 2>/dev/null | head -1 || true)

usage() {
  cat <<EOF
usage: ios.sh <command> [args]   (points; iPhone 16 is 393x852)
  build                 build + sign WDA (once, or after an Xcode/iOS update)
  start | stop | status WDA on the phone + localhost:$PORT forward
  shot <file.png>       screenshot
  tree [raw]            compact accessibility tree: Type 'label' @centerX,centerY
  tap <x> <y>           tap a point
  tapl "<label>"        tap the first visible element whose label or name equals it
  type "<text>"         type into the focused field (\\b = backspace)
  swipe x1 y1 x2 y2 [s] drag
  app <bundleId>        foreground an app (launches it)
  home                  home button
  alerts                answer every system alert: Allow / Allow Full Access / Cancel ("Unable to Verify App")
  wifi on|off           set Wi-Fi in Settings, then return to the previous app is up to the caller
EOF
}

up() { curl -sf -m 5 "$URL/status" >/dev/null 2>&1; }
sid() {
  local s
  s=$(curl -sf -m 10 "$URL/status" | jq -r '.sessionId // empty')
  [ -n "$s" ] || s=$(curl -sf -m 30 -X POST "$URL/session" -d '{"capabilities":{"alwaysMatch":{}}}' | jq -r '.sessionId')
  echo "$s"
}
spost() {
  local out
  out=$(curl -s -m 60 -X POST "$URL/session/$(sid)$1" -H 'Content-Type: application/json' -d "$2")
  if echo "$out" | jq -e '.value | type == "object" and has("error")' >/dev/null 2>&1; then
    echo "$out" | jq -r '.value | "\(.error): \(.message)"' >&2; return 1
  fi
  echo "$out"
}
find_el() { # predicate -> element id (empty if none)
  { spost /element "{\"using\":\"predicate string\",\"value\":$(jq -n --arg p "$1" '$p')}" 2>/dev/null || true; } | jq -r '.value.ELEMENT // empty'
}
click_el() { spost "/element/$1/click" '{}' >/dev/null; }
tree() {
  curl -sf -m 60 "$URL/source?format=json" | python3 -c '
import json, sys
def clean(x):
    x = "".join(c for c in (x or "") if not (0xE000 <= ord(c) <= 0xF8FF or ord(c) >= 0xF0000))
    return " ".join(x.replace(" ", " ").replace("\xa0", " ").split())
def walk(e, d, plab):
    kids = e.get("children") or []
    r = e.get("rect") or {}
    t = e.get("type", "?")
    lab, name, val = clean(e.get("label")), clean(e.get("name")), e.get("value")
    val = clean(val) if isinstance(val, str) else val
    skip = t == "Other" and val in (None, "") and ((not lab and not name) or (lab == plab and name in ("", lab)))
    if not skip:
        show = lab[:60] + "..." if kids and len(lab) > 60 else lab
        s = "  " * d + t
        if show: s += " \x27%s\x27" % show
        if name and name != lab: s += " name=\x27%s\x27" % name
        if val not in (None, "") and val != lab: s += " value=\x27%s\x27" % val
        if e.get("isEnabled") == "0": s += " disabled"
        x, y, w, h = (int(r.get(k, 0)) for k in ("x", "y", "width", "height"))
        print(s + " @%d,%d [%d,%d,%d,%d]" % (x + w // 2, y + h // 2, x, y, w, h))
    for k in kids: walk(k, d if skip else d + 1, lab)
walk(json.load(sys.stdin)["value"], 0, None)'
}

cmd=${1:-}; shift || true
case "$cmd" in
  build)
    xcodebuild build-for-testing -project "$WDA_PROJECT" -scheme WebDriverAgentRunner \
      -destination "id=$UDID" -derivedDataPath "$STATE/wda-dd" -allowProvisioningUpdates DEVELOPMENT_TEAM=4NZGXQRKBG \
      CODE_SIGN_STYLE=Automatic PRODUCT_BUNDLE_IDENTIFIER=com.offlineprotocol.WebDriverAgentRunner \
      IPHONEOS_DEPLOYMENT_TARGET=15.0 >"$STATE/wda-build.log" 2>&1 && echo built || { tail -20 "$STATE/wda-build.log" >&2; exit 1; } ;;
  start)
    pgrep -f "iproxy $PORT:8100" >/dev/null || { nohup iproxy "$PORT:8100" -u "$UDID" >"$STATE/iproxy.log" 2>&1 & sleep 1; }
    if up; then echo "WDA already running on $URL"; exit 0; fi
    [ -n "$XCTESTRUN" ] || { echo "no WDA build; run: ios.sh build" >&2; exit 1; }
    pgrep -f "test-without-building -xctestrun $STATE" >/dev/null || \
      nohup xcodebuild test-without-building -xctestrun "$XCTESTRUN" -destination "id=$UDID" >"$STATE/wda.log" 2>&1 &
    for _ in $(seq 1 60); do
      up && { echo "WDA ready on $URL"; exit 0; }
      grep -qE "TEST EXECUTE FAILED|Testing failed" "$STATE/wda.log" 2>/dev/null && { grep -iE "error|locked|failed" "$STATE/wda.log" | tail -5 >&2; exit 1; }
      sleep 2
    done
    echo "timed out waiting for WDA; see $STATE/wda.log (is the phone unlocked?)" >&2; exit 1 ;;
  stop) pkill -f "test-without-building -xctestrun $STATE" || true; pkill -f "iproxy $PORT:8100" || true; echo stopped ;;
  status) curl -sf -m 5 "$URL/status" || { echo "WDA down" >&2; exit 1; } ;;
  shot) curl -sf -m 30 "$URL/screenshot" | jq -r .value | base64 -d >"$1"; echo "$1" ;;
  tree) if [ "${1:-}" = raw ]; then curl -sf -m 60 "$URL/source" | jq -r .value; else tree; fi ;;
  tap) spost /wda/tap "{\"x\":$1,\"y\":$2}" >/dev/null && echo "tapped $1,$2" ;;
  tapl)
    e=$(find_el "(label == $(jq -n --arg l "$1" '$l') OR name == $(jq -n --arg l "$1" '$l')) AND type != 'XCUIElementTypeApplication' AND visible == 1")
    [ -n "$e" ] || { echo "no element '$1'" >&2; exit 1; }
    click_el "$e" && echo "tapped '$1'" ;;
  type) spost /wda/keys "$(jq -n --arg t "$(printf '%b' "$1")" '{value: ($t | split(""))}')" >/dev/null && echo typed ;;
  swipe) spost /wda/dragfromtoforduration "{\"fromX\":$1,\"fromY\":$2,\"toX\":$3,\"toY\":$4,\"duration\":${5:-0.3}}" >/dev/null && echo swiped ;;
  app) spost /wda/apps/activate "{\"bundleId\":\"$1\"}" >/dev/null && echo "activated $1" ;;
  home) curl -sf -m 10 -X POST "$URL/wda/homescreen" >/dev/null && echo home ;;
  unlock)
    # /wda/unlock wakes the phone and opens the keypad, then waits ~20 s for
    # an unlock it cannot do; cut it short and tap the passcode by position
    # (the keypad's keys don't match tapl). iPhone 16 keypad, in points.
    curl -s -m 4 -X POST "$URL/wda/unlock" >/dev/null || true
    # Taps on an unlocked phone would land in whatever app is open.
    if ! tree | grep -q "Enter Passcode"; then echo "not on the passcode screen (already unlocked?)"; exit 0; fi
    pin="${1:-1998}"
    for ((i = 0; i < ${#pin}; i++)); do
      case "${pin:$i:1}" in
        1) xy="95 332" ;; 2) xy="196 332" ;; 3) xy="298 332" ;;
        4) xy="95 428" ;; 5) xy="196 428" ;; 6) xy="298 428" ;;
        7) xy="95 523" ;; 8) xy="196 523" ;; 9) xy="298 523" ;; 0) xy="196 619" ;;
      esac
      set -- $xy
      spost /wda/tap "{\"x\":$1,\"y\":$2}" >/dev/null
    done
    sleep 2
    if tree | grep -q "Enter Passcode"; then echo "still locked" >&2; exit 1; fi
    echo unlocked ;;
  alerts)
    # Answer system alerts until none is left (each answer can surface the next).
    for _ in $(seq 1 8); do
      t=$(tree)
      echo "$t" | grep -q "Alert '" || break
      echo "$t" | grep -oE "Alert '[^']*'" | head -1
      for b in "Allow Full Access" "Allow" "Allow While Using App" "OK" "Cancel"; do
        e=$(find_el "type == 'XCUIElementTypeButton' AND label == $(jq -n --arg l "$b" '$l') AND visible == 1")
        [ -n "$e" ] && { click_el "$e"; echo "  -> $b"; break; }
      done
      sleep 1
    done ;;
  wifi)
    want=${1:?on|off}
    spost /wda/apps/activate '{"bundleId":"com.apple.Preferences"}' >/dev/null; sleep 2
    sw=$(find_el "type == 'XCUIElementTypeSwitch' AND label BEGINSWITH 'Wi' AND visible == 1")
    if [ -z "$sw" ]; then
      row=$(find_el "name == 'com.apple.settings.wifi'")
      [ -n "$row" ] || { echo "Wi-Fi row not found (go to the Settings root first)" >&2; exit 1; }
      click_el "$row"; sleep 2
      sw=$(find_el "type == 'XCUIElementTypeSwitch' AND label BEGINSWITH 'Wi' AND visible == 1")
    fi
    cur=$(curl -sf -m 10 "$URL/session/$(sid)/element/$sw/attribute/value" | jq -r .value)
    target=$([ "$want" = on ] && echo 1 || echo 0)
    [ "$cur" = "$target" ] || click_el "$sw"
    if [ "$want" = on ]; then
      for _ in $(seq 1 20); do tree | grep -q "Secure network" && break; sleep 1; done
    fi
    echo "wifi $want" ;;
  *) usage; [ -z "$cmd" ] || exit 2 ;;
esac
