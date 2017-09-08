function flex() {
    
}

$("#team_search").focusin(function() {
    $(".search_block").css("max-width", "100%");
    $("label[for='team_search']").css("opacity", "0");
    $(this).attr("placeholder", "");
    
    $(".search_block").css("z-index","102");
    
    $(".background_for_all").css("display", "block");
});

$("#team_search").focusout(function() {
    $(".search_block").css("max-width", "400px");
    $("label[for='team_search']").css("opacity", "1");
    $(this).attr("placeholder", "поиск");
    
    $(".search_block").css("z-index","0");
    $(".background_for_all").css("display", "none");
});