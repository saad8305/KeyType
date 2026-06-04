from ..extensions import db
from datetime import datetime

class GameResult(db.Model):
    __tablename__='game_results'
    id=db.Column(db.Integer,primary_key=True)
    user_id=db.Column(db.Integer,db.ForeignKey('users.id'),nullable=False)
    wpm=db.Column(db.Float,nullable=False)
    accuracy=db.Column(db.Float,nullable=False)
    duration=db.Column(db.Integer,nullable=False)
    text_preview=db.Column(db.String(200),nullable=False)
    created_at=db.Column(db.DateTime,default=datetime.utcnow)
    
    def to_dict(self):
        return{'id':self.id,'user_id':self.user_id,'wpm':round(self.wpm,2),
            'accuracy':round(self.accuracy,2),'duration':self.duration,
            'text_preview':self.text_preview,'created_at':self.created_at.isoformat() if self.created_at else None
        }