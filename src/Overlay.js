import Global from './Global';
import { NumberWithCommas } from './utils/MathUtils.js';
export default class Overlay {

	constructor() {

		function selectCases(e){
			Global.data.selectedData = "cases";
			Global.world.setDataColor(0xFF0000, 0x330000);
		}
		function selectRecovered(e){
			Global.data.selectedData = "recovered";
			Global.world.setDataColor(0x00AA00, 0x001100);
		}
		function selectDeaths(e){
			Global.data.selectedData = "deaths";
			Global.world.setDataColor(0xFF00FF, 0x330033);
		}
		function selectActive(e){
			Global.data.selectedData = "active";
			Global.world.setDataColor(0x009999, 0xFFFFFF);
		}

		if(!Global.mobile){
			var selectCasesButton = document.getElementById("selectCases");
			selectCasesButton.onclick = function(){
				$('#selectDeaths').removeClass("buttonHighlight");
				$('#selectRecoveries').removeClass("buttonHighlight");
				$('#selectCases').addClass("buttonHighlight");
				$('#selectActive').removeClass("buttonHighlight");

				selectCases();
			};

			var selectRecoveriesButton = document.getElementById("selectRecoveries");
			selectRecoveriesButton.onclick = function(){
				$('#selectDeaths').removeClass("buttonHighlight");
				$('#selectRecoveries').addClass("buttonHighlight");
				$('#selectCases').removeClass("buttonHighlight");
				$('#selectActive').removeClass("buttonHighlight");

				selectRecovered();
			};

			var selectDeathsButton = document.getElementById("selectDeaths");
			selectDeathsButton.onclick = function(){
				$('#selectDeaths').addClass("buttonHighlight");
				$('#selectRecoveries').removeClass("buttonHighlight");
				$('#selectCases').removeClass("buttonHighlight");
				$('#selectActive').removeClass("buttonHighlight");

				selectDeaths();
			};

			var selectActiveButton = document.getElementById("selectActive");
			selectActiveButton.onclick = function(){
				$('#selectDeaths').removeClass("buttonHighlight");
				$('#selectRecoveries').removeClass("buttonHighlight");
				$('#selectCases').removeClass("buttonHighlight");
				$('#selectActive').addClass("buttonHighlight");

				selectActive();
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

		// Mobile only
		}else{
			$('#topIdLabel')[0].addEventListener('touchstart', selectCases, false);
			$('#topId')[0].addEventListener('touchstart', selectCases, false);
			$('#secondIdLabel')[0].addEventListener('touchstart', selectRecovered, false);
			$('#secondId')[0].addEventListener('touchstart', selectRecovered, false);
			$('#thirdIdLabel')[0].addEventListener('touchstart', selectDeaths, false);
			$('#thirdId')[0].addEventListener('touchstart', selectDeaths, false);
			$('#fourthIdLabel')[0].addEventListener('touchstart', selectActive, false);
			$('#fourthId')[0].addEventListener('touchstart', selectActive, false);
		}

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