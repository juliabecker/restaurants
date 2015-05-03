console.log("Main Linked");

// Establish Global Variables
var restTemplate = $('script[data-id="restaurant-template"]').text();
var restDetailTemplate = $('script[data-attr="restaurant-detail-template').text();
var restFormTemplate = $('script[data-attr="restaurant-form"]').text();
var itemFormTemplate = $('script[data-attr="item-form"]').text();
var listTemplate = $('script[data-id="list-template"]').text();
var itemEditTemplate = $('script[data-attr="item-edit-modal"]').text();
var restaurantEditTemplate = $('script[data-attr="restaurant-edit-modal"]').text();

// Set Up Routes
var routes = {
    "/": showRestaurants,
    "/restaurant/:restaurant_id": showRestaurant,
    "/about": showAbout
}

// Event Listeners

// Add New Restaurant Button
$('main').on('click', '[data-action="add-restaurant"]', function(e) {
    $('main').append(restFormTemplate);
});

// Add New Item Button
$('main').on('click', '[data-action="add-item"]', function(e) {

    // Attach restaurant_id to form & display
    var id = $(this).data("id");
    $('div[data-attr="list-area"]').append(Mustache.render(itemFormTemplate, {
        "restaurant_id": id
    }));
});

// Submit New Restaurant
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

});

// Submit New Item
$('main').on('click', '[data-action="item-post"]', function(e) {
    var $form = $(this).parents('div[data-attr="item-post-form"]');
    var nameInput = $form.find('[data-attr="item-name"]').val();
    var priceInput = $form.find('[data-attr="item-price"]').val();
    var orderCountInput = $form.find('[data-attr="item-order-count"]').val();
    var imageInput = $form.find('[data-attr="item-image"]').val();

    var restaurant_id = $form.data("restaurantid");

    var itemObj = {
        name: nameInput,
        price: priceInput,
        order_count: orderCountInput,
        image_url: imageInput,
        restaurant_id: restaurant_id
    };

    postItem(itemObj)
    showRestaurant(restaurant_id);

});

// Edit Image Click - Display Modal
$('main').on('click', '[data-attr="item-image"]', function(e) {

    //Clear Existing Modals From DOM
    $('div[data-attr="item-edit-modal"]').empty();
    $('div[data-attr="restaurant-edit-modal"]').empty();

    var $item = $(this).parents('div[data-attr="item"]');
    var id = $item.data("id");
    var name = $item.find('[data-attr="item-name"]').text();
    var price = $item.find('[data-attr="item-price"]').text();
    var order_count = $item.find('[data-attr="item-order-count"]').text();
    var image_url = $item.find('[data-attr="item-image-url"]').attr("src");
    var restaurant_id = $item.data("restaurantid");

    var itemObj = {
        id: id,
        name: name,
        price: price,
        order_count: order_count,
        image_url: image_url,
        restaurant_id: restaurant_id
    }

    $('main').append(Mustache.render(itemEditTemplate, itemObj));
    $('div[data-attr="item-edit-modal"]').modal('show');
    $('div[data-attr="item-edit-modal"]')
        .modal({
            onDeny: function() {
                deleteItem(id);
                showRestaurant(restaurant_id);
            },
            onApprove: function() {
                putItem($(this));
                showRestaurant(restaurant_id);
            }
        })
        .modal('show')

});

// Restaurant Card Click - Display Modal
$('main').on('click', '[data-attr="restaurant-card"]', function(e) {

    //Clear Existing Modals From DOM
    $('div[data-attr="restaurant-edit-modal"]').empty();
    $('div[data-attr="item-edit-modal"]').empty();

    var $restaurant = $(this);

    var id = $restaurant.data("id");
    var name = $restaurant.find('[data-attr="restaurant-name"]').text();
    var location = $restaurant.find('[data-attr="restaurant-location"]').text();
    var cuisine = $restaurant.find('[data-attr="restaurant-cuisine"]').text();
    var image_url = $restaurant.find('[data-attr="restaurant-image-url"]').attr("src");

    var restaurantObj = {
        id: id,
        name: name,
        location: location,
        cuisine: cuisine,
        image_url: image_url
    }

    $('main').append(Mustache.render(restaurantEditTemplate, restaurantObj));
    $('div[data-attr="restaurant-edit-modal"]')
        .modal({
            onDeny: function() {
                deleteRestauraunt(id);
                window.location = "/";
            },
            onApprove: function() {
                putRestaurant($(this));
                showRestaurant(id);
            }
        })
        .modal('show')

});

// Restaurant Name Update
// $('main').on('blur', '[data-attr="restaurant-name"]', function(e) {
//     var restaurantName = $(this).text();
//     var id = ($(this).parents('div[data-attr="restaurant"]')).data("id");

