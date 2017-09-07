

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// карта

var order_location = {};
function next_() {
    TweenLite.to("#order_step_1", 0.5, { opacity: 0, xPercent: -20, ease: Power2.easeInOut, onComplete: function onComplete() {
        TweenLite.set("#order_step_1", { display: "none" });
        TweenLite.set("#order_step_2", { display: "block" });
        TweenLite.fromTo("#order_step_2", 0.5, { opacity: 0, xPercent: 20 }, { opacity: 1, xPercent: 0 });
    } });
    console.log(order_location);
    order_build.change_state(1);
}

ymaps.ready(function () {
    var map;
    var placemark;
    var balloon_is_open;
    function add_click_event() {
        $("#order_step_1_button").click(function () {
            order_build.change_state(1);
        });
    }
    function createMap(state) {
        map = new ymaps.Map('map', state, { balloonPanelMaxMapArea: Infinity, suppressMapOpenBlock: true });
        map.options.set('yandexMapDisablePoiInteractivity', true);
        create_button();
        center = map.getCenter();
        if (!placemark) {
            placemark = new ymaps.Placemark(map.getCenter(), {
                panelMaxMapArea: 0,
                balloonContentBody: ['<div class="map_output">', '<div style="height: 120px; width: 100%">', '<p id="balloon_address" style="color: black" ></p>', '<input type="hidden" id="last_coordinates">', '<button id="order_step_1_button" onclick="(function(e){ next_() })(event)" class="user_button_reverse next"> Далее <i class="fa fa-arrow-right" aria-hidden="true"></i></button>', '</div>', '</div>'].join('')
            }, {
                draggable: true, // Метку можно перемещать.
                preset: 'islands#redDotIcon'
            });
            placemark.events.add('dragend', function (e) {
                // Получение ссылки на объект, который был передвинут.
                var thisPlacemark = e.get('target');
                // Определение координат метки
                var coords = thisPlacemark.geometry.getCoordinates();
                geo_code(coords
                         // и вывод их при щелчке на метке
                         //thisPlacemark.properties.set('balloonContent', address);

                        );
            });
            placemark.balloon.events.add('open', function (e) {
                geo_code(placemark.geometry.getCoordinates());
                balloon_is_open = 1;
            });
            placemark.balloon.events.add('close', function (e) {
                //geo_code(placemark.geometry.getCoordinates())
                balloon_is_open = 0;
                placemark.balloon.open(map.getCenter(), {}, { closeButton: false });
            });
            //placemark.balloon.options.setParent('panelMaxMapArea',  102030);
            //var searchControl = map.controls.get('searchControl');
            //searchControl.options.set('provider', 'yandex#publicMap')
            //map.controls.remove('searchControl')
            map.controls.remove('fullscreenControl');
            map.controls.remove('rulerControl');
            map.controls.remove('trafficControl');
            map.geoObjects.add(placemark);
            placemark.balloon.open(map.getCenter(), {}, { closeButton: false });
            /*
            var ass = map.controls.add(
                new ymaps.control.SearchControl({
                    options: {
                        provider: 'yandex#search',
                        useMapBounds: true,
                        noPlacemark: true,
                        noBalloon: true
                    }
                })
            );*/
            var searchControl = map.controls.get('searchControl');
            searchControl.options.set('useMapBounds', true);
            searchControl.options.set('noPlacemark', true);
            searchControl.options.set('noBalloon', true);

            console.log(searchControl);
            searchControl.events.add('resultshow', function (e) {
                console.log(searchControl.getResult(e.get('index')));
                var position = map.getCenter();
                geo_code(position);
                placemark.geometry.setCoordinates(position);
            }, this);
        } else {
            //placemark.
        }
        map.events.add('click', function (e) {
            var position = e.get('coords');
            geo_code(position);
            placemark.geometry.setCoordinates(position);
            //console.log("ADRES", address)
            //$( "#balloon_address" ).text( address );
            //console.log(placemark.balloon)
        });
        map.events.add('boundschange', function (e) {
            //placemark.geometry.setCoordinates(map.getCenter());
        });
        map.events.add('actiontick', function (e) {
            //placemark.geometry.setCoordinates(map.getCenter());
        });
        map.events.add('actiontickcomplete', function (e) {
            //console.log(e.get('tick').globalPixelCenter)
            //console.log(e.get('tick').zoom)
            //placemark.geometry.setGlobalPixelCenter(e.get('tick').globalPixelCenter,e.get('tick').zoom)
            //placemark.geometry.setCoordinates(map.getCenter());
        });
        placemark.events.add('click', function (e) {
            //console.log(e.get('tick').globalPixelCenter)
            //console.log(e.get('tick').zoom)
            //placemark.geometry.setGlobalPixelCenter(e.get('tick').globalPixelCenter,e.get('tick').zoom)
            //placemark.geometry.setCoordinates(map.getCenter());
            add_click_event();
        });
        $(".address_item p").click(function () {
            var coordinates = $(this).closest(".address_item").find("input").val();
            var position = coordinates.split(',');
            map.setCenter(position);
            geo_code(position);
            placemark.geometry.setCoordinates(position);
            $(".address").fadeOut(100);
        });
    }

    function geo_code(coord) {
        var myGeocoder = ymaps.geocode(coord);
        myGeocoder.then(function (res) {
            // Выведем в консоль данные, полученные в результате геокодирования объекта
            //console.log(res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.text)
            var aaa = res.geoObjects.get(0).properties.get('metaDataProperty').GeocoderMetaData.text;
            console.log(aaa);
            order_location['address'] = aaa;
            order_location['coordinates'] = coord.join(',');
            $("#balloon_address").text(aaa);
            $("#order_address_last").text(aaa);
            $("#last_coordinates").val(coord.join(','));
            $("#mark_favorite").remove();
            $("#balloon_address").after('<i id="mark_favorite" class="fa fa-star-o fa-2x" aria-hidden="true"></i>');

            $("#mark_favorite").click(function () {
                if ($(this).hasClass("fa-star-o")) {
                    $(this).removeClass("fa-star-o");
                    $(this).addClass("fa-star");
                } else {
                    $(this).removeClass("fa-star");
                    $(this).addClass("fa-star-o");
                }
            });

            if (balloon_is_open == 0) placemark.balloon.open(map.getCenter(), {}, { closeButton: false });
            return aaa;
        }, function (err) {
            alert("Ошибка кодирования");
            return undefined;
            // обработка ошибки
        });
    }

    function create_button() {
        console.log("START");
        var template = '<button id="order_step_1_button" onclick="(function(e){ next_() })(event)" class="user_button_reverse next"> Далее <i class="fa fa-arrow-right" aria-    hidden="true"></i></button>';
        var template_favorite = '<button id="map_favorite_button" class="user_button_reverse" style="font-size: 11px;"><i class="fa fa-star-o" aria-hidden="true"></i> Избранные адреса </button>';

        var c_o_n_1 = new ymaps.control.Button({
            data: {
                content: ""
            },
            options: {
                layout: ymaps.templateLayoutFactory.createClass(template_favorite)
                //maxWidth: '10
            } });
        c_o_n_1.events.add('click', function (e) {
            if ($(".address").is(":visible")) {
                $(".address").fadeOut(300);
            } else {
                $(".address").fadeIn(300);
            }
        });
        map.controls.add(c_o_n_1);
        
        console.log("end");
        /*
        var next_step = new ymaps.control.Button({
            data: {
                content: ""
            },
            options: {
                layout:
                ymaps.templateLayoutFactory.createClass(
                    template
                ),
                maxWidth: 300,
                float: "none",
                position: { left: 5, bottom: -5 }
            }})
        next_step.events.add('click', function(e) {
            next_()
        });
        map.controls.add(next_step);*/
        /*
        var c_o_n = new ymaps.control.Button({
        data: {
          content: ""
        },
        options: {
          layout:
            ymaps.templateLayoutFactory.createClass(
                template
            ),
          maxWidth: 200
        }})
        c_o_n.events.add('click', function(e) {
            placemark.geometry.setCoordinates(map.getCenter());
            geo_code(map.getCenter())
        });
        map.controls.add(c_o_n);
        */
    }

    ymaps.geolocation.get().then(function (res) {
        var mapContainer = $('#map'),
            bounds = res.geoObjects.get(0).properties.get('boundedBy'),

            // Рассчитываем видимую область для текущей положения пользователя.
            mapState = ymaps.util.bounds.getCenterAndZoom(bounds, [mapContainer.width(), mapContainer.height()]);
        createMap(mapState);
    }, function (e) {
        // Если местоположение невозможно получить, то просто создаем карту.
        createMap({
            center: [55.751574, 37.573856],
            zoom: 2
        });
    });

    var elem = $(".map_container"),
        elemPos = elem.offset().top - 66;

    TweenLite.to(window, 0.5, { scrollTo: elemPos, ease: Power2.easeInOut });
});

