function init_scene() {
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

    function deg2Rad(deg) {
        return deg * (Math.PI / 180);
    }

    init();

    function init() {
        tick = 0;
        clock = new THREE.Clock();

        container = document.getElementById('scene');

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
        
        console.log(scene.background);
        
        scene.background = new THREE.Color( 0x26333d );
        
       
        
        
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

    var grid = grid();    


    render();
    


    function render() {

        if (gamma == 0) {
            camera.position.x += (50 * mouseX - camera.position.x) * 0.05;
            camera.position.y += (-50 * mouseY - camera.position.y) * 0.05;
        }
        else {
            camera.position.x += (gamma - camera.position.x) * 0.05;
            camera.position.y += (-beta - camera.position.y) * 0.05; 
        }

       

        TWEEN.update();

        camera.lookAt(scene.position);

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

        var Geometry = new THREE.Geometry();

        var x = 0;
        var y = -300;

        for (var i = 0; i < 3500; i++) {
            var point = new THREE.Vector3();

            point.x = x;
            point.y = y;
            point.z = 0;

            x += 12;
            if (x > 350) {
                x = 0;
                y += 12;
            }

            Geometry.vertices.push(point);
        }



        var hexColor = new THREE.Color(1, 1, 1).getHexString();

        var starsMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 1.5,
            transparent: true,
            opacity: 0.2,
            //map: createCanvasMaterial('#'+hexColor, 128),

        });

        var hazars = new THREE.Points(Geometry, starsMaterial);
        hazars.rotation.z = 1.55;
        hazars.position.y = -150;

        hazars.position.z = -100;

        scene.add(hazars);
        
        return hazars;
    }


    function onMouseMove(e) {
        var k = 0.1;
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY =  - (e.clientY / window.innerHeight) * 2 + 1;
    }


    function handleOrientation(event) {
        var k = 1.5;
        absolute = event.absolute;
        alpha    = event.alpha;
        beta     = event.beta * k;
        gamma    = event.gamma * k;

        // Do stuff with the new orientation data
    }


    return [scene, grid];

};

var init_scene = init_scene();
var scene = init_scene[0];
var grid = init_scene[1];

