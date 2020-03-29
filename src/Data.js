import Global from './Global';
const Papa = require('papaparse');

export default class Data {
	constructor(world) {
		this.world = world;
	}

	addTime(t) {
		var didReachEnd = false;
		this.day += t;

		// Cannot go higher than this.lastDay
		if(this.day > this.lastDay){
			this.day = this.lastDay;
			didReachEnd = true;
		}
		return didReachEnd;
	}

	subTime(t) {
		this.day -= t;

		// Cannot go lower than this.firstDayIndex
		if(this.day < 0)
			this.day = 0;
	}

	getCurrentTotal(arrayData) {
		var entry = this.dataInfo[arrayData+this.selectedCountry];
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

	getNumberForData(index, dataString) {
		if(this.dataInfo[dataString].length-1 < index)
			return 0;
		var entry = this.dataInfo[dataString][index];
		if(!entry)
			return 0;

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

	getNumber(index) {
		if(this.selectedData == "active")
		{
			var casesNum = this.getNumberForData(index, "cases");
			var recoveredNum = this.getNumberForData(index, "recovered");
			var deathsNum = this.getNumberForData(index, "deaths");
			return casesNum - recoveredNum - deathsNum;
		}else{
			return this.getNumberForData(index, this.selectedData);
		}
	}

	collectCountryTotals(dataSet, country) {
		var len = this.dataInfo[dataSet].length;
		var newData = [];
		var entryCount = 0;
		for(var i = 0; i < len; i++)
		{
			var entry = this.dataInfo[dataSet][i];
			if(!entry)
				continue;
			if(entry[1] && entry[1].startsWith(country))
			{
				entryCount++;
				var entryLen = entry.length;
				if(entryCount == 1)
				{
					for(var e = this.firstDayIndex; e < entryLen; e++)
					{
						newData.push(parseInt(entry[e]));
					}
				}else{
					for(var e = this.firstDayIndex; e < entryLen; e++)
					{
						newData[e-this.firstDayIndex] += parseInt(entry[e]);
					}
				}
			}
		}
		return newData;
	}

	selectCountry(country) {

		// "French"

		// Some specific cases
		if(country == "United States of America")
			country = "US";
		else if(country == "Democratic Republic of the Congo" || country ==  "Republic of the Congo")
			country = "Congo";
		else if(country == "South Korea")
			country = "Korea, South";
		else if(country == "United Republic of Tanzania")
			country = "Tanzania";
		else if(country == "East Timor")
			country = "Timor-Leste";
		else if(country == "Republic of Serbia")
			country = "Serbia";
		else if(country == "Somaliland")
			country = "Somalia";
		else if(country == "North Macedonia")
			country = "Macedonia";
		else if(country == "Northern Cyprus")
			country = "Cyprus";

		if(country == null){
			console.log("All countries");
			this.selectedCountry = "Total";
		}else{
			// Calculate selected country data
			this.selectedCountry = country;

			var dataSet = "cases";
			var newData = this.collectCountryTotals(dataSet, country);
			this.dataInfo[dataSet+this.selectedCountry] = newData;
			//console.log(newData);

			dataSet = "recovered";
			var newData = this.collectCountryTotals(dataSet, country);
			this.dataInfo[dataSet+this.selectedCountry] = newData;
			//console.log(newData);
			
			dataSet = "deaths";
			var newData = this.collectCountryTotals(dataSet, country);
			this.dataInfo[dataSet+this.selectedCountry] = newData;
			//console.log(newData);
			
		}
		$('#totalLabel')[0].innerText = this.selectedCountry;
	}

	getDateForDay(day) {
		return this.headerArray[parseInt(day)+this.firstDayIndex]
	}

	loadData(arrayData, loadIntoPoints, url, cb) {
		var oReq = new XMLHttpRequest();
		var _this = this;

		this.dataInfo[arrayData+"Total"] = [];

		oReq.onload = function(){
			var response = this.responseText;
			_this.dataInfo[arrayData] = response.split('\n');
			var countryCount = _this.dataInfo[arrayData].length-1;
			if(arrayData == "cases"){
				_this.countryCount = countryCount;
				_this.headerArray = Papa.parse(_this.dataInfo["cases"][0]).data[0];
			}

		  	for(var i = 1; i < _this.countryCount; i++) // i = 1 to exclude header
		  	{
		  		if(!_this.dataInfo[arrayData][i])
		  			continue;

		  		var splitLine = Papa.parse(_this.dataInfo[arrayData][i]).data[0];
		  		if(splitLine[1] == "Diamond Princess")
		  		{
		  			continue;
		  		}
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

		  	if(cb)
				cb();

		  	// Load into points data
		  	if(loadIntoPoints)
			  	_this.world.points.loadData(_this);
		};

		oReq.open("get", url, true);
		oReq.send();

	}

	loadDataAlign(url) {
		var oReq = new XMLHttpRequest();
		var _this = this;

		this.dataInfo["recoveredTotal"] = [];

		oReq.onload = function(){
			var response = this.responseText;
			var recoveredCountryList = response.split('\n');
			_this.dataInfo["recovered"] = [];
			_this.dataInfo["recovered"].length = _this.countryCount;

		  	for(var i = 1; i < _this.countryCount; i++) // i = 1 to exclude header
		  	{
		  		if(!recoveredCountryList[i])
		  			continue;

		  		var splitLine = Papa.parse(recoveredCountryList[i]).data[0];
		  		if(splitLine[1] == "Diamond Princess")
		  		{
		  			continue;
		  		}
		  		
		  		var recoveredKey = splitLine[0]+splitLine[1];
		  		for(var e = 0; e < _this.countryCount-1; e++)
		  		{
				  	var casesEntry = _this.dataInfo["cases"][e];
				  	var casesKey = casesEntry[0]+casesEntry[1];
				  	var recoveredIndex = i-1;
				  	if(casesKey == recoveredKey){
				  		_this.dataInfo["recovered"][e] = splitLine;
				  		//if(recoveredIndex != e)
						//  	console.log(recoveredKey + " => Place in " + e + " :: " + recoveredIndex);
				  	}
		  		}

		  		if(i == 1){
					_this.dataInfo["recoveredTotal"].length = _this.lastDay;
		  		}

		  		var len = splitLine.length;
		  		var counter = 0;
		  		for(var c = _this.firstDayIndex; c < len; c++)
		  		{
		  			var v = parseInt(splitLine[c]);

		  			if(i == 1)
			  			_this.dataInfo["recoveredTotal"][counter] = v;
			  		else{
			  			_this.dataInfo["recoveredTotal"][counter] += v;
			  		}

		  			counter++;
		  		}
		  	}
		};

		oReq.open("get", url, true);
		oReq.send();

	}

	loadTransmissions() {
		var oReq = new XMLHttpRequest();
		var _this = this;
		this.selectedCountry = "Total";
		this.transmissions = [];

		oReq.onload = function(){
			var response = this.responseText;
			var split = response.split('\n');
			var len = split.length;
			for(var i = 1; i < len-1; i++){ // i=1 to exclude header
				var lineArray = split[i].split(',');

				// Calculate day
				var dateString = lineArray[0];
				var d = new Date(dateString);
				//_this.startDate = new Date("2020-01-22");
				//console.log(dateString + " :: " + d);
				//console.log("StartDate: " + startDate);

				const diffTime = d - _this.startDate;
				var diffDays = diffTime / (1000 * 60 * 60 * 24); 
				//console.log('diffDays: ' + diffDays);

				_this.transmissions.push([diffDays, lineArray[0], lineArray[1], lineArray[2]]);
			}
			_this.transmissionsReady = true;
			if(_this.divCoordinatesReady)
			{
				_this.createTransmissions();
			}
		};
		oReq.open("get", "data/div_transmissions.csv", true);
		oReq.send();
	}

	loadDivCoordinates() {
		var oReq = new XMLHttpRequest();
		var _this = this;
		this.divisionCoords = {};

		oReq.onload = function(){
			var response = this.responseText;
			var split = response.split('\n');
			var len = split.length;
			for(var i = 1; i < len-1; i++){ // i=1 to exclude header
				var lineArray = split[i].split(',');
				_this.divisionCoords[lineArray[0]] = [lineArray[1], lineArray[2]];
			}
			_this.divCoordinatesReady = true;
			if(_this.transmissionsReady)
			{
				_this.createTransmissions();
			}
		};
		oReq.open("get", "data/div_lat_longs.csv", true);
		oReq.send();
	}

	createTransmissions() {
		var len = this.transmissions.length;
		for(var i = 0; i < len; i++)
		{
			var entry = this.transmissions[i];
			var toDivision = entry[2];
			var fromDivision = entry[3];
			var toCoords = this.divisionCoords[toDivision];
			var fromCoords = this.divisionCoords[fromDivision];
			Global.world.arcs.createArc(entry[0], fromCoords[0], fromCoords[1], toCoords[0], toCoords[1]);
		}
	}

	load() {
		this.day = 0;
		this.firstDayIndex = 4;
		this.dataInfo = {};
		this.selectedData = "cases";
		this.divCoordinatesReady = false;
		this.transmissionsReady = false;
		this.startDate = new Date("2020-01-22");

		var casesURL;
		var recoveredURL;
		var deathsURL;
		if(0){
			casesURL = "data/time_series_19-covid-Confirmed.csv"; // Use a local file while testing
			recoveredURL = "data/time_series_19-covid-Recovered.csv"; // Use a local file while testing
			deathsURL = "data/time_series_19-covid-Deaths.csv"; // Use a local file while testing
		}else{
			casesURL = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv";
			recoveredURL = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv";
			deathsURL = "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv";
		}

		var _this = this;
		this.loadData("cases", true, casesURL, function(){
			_this.loadDataAlign(recoveredURL);			
		});
		this.loadData("deaths", false, deathsURL, null);

		// Load transmissions
		this.loadDivCoordinates();
		this.loadTransmissions();
	}
}