// ORDER ЗАКАЗ

var order = function () {
    function order() {
        _classCallCheck(this, order);

        this.state = 0;
    }

    _createClass(order, [{
        key: "change_state",
        value: function change_state(state) {
            var condition = this.check_step();
            if (!condition) {
                return;
            }

            if (state == "prev") {
                state = this.state - 1;
            }

            if (state == "next") {
                state = this.state + 1;
            }

            var old_step = "#order_step_" + (this.state + 1);
            var old_state = this.state;

            this.state = state;
            var new_step = "#order_step_" + (state + 1);

            if (old_step == new_step) {
                return;
            }

            var direction = 20;

            if (state < old_state) {
                direction = -20;
            }

            var elem = $("#order_step_description"),
                elemPos = elem.offset().top - elem.outerHeight();

            TweenLite.to(window, 0.5, { scrollTo: elemPos, ease: Power2.easeInOut });

            TweenLite.to($(old_step), 0.5, { opacity: 0, xPercent: -1 * direction, ease: Power2.easeInOut, onComplete: function onComplete() {
                TweenLite.set($(old_step), { display: "none" });
                TweenLite.set($(new_step), { display: "block" });
                TweenLite.fromTo($(new_step), 0.5, { opacity: 0, xPercent: direction }, { opacity: 1, xPercent: 0 });
            } });

            var progress = 1 / 3 * 100 * state + "%";

            TweenLite.to(".progress_line .fill", 0.5, { width: progress, onComplete: function onComplete() {

                $(".order_step_description").find(".step").removeClass("active");
                $(".order_step_description").find(".step").eq(state).addClass("filled active");
            } });
        }
    }, {
        key: "check_step",
        value: function check_step() {
            var step = this.state + 1;
            if (step == 1) {
                return true;
            }
            if (step == 2) {
                if ($(window).width() >= 800) {
                    try {
                        if (make_date() > max_date || make_date() < base_date) {
                            $(".date_mistake").css("color", "red");
                            $(".date_mistake").text("Пожалуйста, выберите дату в течение ближайшего месяца");
                            return false;
                        } else {
                            return true;
                        }
                    } catch (e) {
                        return true;
                    }
                }
                return true;
            }
            if (step == 3) {
                return true;
            }
            if (step == 4) {
                return true;
            }
        }
    }]);

    return order;
}();

