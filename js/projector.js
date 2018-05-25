/**
 * projector.js
 *
 * depends on:
 *   js/loaders/ColladaLoader.js
 *   js/controls/OrbitControls.js
 *   js/controls/DragControls.js
 *   js/Detector.js
 *   js/libs/stats.min.js
 */

/**
 * Main document functions
 */
// $(document).ready(function() {
//     $("info2").html("more stuff");
// });

if ( ! Detector.webgl ) Detector.addGetWebGLMessage();

var helpText =

$(document).ready( function() {
    $("#helpBtn").click( function () {
        toggleHelp();
        // if (Modernizr.touchevents) {
        //     $("#helpOverlayTouch").toggle();
        // }
        // else {
        //     $("#helpOverlay").toggle();
        // }
    })
})

var container, stats, clock, controls;
var displayWidth, displayHeight;
var camera, scene, renderer, mixer;
var cameraData;
var directionalLight1, directionalLight2;
var dirLight1Helper, dirLight2Helper;

var raycaster, clipCoordinates;
var displayWindow = {
    left: 0,
    top: 0,
    width: 0,
    height: 0
};


var projector, projectorScreen;
var projectorBB, projectorBox, projectorBoxA;
var displayRect;
var objects = [];

var debugObject = {};

init();
animate();

