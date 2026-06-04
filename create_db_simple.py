import sqlite3
import os
from pathlib import Path

BASE_DIR=Path(__file__).resolve().parent
INSTANCE_DIR=BASE_DIR/'instance'
INSTANCE_DIR.mkdir(exist_ok=True)
DB_PATH=INSTANCE_DIR/'typing_game.db'
print(f"📁Creating database at: {DB_PATH}")
if DB_PATH.exists():
    DB_PATH.unlink()
    print("✅Old database deleted")

conn=sqlite3.connect(str(DB_PATH))
cursor=conn.cursor()
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_games_played INTEGER DEFAULT 0,
    best_wpm INTEGER DEFAULT 0
)
''')
print("✅Table 'users' created")
cursor.execute('''
CREATE TABLE IF NOT EXISTS texts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    difficulty TEXT DEFAULT 'medium',
    word_count INTEGER NOT NULL
)
''')
print("✅Table 'texts' created")
cursor.execute('''
CREATE TABLE IF NOT EXISTS game_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    wpm REAL NOT NULL,
    accuracy REAL NOT NULL,
    duration INTEGER NOT NULL,
    text_preview TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
)
''')
print("✅Table 'game_results' created")
sample_texts=[
    ("The quick brown fox jumps over the lazy dog. Typing practice is fun and useful. Keep your fingers on the home row and type as fast as you can.", "en", "easy", 25),
    ("Programming requires patience and practice. The more you code, the better you become. Start with small projects and gradually increase difficulty.", "en", "medium", 32),
    ("Speed and accuracy are both important when learning to type. Focus on accuracy first, then work on increasing your speed steadily.", "en", "medium", 35),
    ("The art of programming is the ability to break down complex problems into smaller, manageable pieces. Each piece can then be solved individually.", "en", "hard", 38),
    ("Learning a new skill takes time and dedication. Set realistic goals for yourself and track your progress. Celebrate small victories along the way.", "en", "easy", 35),
    ("Practice makes perfect. The more you type, the faster and more accurate you will become. Set aside time each day for typing practice.", "en", "easy", 28),
    ("Technology has changed the way we communicate. From emails to instant messaging, typing has become an essential skill in the modern world.", "en", "medium", 30),
]
cursor.executemany("INSERT INTO texts (content, language, difficulty, word_count) VALUES (?, ?, ?, ?)", sample_texts)
print(f"✅Added {len(sample_texts)} sample texts")
conn.commit()
conn.close()
print("\n✅Database created successfully!")
print(f"📍Database file location: {DB_PATH}")