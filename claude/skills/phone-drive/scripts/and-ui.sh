#!/bin/bash
# Visible Android UI nodes, one per line: text | content-desc @centerX,centerY (pixels).
# Prints nothing while an animation keeps the UI from going idle: use a screenshot then.
adb exec-out uiautomator dump /dev/tty 2>/dev/null | python3 -c "
import sys, re
x = sys.stdin.read()
for m in re.finditer(r'<node [^>]*>', x):
    n = m.group(0)
    g = lambda k: (re.search(k + '=\"([^\"]*)\"', n) or [None, ''])[1]
    t, d, b = g('text'), g('content-desc'), g('bounds')
    if t or d:
        a = list(map(int, re.findall(r'\d+', b)))
        print(t[:80].replace('\n', ' '), '|', d[:80].replace('\n', ' '), '@%d,%d' % ((a[0] + a[2]) // 2, (a[1] + a[3]) // 2))"
