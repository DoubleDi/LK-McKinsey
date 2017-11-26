

class full_height_landing_test {
    constructor() {
        this.sections = $("section");
        this.body = $("body");
        this.state = 0;
        this.max_state = $("section").length - 1;
        this.initialized = false;
        this.buttons = $(".left_navigation .item");
        this.block = false;
        this.first_time = true;
        this.scroll_time = 0;
        this.transition_line = $("#transition_line");
        this.chain_pass = true;
    }

    init() {

            if ( ($(window).outerWidth() > 800 && $(window).height() > 600) && !this.initialized ) {

                this.body.addClass("no_scroll");
                this.sections.addClass("section_full");

                let take = this;
                var timer_scroll;


                $(window).bind('mousewheel DOMMouseScroll MozMousePixelScroll', function(event) {

                    clearTimeout(timer_scroll);

                    if (take.scroll_time > 0) {
                        timer_scroll = setTimeout(function() { take.scroll_time = 0 }, 50);
                    }

                    if (take.scroll_time == 0) {


                        let delta = parseInt(event.originalEvent.wheelDelta || -event.originalEvent.detail);
                        if (delta >= 0) {
                            if (take.block == 0) {
                                take.go_up();
                                take.block = 1;
                                var timerId = setTimeout(function() { take.block = 0 }, 1000);
                            }
                        } else {
                            if (take.block == 0) {
                                take.go_down();
                                take.block = 1;
                                var timerId = setTimeout(function() { take.block = 0 }, 1000);
                            }
                        }

                    }

                    take.scroll_time += 1;

                });
                
                this.initialized = true;

                if (this.first_time) {
                    let href = location.hash;
                    if ( $("section").index($(href)) !== -1 ) {
                        this.state = $("section").index($(href));

                    }
                    this.first_time = false;
                }

                var sum = 10000;
                var index = 0;

                for (let i = 0; i < this.sections.length; i++) {
                    let ABS = Math.abs( $(this.sections[i]).offset().top -$(document).scrollTop());
                    if ( ABS < sum ) {
                        sum = ABS;
                        index = i;
                    }
                }

                this.state = index;


                this.buttons.click(function() {
                    let index = $(this).index();
                    take.state = index;
                    take.change_slide();

                });

                this.change_slide(0);

            }
            else {
                if ( ($(window).width() <= 800 || $(window).height() <= 600) && this.initialized ) {
                    this.body.removeClass("no_scroll");
                    this.sections.removeClass("section_full");

                    TweenLite.set(this.sections, {yPercent:0});

                    $(window).unbind("mousewheel DOMMouseScroll MozMousePixelScroll");
                    this.initialized = false;

                    let section = this.sections.eq(this.state);
                    $(document).scrollTop(section.offset().top ); 
                    $(".top_navigation").removeClass("black");

                    var speed = 1;


                    // ставим webgl-цепочку задником

                    TweenLite.set("#starForge_field", {display:"none"});

                    TweenLite.set("#circle_field", {display:"none"});
                     TweenLite.set("#webgl_floor", {display:"none"});

                    // проявляем все слайды
                    TweenLite.fromTo(".first_section .labels", 0.7, {y:100}, {delay:speed*3/4,y:0, ease:Power2.easeOut});
                    TweenLite.to(".first_section .labels", 0.5, {delay:speed*3/4, opacity:1});
                   
                    TweenMax.to( ".sliders .slide", 0.7, {delay:3/4*speed,y:0, opacity:1, ease:Power2.easeOut});
                    
                    TweenLite.fromTo("#svg_place_1 .icon", 0.5, {opacity:0, scale:0.3}, {delay:speed*3/4, ease:Power2.easeInOut, opacity:1,scale:1});
                    TweenLite.fromTo("#svg_place_1_circle", 0.5, {drawSVG:"0%"}, {delay:speed*3/4, drawSVG:"100%", ease:Power2.easeInOut});
                    TweenLite.fromTo(".section_4 .prize_slide", 0.7, {y:100}, {delay:speed*3/4,y:0, ease:Power2.easeOut});
                    TweenLite.to(".section_4 .prize_slide", 0.5, {delay:speed, opacity:1});
            

                    TweenMax.to( ".section_3 .main_container", 0.7, {delay:3/4*speed,top:0, opacity:1, ease:Power2.easeOut});
                    
                    TweenMax.staggerTo( ".section_3 .column", 0.7, {delay:3/4*speed,y:0, opacity:1, ease:Power2.easeOut},0.1);
                

                    TweenMax.to( ".section_5 .main_container", 0.7, {delay:3/4*speed,top:0, opacity:1, ease:Power2.easeOut});
                    
                    TweenMax.staggerTo( ".jury_item", 0.7, {delay:3/4*speed,y:0, opacity:1, ease:Power2.easeOut},0.1);
                    
                    
                    TweenMax.staggerTo( ".section_6 .McKinsey, .section_6 .Gett", 0.7, {delay:3/4*speed,y:0, opacity:1, ease:Power2.easeOut},0.2);                   
                   
                }
            }
        
    }
    
