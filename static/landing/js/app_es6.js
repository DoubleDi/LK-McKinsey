$(document).ready(function($) {
    //csrf
    
    function csrf_function() {
        function getCookie(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
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
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });
    }
    
    csrf_function();
    
      
    if ($("#phone,#form2-text").length > 0) {
            $("#phone,#form2-text,#phone_middle").mask("+7 (999) 999-9999");

    }
    
    if ( $(".form1-text3").length > 0 ) {
        $(".form1-text3").mask("9");
    }
    

    if ( $("#gos1, #gos2").length > 0 ) {
        $("#gos1").mask("a999aa");
        $("#gos2").mask("99?9");

    }
    
    let regions = "01	02	102	03	103	04	05	06	07	08	09	10	11	12	13	113	14	15	16	116	716	17	18	19	21	121	22	23	93	123	24	84	88	124	25	125	26	126	27	28	29	30	31	32	33	34	134	35	36	136	37	38	85	138	39	91	40	41	42	142	43	44	45	46	47	48	49	50	90	150	190	750	51	52	152	53	54	154	55	56	57	58	59	81	159	60	61	161	62	63	163	64	164	65	66	96	196	67	68	69	70	71	72	73	173	74	174	75	80	76	77	97	99	177	197	199	777	78	98	178	79	82	83	86	186	87	89	92	94	95";
    
    
    let regions_arr = regions.split('	');
    
    var regions_set = new Set(regions_arr);
    
    console.log(regions_set.has("777"));



    //первая форма, работает норм
    $('#form1-button').click(function(){
        var a=$('#phone').val(); 
        var b=a.length;
        $('#massegAlert p').html('Ошибка, попробуйте еще раз');
        if(b==17){
            var phone="";      
            for (var i = 2; i < a.length; i++) {
                if(a[i]!='+'&a[i]!='-'&a[i]!=')'&a[i]!='('&a[i]!=' '){
                    phone=phone+a[i]
                }
            };  
            var form_data = $(this).serialize(); 
            $.post( "/auth/get_code/", {phone: phone })
                .done(function( data ) {
                if(data['status']=='ok'){
                    $("#form_middle").fadeOut(200);
                    $('#form2-text').fadeOut(200);
                    $('#form2-button').fadeOut(200);
                    $('#form1').fadeOut(200, function() { $('#form2').fadeIn(200)});
                    //setTimeout( "$('#form2').fadeIn(300)", 1000);
                } else {
                    $('#massegAlert').fadeIn(300);
                    setTimeout( "$('#massegAlert').fadeOut(300)", 3000);                     
                }
            });  
        } else {
            $('#form1').submit(function(){                   
                $('#massegAlert').fadeIn(300);
                setTimeout( "$('#massegAlert').fadeOut(300)", 3000);
            });
        }
        return false;
    });


    /*************************************************************************************/

    $('#form2-button').click(function(){
        var a=$('#form2-text').val();
        $('#phone').val(a);
        var b=a.length;
        $('#massegAlert p').html('Ошибка, попробуйте еще раз');
        if(b==17){
            var phone="";      
            for (var i = 2; i < a.length; i++) {
                if(a[i]!='+'&a[i]!='-'&a[i]!=')'&a[i]!='('&a[i]!=' '){
                    phone=phone+a[i]
                }
            }  
            var form_data = $(this).serialize();                   
            $.post( "/auth/get_code/", {phone: phone })
                .done(function( data ) {
                $('body,html').animate({scrollTop:0},800); 
                if(data['status']=='ok'){
                    $("#form_middle").fadeOut(200);
                    $('#form1').fadeOut(300);
                    $('#form2-button').fadeOut(300);
                    setTimeout( "$('#form2').fadeIn(300)", 1000);
                }else{
                    $('#massegAlert').fadeIn(300); 
                    setTimeout( "$('#massegAlert').fadeOut(300)", 3000);
                }
            });  
            return false; 
            $('#form1').fadeOut(300);
            setTimeout( "$('#form2').fadeIn(300)", 1000);              
        } else {
            //  $('#cont3_form').submit(function(){               
            //return false;   
            //});
            //  $('#massegAlert').fadeIn(300);
            //  setTimeout( "$('#massegAlert').fadeOut(300)", 3000);
        }
        return false; 
    });

    /******************************************************************************************/




    /*Проверка кода инпуты для кода*/
    $('#form2 .form1-text3:eq(0)').keyup(function(event){
        if (event.which ==  8) {
        
        }
        else if (event.which >= 48 && event.which <= 57) {
            setTimeout("$('.form1-text3:eq(1)').focus()",100);
        }
    });

    $('#form2 .form1-text3:eq(1)').keyup(function(event){
        if (event.which ==  8) {
            setTimeout("$('.form1-text3:eq(0)').focus()",100);
        }
        else if (event.which >= 48 && event.which <= 57) {
            setTimeout("$('.form1-text3:eq(2)').focus()",100);
        }
       
    });

    $('#form2 .form1-text3:eq(2)').keyup(function(event){
        if (event.which ==  8) {
            setTimeout("$('.form1-text3:eq(1)').focus()",100);
        }
        else if (event.which >= 48 && event.which <= 57) {
            setTimeout("$('.form1-text3:eq(3)').focus()",100);
        }
        
    });
    
    $('#form2 .form1-text3:eq(3)').keyup(function(event){
        if (event.which ==  8) {
            setTimeout("$('.form1-text3:eq(2)').focus()",100);
        }

    });


    /*Проверка кода и отправка кода */
    var form2_error=3;
    $('#button_2').click(function(){
        var cod="";
        var namber=$('.form1-text').val();
        var codTrue="";
        var j=$('.form1-text3').length;
        for(var i=0;i<j;i++){
            cod=cod+$('.form1-text3:eq('+i+')').val();
        }
        var phone="";
        for (var i = 2; i < namber.length; i++) {
            if(namber[i]!='+'&namber[i]!='-'&namber[i]!=')'&namber[i]!='('&namber[i]!=' '){
                phone=phone+namber[i]
            }
        }  
        $.post( "/auth/check_code/", { code: cod, phone: phone })
            .done(function( data ) {
            csrf_function();
            if (data['status'] == 'ok') {
                if (data['redir']) {
                    window.location.href = data['redir'];
                    return false;
                }

                $('#footer_reg').fadeOut(300);
                $('#header_reg').fadeOut(300,function() { $('#header_form3_content').fadeIn(300);
                                                        });          
                //перебор марок
                let brands_dict = data['brands'];
                let brands = Object.keys(brands_dict);
                brands = brands.sort();
                for (let i=0; i < brands.length; i++) {
                    $('#marka').append("<option>"+brands[i]+"</option>");
                }
                //перебор моделей при выборе марки
                $("#marka").change(function() {
                    if (this.selectedIndex == 0)
                        $('#model').fadeOut(200);
                    else
                        $('#model').fadeIn(200);
                    $('#model').find('option').remove().end()
                    let model_array = brands_dict[$('#marka').val()];
                    for (let j=0; j < model_array.length; j++){
                        $('#model').append("<option>"+model_array[j]+"</option>");
                    }
                });

                //перебор цветов
                let colors_dict = data['colors']
                let colors_rus = Object.keys(colors_dict)
                for (let i=0; i < colors_rus.length; i++) {

                    $('#color').append("<option>" + colors_rus[i] +"</option>");
                }

            } else {
                if (data['redir']) {
                    window.location.href = data['redir'];
                    return false;
                }
                if (data['attempts']) {
                    let attempt = data['attempts'].toString();
                    $("#attempt_number").text(attempt);
                } else {
                    $(".left_attempts").html(data['mes']);
                }
                $(".left_attempts").css("opacity", "1");
            } 
        })
            .fail(function() {
            $(".left_attempts").css("opacity", "1");
            $('.left_attempts').html('Серверная ошибка');
        })
        return false;

    });

    $('#form3_block3_button1').click(function(e) {
        e.preventDefault();
        var name = $('#header_form3_name').val();
        var sername = $('#header_form3_name2').val();
        var email = $('#header_form3_email').val();
        var car_brand = $('#marka').val();
        var car_model = $('#model').val();
        var car_number = $('#gos1').val().toUpperCase();
        var car_region = $('#gos2').val();
        var car_color = $('.header_forma3-color').val();
        
        var ssss = $('#marka').val();
        
        let fuel_buttons = $("#header_form3").find(".input_fuel");
        
        var oil_type = "";
        
        function show_error(text) {
            $("#errors_output").css("opacity", "1");
            $("#errors_output").text(text);
        }

        for (var i = 0; i < fuel_buttons.length; i++) {
                if ( $(fuel_buttons[i]).hasClass("active") ) {
                    oil_type = $(fuel_buttons[i]).attr("id");
                }
        }
        
        console.log(oil_type);
        
        function validateEmail(email) {
            let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z    ]{2,}))$/;
            return re.test(email);
        }
        
        if (! validateEmail(email)) {
           show_error('Неверный email');
            return false
        }
        
        if ( !regions_set.has(car_region) ) {
            console.log("wrong!");
            show_error("Неправильно указан регион в номере!");
            return false;
        }
        
        if (!(name.length
              && sername.length
              && email.length 
              && car_brand != 'Марка автомобиля' 
              && car_model.length
              && car_region.length
              && car_color != 'Цвет'
              && car_number.length
             && oil_type.length)) {

            show_error('Заполните правильно все поля!');
            return false
        }
        var form_data = $(this).serialize();
        $.post( "/auth/make_profile/", {
            name:name, 
            sername:sername, 
            email:email, 
            car_brand:car_brand, 
            car_model:car_model, 
            car_number:car_number, 
            car_region:car_region, 
            car_color:car_color, 
            oil_type:oil_type 
        })
            .done(function( data ) {
            console.log("done");
            if (data['status'] == 'ok') {
                window.location.href = "/profile/cars";
            } else {
                show_error(data['mes']);
                if (data['redir'])
                    window.location.href = data['redir'];
            }
        })
            .fail(function() {
            show_error('Серверная ошибка');
        })
        return false;
    });
    
    //средняя форма
    $('#form_middle_button').click(function(e){
        e.preventDefault();
        let value = $("#phone_middle").val();
        $("#phone").val(value);
        $('#form1-button').trigger('click');
        
        if (full_height_landing.get_init()) {
            full_height_landing.change_state(0);
        }
        else {
            TweenLite.to(window, 1, {scrollTo:0, ease:Power2.easeInOut});
        }
    });

    
    const EXTENDED_ITEMS = document.getElementsByClassName("extended_item");


    if (document.getElementsByClassName("top_navigation").length > 0) 
    {

        $(document).scroll(function()  {
            
            if (!full_height_landing.get_init()) {
                if ($(this).scrollTop() == 0) {
                    $(".top_navigation").removeClass("scrolled");
                } else if ($(this).scrollTop() > 0) {
                    $(".top_navigation").addClass("scrolled");
                }
            }

           
        });
    }



    $(".extended_item").click(function() {
        let height = $(this).find(".extended_item_content").find("p").outerHeight();
        $(this).parent().find(".extended_item_content").height(0);
        $(this).find(".extended_item_content").height(height);
    });

    if ($(".extended_item").length > 0) {

        EXTENDED_ITEMS[0].click();
        EXTENDED_ITEMS[3].click();
    }

    const SLIDES = $(".slide");
    let currentSlide = 0;

    TweenLite.set(SLIDES.filter(":gt(0)"), {
        left: "100%"
    });


    $(".indicator").click(function() {
        let index = $( this ).index();
        change_slide(index);

    });

    function change_slide(target) {
        TweenLite.to("#slide_text", 0.5, {opacity:0, onComplete: function(){
            $("#slide_text").html("Пока Вы спите, работаете, в кино, делаете маникюр — <br><b>Ваш автомобиль уже заправлен и готов к новым делам</b>");
            TweenLite.to("#slide_text", 0.5, {opacity:1});
        }});


        TweenLite.to(SLIDES.eq(currentSlide), 1, {
            left: "-100%"
        });

        currentSlide = target;

        TweenLite.fromTo(SLIDES.eq(currentSlide), 1, {
            left: "100%"
        }, {
            left: "0px"
        });

        $(".indicator").removeClass("active");
        $(".indicator").eq(currentSlide).addClass("active");

        let new_target = currentSlide;

        if (currentSlide < SLIDES.length - 1) {
            new_target++;
        } else {
            new_target = 0;
        }


        TweenMax.killDelayedCallsTo(change_slide);
        TweenLite.delayedCall(4, change_slide, [new_target]);
    }



    class navigation {
        constructor(top_navigation, left_bar) {
            this.top_navigation  = top_navigation;
            this.left_bar = left_bar;
            this.state = 0;
        }


        init() {

            let help_function_href = (e, this_name) => {
                let path = false;

                if ( $(".vertical_navigation").length > 0 ) {
                    path = full_height_landing.get_init();
                }

                const href = $(this_name).attr("href");
                
                if (href[0] == "#") {
                    history.pushState(null, null, href);
                    e.preventDefault();
                    if (!path) {

                        let elem = $(href),
                        elemPos = elem.offset().top;

                        TweenLite.to(window, 1, {scrollTo:elemPos, ease:Power2.easeInOut});
                    }
                    else {
                        let state = $("section").index($(href));
                        full_height_landing.change_state(state);
                    }

                }

            }
            
            let take = this;
            this.top_navigation.find("#top_navigation_button").click(function () {
               
                take.change_state();
                
                
            });

            $(document).click(function(event) { 
                if( !$(event.target).closest(".left_navigation").length && !$(event.target).closest(take.top_navigation).length ) {
                    if ( take.left_bar.hasClass("opened") ) {
                        take.close_bar();
                    }
                }        
            })
            
            
            /*
            // хаммер для свайпа
            // get a reference to an element
            var stage = document.getElementsByClassName("left_navigation")[0];

            // create a manager for that element
            var mc = new Hammer.Manager(stage);

            // create a recognizer
            var swipe = new Hammer.Swipe();

            // add the recognizer
            mc.add(swipe);

            // subscribe to events
            mc.on('swipeleft', function (e) {
                console.log("yeah");
                if ( take.left_bar.hasClass("opened") ) {
                    take.close_bar();
                }
            });
            */
            

            this.left_bar.find("a").click(function(e) {
                help_function_href(e, this);
                if ( take.left_bar.hasClass("opened") ) {
                    take.close_bar();
                }
            });

            this.top_navigation.find("a").click(function(e) {
                help_function_href(e, this);
                if ( take.left_bar.hasClass("opened") ) {
                    take.close_bar();
                }
            });
            

            

        }
        

        change_state() {
            if ( this.state == 1 ) {
                this.close_bar();
            }
            else {
                this.open_bar();
            }

        }

        open_bar() {
                this.left_bar.addClass("opened");
                this.state = 1;
            
        if ($(window).width() <= 800 ) {
            $('body').css("overflow-y", "hidden");
        }
            
        }

        close_bar() {
                this.left_bar.removeClass("opened");
                this.state = 0;
            
            if ($(window).width() <= 800 ) {
                $('body').css("overflow-y", "auto");
            }
            
        }
    }


    class full_height_landing_test {
        constructor() {
            this.sections = $("section");
            this.body = $("body");
            this.state = 0;
            this.max_state = $("section").length - 1;
            this.initialized = false;
            this.buttons = $("#vert_nav_inside .navigation_item");
            this.block = 0;
            this.first_time = true;
            this.scroll_time = 0;
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
            if (this.state == 0) {
                $(".top_navigation").removeClass("scrolled");
            } 
            else if (this.state > 0) {
                $(".top_navigation").addClass("scrolled");
            }

            let height = this.state * $(window).height();  

            TweenLite.to(window, speed, {scrollTo:{y:height}, ease:Power2.easeInOut});


            this.buttons.removeClass("active");
            $(this.buttons[this.state]).addClass("active");


            if ( $(this.sections[this.state]).hasClass("section_white") ) {
                $(".vertical_navigation").addClass("orange");

                if ( $(window).width() > 910 ) {
                    $(".top_navigation").addClass("black");
                }
            }
            else {
                $(".vertical_navigation").removeClass("orange");
                $(".top_navigation").removeClass("black");
            }

            console.log(this.state);

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

    if ( $(".vertical_navigation").length > 0) {
        full_height_landing.init();
        $(window).resize(function() {
            full_height_landing.init();
        })
    }
    
    if ( $(".top_navigation").length > 0 ) {
        var navbar = new navigation($(".top_navigation"), $(".left_navigation"));
    }
    
    else {
       var navbar = new navigation($(".top_navigation_user"), $(".left_navigation"));
    }

    navbar.init();

    $( window ).resize(function() {
        if ($(window).width() > 910) {
            navbar.close_bar();
        }
    });


    // FORMS
    
    // user

    $("#user_save").click(function(e) {
        console.log("works!");
        if ( !$(this).hasClass("changed") ) {
            e.preventDefault();
            $(".form_container").find("input").attr("disabled", false);
            $(this).addClass("changed");
            $(this).val("Сохранить");
        }
    });

    
    
    // cars

    $(".input_fuel").click(function(e) {
        e.preventDefault();
        $(this).parent().find(".input_fuel").removeClass("active");
        $(this).addClass("active");
        $(this).parent().find("input").val(0);
        if ( $(this).attr('id') == "AI-98" ) {
            $( "input[name='oil_type']" ).val("98");
        }
        else if ( $(this).attr('id') == "AI-100" ) {
            $( "input[name='oil_type']" ).val("100");
        }
        else if ( $(this).attr('id') == "PREMIUM" ) {
            $( "input[name='oil_type']" ).val("DIESEL");
        }
    });



    $(".fuel_item").click(function() {
        $(this).parent().find(".fuel_item").removeClass("active");
        $(this).addClass("active");

        form_links();
    });

    let form_links = () => {


        $(".car_item").each(function () {

            let car_number = $(this).find(".car_description").find(".row_2").eq(0).find(".column").eq(1).find("p").eq(0).text();

            car_number = car_number.trim();


            let car_region = $(this).find(".car_description").find(".row_2").eq(0).find(".column").eq(1).find("p").eq(1).text();

            car_region = car_region.trim();

            let oil_type = $(this).find(".car_description").find(".row_2").eq(2).find(".column").eq(1).find("p").eq(0).text();

            let fuel_buttons = $(this).find(".fuel_item");
            
            if (fuel_buttons.length > 0) {
                for (var i = 0; i < fuel_buttons.length; i++) {
                    if ( $(fuel_buttons[i]).hasClass("active") ) {
                        break;
                    }
                }

                if (i == 0) {
                    oil_type = "98";
                }
                else if (i == 1) {
                    oil_type = "100";
                }
                else if (i == 2) {
                    oil_type = "DIESEL";
                }

            }
            
            let car_change = $(this).find(".car_change");

            let link = "/profile/edit_car?car_region=" + car_region + "&car_number=" + car_number;


            $(car_change).unbind();

            $(car_change).click(function (e) {
                e.preventDefault();
                window.location.href = link;
            });
            
            let button = $(this).find(".car_order");

            let link_button = "/order/main?car_region=" + car_region + "&car_number=" + car_number + "&oil_type=" + oil_type;

            $(button).unbind();

            $(button).click(function (e) {
                e.preventDefault();
                window.location.href = link_button;
            });



        })
    }

    form_links();
    
    
    $('#brand').change(function(){
        
        $.get( "/select_models_by_brand?brand=" + $("#brand").val(), function( data ) {
            
            if ( $("#brand").val() == "" ) {
                $("#model").empty();
                $("#model").prop('disabled', true);
            }
            else {
                if (data['models']) {
                    $("#model").prop('disabled', false);

                    $("#model").empty();

                    models = data['models'];
                    for (let i=0; i < models.length; i++) {
                        let option =  "'<option value='" + models[i] + "'>" +  models[i] + "</option>";
                        $("#model").append(option);
                    }
                }
            }

          
        });
        
        
        
    });
    
  
    // edit_car
    
    var old_car_number = $('#old_car_number').val();
    var old_car_region = $('#old_car_region').val();
    
    $('#edit_car_button').click(function(e) {
        e.preventDefault();
        var car_brand = $('#brand').val();
        var car_model = $('#model').val();
        var car_number = $('#gos1').val().toUpperCase();
        var car_region = $('#gos2').val();
        var car_color = $('#color').val();
        
        let fuel_buttons = $("#edit_car_form").find(".input_fuel");

        var oil_type = "";

        for (var i = 0; i < fuel_buttons.length; i++) {
            if ( $(fuel_buttons[i]).hasClass("active") ) {
                oil_type = $(fuel_buttons[i]).val();
            }
        }

        console.log(oil_type);
        
        function show_error(text) {
            $("#errors_output").css("opacity", "1");
            $("#errors_output").text(text);
        }
        
        if ( !regions_set.has(car_region) ) {
            console.log("wrong!");
            show_error("Неправильно указан регион в номере!");
            return false;
        }
        

        if (!(car_brand != 'Марка автомобиля' 
              && car_model.length
              && car_region.length
              && car_color != 'Цвет'
              && car_number.length
              && oil_type.length)) {

            show_error('Заполните правильно все поля!');
            return false
        }
        var form_data = $(this).serialize();
            
        $.post( "/profile/edit_car/", {
            brand:car_brand, 
            model:car_model, 
            car_number:car_number, 
            car_region:car_region, 
            car_color:car_color, 
            oil_type:oil_type,
            old_car_region:old_car_region,
            old_car_number:old_car_number
        })
            .done(function( data ) {
            console.log("done");
            if (data['status'] == 'ok') {
                window.location.href = "/profile/cars";
            } else {
                show_error(data['mes']);
                if (data['redir'])
                    window.location.href = data['redir'];
            }
        })
            .fail(function() {
            show_error('Серверная ошибка');
        })
        return false;
    });
    
   
    
    
    // FAVORITE
    
    $(".remove_favorite").click(function () {

        const item = $(this).closest(".address_item");


        $.post("/profile/favorite/delete/", {
            id:item.attr("id")
            })
            .done(function (data) {
                console.log("done");
                if (data['status'] == 'ok') {
                   TweenLite.to(item, 0.5, {opacity:0, height:0,padding:0,margin:0, onComplete:function() {
                       TweenLite.to(item, 0.5, {display:"none"});
                   }});
                } else {
                    console.log(data['mes']);
                    if (data['redir'])
                        window.location.href = data['redir'];
                }
            })
            .fail(function () {
                console.log("error");
            })
    });
    
    
    $("#add_favorite").click(function() {
       
        if ( !$(this).hasClass("opened") ) {

            $(this).addClass("opened");
            TweenLite.to(".user_favorite_container", 0.5, {opacity:0, xPercent: -20, ease:Power2.easeInOut, onComplete: function() {
                TweenLite.set(".user_favorite_container", {display:"none"});
                TweenLite.set("#favorite_form", {display:"block"});
                TweenLite.fromTo("#favorite_form", 0.5, {opacity:0, xPercent:20}, {opacity:1, xPercent:0});
            }}); 
            
    }
    });
    
    if ($(".map_container").length > 0 || $("#favorite_form").length > 0) {
        ymaps.ready(function(){
            function geo_code(add) {
                var myGeocoder = ymaps.geocode(add);
                myGeocoder.then(
                    function (res) {
                        const street_address = $("#street_address").val();
                        const house_address = $("#house_address").val();

                        function show_error(text) {
                            $("#errors_output").css("opacity", "1");
                            $("#errors_output").text(text);
                        }

                        try {
                            var aaa = res.geoObjects.get(0).geometry.getCoordinates();
                            let coord_right = [aaa].join();

                            let object = {street:street_address,house:house_address,coordinates:coord_right};


                            $.post("/profile/favorite/add/", {
                                address:JSON.stringify(object)
                            })
                                .done(function (data) {
                                if (data['status'] == 'ok') {
                                    window.location.href = '/profile/favorite'

                                } else {
                                    show_error(data['mes']);
                                    if (data['redir'])
                                        window.location.href = data['redir'];
                                }
                            })
                                .fail(function () {
                                show_error("Проверьте, правильно ли указан адрес!");
                            })
                        }
                        catch(err) {
                            show_error("Проверьте, правильно ли указан адрес!");
                        }
                    },
                    function (err) {
                        console.log("NO");   
                    }
                );
            }

            $("#add_favorite_last").click(function(e) {

                e.preventDefault();
                const street_address = $("#street_address").val();
                const house_address = $("#house_address").val();
                const address = street_address + ", " + house_address;

                geo_code(address);


                return false;
            });


        });

    }
    
    let resize_cards = () => {
        
        let font_size = $(window).width() / 45;
        if (font_size < 18) {
            font_size = 18;
        }
        font_size = font_size + "px";
        $("#cards").css("font-size", font_size);
    }
    
    resize_cards();
    
    if ( $("#cards").length > 0 ) {
        $(window).resize(function() {
            resize_cards();
        })
    }
    
    $("#close_popup, .popup_exit").click(function() {
        TweenLite.to(".popup_inside", 0.3, {yPercent:30, opacity:0, ease:Power2.easeOut, onComplete:function() {
            TweenLite.set(".popup_mistake", {display:"none"});
        }});
    });
    
    let show_popup = (text) => {
        TweenLite.set("#popup_mistake", {display:"flex"});
        TweenLite.fromTo("#popup_mistake .popup_inside", 0.3, {opacity:0, yPercent:30, ease:Power2.easeOut}, {opacity:1, yPercent:0, ease:Power2.easeOut});
        $("#popup_mistake #popup_text").text(text);
    };
    
    let show_popup_delete = () => {
        TweenLite.set("#popup_delete", {display:"flex"});
        TweenLite.fromTo("#popup_delete .popup_inside", 0.3, {opacity:0, yPercent:30, ease:Power2.easeOut}, {opacity:1, yPercent:0, ease:Power2.easeOut});
    };
    
    $("#delete_car_button").click(function(e) {
        e.preventDefault();
        show_popup_delete();
    });
    
    $("#delete_car_approve").click(function(e) {
        e.preventDefault();
        

        var car_number = $('#gos1').val().toUpperCase();
        var car_region = $('#gos2').val();


        $.post( "/profile/delete_car/", {
            car_number:car_number, 
            car_region:car_region
        })
            .done(function( data ) {
            console.log("done");
            if (data['status'] == 'ok') {
                window.location.href = "/profile/cars";
            } else {
                show_popup(data['mes']);
                if (data['redir'])
                    window.location.href = data['redir'];
            }
        })
            .fail(function() {
            show_popup('Серверная ошибка');
        })
        return false;
        
    });
    
    if ( $(".user_history_pagination").length > 0 ) {
        const take = $(".user_history_pagination");
        let object =$("#user_history_current").clone();
        
        let insert_object = (number, before) => {
            const new_object = object.clone();
            new_object.attr("id", "");
            let href = new_object.attr("href");
            href = href.replace(/.$/,number);
            new_object.attr("href", href);
            new_object.find("p").text(number);
            new_object.find(".number_page").removeClass("active");
            if (before) {
                $(".user_history_pagination").prepend(new_object);
            }
            else {
                $(".user_history_pagination").append(new_object);
            }
            
        }

        
        const get_current = parseInt( object.find("p").text() );
        const get_last = parseInt( $("#user_history_last").find("p").text() );
        
        if ( get_current == 1) {
            $("#user_history_first").remove();
        }
        
        if ( get_current == get_last ) {
            $("#user_history_last").remove();
        }
        
        let left_steps = get_current - 1;
        let steps = 3;
        
        for (left_steps; left_steps > 1 && steps > 0; left_steps--) {
            insert_object(left_steps, true);
            steps -= 1;
        }
        
        
        let right_steps = get_current + 1;
        steps = 3;

        for (right_steps; right_steps < get_last && steps > 0; right_steps++) {
            insert_object(right_steps, false);
            steps -= 1;
        }
        
        const first_object = $("#user_history_first");
        first_object.remove();
        $(".user_history_pagination").prepend(first_object);
        
        const last_object = $("#user_history_last");
        last_object.remove();
        $(".user_history_pagination").append(last_object);
        
    }
    
    jQuery('.left_navigation_container').scrollbar();
    
});

