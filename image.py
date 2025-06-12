import os
import uuid
import base64
from io import BytesIO
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename

image_bp = Blueprint('image', __name__)

# 画像保存用ディレクトリ
UPLOAD_FOLDER = 'uploads'
PROCESSED_FOLDER = 'processed'

# ディレクトリが存在しない場合は作成
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

def apply_simple_filter(image_data, style):
    """シンプルなフィルター処理（Pillowを使わない）"""
    # デモ用：実際の画像処理は行わず、元の画像をそのまま返す
    return image_data

@image_bp.route('/upload', methods=['POST'])
def upload_image():
    """画像アップロードAPI"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': '画像ファイルが見つかりません'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'ファイルが選択されていません'}), 400
        
        if file and file.filename.lower().endswith(('.jpg', '.jpeg')):
            # ファイル名を安全にする
            filename = secure_filename(file.filename)
            unique_filename = f"{uuid.uuid4()}_{filename}"
            filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
            
            # ファイルを保存
            file.save(filepath)
            
            return jsonify({
                'message': '画像がアップロードされました',
                'image_id': unique_filename
            }), 200
        
        return jsonify({'error': 'JPEG形式の画像のみ対応しています'}), 400
    
    except Exception as e:
        return jsonify({'error': f'アップロードエラー: {str(e)}'}), 500

@image_bp.route('/convert', methods=['POST'])
def convert_image():
    """画像変換API（デモ版）"""
    try:
        data = request.get_json()
        
        if not data or 'image_data' not in data or 'style' not in data:
            return jsonify({'error': '画像データとスタイルが必要です'}), 400
        
        # Base64画像データを取得
        image_data = data['image_data']
        style = data['style']
        
        # デモ用：実際の変換処理は行わず、元の画像をそのまま返す
        processed_image_data = apply_simple_filter(image_data, style)
        
        # 処理済み画像IDを生成
        processed_filename = f"{uuid.uuid4()}_{style}.jpg"
        
        return jsonify({
            'message': '画像変換が完了しました',
            'processed_image': processed_image_data,
            'image_id': processed_filename
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'変換エラー: {str(e)}'}), 500

@image_bp.route('/image/<image_id>')
def get_image(image_id):
    """画像取得API"""
    try:
        # まず処理済み画像フォルダを確認
        processed_path = os.path.join(PROCESSED_FOLDER, image_id)
        if os.path.exists(processed_path):
            return send_file(processed_path, mimetype='image/jpeg')
        
        # 次にアップロードフォルダを確認
        upload_path = os.path.join(UPLOAD_FOLDER, image_id)
        if os.path.exists(upload_path):
            return send_file(upload_path, mimetype='image/jpeg')
        
        return jsonify({'error': '画像が見つかりません'}), 404
    
    except Exception as e:
        return jsonify({'error': f'画像取得エラー: {str(e)}'}), 500

