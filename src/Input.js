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

		// Keyboard
		document.addEventListener('keydown', this.keydown, false);
		document.addEventListener('keyup', this.keyup, false);

		// Mouse
		document.addEventListener('wheel', this.wheel, false);
		document.addEventListener('mousemove', this.mousemove, false);
		document.addEventListener('mousedown', this.mousedown, false);
		document.addEventListener('mouseup', this.mouseup, false);

	}

	mousemove(e) {
		if(inputInstance.mouseClicked)
		{
			var deltaX = e.clientX - inputInstance.lastX;
			var deltaY = e.clientY - inputInstance.lastY;

			var moveSpeed = Remap(Global.world.scale.x, MIN_SCALE, MAX_SCALE, 200, 1500);

			inputInstance.accX += deltaY/moveSpeed;
			inputInstance.accY += deltaX/moveSpeed;

			inputInstance.speedX = inputInstance.accX;
			inputInstance.speedY = inputInstance.accY;

			inputInstance.lastX = e.clientX;
			inputInstance.lastY = e.clientY;

		}
	}

	mousedown(e) {
		inputInstance.mouseClicked = true;
		inputInstance.lastX = e.clientX;
		inputInstance.lastY = e.clientY;

		inputInstance.speedX = 0;
		inputInstance.speedY = 0;
	}

	mouseup(e) {
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

		/*
		// Testing: Checking if world goes inside left panel, adjust opacity
		var w_units = Math.abs(Global.camera.left*2.0);
		var w_px = window.innerWidth;
		var pixelsToUnits = w_units/w_px;
		var panelW_units = 300*pixelsToUnits; // 300 is panel width
		var leftWorldPos = w_units/2.0 - scale;
		if(leftWorldPos < panelW_units)
		{
			//$('#infoLabelId').css({ 'background-color': 'rgba(0, 50, 100, 0.5)' });
		}else{
			//$('#infoLabelId').css({ 'background-color': 'rgba(0, 50, 100, 0.0)' });
		}
		*/

	}

	updateTimeSlider() {
		var slider = document.getElementById("timeRange");

		var backupFunction = slider.oninput; // Don't call update function
		var perc = Global.data.day/Global.data.lastDay;
		slider.value = perc*1000;
		slider.oninput = backupFunction;
		Global.timeline.updateTooltip();
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

		if(Global.timeline.isAnimationRunning && Global.followCamera && this.mouseClicked){
			Global.setFollowCamera(false);
			$('input#checkboxCameraFollowId').prop('checked', false);
		}


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