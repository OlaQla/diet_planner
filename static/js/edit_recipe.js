$(document).ready(function () {

    // Populate existing tags list 
    tags.forEach(function (tag) {
        $("form").find("#tag_list").append(`<h5><span class="badge badge-warning align-middle mr-1"><span>${tag}</span>
                        <button type="button" class="close pl-2" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </span>
                </h5>`)
    })

    // Populate existing ingredients
    ingredients.forEach(function (i) {
        $("form").find("#ingredients_list").append(`<li>
            <div class="row">
                <div class="col-4 col-md-2">${i.name}</div>
                <div class="col-3 col-md-1">${i.unit}</div>
                <div class="col-3 col-md-2">${i.amount}</div>
                <div class="col-1 col-md-2"><i class="delete_ingredient fa fa-minus b_minus text-danger"></i></div>
            </div></li>`)
    })

    // Populate existing steps 
    steps.forEach(function (step) {
        $("#steps_list").append(`
                    <div class="row">
                        <p class="col-1">${$("#steps_list").children().length}.</p>
                        <textarea class="form-control col-9 col-md-6" id="steps_label" name="new_recipe" rows="3">${step}</textarea>
                        <i class="remove_step fa fa-minus b_minus text-danger col-1"></i>
                    </div>`)
    });

});
