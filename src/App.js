require('../main.css');

import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

import * as THREE from 'three';
import World from './objects/World.js';
import Input from './Input';
import Data from './Data';
import { Stats } from 'three-stats';
import Global, { GLOBE_RADIUS } from './Global';
import Overlay from './Overlay';

var camera, scene, renderer;
var world;
var statsFPS;
var input;
var clock;
var data;
var overlay;

init();
animate();

function init() {

	clock = new THREE.Clock();

	// Renderer
	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor(0x110033);
	//renderer.sortObjects = false;
	document.body.appendChild( renderer.domElement );

	// Camera
	var aspect = window.innerWidth/window.innerHeight;
	var width = 400;
	var height = width/aspect;
	camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, 0, 200);
	camera.up = new THREE.Vector3(0,1,0);
    camera.position.z = 100;

    // Main Scene
	scene = new THREE.Scene();

	// World
	world = new World();

	// Debug
    //camera.position.y = 15;
    //camera.lookAt(new THREE.Vector3(0,0,0));

	var ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.5);
	camera.add(ambientLight);

	var directionalLight = new THREE.DirectionalLight(0xffffff, 0.4);
	directionalLight.position.x = 0.0;
	directionalLight.position.y = 0.0;
	directionalLight.position.z = 1.0;
	camera.add(directionalLight);

	// Add Objects to scene
	scene.add(camera);
	scene.add(world);

	input = new Input(world);

	// Draw FPS
	statsFPS = new Stats();

	data = new Data(world);
	Global.data = data;
	Global.world = world;

	data.load();

	overlay = new Overlay();
}

function animate() {

	statsFPS.begin();

	requestAnimationFrame(animate);

	var dt = clock.getDelta();
	input.update(dt);
	world.update(dt);
	overlay.update(dt);
	
	renderer.render(scene, camera);

	statsFPS.end();
}

// Resize
function windowResizeHandler() { 
	const { innerHeight, innerWidth } = window;
	renderer.setSize(innerWidth, innerHeight);

	var aspect = window.innerWidth/window.innerHeight;
	var height = GLOBE_RADIUS*2.0;
	var width = height*aspect;
	camera.top = height / 2;
	camera.left = width / - 2;
	camera.right = width / 2;
	camera.bottom = height / -2;
	camera.updateProjectionMatrix();

	// Align bottom right
	statsFPS.domElement.style.position = 'absolute';
	statsFPS.domElement.style.left = (window.innerWidth - 80)+'px';
	statsFPS.domElement.style.top = (window.innerHeight - 47)+'px';

	var fpsElement = document.getElementById('fps');
	if(!fpsElement.lastChild){
		//fpsElement.appendChild(statsFPS.domElement);
	}
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler);

