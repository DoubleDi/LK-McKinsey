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

$(document).ajaxStart(function () {
    TweenLite.set(".waiting_window", {
        display: "block"
    });
    TweenLite.fromTo(".waiting_window", 0.2, {
        scale: 0
    }, {
        scale: 1
    });
});

$(document).ajaxComplete(function () {
    TweenLite.fromTo(".waiting_window", 0.2, {
        scale: 1
    }, {
        scale: 0,
        onComplete: function () {
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
}

function show_popup_error(text, notice = false) {
    $("#popup_text").text(text);
    TweenLite.to(".popup_window", 0.3, {
        top: 0,
        onComplete: function () {
            var tween = TweenLite.to(".popup_window", 0.3, {
                top: -70
            });
            tween.delay(3);
        }
    });

    if (notice) {
        $('.popup_window').find(".inside_container").css("background", "#03bf6d");
    } else {

    }

}



$("#enter_button").click(function (e) {
    e.preventDefault();
    var email = $("#email").val();
    var password = $("#password").val();

    if (password.length > 0 && email.length > 0) {
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
    } else {
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

$("#registration").click(function () {
    TweenLite.to(".main_container", 0.3, {
        opacity: 0,
        onComplete: function () {

            $(".auth_screen").addClass("registration");
            $(".intro_label").text("Регистрация за полминуты");
            $(".intro_description").text("Присоединяйтесь к самому захватывающему хакатону года");

            TweenLite.set("#authorization_form", {
                display: "none"
            });
            TweenLite.set("#registration_form", {
                display: "block"
            });
            TweenLite.to(".main_container", 0.3, {
                opacity: 1
            });
        }
    });


});


$("#authorization").click(function () {
    TweenLite.to(".main_container", 0.3, {
        opacity: 0,
        onComplete: function () {

            $(".auth_screen").removeClass("registration");
            $(".intro_label").text("McKinsey Hackathon");
            $(".intro_description").text("Войдите в свой аккаунт");

            TweenLite.set("#registration_form", {
                display: "none"
            });
            TweenLite.set("#authorization_form", {
                display: "block"
            });

            TweenLite.to(".main_container", 0.3, {
                opacity: 1
            });
        }
    });
});

$("#reg_password_confirm").focusin(function () {
    $(".input_container.hidden").removeClass("hidden");
});

if ($('#reg_phone').length > 0) $('#reg_phone').mask('+7 (000) 000-0000');

if ($('#phone').length > 0) $('#phone').mask('+7 (000) 000-0000');

$("#reg_button").click(function (e) {

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

$("#upload_avatar_button").click(function () {
    $("#avatar").click();
})


$("#avatar").change(function (event) {

    event.preventDefault();

    var file_data = $("#avatar").prop('files')[0];
    var form_data = new FormData();

    form_data.append("avatar", file_data);


    var file = this.files[0];
    var reader = new FileReader();
    reader.onloadend = function () {
        $('#user_avatar').css('background-image', 'url("' + reader.result + '")');
    }
    if (file) {
        reader.readAsDataURL(file);
    } else {}



    $.ajax({
        url: "/participants/profile/edit_avatar",
        type: 'POST',
        data: form_data,
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        success: function (data) {},
    }).done(function (data) {

        if (data['status'] == 'ok') {
            show_popup_error("Изменения сохранены", true);
        } else {
            show_popup_error(data['message']);
        }


    }).fail(function () {
        show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
    });
    return false;

});


$("#save_user_info").click(function (e) {
    e.preventDefault();
    var name = $("#name").val();
    var phone = $("#phone").val();
    var hidden = !$("#public_profile").is(":checked");

    if (name.length > 0 && phone.length > 0) {
        $.post("/participants/profile/edit", {
            name: name,
            phone_number: phone,
            is_hidden: hidden
        }).done(function (data) {
            console.log(data);
            if (data['status'] == 'ok') {
                show_popup_error("Изменения сохранены", true);
            } else {
                show_popup_error(data['message']);
            }
        }).fail(function () {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
        return false;
    } else {
        if (!name.length > 0) {
            show_input_error("#name", "Вы не указали Имя");
            $("#name").addClass("error");
        }
    }

});

$(".extended_item .header").click(function () {
    var item = $(this).closest(".extended_item");
    var header_height = item.find(".header").outerHeight();
    var items_height = item.find(".items").outerHeight();

    if (!item.hasClass("opened")) {
        item.height(header_height + items_height);
        item.addClass("opened");
    } else {
        item.height(header_height);
        item.removeClass("opened");
    }
});

function refresh_skill_handlers() {
    $("#user_skills .option i").off();

    $("#user_skills .option i").click(function () {
        var skill = $(this).closest(".option");

        TweenLite.to(skill, 0.2, {
            opacity: 0,
            onComplete: function () {
                TweenLite.to(skill, 0.2, {
                    width: 0,
                    padding: 0,
                    height: 0,
                    onComplete: function () {
                        skill.remove();
                    }
                });
            }
        });
    });
}

refresh_skill_handlers();

if ( $("#user_skills").length > 0) {

    $("#skills .items .single_item").click(function () {
        var id = $(this).attr("id");
        var name = $(this).find("p").text();
        var check = true;

        $("#user_skills .option").each(function () {
            if ($(this).attr("id") == id) {
                check = false;
            }

        });

        if (check && $("#user_skills .option").length < 3) {
            $("#user_skills").append('<div id="' + id + '" class="option"><p>' + name + '</p><i class="icon ion-close-round" aria-hidden="true"></i></div>');
            refresh_skill_handlers();
        }

    });
}

var exp_delete_ids = [];

$("#save_user_experience").click(function (e) {
    e.preventDefault();
    var my_skills = [];
    $("#user_skills .option").each(function () {
        my_skills.push($(this).attr("id"));
    });


    my_skills = JSON.stringify(my_skills);
    console.log(my_skills);



    $.post("/participants/profile/edit_skills", {
        ids: my_skills
    }).done(function (data) {
        if (data['status'] == 'ok') {
            show_popup_error("Изменения сохранены", true);
        } else {
            show_popup_error(data['message']);
        }
    }).fail(function () {
        show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
    });

    console.log(exp_delete_ids);

    for (var i = 0; i < exp_delete_ids.length; i++) {
        $.post("/participants/profile/del_experience", {
            id: exp_delete_ids[i]
        }).done(function (data) {

        }).fail(function () {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
    }



    $(".experience_textarea").each(function () {
        var text = $(this).find("textarea").val();
        var elem_id = $(this).attr("id");
        var str_id = elem_id.substr(elem_id.search("_") + 1);

        $.post("/participants/profile/edit_experience", {
            text: text,
            id: str_id
        }).done(function (data) {
            console.log(data);
            if (data['status'] == 'ok') {
                show_popup_error("Изменения сохранены", true);
            } else {
                show_popup_error(data['message']);
            }
        }).fail(function () {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
    });

});


$("#add_user_experience").click(function () {
    var clone = $($(".experience_textarea")[0]).clone();
    clone.find(".field_description").remove();
    var last_element = $(".experience_textarea")[$(".experience_textarea").length - 1];
    var last_id = parseInt($(last_element).attr("id")[$(last_element).attr("id").length - 1]) + 1;
    clone.attr("id", "container_experience_" + last_id);
    clone.find("textarea").val("");
    clone.find(".delete_button").removeClass("first");
    $(this).before(clone);

    TweenLite.set(clone, {
        opacity: 0
    });

    TweenLite.from(clone, 0.3, {
        height: 0,
        padding: 0,
        margin: 0,
        onComplete: function () {
            TweenLite.to(clone, 0.2, {
                opacity: 1
            })
        }
    });

    delete_button_handlers();
});

function delete_button_handlers() {

    $(".experience_delete").click(function () {
        var element = $(this).closest(".experience_textarea");
        var elem_id = $(element).attr("id");
        var str_id = elem_id.substr(elem_id.search("_") + 1);
        exp_delete_ids.push(str_id);

        var del_element = element;

        TweenLite.to(del_element, 0.2, {
            opacity: 0,
            onComplete: function () {
                TweenLite.to(del_element, 0.3, {
                    padding: 0,
                    height: 0,
                    margin: 0,
                    width: 0,
                    onComplete: function () {
                        del_element.remove();
                    }
                });
            }
        });


    });
}

delete_button_handlers();

if ($('.invites_container').length > 0) {
    $('.invites_container').perfectScrollbar();
}


// Команды
var search_template = {
    'want_html': 1,
    'limit': 12,
    'offset': 0
}


$("#filter_2").click(function () {
    if (!$(this).hasClass("active")) {
        search_template.team_need = 1;
        $(this).addClass("active");
    } else {
        delete search_template.team_need;
        $(this).removeClass("active");
    }
    get_team_output(true);
});


$("#filter_1 .filter_header").click(function () {
    var take = $(this).closest("#filter_1");
    if (!take.hasClass("opened")) {

        var height = take.find(".container").outerHeight() + take.find(".filter_header").outerHeight();
        take.find(".window").css("height", height);
        take.addClass("opened");
    } else {
        var height = take.find(".filter_header").outerHeight();
        take.find(".window").css("height", height);

        take.removeClass("opened");
    }



});



$("#filter_1 .checkbox").click(function () {
    $(this).toggleClass("active");

    var array = [];

    $("#filter_1 .checkbox").each(function () {
        if ($(this).hasClass("active")) {
            array.push(parseInt($(this).find("p").text()));
        }
    });
    search_template.member_count = JSON.stringify(array);
    get_team_output(true);
});


$("#team_search").focusin(function () {
    $(".search_block").addClass("active");

    $(this).attr("placeholder", "");

    $(".background_for_all").css("display", "block");
});

$("#team_search").focusout(function () {
    $(".search_block").removeClass("active");

    $(this).attr("placeholder", "поиск");

    $(".background_for_all").css("display", "none");
});

$("#team_search").keypress(function (e) {
    if (e.which == 13) {
        $(this).blur();
    }
});

$('#team_search').each(function () {
    var elem = $(this);

    // Save current value of element
    elem.data('oldVal', elem.val());

    // Look for changes in the value
    elem.bind("propertychange change click keyup input paste", function (event) {
        // If value has changed...
        if (elem.data('oldVal') != elem.val()) {
            // Updated stored value
            elem.data('oldVal', elem.val());

            search_template.name = elem.val();
            get_team_output(true);

        }
    });
});

var stop_ajax_search = false;

var last_data = {};

function get_team_output(search = false) {

    if (search && !stop_ajax_search) {
        search_template.offset = 0;

        var timerId = setTimeout(function () {
            stop_ajax_search = false;
        }, 100);

        $.ajax({
            type: 'GET',
            url: '/teams/search',
            data: search_template,
            success: function (data) {
                console.log("success1");

            }
        }).done(function (data) {
            console.log("done1");
            $(".team_output_items").empty();
            $(".team_output_items").append(data);
            var items = $(".team_output_items .team_item_container").not(".appeared");
            TweenMax.staggerFrom(items, 0.5, {
                opacity: 0,
                scale: 0.5
            }, 0.05);
            items.addClass("appeared");
            search_template.offset += 12;

            refresh_team_handlers();
            stop_ajax_search = false;
        });
    } else if (!stop_ajax_search) {
        if ($(window).scrollTop() + $(window).height() == $(document).height()) {

            $.ajax({
                type: 'GET',
                url: '/teams/search',
                data: search_template,
                success: function (data) {

                }
            }).done(function (data) {
                console.log("done2");
                $(".team_output_items").append(data);
                var items = $(".team_output_items .team_item_container").not(".appeared");
                TweenMax.staggerFrom(items, 0.5, {
                    opacity: 0,
                    scale: 0.5
                }, 0.05);
                items.addClass("appeared");
                search_template.offset += 12;



                refresh_team_handlers();

            });
        }
    }

}


if ($("#team_search").length > 0) {

    get_team_output(true);

    $(window).scroll(function () {
        get_team_output();
    });
}

function refresh_team_handlers() {
    $(".join_team").off();

    $(".join_team").click(function (e) {
        e.preventDefault();
        var take = $(this).closest(".team_item_container");
        var id = take.attr("id");

        console.log($(this).hasClass("requested"));

        if ($(this).hasClass("requested")) {
            $(this).removeClass("requested");
            $(this).find(".button_text").text("Хочу присоединиться");
        } else {
            $(this).addClass("requested");
            $(this).find(".button_text").text("Вы отправили заявку");
        }


        $.post("/team/request", {
            id: id
        }).done(function (data) {
            console.log("done");
            if (data['status'] == 'ok') {

            } else {
                show_popup_error(data['message']);
            }
        }).fail(function () {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
        return false;

    });
}

$("#create_team").click(function () {
    TweenLite.to("#team_edit_form", 0.3, {
        opacity: 0,
        onComplete: function () {

            TweenLite.set("#team_edit_form", {
                display: "none"
            });
            TweenLite.set("#team_creation_form", {
                display: "block"
            });

            TweenLite.to("#team_creation_form", 0.3, {
                opacity: 1
            });

        }
    });
});

$("#back_to_edit_team").click(function () {
    TweenLite.to("#team_creation_form", 0.3, {
        opacity: 0,
        onComplete: function () {

            TweenLite.set("#team_creation_form", {
                display: "none"
            });
            TweenLite.set("#team_edit_form", {
                display: "block"
            });

            TweenLite.to("#team_edit_form", 0.3, {
                opacity: 1
            });

        }
    });
});

$("#create_team_end").click(function () {
    $.post("/team/create", {
        name:$("#reg_team_name").val()
    }).done(function (data) {
        console.log("done");
        if (data['status'] == 'ok') {
            window.location.reload();
        } else {
            show_popup_error(data['message']);
        }
    }).fail(function () {
        show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
    });
    return false;
});


$("#save_team_info").click(function(e){
    e.preventDefault();
    var my_skills = [];
    var name = $("#team_name").val();
    var about = $("#team_description").val();
    var delete_users = [];
    var hidden = !$("#public_team_profile").is(":checked");
    
    $("#team_skills .option").each(function () {
        my_skills.push($(this).attr("id"));
    });

    my_skills = JSON.stringify(my_skills);
    console.log(my_skills);

    $.post("/team/edit", {
        name:name,
        about:about,
        skills: my_skills,
        is_hidden:hidden
    }).done(function (data) {
        if (data['status'] == 'ok') {
            show_popup_error("Изменения сохранены", true);
        } else {
            show_popup_error(data['message']);
        }
    }).fail(function () {
        show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
    });

  


});


function refresh_team_skill_handlers() {
    $("#team_skills .option i").off();

    $("#team_skills .option i").click(function () {
        var skill = $(this).closest(".option");

        TweenLite.to(skill, 0.2, {
            opacity: 0,
            onComplete: function () {
                TweenLite.to(skill, 0.2, {
                    width: 0,
                    padding: 0,
                    height: 0,
                    onComplete: function () {
                        skill.remove();
                    }
                });
            }
        });
    });
}

refresh_team_skill_handlers();

if ( $("#team_skills").length > 0) {

    $("#skills .items .single_item").click(function () {
        var id = $(this).attr("id");
        var name = $(this).find("p").text();
        var check = true;

        $("#team_skills .option").each(function () {
            if ($(this).attr("id") == id) {
                check = false;
            }

        });

        if (check && $("#user_skills .option").length < 5) {
            $("#team_skills").append('<div id="' + id + '" class="option"><p>' + name + '</p><i class="icon ion-close-round" aria-hidden="true"></i></div>');
            refresh_team_skill_handlers();
        }

    });
}

$("#public_profile").change(function(){
    var elem = $(this).closest(".toggle_container");
    if ( $(this).is(":checked") ) {
        
        elem.find(".status").text("Да");
        elem.find(".status_description").text("Ваш профиль открыт для поиска");
    }
    else {
        elem.find(".status").text("Нет");
        elem.find(".status_description").text("Ваш профиль скрыт от поиска");
    }
});

$("#public_team_profile").change(function(){
    var elem = $(this).closest(".toggle_container");
    console.log("work");
    if ( $(this).is(":checked") ) {

        elem.find(".status").text("Да");
        elem.find(".status_description").text("Ваша команда видна в поиске");
    }
    else {
        elem.find(".status").text("Нет");
        elem.find(".status_description").text("Ваша команда скрыта от поиска");
    }
});