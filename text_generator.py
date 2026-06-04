from ..models import Text
from ..extensions import db
import random

def get_random_text(difficulty=None,user_id=None):
    query=Text.query
    if difficulty and difficulty!='all':
        query=query.filter_by(difficulty=difficulty)
    
    texts=query.all()
    print(f"DEBUG:Found {len(texts)} texts")
    if not texts:
        return{
            'id':0,
            'content':'The quick brown fox jumps over the lazy dog. Practice typing to improve your speed and accuracy.',
            'difficulty':'easy',
            'word_count':12,
            'category':'general'
        }
    selected_text=random.choice(texts)
    selected_text.used_count+=1
    db.session.commit()
    return{
        'id':selected_text.id,
        'content':selected_text.content,
        'difficulty':selected_text.difficulty,
        'word_count':selected_text.word_count,
        'category':getattr(selected_text,'category','general')
    }
def get_text_by_id(text_id):
    text=Text.query.get(text_id)
    if text:
        return{
            'id':text.id,
            'content':text.content,
            'difficulty':text.difficulty,
            'word_count':text.word_count,
            'category':getattr(text,'category','general')
        }
    return None

def get_all_categories():
    categories=db.session.query(Text.category).distinct().all()
    return [c[0] for c in categories if c[0] is not None]

def get_texts_count(difficulty=None):
    query=Text.query
    if difficulty:
        query=query.filter_by(difficulty=difficulty)
    return query.count()