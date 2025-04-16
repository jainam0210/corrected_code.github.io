from pydantic import BaseModel

class Item(BaseModel): #Put Base model here
    name: str
    description: str

class User(BaseModel):
    username: str
    bio: str
    
    # You can raise your hands and give the answer to the chocolate question