function init() {



    /* Use #projectorCanvas as WebGL display window. */
    var cHeight;
    if (window.innerWidth / window.innerHeight < 1) {
        /* At least 16:10 for narrow (mobile) screens) to display projector and screen in window */
        cHeight = Math.round(window.innerWidth * 0.625);
    }
    else {
        cHeight = Math.round(window.innerHeight * 0.7);
    }
    $('#projectorCanvas').height(cHeight);
    $('#contentLeft').height(cHeight);
    $('#contentRight').height(cHeight);

    setDisplayWindow("projectorCanvas");

    container = document.getElementById( 'projectorCanvas' );

    showBrowserWindowSize(); // testing
    showCanvasWindowSize(); // testing
    updateDebugDisplay(); // testing

    // camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 10000 );
    // camera = new THREE.PerspectiveCamera( 45, displayWidth / displayHeight, 0.1, 10000 );
    camera = new THREE.PerspectiveCamera( 45, displayWindow.width / displayWindow.height, 0.1, 10000 );
    // camera.position.set( 15, 10, - 15 );
    // x, y, z
    // camera.position.set( 0, 1.5, -3 );
    camera.position.set( 2, 2, -4.5 );

    scene = new THREE.Scene();
    // scene.background = new THREE.Color().setHSL( 0.6, 0, 1 );
    scene.background = new THREE.Color().setHSL( 0.6, 0, 0.15 );
    // scene.fog = new THREE.Fog( scene.background, 1, 5000 );

    clock = new THREE.Clock();

    // loading manager LoadingManager( onLoad, onProgress, onError)
    // only using onLoad function, do the following when everything is loaded.

    var loadingManager = new THREE.LoadingManager( function() {


        // scene.add(projector);

        // Create a bounding box around projector object so it can be picked and dragged.
        projectorBB = new THREE.Box3().setFromObject(projector);
        // var bMinX = projectorBB.min.x;
        // var bMinY = projectorBB.min.y;
        // var bMinZ = projectorBB.min.z;
        // var bMaxX = projectorBB.max.x;
        // var bMaxY = projectorBB.max.y;
        // var bMaxZ = projectorBB.max.z;
        // var bWidth = Math.abs(bMinX - bMaxX);
        // var bHeight = Math.abs(bMinY - bMaxY);
        // var bDepth = Math.abs(bMinZ - bMaxZ);
        //
        // $("#infoLeft").html("box min: "
        //     + "<br>&nbsp;&nbsp;x = " + bMinX
        //     + "<br>&nbsp;&nbsp;y = " + bMinY
        //     + "<br>&nbsp;&nbsp;z = " + bMinZ
        //     + "<br>box MAX: "
        //     + "<br>&nbsp;&nbsp;x = " + bMaxX
        //     + "<br>&nbsp;&nbsp;y = " + bMaxY
        //     + "<br>&nbsp;&nbsp;z = " + bMaxZ
        //     + "<br>box DIMENSIONS: "
        //     + "<br>&nbsp;&nbsp;w = " + bWidth
        //     + "<br>&nbsp;&nbsp;h = " + bHeight
        //     + "<br>&nbsp;&nbsp;d = " + bDepth
        // );

        // projectorBox = new THREE.Mesh( new THREE.BoxGeometry(width, height, depth), new THREE.MeshLambertMaterial({ color : 0xFFF0FF }) );
        projectorBox = new THREE.Mesh(
            new THREE.BoxGeometry(
                Math.abs(projectorBB.min.x - projectorBB.max.x),
                Math.abs(projectorBB.min.y - projectorBB.max.y),
                Math.abs(projectorBB.min.z - projectorBB.max.z)
            ), new THREE.MeshLambertMaterial({ color : 0xFFF0FF, visible: false }) ); // Bounding box is invisible
        projectorBox.name = "projectorBox";
        projectorBox.position.set(0, 0, 0);

        projectorBox.add(projector);

        scene.add(projectorBox);
        projectorBox.position.set(0, 1.5, 0); // Put projector and bounding box in scene FIRST, then move them.
        objects.push(projectorBox);

        // Create a bounding box with BoxHelper, which creates 12 yellow line segments outlining the bounding box.
        // projectorBoxA = new THREE.BoxHelper(projector);
        // projectorBoxA.name = "projectorBoxA";
        // scene.add(projectorBoxA);
        // // objects.push(projectorBoxA);

        // projectorBoxB = new THREE.BoxHelper(projectorBox);
        // projectorBoxB.name = "projectorBoxB";
        // scene.add(projectorBoxB);

        // Merge bounding box and projector?
        var projectorMesh = new THREE.Mesh(projector);
        // var projectorBoxMesh = new THREE.Mesh(projectorBoxA);
        // var singleGeometry = new THREE.Geometry();
        // singleGeometry.merge(projectorMesh);
        // singleGeometry.merge(projectorBoxMesh);
        // var material = new THREE.MeshPhongMaterial({color: 0xFF0000});
        // var mesh = new THREE.Mesh(singleGeometry, materal);
        // scene.add(mesh);

        scene.add(projectorScreen);

    } );

    // collada

    // var loader = new THREE.ColladaLoader();

    // Calls back to loadingManager to provide updates for onLoad, onProgress, onError
    var loader = new THREE.ColladaLoader(loadingManager);

    // Loads Projector1.dae, and creates onLoad function
    loader.load( './models/collada/Projector1.dae', function ( collada ) {

        projector = collada.scene;
        projector.name = "projector-benq";
        // projector.position.set(0, 1, 0);
        projector.position.set(0, 0, -0.103); // Adjust projector location in scene to stay within bounding box

    } );

    // var manager = new THREE.LoadingManager();
    // manager.onProgress = function ( item, loaded, total ) {
    //     console.log( item, loaded, total );
    // };
    //
    // var textureLoader = new THREE.TextureLoader( manager );
    // var texture = textureLoader.load( 'textures/UV_Grid_Sm.jpg' );


    // projector .obj model

    // var onProgress = function ( xhr ) {
    //     if ( xhr.lengthComputable ) {
    //         var percentComplete = xhr.loaded / xhr.total * 100;
    //         console.log( Math.round(percentComplete, 2) + '% downloaded' );
    //     }
    // };

    // var onError = function ( xhr ) {
    // };

    // var loader = new THREE.OBJLoader( manager );
    // // loader.load( 'models/obj/Optoma/OptomaProjector.obj', function ( object ) {
    // // loader.load( 'models/obj/blender/blenderStuff.obj', function ( object ) {
    // loader.load( 'models/obj/Projector2.obj', function ( object ) {
    // // loader.load( 'models/obj/male02/male02.obj', function ( object ) {
    //     object.traverse( function ( child ) {
    //         if ( child instanceof THREE.Mesh ) {
    //             child.material.map = texture;
    //         }
    //     } );
    //     // object.position.y = - 95;
    //
    // const projectorGroup = new THREE.Group();
    // projectorGroup.scale.set(0.02, 0.02, 0.02);
    // projectorGroup.position.set(0, 1, 0);
    // // projectorGroup.position.set(-5, 5, 0);
    // // projectorGroup.name = "lauren";
    // projectorGroup.add(object);
    //
    //     // object.position.y = - 5;
    //     // scene.add( object );
    // scene.add( projectorGroup);
    // }, onProgress, onError );



    var screenLoader = new THREE.ColladaLoader(loadingManager);
    screenLoader.load( './models/collada/ProjectorScreen120inch.dae', function ( collada ) {

        projectorScreen = collada.scene;
        projectorScreen.name = "projector-screen-avia";
        projectorScreen.position.set(4, 1, 0);

    } );

    // objects.push(projector);
    // objects.push(projectorScreen);


    //

    var geometry = new THREE.BoxGeometry( 2, 2, 2 );

    for ( var i = 0; i < 5; i ++ ) {

        var object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

        object.name = "box-" + i;

        object.position.x = Math.random() * 5 - 2.5;
        object.position.y = Math.random() * 3 - 1.5;
        object.position.z = Math.random() * 4 - 2;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        object.scale.x = Math.random() * 0.1 + 0.1;
        object.scale.y = Math.random() * 0.1 + 0.1;
        object.scale.z = Math.random() * 0.1 + 0.1;

        object.castShadow = true;
        object.receiveShadow = true;

        scene.add( object );

        objects.push( object );

    }

    //

    // var gridHelper = new THREE.GridHelper( 10, 20 );
    // gridHelper.name = "myGrid";
    // scene.add( gridHelper );

    // var floorGeometry = new THREE.BoxGeometry(10,0.1,10);
    // var floorMaterial = new THREE.MeshBasicMaterial({color: 0x00ff00});


    var floorGeometry = new THREE.PlaneGeometry(10,10,10,10);

    var textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        // resource URL
        // 'textures/UV_Grid_Sm.jpg',
        // 'textures/hardwood2_diffuse.jpg',
        'textures/Wood_Floor_007_COLOR.jpg',

        // onLoad callback
        function (texture) {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            // texture.repeat.set(10,10);
            texture.repeat.set(3,3);
            var floorMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                side: THREE.DoubleSide
            });
            var floorMesh = new THREE.Mesh (floorGeometry, floorMaterial);
            floorMesh.position.set(0, 0, 0);
            floorMesh.rotateX(THREE.Math.degToRad(90));
            scene.add(floorMesh);

        },

        // onProgress callback not supported
        undefined,

        // onError callback
        function (err) {
            // console.error('Error loading texture.');
            console.log('Error loading texture.');
        }
    );

    // var floorMaterial = new THREE.MeshBasicMaterial({color: 0xffebcd, side: THREE.DoubleSide});
    // var floorMesh = new THREE.Mesh (floorGeometry, floorMaterial);
    // floorMesh.position.set(0, 0, 0);
    // floorMesh.rotateX(THREE.Math.degToRad(90));
    // scene.add(floorMesh);

    //

    // hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.6 );
    // hemiLight.color.setHSL( 0.6, 1, 0.6 );
    // hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
    // hemiLight.position.set( 0, 50, 0 );
    // scene.add( hemiLight );
    //
    // hemiLightHelper = new THREE.HemisphereLightHelper( hemiLight, 10 );
    // scene.add( hemiLightHelper );
    //
    //
    // // GROUND
    // var groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
    // var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
    // groundMat.color.setHSL( 0.095, 1, 0.75 );
    //
    // var ground = new THREE.Mesh( groundGeo, groundMat );
    // ground.rotation.x = -Math.PI/2;
    // ground.position.y = -33;
    // scene.add( ground );
    //
    // ground.receiveShadow = true;
    //
    // // SKYDOME
    //
    // var vertexShader = document.getElementById( 'vertexShader' ).textContent;
    // var fragmentShader = document.getElementById( 'fragmentShader' ).textContent;
    // var uniforms = {
    //     topColor:    { value: new THREE.Color( 0x0077ff ) },
    //     bottomColor: { value: new THREE.Color( 0xffffff ) },
    //     offset:      { value: 33 },
    //     exponent:    { value: 0.6 }
    // };
    // uniforms.topColor.value.copy( hemiLight.color );
    //
    // scene.fog.color.copy( uniforms.bottomColor.value );
    //
    // var skyGeo = new THREE.SphereGeometry( 4000, 32, 15 );
    // var skyMat = new THREE.ShaderMaterial( { vertexShader: vertexShader, fragmentShader: fragmentShader, uniforms: uniforms, side: THREE.BackSide } );
    //
    // var sky = new THREE.Mesh( skyGeo, skyMat );
    // scene.add( sky );

    //

    // var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
    // var ambientLight = new THREE.AmbientLight( 0xffffff, 0.2 );
    // scene.add( ambientLight );

    // var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
    // directionalLight.position.set( 1, 1, - 1 );
    // scene.add( directionalLight );

    // Light above, in front and to the left of projector
    directionalLight1 = new THREE.DirectionalLight( 0xffffff, 0.8 );
    // directionalLight1.position.set( 2, 3, -2 );
    directionalLight1.position.set( 3, 4, -3 );
    directionalLight1.name = "dirLight1";
    scene.add( directionalLight1 );

    // Show light location and direction to see where it is in the view port.
    // dirLight1Helper = new THREE.DirectionalLightHelper(directionalLight1, 1);
    // scene.add( dirLight1Helper );


    // Light above, behind and to the right of projector
    directionalLight2 = new THREE.DirectionalLight( 0xffffff, 0.8 );
    // directionalLight2.position.set( -2, 3, 2 );
    directionalLight2.position.set( -3, 4, 3 );
    directionalLight2.name = "dirLight2";
    scene.add( directionalLight2 );

    // Show light location and direction to see where it is in the view port.
    // dirLight2Helper = new THREE.DirectionalLightHelper(directionalLight2, 1);
    // scene.add( dirLight2Helper );

    // var hemiLight = new THREE.HemisphereLight( 0xffffbb, 0x080820, 1 );
    // scene.add( hemiLight );
    //

    // renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    // renderer.setSize( window.innerWidth, window.innerHeight );
    // renderer.setSize( displayWidth, displayHeight );
    renderer.setSize( displayWindow.width, displayWindow.height );
    container.appendChild( renderer.domElement );

    //

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    // controls.target.set( 0, 1, 0 );
    controls.target.set( 2, 2, 0 );
    controls.update();

    //

    // controls = new THREE.TrackballControls( camera );
    // controls.rotateSpeed = 1.0;
    // controls.zoomSpeed = 1.2;
    // controls.panSpeed = 0.8;
    // controls.noZoom = false;
    // controls.noPan = false;
    // controls.staticMoving = true;
    // controls.dynamicDampingFactor = 0.3;

    var dragControls = new THREE.DragControls( objects, camera, renderer.domElement );
    dragControls.addEventListener( 'dragstart', function ( event ) { controls.enabled = false; } );
    dragControls.addEventListener( 'dragend', function ( event ) { controls.enabled = true; } );

    // Use Raycaster to determine if mouse is touching an object.
    raycaster = new THREE.Raycaster();
    clipCoordinates = new THREE.Vector2();


    // stats = new Stats();
    // container.appendChild( stats.dom );

    //

    window.addEventListener( 'resize', onWindowResize, false );
    document.addEventListener( 'keydown', onKeyDown, false );
    window.addEventListener( 'mousemove', onMouseMove, false );

}

