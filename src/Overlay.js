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
			$('#selectActive').removeClass("buttonHighlight");

			Global.world.setDataColor(0xFF0000, 0x330000);
		};

		var selectRecoveriesButton = document.getElementById("selectRecoveries");
		selectRecoveriesButton.onclick = function(){
			Global.data.selectedData = "recovered";

			$('#selectDeaths').removeClass("buttonHighlight");
			$('#selectRecoveries').addClass("buttonHighlight");
			$('#selectCases').removeClass("buttonHighlight");
			$('#selectActive').removeClass("buttonHighlight");

			Global.world.setDataColor(0x00AA00, 0x001100);
		};

		var selectDeathsButton = document.getElementById("selectDeaths");
		selectDeathsButton.onclick = function(){
			Global.data.selectedData = "deaths";

			$('#selectDeaths').addClass("buttonHighlight");
			$('#selectRecoveries').removeClass("buttonHighlight");
			$('#selectCases').removeClass("buttonHighlight");
			$('#selectActive').removeClass("buttonHighlight");

			Global.world.setDataColor(0xFF00FF, 0x330033);
		};

		var selectActiveButton = document.getElementById("selectActive");
		selectActiveButton.onclick = function(){
			Global.data.selectedData = "active";

			$('#selectDeaths').removeClass("buttonHighlight");
			$('#selectRecoveries').removeClass("buttonHighlight");
			$('#selectCases').removeClass("buttonHighlight");
			$('#selectActive').addClass("buttonHighlight");

			Global.world.setDataColor(0x009999, 0xFFFFFF);
		};


		document.getElementById("infoLabelId").addEventListener('mousedown', function(e){
			e.stopPropagation();
		}, false);
		document.getElementById("infoLabelId").addEventListener('mousemove', function(e){
			e.stopPropagation();
		}, false);

		document.getElementById("timelineDiv").addEventListener('mousemove', function(e){
			e.stopPropagation();
		}, false);

		var checkVectorId = $('input#checkboxVectorId');
		checkVectorId.change(function () {
		    if (checkVectorId.is(':checked')) {
		        Global.setDrawVectors(true);
		    } else {
		        Global.setDrawVectors(false);
		    }
		    Global.world.arcs.visible = Global.drawVectors;
		});

		var checkFollowId = $('input#checkboxCameraFollowId');
		checkFollowId.change(function () {
		    if (checkFollowId.is(':checked')) {
		        Global.setFollowCamera(true);
		    } else {
		        Global.setFollowCamera(false);
		    }
		});

		this.restoreConfig();
	}

	restoreConfig() {
		$('input#checkboxCameraFollowId').prop('checked', Global.followCamera);
		$('input#checkboxVectorId').prop('checked', Global.drawVectors);
		Global.world.arcs.visible = Global.drawVectors;
	}

	update(dt) {
		if(!Global.data.dataInfo["cases"])
			return;


		var cases = Global.data.getCurrentTotal("cases");
		var recovered = Global.data.getCurrentTotal("recovered");
		var deaths = Global.data.getCurrentTotal("deaths");

		$('#topId')[0].innerText = NumberWithCommas(cases);
		$('#secondId')[0].innerText = NumberWithCommas(recovered);
		$('#thirdId')[0].innerText = NumberWithCommas(Global.data.getCurrentTotal("deaths"));
		$('#fourthId')[0].innerText = NumberWithCommas(cases - recovered - deaths);

	}
}