import Global from './Global';
import { NumberWithCommas } from './utils/MathUtils.js';
export default class Overlay {

	constructor() {
	}

	update(dt) {
		if(!Global.data.dataInfo["cases"])
			return;

		$('#topId')[0].innerText = NumberWithCommas(Global.data.getCurrentTotal("cases"));
		$('#secondId')[0].innerText = NumberWithCommas(Global.data.getCurrentTotal("recovered"));
		$('#thirdId')[0].innerText = NumberWithCommas(Global.data.getCurrentTotal("deaths"));
	}
}