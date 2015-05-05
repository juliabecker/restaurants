console.log("Main Linked");

// HTML Templates
var restTemplate = $('script[data-id="restaurant-template"]').text();
var restDetailTemplate = $('script[data-attr="restaurant-detail-template').text();
var restFormTemplate = $('script[data-attr="restaurant-form"]').text();
var itemFormTemplate = $('script[data-attr="item-form"]').text();
var listTemplate = $('script[data-id="list-template"]').text();
var itemEditTemplate = $('script[data-attr="item-edit-modal"]').text();
var restaurantEditTemplate = $('script[data-attr="restaurant-edit-modal"]').text();
var aboutTemplate = $('script[data-attr="about-text"]').text();
var chartTemplate = $('script[data-attr="chart-template"]').text();
var restContainer = $('script[data-attr="all-restaurants-container"]').text();
var itemListContainer = $('script[data-attr="item-list-container"]').text();

// Options for Chart
var options = {
    scaleFontFamily: 'Raleway, sans-serif',
    responsive: true,
    scaleBeginAtZero: true,
    scaleShowGridLines: true,
    scaleGridLineColor: "rgba(0,0,0,.05)",
    scaleGridLineWidth: 1,
    scaleShowHorizontalLines: true,
    scaleShowVerticalLines: true,
    barShowStroke: true,
    barStrokeWidth: 2,
    barValueSpacing: 5,
    barDatasetSpacing: 1,
    legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
}

// Client-Side Routes
var routes = {
    "/": showRestaurants,
    "/restaurant/:restaurant_id": showRestaurant,
    "/chart": showChart,
    "/about": showAbout
}

// Initialize router
var router = Router(routes);
router.init('/');

// -------------------------- Event Listeners ---------------------------------

// Add New Restaurant Button Clicked - Display Form
$('main').on('click', '[data-action="add-restaurant"]', function(e) {
    $('#main-content').append(restFormTemplate);
    $('body').animate({
        scrollTop: $('footer').offset().top
    }, 500)
    $('input[data-attr="restaurant-name"]').focus();
});

// Add New Item Button Clicked - Display Form
$('main').on('click', '[data-action="add-item"]', function(e) {
    // Display Form with Restaurant ID
    var id = $(this).data("id");
    $('div[data-attr="list-area"]').append(Mustache.render(itemFormTemplate, {
        "restaurant_id": id
    }));
    $('body').animate({
        scrollTop: $('footer').offset().top
    }, 500)
    $('input[data-attr="item-name"]').focus();
});

// Submit New Restaurant Button Clicked - Save Restaurant
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

// Submit New Item Button Clicked - Save Item
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

// Item Edit Clicked - Display Edit Modal
$('main').on('click', '[data-attr="item-list-image"]', function(e) {

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
            onDeny: function() { // "Delete Item" Clicked
                deleteItem(id);
                showRestaurant(restaurant_id);
            },
            onApprove: function() { // "Submit Edits" Clicked
                putItem($(this));
                showRestaurant(restaurant_id);
            }
        })
        .modal('show')

});

// Restaurant Edit Clicked - Display Edit Modal
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
            onDeny: function() { // "Delete Restaurant" Button Clicked
                deleteRestauraunt(id);
                window.location = "/";
            },
            onApprove: function() { // "Submit Edits" Button Clicked
                putRestaurant($(this));
                showRestaurant(id);
            }
        })
        .modal('show')

});

// ----------------------------------- FUNCTIONS------------------------------

// Show all Restaurants
function showRestaurants() {
    setMenuActiveState("restaurants");
    $('#main-content').empty();

    $.ajax({
        method: "GET",
        url: "/restaurants"
    }).done(function(restaurants) {
        var restaurantEls = restaurants.map(function(restaurant) {
            return Mustache.render(restTemplate, restaurant);
        })
        var $button = $("<div class='centered row'><button data-action='add-restaurant' type='submit' class='ui button'>Add New Restaurant</button></div>");

        $('#main-content').append($(restContainer));
        $('div[data-attr="restaurant-row"]').append(restaurantEls);
        $('#main-content').append($button);

        $('.ui.card').dimmer({
            on: 'hover'
        });
    });
}

// Return array sorted by given key
function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0)) * -1;
    });
}

