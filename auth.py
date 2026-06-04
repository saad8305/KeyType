from flask import Blueprint, request,jsonify,make_response
from ..extensions import db
from ..models import User
from ..utils.password import hash_password,check_password
from ..utils.jwt_handler import create_token

bp=Blueprint('auth',__name__)
@bp.route('/register',methods=['POST','OPTIONS'])
def register():
    if request.method=='OPTIONS':
        response=make_response()
        response.headers.add('Access-Control-Allow-Origin','*')
        response.headers.add('Access-Control-Allow-Headers','*')
        response.headers.add('Access-Control-Allow-Methods','*')
        return response
    data=request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error':'Username and password are required'}),400
    
    username=data['username']
    password=data['password']
    existing_user=User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'error':'Username already exists'}),409
    
    hashed_password=hash_password(password)
    new_user=User(username=username,password_hash=hashed_password,
        total_games_played=0,best_wpm=0)
    try:
        db.session.add(new_user)
        db.session.commit()
        token=create_token(new_user.id,new_user.username)
        response=jsonify({
            'message':'User created successfully',
            'token':token,'user':new_user.to_dict()})
        response.headers.add('Access-Control-Allow-Origin','*')
        return response,201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error':'Database error','message':str(e)}),500

@bp.route('/login',methods=['POST','OPTIONS'])
def login():
    if request.method=='OPTIONS':
        response=make_response()
        response.headers.add('Access-Control-Allow-Origin','*')
        response.headers.add('Access-Control-Allow-Headers','*')
        response.headers.add('Access-Control-Allow-Methods','*')
        return response
    data=request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error':'Username and password are required'}),400
    
    username=data['username']
    password=data['password']
    user=User.query.filter_by(username=username).first()
    if not user or not check_password(password, user.password_hash):
        return jsonify({'error':'Invalid username or password'}),401
    token=create_token(user.id,user.username)
    response = jsonify({
        'message':'Login successful','token':token,
        'user':user.to_dict()})
    response.headers.add('Access-Control-Allow-Origin','*')
    return response,200

@bp.route('/test',methods=['GET'])
def test():
    return jsonify({'message':'Auth route is working!'})