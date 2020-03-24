import * as THREE from 'three';

export default class WorldSphere extends THREE.Group  {

	constructor() {
		super();
		var geometry, material;
	    var geometry = new THREE.SphereGeometry(1, 75, 75);
	    var material = new THREE.MeshPhongMaterial({ color: 0x0055DD, transparent: false, shininess: 30.0 });
	    this.mesh = new THREE.Mesh(geometry, material);
	    this.add(this.mesh);
	}

};