// Display chart Page
function showChart() {
    setMenuActiveState("chart");
    $('#main-content').empty();

    $('#main-content').append(chartTemplate);
    var ctx = $("#barChart").get(0).getContext("2d");

    $.ajax({
        url: "/items",
        method: "GET"
    }).done(function(items) {
        var revenueArray = items.map(function(item) {
            return {
                "id": item.id,
                "name": item.name,
                "restaurant_id": item.restaurant_id,
                "revenue": (parseInt(item.price) * parseInt(item.order_count))
            }
        });

        var sortedByRevenueArray = sortByKey(revenueArray, "revenue");
        var topTenArray = sortedByRevenueArray.slice(0, 10);
        console.log(topTenArray);

        var data = {
            labels: [topTenArray[0].name, topTenArray[1].name, topTenArray[2].name, topTenArray[3].name, topTenArray[4].name, topTenArray[5].name, topTenArray[6].name, topTenArray[7].name, topTenArray[8].name, topTenArray[9].name],
            datasets: [{
                label: "Top Ten Profitable Items",
                fillColor: "rgba(220,220,220,0.5)",
                strokeColor: "rgba(220,220,220,0.8)",
                highlightFill: "rgba(220,220,220,0.75)",
                highlightStroke: "rgba(220,220,220,1)",
                data: [
                    parseInt(topTenArray[0].revenue),
                    parseInt(topTenArray[1].revenue),
                    parseInt(topTenArray[2].revenue),
                    parseInt(topTenArray[3].revenue),
                    parseInt(topTenArray[4].revenue),
                    parseInt(topTenArray[5].revenue),
                    parseInt(topTenArray[6].revenue),
                    parseInt(topTenArray[7].revenue),
                    parseInt(topTenArray[8].revenue),
                    parseInt(topTenArray[9].revenue)
                ]
            }]
        };
        var myBarChart = new Chart(ctx).Bar(data, options);
    });
}

// Display About Page
function showAbout() {
    setMenuActiveState("about");
    $('#main-content').empty();
    $('#main-content').append(aboutTemplate);

}

// Add restaurant to database
function postRestaurant(restaurantObj) {
    $.ajax({
        url: "/restaurants",
        method: "POST",
        data: restaurantObj
    }).done(function() {
        console.log("restaurant added")
    });
}

// Delete restaurant from database
function deleteRestauraunt(id) {
    $.ajax({
        url: "/restaurants/" + id,
        method: "DELETE"
    }).done(function() {
        console.log("restaurant deleted")
    });
}

// Update restaurant in database
function putRestaurant(formObj) {
    var id = formObj.data("id");
    var name = formObj.find('[data-attr="restaurant-name"]').val();
    var location = formObj.find('[data-attr="restaurant-location"]').val();
    var cuisine = formObj.find('[data-attr="restaurant-cuisine"]').val();
    var image = formObj.find('[data-attr="restaurant-image"]').val();

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

// Display restaurant detail page (one restaurant w/ menu items)
function showRestaurant(restaurant_id) {
    setMenuActiveState("restaurants");
    $('#main-content').empty();

    // GET & Display Restaurant Data
    $.ajax({
        url: "/restaurants/" + restaurant_id,
        method: "GET"
    }).done(function(restaurant) {
        $('#main-content').append(Mustache.render(restDetailTemplate, restaurant));
        // Add dimmer to restaurant card
        $('.ui.card').dimmer({
            on: 'hover'
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
            $('#main-content').append($(itemListContainer));

            $('div[data-attr="list-area"]').append(itemEls);
            $('div[data-attr="list-area"]').append($button);
            // Add dimmer to item images
            $('.stackable.item .image').dimmer({
                on: 'hover'
            });
            // Items are draggable w/in container
            var $draggable = $('.draggable').draggabilly({
                axis: 'y',
                containment: $('div[data-attr="list-area"]'),
            });
        });

    });

}

// Update item in database
function putItem(formObj) {
    var id = formObj.data("id");
    var name = formObj.find('[data-attr="item-name"]').val();
    var price = formObj.find('[data-attr="item-price"]').val();
    var order_count = formObj.find('[data-attr="item-order-count"]').val();
    var image = formObj.find('[data-attr="item-image"]').val();

    var itemObj = {
        name: name,
        price: price,
        order_count: order_count,
        image_url: image
    }
    $.ajax({
        url: "/items/" + id,
        method: "PATCH", // Use PATCH because don't update restaurant_id
        data: itemObj
    }).done(function(data) {
        console.log("item updated");
    });
}

// Add new item to database
function postItem(itemObj) {
    $.ajax({
        url: "/items",
        method: "POST",
        data: itemObj
    }).done(function() {
        console.log("item added")
    });
}

// Delete item from database
function deleteItem(id) {
    $.ajax({
        url: "/items/" + id,
        method: "DELETE"
    }).done(function() {
        console.log("item deleted");
    });
}

// Set active states in menu
function setMenuActiveState(section) {
    switch (section) {
        case "restaurants":
            $('#restaurants-menu-item').addClass('active');
            $('#about-menu-item').removeClass('active');
            $('#chart-menu-item').removeClass('active');
            break;
        case "about":
            $('#about-menu-item').addClass('active');
            $('#restaurants-menu-item').removeClass('active');
            $('#chart-menu-item').removeClass('active');
            break;
        case "chart":
            $('#chart-menu-item').addClass('active');
            $('#restaurants-menu-item').removeClass('active');
            $('#about-menu-item').removeClass('active');
            break;
    }
}