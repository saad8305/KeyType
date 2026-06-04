from flask import Blueprint,request,jsonify
from ..models import User,GameResult
from ..extensions import db
from sqlalchemy import func,desc
from datetime import datetime,timedelta

bp=Blueprint('leaderboard',__name__,url_prefix='/api/leaderboard')
@bp.route('/',methods=['GET'])
def get_leaderboard():
    limit=request.args.get('limit',20,type=int)
    period=request.args.get('period','all')
    query=User.query.filter(User.total_games_played>0)
    now=datetime.utcnow()
    if period=='day':
        start_date=now-timedelta(days=1)
        query=query.filter(User.created_at>=start_date)
    elif period=='week':
        start_date=now-timedelta(days=7)
        query=query.filter(User.created_at>=start_date)
    elif period=='month':
        start_date=now-timedelta(days=30)
        query=query.filter(User.created_at>=start_date)
    
    top_users=query.order_by(desc(User.best_wpm)).limit(limit).all()
    leaderboard=[]
    for i, user in enumerate(top_users,1):
        leaderboard.append({
            'rank':i,'username':user.username,'best_wpm':user.best_wpm,
            'total_games':user.total_games_played,
            'avatar':f'https://ui-avatars.com/api/?name={user.username}&background=e2b714&color=1a1a2e&bold=true'
        })
    return jsonify({'leaderboard':leaderboard}),200

@bp.route('/recent',methods=['GET'])
def get_recent_scores():
    limit=request.args.get('limit',15,type=int)
    recent_scores=db.session.query(
        GameResult.wpm,GameResult.accuracy,
        GameResult.created_at,User.username
    ).join(User).order_by(desc(GameResult.created_at)).limit(limit).all()
    results=[]
    for score in recent_scores:
        results.append({
            'username':score.username,'wpm':round(score.wpm,2),
            'accuracy':round(score.accuracy,2),'created_at':score.created_at.isoformat()
        })
    return jsonify({'recent_scores':results}),200