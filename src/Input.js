var inputInstance;
import Global, { GLOBE_RADIUS, MIN_SCALE, MAX_SCALE } from './Global';
import { Clamp, Remap } from './utils/MathUtils';

export default class Input {

	constructor(world) {
		inputInstance = this;
		this.world = world;
		this.rotationY = 0;
		this.worldDstScale = 0;
		this.mouseClicked = false;
		this.lastX = 0;
		this.lastY = 0;
		this.accX = 0;
		this.accY = 0;
		this.speedX = 0;
		this.speedY = 0;
		Global.movingInChart = false;

		// Keyboard
		document.addEventListener('keydown', this.keydown, false);
		document.addEventListener('keyup', this.keyup, false);
		
		var container = document.getElementById( 'ThreeJS' );
		if(Global.mobile)
		{
			// Touchscreen
			container.addEventListener('touchstart', this.inputdown, false);
			container.addEventListener('touchmove', this.inputmove, false);
			container.addEventListener('touchend', this.inputup, false);

			// Pitch to zoom
			container.addEventListener('gesturestart', function(e) {
				Global.input.pinchZoom = 1.0;
			}, false);
			container.addEventListener('gesturechange', function(e) {
				var delta = Global.input.pinchZoom - e.scale;
				var newScale = Global.world.scale.x - delta*10.0;

				// Limit Scale
				newScale = Clamp(newScale, 3.0, 40.0);

				Global.input.pinchZoom = e.scale;
				Global.world.scale.x = newScale;
				Global.world.scale.y = newScale;
				Global.world.scale.z = newScale;

				inputInstance.normalizedMousePos = undefined;
			}, false);

		}else{
			// Mouse
			container.addEventListener('wheel', this.wheel, false);
			container.addEventListener('mousemove', this.inputmove, false);
			container.addEventListener('mousedown', this.inputdown, false);
			document.addEventListener('mouseup', this.inputup, false);
		}
	}

	calculateNormalizedMousePos(x, y) {
		var threejsWidth = Global.camera.right*2.0;
		var threejs_x = (x*threejsWidth)/window.innerWidth;
		var n_x = (threejs_x/threejsWidth - 0.5)/0.5;

		var threejsHeight = Global.camera.top*2.0;
		var threejs_y = (y*threejsHeight)/window.innerHeight;
		var n_y = -(threejs_y/threejsHeight - 0.5)/0.5;

		inputInstance.normalizedMousePos = {x: n_x, y: n_y};
	}

	inputmove(e) {
		if(e.touches && e.touches.length > 1)
			return;

		if((Global.movingInChart || Global.movingInChart == undefined) && !Global.mobile){
			Global.movingInChart = false;
			Global.data.day = Global.data.saveLastDay;
			Global.timeline.updateDate(false);
		}


		if(!Global.mobile)
			Global.world.countries.move();

		var x;
		var y;
		if(Global.mobile){
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
		}else{
			x = e.clientX;
			y = e.clientY;
		}

		if(inputInstance.mouseClicked)
		{
			var deltaX = x - inputInstance.lastX;
			var deltaY = y - inputInstance.lastY;

			var moveSpeed = Remap(Global.world.scale.x, MIN_SCALE, MAX_SCALE, 200, 1500);

			inputInstance.accX += deltaY/moveSpeed;
			inputInstance.accY += deltaX/moveSpeed;

			inputInstance.speedX = inputInstance.accX;
			inputInstance.speedY = inputInstance.accY;

			inputInstance.lastX = x;
			inputInstance.lastY = y;
		}else{
			inputInstance.calculateNormalizedMousePos(x, y);
		}

		if(Global.mobile){
			// Cancel selection if we touch moved
			inputInstance.normalizedMousePos = undefined;
		}

		if(Global.timeline.isAnimationRunning && Global.followCamera && inputInstance.mouseClicked){
			Global.setFollowCamera(false);
			$('input#checkboxCameraFollowId').prop('checked', false);
		}
	}

	inputdown(e) {		
		var x;
		var y;
		if(Global.mobile){
			x = e.touches[0].clientX;
			y = e.touches[0].clientY;
		}else{
			x = e.clientX;
			y = e.clientY;
		}

		inputInstance.mouseClicked = true;
		inputInstance.lastX = x;
		inputInstance.lastY = y;

		inputInstance.speedX = 0;
		inputInstance.speedY = 0;

		if(!Global.mobile)
			Global.world.countries.select();
		else
			inputInstance.calculateNormalizedMousePos(x, y);

	}

	inputup(e) {
		if(!Global.mobile)
			Global.world.countries.deselect();
		else
			Global.world.countries.selectCountry();

		var x;
		var y;
		inputInstance.mouseClicked = false;

	}

	keydown(e) {
		var key = e.keyCode;
		if(key == 37) // left
		{
			inputInstance.pressLeft = true;
			//Global.data.subTime(0.1);

		}else if(key == 39) // right
		{
			inputInstance.pressRight = true;
			//Global.data.addTime(0.1);

		}else if(key == 32) // space
		{
			Global.timeline.playPauseClick();
		}else if(key == 73) // i
		{
			$('#fps').toggle();
		}


	}

	keyup(e) {
		var key = e.keyCode;

		if(key == 37) // left
		{
			inputInstance.pressLeft = false;
		}else if(key == 39) // right
		{
			inputInstance.pressRight = false;
		}
	}

	wheel(e) {
		var scale = inputInstance.world.worldScale;
		scale -= e.deltaY/50;
		scale = Clamp(scale, MIN_SCALE, MAX_SCALE);
		inputInstance.world.worldScale = scale;
	}

	updateTimeSlider() {
		var slider = document.getElementById("timeRange");

		var backupFunction = slider.oninput; // Don't call update function
		var perc = Global.data.day/Global.data.lastDay;
		slider.value = perc*1000;
		slider.oninput = backupFunction;
		Global.timeline.updateDate(true);
	}

	update(dt) {

		var rY = inputInstance.world.getRotationY();
		var rX = inputInstance.world.getRotationX();
		rX += inputInstance.accX;
		rY += inputInstance.accY;

		inputInstance.speedX *= 0.9;
		inputInstance.speedY *= 0.9;
		// If no mouse down, apply momentum
		if(!this.mouseClicked){
			rX += inputInstance.speedX;
			rY += inputInstance.speedY;
		}

		// Limit X-Axis rotation
		rX = Clamp(rX, -Math.PI/2.0, Math.PI/2.0);

		inputInstance.world.setRotationY(rY);
		inputInstance.world.setRotationX(rX);

		inputInstance.accX = 0;
		inputInstance.accY = 0;

		// Change Time
		if(this.pressLeft)
		{
			Global.data.subTime(0.1);
			this.updateTimeSlider();
		}
		if(this.pressRight)
		{
			Global.data.addTime(0.1);
			this.updateTimeSlider();
		}
	}
}