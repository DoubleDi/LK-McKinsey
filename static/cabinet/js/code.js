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



$("#enter_button").click(function(e) {
    e.preventDefault();
    var email = $("#email").val();
    var password = $("#password").val();

    if (password.length > 0 && email.length > 0) {
        $.post("/participants/login", {
            email: email,
            password: password
        }).done(function(data) {
            console.log("done");
            if (data['status'] == 'ok') {
                if (data['redirect']) window.location.href = data['redirect'];
            } else {
                show_popup_error(data['message']);
            }
        }).fail(function() {
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

$("#registration").click(function() {
    TweenLite.to(".main_container", 0.3, {
        opacity: 0,
        onComplete: function() {

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


$("#authorization, #recovery_back").click(function() {
    TweenLite.to(".main_container", 0.3, {
        opacity: 0,
        onComplete: function() {

            $(".auth_screen").removeClass("registration");
            $(".intro_label").text("McKinsey Hackathon");
            $(".intro_description").text("Войдите в свой аккаунт");

            TweenLite.set("#recovery_form", {
                display: "none"
            });

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

$("#restore_password").click(function() {
    TweenLite.to(".main_container", 0.3, {
        opacity: 0,
        onComplete: function() {

            $(".auth_screen").removeClass("registration");
            $(".intro_label").text("Восстановление пароля");
            $(".intro_description").text("Введите свой E-mail");

            TweenLite.set("#registration_form", {
                display: "none"
            });
            TweenLite.set("#authorization_form", {
                display: "none"
            });
            TweenLite.set("#recovery_form", {
                display: "block"
            });

            TweenLite.to(".main_container", 0.3, {
                opacity: 1
            });
        }
    });
});

$("#recovery_button").click(function(e) {

    function isValidEmailAddress(emailAddress) {
        var pattern = new RegExp(/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i);
        return pattern.test(emailAddress);
    }



    e.preventDefault();
    var email = $("#recovery_email").val();

    var error = false;

    if (!email.length > 0) {
            show_input_error("#reg_email", "Вы не указали email");
            error = true;
        }

    if (!isValidEmailAddress(email)) {
        show_input_error("#reg_email", "Некорректный email-адрес");
        error = true;
    }

    if (!error) {
        $.post("/participants/drop_letter", {
            email: email
        }).done(function(data) {
            console.log("done");
            if (data['status'] == 'ok') {
                show_popup_error("На указанный E-mail выслано письмо с дальнейшими инструкциями", true);
                TweenLite.to(".main_container", 0.3, {
                    opacity: 0,
                    onComplete: function() {

                        $(".auth_screen").removeClass("registration");
                        $(".intro_label").text("McKinsey Hackathon");
                        $(".intro_description").text("Войдите в свой аккаунт");

                        TweenLite.set("#recovery_form", {
                            display: "none"
                        });

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
            } else {
                show_popup_error(data['message']);

            }
        }).fail(function() {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
        return false;
    }



});

$("#reg_password_confirm").focusin(function() {
    $(".input_container.hidden").removeClass("hidden");
});

if ($('#reg_phone').length > 0) $('#reg_phone').mask('+7 (000) 000-0000');

if ($('#phone').length > 0) $('#phone').mask('+7 (000) 000-0000');

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
        }).done(function(data) {
            console.log("done");
            if (data['status'] == 'ok') {
                show_popup_error("На указанный E-mail выслано письмо с подтверждением регистрации", true);
                TweenLite.to(".main_container", 0.3, {
                    opacity: 0,
                    onComplete: function() {

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
            } else {
                show_popup_error(data['message']);

            }
        }).fail(function() {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
        return false;
    }



});

$("#upload_avatar_button").click(function() {

    if ($("#avatar").length > 0) {
        $("#avatar").click();
    } else {
        $("#avatar_for_team").click();
    }

});


$("#avatar, #avatar_for_team").change(function(event) {

    event.preventDefault();

    var file_data = $(this).prop('files')[0];
    var form_data = new FormData();

    form_data.append("avatar", file_data);


    var url = "/participants/profile/edit_avatar";

    if ($(this).attr("id") == "avatar_for_team") {
        url = "/team/edit_avatar";
        form_data.append("for_team", 1);
    }


    var file = this.files[0];
    var reader = new FileReader();
    reader.onloadend = function() {
        $('#user_avatar').css('background-image', 'url("' + reader.result + '")');
        $('#team_avatar').css('background-image', 'url("' + reader.result + '")');
    }
    if (file) {
        reader.readAsDataURL(file);
    } else {}

    $.ajax({
        url: url,
        type: 'POST',
        data: form_data,
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        success: function(data) {},
    }).done(function(data) {

        if (data['status'] == 'ok') {
            show_popup_error("Изменения сохранены", true);
        } else {
            show_popup_error(data['message']);
        }


    }).fail(function() {
        show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
    });
    return false;

});


$("#save_user_info").click(function(e) {
    e.preventDefault();
    var name = $("#name").val();
    var phone = $("#phone").val();
    var hidden = !$("#public_profile").is(":checked");

    if (name.length > 0 && phone.length > 0) {
        $.post("/participants/profile/edit", {
            name: name,
            phone_number: phone,
            is_hidden: hidden
        }).done(function(data) {
            console.log(data);
            if (data['status'] == 'ok') {
                show_popup_error("Изменения сохранены", true);
            } else {
                show_popup_error(data['message']);
            }
        }).fail(function() {
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

$(".extended_item .header").click(function() {
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

    $("#user_skills .option i").click(function() {
        var skill = $(this).closest(".option");

        TweenLite.to(skill, 0.2, {
            opacity: 0,
            onComplete: function() {
                TweenLite.to(skill, 0.2, {
                    width: 0,
                    padding: 0,
                    height: 0,
                    onComplete: function() {
                        skill.remove();
                    }
                });
            }
        });
    });
}

refresh_skill_handlers();

if ($("#user_skills").length > 0) {

    $("#skills .items .single_item").click(function() {
        var id = $(this).attr("id");
        var name = $(this).find("p").text();
        var check = true;

        $("#user_skills .option").each(function() {
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

$("#save_user_experience").click(function(e) {
    e.preventDefault();
    var my_skills = [];
    $("#user_skills .option").each(function() {
        my_skills.push($(this).attr("id"));
    });


    my_skills = JSON.stringify(my_skills);
    console.log(my_skills);



    $.post("/participants/profile/edit_skills", {
        ids: my_skills
    }).done(function(data) {
        if (data['status'] == 'ok') {
            show_popup_error("Изменения сохранены", true);
        } else {
            show_popup_error(data['message']);
        }
    }).fail(function() {
        show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
    });

    console.log(exp_delete_ids);

    for (var i = 0; i < exp_delete_ids.length; i++) {
        $.post("/participants/profile/del_experience", {
            id: exp_delete_ids[i]
        }).done(function(data) {

        }).fail(function() {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
    }



    $(".experience_textarea").each(function() {
        var text = $(this).find("textarea").val();
        var elem_id = $(this).attr("id");
        var str_id = elem_id.substr(elem_id.search("_") + 1);

        $.post("/participants/profile/edit_experience", {
            text: text,
            id: str_id
        }).done(function(data) {
            console.log(data);
            if (data['status'] == 'ok') {
                show_popup_error("Изменения сохранены", true);
            } else {
                show_popup_error(data['message']);
            }
        }).fail(function() {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
    });

});


$("#add_user_experience").click(function() {
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
        onComplete: function() {
            TweenLite.to(clone, 0.2, {
                opacity: 1
            })
        }
    });

    delete_button_handlers();
});

function delete_button_handlers() {

    $(".experience_delete").click(function() {
        var element = $(this).closest(".experience_textarea");
        var elem_id = $(element).attr("id");
        var str_id = elem_id.substr(elem_id.search("_") + 1);
        exp_delete_ids.push(str_id);

        var del_element = element;

        TweenLite.to(del_element, 0.2, {
            opacity: 0,
            onComplete: function() {
                TweenLite.to(del_element, 0.3, {
                    padding: 0,
                    height: 0,
                    margin: 0,
                    width: 0,
                    onComplete: function() {
                        del_element.remove();
                    }
                });
            }
        });


    });
}

delete_button_handlers();

$("#save_security").click(function() {
     var password = $("#password").val();
    var password_confirm = $("#password_confirm").val();



    var error = false;

    if (!(password.length > 0 && password_confirm.length > 0 )) {
        if (!password.length > 0) {
            show_input_error("#password", "Вы не задали пароль");
        }
        if (!password_confirm.length > 0) {
            show_input_error("#password_confirm", "Вы не подтвердили пароль");
        }
        error = true;
    }

    if (password.length < 8) {
        show_input_error("#password", "Пароль должен состоять из минимум 8 символов");
        error = true;
    }
    if (password !== password_confirm) {
        show_input_error("#password_confirm", "Пароли не совпадают");
        error = true;
    }

    if (!error) {
        $.post("/participants/profile/edit", {
            password: password,
        }).done(function(data) {
            if (data['status'] == 'ok') {
                show_popup_error("Изменения сохранены", true);
            } else {
                show_popup_error(data['message']);
            }
        }).fail(function() {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
        return false;
    }

});



if ($('.invites_container').length > 0) {
    $('.invites_container').perfectScrollbar();
}

// Команды
var search_template = {
    'want_html': 1,
    'limit': 12,
    'offset': 0
}


$("#filter_2").click(function() {
    if (!$(this).hasClass("active")) {
        search_template.team_need = true;
        $(this).addClass("active");
    } else {
        delete search_template.team_need;
        $(this).removeClass("active");
    }
    get_team_output(true);
});


$("#filter_1 .filter_header").click(function() {
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



$("#filter_1 .checkbox").click(function() {
    $(this).toggleClass("active");

    var array = [];

    $("#filter_1 .checkbox").each(function() {
        if ($(this).hasClass("active")) {
            array.push(parseInt($(this).find("p").text()));
        }
    });
    search_template.member_count = JSON.stringify(array);
    get_team_output(true);
});


$(".search_block input").focusin(function() {
    $(".search_block").addClass("active");

    $(this).attr("placeholder", "");

    $(".background_for_all").css("display", "block");
});

$(".search_block input").focusout(function() {
    $(".search_block").removeClass("active");

    $(this).attr("placeholder", "поиск");

    $(".background_for_all").css("display", "none");
});

$(".search_block input").keypress(function(e) {
    if (e.which == 13) {
        $(this).blur();
    }
});

$('.search_block input').each(function() {
    var elem = $(this);

    // Save current value of element
    elem.data('oldVal', elem.val());

    // Look for changes in the value
    elem.bind("propertychange change click keyup input paste", function(event) {
        // If value has changed...
        if (elem.data('oldVal') != elem.val()) {
            // Updated stored value
            elem.data('oldVal', elem.val());

            search_template.name = elem.val();
            if ($(this).attr("id") == "participants_search") {
                get_team_output(true, true);
            } else {
                get_team_output(true);
            }


        }
    });
});

var stop_ajax_search = false;

var counter_for_search = 0;

var last_data = {};

function get_team_output(search = false, participants = false) {

    var local_counter = counter_for_search;

    function done_function(data) {
        $(".team_output_items").append(data);
        var items = $(".team_output_items .team_item_container").not(".appeared");
        TweenMax.staggerFrom(items, 0.5, {
            opacity: 0,
            scale: 0.5
        }, 0.05);
        items.addClass("appeared");
        search_template.offset += 12;

        if (participants) {
            refresh_participant_handlers();
        } else {
            refresh_team_handlers();
        }
    }

    var url = '/teams/search';
    if (participants) {
        url = "/participants/search";
    }

    if (search && !stop_ajax_search) {
        search_template.offset = 0;

        stop_ajax_search = true;

        var timerId = setTimeout(function() {
            stop_ajax_search = false;
        }, 50);

        $.ajax({
            type: 'GET',
            url: url,
            data: search_template,
            beforeSend: function() {
                counter_for_search += 1;
                local_counter += 1;
            },
            success: function(data) {
                console.log("success1");

            }
        }).done(function(data) {
            console.log(local_counter);
            console.log(counter_for_search);
            if (local_counter >= counter_for_search) {
                $(".team_output_items").empty();
                done_function(data);
            }
            stop_ajax_search = false;

        });
    } else if (!stop_ajax_search) {
        if ($(window).scrollTop() + $(window).height() == $(document).height() ) {

            

            $.ajax({
                type: 'GET',
                url: url,
                data: search_template,
                success: function(data) {

                }
            }).done(function(data) {
                done_function(data);



            });
        }
    }


}


if ($("#team_search").length > 0) {

    get_team_output(true);

    $(window).scroll(function() {
        get_team_output();
    });
}

if ($("#participants_search").length > 0) {

    get_team_output(true, true);

    $(window).scroll(function() {
        get_team_output(false, true);
    });
}


function refresh_team_handlers() {
    $(".join_team").off();

    $(".show_link").off();

    $(".show_link").click(function() {
        var take = $(this).closest(".team_item_container");
        var id = take.attr("id");
        console.log("gaga");
        show_ajax_page(true, id);
    });

    $(".join_team").click(function(e) {
        e.preventDefault();

        if ( $(this).hasClass("disabled") ) {
            return false;
        }

        var take = $(this).closest(".team_item_container");
        var id = take.attr("id");

        console.log($(this).hasClass("requested"));


        var button = $(this);

        function change_status(button) {
            if (button.hasClass("requested")) {
                button.removeClass("requested");
                button.find(".button_text").text("Хочу присоединиться");
            } else {
                button.addClass("requested");
                button.find(".button_text").text("Вы отправили заявку");
            }


        }


        $.post("/team/request", {
            id: id
        }).done(function(data) {
            console.log("done");
            if (data['status'] == 'ok') {
                if ( data['result'] == "joined" || data['result'] == "accepted" ) {
                    $(button).removeClass("requested");
                    $(button).addClass("accepted");
                    $(button).find(".button_text").text("Ваша команда");
                    $(button).off();
                }
                else {
                    change_status(button);
                }
            } else {
                show_popup_error(data['message']);
            }
        }).fail(function() {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
        return false;

    });
}

function refresh_participant_handlers() {

    $(".show_link").off();

    $(".show_link").click(function() {
        var take = $(this).closest(".team_item_container");
        var id = take.attr("id");

        show_ajax_page(false, id);
    });

    $(".invite_user").off();

    $(".invite_user").click(function(e) {
        e.preventDefault();
        if ( $(this).hasClass("disabled") ) {
            return false;
        }
        var take = $(this).closest(".team_item_container");
        var id = take.attr("id");

        console.log($(this).hasClass("requested"));

        var button = $(this);

        function change_status(button) {

            if (button.hasClass("requested")) {
                button.removeClass("requested");
                button.find(".button_text").text("Пригласить в команду");
            } else {
                button.addClass("requested");
                button.find(".button_text").text("Вы пригласили участника");
            }

        }


        $.post("/participants/profile/invite", {
            id: id
        }).done(function(data) {
            console.log("done");
            if (data['status'] == 'ok') {
                if ( data['result'] == "joined" || data['result'] == "accepted" ) {
                    $(button).removeClass("requested");
                    $(button).addClass("accepted");
                    $(button).find(".button_text").text("Состоит в Вашей команде");
                    $(button).off();
                   
                }
                else {
                    change_status(button);
                }
            } else {
                show_popup_error(data['message']);
            }
        }).fail(function() {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
        return false;

    });


}


// Участники

$("#open_skills_filter").click(function() {
    var container = $("#search_skills_container");
    if (container.is(":visible")) {
        container.css("display", "none");
        $(this).removeClass("active");
    } else {
        container.css("display", "flex");
        $(this).addClass("active");
    }


});

function update_skills_search() {

    var skills_array = [];

    $("#search_skills .option").each(function() {
        skills_array.push(parseInt($(this).attr("id")));
    });


    if ($("#search_skills .option").length > 0) {
        search_template.skills = JSON.stringify(skills_array);
    } else {
        delete search_template.skills;
    }

    console.log(search_template);

    get_team_output(true, true);

}

if ($("#search_skills").length > 0) {

    $("#skills .items .single_item").click(function() {
        var id = $(this).attr("id");
        var name = $(this).find("p").text();
        var check = true;

        $("#search_skills .option").each(function() {
            if ($(this).attr("id") == id) {
                check = false;
            }

        });

        if (check) {
            $("#search_skills").append('<div id="' + id + '" class="option"><p>' + name + '</p><i class="icon ion-close-round" aria-hidden="true"></i></div>');
            refresh_search_skill_handlers();
        }

        update_skills_search();

    });

    refresh_search_skill_handlers();

}

function refresh_search_skill_handlers() {
    $("#search_skills .option i").off();

    $("#search_skills .option i").click(function() {
        var skill = $(this).closest(".option");

        TweenLite.to(skill, 0.1, {
            opacity: 0,
            onComplete: function() {
                TweenLite.to(skill, 0.1, {
                    width: 0,
                    padding: 0,
                    height: 0,
                    onComplete: function() {
                        skill.remove();
                        update_skills_search();
                    }
                });
            }
        });

    });
}


// моя команда

$(".invites_accept").click(function() {
    var id = $(this).attr("id");
    if ($(this).hasClass("team")) {
        var condition = true;
    } else {
        var condition = false;
    }
    show_ajax_page(condition, id);
});

$("#create_team").click(function() {
    TweenLite.to("#team_edit_form", 0.3, {
        opacity: 0,
        onComplete: function() {

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

$("#back_to_edit_team").click(function() {
    TweenLite.to("#team_creation_form", 0.3, {
        opacity: 0,
        onComplete: function() {

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

$("#create_team_end").click(function() {
    $.post("/team/create", {
        name: $("#reg_team_name").val()
    }).done(function(data) {
        console.log("done");
        if (data['status'] == 'ok') {
            window.location.reload();
        } else {
            show_popup_error(data['message']);
        }
    }).fail(function() {
        show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
    });
    return false;
});


$("#save_team_info").click(function(e) {
    e.preventDefault();
    var my_skills = [];
    var name = $("#team_name").val();
    var about = $("#team_description").find("textarea").val();
    var delete_users = [];
    var hidden = !$("#public_team_profile").is(":checked");

    $("#team_skills .option").each(function() {
        my_skills.push($(this).attr("id"));
    });

    my_skills = JSON.stringify(my_skills);
    console.log(my_skills);

    $.post("/team/edit", {
        name: name,
        about: about,
        skills: my_skills,
        is_hidden: hidden
    }).done(function(data) {
        if (data['status'] == 'ok') {
            show_popup_error("Изменения сохранены", true);
        } else {
            show_popup_error(data['message']);
        }
    }).fail(function() {
        show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
    });




});


function refresh_team_skill_handlers() {
    $("#team_skills .option i").off();

    $("#team_skills .option i").click(function() {
        var skill = $(this).closest(".option");

        TweenLite.to(skill, 0.2, {
            opacity: 0,
            onComplete: function() {
                TweenLite.to(skill, 0.2, {
                    width: 0,
                    padding: 0,
                    height: 0,
                    onComplete: function() {
                        skill.remove();
                    }
                });
            }
        });
    });
}

refresh_team_skill_handlers();

if ($("#team_skills").length > 0) {

    $("#skills .items .single_item").click(function() {
        var id = $(this).attr("id");
        var name = $(this).find("p").text();
        var check = true;

        $("#team_skills .option").each(function() {
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

$("#public_profile").change(function() {
    var elem = $(this).closest(".toggle_container");
    if ($(this).is(":checked")) {

        elem.find(".status").text("Да");
        elem.find(".status_description").text("Ваш профиль виден в поиске");
    } else {
        elem.find(".status").text("Нет");
        elem.find(".status_description").text("Ваш профиль скрыт от поиска");
    }
});

$("#public_team_profile").change(function() {
    var elem = $(this).closest(".toggle_container");
    console.log("work");
    if ($(this).is(":checked")) {

        elem.find(".status").text("Да");
        elem.find(".status_description").text("Ваша команда видна в поиске");
    } else {
        elem.find(".status").text("Нет");
        elem.find(".status_description").text("Ваша команда скрыта от поиска");
    }
});

function leave_team() {

    $.post("/team/leave", {
        delete: 1
    }).done(function(data) {
        console.log("done");
        if (data['status'] == 'ok') {
            window.location.reload();
        } else {
            show_popup_error(data['message']);
        }
    }).fail(function() {
        show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
    });
    return false;
}

$("#delete_team").click(function() {
    show_warning("Вы действительно хотите удалить команду?", leave_team)
});


$("#leave_team").click(function() {
    show_warning("Вы действительно хотите покинуть команду?", leave_team)
});

function exclude_member() {

    $.post("/team/edit", {
        delete_users: JSON.stringify(users_array)
    }).done(function(data) {
        console.log("done");
        if (data['status'] == 'ok') {
            show_popup_error("Пользователь исключен", true);
            var delete_id = ".team_member#" + users_array[0];
            $(delete_id).remove();
        } else {
            show_popup_error(data['message']);
        }
    }).fail(function() {
        show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
    });
    return false;
}

var users_array;

$(".member_delete").click(function() {
    var member_id = $(this).closest(".team_member").attr("id");
    users_array = [];
    users_array.push(member_id);

    var text = "Вы действительно хотите исключить из Вашей команды участника " + $(this).closest(".team_member").find(".member_name").text() +"?";

    show_warning(text, exclude_member);
});

// Профиль участника

function refresh_profile_handlers() {

    $(".invite_profile_user, .invite_profile_team").off();

    $(".invite_profile_user, .invite_profile_team").click(function(e) {
        e.preventDefault();

        if ( $(this).hasClass("disabled") ) {
            return false;
        }

        var id = $(this).attr("id");

        var button = $(this);

        console.log("work");

        if (button.hasClass("invite_profile_user")) {
            var text1 = "Пригласить в команду";
            var text2 = "Вы пригласили участника";
            var url = "/participants/profile/invite";
        } else {
            var text1 = "Хочу присоединиться";
            var text2 = "Вы отправили заявку";
            var url = "/team/request";
        }

        function change_status(button) {

            if (button.hasClass("requested")) {
                button.removeClass("requested");
                button.find(".button_text").text(text1);
            } else {
                button.addClass("requested");
                button.find(".button_text").text(text2);
            }

        }

        $.post(url, {
            id: id
        }).done(function(data) {
            console.log("done");
            if (data['status'] == 'ok') {
                console.log("yeah");

                if ( data['result'] == "joined" || data['result'] == "accepted" ) {
                    $(button).hide(200);
                    $(button).closest('.form_main').find('.profile_invite_info').addClass("requested");
                    if (button.hasClass("invite_profile_user")) {
                        $(button).closest('.form_main').find('.profile_invite_info p').text("Состоит в Вашей команде");
                    }
                    else {
                        $(button).closest('.form_main').find('.profile_invite_info p').text("Ваша команда");
                    }
                }
                else {
                    change_status(button);
                }


            } else {
                show_popup_error(data['message']);
            }
        }).fail(function() {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
        return false;
    });
}

refresh_profile_handlers();

$(document).click(function(event) {
    if (!$(event.target).closest('.ajax_container').length) {
        if ($(".ajax_container").is(":visible")) {
            close_ajax_page();
        }

    }
});

function close_ajax_page() {
    TweenLite.to(".ajax_page_background", 0.2, {
        opacity: 0
    });
    TweenLite.to(".ajax_close", 0.2, {
        opacity: 0,
        scale: 1
    });
    TweenLite.to(".ajax_container", 0.2, {
        opacity: 0,
        y: 50,
        onComplete: function() {
            $(".ajax_page").css("display", "none");
        }
    });
    window.history.pushState('page_real', '', real_page_url);
}

$("#close_ajax_page").click(function() {
    close_ajax_page();
});


var real_page_url = "";


// Попап с пользователем/командой

function show_ajax_page(team = false, id) {

    var url = "/participants/";
    if (team) {
        url = "/teams/";
    }

    url = url + id;

    $.ajax({
        type: 'GET',
        url: url,
        data: {
            "popup": 1
        },
        success: function(data) {

            $(".ajax_page").css("display", "flex");
            TweenLite.fromTo(".ajax_page_background", 0.2, {
                opacity: 0
            }, {
                opacity: 1
            });
            TweenLite.fromTo(".ajax_container", 0.2, {
                opacity: 0,
                y: 50
            }, {
                opacity: 1,
                y: 0
            });
            TweenLite.fromTo(".ajax_close", 0.2, {
                opacity: 0,
                scale: 0
            }, {
                opacity: 1,
                scale: 1
            });


            $(".ajax_page").css("display", "flex");
            $("#ajax_container").html(data);
            refresh_profile_handlers();

        }
    }).done(function(data) {
        real_page_url = window.location.href;
        window.history.pushState('page_new', '', url);
    });
}

$("#navigation_button").click(function() {
    $("#cabinet_navigation").toggleClass("opened");
});

$("#drop_password_button").click(function(e) {

    e.preventDefault();
    var drop_key = $("#drop_key").val();
    var password = $("#password").val();
    var password_confirm = $("#password_confirm").val();

    var error = false;

    if (!(password.length > 0 && password_confirm.length > 0 ) ) {
        
        if (!password.length > 0) {
            show_input_error("#password", "Вы не задали пароль");
        }
        if (!password_confirm.length > 0) {
            show_input_error("#password_confirm", "Вы не подтвердили пароль");
        }
        error = true;
    }
    if (password.length < 8) {
        show_input_error("#password", "Пароль должен состоять из минимум 8 символов");
        error = true;
    }
    if (password !== password_confirm) {
        show_input_error("#password_confirm", "Пароли не совпадают");
        error = true;
    }

    if (!error) {
        $.post("/participants/drop/", {
            c: drop_key,
            password: password,
            password_confirm: password_confirm
        }).done(function(data) {
            console.log("done");
            if (data['status'] == 'ok') {
                if (data['redirect']) window.location.href = data['redirect'];
            } else {
                show_popup_error(data['message']);

            }
        }).fail(function() {
            show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
        });
        return false;
    }
});

$(".upload_file").click(function() {

    if ( !$(this).hasClass("disabled") ) {
        $(this).closest(".file_container").find(".file_input").click();
    }

});


$("#upload_file_1,#upload_file_2").change(function(event) {

    event.preventDefault();

    var file_data = $(this).prop('files')[0];
    var form_data = new FormData();

    if ($(this).attr("id") == "upload_file_1") {
        form_data.append("file_1", file_data);
        var file_link = "#link_file_1";
    }
    else {
        form_data.append("file_2", file_data);
        var file_link = "#link_file_2";
    }

    var url = "/team/edit_file";
    

    $.ajax({
        url: url,
        type: 'POST',
        data: form_data,
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        success: function(data) {},
    }).done(function(data) {

        if (data['status'] == 'ok') {
            show_popup_error("Файл загружен", true);
            $(file_link).attr("href", data['url']);
            $(file_link).text(data['url']);

        } else {
            show_popup_error(data['message']);
        }


    }).fail(function() {
        show_popup_error('Внутренняя ошибка сервера. Попробуйте позже.');
    });
    return false;

});

if ( $("#entry_message").length > 0 && $("#entry_message").val() != "") {
    show_popup_error($("#entry_message").val(), true);
}