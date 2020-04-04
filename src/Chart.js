import Global from './Global';
import { FormatKNumber, SetCharAt } from './utils/MathUtils';
var chart;

export default class Chart {

	drawChart() {
	}

	inputmove(e) {
		if(Global.timeline.isAnimationRunning){
			Global.movingInChart = false;
			return;
		}

		if(!Global.movingInChart){
			Global.movingInChart = true;
			Global.data.saveLastDay = Global.data.day;
		}

		var x_offset = chart.canvasElementWidth - (window.innerWidth - e.clientX - chart.right);
		var perc = x_offset/chart.canvasElementWidth;
		chart.inputOffsetX = chart.canvasWidth*perc;

		if(chart.pointArray)
		{
			var len = chart.pointArray[0].length;
			Global.data.day = len*perc;
			Global.timeline.updateDate(false);
		}
	}

	setLinear() {
		this.chartType = 0;
		this.chartFunction = function(x){return x;};
	}

	setLog() {
		this.chartType = 1;
		this.chartFunction =  Math.log10;
	}

	constructor(world) {
		chart = this;
		this.canvas = document.getElementById('canvas');
		this.canvasDiv = document.getElementById('canvasDiv');
		this.context = this.canvas.getContext('2d');
		this.viewDailyNew = false;
		this.processData = [];
		this.processData.length = 4;
		this.hLine1Perc = 0.25;
		this.hLine2Perc = 0.5;
		this.hLine3Perc = 0.75;
		this.setLog();

		this.displayCases = this.displayRecoveries = this.displayDeaths = this.displayActive = true;

		// Initialize Arrays
		this.sourceData = [];
		this.sourceData.length = 4; // Data: Cases, Recoveries, Deaths, Active
		this.pointArray = [];
		this.pointArray.length = 4; // Plotted: Cases, Recoveries, Deaths, Active

		var ceW = this.canvas.style.width;
		this.canvasElementWidth = parseInt(ceW.substring(0, ceW.indexOf("px")));
		var ceH = this.canvas.style.height;
		this.canvasElementHeight = parseInt(ceH.substring(0, ceH.indexOf("px")));
		
		var ceR = this.canvasDiv.style.right;
		this.right = parseInt(ceR.substring(0, ceR.indexOf("px")));

		this.canvas.addEventListener('mousemove', this.inputmove, false);

		this.canvasWidth = 400;
		this.canvasHeight = 300;
		this.context.canvas.width = this.canvasWidth;
		this.context.canvas.height = this.canvasHeight;

		var selectLinearButton = $('#selectLinear');
		var selectLogButton = $('#selectLog');
		var selectVelocityButton = $('#selectVelocity');
		var selectAccelerationButton = $('#selectAcceleration');
		selectLinearButton[0].onclick = function(){
			selectLinearButton.addClass("buttonHighlightGraph");
			selectLogButton.removeClass("buttonHighlightGraph");
			selectVelocityButton.removeClass("buttonHighlightGraph");
			selectAccelerationButton.removeClass("buttonHighlightGraph");
			chart.setLinear();
			chart.refreshCharts();
		};

		selectLogButton[0].onclick = function(){
			selectLinearButton.removeClass("buttonHighlightGraph");
			selectLogButton.addClass("buttonHighlightGraph");
			selectVelocityButton.removeClass("buttonHighlightGraph");
			selectAccelerationButton.removeClass("buttonHighlightGraph");
			chart.setLog();
			chart.refreshCharts();
		};

		var toggleCasesButton = $('#toggleCases');
		var toggleRecoveriesButton = $('#toggleRecoveries');
		var toggleDeathsButton = $('#toggleDeaths');
		var toggleActiveButton = $('#toggleActive');

		toggleCasesButton[0].onclick = function(){
			if(chart.displayCases)
				toggleCasesButton.removeClass('buttonHighlightGraph');
			else
				toggleCasesButton.addClass('buttonHighlightGraph');
			chart.displayCases = !chart.displayCases;

			chart.refreshCharts();
		};
		toggleRecoveriesButton[0].onclick = function(){
			if(chart.displayRecoveries)
				toggleRecoveriesButton.removeClass('buttonHighlightGraph');
			else
				toggleRecoveriesButton.addClass('buttonHighlightGraph');
			chart.displayRecoveries = !chart.displayRecoveries;

			chart.refreshCharts();
		};
		toggleDeathsButton[0].onclick = function(){
			if(chart.displayDeaths)
				toggleDeathsButton.removeClass('buttonHighlightGraph');
			else
				toggleDeathsButton.addClass('buttonHighlightGraph');
			chart.displayDeaths = !chart.displayDeaths;

			chart.refreshCharts();
		};
		toggleActiveButton[0].onclick = function(){
			if(chart.displayActive)
				toggleActiveButton.removeClass('buttonHighlightGraph');
			else
				toggleActiveButton.addClass('buttonHighlightGraph');
			chart.displayActive = !chart.displayActive;

			chart.refreshCharts();
		};

		// Side Buttons
		var btnCumulative = $('#btnCumulative');
		var btnDailyNew = $('#btnDailyNew');
		btnCumulative[0].onclick = function(){
			btnCumulative.addClass('buttonHighlightGraph');
			btnDailyNew.removeClass('buttonHighlightGraph');

			chart.viewDailyNew = false;
			chart.refreshCharts();
		};
		btnDailyNew[0].onclick = function(){
			btnCumulative.removeClass('buttonHighlightGraph');
			btnDailyNew.addClass('buttonHighlightGraph');

			// Makes more sense to see linear with Daily New
			selectLinearButton.addClass("buttonHighlightGraph");
			selectLogButton.removeClass("buttonHighlightGraph");
			selectVelocityButton.removeClass("buttonHighlightGraph");
			selectAccelerationButton.removeClass("buttonHighlightGraph");
			chart.setLinear();

			chart.viewDailyNew = true;
			chart.refreshCharts();
		};

	}

