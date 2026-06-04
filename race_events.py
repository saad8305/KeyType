from flask_socketio import SocketIO,emit,join_room,leave_room
from ..models import User
from ..services.text_generator import get_random_text

socketio=SocketIO(cors_allowed_origins="*")
rooms={}
@socketio.on('join_race')
def handle_join_race(data):
    room_id=data.get('room_id')
    username=data.get('username')
    user_id=data.get('user_id')
    if room_id not in rooms:
        rooms[room_id]={
            'players':[],'started':False,
            'text':get_random_text('medium')
        }
    rooms[room_id]['players'].append({
        'id':user_id,'username':username,
        'progress':0,'completed':False,'wpm':0
    })
    join_room(room_id)
    emit('player_joined',{
        'players':rooms[room_id]['players'],
        'player_count':len(rooms[room_id]['players'])
    },room=room_id)
    emit('race_joined',{
        'room_id':room_id,
        'text':rooms[room_id]['text']['content'],
        'players':rooms[room_id]['players']
    })

@socketio.on('start_race')
def handle_start_race(data):
    room_id=data.get('room_id')
    if room_id in rooms and not rooms[room_id]['started']:
        rooms[room_id]['started']=True
        rooms[room_id]['start_time']=None        
        emit('race_started',{'text':rooms[room_id]['text']['content']},room=room_id)

@socketio.on('typing_progress')
def handle_typing_progress(data):
    room_id=data.get('room_id')
    user_id=data.get('user_id')
    progress=data.get('progress')
    wpm=data.get('wpm')
    if room_id in rooms:
        for player in rooms[room_id]['players']:
            if player['id']==user_id:
                player['progress']=progress
                player['wpm']=wpm
                break
        emit('progress_update',{'players':rooms[room_id]['players']},room=room_id)

@socketio.on('race_complete')
def handle_race_complete(data):
    room_id=data.get('room_id')
    user_id=data.get('user_id')
    wpm=data.get('wpm')
    if room_id in rooms:
        for player in rooms[room_id]['players']:
            if player['id']==user_id:
                player['completed']=True
                player['wpm']=wpm
                player['finish_time']=data.get('finish_time')
                break

        all_completed=all(p['completed'] for p in rooms[room_id]['players'])
        if all_completed:
            winner=min(rooms[room_id]['players'],key=lambda x:x.get('finish_time',float('inf')))
            emit('race_finished',{
                'winner':winner['username'],
                'results':rooms[room_id]['players']},room=room_id)
            
            del rooms[room_id]
        else:
            emit('player_completed',{
                'username':next(p['username'] for p in rooms[room_id]['players'] if p['id']==user_id),
                'wpm':wpm},room=room_id)

@socketio.on('leave_race')
def handle_leave_race(data):
    room_id=data.get('room_id')
    user_id=data.get('user_id')
    if room_id in rooms:
        rooms[room_id]['players']=[p for p in rooms[room_id]['players'] if p['id']!=user_id]
        leave_room(room_id)
        if len(rooms[room_id]['players'])==0:
            del rooms[room_id]
        else:
            emit('player_left',{'players':rooms[room_id]['players']},room=room_id)