function onWindowResize() {

    /* Match these to #projectorCanvas in stylesheet */
    // displayWidth = document.getElementById('projectorCanvas').clientWidth;
    // displayHeight = document.getElementById('projectorCanvas').clientHeight;

    // setDisplayWindow("#projectorCanvas");
    setDisplayWindow("projectorCanvas");

    showBrowserWindowSize(); // testing
    showCanvasWindowSize(); // testing
    updateDebugDisplay(); // testing

    // camera.aspect = window.innerWidth / window.innerHeight;
    // camera.aspect = displayWidth / displayHeight;
    camera.aspect = displayWindow.width / displayWindow.height;
    camera.updateProjectionMatrix();

    // renderer.setSize( window.innerWidth, window.innerHeight );
    // renderer.setSize( displayWidth, displayHeight );
    renderer.setSize( displayWindow.width, displayWindow.height );

}

function onKeyDown ( event ) {

    switch ( event.keyCode ) {

        // TODO: Use Raycaster to see if mouse intersects bounding box of projector (or screen)
        // TODO:

        case 81: // q (move projector up, y-axis)
            // projector.position.add(new THREE.Vector3(0, 0.03, 0));
            projectorBox.position.add(new THREE.Vector3(0, 0.03, 0));
            break;

        case 69: // e (move projector down, y-axis)
            // projector.position.sub(new THREE.Vector3(0, 0.03, 0));
            projectorBox.position.sub(new THREE.Vector3(0, 0.03, 0));
            break;

        case 65: // a (move projector left, backward on z-axis)
            // projector.position.sub(new THREE.Vector3(0, 0, 0.03));
            projectorBox.position.sub(new THREE.Vector3(0, 0, 0.03));
            break;

        case 68: // d (move projector right, forward on z-axis)
            // projector.position.add(new THREE.Vector3(0, 0, 0.03));
            projectorBox.position.add(new THREE.Vector3(0, 0, 0.03));
            break;

        case 87: // w (move projector toward screen, backward on x-axis )
            // projector.position.add(new THREE.Vector3(0.03, 0, 0));
            projectorBox.position.add(new THREE.Vector3(0.03, 0, 0));
            break;

        case 83: // s (move projector away from screen, forward on x-axis)
            // projector.position.sub(new THREE.Vector3(0.03, 0, 0));
            projectorBox.position.sub(new THREE.Vector3(0.03, 0, 0));
            break;

        case 90: // z (toggle left directional light)
            directionalLight1.visible = !directionalLight1.visible;
            // dirLight1Helper.visible = !dirLight1Helper.visible;
            break;

        case 67: // c (toggle right directional light)
            directionalLight2.visible = !directionalLight2.visible;
            // dirLight2Helper.visible = !dirLight2Helper.visible;
            break;

        case 86: // v (toggle material visible)
            projectorBox.material.visible = !projectorBox.material.visible;
            break;

        case 72: // h (toggle help screen)
            toggleHelp();
            break;

        case 88: // x (toggle debug info help screen)
            toggleDebugInfo();
            break;


        // case 37: // left arrow
        // 	console.log("left");
        // 	break;
        //
        // case 39: // right arrow
        //    console.log("right");
        // 	break;
        //
        // case 38: // up arrow
        //    console.log("up");
        // 	break;
        //
        // case 40: // down arrow
        //    console.log("down");
        // 	break;


    }

}


