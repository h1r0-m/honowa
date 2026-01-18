# housekeeping
import random # for random star coordinates
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel # used for data type checking

app = FastAPI() # creating web server for FastAPI engine

app.add_middleware(
    #installinng security bypass allowing frontend to connect to backend
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Confession(BaseModel): # to make sure the confession is a type string
    text: str
    # so because pydantic automatically converts the data coming in as a
    # class object, basically any object.text which is assigned to this class
    # should have type string, which is what is being enforced in the line above

    # in a way, the create_confession(confession: Confession) does:
    # confession = Confession(text = "something"), where confession is the class 
    # object of the class Confession, and text = "something" being a variable
    # associated to that class object, just automatically

confessions_db = []
# database for star data, contains dictionaries in the form:
# {"id": 1, "text": "some confession", "position", [2,5,-3]}

@app.get("/") # returning confirmation for connection
def read_root():
    return {"message": "honowa Systems Online"}

# when the url "-/stars" is accessed, thats when that function gets ran,
# not at the very start

@app.get("/stars")
def get_stars():
    return confessions_db

@app.post("/confess") # specific entrance called /confess for confessions
def create_confession(confession: Confession): # making sure confession is right type
    
    x = random.uniform(-10,10)
    y = random.uniform(-5,5)
    z = random.uniform(-5,5)

    new_star = {"id": len(confessions_db) + 1, 
                "text": confession.text, 
                "position": [x,y,z]}

    confessions_db.append(new_star)

    print(f"Received confession: {confession.text}") # to terminal
    return {"message": "Confession received via Deep Space Network", "star": new_star} # sending receipt back to frontend