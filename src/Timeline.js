import Global, { GLOBE_RADIUS, MIN_SCALE, MAX_SCALE } from './Global';
import { Remap } from './utils/MathUtils';

export default class Timeline {

	constructor() {
		this.isAnimationRunning = true;
		this.slider = document.getElementById("timeRange");
		this.slider.oninput = this.sliderMove;

		this.timelineDiv = document.getElementById("timelineDiv");
		this.timelineDiv.addEventListener('mousedown', function(e){
			e.stopPropagation();
		}, false);

		var playButton = document.getElementById("playButton");
		playButton.onclick = this.playPauseClick;

		playButton.addEventListener('keydown', function(e){
			//e.stopPropagation();
		}, false);

		this.smoothY = 0;
	}

	setPlayButton(){
		$("#buttonContent").removeClass("pause").addClass("play");
		$('#playDiv').css({ 'left': '38%' });

	}
	
	setPauseButton(){
		$("#buttonContent").removeClass("play").addClass("pause");
		$('#playDiv').css({ 'left': '36%' });

	}

	updateDate(updateTooltip){
		if(!Global.data.lastDay)
			return;

		var perc = Global.data.day/Global.data.lastDay;

		if(updateTooltip){
			var toolTipLeftPerc;
			if(Global.mobile)
				toolTipLeftPerc = perc*(window.innerWidth*0.70) - 60*perc;
			else
				toolTipLeftPerc = perc*(window.innerWidth*0.55) - 20*perc;

			$('#tooltipId').css({ 'left': toolTipLeftPerc+'px' });
			$('#tooltipId').css({ 'opacity': '1.0' });
		}

		// Update tooltip text
		var date;
		var formattedDate;

		if(perc < 1.0){
			date = Global.data.getDateForDay(Global.data.day);
			var d = new Date(date);
			const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d)
			const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d)
			const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d)
			formattedDate = `${da} ${mo} ${ye}`
		}else{
			date = "TODAY";
			formattedDate = date;
		}
		if(updateTooltip)
			$('#tooltipText')[0].innerHTML = date;
		$('#dateLabel')[0].innerHTML = formattedDate;

	}

	updateSeekPosition(){
		var perc = Global.data.day/Global.data.lastDay;
		this.slider.value = perc*1000.0;
		this.updateDate(true);
	}

	sliderMove(){
		var timeline = Global.timeline;

		var newDay = Global.data.lastDay*(this.value/1000.0);
		Global.data.day = newDay;

		timeline.isAnimationRunning = false;
		timeline.setPlayButton();
		timeline.updateDate(true);
	}

	playPauseClick(e) {
		var timeline = Global.timeline;
		if(timeline.isAnimationRunning)
		{
			timeline.isAnimationRunning = false;
			timeline.setPlayButton();
		}else{
			if(Global.timeline.slider.value == 1000)
			{
				Global.data.day = 0;
			}
			timeline.isAnimationRunning = true;
			timeline.setPauseButton();

			// Make sure camera movement is smooth
			timeline.smoothY = Global.world.getRotationY();
			timeline.smoothX = Global.world.getRotationX();
		}
	}

	update(dt) {
		if(!Global.data.lastDay){
			return;
		}

		if(this.isAnimationRunning)
		{
			if(Global.data.addTime(0.05))
			{
				this.isAnimationRunning = false;
				this.setPlayButton();
			}
			this.updateSeekPosition();

		}

		// Camera Interest Animation
		if(Global.followCamera && this.isAnimationRunning)
		{
			// Rotation
			var animationTime = this.slider.value/1000.0;
			var rY = Remap(Math.pow(animationTime,2.0), 0.0, 1.0, -Math.PI*0.6, Math.PI/2.0);
			this.smoothY += (rY-this.smoothY)/20;
			Global.world.setRotationY(this.smoothY);

			var x = Math.PI*0.15;
			this.smoothX += (x-this.smoothX)/20;
			Global.world.setRotationX(this.smoothX);

			// Zoom
			var outMax = GLOBE_RADIUS*1.5;
			var outMin = GLOBE_RADIUS*0.75;
			var scale = outMax + (outMin - Remap(Math.pow(animationTime,1/3), 0.0, 1.0, outMin, outMax));
			Global.world.worldScale = scale;
		}
	}
}