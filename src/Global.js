class Global {
	constructor() {
		this.readConfig();
	}

	readConfig() {
		var followCamera = window.localStorage.followCamera;
		var drawVectors = window.localStorage.drawVectors;
		this.followCamera = followCamera === "true" || followCamera == undefined ? true : false;
		this.drawVectors = drawVectors === "true" || drawVectors == undefined ? true : false;
	}

	saveConfig() {
		window.localStorage.followCamera = this.followCamera;
		window.localStorage.drawVectors = this.drawVectors;
	}

	setDrawVectors(b)
	{
		this.drawVectors = b;
		this.saveConfig();
	}

	setFollowCamera(b)
	{
		this.followCamera = b;
		this.saveConfig();
	}
}

export default (new Global);
export const GLOBE_RADIUS = 10;
export const MIN_SCALE = GLOBE_RADIUS*0.5;
export const MAX_SCALE = GLOBE_RADIUS*4;
export const OFFSET_Z = 0.25;
export const SIDE_MARGIN = 0.78;
