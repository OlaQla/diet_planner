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


""" CRUD Category section """

@app.route('/get_categories')
def get_categories():
    all_categories = mongo.db.categories.find()
    return render_template ('get_categories.html', categories = all_categories)

@app.route('/delete_category/<category_id>')
def delete_category(category_id):
    mongo.db.categories.remove({'_id': ObjectId(category_id)})
    return redirect(url_for('get_categories'))

@app.route('/edit_category/<category_id>')
def edit_category(category_id):
    return render_template('edit_category.html',
    category=mongo.db.categories.find_one({'_id': ObjectId(category_id)}))
    
@app.route('/update_category/<category_id>', methods=['POST'])
def update_category(category_id):
    mongo.db.categories.update(
        {'_id': ObjectId(category_id)},
        {'name': request.form.get('new_name')})
    return redirect(url_for('get_categories'))

@app.route('/add_category')
def add_category():
    return render_template('add_category.html')

@app.route('/insert_category', methods=['POST'])
def insert_category():
    category_insert = {'name': request.form.get('new_category')}
    mongo.db.categories.insert_one(category_insert)
    return redirect(url_for('get_categories'))

""" CRUD Ingredients section """

@app.route('/get_ingredients')
def get_ingredients():
    all_ingredients = mongo.db.ingredients.find()
    return render_template ('get_ingredients.html', ingredients = all_ingredients)

@app.route('/delete_ingredient/<ingredient_id>')
def delete_ingredient(ingredient_id):
    mongo.db.ingredients.remove({'_id': ObjectId(ingredient_id)})
    return redirect(url_for('get_ingredients'))

if __name__ == '__main__':
    app.run(host="localhost", port="5000", debug=True)