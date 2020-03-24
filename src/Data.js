import Global from './Global';
const Papa = require('papaparse');

export default class Data {
	constructor(world) {
		this.world = world;
	}

	addTime(t) {
		this.day += t;

		// Cannot go higher than this.lastDay
		if(this.day > this.lastDay)
			this.day = this.lastDay;
	}

	subTime(t) {
		this.day -= t;

		// Cannot go lower than this.firstDayIndex
		if(this.day < 0)
			this.day = 0;
	}

	getCurrentTotal(arrayData) {
		var entry = this.dataInfo[arrayData+"Total"];
		var prevDay = parseInt(this.day);
		var nextDay = prevDay+1;

		var cases1 = parseInt(entry[prevDay]);
		var cases2 = entry[nextDay];
		if(cases2 == undefined){
			cases2 = cases1;
		}
		cases2 = parseInt(cases2);

		var fracDay = this.day - prevDay;
		var resultCases = cases1 + (cases2-cases1)*fracDay;
		return parseInt(resultCases);
	}

	getNumber(index) {
		var entry = this.dataInfo[this.selectedData][index];

		//console.log(this.day);
		var prevDayIndex = parseInt(this.day+this.firstDayIndex);
		var nextDayIndex = prevDayIndex+1;
		var curDayIndex = this.day+this.firstDayIndex;

		var cases1 = parseInt(entry[prevDayIndex]);
		var cases2 = entry[nextDayIndex];
		if(cases2 == undefined){
			cases2 = cases1;
		}
		cases2 = parseInt(cases2);

		var fracDay = curDayIndex - prevDayIndex;
		var resultCases = cases1 + (cases2-cases1)*fracDay;
		return resultCases;
	}

	loadData(arrayData, loadIntoPoints, url) {
		var oReq = new XMLHttpRequest();
		var _this = this;

		this.dataInfo[arrayData+"Total"] = [];

		oReq.onload = function(){
			var response = this.responseText;
			_this.dataInfo[arrayData] = response.split('\n');
			var countryCount = _this.dataInfo[arrayData].length-1;
			if(arrayData == "cases")
				_this.countryCount = countryCount;

		  	for(var i = 1; i < _this.countryCount; i++) // i = 1 to exclude header
		  	{
		  		var splitLine = Papa.parse(_this.dataInfo[arrayData][i]).data[0];
		  		_this.dataInfo[arrayData][i-1] = splitLine;

		  		if(i == 1){
		  			_this.day = splitLine.length-1 - _this.firstDayIndex;
		  			_this.lastDay = _this.day;
					_this.dataInfo[arrayData+"Total"].length = _this.lastDay;
		  		}

		  		var len = splitLine.length;
		  		var counter = 0;
		  		for(var c = _this.firstDayIndex; c < len; c++)
		  		{
		  			var v = parseInt(splitLine[c]);

		  			if(i == 1)
			  			_this.dataInfo[arrayData+"Total"][counter] = v;
			  		else{
			  			_this.dataInfo[arrayData+"Total"][counter] += v;
			  		}

		  			counter++;
		  		}
		  		
		  	}

		  	// Load into points data
		  	if(loadIntoPoints)
			  	_this.world.points.loadData(_this);
		};

		oReq.open("get", url, true);
		oReq.send();

	}

	load() {
		this.day = 0;
		this.firstDayIndex = 4;
		this.dataInfo = {};
		this.selectedData = "cases";

		var casesURL;
		var recoveredURL;
		var deathsURL;
		if(1){
			casesURL = "time_series_19-covid-Confirmed.csv"; // Use a local file while testing
			recoveredURL = "time_series_19-covid-Recovered.csv"; // Use a local file while testing
			deathsURL = "time_series_19-covid-Deaths.csv"; // Use a local file while testing
		}else{
			casesURL = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv";
			recoveredURL = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv";
			deathsURL = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv";
		}

		this.loadData("cases", true, casesURL);
		this.loadData("recovered", false, recoveredURL);
		this.loadData("deaths", false, deathsURL);
	}
}