console.log("Main Linked");

var restTemplate = $('script[data-id="restaurant-template"]').text();

$('main').on('click', function() {

});

getRestaurants();

function getRestaurants() {

    $.ajax({
        method: "GET",
        url: "/restaurants"
    }).done(function(restaurants) {
        var restaurantEls = restaurants.map(function(restaurant) {
            return Mustache.render(restTemplate, restaurant);
        })

        $('div[data-id="restaurant-row').append(restaurantEls);
    });
}

function postRestaurant(restaurantObj) {
    $.ajax({
        url: "/restaurants",
        method: "POST",
        data: restaurantObj
    }).done(function(data) {
        console.log(data);
    });
}

function deleteRestauraunt(id) {
    $.ajax({
        url: "/restaurants/" + id,
        method: "DELETE"
    }).done(function() {
        console.log("deleted")
    });
}

var restaurant = {
    name: "Chez Panisse",
    location: "Berkeley, CA",
    cuisine: "New American",
    image_url: "http://nationaleatlocalday.com/wp-content/uploads/2013/09/Chez-Panisse-Laurels-logo-lo-res.jpg"
}