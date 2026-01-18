# housekeeping
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

@app.get("/") # returning confirmation for connection
def read_root():
    return {"message": "honowa Systems Online"}

@app.post("/confess") # specific entrance called /confess for confessions
def create_confession(confession: Confession): # making sure confession is right type
    print(f"Received confession: {confession.text}") # to terminal
    return {"message": "Confession received via Deep Space Network"} # sending receipt back to frontend