	processChart(index) {
		var data = this.processData[index];
		var len = data.length;
		var pointArray = [];

		for(var i in data)
		{
			var origValue = data[i];
			var value = this.chartFunction(origValue);
			var x = (i/len)*this.canvasWidth;
			var y = ((value - this.minY)/(this.maxY - this.minY))*this.canvasHeight;
			if(y == Number.NEGATIVE_INFINITY)
				y = 0;
			pointArray.push([x, y, origValue]);
		}
		this.pointArray[index] = pointArray;
	}

	clearChartLimits()
	{
		this.minY = 999999999;
		this.maxY = -999999999;
		this.minLinearY = 999999999;
		this.maxLinearY = -999999999;
	}

	updateChartLimits(index)
	{
		var data = this.processData[index];

		// First, get max and min Y
		for(var i in data)
		{
			// Function
			var f_value = this.chartFunction(data[i]);
			if(f_value < this.minY)
				this.minY = f_value;
			if(f_value > this.maxY)
				this.maxY = f_value;

			// Linear
			var value = data[i];
			if(value < this.minLinearY)
				this.minLinearY = value;
			if(value > this.maxLinearY)
				this.maxLinearY = value;
		}	
		if(this.minY == Number.NEGATIVE_INFINITY)
			this.minY = 0;




	}

	convertToDailyNew(data)
	{
		var tmpData = data.slice();
		var len = data.length;
		for(var i = 1; i < len; i++)
		{
			data[i] = tmpData[i] - tmpData[i-1];
		}
	}

	updateChartData(casesDataInfo, recoveriesDataInfo, deathsDataInfo, activeDataInfo) {

		// Original Data
		this.sourceData[0] = casesDataInfo.slice();
		this.sourceData[1] = recoveriesDataInfo.slice();
		this.sourceData[2] = deathsDataInfo.slice();
		this.sourceData[3] = activeDataInfo.slice();

		this.refreshCharts();
	}

	SmartRound(min, max, perc) {
		var rawValue = parseInt((max - min)*perc);
		var rawValueStr = rawValue.toString();
		var len = rawValueStr.length;
		for(var i = 1; i < len; i++)
		{
			rawValueStr = SetCharAt(rawValueStr, i, '0');
		}
		var value = parseInt(rawValueStr);
		var perc;

		var f = this.chartFunction;
		var fMin = f(min);
		if(fMin == Number.NEGATIVE_INFINITY)
			fMin = 0;

		perc = (f(value)-fMin)/(f(max)-fMin);
		if(perc == Number.NEGATIVE_INFINITY)
			perc = 0;

		return {perc: perc, value: value};
	}

	refreshCharts() {

		// Data to be processed
		this.processData[0] = this.sourceData[0].slice();
		this.processData[1] = this.sourceData[1].slice();
		this.processData[2] = this.sourceData[2].slice();
		this.processData[3] = this.sourceData[3].slice();

		this.sourceData[0]

		if(this.viewDailyNew)
		{
			for(var i in this.processData)
			{
				this.convertToDailyNew(this.processData[i]);
			}
		}

		// Update Limits
		this.clearChartLimits();

		if(this.displayCases)
			this.updateChartLimits(0);

		if(this.displayRecoveries)
			this.updateChartLimits(1);

		if(this.displayDeaths)
			this.updateChartLimits(2);

		if(this.displayActive)
			this.updateChartLimits(3);

		// Update horizontal guide lines
		var perc1 = 0.25;
		var perc2 = 0.5;
		var perc3 = 0.75;
		if(this.chartType == 1) // Log?
		{
			perc1 = 0.000101;
			perc2 = 0.0101;
			perc3 = 0.101;
		}

		var ret025 = this.SmartRound(this.minLinearY, Math.ceil(this.maxLinearY), perc1);
		var ret05 = this.SmartRound(this.minLinearY, Math.ceil(this.maxLinearY), perc2);
		var ret075 = this.SmartRound(this.minLinearY, Math.ceil(this.maxLinearY), perc3);

		$('#hLine3')[0].innerText = FormatKNumber(ret025.value);
		$('#hLine2')[0].innerText = FormatKNumber(ret05.value);
		$('#hLine1')[0].innerText = FormatKNumber(ret075.value);

		$('#hLine3').css({ 'top': ((1.0-ret025.perc)*100)+'%' });
		$('#hLine2').css({ 'top': ((1.0-ret05.perc)*100)+'%' });
		$('#hLine1').css({ 'top': ((1.0-ret075.perc)*100)+'%' });

		this.hLine1Perc = ret025.perc;
		this.hLine2Perc = ret05.perc;
		this.hLine3Perc = ret075.perc;

		// Plot
		this.processChart(0);
		this.processChart(1);
		this.processChart(2);
		this.processChart(3);
	}

