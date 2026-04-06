import uuid

def generate_key():
    return str(uuid.uuid4())[:8].upper()