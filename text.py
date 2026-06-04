from ..extensions import db
from datetime import datetime

class Text(db.Model):
    __tablename__='texts'

    id=db.Column(db.Integer,primary_key=True)
    content=db.Column(db.Text,nullable=False)
    language=db.Column(db.String(7),default='en')
    difficulty=db.Column(db.String(10),default='medium')
    word_count=db.Column(db.Integer,nullable=False)
    category=db.Column(db.String(50),default='general')
    used_count=db.Column(db.Integer,default=0)
    created_at=db.Column(db.DateTime,default=datetime.utcnow)

    def to_dict(self):
        return{'id':self.id,'content':self.content,'language':self.language,
            'difficulty':self.difficulty,'word_count':self.word_count,
            'category':self.category,'used_count':self.used_count
        }