var order_build = new order();

$(".number").click(function () {
    var parent = $(this).parent();
    if (parent.hasClass("step_0")) {
        order_build.change_state(0);
    }
    if (parent.hasClass("step_1")) {
        order_build.change_state(1);
    }
    if (parent.hasClass("step_2")) {
        order_build.change_state(2);
    }
    if (parent.hasClass("step_3")) {
        order_build.change_state(3);
    }
});

$(".order_button_navigation").find(".prev").click(function (e) {
    e.preventDefault();
    order_build.change_state("prev");
});

$(".order_button_navigation").find(".next").click(function (e) {
    e.preventDefault();
    order_build.change_state("next");
}

                                                  // все необходимые переменные 


                                                 );var order_time = $("#order_time").val();
var order_date = $("#day").val();
var make_date, base_date, max_date;

if ($(window).width() >= 800) {
    $("#day").after('<input type="text" id="day1">');
    $("#day").remove();
    $("#day1").attr("id", "day");
    $("#day").val($("#date_now").val());

    if ($('#day').length > 0) {
        jQuery.datetimepicker.setLocale('ru');

        $('#day').datetimepicker({
            timepicker: false,
            format: 'd.m.Y',
            minDate: base_date,
            maxDate: max_date,
            mask: true,
            validateOnBlur: true,
            closeOnWithoutClick: false

        });
    }

    make_date = function make_date() {
        var day = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : $("#day");

        var date = day.val();
        var date_arr = date.split(".");

        date = date_arr[2] + "-" + date_arr[1] + "-" + date_arr[0];

        return date = new Date(date);
    };

    base_date = make_date($("#date_now"));

    max_date = make_date($("#date_now"));
    max_date.setMonth(max_date.getMonth() + 1);
}

