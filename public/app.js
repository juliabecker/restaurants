console.log("Main Linked");

// Establish Global Variables
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

// Set Up Routes
var routes = {
    "/": showRestaurants,
    "/restaurant/:restaurant_id": showRestaurant,
    "/chart": showChart,
    "/about": showAbout
}


// Event Listeners
// Add New Restaurant Button Clicked - Display Form
$('main').on('click', '[data-action="add-restaurant"]', function(e) {
    $('#main-content').append(restFormTemplate);
    $('body').animate({
        scrollTop: $('footer').offset().top
    }, 500)
    $('input[data-attr="restaurant-name"]').focus();
});

// Add New Item Button Click - Display Form
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

// Submit New Restaurant Button Cilcked
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

// Submit New Item Button Clicked
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

function sortByKey(array, key) {
    return array.sort(function(a, b) {
        var x = a[key];
        var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0)) * -1;
    });
}

function showChart() {
    setMenuActiveState("chart");
    $('#main-content').empty();

    $('#main-content').append(chartTemplate);
    var ctx = $("#myChart").get(0).getContext("2d");

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



        // var data = [{
        //     value: topTenArray[0].revenue,
        //     color: "#F7464A",
        //     highlight: "#FF5A5E",
        //     label: topTenArray[0].name
        // }, {
        //     value: topTenArray[1].revenue,
        //     color: "#46BFBD",
        //     highlight: "#5AD3D1",
        //     label: topTenArray[1].name
        // }, {
        //     value: topTenArray[2].revenue,
        //     color: "#FDB45C",
        //     highlight: "#FFC870",
        //     label: topTenArray[2].name
        // },
        // {
        //     value: topTenArray[3].revenue,
        //     color: "#FDB45C",
        //     highlight: "#FFC870",
        //     label: topTenArray[3].name
        // }]; 
        // {
        //     value: topTenArray[4].revenue,
        //     color: "#FDB45C",
        //     highlight: "#FFC870",
        //     label: topTenArray[4].name
        // },
        // {
        //     value: topTenArray[5].revenue,
        //     color: "#FDB45C",
        //     highlight: "#FFC870",
        //     label: topTenArray[5].name
        // }
        // {
        //     value: topTenArray[6].revenue,
        //     color: "#FDB45C",
        //     highlight: "#FFC870",
        //     label: topTenArray[6].name
        // },
        // {
        //     value: topTenArray[7].revenue,
        //     color: "#FDB45C",
        //     highlight: "#FFC870",
        //     label: topTenArray[7].name
        // },
        // {
        //     value: topTenArray[8].revenue,
        //     color: "#FDB45C",
        //     highlight: "#FFC870",
        //     label: topTenArray[8].name
        // },
        // {
        //     value: topTenArray[9].revenue,
        //     color: "#FDB45C",
        //     highlight: "#FFC870",
        //     label: topTenArray[9].name
        // }];

        var options = {
                scaleFontFamily: 'Raleway, sans-serif',
                responsive: true,
                //Boolean - Whether the scale should start at zero, or an order of magnitude down from the lowest value
                scaleBeginAtZero: true,

                //Boolean - Whether grid lines are shown across the chart
                scaleShowGridLines: true,

                //String - Colour of the grid lines
                scaleGridLineColor: "rgba(0,0,0,.05)",

                //Number - Width of the grid lines
                scaleGridLineWidth: 1,

                //Boolean - Whether to show horizontal lines (except X axis)
                scaleShowHorizontalLines: true,

                //Boolean - Whether to show vertical lines (except Y axis)
                scaleShowVerticalLines: true,

                //Boolean - If there is a stroke on each bar
                barShowStroke: true,

                //Number - Pixel width of the bar stroke
                barStrokeWidth: 2,

                //Number - Spacing between each of the X value sets
                barValueSpacing: 5,

                //Number - Spacing between data sets within X values
                barDatasetSpacing: 1,

                //String - A legend template
                legendTemplate: "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].fillColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"

            }
        
        var myBarChart = new Chart(ctx).Bar(data, options);
    });
}


function showAbout() {
    setMenuActiveState("about");
    $('#main-content').empty();
    $('#main-content').append(aboutTemplate);

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

function showRestaurant(restaurant_id) {
    setMenuActiveState("restaurants");
    $('#main-content').empty();

    var $restaurantHtml;

    // GET & Display Restaurant Data
    $.ajax({
        url: "/restaurants/" + restaurant_id,
        method: "GET"
    }).done(function(restaurant) {
        $('#main-content').append(Mustache.render(restDetailTemplate, restaurant));
        // $('div[data-attr="restaurant-detail"]').append(Mustache.render(restDetailTemplate, restaurant));

        // $restaurantHtml = Mustache.render(restDetailTemplate, restaurant);

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

            // $(itemListContainer).append(itemEls);


            $('#main-content').append($(itemListContainer));


            $('div[data-attr="list-area"]').append(itemEls);
            $('div[data-attr="list-area"]').append($button);

            $('.stackable.item .image').dimmer({
                on: 'hover'
            });

            var $draggable = $('.draggable').draggabilly({
                axis: 'y',
                containment: $('div[data-attr="list-area"]'),
            })
        });

    });

}

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
        method: "PATCH",
        data: itemObj
    }).done(function(data) {
        console.log("item updated");
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


var router = Router(routes);

router.init('/');