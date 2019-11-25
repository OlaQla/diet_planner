import os
from flask import Flask, render_template, redirect, request, url_for
from flask_pymongo import PyMongo
from bson.objectid import ObjectId 

app = Flask(__name__)
#app.config["MONGO_DBNAME"] = 'task_manager'
MONGODB_URI = ""
app.config["MONGO_URI"] = MONGODB_URI

#mongo = PyMongo(app)

@app.route('/')
def diet_planner():
    return "Hello, World"

if __name__ == '__main__':
    app.run(host="localhost", port="5000", debug=True)