/**
 * Set size and coordinates of WebGL display window
 * divId: ID of element (don't include # at the beginning used for jQuery)
 * TODO: rewrite using .getBoundingClientRect. If returns null, use old method.
 * Example:
 * 		var rect = _domElement.getBoundingClientRect();
 * 	    _mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
 * 	    _mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
 */
function setDisplayWindow( divId ) {


    // TESTING - BEGIN
    // document.getElementById("infoRight1").innerHTML = "window.innerWidth: " + window.innerWidth +
    //     "<br>window.innerHeight: " + window.innerHeight +
    //     "<br>displayWidth: " + displayWindow.width +
    //     "<br>displayHeight: " + displayWindow.height; // testing
    // $("#infoRight2").html("mainContainer position:<br>"
    //     + JSON.stringify($("#mainCont").position(), null, 2)
    //     + "<br>mainContainer offset:<br>"
    //     + JSON.stringify($("#mainCont").offset(), null, 2)
    //     + "<br>contentContainer position:<br>"
    //     + JSON.stringify($("#contentCont").position(), null, 2)
    //     + "<br>contentContainer offset:<br>"
    //     + JSON.stringify($("#contentCont").offset(), null, 2)
    //     + "<br>projectorCanvas position:<br>"
    //     + JSON.stringify($("#projectorCanvas").position(), null, 2)
    //     + "<br>projectorCanvas offset:<br>"
    //     + JSON.stringify($("#projectorCanvas").offset(), null, 2)
    //     + "<br>BoundingClientRect:<br>"
    //     + JSON.stringify(displayRect, null, 2)
    // );

    var divObject = {};
    divObject['id'] = $("#" + divId).attr("id");
    // divObject['position'] = JSON.stringify($("#" + divId).position);
    divObject['position'] = $("#" + divId).position();
    divObject['offset'] = $("#" + divId).offset();
    divObject['width'] = $("#" + divId).width();
    divObject['height'] = $("#" + divId).height();

    debugObject['div'] = divObject;
    // debugObject['div.id'] = "shite";

    updateDebugDisplay();

    // TESTING - END

    // displayWindow.width = document.getElementById('projectorCanvas').clientWidth;
    // displayWindow.height = document.getElementById('projectorCanvas').clientHeight;
    displayWindow.width = $("#" + divId).width();
    displayWindow.height = $("#" + divId).height();

    /**
     * Calculate left (inside) edge (x) of <div> centered in browser window
     */
    displayWindow.left = ((window.innerWidth - displayWindow.width) / 2) + 1;

    /**
     * Calculate top (inside) edge (y) of <div>. Add 2 for padding or something
     */
    // displayWindow.top = ($("#projectorCanvas").position().top + 2);
    displayWindow.top = ($("#" + divId).position().top + 2);

    // Unnecessary to set lower-right coordinates (lr.x, lr.y) for now

    // Try .getBoundingClientRect()
    // displayRect = $(divId).getBoundingClientRect();
    // displayRect = document.getElementById(divId).getBoundingClientRect();
    var div = document.getElementById(divId);
    // var div = $(divId);
    if (div.getBoundingClientRect()) {
        var rect = div.getBoundingClientRect();
    }

}


