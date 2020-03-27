import Global from './Global';
import { NumberWithCommas } from './utils/MathUtils.js';
export default class Overlay {

	constructor() {
		var selectCasesButton = document.getElementById("selectCases");
		selectCasesButton.onclick = function(){
			Global.data.selectedData = "cases";

			$('#selectDeaths').removeClass("buttonHighlight");
			$('#selectRecoveries').removeClass("buttonHighlight");
			$('#selectCases').addClass("buttonHighlight");

			Global.world.setDataColor(0xFF0000, 0x330000);
		};

		var selectRecoveriesButton = document.getElementById("selectRecoveries");
		selectRecoveriesButton.onclick = function(){
			Global.data.selectedData = "recovered";

			$('#selectDeaths').removeClass("buttonHighlight");
			$('#selectRecoveries').addClass("buttonHighlight");
			$('#selectCases').removeClass("buttonHighlight");

			Global.world.setDataColor(0x00AA00, 0x001100);
		};

		var selectDeathsButton = document.getElementById("selectDeaths");
		selectDeathsButton.onclick = function(){
			Global.data.selectedData = "deaths";

			$('#selectDeaths').addClass("buttonHighlight");
			$('#selectRecoveries').removeClass("buttonHighlight");
			$('#selectCases').removeClass("buttonHighlight");

			Global.world.setDataColor(0xFF00FF, 0x330033);
		};


		document.getElementById("selectLabel").addEventListener('mousedown', function(e){
			e.stopPropagation();
		}, false);


	}

	update(dt) {
		if(!Global.data.dataInfo["cases"])
			return;

		$('#topId')[0].innerText = NumberWithCommas(Global.data.getCurrentTotal("cases"));
		$('#secondId')[0].innerText = NumberWithCommas(Global.data.getCurrentTotal("recovered"));
		$('#thirdId')[0].innerText = NumberWithCommas(Global.data.getCurrentTotal("deaths"));
	}
}