#!/bin/bash

# --- 環境設定 ---
UAT_PROJECT="uat-env-888888"
PROD_PROJECT="mlytics-174006"

UAT_BUCKET="gs://mlytics-static-web-uat"
PROD_BUCKET="gs://mlytics-static-web-prod" # 請確認你的正式環境 Bucket 名稱

# 移除單一檔案設定，改為同步當前目錄
CACHE_SETTING="public, max-age=300"

# --- 邏輯判斷 ---
ENV=$1

if [ "$ENV" == "uat" ]; then
    PROJECT=$UAT_PROJECT
    BUCKET=$UAT_BUCKET
elif [ "$ENV" == "prod" ]; then
    PROJECT=$PROD_PROJECT
    BUCKET=$PROD_BUCKET
else
    echo "❌ 使用方式: ./deploy.sh [uat|prod]"
    exit 1
fi

echo "------------------------------------------"
echo "🌐 準備切換至環境: $(echo "$ENV" | tr '[:lower:]' '[:upper:]')"
echo "🆔 專案 ID: $PROJECT"
echo "------------------------------------------"

# 1. 切換 gcloud 專案
gcloud config set project $PROJECT

# 2. 二次確認目前環境 (防止切換失敗)
CURRENT_PROJECT=$(gcloud config get-value project)
if [ "$CURRENT_PROJECT" != "$PROJECT" ]; then
    echo "❌ 專案切換失敗，請檢查權限或登入狀態。"
    exit 1
fi

# 3. 執行上傳 (只上傳 out/ 靜態檔案)
# -m: 開啟多執行緒 (加速大量小檔案上傳)
# -r: 遞迴上傳子目錄
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
OUT_DIR="$SCRIPT_DIR/out"

if [ ! -d "$OUT_DIR" ]; then
    echo "❌ out/ 目錄不存在，請先執行 npm run build"
    exit 1
fi

echo "🚀 正在將 out/ 同步到 $BUCKET ..."

gsutil -m -h "Cache-Control:$CACHE_SETTING" rsync -r -x "\.DS_Store" "$OUT_DIR" "$BUCKET"

if [ $? -eq 0 ]; then
    echo "✅ [$(echo "$ENV" | tr '[:lower:]' '[:upper:]')] 上傳成功！"
    echo "💡 快取設定: $CACHE_SETTING (約 5 分鐘後生效)"
    echo "📂 已同步目錄: $OUT_DIR"

    # 修正 llms.txt Content-Type，確保瀏覽器以 UTF-8 解讀
    gsutil setmeta -h "Content-Type:text/plain; charset=utf-8" "$BUCKET/llms.txt"
else
    echo "❌ 上傳過程中發生錯誤。"
fi