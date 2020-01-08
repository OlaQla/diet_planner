/*jshint esversion: 6 */
$(document).ready(function () {

    // Load images URL with Ajax and populate images list
    $.get("/images", function (data) {
        data.forEach(function (image) {
            $("#image_list").append(`<div class="col-4 p-0">
                                        <img src="${image}" alt="" class="card-img-top img-thumbnail rounded img-fluid max-width: 100%">
                                   </div>`);
        });
    });

    // Handle tag removal 
    $(document).on("click", ".close", function () { $(this).parents("h5").remove();
    });

    // Handle adding tag
    $("#add_tag_button").click(function () {
        const $tagInput = $("#tag_input");
        const tagName = String($tagInput.val())[0].toUpperCase() + String($tagInput.val()).slice(1).toLowerCase();
        const tagsList = $("#tag_list h5 > span > span").map(function (idx, item) {
            return item.textContent.trim();
        });

        // add tag only if currently doesn't exist
        if ($.inArray(tagName, tagsList) === -1) {
            $("#tag_list").append(`<h5><span class="badge badge-warning align-middle mr-1"><span>${tagName}</span>
                    <button type="button" class="close pl-2" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </span>
            </h5>`);
        }
        $tagInput.val("");
    });

    // Initially hide the image list
    $("#image_list").hide();

    // In 5s replace spinner with images list
    $("#image_list").delay(5000).fadeIn(500);
    $(".spinner-border").delay(5000).fadeOut();

    // Handle picking image from list and hide modal and putting to image preview
    $(document).on("click", "#image_list img", function () {
        const src = $(this).attr('src');
        $("#input_img_url").val(src);
        $('#modal_image_select').modal('hide');
        $("#image_preview").attr('src', src);
    });

    // Show image list when image preview is clicked
    $("#image_preview").click(function () {
        $('#modal_image_select').modal('show');
    });

    // Handle deleting ingredient
    $(document).on("click", ".delete_ingredient", function () {
        $(this).parents("li").eq(0).remove();
    });

    // Populate new ingredient data
    $("#add_ingredient").click(function () {
        const ingredient_name = $("#search_ingredient").val();
        const ingredient_unit = $("#search_unit").val();
        const ingredient_amount = $("#add_ingredient_amount").val();

        $("form").find("#ingredients_list").append(`<li class="list-unstyled">
            <div class="row">
                <div class="col-4 col-md-2">${ingredient_name}</div>
                <div class="col-3 col-md-1">${ingredient_unit}</div>
                <div class="col-3 col-md-2">${ingredient_amount}</div>
                <div class="col-1 col-md-2"><i class="delete_ingredient fa fa-minus b_minus text-danger"></i></div>
            </div>
                </li>`);
    });

    // Handling populating new step data
    $("#add_step").click(function () {
        $("#steps_list").append(`
                <div class="row">
                    <p class="col-1">${$("#steps_list").children().length}.</p>
                    <textarea class="form-control col-6 steps_label" name="new_recipe" rows="3"></textarea>
                    <i class="remove_step fa fa-minus b_minus text-danger col-1"></i>
                </div>`);
    });

    // Handle removing step
    $(document).on("click", ".remove_step", function () {
        $(this).parents(".row").remove();
        $("#steps_list .row:gt(0)").each(function (index) {
            $(this).find("p").text(`${index + 1}.`);
        });
    });


    // Handle uploading new image
    $("#upload_img").click(function () {
        let formdata = new FormData();
        const formfiles = $(this).siblings("input[type=file]").eq(0).prop('files');

        // check if any files were picked
        if (formfiles.length > 0) {
            const file = formfiles[0];

            // set image data in form
            formdata.append('image', file);
            // post data to backend
            $.ajax({
                url: postImageUrl,
                type: "POST",
                data: formdata,
                processData: false,
                contentType: false,
                enctype: 'multipart/form-data', 
            });
        }
    });


    // aggregate data into single structure to be sent to backend to persist in database
    $("#submit_button").click(function () {
        const ingredients = $("#ingredients_list").find("li").map(function () { return { name: $(this).children().eq(0).children().eq(0).text(), unit: $(this).children().eq(0).children().eq(1).text(), amount: $(this).children().eq(0).children().eq(2).text() }; });
        const steps = $("#steps_list").find(".row").map(function () {
            return $(this).find("textarea").val();
        });
        const tags = $("#tag_list h5 > span > span").map(function (idx, item) {
            return item.textContent.trim();
        });

        // object being sent to database
        const data = {
            title: $("form").find("input[name=new_title]").val(),
            recipe: steps.toArray(),
            image: $("#image_preview").attr('src'),
            servings: $("form").find("select[name=new_servings]").val(),
            category: $("form").find("select[name=category]").val(),
            prepare_time_minutes: $("form").find("select[name=new_minutes]").val(),
            prepare_time_hours: $("form").find("select[name=new_hours]").val(),
            ingredients: ingredients.toArray(),
            tags: tags.toArray()
        };

        // post data to backend and on success redirect to recipes list
        $.ajax({
            url: postRecipeUrl,
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(data),
            success: function () {
                window.location.href = recipesPageUrl;
            }
        });
    });
});