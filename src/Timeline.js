import Global from './Global';

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
			e.stopPropagation();
		}, false);

	}

	setPlayButton(){
		$("#buttonContent").removeClass("pause").addClass("play");
		$('#playDiv').css({ 'left': '38%' });

	}
	
	setPauseButton(){
		$("#buttonContent").removeClass("play").addClass("pause");
		$('#playDiv').css({ 'left': '36%' });

	}

	updateTooltip(){
		var perc = Global.data.day/Global.data.lastDay;
		var toolTipLeftPerc = 3 + perc*97;
		$('#tooltipId').css({ 'left': toolTipLeftPerc+'%' });

		// Update tooltip text
		var date;
		var formattedDate;

		if(perc < 1.0){
			date = Global.data.getDateForDay(Global.data.day);
			$('#tooltipText')[0].innerHTML = date;
			var d = new Date(date);
			const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d)
			const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d)
			const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d)
			formattedDate = `${da} ${mo} ${ye}`
		}else{
			date = "TODAY";
			formattedDate = date;
		}
		$('#tooltipText')[0].innerHTML = date;
		$('#dateLabel')[0].innerHTML = formattedDate;

	}

	updateSeekPosition(){
		var perc = Global.data.day/Global.data.lastDay;
		this.slider.value = perc*1000.0;
		this.updateTooltip();
	}

	sliderMove(){
		var timeline = Global.timeline;

		var newDay = Global.data.lastDay*(this.value/1000.0);
		Global.data.day = newDay;

		timeline.isAnimationRunning = false;
		timeline.setPlayButton();
		timeline.updateTooltip();
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
		}
	}

	update(dt) {
		if(!Global.data.dataInfo["cases"])
			return;
			
		if(this.isAnimationRunning)
		{
			if(Global.data.addTime(0.05))
			{
				this.isAnimationRunning = false;
				this.setPlayButton();
			}
			this.updateSeekPosition();
		}
	}
}