var order_products = {};

var order_comment = "";
var oil_type = $("#oil_type").text();
var oil_amount = 20;
var delivery_value = parseFloat($("#delivery_value").text());

var price = parseFloat($("#price_value").text());
var full_value = $("#FULL").val();
var full = 0;

// STEP 1

$("#order_step_1_button").click(function () {
    order_build.change_state(1);
});

// STEP 2

var change_total_price = function change_total_price() {

    var price_output = delivery_value + price * $("#number_value").val();
    price_output = price_output.toFixed(2);
    $("#total_value").text(price_output);
    oil_amount = $(".range_number").val();
    change_order_price();
};

$(".input_range").on('input', $(".input_range"), function () {
    var value = $(".input_range").val();

    $(".range_number").val(value);

    change_total_price();
});

$(".range_number").change(function () {
    var value = $(".range_number").val();

    if (value > $(this).attr("max")) {
        value = $(this).attr("max");
        $(this).val(value);
    }
    if (value < $(this).attr("min")) {
        value = $(this).attr("min");
        $(this).val(value);
    }

    $(".input_range").val(value);

    change_total_price();
});

$("#range_button").click(function (e) {
    e.preventDefault();
    if (!$(this).hasClass("active")) {
        $(".input_range").prop('disabled', true);
        $(".range_number").prop('disabled', true);
        $(this).addClass("active");
        oil_amount = 0;
        $("#total_value").text(full_value);
        order_products["FULL"] = 1;
        full = 1;
    } else {
        $(".input_range").prop('disabled', false);
        $(".range_number").prop('disabled', false);
        $(this).removeClass("active");
        delete order_products["FULL"];
        full = 0;
    }
    change_order_price();
});

var set_interval = function set_interval() {
    $.get("/order/get_free_intervals?date=" + $("#day").val(), function (data) {

        $("#order_time").empty();

        var models = data['data'];
        for (var i = 0; i < models.length; i++) {
            var option = "'<option value='" + models[i] + "'>" + models[i] + "</option>";
            $("#order_time").append(option);
        }

        order_time_last_change();
    });
};

var order_time_last_change = function order_time_last_change() {
    var time = $("#day").val() + " " + $("#order_time").val();
    $("#order_time_last").text(time);
};

$("#day").change(function () {
    set_interval();
    order_time_last_change();
});

$("#order_time").change(function () {
    order_time = $(this).val();
    order_time_last_change();
});

set_interval();

$("#order_step_2_button").click(function (e) {
    e.preventDefault();
    order_build.change_state(2);
});

// STEP 3

