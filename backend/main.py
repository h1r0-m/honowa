# housekeeping
import random # for random star coordinates
import json
import os
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

db_file = "stars.json" # file name for the data storage

def load_db():
    # for loading the database
    if not os.path.exists(db_file):
        return [] # if it doesnt exist, then just return nothing
    with open(db_file, "r") as f:
        return json.load(f) 

def save_db(data):
    # for saving data onto the database
    with open(db_file, "w") as f:
        json.dump(data, f, indent = 4)

def color_analysis(text): 
    # attaching colors to stars based off of whats written in the text
    text = text.lower()
    if ("sad" in text) or ("lonely" in text) or ("lost" in text):
        return "#4facfe" # blue
    elif ("angry" in text) or ("hate" in text) or ("mad" in text):
        return "#ff0844" # red
    elif ("love" in text) or ("happy" in text) or ("hope" in text):
        return "#fddb92" # gold
    else:
        return "#ff007f" # default is pink

confessions_db = load_db()
# database for star data, contains dictionaries in the form:
# {"id": 1, "text": "some confession", "position", [2,5,-3]}

@app.get("/") # returning confirmation for connection
def read_root():
    return {"message": "honowa Systems Online"}

# when the url "-/stars" is accessed, thats when that function gets ran,
# not at the very start

@app.get("/stars")
def get_stars():
    global confessions_db
    confessions_db = load_db() # for retrieving data from database
    return confessions_db

@app.post("/confess") # specific entrance called /confess for confessions
def create_confession(confession: Confession): # making sure confession is right type
    
    x = random.uniform(-10,10)
    y = random.uniform(-5,5)
    z = random.uniform(-5,5)

    star_color = color_analysis(confession.text)

    new_star = {"id": len(confessions_db) + 1, 
                "text": confession.text, 
                "position": [x,y,z],
                "color": star_color}

    confessions_db.append(new_star)

    save_db(confessions_db) # saving to database

    print(f"Received confession: {confession.text}") # to terminal
    return {"message": "Confession received via Deep Space Network", "star": new_star} # sending receipt back to frontend