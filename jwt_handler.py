from flask_jwt_extended import create_access_token,decode_token
from datetime import timedelta

def create_token(user_id,username):
    access_token=create_access_token(
        identity={'id':user_id,'username':username},expires_delta=timedelta(days=1))
    return access_token

def verify_token(token):
    try:
        decoded=decode_token(token)
        return decoded.get('sub'),None
    except Exception as e:
        return None,str(e)