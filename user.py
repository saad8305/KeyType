from flask import Blueprint,request,jsonify
from ..extensions import db
from ..models import User,GameResult
from ..middleware.auth import token_required,get_current_user
from sqlalchemy import func,desc
from datetime import datetime,timedelta
from ..utils.password import check_password, hash_password

bp=Blueprint('user',__name__,url_prefix='/api/user')
@bp.route('/profile',methods=['GET'])
@token_required
def get_profile():
    try:
        current_user=get_current_user()
        user_id=current_user['id']
        user=User.query.get(user_id)
        if not user:
            return jsonify({'error':'User not found'}),404
        return jsonify({'user':user.to_dict()}),200
    except Exception as e:
        return jsonify({'error':str(e)}),500

@bp.route('/stats',methods=['GET'])
@token_required
def get_stats():
    try:
        current_user=get_current_user()
        user_id=current_user['id']
        user=User.query.get(user_id)
        if not user:
            return jsonify({'error':'User not found'}),404
        avg_stats=db.session.query(
            func.avg(GameResult.wpm).label('avg_wpm'),
            func.avg(GameResult.accuracy).label('avg_accuracy'),
            func.max(GameResult.wpm).label('max_wpm'),
            func.min(GameResult.wpm).label('min_wpm'),
            func.count(GameResult.id).label('total_games')
        ).filter(GameResult.user_id==user_id).first()
        today=datetime.utcnow().date()
        today_games=GameResult.query.filter(
            GameResult.user_id==user_id,
            func.date(GameResult.created_at)==today).count()
    
        return jsonify({
            'user':user.to_dict(),'average_wpm':round(avg_stats.avg_wpm or 0,2),
            'average_accuracy':round(avg_stats.avg_accuracy or 0,2),
            'max_wpm':round(avg_stats.max_wpm or 0,2),'min_wpm':round(avg_stats.min_wpm or 0,2),
            'total_games':avg_stats.total_games or 0,'today_games':today_games}),200
    except Exception as e:
        return jsonify({'error':str(e)}),500

@bp.route('/history',methods=['GET'])
@token_required
def get_history():
    try:
        current_user=get_current_user()
        user_id=current_user['id']
        limit=request.args.get('limit',20,type=int)
        results=GameResult.query.filter_by(user_id=user_id)\
                                   .order_by(desc(GameResult.created_at))\
                                   .limit(limit)\
                                   .all()
        
        history=[]
        for result in results:
            history.append({
                'id':result.id,
                'wpm':round(result.wpm,2),
                'accuracy':round(result.accuracy,2),
                'duration':result.duration,
                'text_preview':result.text_preview[:50]+'...' if len(result.text_preview)>50 else result.text_preview,
                'created_at':result.created_at.isoformat()
            })
        return jsonify({'history':history}),200
    except Exception as e:
        return jsonify({'error':str(e)}),500

@bp.route('/chart-data',methods=['GET'])
@token_required
def get_chart_data():
    try:
        current_user=get_current_user()
        user_id=current_user['id']
        results=GameResult.query.filter_by(user_id=user_id)\
                                   .order_by(GameResult.created_at.desc())\
                                   .limit(15)\
                                   .all()
        results.reverse()
        chart_data={'labels':[],'wpm_data':[],'accuracy_data':[]}
        for result in results:
            chart_data['labels'].append(result.created_at.strftime('%m/%d %H:%M'))
            chart_data['wpm_data'].append(round(result.wpm,2))
            chart_data['accuracy_data'].append(round(result.accuracy,2))
        return jsonify(chart_data),200
    except Exception as e:
        return jsonify({'error':str(e)}),500