    change_color(color="grey") {

        $(".left_navigation").removeClass("black white");
        $(".left_navigation_button").removeClass("black white");
        $(".registration").removeClass("black white");

        if (color == "blue") {
            new TWEEN.Tween( scene.background).to({
                r: 0,
                g: 0.57647059,
                b: 0.82745098
            }, 3000)
                .easing(TWEEN.Easing.Exponential.Out).start();

            $(".left_navigation").addClass("white");
            $(".left_navigation_button").addClass("white");
            $(".registration").addClass("white");
        }
        else if (color == "white") {
            new TWEEN.Tween( scene.background).to({
                r: 1,
                g: 1,
                b: 1
            }, 3000)
                .easing(TWEEN.Easing.Exponential.Out).start();

            $(".left_navigation").addClass("black");
            $(".left_navigation_button").addClass("black");
            $(".registration").addClass("black");
          
        }
        else {
            new TWEEN.Tween( scene.background).to({
                r: 34/255,
                g: 38/255,
                b:  41/255
            }, 3000)
                .easing(TWEEN.Easing.Exponential.Out).start();
        }
        
        // Меняет цвет сетки
        if (color == "white")  {
            new TWEEN.Tween( grid.material.color ).to({
            r: 0,
            g: 0,
            b: 0
        }, 3000)
            .easing(TWEEN.Easing.Exponential.Out).start();
            
            new TWEEN.Tween( grid.material ).to({
                opacity:0.2
            }, 3000)
                .easing(TWEEN.Easing.Exponential.Out).start();
        }
        else {
            new TWEEN.Tween( grid.material.color ).to({
                r: 1,
                g: 1,
                b: 1
            }, 3000)
                .easing(TWEEN.Easing.Exponential.Out).start();
            
            new TWEEN.Tween( grid.material ).to({
                opacity:0.2
            }, 3000)
                .easing(TWEEN.Easing.Exponential.Out).start();
        }
        
        
    }


    go_up() {
        if (this.state != 0) {
            this.state -= 1;
        }
        this.change_slide();
    }

    go_down() {
        if (this.state !== this.max_state) {
            this.state += 1;
        }
        this.change_slide();
    }

