from flask import Blueprint,request,jsonify
from ..extensions import db
from ..models import User,GameResult,Text
from ..services.text_generator import get_random_text,get_texts_count
from ..middleware.auth import token_required,get_current_user
from datetime import datetime

bp=Blueprint('game',__name__,url_prefix='/api/game')
@bp.route('/text',methods=['GET'])
def get_text():
    difficulty=request.args.get('difficulty',None)
    user_id=None
    try:
        current_user=get_current_user()
        if current_user:
            user_id=current_user.get('id')
    except:
        pass

    text=get_random_text(difficulty)
    return jsonify({
        'id':text['id'],'content':text['content'],
        'difficulty':text['difficulty'],'word_count':text['word_count']}),200

@bp.route('/texts/stats',methods=['GET'])
def get_texts_stats():
    total=Text.query.count()
    easy = Text.query.filter_by(difficulty='easy').count()
    medium = Text.query.filter_by(difficulty='medium').count()
    hard = Text.query.filter_by(difficulty='hard').count()
    return jsonify({
        'total':total,'easy':easy,
        'medium':medium,'hard':hard
    }),200

@bp.route('/save-result',methods=['POST'])
@token_required
def save_result():
    data=request.get_json()
    required_fields=['wpm','accuracy','duration','text_id','text_preview']
    for field in required_fields:
        if field not in data:
            return jsonify({'error':f'Missing field:{field}'}),400
    wpm=data['wpm']
    accuracy=data['accuracy']
    duration=data['duration']
    text_id=data['text_id']
    text_preview=data['text_preview'][:200]
    current_user=get_current_user()
    user_id=current_user['id']
    user=User.query.get(user_id)
    if not user:
        return jsonify({'error':'User not found'}),404
    try:
        game_result=GameResult(user_id=user_id,wpm=wpm,accuracy=accuracy,
            duration=duration,text_preview=text_preview)
        db.session.add(game_result)
        user.total_games_played+=1
        if wpm>user.best_wpm:
            user.best_wpm=int(wpm)
        db.session.commit()
        return jsonify({
            'message':'Result saved successfully','result':game_result.to_dict(),
            'user_stats':{
                'total_games_played':user.total_games_played,'best_wpm':user.best_wpm}}),201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error':'Database error','message':str(e)}),500

@bp.route('/test',methods=['GET'])
def test():
    return jsonify({'message':'Game route is working!'})

@bp.route('/user-results',methods=['GET'])
@token_required
def get_user_results():
    current_user=get_current_user()
    user_id=current_user['id']
    results=GameResult.query.filter_by(user_id=user_id)\
                               .order_by(GameResult.created_at.desc())\
                               .limit(20)\
                               .all()    
    return jsonify({'results':[r.to_dict() for r in results]}),200

