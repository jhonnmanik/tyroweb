import os
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-ganti-ini")
    SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(BASE_DIR, 'database', 'tyroweb.db')}"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    DEBUG = os.environ.get("DEBUG", "False") == "True"