    change_slide(speed = 1) {
        let height = this.state * $(window).height();  

        TweenLite.to(window, speed, {delay: 0.1, scrollTo:{y:height}, ease:Power2.easeInOut});
        
        this.buttons.removeClass("active");
        $(this.buttons[this.state]).addClass("active");
        
        if (this.state == 0) {
            new TWEEN.Tween(static_numbers).to({
                y: 300
            }, speed * 1000)
                .easing(TWEEN.Easing.Cubic.InOut).start();
        }
        else if (this.state == 1) {
            
            if ( $(".slider_navigation p.active").index() == 0 ) {
                    new TWEEN.Tween(static_numbers).to({
                        y: 200
                    }, speed * 1000)
                        .easing(TWEEN.Easing.Cubic.InOut).start();
            }
            else if ( $(".slider_navigation p.active").index()  == 1 ) {
                    new TWEEN.Tween(static_numbers).to({
                        y: 100
                    }, speed * 1000)
                        .easing(TWEEN.Easing.Cubic.InOut).start();
            }
            else if ( $(".slider_navigation p.active").index()  == 2 ) {
                    new TWEEN.Tween(static_numbers).to({
                        y: 0
                    }, speed * 1000)
                        .easing(TWEEN.Easing.Cubic.InOut).start();
            }
            else {
                new TWEEN.Tween(static_numbers).to({
                    y: 200
                }, speed * 1000)
                    .easing(TWEEN.Easing.Cubic.InOut).start();
            }
        }
        else if (this.state == 2) {
            new TWEEN.Tween(static_numbers).to({
                y: -100
            }, speed * 1000)
                .easing(TWEEN.Easing.Cubic.InOut).start();
        }
        
        
        if ( this.state == 0) {
            TweenLite.fromTo(".first_section .labels", 0.7, {y:100}, {delay:speed*3/4,y:0, ease:Power2.easeOut});
            TweenLite.to(".first_section .labels", 0.5, {delay:speed*3/4, opacity:1});
        }
        else {
            TweenLite.to(".first_section .labels", 0.7, {y:-100, ease:Power2.easeOut});
            TweenLite.to(".first_section .labels", 0.5, {opacity:0});
        }
        
        
        if ( this.state == 1) {
            //$(this.sections[2]).css("background", "#0093D3");
            TweenMax.to( ".sliders .slide", 0.7, {delay:3/4*speed,y:0, opacity:1, ease:Power2.easeOut});
        }
        else {
            TweenMax.to( ".sliders .slide", 0.7, {y:-50, opacity:0, ease:Power2.easeOut});
        }
        
        
        
        if (this.state == 3) {
            TweenLite.fromTo("#svg_place_1 .icon", 0.5, {opacity:0, scale:0.3}, {delay:speed*3/4, ease:Power2.easeInOut, opacity:1,scale:1});
            TweenLite.fromTo("#svg_place_1_circle", 0.5, {drawSVG:"0%"}, {delay:speed*3/4, drawSVG:"100%", ease:Power2.easeInOut});
            TweenLite.fromTo(".section_4 .prize_slide", 0.7, {y:100}, {delay:speed*3/4,y:0, ease:Power2.easeOut});
            TweenLite.to(".section_4 .prize_slide", 0.5, {delay:speed, opacity:1});
            create_circle(circle,circle_array);
            
            TweenLite.set("#circle_field", {display:"block"});
            TweenLite.to("#circle_field", 1, {scale: 1, opacity:1, ease:Power2.easeOut});
        }
        else {
            TweenLite.fromTo(".section_4 .prize_slide", 0.7,  {y:0}, {y:100, ease:Power2.easeOut});
            TweenLite.to(".section_4 .prize_slide", 0.5, {opacity:0});
            TweenLite.to("#svg_place_1 .icon", 0.5, {opacity:0, scale:0.3, ease:Power2.easeInOut});
            TweenLite.to("#svg_place_1_circle", 0.5, {drawSVG:"0%",ease:Power2.easeInOut});
            TweenLite.to("#circle_field", 1, {opacity:0, ease:Power2.easeInOut, onComplete:function() {
                TweenLite.set("#circle_field", {display:"none"});

            }});
            destroy_circle(circle);
            
        }
        
        // Появление и угасание цепочки
        if (this.state == 0 || this.state == 1 || this.state == 2) {
            TweenLite.set("#starForge_field", {display:"block"});
            TweenLite.to("#starForge_field", 1, {xPercent: 0, opacity:1, ease:Power2.easeOut});
            if ( this.chain_pass ) {
                create_circle(chain, chain_array);
                this.chain_pass = false;
            }
        }
        else {
            TweenLite.to("#starForge_field", 1, {opacity:0, ease:Power2.easeInOut, onComplete:function() {
                TweenLite.set("#starForge_field", {display:"none"});

            }});
            destroy_circle(chain);
            this.chain_pass = true;
        }

        // смена цвета фона
        
        if ( this.state == 2 || this.state == 3 ) {
            this.change_color("blue");
          
        }
        else if ( this.state == 4 || this.state == 5) {
            this.change_color("white");
    
        }
        else {
            this.change_color();
        }


        if ( this.state == 2 ) {
            //$(this.sections[2]).css("background", "#0093D3");
            TweenMax.to( ".section_3 .main_container", 0.7, {delay:3/4*speed,top:0, opacity:1, ease:Power2.easeOut});
            
            TweenMax.staggerTo( ".section_3 .column", 0.7, {delay:3/4*speed,y:0, opacity:1, ease:Power2.easeOut},0.1);
        }
        else {
            TweenMax.to( ".section_3 .main_container", 0.7, {top:-50, opacity:0, ease:Power2.easeOut});
            
            TweenMax.staggerFromTo( ".section_3 .column", 0.7, {y:0, opacity:1}, {y:-50, opacity:0, ease:Power2.easeOut},-0.1);
        }

        
        if ( this.state == 4) {
            //$(this.sections[2]).css("background", "#0093D3");
            TweenMax.to( ".section_5 .main_container", 0.7, {delay:3/4*speed,top:0, opacity:1, ease:Power2.easeOut});
            
            TweenMax.staggerTo( ".jury_item", 0.7, {delay:3/4*speed,y:0, opacity:1, ease:Power2.easeOut},0.1);
        }
        else {
            TweenMax.to( ".section_5 .main_container", 0.7, {top:-50, opacity:0, ease:Power2.easeOut});
            
            TweenMax.staggerFromTo( ".jury_item", 0.7, {y:0, opacity:1}, {y:-50, opacity:0, ease:Power2.easeOut},-0.1);
        }
        

        if ( this.state == 5) {
            //$(this.sections[2]).css("background", "#0093D3");
            TweenMax.staggerTo( ".section_6 .McKinsey, .section_6 .Gett", 0.7, {delay:3/4*speed,y:0, opacity:1, ease:Power2.easeOut},0.2);
            
            TweenLite.set("#webgl_floor", {display:"block"});
            TweenLite.fromTo("#webgl_floor", 2, {opacity:0}, {opacity:1});
            create_circle(floor, floor_array,true);
        }
        else {
            TweenMax.staggerTo( ".section_6 .McKinsey, .section_6 .Gett", 0.7, {y:-50, opacity:0, ease:Power2.easeOut},0.2);
            TweenLite.to("#webgl_floor", 1, {opacity:0, ease:Power2.easeInOut, onComplete:function() {
                TweenLite.set("#webgl_floor", {display:"none"});

            }});
            destroy_circle(floor);
            
        }
        
        
        var const_padding = parseFloat($(".left_navigation .container").css("padding-top")) + $(".left_navigation").find(".point").eq(0).position().top;
        
        
        let height_for_line =  $(this.buttons[this.state]).index() * 70 + const_padding;
        
        
        TweenLite.to(this.transition_line,0.5, {y:height_for_line, ease:Power2.easeInOut});
    }
    
