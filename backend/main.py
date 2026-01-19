# housekeeping
import random # for random star coordinates
import json
import os
from dotenv import load_dotenv # for environmental variable
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel # used for data type checking
from motor.motor_asyncio import AsyncIOMotorClient # importing mongodb tools

load_dotenv()

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

# using environmental variable for safety
mongo_url = os.getenv("mongo_url")

client = AsyncIOMotorClient(mongo_url) # connecting to mongodb
db = client.honowa
stars_collection = db.stars # file within database where the star data lives

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

@app.get("/") # returning confirmation for connection
def read_root():
    return {"message": "honowa Systems Online"}

# when the url "-/stars" is accessed, thats when that function gets ran,
# not at the very start

@app.get("/stars")
async def get_stars():
    stars = await stars_collection.find().to_list(1000)
    """ getting 1000 stars for now"""

    cleaned_stars = [] # have to clean id here as well
    for star in stars:
        star["id"] = str(star["_id"]) # clean id
        del star["_id"] # deleting old one
        cleaned_stars.append(star)
    
    return cleaned_stars

@app.post("/confess") # specific entrance called /confess for confessions
async def create_confession(confession: Confession): # making sure confession is right type
    
    x = random.uniform(-10,10)
    y = random.uniform(-5,5)
    z = random.uniform(-5,5)

    star_color = color_analysis(confession.text)

    new_star = {"text": confession.text, 
                "position": [x,y,z],
                "color": star_color}

    result = await stars_collection.insert_one(new_star)
    """ saves new_star onto the db, but when using this command, it inserts
     an "_id" automatically associated to the dictionary new_star (on top of 
      the "text" とか "position"). that id is messy, and cannot be read by 
      react which is why we replcae it with a simpler id which is that id 
      converted into a string, or str(new_star["_id]). """

    new_star["id"] = str(new_star["_id"]) # adding new clean id entry

    del new_star["_id"] # deleting old one cuz its useless

    """ the whole point of doing this here, is because we have to send
     the new_star entry back to the frontend to then be projected onto
      the screen. this new_star entry must have a clean id that react
       can recognize, because react needs a distinct reac id
        asscoiated to each object """

    print(f"Received confession: {confession.text}") # to terminal
    return {"message": "Confession received via Deep Space Network", "star": new_star} # sending receipt back to frontend