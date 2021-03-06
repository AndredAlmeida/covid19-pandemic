import * as THREE  from 'three';
import WorldSphere from './Layers/WorldSphere.js';
import Countries from './Layers/Countries.js';
import Points from './Layers/Points.js';
import Atmosphere from './Layers/Atmosphere.js';
import Arcs from './Layers/Arcs.js';
import { geoGraticule10 } from 'd3-geo';
import { GeoJsonGeometry } from 'three-geojson-geometry';
import Global, { OFFSET_Z, GLOBE_RADIUS, SIDE_MARGIN } from './../Global';

export default class World extends THREE.Group {

	constructor() {
		super();

		this.rotationY = 0;
		this.rotationX = 0;

		this.worldScale = GLOBE_RADIUS*SIDE_MARGIN;

		this.scale.x = this.worldScale;
		this.scale.y = this.worldScale;
		this.scale.z = this.worldScale;

		this.atmosphere = new Atmosphere();
		this.add(this.atmosphere);

		// Sphere
		this.worldSphere = new WorldSphere();
		this.add(this.worldSphere);

		// Graticules
	    this.graticules = new THREE.LineSegments(
	      new GeoJsonGeometry(geoGraticule10(), 1, 2),
	      new THREE.MeshPhongMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.2 })
	    );
	    this.graticules.renderOrder = 50;
	    this.add(this.graticules);

		// Countries
		this.countries = new Countries();
		this.add(this.countries);
		this.countries.position.z += OFFSET_Z;

		// Dots
		this.points = new Points();
		this.add(this.points);
		this.points.position.z += OFFSET_Z;

		// Arcs
		this.arcs = new Arcs();
		this.add(this.arcs);

	}

	getRotationY() {
		return this.rotationY;
	}

	setRotationY(y) {
		this.rotationY = y;
		this.countries.rotation.y = y;
		this.points.rotation.y = y;
		this.graticules.rotation.y = y;
		this.arcs.rotation.y = y;
	}

	getRotationX() {
		return this.rotationX;
	}

	setRotationX(x) {
		this.rotationX = x;
		this.countries.rotation.x = x;
		this.points.rotation.x = x;
		this.graticules.rotation.x = x;
		this.arcs.rotation.x = x;
	}

	setDataColor(color1, color2) {
		this.points.material1.color = new THREE.Color(color1);
		this.points.material2.color = new THREE.Color(color2);
	}

	update(dt) {
		if(!Global.mobile){
			var newScale = this.scale.x;
			newScale += (this.worldScale - newScale)/10;
			this.scale.x = newScale;
			this.scale.y = newScale;
			this.scale.z = newScale;
		}

		this.points.update(dt);
		this.arcs.update(dt);
		this.countries.update(dt);
	}
}