console.log("Main Linked");

// Establish Global Variables
var restTemplate = $('script[data-id="restaurant-template"]').text();
var restDetailTemplate = $('script[data-attr="restaurant-detail-template').text();
var restFormTemplate = $('script[data-attr="restaurant-form"]').text();
var listTemplate = $('script[data-id="list-template"]').text();

// Set Up Routes
var routes = {
    "/": showRestaurants,
    "/restaurant/:restaurant_id": showRestaurant,
    "/about": showAbout
}

// Event Listeners
$('main').on('click', '[data-action="add-restaurant"]', function(e) {
    $('main').append(restFormTemplate);
});

$('main').on('click', '[data-action="restaurant-post"]', function(e) {
    var $form = $(this).parents('div[data-attr="restaurant-post-form"]');
    var nameInput = $form.find('[data-attr="restaurant-name"]').val();
    var locationInput = $form.find('[data-attr="restaurant-location"]').val();
    var cuisineInput = $form.find('[data-attr="restaurant-cuisine"]').val();
    var imageInput = $form.find('[data-attr="restaurant-image"]').val();

    var restaurantObj = {
        name: nameInput,
        location: locationInput,
        cuisine: cuisineInput,
        image_url: imageInput
    };

    postRestaurant(restaurantObj)
    showRestaurants();

})



function showRestaurants() {
    emptyMain();

    $.ajax({
        method: "GET",
        url: "/restaurants"
    }).done(function(restaurants) {
        var restaurantEls = restaurants.map(function(restaurant) {
            return Mustache.render(restTemplate, restaurant);
        })
        var $button = $("<button data-action='add-restaurant' type='submit' class='ui button'>Add New Restaurant</button>");

        $('div[data-attr="restaurant-row"]').append(restaurantEls);
        $('div[data-attr="button-row"]').append($button);


        // <div class="row">
        //     <button data-action="add-restaurant" type="submit" class="ui button">Add New Restaurant</button>
        // <div>

    });
}

// function showRestaurant(id) {
//     console.log(id);
// }

function showAbout() {

}

function postRestaurant(restaurantObj) {
    $.ajax({
        url: "/restaurants",
        method: "POST",
        data: restaurantObj
    }).done(function(data) {
        // Hide form
        $('div[data-attr="restaurant-post-form"]').empty();
    });
}

function deleteRestauraunt(id) {
    $.ajax({
        url: "/restaurants/" + id,
        method: "DELETE"
    }).done(function() {
        console.log("restaurant deleted")
    });
}

function showRestaurant(restaurant_id) {

    emptyMain();

    $.ajax({
        url: "/restaurants/" + restaurant_id,
        method: "GET"
    }).done(function(restaurant) {
        $('div[data-attr="restaurant-detail"]').append(Mustache.render(restDetailTemplate, restaurant));
    });



    $.ajax({
        url: "/items?restaurant_id=" + restaurant_id,
        method: "GET"
    }).done(function(items) {
        var itemEls = items.map(function(item) {
            return Mustache.render(listTemplate, item);
        })

        $('div[data-attr="list-area"]').append(itemEls);
    });
}

function postItem(itemObj) {
    $.ajax({
        url: "/items",
        method: "POST",
        data: itemObj
    }).done(function() {
        console.log("item added")
    });
}

function emptyMain() {
    $('div[data-attr="restaurant-row"]').empty();
    $('div[data-attr="restaurant-detail"]').empty();
    $('div[data-attr="button-row"]').empty();
    $('div[data-attr="list-area"]').empty();
    $('div[data-attr="restaurant-form"]').empty();

}

var item = {
    restaurant_id: 3,
    name: "Plum Galette",
    price: 14,
    order_count: 0,
    image_url: "http://cafefernando.com/images/plumgalette.jpg"
}


var router = Router(routes);

// router.init();
router.init('/');

// showRestaurants();