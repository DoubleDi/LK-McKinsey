
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
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method)
               );
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

$("#team_search").focusin(function() {
    $(".search_block").addClass("active");
    
    $(this).attr("placeholder", "");

    $(".background_for_all").css("display", "block");
});

$("#team_search").focusout(function() {
    $(".search_block").removeClass("active");
    
    $(this).attr("placeholder", "поиск");

    $(".background_for_all").css("display", "none");
});

$("#filter_2").click(function() {
    $(this).toggleClass("active");
});


$("#filter_1").click(function() {
    if  ( !$(this).find(".window").is(":visible") ) 
   {
        $(this).find(".window").css("display", "block");
    }
    
});



$(".checkbox").click(function() {
    $(this).toggleClass("active");
});

function show_input_error(input, text) {
    $(input).closest(".input_container").addClass("error");
    var error = $(input).closest(".input_container").find(".error_output");
    error.text(text);
}

function show_popup_error(text, notice=false) {
    $("#popup_text").text(text);
    TweenLite.to(".popup_window", 0.3, {top:0, onComplete:function() {
        var tween = TweenLite.to(".popup_window", 0.3, {top:-70});
        tween.delay(4);
    }});
    
    if (notice) {
        $('.popup_window').find(".inside_container").css("background", "#03bf6d");
    }

}



$("#enter_button").click(function(e) {
    e.preventDefault();
    var email = $("#email").val();
    var password = $("#password").val();
    
    if ( password.length > 0 && email.length > 0) {
        $.post("/participants/login", {
            email: email,
            password: password
        }).done(function (data) {
            console.log("done");
            if (data['status'] == 'ok') {
                if (data['redirect']) window.location.href = data['redirect'];
            } else {
                show_popup_error(data['message']);
            }
        }).fail(function () {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
        return false;
    }
    else {
        if (!email.length > 0) {
            show_input_error("#email", "Вы не указали email");
            $("#email").addClass("error");
        }
        if (!password.length > 0) {
            show_input_error("#password", "Вы не указали пароль");
            $("#password").addClass("error");
        }
    }
   
});

$("#registration").click(function() {
    TweenLite.to(".main_container", 0.3, {opacity:0, onComplete:function() {
        
        $(".auth_screen").addClass("registration");
        $(".intro_label").text("Регистрация за полминуты");
        $(".intro_description").text("Присоединяйтесь к самому захватывающему хакатону года");

        TweenLite.set("#authorization_form", {display:"none"});
        TweenLite.set("#registration_form", {display:"block"});
        TweenLite.to(".main_container", 0.3, {opacity:1});
    }});
    
    
});


$("#authorization").click(function() {
    TweenLite.to(".main_container", 0.3, {opacity:0, onComplete:function() {
    
    $(".auth_screen").removeClass("registration");
    $(".intro_label").text("McKinsey Hackathon");
    $(".intro_description").text("Войдите в свой аккаунт");
        
    TweenLite.set("#registration_form", {display:"none"});
    TweenLite.set("#authorization_form", {display:"block"});
        
        TweenLite.to(".main_container", 0.3, {opacity:1});
    }});    
});

$("#reg_password_confirm").focusin(function() {
    $(".input_container.hidden").removeClass("hidden");
});

if ( $('#reg_phone').length > 0) $('#reg_phone').mask('+7 (000) 000-0000');

if ( $('#phone').length > 0) $('#phone').mask('+7 (000) 000-0000');

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
    
    if ( !(password.length > 0 && email.length > 0 && password_confirm.length > 0 && name.length > 0 && phone.length > 0) ) {
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
    
    if ( !isValidEmailAddress(email) ) {
        show_input_error("#reg_email", "Некорректный email-адрес");
        error = true;
    }
    if ( password.length < 8 ) {
        show_input_error("#reg_password", "Пароль должен состоять из минимум 8 символов");
        error = true;
    }
    if (password !== password_confirm) {
        show_input_error("#reg_password_confirm", "Пароли не совпадают");
        error = true;
    }
    
    if (phone.length < 17) {
        show_input_error("#reg_phone", "Неправильный номер");
        error = true;
    }

    if (!error) {
        $.post("/participants/register", {
            email: email,
            password: password,
            password_confirm: password_confirm,
            name: name,
            last_name: name,
            phone_number: phone
        }).done(function (data) {
            console.log("done");
            if (data['status'] == 'ok') {
                if (data['redirect']) window.location.href = data['redirect'];
            } else {
                show_popup_error(data['message']);

            }
        }).fail(function () {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
        return false;
    }
       
 

});

if ($("#user_avatar").length)  $("#user_avatar").dropzone({ url: "/file/post" });



$("#save_user_info").click(function(e) {
    e.preventDefault();
    var name = $("#name").val();
    var phone = $("#phone").val();
    
    if (name.length > 0 && phone.length > 0) {
        $.post("/participants/profile/edit", {
            name:name,
            phone_number:phone
        }).done(function (data) {
            console.log("done");
            if (data['status'] == 'ok') {
                show_popup_error("Изменения сохранены", true);
            } else {
                show_popup_error(data['message']);
            }
        }).fail(function () {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
        return false;
    }
    else {
        if (!name.length > 0) {
            show_input_error("#name", "Вы не указали Имя");
            $("#name").addClass("error");
        }
    }

});