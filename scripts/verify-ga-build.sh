#!/bin/bash
# Checks a static export before upload (DATAI-681): every Next page must carry
# the hostname-based GA loader, no page may still request gtag/js?id=undefined,
# and the homepage must contain both the production and UAT ids (the same
# build serves both environments; the id is picked in the browser by hostname).
# Keep these ids in sync with lib/ga.ts (a unit test compares them).
PROD_GA_ID="G-BHS28B1S3P"
UAT_GA_ID="G-6QKQKHMYJV"

ENV="$1"
OUT_DIR="$2"
OUT_DIR="${OUT_DIR%/}"

case "$ENV" in
  prod|uat) ;;
  *) echo "❌ verify-ga-build: 環境必須是 uat 或 prod（收到：$ENV）"; exit 1 ;;
esac

HINT="請在乾淨的 worktree 重新 build：rm -rf out && npm run build"

if [ ! -f "$OUT_DIR/index.html" ]; then
  echo "❌ GA 檢查：找不到 $OUT_DIR/index.html。$HINT"
  exit 1
fi

UNDEFINED=$(grep -rl 'gtag/js?id=undefined' "$OUT_DIR" 2>/dev/null)
if [ -n "$UNDEFINED" ]; then
  echo "❌ GA 檢查：以下檔案仍載入 gtag/js?id=undefined（舊版 build）："
  echo "$UNDEFINED"
  echo "$HINT"
  exit 1
fi

MISSING=""
while IFS= read -r f; do
  if grep -q '/_next/static/' "$f" && ! grep -q 'id="ga-loader"' "$f"; then
    MISSING="$MISSING${f#"$OUT_DIR"/}"$'\n'
  fi
done < <(find "$OUT_DIR" -name '*.html' -not -path '*/_next/*')
if [ -n "$MISSING" ]; then
  echo "❌ GA 檢查：以下頁面沒有 GA loader："
  printf '%s' "$MISSING"
  echo "$HINT"
  exit 1
fi

for ID in "$PROD_GA_ID" "$UAT_GA_ID"; do
  if ! grep -q "$ID" "$OUT_DIR/index.html"; then
    echo "❌ GA 檢查：首頁沒有 GA ID $ID（請確認 lib/ga.ts）。$HINT"
    exit 1
  fi
done

echo "✅ GA 檢查通過（$ENV；www.mlytics.com → $PROD_GA_ID、mlytics.co → $UAT_GA_ID）"
