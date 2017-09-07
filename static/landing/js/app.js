

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
        if (!this.initialized) {

            if ($(window).outerWidth() > 800 && $(window).height() > 600) {

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
        }
        else {
            if ($(window).width() <= 800 || $(window).height() <= 600) {
                this.body.removeClass("no_scroll");
                this.sections.removeClass("section_full");

                TweenLite.set(this.sections, {yPercent:0});

                $(window).unbind("mousewheel DOMMouseScroll MozMousePixelScroll");
                this.initialized = false;

                let section = this.sections.eq(this.state);
                $(document).scrollTop(section.offset().top ); 
                $(".top_navigation").removeClass("black");
            }

        }
    }
    
    change_color(color="grey") {
        
        if (color == "blue") {
            new TWEEN.Tween( scene.background).to({
                r: 0,
                g: 0.57647059,
                b: 0.82745098
            }, 3000)
                .easing(TWEEN.Easing.Exponential.Out).start();
        }
        else if (color == "white") {
            new TWEEN.Tween( scene.background).to({
                r: 1,
                g: 1,
                b: 1
            }, 3000)
                .easing(TWEEN.Easing.Exponential.Out).start();
          
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
        
        

        
        if ( this.state == 4) {
            TweenLite.set("#my_canvas", {display:"block"});
            TweenLite.to("#my_canvas", 0.5, {opacity:1});
        }
        else {
            TweenLite.to("#my_canvas", 0.5, {opacity:0, onComplete: function() {
                TweenLite.set("#my_canvas", {display:"none"});
            }});
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
        
        if ( this.state == 2 || this.state == 3 ) {
            this.change_color("blue");
          
        }
        else if ( this.state == 4 || this.state == 5) {
            this.change_color("white");
    
        }
        else {
            this.change_color();
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
            TweenMax.staggerTo( ".section_6 .McKinsey, .section_6 .Kaspersky", 0.7, {delay:3/4*speed,y:0, opacity:1, ease:Power2.easeOut},0.2);
            
            TweenLite.set("#webgl_floor", {display:"block"});
            TweenLite.fromTo("#webgl_floor", 2, {opacity:0}, {opacity:1});
            create_circle(floor, floor_array,true);
        }
        else {
            TweenMax.staggerTo( ".section_6 .McKinsey, .section_6 .Kaspersky", 0.7, {y:-50, opacity:0, ease:Power2.easeOut},0.2);
            TweenLite.to("#webgl_floor", 1, {opacity:0, ease:Power2.easeInOut, onComplete:function() {
                TweenLite.set("#webgl_floor", {display:"none"});

            }});
            destroy_circle(floor);
            
        }
        
        
        $(".left_navigation").removeClass("black white");
        $(".left_navigation_button").removeClass("black white");
        $(".registration").removeClass("black white");

        if ( $(this.sections[this.state]).hasClass("section_white") ) {
            $(".left_navigation").addClass("white");
            $(".left_navigation_button").addClass("white");
            $(".registration").addClass("white");
            
        }
        else if ( $(this.sections[this.state]).hasClass("section_black") ) {
            $(".left_navigation").addClass("black");
            $(".left_navigation_button").addClass("black");
            $(".registration").addClass("black");
        }
       
        
        var const_padding = parseFloat($(".left_navigation .container").css("padding-top")) + $(".left_navigation").find(".point").eq(0).position().top;
        
        
        let height_for_line =  $(this.buttons[this.state]).index() * 70 + const_padding;
        
        console.log(height_for_line);
    
        
        TweenLite.to(this.transition_line,0.5, {y:height_for_line, ease:Power2.easeInOut});


    }
    
    get_state() {
        return this.state();
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


$(".left_navigation_button").click(function() {
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
});

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

$(".jury_item .photo").click(function() {
    if ( !$(this).hasClass("active") ) {
        $(".jury_item").removeClass("active");
        $(this).parent().addClass("active");
    }
    
})