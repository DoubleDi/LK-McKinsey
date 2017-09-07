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


    init();

    function init() {
        tick = 0;
        clock = new THREE.Clock();

        container = document.getElementById('starForge_field');

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

        renderer.setClearColor(0x222629, 1);
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
            opacity: 0.25
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



    var stars_number = 900;
    var hazars_number = 100;

    if (window.innerWidth < 500) {
        starSize = 1.5;
        hazarSize = 6;
        stars_number = 450;
    }


    // The wizard's about to get busy.
    var hazars_array = hazars();
    hazars = hazars_array[0];
    var group = hazars_array[1];
    var grid = grid();
    
    console.log(hazars.geometry.vertices);

    hazars.scale.set(0, 0, 0);

    
    
    render();

    new TWEEN.Tween(hazars.scale).to({
        x: 1,
        y: 1,
        z: 1
    }, 1500)
        .easing(TWEEN.Easing.Exponential.InOut).start();



    function render() {

        hazars.geometry.verticesNeedUpdate = true;


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
        
        for (var i = 0; i < group.children.length; i++) {

            for (var l = 0; l < group.children[i].geometry.vertices.length; l++) {
                
                if (group.children[i].children.length > 0) {
                    group.children[i].children[0].geometry.verticesNeedUpdate = true;
                    
                    var positions = group.children[i].children[0].geometry.attributes.position.array;
                    
                    var x, y, z, index;
                    x = y = z = index = 0;
                    
                    for ( var i = 0, l = 10; i < l; i ++ ) {

                        positions[ i] = x;
                        positions[ 2*i] = y;
                        positions[ 3*i ] = z;

                        x += ( Math.random() - 0.5 ) * 30;
                        y += ( Math.random() - 0.5 ) * 30;
                        z += ( Math.random() - 0.5 ) * 30;

                    }

                }
                
                var x = group.children[i].geometry.vertices[l].x;
                var y = group.children[i].geometry.vertices[l].y;

                if ( (Math.abs(x - mouseMesh.position.x) < 10) && (Math.abs(y -  mouseMesh.position.y) < 10) ) {
                    hazars.geometry.vertices[i].x += 0.1;
                    hazars.geometry.vertices[i].y += 0.1;
                }
            }
            
        }


        TWEEN.update();

        camera.lookAt(hazars.position);


        camera.updateProjectionMatrix();

        requestAnimationFrame(render);
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

        camera.aspect = aspectRatio;
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

        var Geometry = new THREE.Geometry();
        
        var x = 0;
        var y = -250;
        
        for (var i = 0; i < 2000; i++) {
            var point = new THREE.Vector3();
            
            point.x = x;
            point.y = y;
            point.z = 0;
            
            x += 10;
            if (x > 250) {
                x = 0;
                y += 8;
            }
            
            Geometry.vertices.push(point);
        }
        
        
        
        var hexColor = new THREE.Color(1, 1, 1).getHexString();
        
        var starsMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 1,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity: 0.2,
            map: createCanvasMaterial('#'+hexColor, 128),

        });
        
        var hazars = new THREE.Points(Geometry, starsMaterial);
        hazars.rotation.z = 1.55;
        hazars.position.y = -100;
        
        hazars.position.z = -80;

        scene.add(hazars);
    }


    function hazars() {
        var group = new THREE.Group();
        var LENGTH = 300, RADIUS = 30, VELOCITY = 5, deg = 0 ;
        
        function deg2Rad(deg) {
            return deg * (Math.PI / 180);
        }
        
        var rad = deg2Rad(deg * VELOCITY);
        
        var starsGeometry = new THREE.Geometry();
        var y_old = -100;
        
        for (var i = 0; i < 1000; i++) {

            var star = new THREE.Vector3();

            if (i % 2 == 0) {
                star.x = - Math.sin(rad + (i * 0.03)) * RADIUS;
                star.z = - Math.cos(rad + (i * 0.03)) * RADIUS;
            }
            else {
                star.x = Math.sin(rad + (i * 0.03)) * RADIUS;
                star.z = Math.cos(rad + (i * 0.03)) * RADIUS;
            }

            star.y = y_old;
            y_old += Math.random() * 3; 

            starsGeometry.vertices.push(star);

        }

        
        var hexColor = new THREE.Color(1, 1, 1).getHexString();

        var starsMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 1.5,
            blending: THREE.AdditiveBlending,
            transparent: true,
            opacity:0.5,
            depthTest: 0,
            map: createCanvasMaterial('#'+hexColor, 128),

        });
        

        var hazars = new THREE.Points(starsGeometry, starsMaterial);
        
        group.add(hazars);

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

        var mat = new THREE.LineBasicMaterial( { 
            color: 0xbbbbbb, 
            linewidth: 1,
            transparent: true,
            opacity:0.1} );
        
        function create_faces(Geometry) {
            for (var i = 0; i < Geometry.vertices.length - 2; i++) {
                var newGeometry = new THREE.Geometry();

                var point1 = Geometry.vertices[i];
                var point2 = Geometry.vertices[i+1];
                var point3 = Geometry.vertices[i+2];
                
                if (i > 0) {
                    point1 = Geometry.vertices[i-1];
                    point2 = Geometry.vertices[i];
                    point3 = Geometry.vertices[i+1];
                }

                newGeometry.vertices.push(point1, point2, point3);

                newGeometry.faces.push( face );

                newGeometry.computeFaceNormals();
                newGeometry.computeVertexNormals();

                var mesh = new THREE.Mesh( newGeometry, FacesMaterial );
                mesh.geometry.verticesNeedUpdate = true;

                group.add( mesh );

                var geo = new THREE.EdgesGeometry( mesh.geometry ); // or WireframeGeometry

                var wireframe = new THREE.LineSegments( geo, mat );
                
                wireframe.geometry.attributes.position.needsUpdate = true;
                
                mesh.add( wireframe );
                

                console.log(wireframe.geometry); 
            }
        }
        
        create_faces(starsGeometry);
        
        scene.add(group);
        
        console.log(group);


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


    return [hazars, camera];

};

var star_systems = init();
var hazars = star_systems[0];
var camera = star_systems[1];

$(window).resize(function() {
    if ( $(window).height() * 2 < $(window).width() ) {
        new TWEEN.Tween(camera.position).to({
            z: 100
        }, 1000).easing(TWEEN.Easing.Quadratic.InOut)
            .start();
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



