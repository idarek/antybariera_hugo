#!/bin/sh

bad=$(find . -type f \( -name "*.JPG" -o -name "*.JPEG" -o -name "*.PNG" -o -name "*.GIF" -o -name "*.WEBP" -o -name "*.SVG" \) \
  | grep -v ".git/")

if [ -n "$bad" ]; then
  echo "Uppercase image extensions found – fix before serving:"
  echo "$bad"
  exit 1
fi
# Hugo version 0.123+
hugo server --renderToMemory --logLevel info --printPathWarnings --templateMetrics --templateMetricsHints