//     $.ajax({
//         url: "/restaurants/" + id,
//         method: "PATCH",
//         data: {
//             name: restaurantName
//         }
//     }).done(function(data) {
//         console.log('restaurant updated')
//     });
//     // patchUpdate(e, "restaurant", "name");
// });

// // Restaurant Location Update
// $('main').on('blur', '[data-attr="restaurant-location"]', function(e) {
//     var restaurantLocation = $(this).text();
//     var id = ($(this).parents('div[data-attr="restaurant"]')).data("id");

//     $.ajax({
//         url: "/restaurants/" + id,
//         method: "PATCH",
//         data: {
//             location: restaurantLocation
//         }
//     }).done(function(data) {
//         console.log('restaurant updated')
//     });
// });

// // Restaurant Cuisine Update
// $('main').on('blur', '[data-attr="restaurant-cuisine"]', function(e) {
//     var restaurantCuisine = $(this).text();
//     var id = ($(this).parents('div[data-attr="restaurant"]')).data("id");

//     $.ajax({
//         url: "/restaurants/" + id,
//         method: "PATCH",
//         data: {
//             cuisine: restaurantCuisine
//         }
//     }).done(function(data) {
//         console.log('restaurant updated')
//     });
// });

// // Item Name Update
// $('main').on('blur', '[data-attr="item-name"]', function(e) {
//     var itemName = $(this).text();
//     var id = ($(this).parents('div[data-attr="item"]')).data("id");

//     $.ajax({
//         url: "/items/" + id,
//         method: "PATCH",
//         data: {
//             name: itemName
//         }
//     }).done(function(data) {
//         console.log('item updated')
//     });
// });

// // Item Price Update
// $('main').on('blur', '[data-attr="item-price"]', function(e) {
//     var itemPrice = $(this).text();
//     var id = ($(this).parents('div[data-attr="item"]')).data("id");

//     $.ajax({
//         url: "/items/" + id,
//         method: "PATCH",
//         data: {
//             price: itemPrice
//         }
//     }).done(function(data) {
//         console.log('item updated')
//     });
//     // patchUpdate(e, "item", "price")
// });

// // Item Order Count Update
// $('main').on('blur', '[data-attr="item-order-count"]', function(e) {
//     var itemCount = $(this).text();
//     var id = ($(this).parents('div[data-attr="item"]')).data("id");

//     $.ajax({
//         url: "/items/" + id,
//         method: "PATCH",
//         data: {
//             order_count: itemCount
//         }
//     }).done(function(data) {
//         console.log('item updated')
//     });
//     // patchUpdate(e, "item", "price")
// });

// function patchUpdate(e, resource, key) {
//     var updatedValue = $(e.target).text();
//     var id = $(e.target).parents("div[data-attr='" + resource + "']").data("id");
//     var objKey = key.toString();
//     var dataObj = {objKey: updatedValue};
//     var url = "/" + resource + "s/" + id;

//     $.ajax({
//         url: url,
//         method: "PATCH",
//         data: dataObj
//     }).done(function(data) {
//         console.log("patch updated!")
//     });
// }

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
    });
}


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

function putRestaurant(formObj) {
    var id = formObj.data("id");
    var name = formObj.find('[data-attr="restaurant-name"]').val();
    var location = formObj.find('[data-attr="restaurant-location"]').val();
    var cuisine = formObj.find('[data-attr="restaurant-cuisine"]').val();
    var image = formObj.find('[data-attr="restaurant-image-url"]').attr("src");

    var restaurantObj = {
        id: id,
        name: name,
        location: location,
        cuisine: cuisine,
        image_url: image
    }
    $.ajax({
        url: "/restaurants/" + id,
        method: "PUT",
        data: restaurantObj
    }).done(function(data) {
        console.log("restaurant updated");
    });

}

function showRestaurant(restaurant_id) {

    emptyMain();

    // GET & Display Restaurant Data
    $.ajax({
        url: "/restaurants/" + restaurant_id,
        method: "GET"
    }).done(function(restaurant) {
        $('div[data-attr="restaurant-detail"]').append(Mustache.render(restDetailTemplate, restaurant));

        $('.ui.card').dimmer({
            on: 'hover'
        });
    });

    // GET & Display Restaurant Item Data
    $.ajax({
        url: "/items?restaurant_id=" + restaurant_id,
        method: "GET"
    }).done(function(items) {
        var itemEls = items.map(function(item) {
            return Mustache.render(listTemplate, item);
        });
        var $button = $("<div class='item'><button data-action='add-item' data-id='" + restaurant_id + "' type='submit' class='ui button'>Add Item</button></div>");

        $('div[data-attr="list-area"]').append(itemEls);
        $('div[data-attr="list-area"]').append($button);

        $('.stackable.item .image').dimmer({
            on: 'hover'
        });

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

function deleteItem(id) {
    $.ajax({
        url: "/items/" + id,
        method: "DELETE"
    }).done(function() {
        console.log("item deleted");
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

router.init('/');