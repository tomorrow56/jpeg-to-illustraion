# JPEG to Illustration Converter

JPEG画像を様々なイラストスタイルに変換するWebアプリケーションです。

## 特徴

- シンプルで直感的なUI
- 複数のイラストスタイルに対応
- リアルタイムプレビュー機能
- レスポンシブデザインで様々なデバイスに対応

## 主な機能

1. **画像アップロード**
   - JPEG形式の画像をアップロード可能
   - ドラッグ＆ドロップ対応
   - 複数画像の一括アップロード可能

2. **イラスト変換**
   - アニメ風
   - 水彩画風
   - その他のスタイル（今後追加予定）

3. **画像編集**
   - プレビュー機能
   - 変換前後の比較表示
   - ダウンロード機能

## 技術スタック

### フロントエンド
- React
- Vite
- Tailwind CSS
- React Dropzone

### バックエンド
- Python 3.10+
- Flask
- OpenCV
- Pillow
- SQLAlchemy

### インフラ
- Docker（開発環境）
- Gunicorn（本番環境用WSGIサーバー）

## セットアップ

### 必要条件

- Python 3.10 以上
- Node.js 18 以上
- npm または yarn

### インストール手順

1. リポジトリをクローン
   ```bash
   git clone [リポジトリURL]
   cd jpeg-to-illustraion
   ```

2. バックエンドのセットアップ
   ```bash
   python -m venv venv
   source venv/bin/activate  # Windowsの場合は `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

3. フロントエンドのセットアップ
   ```bash
   cd frontend
   npm install
   ```

4. 環境変数の設定
   ```bash
   cp .env.example .env
   # .envファイルを編集して必要な設定を行う
   ```

## 開発サーバーの起動

> **重要**: バックエンドサーバーとフロントエンド開発サーバーは、それぞれ別々のターミナルで起動する必要があります。

### ターミナル1: バックエンドサーバーの起動

1. バックエンドサーバーを起動
   ```bash
   # プロジェクトルートで実行
   python main.py
   ```

### ターミナル2: フロントエンド開発サーバーの起動

1. フロントエンド開発サーバーを起動
   ```bash
   cd frontend
   npm run dev
   ```

3. ブラウザで `http://localhost:5173` にアクセス

## 使用方法

1. トップページの「画像を選択」ボタンをクリックするか、画像をドロップエリアにドラッグ＆ドロップ
2. 希望のイラストスタイルを選択
3. 「変換」ボタンをクリック
4. プレビューを確認し、必要に応じてダウンロード

## ライセンス

このプロジェクトは [MITライセンス](LICENSE) の下で公開されています。

## 貢献について

バグレポートやプルリクエストは歓迎します。

## 著者

[あなたの名前] - [連絡先情報]
