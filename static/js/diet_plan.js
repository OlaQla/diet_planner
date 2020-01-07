/*jshint esversion: 6 */
$(document).ready(function () {
            
    // Create a map of recipes title to recipe object
    const recipesMap = new Map(recipes.map(r => [r.title, r]));
 
    // initialise search fields
    function clear_search(){
        const modal_meal_list = $("#modal_meals_list");
        modal_meal_list.find("#all_tags .active").removeClass("active");
        modal_meal_list.find("#myInput").val("");
        modal_meal_list.find(".recipe-sidebar").show();
    }

    // Create print view in a new window of data visible on active modal
    function print_modal() {
        var printwindow = window.open('', 'PRINT', 'height=400,width=600');

        printwindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" media="print"/></head><body onload="window.print(); window.close();">');
        printwindow.document.write($(".modal.show .modal-dialog").html());
        printwindow.document.write('</body></html>');

        printwindow.document.close(); // necessary for IE >= 10
        printwindow.focus(); // necessary for IE >= 10*/

        return true;
    }

    // Clear modal search fields when popup is closed by button click
    $("#close_modal_meals_list").click(function(){
        clear_search();
    });
    
    //print diet plan and shopping list
    $(".print_btn").click(function(){
        print_modal();
    });

    // Fill in list with all recipes

    // 1. Find with jquery element to put recipes to 
    const $recipesList = $("#recipes-list .row");

    // 2. For each in recipes add new html object (create with jQuery) to recipes list
    recipes.forEach(function (recipe) {
        const $newElem = $(`<div class="recipe-sidebar card inline-block col-md-4 p-0 mb-1" data-tags="${recipe.tags}">
                        <div class="card-body">
                                <h5 class="card-title rec-title text-center text-info">${recipe.title}</h5>
                        </div>
                            <img src="${recipe.image}" class="rec-image card-img-top rounded-bottom img-fluid max-width: 100%"> 
                        </div>`);
        
        // Add click handler to created element that would select it and place on meals list
        $newElem.click(function () {
            const $slideShowRecipe = $(".meal_carousel.chosen_meal");
            $slideShowRecipe.find(".slideShowRecipeTitle").text($(this).find(".rec-title").text());
            $slideShowRecipe.find(".slideShowRecipeImage").attr("src", $(this).find(".rec-image").attr("src"));
            $("#modal_meals_list").modal('hide');
            clear_search();
            $slideShowRecipe.removeClass("chosen_meal");
        });

        $recipesList.append($newElem);
    });

    // add selected recipe to carusel 
    $(".slideShowRecipeImage").click(function () {
        $(this).parents(".meal_carousel").addClass("chosen_meal");
    });

    // load all distinct tags from all recipes
    let distinctTags = new Set();
    recipes.forEach(function (recipe) {
        if (recipe.tags) {
            recipe.tags.forEach(function (tag) {
                distinctTags.add(tag);
            });
        }
    });

    // Populate tags list from distinct tags set
    Array.from(distinctTags).sort().forEach(function (tag) {
        $("#all_tags").append(`<h6 class="d-inline"><span class="tag badge badge-warning align-middle mr-1"><span class="tag_name">${tag}</span>
                    <button type="button" class="close_diet close pl-2" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </span>
            </h6>`);
    });

    // toggle tag in search and run search algorithm
    $(document).on("click", "#all_tags > h6", function () {
        $(this).toggleClass("active");
        filterCards();
    });

    // toggle tag in search using close button and run search algorithm 
    $(document).on("click", ".close_diet", function () {
        $(this).toggleClass("active");
        filterCards();
    });

    // Perform filtering based on selected tags and search input text
    function filterCards() {
        // Get current text in search field
        var currentValue = $("#myInput").val().toLowerCase().trim();

        // Get all cards
        var allCards = $("#recipes-list").find(".recipe-sidebar");

        // Remove display none from all cards
        allCards.show();

        // filtering tags
        const filteringTags = $("#all_tags .active .tag_name").map(function () {
            return String($(this).text());
        }).toArray();

        // Filter cards that lowercase title don't contain search value
        var nonMatchingCards = allCards.filter(function () {
            const titleText = $(this).find(".rec-title ").text().toLowerCase().trim();
            const tags = Array.from($(this).data("tags").split(","));

            return titleText.indexOf(currentValue) === -1 || (filteringTags && filteringTags.some(function (filterTag) {
                return !tags.some(tag => tag === filterTag);
            }));
        });


        // Set display none to all filtered cards
        nonMatchingCards.hide();

        // if there are no search results show info 
        if (nonMatchingCards.length === allCards.length) {
            $(".nothingFound_diet").show();

        } else {
            $(".nothingFound_diet").hide();

        }
    }

    // Run search when a key was pressed while focused on search box
    $("#myInput").keyup(function () {
        filterCards();
    });

    /*---------------------------Generate diet plan button----------------------*/

    // Prepare aggregated view of diet plan for printing
    $("#generate_diet_plan").click(function () {
        const $print = $("#print");
        $print.empty();

        // Render dishes grouped per day into print field
        $(".carousel-item").each(function (current_card) {
            $print.append(`<div class="row bg-warning p-3 border font-weight-bold">${$(this).find(".day-of-the-week").text()}</div>`);
            $print.append(`<div class="row titles p-2 border-top-0">
                    <div class="col-4 text-center p-1 font-weight-bold">Meal:</div>
                    <div class="col-4 text-center p-1 font-weight-bold">Ingredients List:</div>
                    <div class="col-4 text-center p-1 font-weight-bold">Steps:</div>
            </div>`);

            // Iterate over all categories for each day
            $(this).find(".category_name").each(function (category_index) {

                // Find selected dish name
                const dish_name = $(this).parents(".meal").find(`.slideShowRecipeTitle`).text();
                if (dish_name && dish_name.trim() !== "") {
                    // Get full recipe from map using recipe name as a key
                    const recipe = recipesMap.get(dish_name);

                    // Generate print view table from full recipe
                    const $row = $(`<div class="row"></div>`);
                    const $col1 = $(`<div class="col-md-4 nopadding ">
                                <div class="container">
                                    <div class="row  p-1 border-bottom border-top text-uppercase font-weight-bold">${$(this).text()}</div>
                                    <div class="row  p-1 text-info">${dish_name}</div>
                                    </div>
                            </div>`);
                    const $col2 = $(`<div class="col-4 col-md-4 border"></div>`);
                    const $col3 = $(`<div class="col-8 col-md-4 border"></div>`);
                    const $inglist = $(`<ul class="small ing_list"></ul>`);

                    // Insert ingredients into generated print view of a dish
                    recipe.ingredients.forEach(function (i) {
                        $inglist.append(`<li>${i.name}</li>`);
                    });

                    // Insert preparation steps into generated print view
                    const $steplist = $(`<ol class="small step_list"></ol>`);
                    if (recipe.recipe && Array.isArray(recipe.recipe)) {
                        recipe.recipe.forEach(function (step) {
                            $steplist.append(`<li>${step}</li>`);
                        });
                    }

                    // Conatenate all fields together
                    $col2.append($inglist);
                    $col3.append($steplist);
                    $row.append($col1);
                    $row.append($col2);
                    $row.append($col3);

                    // Append dishes in a day to print view
                    $print.append($row);
                }
            });

        });

    });


    /*--------------------------Generate shopping list button-------------------*/
    // Handle generating print view of a shopping list 
    $("#generate_shopping_list").click(function () {

        const $shopping_list = $(".shopping_list");
        $shopping_list.empty();

        // Empty aggregated view of all ingredients grouped by name
        let all_ingredients = new Map();

        $(".carousel-item").each(function (day_index) {
            $(this).find(".category_name").each(function (category_index) {

                // Find recipe name
                const dish_name = $(this).parents(".meal").find(`.slideShowRecipeTitle`).text();
                if (dish_name && dish_name.trim() !== "") {
                    
                    // Get full recipe from recipes map using recipe name as a key
                    const recipe = recipesMap.get(dish_name);

                    // For each ingredient in recipe
                    recipe.ingredients.forEach(i => {

                        // Get amount of ingredient
                        const floatAmount = parseFloat(i.amount);

                        // Check if aggregated view has the ingredient
                        if (all_ingredients.has(i.name)) {
                            // If it has it, and unit is the same sum existing value with current value 
                            if (all_ingredients.get(i.name).has(i.unit)) {
                                const newValue = all_ingredients.get(i.name).get(i.unit) + floatAmount;
                                all_ingredients.get(i.name).set(i.unit, newValue);

                            // Ingredient is not in aggregated view yet
                            } else {
                                
                                // Create new entry and set it's value to current value
                                all_ingredients.get(i.name).set(i.unit, floatAmount);
                            }
                        } else {
                            // Aggregated view doesn't have ingredient at all, create new per unit map
                            all_ingredients.set(i.name, new Map());
                            all_ingredients.get(i.name).set(i.unit, floatAmount);
                        }
                    });

                }
            });


        });

        // Once aggregated map is ready iterate over pairs name => unit_amount 
        for (const [name, unit_amount] of all_ingredients.entries()) {

            // For each triplet name, unit, amount create new entry in print view 
            for (const [unit, amount] of unit_amount.entries()) {
                $shopping_list.append(`<li class ="list-group-item">
                                        <div class="row">
                                            <div class="col-3">${name}</div>
                                            <div class="col-1">${amount}</div>
                                            <div class="col-1">${unit}</div>
                                            </div>
                                    </li>`);
            }
        }
    });
});
