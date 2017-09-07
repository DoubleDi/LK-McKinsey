paper.install(window);
window.onload = function() {
    paper.setup('my_canvas');
    
    var opacity = 0.3;

    var color = "black";

    
    var sum = 0;
    
    var partion = 90;
    
    var iterWidth = parseInt(view.size.width / partion) + 1;
    var iterHeight = parseInt(view.size.height / partion) + 1;
    
    var left_margin = (view.size.width - iterWidth * partion) / 2; 
    var top_margin = (view.size.height - iterHeight * partion) / 2; 
    
    while (sum <= iterHeight) {
        
        var from = new Point(0, sum * partion - top_margin);
        var to = new Point(view.size.width, sum * partion - top_margin);
        var path = new Path.Line(from, to);
        
        path.strokeColor = color;
        path.strokeWidth = 1;

        path.opacity =  0.05;
        
        sum++;
    }
    
    sum = 0;
    
    while (sum <= iterWidth) {
        var from = new Point(left_margin + sum * partion, 0);
        var to = new Point(left_margin + sum * partion, view.size.height);
        var path = new Path.Line(from, to);

        path.strokeColor = color;
        path.strokeWidth = 1;

        path.opacity =  0.05;

        sum++;
    }
    
    
    var sum_x = 0, sum_y = 0;
    
    /* Частицы - показать?
    while (sum_y < iterHeight) {
        var path = new Path.Circle(new Point(sum_x * partion + left_margin, sum_y * partion + top_margin + partion/2 - 2), 1);
        path.fillColor  = color;
        path.opacity = opacity;

        sum_x += 1;
        if (sum_x >= iterWidth) {
            sum_x = 0;
            sum_y += 1;
            console.log("yeeah");
        }

        sum++;
    }
    */
    
    var circle_group = new Group();
    
    sum = 0;
    sum_x = 0;
    sum_y = 0;
    
    var radius = 3;
    
    
    while (sum_y < iterHeight) {
        var shape = new Shape.Circle(new Point(sum_x * partion + left_margin + partion/2, sum_y * partion + top_margin), radius);
        shape.strokeColor = color;
        shape.opacity = opacity;
        
        sum_x += 1;
        if (sum_x >= iterWidth) {
            sum_x = 0;
            sum_y += 1;
        }
        
        circle_group.addChild(shape);
        
        sum++;
    }
    
    var scale = 1;
    
    var active_items = [];
    var active_lines = [];

    function find_and_delete(target, target_array) {
        for (var i=0;i<target_array.length;i++) {
            if (target_array[i] == target) {
                delete target_array[i];
            }
        }
    }
    
    function find_and_return(target, target_array) {
        for (var i=0;i<target_array.length;i++) {
            if (target_array[i] == target) {
                return true;
            }
        }
    }
    
 
    function create_animation(item) {
        
        var delete_this = item;

        setTimeout(function() {create_line();}, 300);
            
        
        createjs.Tween.get( item, { } )
            .to( { radius: radius*50}, 2000, createjs.Ease.quartInOut )
            .call( function() {

            create_line();
            createjs.Tween.get( item, { } )
                .wait(500)
                .to( { radius: radius }, 2000, createjs.Ease.quartInOut )
                .call(function() {find_and_delete(delete_this, active_items)});
            
            var new_choosed_item = circle_group.children[parseInt(Math.random() * circle_group.children.length)];
            
            while(find_and_return(new_choosed_item, active_items)) {
                new_choosed_item = circle_group.children[parseInt(Math.random() * circle_group.children.length)];
            }
            
            active_items.push(new_choosed_item);
            create_animation(new_choosed_item);
        } );
    }
    

    var choosed_item = circle_group.children[parseInt(Math.random() * circle_group.children.length)];
    
    create_animation(choosed_item);
    

    // setTimeout(function() {var choosed_item = circle_group.children[parseInt(Math.random() * circle_group.children.length)]; create_animation(choosed_item); }, 600);
    
    
    
    
    function create_line() {
        
        var random_width = parseInt( Math.random() * iterWidth );
        var random_height = parseInt( Math.random() * iterHeight );
        
        var x_angle = partion * Math.sign( Math.random() * 2 - 1);
        var y_angle = partion * Math.sign( Math.random() * 2 - 1);
        
        var x = random_width * partion + left_margin + partion/2;
        var y = random_height * partion + top_margin;
        
        
        var path = new Path.Line(new Point(x, y), new Point(x, y));
        
        path.strokeWidth = 2;
        path.strokeColor = color;
        
        path.opacity = opacity;
        
        
        createjs.Tween.get( path.segments[1].point, { } )
            .to( { x: x + x_angle,
                  y: y + y_angle}, 1500, createjs.Ease.quartInOut )
        .wait(2000)
        .call( function() {
            createjs.Tween.get( path.segments[0].point, { } )
                .to( { x: x + x_angle,
                      y: y + y_angle}, 1500, createjs.Ease.quartInOut )
                .call(function() {
                      path.remove();
                      })
            
        });
            
        
    }
    
    create_line();
    
    
    var update = function() {
        paper.view.draw();
        
    }

    createjs.Ticker.setFPS( 60 );
    createjs.Ticker.addEventListener( 'tick', update );
   
    $(window).resize(function() {
        paper.view.viewSize.width = $("#my_canvas").width();
        paper.view.viewSize.height = $("#my_canvas").height();
    });
    
}

