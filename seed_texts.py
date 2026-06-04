import sqlite3
import json
from pathlib import Path

BASE_DIR=Path(__file__).resolve().parent
DB_PATH=BASE_DIR/'instance'/'typing_game.db'
TEXTS=[
    #easy
    {"content":"The sun rises in the east and sets in the west every day.", "difficulty": "easy", "category": "nature", "word_count": 15},
    {"content":"Practice makes perfect when learning to type quickly.", "difficulty": "easy", "category": "motivation", "word_count": 9},
    {"content":"A journey of a thousand miles begins with a single step.", "difficulty": "easy", "category": "proverb", "word_count": 12},
    {"content":"Technology has changed the way we communicate with each other.", "difficulty": "easy", "category": "technology", "word_count": 11},
    {"content":"Reading books can improve your vocabulary and writing skills.", "difficulty": "easy", "category": "education", "word_count": 11},
    #medium
    {"content":"Artificial intelligence is transforming industries and creating new opportunities for innovation.", "difficulty": "medium", "category": "technology", "word_count": 13},
    {"content":"The key to success is consistency and never giving up on your dreams.", "difficulty": "medium", "category": "motivation", "word_count": 15},
    {"content":"Climate change is one of the most important challenges facing humanity today.", "difficulty": "medium", "category": "science", "word_count": 13},
    {"content":"Learning a new language opens doors to different cultures and perspectives.", "difficulty": "medium", "category": "education", "word_count": 12},
    {"content":"The internet has made information accessible to people all around the world.", "difficulty": "medium", "category": "technology", "word_count": 14},
    #hard
    {"content":"Throughout history, human civilization has evolved through continuous learning, adaptation, and the relentless pursuit of knowledge and understanding.", "difficulty": "hard", "category": "history", "word_count": 20},
    {"content":"The rapid advancement of technology brings both exciting opportunities and complex challenges that society must carefully navigate.", "difficulty": "hard", "category": "technology", "word_count": 18},
    {"content":"To achieve mastery in any field, one must dedicate countless hours to practice, learning from failures, and constantly pushing beyond comfort zones.", "difficulty": "hard", "category": "motivation", "word_count": 22},
    #meaning
    {"content":"Believe you can and you are halfway to achieving your goals and dreams.", "difficulty": "easy", "category": "inspiration", "word_count": 14},
    {"content":"The only limit to our realization of tomorrow is our doubts of today.", "difficulty": "medium", "category": "inspiration", "word_count": 15},
    {"content":"Success is not final, failure is not fatal, it is the courage to continue that counts.", "difficulty": "medium", "category": "inspiration", "word_count": 17},
    #logical
    {"content":"The universe is vast and full of mysteries waiting to be discovered by curious minds.", "difficulty": "medium", "category": "science", "word_count": 14},
    {"content":"Photosynthesis is the process by which plants convert sunlight into chemical energy.", "difficulty": "hard", "category": "science", "word_count": 13},
    #daily
    {"content":"Remember to take breaks and stretch your fingers while typing for long periods.", "difficulty": "easy", "category": "health", "word_count": 14},
    {"content":"Drinking enough water throughout the day helps maintain focus and energy levels.", "difficulty": "medium", "category": "health", "word_count": 13},
]

def add_new_texts():
    conn=sqlite3.connect(str(DB_PATH))
    cursor=conn.cursor()
    try:
        cursor.execute("ALTER TABLE texts ADD COLUMN category TEXT DEFAULT 'general'")
    except sqlite3.OperationalError:
        pass    
    try:
        cursor.execute("ALTER TABLE texts ADD COLUMN used_count INTEGER DEFAULT 0")
    except sqlite3.OperationalError:
        pass
    
    for text in TEXTS:
        cursor.execute(
            "SELECT id FROM texts WHERE content = ?",
            (text['content'],))
        if not cursor.fetchone():
            cursor.execute("""
                INSERT INTO texts (content, difficulty, word_count, category, used_count)
                VALUES(?,?,?,?,0)
            """,(text['content'],text['difficulty'],text['word_count'],text['category']))
            print(f"✅Added: {text['content'][:50]}...")
    conn.commit()
    conn.close()
    print("\n🎉All texts added successfully!")
if __name__=='__main__':
    add_new_texts()