    get_state() {
        return this.state;
    }

    get_init() {
        return this.initialized;
    }

    change_state(state) {
        if (state !== this.state) {
            this.state = state;
            this.change_slide();
        }
    }

}

var full_height_landing = new full_height_landing_test();

full_height_landing.init();

$(window).resize(function() {
    full_height_landing.init();
});

 $(window).scroll(function() {
    if ( !full_height_landing.get_init() ) {
        if ( $(window).scrollTop() <= $(".section_3").offset().top - 50 ) {
            full_height_landing.change_color();
        }
        else if ( $(window).scrollTop() > $(".section_3").offset().top - 50 && $(window).scrollTop() < $(".section_5").offset().top - 50 ) {
            full_height_landing.change_color("blue");
        }
        else if  ( $(window).scrollTop() >= $(".section_5").offset().top - 50 ) {
            full_height_landing.change_color("white");
        }
    }
    
});

function change_navigation_status() {
    if ( !$(".left_navigation").hasClass("opened") ) {
        $(".left_navigation").addClass("opened");
        $(".left_navigation_button").addClass("opened");
        TweenLite.to(".hidden_part", 0.5, {opacity:1, onComplete:function() {
            TweenLite.from(".hidden_part", 0.5, {opacity:1});
        }});
        
        TweenMax.staggerFromTo(".hidden_container a", 0.4, {x:-70, opacity:0}, {x:0, opacity:1}, 0.05);
        
        TweenLite.set(".dark_screen", {display:"block"} );
        TweenLite.to(".dark_screen", 0.5, {opacity:0.7} );
    }
    else {
        $(".left_navigation").removeClass("opened");
        $(".left_navigation_button").removeClass("opened");
        TweenLite.to($(".hidden_part"), 0.5, {opacity:0});
        
        
        TweenLite.to(".dark_screen", 0.5, {opacity:0, onComplete: function() {
            TweenLite.set(".dark_screen", {display:"none"} );
        }} );
    }
}


