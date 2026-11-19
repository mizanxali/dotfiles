#!/usr/bin/env bash
# Background gameplay for a brainrot video.
#
#   scripts/get-gameplay.sh search "subway surfers"   # list candidates
#   scripts/get-gameplay.sh <youtube-url> [minutes]   # -> public/gameplay.mp4
#
# Downloads the first N minutes (default 3) of the video stream only, finds
# any black bars with ffmpeg's cropdetect and crops them off, then fills a
# 1080x1920 frame (cropping the sides of a landscape source), at 30 fps,
# H.264, no audio. The raw download goes to its own temporary directory.
set -euo pipefail

if [[ "${1:-}" == "search" ]]; then
  query="${2:?usage: get-gameplay.sh search <game>}"
  # Full extraction (not --flat-playlist) so width and height are known.
  yt-dlp --no-warnings --skip-download --ignore-errors \
    --print "%(id)s | %(duration_string)s | %(width)sx%(height)s | %(view_count)s views | %(title)s" \
    "ytsearch10:${query} gameplay no copyright vertical"
  exit 0
fi

url="${1:?usage: get-gameplay.sh <youtube-url> [minutes]}"
minutes="${2:-3}"
out="public/gameplay.mp4"
mkdir -p public
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

echo "Downloading the first ${minutes} min of ${url}..."
yt-dlp --no-warnings --no-playlist \
  -f "bv*[vcodec^=avc1][height<=1920]/bv*[height<=1920]/bv*" \
  --download-sections "*0:00-${minutes}:00" \
  -o "${tmp}/raw.%(ext)s" "${url}" >/dev/null
raw="$(ls "${tmp}"/raw.*)"

read -r w h < <(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0:s=x "$raw" | tr x ' ')
echo "Source ${w}x${h}"

# The crop most frames agree on, sampling one frame in 120.
crop="$(ffmpeg -i "$raw" -vf "select='not(mod(n\,120))',cropdetect=limit=24:round=2:reset=0:skip=0" -an -f null - 2>&1 \
  | grep -o 'crop=[0-9:]*' | sort | uniq -c | sort -rn | head -1 | awk '{print $2}')"
crop="${crop:-crop=${w}:${h}:0:0}"
if [[ "$crop" == "crop=${w}:${h}:0:0" ]]; then
  echo "No black bars"
  filter=""
else
  echo "Black bars found, cropping: ${crop}"
  filter="${crop},"
fi

ffmpeg -v error -stats -y -i "$raw" -an \
  -vf "${filter}scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,fps=30,setsar=1" \
  -c:v libx264 -preset veryfast -crf 20 -pix_fmt yuv420p -movflags +faststart "$out"

ffprobe -v error -show_entries stream=width,height,r_frame_rate:format=duration -of compact "$out"