var change_order_price = function change_order_price() {
    if (full != 1) {
        var fuel_price = oil_amount * price + delivery_value;
    } else {
        var fuel_price = full_value;
    }

    var products = $(".product");

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = products[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var product = _step.value;

            var name = $(product).find(".product_name").text(),
                _price = parseFloat($(product).find(".product_price").text()),
                value = $(product).find(".product_value").val();
            fuel_price += _price * value;

            order_products[name] = value;

            if (value === "") {
                order_products[name] = 0;
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    $("#total_value_end").text(fuel_price);
};

$(".product_value").change(function () {
    change_order_price();
});

$('#order_step_3_button').click(function (e) {
    e.preventDefault();
    order_build.change_state(3);
});

$('#order_step_4_button').click(function (e) {

    e.preventDefault();

    function show_error(text) {
        $("#errors_output_4").css("opacity", "1");
        $("#errors_output_4").text(text);
    }

    var demand_fill = false;

    if (!$(".order_step_description").find(".step").eq(1).hasClass("filled")) {
        demand_fill = true;
        show_error("Заполните " + 2 + " шаг");
    }

    if (demand_fill) {
        return false;
    }

    var order_phone = $("#phone").val();

    order_date = $("#day").val();

    order_time = $("#order_time").val();
    var options = [];

    $(".additional_option").each(function () {
        if ($(this).find("input").is(":checked")) {
            options.push(parseInt($(this).find("input").attr("id")));
        }
    });

    var form_data = $(this).serialize();

    // добавление в избранное

    if ($("#mark_favorite").hasClass("fa-star")) {
        var favorite_address = $("#balloon_address").text();
        var favorite_coordinates = $("#last_coordinates").val();
        var house = " ";
        var object = { street: favorite_address, house: house, coordinates: favorite_coordinates };

        $.post("/profile/favorite/add/", {
            address: JSON.stringify(object)
        }).done(function (data) {
            if (data['status'] == 'ok') {
                console.log("ok");
            } else {
                show_error(data['mes']);
                console.log("not_ok");
            }
        }).fail(function () {
            show_error("Проверьте, правильно ли указан адрес!");
        });
    }

    // переход к платежу   

    $.post("/order/main/", {
        order_time: order_time,
        order_date: order_date,
        order_phone: order_phone,
        order_location: JSON.stringify(order_location),
        order_options: JSON.stringify(options),
        order_products: JSON.stringify(order_products),
        oil_type: oil_type,
        oil_amount: oil_amount
    }).done(function (data) {
        console.log("done");
        if (data['status'] == 'ok') {
            window.location.href = "/profile/cars";
            window.location.href = data['redir'];
        } else {
            show_error(data['mes']);
            console.log(data['mes']);
        }
    }).fail(function () {
        show_error('Серверная ошибка');
    });
    return false;
});

if ($(".map_container").length > 0) {

    $.get("/profile/favorite/get/", function (data) {

        var addresses = data['addresses'];

        for (var i = 0; i < addresses.length; i++) {
            $(".map_container .user_favorite_container").append('<div class="address_item" id="' + addresses[i].pk + '"><p>' + addresses[i].fields.street + ' ' + addresses[i].fields.house + '</p><input type="hidden" value="' + addresses[i].fields.coordinates + '"> <div class="icons"><i class="fa fa-times remove_favorite" aria-hidden="true"></i></div></div>');
        }

        $(".remove_favorite").click(function () {

            var item = $(this).closest(".address_item");

            $.post("/profile/favorite/delete/", {
                id: item.attr("id")
            }).done(function (data) {
                console.log("done");
                if (data['status'] == 'ok') {
                    TweenLite.to(item, 0.5, { opacity: 0, height: 0, padding: 0, margin: 0, onComplete: function onComplete() {
                        TweenLite.to(item, 0.5, { display: "none" });
                    } });
                } else {
                    console.log(data['mes']);
                    if (data['redir']) window.location.href = data['redir'];
                }
            }).fail(function () {
                console.log("error");
            });
        });
    });

    $(".exit_address").click(function () {
        $(".address").fadeOut(100);
    });
}

$(".order_cart").click(function () {
    var container = $(this).parent().find(".product_input_container");
    $(this).parent().find(".product_value").val(1);

    $(this).fadeOut(200, function () {
        TweenLite.set(container, { display: "flex" });
        TweenLite.from(container, 0.5, { opacity: 0 });
    });
});

$(".product_input_container .minus").click(function () {
    $(this).parent().find(".product_value").val(function (index, value) {
        if (value > 0) {
            return parseInt(value) - 1;
        } else {
            return parseInt(value);
        }
    });
    change_order_price();
});

$(".product_input_container .plus").click(function () {
    $(this).parent().find(".product_value").val(function (index, value) {
        if (value < 100) {
            return parseInt(value) + 1;
        } else {
            return parseInt(value);
        }
    });
    change_order_price();
});

$(".product_value").change(function () {
    if ($(this).val() > 100) {
        $(this).val(100);
    }
    if ($(this).val() < 0) {
        $(this).val(0);
    }
});