$(".hidden_part .hidden_container a").click(function() {
    if ( full_height_landing.get_init() ) {
        full_height_landing.change_state( $(this).index() );
    }
    
    change_navigation_status();
});


$(".left_navigation_button").click(function() {
    change_navigation_status();
});


// хз зачем это было нужно
/*
$(".sliders .slide").click(function() {
    if ( !$(this).hasClass("opened") ) {
        $(".sliders .slide").removeClass("opened");
        $(this).addClass("opened");
        if ($(this).index() == 0) {
            $(".slide_2").css("left", "50%");
        }
        else {
            $(".slide_2").css("left", "25%");
        }
        
    }
});
*/

$(".hidden_container a").hover(function() {
    TweenLite.to($(this), 0.3, {x:20})
}, function() {
    TweenLite.to($(this), 0.3, {x:0})
});


$(".slider_navigation p").click(function() {
    if ( !$(this).hasClass("active") ) {
        
        var remove_slide = $(".slider_navigation p.active").index() + 1;
        var remove_slide = ".sliders .slide_" + remove_slide; 
        
        $(".slider_navigation p").removeClass("active");
        $(this).addClass("active");
        
        var active_slide = $(this).index() + 1;
        active_slide = ".sliders .slide_" + active_slide;
        
        TweenLite.to(remove_slide, 0.3, {scale:1.15});
        TweenLite.to(remove_slide, 0.2, {scale:1.15, opacity:0, onComplete:function() {
            TweenLite.set(remove_slide, {display:"none"});
            TweenLite.set(active_slide, {display:"block"});
            TweenLite.fromTo(active_slide, 0.3, {opacity:0, scale:0.85}, {opacity:1, scale:1});
        }})
    }
    
    if ( $(this).index() == 0 ) {
        new TWEEN.Tween(static_numbers).to({
        y: 200
    }, 1000)
            .easing(TWEEN.Easing.Cubic.Out).start();
    }
    else if ( $(this).index() == 1 ) {
        new TWEEN.Tween(static_numbers).to({
            y: 100
        }, 1000)
            .easing(TWEEN.Easing.Cubic.Out).start();
    }
    else if ( $(this).index() == 2 ) {
        new TWEEN.Tween(static_numbers).to({
            y: 0
        }, 1000)
            .easing(TWEEN.Easing.Cubic.Out).start();
    }
});

$(".jury_item").click(function() {
    if ( !$(this).hasClass("active") ) {
        $(".jury_item").removeClass("active");
        $(this).addClass("active");
        var text = "Каждому под силу стать экспертом в области транспорта. Продемонстрируйте, на что вы способны и какие проблемы можете решить с помощью больших данных.";

        var position = $(this).find("h6").text();
        var name = $(this).find("h5").text();


        if (name == "Янир Идесис") {
            text = "Каждому под силу стать экспертом в области транспорта. Продемонстрируйте, на что вы способны и какие проблемы можете решить с помощью больших данных."
        }
        else if (name == "Евгений Бегельфор") {
            text = "Расскажите нам то, чего мы не знаем, подтвердив свои выводы данными. Ну и конечно, получайте удовольствие от мероприятия и играйте честно."
        }
        else if (name == "Владислав Дутов") {
            text = "Успех в хакатоне потребует от команд креатива, сильной аналитической базы, а также слаженной совместной работы. Будет крайне интересно узнать, какой из этих факторов окажется важнейшим!"
        }
        else if (name == "Евгений Устинов") {
            text = "Современный бизнес – это бизнес талантов. Но как проявляют себя настоящие таланты? Они больше не оцениваются на основании строк резюме или названиями должностей. Единственное настоящее измерение – это реальные достижения и крутые продукты, которые можно пощупать и которые создают реальную бизнес ценность. Хакатон – это одна из великолепных возможностей создать что-то интересное вместе со своей командой и тут же показать это рынку, в лице которого выступает другие команды и жюри."
        }
        else if (name == "Александр Аптекман") {
            text = 'Сейчас все говорят "data is the new oil". Как добывать эти данные и как с ними работать - мы решим в рамках хакатона.'
        }
        else if (name == "Максим Алексеев") {
            text = "Аналитика больших данных - все еще новая область. И зачастую лучший способ решить задачу или выделить лучших из лучших - собрать талантливых ребят в одном месте и позволить им свободно соревноваться между собой. Пусть результат и AUC определят победителей!"
        }
        else if (name == "Евгений Якушкин") {
            text = 'В Alibaba говорят, что "data is the blood of the new economy" и что мы не являемся e-commerce, а являемся "data company". Желаю огромного успеха всем участникам в покорении этой невероятно интересной и перспективной во всех отраслях новой экономики темы!'
        }

        /*
        $("#citate_wrapper").addClass("break");
        TweenLite.to("#change_citate", 1, {scrambleText:{text:text, chars:"01", delimiter:" ", tweenLength: false, revealDelay:0.5, speed:0.8}, onComplete:function(){
            $("#citate_wrapper").removeClass("break");
        }});
        */

        TweenLite.to(".jury_output", 0.2, {opacity:0, onComplete:function(){
            $("#change_citate").text(text);
            $("#change_position").text(position);
            $("#change_name").text(name);
            TweenLite.to(".jury_output", 0.2, {opacity:1});
        }
        });
    }

});


