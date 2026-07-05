import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '../server/.env'))

def get_db():
    uri = os.environ.get('MONGO_URI')
    if not uri:
        # Default fallback for local dev if not set
        uri = 'mongodb://localhost:27017/spendwise'
    
    client = MongoClient(uri)
    db = client.get_database()
    return db
