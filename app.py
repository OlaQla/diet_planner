import os
from flask import Flask, render_template, redirect, request, url_for
from flask_pymongo import PyMongo
from bson.objectid import ObjectId 

app = Flask(__name__)
mongo_password = os.getenv("MONGO_PASSWORD")
MONGODB_URI = f"mongodb+srv://ola:{mongo_password}@myfirstcluster-wl3fx.mongodb.net/diet_planner"
app.config["MONGO_URI"] = MONGODB_URI

mongo = PyMongo(app)

@app.route('/')
def diet_planner():
    return "Hello, World"

@app.route('/categories')
def categories():
    all_categories = mongo.db.categories.find()
    return render_template ('categories_list.html', categories = all_categories)
    

if __name__ == '__main__':
    app.run(host="localhost", port="5000", debug=True)