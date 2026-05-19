# Mlytics Website — 交接文件

## 目錄
1. [專案簡介](#1-專案簡介)
2. [環境需求](#2-環境需求)
3. [第一次設定](#3-第一次設定)
4. [專案結構](#4-專案結構)
5. [日常開發流程](#5-日常開發流程)
6. [部署流程](#6-部署流程)
7. [環境變數](#7-環境變數)
8. [Git 規範](#8-git-規範)
9. [常見問題](#9-常見問題)

---

## 1. 專案簡介

**網站**：[www.mlytics.com](https://www.mlytics.com)

Mlytics 官方網站，介紹 Mlytics Cortex AI Answer Engine 產品，依據受眾分為三個主要頁面：Brands、Content Owners、Developers。

**技術棧**：
- [Next.js 16](https://nextjs.org/) (App Router, 靜態匯出)
- React 19 + TypeScript
- Tailwind CSS v4
- Framer Motion（動畫）
- Google Analytics 4

**部署環境**：
- 靜態檔案部署到 **Google Cloud Storage (GCS)**
- UAT bucket：`gs://mlytics-static-web-uat`
- Production bucket：`gs://mlytics-static-web-prod`

---

## 2. 環境需求

| 工具 | 建議版本 |
|------|---------|
| Node.js | v20 以上 |
| npm | v10 以上 |
| Google Cloud SDK (`gcloud`) | 最新版 |

安裝 gcloud SDK：https://cloud.google.com/sdk/docs/install

---

## 3. 第一次設定

```bash
# 1. Clone 專案
git clone https://github.com/mlytics/mlytics-website.git
cd mlytics-website

# 2. 安裝套件
npm install

# 3. 建立本機環境變數（參考第 7 節）
cp .env.production .env.local
# 修改 .env.local 內的 GA ID 為 UAT 用的值

# 4. 登入 gcloud（部署時才需要）
gcloud auth login
```

---

## 4. 專案結構

```
mlytics-website/
├── app/                        # Next.js App Router 頁面
│   ├── layout.tsx              # 全站 layout（Nav、Footer、GA）
│   ├── page.tsx                # 首頁 /
│   ├── not-found.tsx           # 404 頁面
│   ├── brands/page.tsx         # /brands
│   ├── content-owners/page.tsx # /content-owners
│   ├── developers/page.tsx     # /developers
│   ├── privacy-policy/page.tsx # /privacy-policy
│   └── terms-of-service/page.tsx
│
├── components/
│   ├── layout/                 # Nav、Footer、ScrollToTop
│   ├── home/                   # 首頁各 section 元件
│   ├── pages/                  # 各頁面專屬元件
│   │   ├── brands/
│   │   ├── developers/
│   │   └── publishers/
│   ├── agent/                  # AI Agent 對話元件
│   ├── analytics/              # GA 追蹤元件
│   └── ui/                     # 通用 UI 元件
│
├── context/                    # React Context（ContactModal、Agent）
├── lib/                        # 工具函式
├── public/                     # 靜態資源（圖片、logo、sitemap）
│   ├── logos/                  # 合作夥伴 Logo
│   ├── agentdialog_image/      # AI Demo 用圖片
│   └── og-image.png
│
├── out/                        # Build 輸出（不進 git，部署用）
├── .env.local                  # 本機環境變數（不進 git）
├── .env.production             # Production 環境變數
├── next.config.ts              # Next.js 設定（static export）
├── deploy.sh                   # 部署腳本
└── HANDOVER.md                 # 本文件
```

---

## 5. 日常開發流程

### 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器訪問 http://localhost:3000

> 若 port 被佔用，可指定：`npx next dev -p 3001`

### 新增或修改頁面

- 頁面放在 `app/` 目錄下，每個資料夾對應一個路由
- 元件放在 `components/` 下對應的子資料夾
- 修改後瀏覽器會自動熱更新，不需重啟

### Commit 規範

請參考第 8 節。

---

## 6. 部署流程

> 部署前請確認已登入 gcloud：`gcloud auth login`

### 步驟

```bash
# 1. 確認程式碼已 commit 並 push
git status
git push origin main
git push mlytics main

# 2. Build 靜態檔案
npm run build
# 輸出到 out/ 目錄

# 3. 部署到 UAT（測試環境）
./deploy.sh uat

# 4. 確認 UAT 沒問題後，部署到 Production
./deploy.sh prod
```

### 部署說明

- `deploy.sh` 只會上傳 `out/` 資料夾的內容，原始碼不會上傳
- 快取設定為 5 分鐘（`max-age=300`），部署後約 5 分鐘生效
- 腳本會自動切換 gcloud 專案，防止部署到錯誤環境

### UAT 與 Production 差異

| | UAT | Production |
|--|-----|-----------|
| GCP Project | `uat-env-888888` | `mlytics-174006` |
| GCS Bucket | `mlytics-static-web-uat` | `mlytics-static-web-prod` |
| GA ID | `.env.local` 內的值 | `.env.production` 內的值 |

---

## 7. 環境變數

| 變數 | 說明 |
|------|------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics 4 Measurement ID |

- `.env.local`：本機開發用（UAT GA ID），**不進 git**
- `.env.production`：Production 用，已進 git

---

## 8. Git 規範

### Remote

| Remote | URL | 用途 |
|--------|-----|------|
| `origin` | `github.com/AnChouuuu/mlytics-website` | 個人 fork |
| `mlytics` | `github.com/mlytics/mlytics-website` | 公司正式 repo |

Push 時兩個都要推：
```bash
git push origin main
git push mlytics main
```

### Commit 格式

```
<type>: <簡短描述>

- 詳細說明（選填）
```

| Type | 使用時機 |
|------|---------|
| `feat` | 新增功能或頁面 |
| `fix` | 修正 bug 或樣式問題 |
| `refactor` | 重構，不影響功能 |
| `chore` | 設定檔、腳本異動 |

---

## 9. 常見問題

**Q: `./deploy.sh` 出現「out/ 目錄不存在」**
先執行 `npm run build`，build 完才會產生 `out/`。

**Q: `gcloud` 專案切換失敗**
執行 `gcloud auth login` 重新登入，確認帳號有對應 GCP 專案的權限。

**Q: 本機樣式跑版但 build 正常**
清除 `.next/` 快取：`rm -rf .next && npm run dev`

**Q: 新增頁面後 sitemap 要更新嗎**
要。手動編輯 `public/sitemap.xml`，加入新路由後重新 build 部署。
