import * as THREE from 'three';
import { polar2Cartesian } from '../../utils/coordTranslate';
import { Remap, GetBaseLog } from '../../utils/MathUtils';
import { OFFSET_Z, GLOBE_RADIUS, MAX_SCALE } from './../../Global';
import Global from './../../Global';

export default class Points extends THREE.Group  {

	logslider(value) {
	  // position will be between 0 and 100
	  var minp = 0;
	  var maxp = 100000;

	  // The result should be between 100 an 10000000
	  var minv = Math.log(1);
	  var maxv = Math.log(50);

	  // calculate adjustment factor
	  var scale = (maxv-minv) / (maxp-minp);

	  return Math.exp(minv + scale*(value-minp));
	}

	getSizeFromValue(value) {
		if(value == 0)
			return 0.00001;
		var size = this.logslider(value);
		size = GetBaseLog(30, Remap(value, 0, 80000, 1, 1000));
		if(size < 0.05)
			size = 0.05;
		size += 0.1;

		if(Global.world.scale.x > GLOBE_RADIUS)
		{
			var scaleVal = Remap(Global.world.scale.x, GLOBE_RADIUS, MAX_SCALE, 0.5, 1.0);
			size = size*(1.0 - (scaleVal - 0.5));
		}

		return size;
	}

	addPoint(index, lat, lon, value) {
		var geometry, material, mesh;
		var cartesian = polar2Cartesian(lat, lon);
		var dotInfo = {x: cartesian.x, y: cartesian.y, z: cartesian.z, value: value};
		this.dotList.push(dotInfo);
	}

	updateDot(index) {
		var dotInfo = this.dotList[index];

		// Here, get the correct number in Data class, for the current day (decimal)
		// Calculate sizes
		var value = Global.data.getNumber(index);
		var baseScale = this.getSizeFromValue(value);

		//var dataSet = Global.data.dataInfo[Global.data.selectedData];
		//if(dataSet[index][0] != "Hubei"){
		//	baseScale = 0;
		//}else{
			//console.log(dataSet[index][0] + " :: " + baseScale);
		//	console.log(value);
		//}

		this.dummy.position.set(dotInfo.x, dotInfo.y, dotInfo.z);
		this.dummy.getWorldPosition(this.tmpVec);
		var scale;
		var z = OFFSET_Z * GLOBE_RADIUS;
		if(this.tmpVec.z < z){
			var delta = z - this.tmpVec.z;
			var minVal = 0.00001;
			var maxDelta = 1.5;
			if(delta > maxDelta)
				scale = minVal;
			else{
				scale = minVal + (baseScale-minVal)*((maxDelta-delta)/maxDelta);
			}
		}else{
			scale = baseScale;
		}

		// Outer Circle
		this.dummy.scale.set(scale,scale,scale);
		this.dummy.updateMatrix();
		this.instancedMesh1.setMatrixAt(index, this.dummy.matrix);
		this.instancedMesh1.instanceMatrix.needsUpdate = true;

		// Inner Circle
		scale *= 0.9;
		this.dummy.scale.set(scale,scale,scale);
		this.dummy.updateMatrix();
		this.instancedMesh2.setMatrixAt(index, this.dummy.matrix);
		this.instancedMesh2.instanceMatrix.needsUpdate = true;
	}

	loadData(data) {
		// Instanced mesh 1
		this.instancedMesh1 = new THREE.InstancedMesh(this.geometry, this.material1, data.countryCount);
		this.instancedMesh1.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
		this.instancedMesh1.renderOrder = 99;
		this.add(this.instancedMesh1);

		// Instanced mesh 2
		this.instancedMesh2 = new THREE.InstancedMesh(this.geometry, this.material2, data.countryCount);
		this.instancedMesh2.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
		this.instancedMesh2.renderOrder = 99;
		this.add(this.instancedMesh2);

		this.countryCount = data.countryCount;
		var len = data.dataInfo[data.selectedData][0].length;
	  	for(var i = 0; i < this.countryCount-1; i++)
	  	{
	  		var entry = data.dataInfo[data.selectedData][i];
	  		var value = entry[len-1]; // Last: 58?
	  		this.addPoint(i, entry[2], entry[3], value);
	  	}
	}

	constructor() {
		super();

		var _this = this;

		this.geometry = new THREE.SphereGeometry(1.0/30, 16, 16);
		this.dummy = new THREE.Object3D();
		this.add(this.dummy);

		this.tmpVec = new THREE.Vector3();
		this.dotList = [];

		this.material1 = new THREE.MeshBasicMaterial({ color: 0xFF0000, depthWrite: false, depthTest: false });
		this.material2 = new THREE.MeshBasicMaterial({ color: 0x330000, depthWrite: false, depthTest: false, transparent: true, opacity: 0.1 });
	}

	update(dt) {
		if(!Global.data.dataInfo["cases"])
			return;

		this.counter = 0;
		//for(var i = 0; i < 1; i++) // Debug one country (Thailand)
		var len = Global.data.dataInfo[Global.data.selectedData];		
		for(var i = 0; i < this.countryCount-1; i++)
		{
			this.updateDot(i);
		}
	}

};