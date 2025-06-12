# Webサイト設計書

## 技術選定

### フロントエンド
- React.js（manus-create-react-appテンプレートを使用）
- Tailwind CSS（スタイリング）
- Lucide React（アイコン）

### バックエンド
- Flask（manus-create-flask-appテンプレートを使用）
- Pillow（画像処理）
- Flask-CORS（CORS対応）

## アーキテクチャ設計

### システム構成
1. フロントエンド（React）
   - 画像アップロード機能
   - スタイル選択UI
   - プレビュー表示
   - ダウンロード機能
   - Xシェア機能

2. バックエンド（Flask）
   - 画像アップロードAPI
   - 画像変換処理API
   - 変換済み画像配信API

### 画面設計
1. メイン画面
   - ヘッダー（タイトル、説明）
   - 画像アップロードエリア
   - スタイル選択エリア
   - プレビューエリア
   - アクションボタン（ダウンロード、Xシェア）

### API設計
- POST /api/upload - 画像アップロード
- POST /api/convert - 画像変換
- GET /api/image/{id} - 変換済み画像取得