function csrf_function() {
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie != '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) == name + '=') {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }

    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
        beforeSend: function beforeSend(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
}

csrf_function();

$(document).ajaxStart(function() {
    TweenLite.set(".waiting_window", {
        display: "block"
    });
    TweenLite.fromTo(".waiting_window", 0.2, {
        scale: 0
    }, {
        scale: 1
    });
});

$(document).ajaxComplete(function() {
    TweenLite.fromTo(".waiting_window", 0.2, {
        scale: 1
    }, {
        scale: 0,
        onComplete: function() {
            TweenLite.set(".waiting_window", {
                display: "none"
            });
        }
    });
});



function show_input_error(input, text) {
    $(input).closest(".input_container").addClass("error");
    var error = $(input).closest(".input_container").find(".error_output");
    error.text(text);

    $(input).focusin(function() {
        $(input).closest(".input_container").removeClass("error");
    });
}

$("#accept_exit, #cancel_button").click(function() {
    $("#accept_button").off();
    TweenLite.to(".accept_background", 0.2, {
        opacity: 0
    });
    TweenLite.to(".accept_container", 0.2, {
        opacity: 0,
        y: 50,
        onComplete: function() {
            $(".accept_window").css("display", "none");
        }
    });
});

function show_warning(text, accept_function = function() {}) {
    $("#accept_button").off();
    $(".accept_window").css("display", "flex");
    TweenLite.to(".accept_window", 0.2, {
        opacity: 1
    });
    TweenLite.to(".accept_container", 0.2, {
        opacity: 1,
        y: 0
    });
    $(".accept_window .accept_text").html(text);
    $("#accept_button").click(accept_function); 
    $("#accept_button").click(function() {

        TweenLite.to(".accept_background", 0.2, {
            opacity: 0
        });
        TweenLite.to(".accept_container", 0.2, {
            opacity: 0,
            y: 50,
            onComplete: function() {
                $(".accept_window").css("display", "none");
            }
        });
    });
}


function show_popup_error(text, notice = false) {
    $("#popup_text").text(text);
    var time = 3;
    if (notice = true) {
        time = 4;
    }
    TweenLite.to(".popup_window", 0.3, {
        top: 0,
        onComplete: function() {
            var tween = TweenLite.to(".popup_window", 0.3, {
                top: -70
            });
            tween.delay(time);
        }
    });

    if (notice) {
        $('.popup_window').find(".inside_container").css("background", "#03bf6d");
    } else {

    }

}

function noscroll() {
  window.scrollTo( 0, 0 );
}

var position = 0;

function change_reg_screen_status() {

    if ( !full_height_landing.get_init() ) {
        var opacity_val = 1;
    }
    else {
        var opacity_val = .9;
    }

    var screen = $(".auth_screen");
    if ( screen.is(":visible") ) {
        if ( !full_height_landing.get_init() ) {
            $(window).scrollTop(position);
        }
        $("html,body").removeClass("no_scroll_better");
        

        TweenLite.to(".auth_screen .background, .intro_label, .intro_description", 0.2, {opacity:0});
        TweenLite.to(".auth_screen .form_main", 0.2, {opacity:0,y:30,onComplete:function(){
            TweenLite.set( screen, {display: "none"});
        }});



    }
    else {
         if ( !full_height_landing.get_init() ) {
             position = $(window).scrollTop();
            $("html,body").addClass("no_scroll_better");
        }
       
        TweenLite.set( screen, {display: "flex"});
        TweenLite.fromTo(".auth_screen .form_main", 0.2, {opacity:0,y:30}, {opacity:1, y:0});
        TweenLite.fromTo(".auth_screen .background, .intro_label, .intro_description", 0.2, {opacity:0}, {opacity:opacity_val});
    }
}

$("#open_registration, #close_registration, #static_reg_button").click(function() {
    change_reg_screen_status();
});

$("#timeline_reducer").click(function(){
    if ( !$("#timetable").hasClass("active") ) {
        $("#timeline_reducer").find("p").text("Описание этапа");
        TweenLite.to("#timeline_description", 0.2, {opacity:0, onComplete:function(){
            TweenLite.set("#timeline_description", {display:"none"});
            TweenLite.set("#timetable", {display:"block"});
            TweenLite.fromTo("#timetable", 0.2, {opacity:0}, {opacity:1});
            $("#timetable").addClass("active");
        }});
    }
    else {
        $("#timeline_reducer").find("p").text("Расписание");
        TweenLite.to("#timetable", 0.2, {opacity:0, onComplete:function(){
            TweenLite.set("#timetable", {display:"none"});
            TweenLite.set("#timeline_description", {display:"block"});
            TweenLite.fromTo("#timeline_description", 0.2, {opacity:0}, {opacity:1});
            $("#timetable").removeClass("active");
        }});
    }
});

$("#reg_password_confirm").focusin(function() {
    $(".input_container.hidden").removeClass("hidden");
});

//if ($('#reg_phone').length > 0) $('#reg_phone').mask('+7 (000) 000-0000');

$("#reg_button").click(function(e) {

    function isValidEmailAddress(emailAddress) {
        var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
        return pattern.test(emailAddress);
    }



    e.preventDefault();
    var email = $("#reg_email").val();
    var password = $("#reg_password").val();
    var password_confirm = $("#reg_password_confirm").val();


    var name = $("#reg_name").val();
    var phone = $("#reg_phone").val();

    var error = false;

    if (!(password.length > 0 && email.length > 0 && password_confirm.length > 0 && name.length > 0 && phone.length > 0)) {
        if (!email.length > 0) {
            show_input_error("#reg_email", "Вы не указали email");
        }
        if (!password.length > 0) {
            show_input_error("#reg_password", "Вы не задали пароль");
        }
        if (!password_confirm.length > 0) {
            show_input_error("#reg_password_confirm", "Вы не подтвердили пароль");
        }
        if (!name.length > 0) {
            show_input_error("#reg_name", "Вы не сообщили свое имя");
        }
        if (!phone.length > 0) {
            show_input_error("#reg_phone", "Вы не указали телефон");
        }
        error = true;
    }

    if (!isValidEmailAddress(email)) {
        show_input_error("#reg_email", "Некорректный email-адрес");
        error = true;
    }
    if (password.length < 8) {
        show_input_error("#reg_password", "Пароль должен состоять из минимум 8 символов");
        error = true;
    }
    if (password !== password_confirm) {
        show_input_error("#reg_password_confirm", "Пароли не совпадают");
        error = true;
    }

    /*
    if (phone.length < 17) {
        show_input_error("#reg_phone", "Неправильный номер");
        error = true;
    }
    */

    if (!error) {
        $.post("/participants/register", {
            email: email,
            password: password,
            password_confirm: password_confirm,
            name: name,
            last_name: name,
            phone_number: phone
        }).done(function(data) {
            console.log("done");
            if (data['status'] == 'ok') {
                show_popup_error("На указанный E-mail выслано письмо с подтверждением регистрации", true);
                change_reg_screen_status();
            } else {
                show_popup_error(data['message']);

            }
        }).fail(function() {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
        return false;
    }



});