function onMouseMove( event ) {

    /**
     * Calculate mouse location in WebGL display window expressed as clip coordinates,
     * where bounding rectangle is (-1,1) to (1,-1) with (0,0) in the center.
     * Clip coordinates are called "normalized device coordinates" in three.js.
     *
     * BROWSER WINDOW
     * event.clientX:  mouse x position in browser window, starts at 0 (left)
     * event.clientY:  mouse y position in browser window, starts at 0 (top)
     *
     * WEBGL DISPLAY WINDOW
     * displayWindow.left:    event.clientX of (inside) left edge of WebGL display window
     * displayWindow.top:     event.clientY of (inside) top edge of WebGL display window
     * displayWindow.width:   width of WebGL display window
     * displayWindow.height:  height of WebGL display window
     *
     * CLIP COORDINATES (NORMALIZED DEVICE COORDINATES)
     * clipCoordinates.x =  (((event.clientX - displayWindow.left) / displayWindow.width) x 2) - 1
     * clipCoordinates.y = -(((event.clientY - displayWindow.top) / displayWindow.height) x 2) + 1
     */

    clipCoordinates.x =  (((event.clientX - displayWindow.left) / displayWindow.width) * 2) - 1;
    clipCoordinates.y = -(((event.clientY - displayWindow.top) / displayWindow.height) * 2) + 1;


    // TESTING - BEGIN
    // document.getElementById("infoRight1").innerHTML = "window.innerWidth: " + window.innerWidth +
    //     "<br>window.innerHeight: " + window.innerHeight +
    //     "<br>displayWidth: " + displayWindow.width +
    //     "<br>displayHeight: " + displayWindow.height; // testing
    // $("#infoRight2").html("mainContainer position:<br>"
    //     + JSON.stringify($("#mainCont").position(), null, 2)
    //     + "<br>mainContainer offset:<br>"
    //     + JSON.stringify($("#mainCont").offset(), null, 2)
    //     + "<br>contentContainer position:<br>"
    //     + JSON.stringify($("#contentCont").position(), null, 2)
    //     + "<br>contentContainer offset:<br>"
    //     + JSON.stringify($("#contentCont").offset(), null, 2)
    //     + "<br>projectorCanvas position:<br>"
    //     + JSON.stringify($("#projectorCanvas").position(), null, 2)
    //     + "<br>projectorCanvas offset:<br>"
    //     + JSON.stringify($("#projectorCanvas").offset(), null, 2)
    //     + "<br>BoundingClientRect:<br>"
    //     + JSON.stringify(displayRect, null, 2)
    // );

    debugObject['mouseX'] = event.clientX;
    debugObject['mouseY'] = event.clientY;
    updateDebugDisplay();

    // TESTING - END

}


