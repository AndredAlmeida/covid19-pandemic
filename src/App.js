import jQuery from "jquery";
window.$ = window.jQuery = jQuery;

import * as THREE from 'three';
import World from './objects/World.js';
import Input from './Input';
import Data from './Data';
import { Stats } from 'three-stats';
import Global, { GLOBE_RADIUS } from './Global';
import Overlay from './Overlay';
import Timeline from './Timeline';
import Chart from './Chart';

var camera, scene, renderer;
var world;
var statsFPS;
var input;
var clock;
var data;
var overlay;
var timeline;
var chart;

init();
animate();

function init() {

	clock = new THREE.Clock();

	// Renderer
	renderer = new THREE.WebGLRenderer( { antialias: false } );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.setClearColor(0x110033);
	var container = document.getElementById( 'ThreeJS' );
	container.appendChild(renderer.domElement);

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
	Global.mobile = window.mobileAndTabletcheck();
	if(Global.mobile)
	{
		//world.position.y = -2;
	    //camera.position.y = 3;
	}
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
	timeline = new Timeline();

	Global.timeline = timeline;
	Global.camera = camera;
	Global.input = input;

	if(!Global.mobile){
		chart = new Chart();
		Global.chart = chart;
	}
}

function animate() {

	statsFPS.begin();

	requestAnimationFrame(animate);

	var dt = clock.getDelta();
	input.update(dt);
	world.update(dt);
	overlay.update(dt);
	timeline.update(dt);

	if(!Global.mobile)
		chart.update(dt);

	renderer.render(scene, camera);

	statsFPS.end();
}

// Resize
function windowResizeHandler() { 
	const { innerHeight, innerWidth } = window;
	renderer.setSize(innerWidth, innerHeight);

	var aspect;
	var height;
	var width;
	if(window.mobileAndTabletcheck())
	{
		// Mobile? Adjust to width
		aspect = window.innerHeight/window.innerWidth;
		width = GLOBE_RADIUS*2.0;
		height = width*aspect;
	}else{
		// Desktop? Adjust to height
		aspect = window.innerWidth/window.innerHeight;
		height = GLOBE_RADIUS*2.0;
		width = height*aspect;		
	}

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
		fpsElement.appendChild(statsFPS.domElement);
		$('#fps').toggle();
	}
	if(Global.timeline)
		Global.timeline.updateDate(true);
};
windowResizeHandler();
window.addEventListener('resize', windowResizeHandler);