@bp.route('/achievements',methods=['GET'])
@token_required
def get_achievements():
    try:
        current_user=get_current_user()
        user_id=current_user['id']
        stats=db.session.query(
            func.count(GameResult.id).label('total_games'),
            func.max(GameResult.wpm).label('max_wpm'),
            func.avg(GameResult.accuracy).label('avg_accuracy')
        ).filter(GameResult.user_id==user_id).first()
        perfect_game=GameResult.query.filter(
            GameResult.user_id==user_id,
            GameResult.accuracy==100
        ).first()
        achievements=[
            {
                'id':'first_game',
                'name':'First Step',
                'description':'Complete your first typing test',
                'icon':'🎮',
                'unlocked':(stats.total_games or 0)>=1,
                'progress':min(100,((stats.total_games or 0)/1)*100)},
            {
                'id':'ten_games',
                'name':'Getting Started',
                'description':'Complete 10 typing tests',
                'icon':'📊',
                'unlocked':(stats.total_games or 0)>=10,
                'progress':min(100,((stats.total_games or 0)/10)*100)},
            {
                'id':'fifty_games',
                'name':'Dedicated',
                'description':'Complete 50 typing tests',
                'icon':'🔥',
                'unlocked':(stats.total_games or 0)>=50,
                'progress':min(100,((stats.total_games or 0)/50)*100)},
            {
                'id':'speed_30',
                'name':'Getting Faster',
                'description':'Reach 30 WPM',
                'icon':'💨',
                'unlocked':(stats.max_wpm or 0)>=30,
                'progress':min(100,((stats.max_wpm or 0)/30)*100)},
            {
                'id':'speed_50',
                'name':'Speed Demon',
                'description':'Reach 50 WPM',
                'icon':'⚡',
                'unlocked':(stats.max_wpm or 0)>=50,
                'progress':min(100,((stats.max_wpm or 0)/50)*100)},
            {
                'id':'speed_70',
                'name':'Typing Master',
                'description':'Reach 70 WPM',
                'icon':'🏆',
                'unlocked':(stats.max_wpm or 0)>=70,
                'progress':min(100,((stats.max_wpm or 0)/70)*100)},
            {
                'id':'accuracy_95',
                'name':'Precision',
                'description':'Achieve 95% accuracy',
                'icon':'🎯',
                'unlocked':(stats.avg_accuracy or 0)>=95,
                'progress':(stats.avg_accuracy or 0)},
            {
                'id':'perfect_game',
                'name':'Perfect',
                'description':'Get 100% accuracy in a game',
                'icon':'💎',
                'unlocked':perfect_game is not None,
                'progress':100 if perfect_game else 0
            }
        ]
        total_achievements=len(achievements)
        unlocked_count=sum(1 for a in achievements if a['unlocked'])
        total_score=int((unlocked_count/total_achievements)*100)
        return jsonify({
            'achievements':achievements,'total_score':total_score,
            'unlocked_count':unlocked_count,'total_count':total_achievements
        }),200
    except Exception as e:
        return jsonify({'error':str(e)}),500

@bp.route('/weekly-summary',methods=['GET'])
@token_required
def get_weekly_summary():
    try:
        current_user=get_current_user()
        user_id=current_user['id']
        week_ago=datetime.utcnow()-timedelta(days=7)
        weekly_games=GameResult.query.filter(
            GameResult.user_id==user_id,
            GameResult.created_at>=week_ago
        ).order_by(GameResult.created_at).all()
        if not weekly_games:
            return jsonify({
                'has_data':False,
                'message':'No games played this week'
            }),200
        avg_wpm=sum(g.wpm for g in weekly_games)/len(weekly_games)
        avg_accuracy=sum(g.accuracy for g in weekly_games)/len(weekly_games)
        best_wpm=max(g.wpm for g in weekly_games)
        total_games=len(weekly_games)
        days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
        daily_wpm=[0]*7
        daily_counts=[0]*7
        for game in weekly_games:
            day_idx=game.created_at.weekday()
            daily_wpm[day_idx]+=game.wpm
            daily_counts[day_idx]+=1
        
        for i in range(7):
            if daily_counts[i]>0:
                daily_wpm[i]=round(daily_wpm[i]/daily_counts[i],2)
        return jsonify({
            'has_data':True,
            'avg_wpm':round(avg_wpm,2),
            'avg_accuracy':round(avg_accuracy,2),
            'best_wpm':round(best_wpm,2),
            'total_games':total_games,
            'daily_wpm':daily_wpm,
            'days':days
        }),200
    except Exception as e:
        return jsonify({'error':str(e)}),500
    
@bp.route('/change-password',methods=['POST'])
@token_required
def change_password():
    try:
        current_user=get_current_user()
        user_id=current_user['id']
        data=request.get_json()
        old_password=data.get('old_password')
        new_password=data.get('new_password')
        if not old_password or not new_password:
            return jsonify({'error':'Old and new password are required'}),400
        if len(new_password)<3:
            return jsonify({'error':'New password must be at least 3 characters'}),400
        user=User.query.get(user_id)
        if not check_password(old_password,user.password_hash):
            return jsonify({'error':'Current password is incorrect'}),401
        user.password_hash=hash_password(new_password)
        db.session.commit()
        return jsonify({'message':'Password changed successfully'}),200
    except Exception as e:
        return jsonify({'error':str(e)}),500

@bp.route('/delete-account',methods=['DELETE'])
@token_required
def delete_account():
    try:
        current_user=get_current_user()
        user_id=current_user['id']
        user=User.query.get(user_id)
        if not user:
            return jsonify({'error':'User not found'}),404
        GameResult.query.filter_by(user_id=user_id).delete()
        db.session.delete(user)
        db.session.commit()
        return jsonify({'message':'Account deleted successfully'}),200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error':str(e)}),500

@bp.route('/settings',methods=['GET','POST'])
@token_required
def user_settings():
    try:
        current_user=get_current_user()
        user_id=current_user['id']
        if request.method=='GET':
            return jsonify({
                'sound_enabled':True,
                'vibration_enabled':True,
                'default_difficulty':'medium',
                'default_duration':60}),200
        elif request.method=='POST':
            data=request.get_json()
            return jsonify({'message':'Settings saved','settings':data}),200
    except Exception as e:
        return jsonify({'error':str(e)}),500