function animate() {

    requestAnimationFrame( animate );

    render();
    // stats.update();

}

function render() {

    var delta = clock.getDelta();

    // if ( mixer !== undefined ) {
    //
    // 	mixer.update( delta );
    //
    // }

    // controls.update(); // use with trackball control

    cameraData = camera.toJSON();

    // document.getElementById("myInfo").innerHTML = "Camera Stuff:<br><br>" + JSON.stringify(cameraData);
    // document.getElementById("info").innerHTML = JSON.stringify(cameraData);
    // console.log(JSON.stringify(cameraData));

    // update the picking ray with the camera and mouse position (in "normalized device coordinates")
    raycaster.setFromCamera( clipCoordinates, camera );

    // calculate objects intersecting the picking ray, set recursive = true to check descendants because
    // the projector and projectorScreen are descendants.
    // projector

    // var intersects = raycaster.intersectObjects( scene.children );
    var intersects = raycaster.intersectObjects( scene.children, true );

    var posArray = [];

    // TESTING - begin
    if (intersects.length > 0) {
        debugObject["intersect.name"] = intersects[0].object.name;
    }
    else {
        debugObject["intersect.name"] = "-none-";
    }
    // TESTING - end



    renderer.render( scene, camera );

}


function toggleHelp() {
    if (Modernizr.touchevents) {
        $("#helpOverlayTouch").toggle();
        // $("#helpOverlayTouch").toggleClass("overlayInvisible");
    }
    else {
        // $("#helpOverlay").toggle();
        // alert("toggle");
        // $("#helpOverlay").attr("display", "none");
        // $("#helpOverlay").css("display", "none");
        // alert("display (" + $("#helpOverlay").css("display") + ")");
        if ($("#helpOverlay").css("display") == "none") {
            $("#helpOverlay").css("display", "block");
        }
        else {
            $("#helpOverlay").css("display", "none");
        }
        // $("#helpOverlay").css("display", "block");
        // $(".helpOverlay").toggleClass("overlayInvisible");
    }

    if ($("#helpBtn").text() == "Show Help") {
        $("#helpBtn").text("Hide Help");
    }
    else {
        $("#helpBtn").text("Show Help")
    }
}


