import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()
class Config:
    DIR=Path(__file__).resolve().parent.parent
    INTANCE_DIR=DIR/'instance'
    INTANCE_DIR.mkdir(exist_ok=True)
    DATABASE_PATH=INTANCE_DIR/'typing_game.db'
    SECRET_KEY=os.getenv('SECRET_KEY','dev-key')
    SQLALCHEMY_DATABASE_URI=f'sqlite:///{DATABASE_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS=False
    JWT_SECRET_KEY=os.getenv('JWT_SECRET_KEY','jwt-dev-key')