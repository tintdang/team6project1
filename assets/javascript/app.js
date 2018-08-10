// javascript (Spoontacular Food API)

var database = firebase.database();   // variable for access firebase
var userPantry = [];    // array to hold food supplies in user's pantry

function getPantry() {
    $("#pantry-list").empty();
    var newFBitem;  // get newly added item from Firebas
    database.ref("/Pantry").on("child_added", function (snapshot) {
        var itemAppend = ""; // variable to hold item's HTML
        newFBitem = snapshot.val().inventoryItem;
        pantryItemId = snapshot.key;
        //console.log(pantryItemId);
        userPantry.push(newFBitem);
        itemAppend += "<div class='pantry-entry'>" + newFBitem + "&nbsp;";
        itemAppend += "<button type='button' class='btn btn-danger btn-sm' id='" + pantryItemId + "'>X</button></div><br>";
        $("#pantry-list").append(itemAppend);
    });

    console.log(userPantry);
}

function removePantryItem() {
    //console.log("Click");
    var foodItemID = $(this).attr("id");
    //console.log(foodItemID);
    database.ref("/Pantry").child(foodItemID).remove();
    getPantry();
}

function addInventory(event) {
    event.preventDefault();
    var addPantryItem = $("#pantry-input").val().trim();
    var validInput = /\w/.test(addPantryItem);
    if (validInput) {
        database.ref("/Pantry").push({
            inventoryItem: addPantryItem
        });
        $("#pantry-input").val("");
    }
    getPantry();
}

$(document).ready(function () {
    getPantry();
});

$("#submit").click(addInventory);

$("#pantry-input").keypress(function (event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if (keycode === 13) {
        addInventory(event);
    }
});

/**
 * Find recipes based on inventory items
 */

function getInventoryBasedRecipes() {
    var ingredientsList = userPantry.join(",");
    console.log(ingredientsList);

    var queryUrl = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/findByIngredients?";

    queryUrl += $.param({
        fillIngredients: false,
        ingredients: ingredientsList,
        limitLicense: false,
        number: 5,
        ranking: 1
    });

    return $.ajax({
        method: "GET",
        url: queryUrl,
        headers: {
            "X-Mashape-Key": mashapeKey,
            "Accept": "application/json"
        }
    });
}

function renderRecipe(recipe) {
    /**
    * <div data-id="recipe id">
    *  <img src="image url">
    *  <span>"Recipe Title"</span>
    *  <span>"Ingredients Used"</span>
    *  <span>"Missed Ingredients"</span>
    *  <span>"Likes"</span>
    * </div>
    */

   var recipeDiv= $("<div>")
       .attr("class", "recipeBox");


   var recipeImg = $("<img>")
       .attr("src", recipe.image)
       .attr("alt", "Recipe Image")
       .attr("class", "recipeImage");

   var recipeInfoDiv = $("<div>")
       .attr("data-id", recipe.id)
       .attr("class", "recipe");

   var titleSpan = $("<h5>").text(recipe.title);
        titleSpan.attr("class", "text-center") // Centers the title font
   var ingredientsUsedSpan = $("<p>").text("Ingredients Used: " + recipe.usedIngredientCount);
   var missedIngredientsSpan = $("<p>").text("Missed Ingredients: " + recipe.missedIngredientCount);
   var likesSpan = $("<p>").text("Likes: " + recipe.likes);
   


   recipeInfoDiv
       .append(titleSpan)
       .append(ingredientsUsedSpan)
       .append(missedIngredientsSpan)
       .append(likesSpan);
   
   recipeDiv
       .append(recipeImg)
       .append(recipeInfoDiv);

   $("#recipes-list").append(recipeDiv);
}


function populateRecipes(response) {
    response.forEach(renderRecipe);
}

function populateList(response) {
    // Distinguish ingredients we have in our pantry
    // and items that we need to buy

    // Display the items you need to buy
}

$("#shopping-list").click(function() {
    getRecipeList(id)
        .then(populateList);
});

$("#pantry-list").on("click", ".btn", removePantryItem);    // removes pantry item on click of its button

$(document).on("click", ".recipeImage", function(){
    console.log("recipeClicked")
    var id = $(this).attr("data-id");
    getShoppingListFromRecipe(id)

});

function getShoppingListFromRecipe(id){
    console.log(id);
    var queryUrl = "https://spoonacular-recipe-food-nutrition-v1.p.mashape.com/recipes/" + id + "/information?includeNutrition=false";

    return $.ajax({
        url: queryUrl,
        method: "GET",
        headers: {
            "X-Mashape-Key": mashapeKey,
            "Accept": "application/json"
        }

    });
}

function populateShoppingList(response){
    response.extendedIngredients.forEach(renderListItem);

}

function renderListItem(item){
    var ingredientDiv = $("<div>");
    var ingredientP = $("<p>").text(item.name);

    ingredientDiv.append(ingredientP);
    $("#shopping-list").append(ingredientDiv);
}

$("#get-fake-recipe").click(function() {
    mockRecipes.forEach(renderRecipe);
});

// $("#getRecipe").click(function() {
//     getInvetoryBasedRecipes()
//         .then(populateRecipes);
// });