	drawChart(index, color) {
  		this.context.shadowBlur = 0;
  		this.context.lineWidth = 2;

		this.context.strokeStyle = color;
		this.context.beginPath();
		//this.context.moveTo(0, this.canvasHeight);
		var pointArray = this.pointArray[index];

		var w;
		if(pointArray)
			w = (this.canvasWidth/pointArray.length)/2.0;
		for(var i in pointArray)
		{
			var point = pointArray[i];
			if(i == 0)
				this.context.moveTo(point[0], this.canvasHeight - point[1]);
			else
				this.context.lineTo(point[0], this.canvasHeight - point[1]);
		}
		this.context.stroke();
	}

	drawPoint(index, color, cursorX) {
		this.context.beginPath();
		this.context.fillStyle = color;
		var pointArray = this.pointArray[index];
		if(pointArray){
			var frac = Global.data.day - parseInt(Global.data.day);
			var y1 = this.canvasHeight - pointArray[parseInt(Global.data.day)][1];
			var y;
			if(parseInt(Global.data.day) >= pointArray.length-1){
				y = y1;
			}else{
				var y2 = this.canvasHeight - pointArray[parseInt(Global.data.day)+1][1];
				y = y1 + (y2-y1)*frac;
			}

			this.context.arc(cursorX, y, 5, 0, 2 * Math.PI);
			this.context.fill();
		}
	}
	
	drawVerticalMarker(x)
	{
		// Vertical line
  		this.context.lineWidth = 1;
		this.context.strokeStyle = '#0033AA';
		this.context.beginPath();
		this.context.moveTo(x, this.canvasHeight);
		this.context.lineTo(x, this.canvasHeight*0.95);
		this.context.stroke();
	}

	drawHorizontalLine(y)
	{
		// Vertical line
  		this.context.lineWidth = 3;
		this.context.strokeStyle = '#000055';
		this.context.beginPath();
		this.context.moveTo(0, this.canvasHeight-y);
		this.context.lineTo(this.canvasWidth, this.canvasHeight-y);
		this.context.stroke();
	}

	update(dt) {
		this.context.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

		var cursorX;
		if(Global.movingInChart){
			cursorX = this.inputOffsetX;
		}else{
			var perc = Global.data.day / Global.data.lastDay;
			cursorX = this.canvasWidth*perc;
		}

		// TODO: Ugly hardcoded lines!! Fix this !!!
		this.drawVerticalMarker(this.canvasWidth*0.14);
		this.drawVerticalMarker(this.canvasWidth*0.535);
		this.drawVerticalMarker(this.canvasWidth*0.96);

		this.drawHorizontalLine(this.canvasHeight*this.hLine1Perc);
		this.drawHorizontalLine(this.canvasHeight*this.hLine2Perc);
		this.drawHorizontalLine(this.canvasHeight*this.hLine3Perc);

		// Vertical line cursor
  		this.context.shadowBlur = 5;
  		this.context.lineWidth = 1;
		this.context.shadowColor = '#005555';
		this.context.strokeStyle = "#005555";
		this.context.beginPath();
		this.context.moveTo(cursorX, this.canvasHeight);
		this.context.lineTo(cursorX, 0);		
		this.context.stroke();

		if(this.displayActive){
			this.drawChart(3, "#00FFFF");
			this.drawPoint(3, "#00FFFF", cursorX);
		}

		if(this.displayDeaths){
			this.drawChart(2, "#FF00FF");
			this.drawPoint(2, "#FF00FF", cursorX);
		}

		if(this.displayRecoveries){
			this.drawChart(1, "#00FF00");
			this.drawPoint(1, "#00FF00", cursorX);
		}

		if(this.displayCases){
			this.drawChart(0, "#FF0000");
			this.drawPoint(0, "#FF0000", cursorX);
		}
	}
}