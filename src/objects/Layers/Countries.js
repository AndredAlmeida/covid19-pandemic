import * as THREE from 'three';
import { ConicPolygonBufferGeometry } from 'three-conic-polygon-geometry';
import countries from './../../../data/ne_110m_admin_0_countries.json';

import threeDigest from '../../utils/digest';

export default class Countries extends THREE.Group  {

	constructor() {
		super();

	    fetch(countries).then(res => res.json()).then(countries => {
	    	var polygonsData = countries.features;
	    	var counter = 0;
			var singlePolygons = [];
			polygonsData.forEach(polygon => {
				counter++;

				var geoJson = polygon['geometry'];
			    var geoId = polygon.__id || `${Math.round(Math.random() * 1e9)}`; // generate and stamp polygon ids to keep track in digest
			    polygon.__id = geoId;
				//console.log('Country ' + geoJson.type);

				if (geoJson.type === 'Polygon') {
					singlePolygons.push({
					  id: `${geoId}_0`,
					  coords: geoJson.coordinates
					});
				} else if (geoJson.type === 'MultiPolygon') {
					singlePolygons.push(...geoJson.coordinates.map((coords, idx) => ({
					  id: `${geoId}_${idx}`,
					  coords
					})));
				} else {
					console.warn(`Unsupported GeoJson geometry type: ${geoJson.type}. Skipping geometry...`);
				}
			});

		    threeDigest(singlePolygons, this, {
				idAccessor: d => d.id,
				createObj: () => {
			        const obj = new THREE.Group();
			        //var sideMaterial = new THREE.MeshPhongMaterial({ color: 0xDDFF77, side: THREE.DoubleSide, depthWrite: true, depthTest: true, transparent: false, emissive: 0x000000 });
			        var capMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFF77, side: THREE.FrontSide, depthWrite: true, depthTest: true, transparent: false, emissive: 0xFF1100 });
			        //
			        capMaterial.shininess = 1;
			        var m = new THREE.Mesh(undefined, /*sideMaterial, */capMaterial);
			        obj.add(m);

			        return obj;
			        
				},
				updateObj: (obj, { coords, capColor, sideColor, strokeColor, altitude }) => {
					const [mesh] = obj.children;
					var geometry = new ConicPolygonBufferGeometry(coords, 1, 1, false);
					mesh.geometry = geometry;
					geometry.computeVertexNormals();

				}

		    });

	    });

	}

	update(timeStamp) {
	}

};