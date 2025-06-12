from flask import Blueprint, request, jsonify
import base64
import cv2
import numpy as np
from io import BytesIO
from PIL import Image
import os

image_bp = Blueprint('image', __name__)

def process_image_style(image_data, style):
    try:
        # ベース64から画像データを取得
        if 'base64,' in image_data:
            image_data = image_data.split('base64,')[1]
        
        # ベース64をデコード
        image_bytes = base64.b64decode(image_data)
        
        # 画像をPillowで開き、RGBモードに変換
        pil_image = Image.open(BytesIO(image_bytes)).convert('RGB')
        
        # Pillowの画像をnumpy配列に変換（RGB形式）
        img_array = np.array(pil_image)
        
        # OpenCV用にBGRに変換
        img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
        
        # スタイルに応じたエフェクトを適用
        if style == 'anime':
            # アニメ風エフェクト
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            gray = cv2.medianBlur(gray, 5)
            edges = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_MEAN_C, 
                                        cv2.THRESH_BINARY, 9, 9)
            color = cv2.bilateralFilter(img_bgr, 9, 300, 300)
            result = cv2.bitwise_and(color, color, mask=edges)
            
        elif style == 'watercolor':
            # 水彩画風エフェクト - 色を保持するように修正
            # 彩度を上げるためにHSV空間で処理
            hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
            h, s, v = cv2.split(hsv)
            
            # 彩度を上げる
            s = cv2.add(s, 30)
            s = np.clip(s, 0, 255).astype(np.uint8)
            
            # 明るさを調整
            v = cv2.add(v, 20)
            v = np.clip(v, 0, 255).astype(np.uint8)
            
            # 色相はそのままに、彩度と明るさを調整してマージ
            hsv_modified = cv2.merge([h, s, v])
            
            # BGRに戻す
            result = cv2.cvtColor(hsv_modified, cv2.COLOR_HSV2BGR)
            
            # 水彩画風のエッジを追加
            result = cv2.stylization(result, sigma_s=60, sigma_r=0.4)
            
        elif style == 'oil':
            # 油絵風エフェクト - 色を保持
            # 彩度を上げる
            hsv = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2HSV)
            h, s, v = cv2.split(hsv)
            s = cv2.add(s, 40)
            s = np.clip(s, 0, 255).astype(np.uint8)
            hsv_modified = cv2.merge([h, s, v])
            img_bgr = cv2.cvtColor(hsv_modified, cv2.COLOR_HSV2BGR)
            
            # 油絵風エフェクトを適用
            result = cv2.xphoto.oilPainting(img_bgr, 5, 1)
            
        elif style == 'sketch':
            # スケッチ風エフェクト
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            inv_gray = 255 - gray
            blur = cv2.GaussianBlur(inv_gray, (21, 21), 0, 0)
            sketch = cv2.divide(gray, 255 - blur, scale=256)
            result = cv2.cvtColor(sketch, cv2.COLOR_GRAY2BGR)
            
        else:
            result = img_bgr
        
        # コントラストを調整（全スタイル共通）
        lab = cv2.cvtColor(result, cv2.COLOR_BGR2LAB)
        l, a, b = cv2.split(lab)
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
        cl = clahe.apply(l)
        limg = cv2.merge((cl,a,b))
        result = cv2.cvtColor(limg, cv2.COLOR_LAB2BGR)
        
        # シャープネスを少し上げる
        kernel = np.array([[-1,-1,-1], 
                          [-1, 9,-1],
                          [-1,-1,-1]])
        result = cv2.filter2D(result, -1, kernel)
        
        # 最終的な色調整（彩度とコントラスト）
        hsv = cv2.cvtColor(result, cv2.COLOR_BGR2HSV)
        h, s, v = cv2.split(hsv)
        s = cv2.add(s, 10)
        s = np.clip(s, 0, 255).astype(np.uint8)
        hsv = cv2.merge([h, s, v])
        result = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
        
        # RGBに変換してPillowに戻す
        result_rgb = cv2.cvtColor(result, cv2.COLOR_BGR2RGB)
        result_pil = Image.fromarray(result_rgb)
        
        # 画像をメモリに保存
        buffered = BytesIO()
        result_pil.save(buffered, format="JPEG", quality=95)
        
        # ベース64にエンコード
        processed_image = base64.b64encode(buffered.getvalue()).decode('utf-8')
        
        return processed_image
        
    except Exception as e:
        print(f"画像処理エラー: {str(e)}")
        # エラー時は元の画像をそのまま返す
        if 'image_data' in locals():
            return image_data.split('base64,')[-1] if 'base64,' in image_data else image_data
        return ''

@image_bp.route('/convert', methods=['POST'])
def convert_image():
    try:
        data = request.get_json()
        
        if not data or 'image_data' not in data or 'style' not in data:
            return jsonify({'error': 'Invalid request data'}), 400
        
        processed_image = process_image_style(data['image_data'], data['style'])
        
        return jsonify({
            'status': 'success',
            'processed_image': f'data:image/jpeg;base64,{processed_image}'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