function toggleDebugInfo() {
    if ($("#debugOverlay").css("display") == "none") {
        $("#debugOverlay").css("display", "block");
    }
    else {
        $("#debugOverlay").css("display", "none");
    }
}


function updateDebugDisplay() {
    document.getElementById("debugOverlay").innerHTML = "<pre>" + JSON.stringify(debugObject, null, 2) + "</pre>";

    // $("#infoRight2").html("mainContainer position:<br>"
    //     + JSON.stringify($("#mainCont").position(), null, 2)
    //     + "<br>mainContainer offset:<br>"
    //     + JSON.stringify($("#mainCont").offset(), null, 2)
    //     + "<br>contentContainer position:<br>"
    //     + JSON.stringify($("#contentCont").position(), null, 2)
    //     + "<br>contentContainer offset:<br>"
    //     + JSON.stringify($("#contentCont").offset(), null, 2)
    //     + "<br>projectorCanvas position:<br>"
    //     + JSON.stringify($("#projectorCanvas").position(), null, 2)
    //     + "<br>projectorCanvas offset:<br>"
    //     + JSON.stringify($("#projectorCanvas").offset(), null, 2)
    //     + "<br>BoundingClientRect:<br>"
    //     + JSON.stringify(displayRect, null, 2)
    // );

}


function showBrowserWindowSize() {
    debugObject['window.innerWidth'] = window.innerWidth;
    debugObject['window.innerHeight'] = window.innerHeight;
}

function showCanvasWindowSize() {
    debugObject['canvas.width'] = displayWindow.width;
    debugObject['canvas.height'] = displayWindow.height;
}

