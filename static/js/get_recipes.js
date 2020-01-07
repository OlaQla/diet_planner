/*jshint esversion: 6 */
$(document).ready(function () {
        
    // Navigate to recipe details view after clicking on card
    $(".card-group").click(function () {
        window.location.href = $(this).data("target");
    });


    // Handle search input
    $("#myInput").keyup(function () {
        var currentValue = $(this).val().toLowerCase().trim();

        // Get all cards
        var allCards = $("#cards-container").find(".card-group");

        // Remove display none from all cards
        allCards.show();

        // Filter cards that lowercase title don't start with search value
        var nonMatchingCards = allCards.filter(function () {
            var titleText = $(this).find(".card-title").text().toLowerCase().trim();
            return titleText.indexOf(currentValue) === -1;
        });

        // Set display none to all filtered cards
        nonMatchingCards.hide();
        
         // If there are no search results show relevant information
         if (nonMatchingCards.length === allCards.length) {
             $(".nothingFound").show();
            
         } else {
             $(".nothingFound").hide();
            
         }
    });
});
