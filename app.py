import os
from flask import Flask, flash, render_template, redirect, request, url_for, Response
from flask_pymongo import PyMongo
from bson.objectid import ObjectId 
import boto3
import json

app = Flask(__name__)
mongo_password = os.getenv("MONGO_PASSWORD")
MONGODB_URI = f"mongodb+srv://ola:{mongo_password}@myfirstcluster-wl3fx.mongodb.net/diet_planner"
app.config["MONGO_URI"] = MONGODB_URI
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024

mongo = PyMongo(app)

if not os.path.exists("./uploads"):
    os.makedirs("./uploads")

@app.route('/')
@app.route('/diet_planner')
def diet_planner():
    return render_template ('main.html')


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
    all_categories = mongo.db.categories.find()
    return render_template('edit_category.html',
    category=mongo.db.categories.find_one({'_id': ObjectId(category_id)}), categories = all_categories)
    
@app.route('/update_category/<category_id>', methods=['POST'])
def update_category(category_id):
    mongo.db.categories.update(
        {'_id': ObjectId(category_id)},
        {'name': request.form.get('new_name'),
        'sort_index': int(request.form.get('sort-index'))})
    return redirect(url_for('get_categories'))

@app.route('/add_category')
def add_category():
    return render_template('add_category.html')

@app.route('/insert_category', methods=['POST'])
def insert_category():
    category_insert = {'name': request.form.get('new_category'), 'sort_index': int(request.form.get('sort-index'))}
    mongo.db.categories.insert_one(category_insert)
    return redirect(url_for('get_categories'))

""" CRUD Ingredients section """

@app.route('/get_ingredients')
def get_ingredients():
    all_ingredients = mongo.db.ingredients.find().sort('name', 1)
    return render_template ('get_ingredients.html', ingredients = all_ingredients)

@app.route('/delete_ingredient/<ingredient_id>')
def delete_ingredient(ingredient_id):
    mongo.db.ingredients.remove({'_id': ObjectId(ingredient_id)})
    return redirect(url_for('get_ingredients'))

@app.route('/edit_ingredient/<ingredient_id>')
def edit_ingredient(ingredient_id):
    
    return render_template('edit_ingredient.html',
        ingredient=mongo.db.ingredients.find_one({'_id': ObjectId(ingredient_id)}))

@app.route('/update_ingredient/<ingredient_id>', methods=['POST'])
def update_ingredient(ingredient_id):
    mongo.db.ingredients.update(
        {'_id': ObjectId(ingredient_id)},
        {'name': request.form.get('new_name'),
         'unit': request.form.get('new_unit')})
    return redirect(url_for('get_ingredients'))

@app.route('/add_ingredient')
def add_ingredient():
    return render_template('add_ingredient.html')

@app.route('/insert_ingredient', methods=['POST'])
def insert_ingredient():
    ingredient_insert = {'name': request.form.get('new_ingredient'),
                         'unit': request.form.get('new_ingredient_unit')}
    mongo.db.ingredients.insert_one(ingredient_insert)
    return redirect(url_for('get_ingredients'))

""" CRUD Recipe section """

@app.route('/get_recipes')
def get_recipes():
    all_recipes = mongo.db.recipies.find()
    return render_template ('get_recipes.html', recipes = all_recipes)
             
@app.route('/add_recipe')
def add_recipe():
    all_categories = mongo.db.categories.find()
    all_ingredients = mongo.db.ingredients.find().sort("name", 1)
    all_units = mongo.db.units.find()
    return render_template('add_recipe.html', categories = all_categories, ingredients = all_ingredients, units = all_units)

@app.route('/insert_recipe', methods=['POST'])
def insert_recipe():
    print(request.json)
    mongo.db.recipies.insert_one(request.json)
    return ('', 200)


@app.route('/view_recipe/<recipe_id>')
def view_recipe(recipe_id):
    return render_template('view_recipe.html',
    recipe=mongo.db.recipies.find_one({'_id': ObjectId(recipe_id)}))

@app.route('/delete_recipe/<recipe_id>')
def delete_recipe(recipe_id):
    mongo.db.recipies.remove({'_id': ObjectId(recipe_id)})
    return redirect(url_for('get_recipes'))

@app.route('/edit_recipe/<recipe_id>')
def edit_recipe(recipe_id):
    all_categories = mongo.db.categories.find()
    all_ingredients = mongo.db.ingredients.find().sort("name", 1)
    all_units = mongo.db.units.find()
    return render_template('add_recipe.html', categories = all_categories, ingredients = all_ingredients, units = all_units, existing_recipe=mongo.db.recipies.find_one({'_id': ObjectId(recipe_id)}))

def upload_to_s3(filename):
    s3 = boto3.client('s3')
    print(f"uploading file {filename}")
    response = s3.upload_file(filename, "diet.planner", os.path.basename(filename), ExtraArgs={'ACL': 'public-read'})

    return response    

@app.route('/add_image', methods=['POST'])
def add_image():
    f = request.files['image']
    f.save(os.path.join("./uploads", f.filename))
    upload_to_s3(f"./uploads/{f.filename}")
    return('', 200)


@app.route('/update_recipe/<recipe_id>', methods=['POST'])
def update_recipe(recipe_id):
    mongo.db.recipies.update(
        {'_id': ObjectId(recipe_id)}, request.json)
    return ('', 200)


""" Diet planner """

@app.route('/diet_plan')
def diet_plan():
    all_categories = list(mongo.db.categories.find())
    all_categories.sort(key=lambda c: c['sort_index'])
    all_recipes = mongo.db.recipies.find({}, {"_id": False})
    
    return render_template('diet_plan.html', categories = all_categories, recipes= list(all_recipes) )

""" Images """

@app.route('/images')
def all_images():
    s3=boto3.resource("s3")
    bucket=s3.Bucket("diet.planner")
    location = boto3.client("s3").get_bucket_location(Bucket="diet.planner")["LocationConstraint"]

    data = map(lambda image: "https://s3-%s.amazonaws.com/%s/%s" % (location, "diet.planner", image.key), bucket.objects.all())
    return Response(
        json.dumps(list(data)), 
        headers = { "Content-Type": "application/json"})
   

   
if __name__ == '__main__':
    app.run(host="localhost", port="5000", debug=True)