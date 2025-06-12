from flask import Blueprint, jsonify

user_bp = Blueprint('user', __name__)

@user_bp.route('/test', methods=['GET'])
def test():
    return jsonify({'status': 'success', 'message': 'API is working!'})
