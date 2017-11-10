function init() {
    'use strict';
    /* 	'To actually be able to display anything with Three.js, we need three things:
    	A scene, a camera, and a renderer so we can render the scene with the camera.'

       		- https://threejs.org/docs/#Manual/Introduction/Creating_a_scene 		*/

    var scene, camera, renderer;

    /* We need this stuff too */
    var container, aspectRatio,
        HEIGHT, WIDTH, fieldOfView,
        nearPlane, farPlane,
        mouseX, mouseY, windowHalfX,
        windowHalfY, stats, geometry,
        starStuff, materialOptions, stars,
        loader, options, spawnerOptions, particleSystem, clock, tick,
        starField, hazars,
        absolute, alpha, beta, gamma;

    var targetList, mouse, mouseGeometry, mouseMaterial, mouseMesh;

    var LENGTH = 300, RADIUS = 20, VELOCITY = 1, deg = 0, count = 0;
    
    var object_count = {};
    object_count.count = 0;
    
    // для напольной сетки
    var particles, particle, count = 0;
    
    var SEPARATION = 10, AMOUNTX = 50, AMOUNTY = 50;

    function deg2Rad(deg) {
        return deg * (Math.PI / 180);
    }

    init();

    function init() {
        tick = 0;
        clock = new THREE.Clock();

        container = document.getElementById('webgl_floor');

        HEIGHT = window.innerHeight;
        WIDTH = window.innerWidth;
        aspectRatio = WIDTH / HEIGHT;
        fieldOfView = 35;
        nearPlane = 1;
        farPlane = 10000;
        mouseX = 0;
        mouseY = 0;
        absolute = 0;
        alpha = 0;
        beta = 0;
        gamma = 0;

        windowHalfX = WIDTH / 2;
        windowHalfY = HEIGHT / 2;

        loader = new THREE.TextureLoader();

        camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

        //Z positioning of camera

        camera.position.x = -35;
        camera.position.y = -35;
        camera.position.z = 190;

        scene = new THREE.Scene({
            antialias: true
        });
        scene.fog = new THREE.FogExp2(0x000000, 0.0003);


        //scene.background = new THREE.Color( 0x26333d );
        //check for browser Support
        if (webGLSupport()) {
            //yeah?  Right on...
            renderer = new THREE.WebGLRenderer({
                alpha: true
            });

        } else {
            //No?  Well that's okay.
            renderer = new THREE.CanvasRenderer();
        }
        
        
        
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(WIDTH, HEIGHT);
        container.appendChild(renderer.domElement);

        window.addEventListener('resize', onWindowResize, false);
        document.addEventListener('mousemove', onMouseMove, false);

        window.addEventListener("deviceorientation", handleOrientation);
        
        

        /*
        scene.add(particleSystem);
        */
        // options passed during each spawned
        options = {
            position: new THREE.Vector3(),
            positionRandomness: .3,
            velocity: new THREE.Vector3(),
            velocityRandomness: 2,
            color: 0xaa88ff,
            colorRandomness: .2,
            turbulence: 0.1,
            lifetime: 2,
            size: 4,
            sizeRandomness: 1
        };
        spawnerOptions = {
            spawnRate: 5000,
            horizontalSpeed: 0,
            verticalSpeed: 0,
            timeScale: 0.2
        };

        targetList = [];
        mouse      = {x: 0, y: 0};

        // Create a circle around the mouse and move it
        // The sphere has opacity 0
        mouseGeometry = new THREE.SphereGeometry(2, 0, 0);
        mouseMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0
        });
        mouseMesh = new THREE.Mesh(mouseGeometry, mouseMaterial);
        mouseMesh.position.set(0, 0, -10);
        scene.add(mouseMesh);



    }

    // Events listeners for the mouse
    //targetList.push(backgroundMesh);

    // When the mouse moves, call the given function
    document.addEventListener('mousemove', onMouseMove, false);

    function onMouseMove(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
        console.log(mouse.x);

        // Make the sphere follow the mouse
        var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
        vector.unproject( camera );
        var dir = vector.sub( camera.position ).normalize();
        var distance = - camera.position.z / dir.z;
        var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
        mouseMesh.position.copy(pos);
    }



    /*
    var controls = new function () {
        this.cameraX = -35;
        this.cameraY = -35;
        this.cameraZ = 150;
    }


    var gui = new dat.GUI();
    gui.add(controls, 'cameraX', -1000.0, 1000.0);
    gui.add(controls, 'cameraY', -1000.0, 1000.0);
    gui.add(controls, 'cameraZ', -1000.0, 1000.0);
    */
    
    $("body").click(function() {
        console.log(count);
    });
    
    var group = grid();

    console.log(grid);

    
    var orig_array = [];

    full_orig_array(group);


    function full_orig_array(new_group) {
        orig_array = [];
        for (var index = 0; index < new_group.children.length; index++) {

            orig_array[index] = [];

            for (var sub_index = 0; sub_index < new_group.children[index].geometry.vertices.length; sub_index++) {
                var vertices = [];
                vertices.push(new_group.children[index].geometry.vertices[sub_index].x);
                vertices.push(new_group.children[index].geometry.vertices[sub_index].y);
                vertices.push(new_group.children[index].geometry.vertices[sub_index].z);

                orig_array[index][sub_index] = [];
                orig_array[index][sub_index].push(vertices);

            }
        }
    }

    
    function update_on_hover(group) {
        for (var i = 0; i < group.children.length; i++) {

            for (var l = 0; l < group.children[i].geometry.vertices.length; l++) {

                group.children[i].geometry.verticesNeedUpdate = true;

                var x = group.children[i].geometry.vertices[l].x;
                var y = group.children[i].geometry.vertices[l].y;
                var z = group.children[i].geometry.vertices[l].z;

                var x_orig = orig_array[i][l][0][0];
                var y_orig = orig_array[i][l][0][1];
                var z_orig = orig_array[i][l][0][2];

                var particle =  group.children[i].geometry.vertices[l];
                var rad = deg2Rad(deg * VELOCITY);
                /*
                if (Math.random() > 0.01) {
                    group.children[i].geometry.vertices[l].x += Math.random() * 0.04 - 0.02;
                    group.children[i].geometry.vertices[l].y += Math.random() * 0.04 - 0.02;
                    group.children[i].geometry.vertices[l].z += Math.random() * 0.04 - 0.02;
                }
                */
                
                

                /*
                particle.x = Math.sin(rad + ((i + l) * 0.05)) * RADIUS;
                particle.z = Math.cos(rad + ((i + l) * 0.05)) * RADIUS;

                count += 0.00001;
                deg = (count + 10) % 360;
                */

                if ( (Math.abs(x - mouseMesh.position.x) < 20) && (Math.abs(y -  mouseMesh.position.y) < 20) ) {
                    //group.children[i].geometry.vertices[l].x += 0.1;
                    //group.children[i].geometry.vertices[l].y += 0.1;
                    
                    if (x - mouseMesh.position.x > 0 ) {
                        var push_x = Math.random() * (10);
                    }
                    else {
                        var push_x = Math.random() * (-10);
                    }
                    
                    if (y - mouseMesh.position.y > 0 ) {
                        var push_y = Math.random() * (10);
                    }
                    else {
                        var push_y = Math.random() * (-10);
                    }

                    if ( (Math.abs(x - x_orig) < 15) && (Math.abs(y - y_orig) < 15) ) {


                        new TWEEN.Tween(group.children[i].geometry.vertices[l]).to({
                            x: x+push_x,
                            y: y+push_y
                        }, 1000)
                            .easing(TWEEN.Easing.Exponential.Out).start();

                    }
                }
                else if (x !== x_orig || y !== y_orig  ) {
                    if (x > x_orig) {
                        group.children[i].geometry.vertices[l].x -= 0.05;
                    }
                    else if (x < x_orig) {
                        group.children[i].geometry.vertices[l].x += 0.05;
                    }

                    if (y > y_orig) {
                        group.children[i].geometry.vertices[l].y -= 0.05;
                    }
                    else if (y < y_orig) {
                        group.children[i].geometry.vertices[l].y += 0.05;
                    }
                }

            }
        

        }
    }
    
    var grid = group.children[0];

    render();

    function wait_for_active() {
        if ( !$(container).is(":visible") ) {
            requestAnimationFrame(wait_for_active);
        }
        else {
            requestAnimationFrame(render);
        }
    }

    function render() {
        
        var i = 0;
        
        
        object_count.count += 0.05;
        
        grid.geometry.verticesNeedUpdate = true;
        

        for ( var ix = 0; ix < AMOUNTX; ix ++ ) {
            for ( var iy = 0; iy < AMOUNTY; iy ++ ) {
                particle = grid.geometry.vertices[i++]
                particle.y = ( Math.sin( ( ix + object_count.count ) * 0.3 ) * 5 ) + ( Math.sin( ( iy + object_count.count ) * 0.5 ) * 10 ) - 50;

            }
        }
        
        
        if (gamma == 0) {
            camera.position.x += (50 * mouseX - camera.position.x) * 0.05;
            camera.position.y += (-50 * mouseY - camera.position.y) * 0.05;
        }
        else {
            camera.position.x += (gamma - camera.position.x) * 0.05;
            camera.position.y += (-beta - camera.position.y) * 0.05; 
        }

        var mouse_X = (mouseX);
        var mouse_Y = (mouseY);
        // Make the sphere follow the mouse
        var vector = new THREE.Vector3(mouse_X, mouse_Y, 1);
        vector.unproject( camera );
        var dir = vector.sub( camera.position ).normalize();
        var distance = - camera.position.z / dir.z;
        var pos = camera.position.clone().add( dir.multiplyScalar( distance ) );
        mouseMesh.position.copy(pos);


        //update_on_hover(new_group);


        TWEEN.update();

        camera.lookAt(scene.position);


        camera.updateProjectionMatrix();

        
        if ( $(container).is(":visible") ) {
            requestAnimationFrame(render);
        }
        else {
            requestAnimationFrame(wait_for_active);
        }

        renderer.render(scene, camera);
    }

    function webGLSupport() {
        /* 	The wizard of webGL only bestows his gifts of power
        	to the worthy.  In this case, users with browsers who 'get it'.		*/

        try {
            var canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && (
                canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            // console.warn('Hey bro, for some reason we\'re not able to use webGL for this.  No biggie, we\'ll use canvas.');
            return false;
        }
    }

    function onWindowResize() {

        // Everything should resize nicely if it needs to!
        var WIDTH = window.innerWidth,
            HEIGHT = window.innerHeight;

        camera.aspect = WIDTH / HEIGHT;
        camera.updateProjectionMatrix();
        renderer.setSize(WIDTH, HEIGHT);
    }


    function createCanvasMaterial(color, size) {
        var matCanvas = document.createElement('canvas');
        matCanvas.width = matCanvas.height = size;
        var matContext = matCanvas.getContext('2d');
        // create exture object from canvas.
        var texture = new THREE.Texture(matCanvas);
        // Draw a circle
        var center = size / 2;
        matContext.beginPath();
        matContext.arc(center, center, size/2, 0, 2 * Math.PI, false);
        matContext.closePath();
        matContext.fillStyle = color;
        matContext.fill();
        // need to set needsUpdate
        texture.needsUpdate = true;
        // return a texture made from the canvas
        return texture;
    }

    function grid() {
        var group = new THREE.Group();
        
        var Geometry = new THREE.Geometry();

        var particles = new Array();
       
        var i = 0;

        var PI2 = Math.PI * 2;
        
        for ( var ix = 0; ix < AMOUNTX; ix ++ ) {
            for ( var iy = 0; iy < AMOUNTY; iy ++ ) {
                var particle = new THREE.Vector3();
                particle.x = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 );
                particle.z = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 );
                particle.y = ( Math.sin( ( ix ) * 0.3 ) * 5 ) + ( Math.sin( ( iy ) * 0.5 ) * 10 ) - 50;

                Geometry.vertices.push( particle );
            }
        }
        
        var hexColor = new THREE.Color(0, 0, 0).getHexString();

        var starsMaterial = new THREE.PointsMaterial({
            color: 0x0093D3,
            size: 2,
            transparent: true,
            opacity: 0.5,
            map: createCanvasMaterial('#' + hexColor, 128),

        });

        var hazars = new THREE.Points(Geometry, starsMaterial);
       
        group.add(hazars);
        
        hazars.rotation.x = 0.3;
        
        scene.add(group);
        
        return group;
    }


    function hazars(width = 10,wireframe=true) {
        var group = new THREE.Group();

        var rad = deg2Rad(deg * VELOCITY);

        var starsGeometry = new THREE.Geometry();
        var y_old = -400;

        for (var i = 0; i < 2000; i++) {


            var star = new THREE.Vector3();

            var left_x = -Math.sin(rad + (i * 0.03)) * RADIUS;
            var left_y = -Math.cos(rad + (i * 0.03)) * RADIUS;
            var right_x = Math.sin(rad + (i * 0.03)) * RADIUS;
            var right_y = Math.cos(rad + (i * 0.03)) * RADIUS;


            for (var l =0; l<2;l++) {
                
                star.x =  1 * Math.sin(rad + (i * 0.03)) * RADIUS - width/2 * Math.random() * Math.cos(rad + (i * 0.03)) + width *  Math.random() * Math.cos(rad + (i * 0.03)) + Math.random() * 20 - 10;

                
                star.z = 1 * Math.cos(rad + (i * 0.03)) * RADIUS - width/2 * Math.random() * Math.sin(rad + (i * 0.10)) + width *  Math.random() * Math.sin(rad + (i * 0.10)) + Math.random() * 20 - 10;
                star.y = y_old + Math.random() * 2;

                starsGeometry.vertices.push(star);


            }

            y_old += Math.random() * 3; 

            starsGeometry.vertices.push(star);

        }


        var hexColor = new THREE.Color(1, 1, 1).getHexString();
        
        

        var starsMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 1.5,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity:0.3,
            depthTest: 0,
            map: createCanvasMaterial('#'+hexColor, 128),
        });
        
        if (!wireframe) {
            starsMaterial = new THREE.PointsMaterial({
                color: 0xFFFFFF,
                size: 1.5,
                blending: THREE.AdditiveBlending,
                transparent: true,
                opacity:1,
                map: loader.load(
                    "img/webgl/haze.png"
                ),
                depthTest: 0

            });
        
        }


        var hazars = new THREE.Points(starsGeometry, starsMaterial);

        group.add(hazars);

        var colorGeometry = new THREE.Geometry();

        for (var i =0; i < starsGeometry.vertices.length; i++ ) {
            if (Math.random() < 0.05) {
                colorGeometry.vertices.push(starsGeometry.vertices[i]);
            } 

        }
    

        var colorMaterial = new THREE.PointsMaterial({
            color: 0x0093D3,
            size: 2.5,
            transparent: true,
            opacity:1,
            depthTest: 0,
            map: createCanvasMaterial('#'+hexColor, 128),

        });

        var color_points = new THREE.Points(colorGeometry, colorMaterial);

        group.add(color_points);


        var material	= new THREE.MeshBasicMaterial({
            wireframe: true
        });


        var FacesMaterial = new THREE.MeshBasicMaterial( { 
            transparent: true,
            opacity: 0.01,
            polygonOffset: true,
            polygonOffsetFactor: 1, // positive value pushes polygon further away
            polygonOffsetUnits: 1,
            roughness: 1
        } );

        FacesMaterial.side = THREE.DoubleSide;

        var normal = new THREE.Vector3( 0, 1, 0 ); //optional
        var color = new THREE.Color( 0xffffff ); //optional
        var materialIndex = 0; //optional
        var face = new THREE.Face3( 0, 1, 2, normal, color, materialIndex );

        var FacesMaterial_second = new THREE.MeshBasicMaterial( { 
            wireframe: true,
            transparent: true,
            opacity: 0.03,
            polygonOffset: true,
            polygonOffsetFactor: 1, // positive value pushes polygon further away
            polygonOffsetUnits: 1,
            roughness: 1
        } );

        function create_faces(Geometry) {

            function create_from_points(point1,point2,point3) {
                var newGeometry = new THREE.Geometry();

                newGeometry.vertices.push(point1, point2, point3);

                newGeometry.faces.push( face );

                newGeometry.computeFaceNormals();
                newGeometry.computeVertexNormals();

                var wireframe = new THREE.Mesh( newGeometry, FacesMaterial_second );

                group.add(wireframe);
            }


            for (var i = 0; i < Geometry.vertices.length - 2; i++) {
                

                var point1 = Geometry.vertices[i];
                var point2 = Geometry.vertices[i+1];
                var point3 = Geometry.vertices[i+2];

                //create_from_points(point1,point2,point3);
                
                if (i>3) {
                    for (var l=0;l<1;l++) {

                        var point1 = Geometry.vertices[i];
                        var point2 = Geometry.vertices[i+l-3];
                        var point3 = Geometry.vertices[i+l];

                        var number = parseInt(Math.random() *80);

                        if (Geometry.vertices[i+number] !== undefined) {
                            var point2 = Geometry.vertices[i+number];
                        }

                        var number = parseInt(Math.random() * 80);

                        if (Geometry.vertices[i+number] !== undefined) {
                            var point3 = Geometry.vertices[i+number];
                        }

                        create_from_points(point1,point2,point3);

                    }
                }


            }

            var step = 30;

            var used_points = [];

            function go_step(step) {
                for (var i = 0; i < parseInt(Geometry.vertices.length / step); i++) {

                    var point1, point2, point3;

                    var point1_min, point2_min, point3_min;

                    var storage = [], max_number = -100000, max_pre_number = -100000, min_number = 100000, min_pre_number = 1000000, last_min_number = 2000000000, last_max_number = -200000000;

                    var this_i = i * step;


                    // LOOk FOR MAX and MIN
                    for (var l = 0; l < step; l++) {
                        storage.push(Geometry.vertices[i*l]);
                        var this_l = this_i + l;
                        var rule = true;

                        
                        for (var s=0; s<used_points.length; s++) {
                            if (Geometry.vertices[this_l] === used_points[s]) {
                                rule = false;
                            }
                        }

                        if (rule) {
                            if (Geometry.vertices[this_l].x > max_number) {
                                max_number = Geometry.vertices[this_l].x;
                                point1 = Geometry.vertices[this_l];
                            }
                            if (Geometry.vertices[this_l].x < min_number) {
                                min_number = Geometry.vertices[this_l].x;
                                point1_min = Geometry.vertices[this_l];
                            }
                        }


                    }



                    // LOOk FOR pre_MAX
                    for (var l = 0; l < storage.length; l++) {
                        var this_l =  this_i + l;

                        var rule = true;


                        if (rule) {

                            if (Geometry.vertices[this_l].x > max_pre_number && Geometry.vertices[this_l].x !== max_number) {
                                max_pre_number = Geometry.vertices[this_l].x
                                point2 = Geometry.vertices[this_l];

                            }
                            if (Geometry.vertices[this_l].x < min_pre_number && Geometry.vertices[this_l].x !== min_number) {
                                min_pre_number = Geometry.vertices[this_l].x
                                point2_min = Geometry.vertices[this_l];
                            }
                        }
                    }


                    // LOOk FOR point3
                    for (var l = 0; l < storage.length; l++) {
                        var this_l =  this_i + l;

                        var rule = true;


                        if (rule) {


                            if (Geometry.vertices[this_l].x !== max_number && Geometry.vertices[this_l].x !== max_pre_number && Geometry.vertices[this_l].x > last_max_number ) {
                                last_max_number = Geometry.vertices[this_l].x;
                                point3 = Geometry.vertices[this_l];

                            }
                            if (Geometry.vertices[this_l].x !== min_number && Geometry.vertices[this_l].x !== min_pre_number && Geometry.vertices[this_l].x < last_min_number ) {
                                last_min_number = Geometry.vertices[this_l].x;
                                point3_min = Geometry.vertices[this_l];

                            }
                        }
                    }


                    create_from_points(point1,point2,point3);
                    create_from_points(point1_min,point2_min,point3_min);

                    used_points.push(point1, point1_min);

                    /*
                    var random = this_i + parseInt(Math.random() * step);
                    var point1 =  Geometry.vertices[random];

                    create_from_points(point1,point2,point3);

                    var random = this_i + parseInt(Math.random() * step);
                    var point1_min =  Geometry.vertices[random];

                    create_from_points(point1_min,point2_min,point3_min);
                    */

                }
            }

            go_step(200);

            go_step(120);

            go_step(100);



        }

        if (wireframe) { create_faces(starsGeometry)}
        

        scene.add(group);

        return [hazars,group];
    }

    function onMouseMove(e) {
        var k = 0.1;
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY =  - (event.clientY / window.innerHeight) * 2 + 1;
    }


    function handleOrientation(event) {
        var k = 1.5;
        absolute = event.absolute;
        alpha    = event.alpha;
        beta     = event.beta * k;
        gamma    = event.gamma * k;

        // Do stuff with the new orientation data
    }


    return [group, orig_array,object_count];

};

var floor_init = init();
var floor = floor_init[0];
var floor_array = floor_init[1];
var floor_count = floor_init[2];

$(window).resize(function() {
    if ( $(window).height() * 2 < $(window).width() ) {
        new TWEEN.Tween(camera.position).to({
            z: 100
        }, 1000).easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        r
    }
    else {
        if ( $(window).height() * 2 < $(window).width() ) {
            new TWEEN.Tween(camera.position).to({
                z: 190
            }, 1000).easing(TWEEN.Easing.Quadratic.InOut)
                .start();
        }
    }

});



