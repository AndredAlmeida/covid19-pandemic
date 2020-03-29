import * as THREE from 'three';
import { ConicPolygonBufferGeometry } from 'three-conic-polygon-geometry';
import countries from './../../../data/ne_110m_admin_0_countries.json';
import Global from './../../Global';

export default class Countries extends THREE.Group  {

	constructor() {
		super();

		var _this = this;
		this.interceptObjects = [];

        this.hoverMaterial = new THREE.MeshPhongMaterial({ color: 0xFF8800, side: THREE.FrontSide, depthWrite: true, depthTest: true, transparent: false, shininess: 1 });
        this.selectedMaterial = new THREE.MeshPhongMaterial({ color: 0x880099, side: THREE.FrontSide, depthWrite: true, depthTest: true, transparent: true, opacity: 0.8, emissive: 0x000000, shininess: 0 });

	    fetch(countries).then(res => res.json()).then(countries => {
	    	var polygonsData = countries.features;
	    	var counter = 0;
			var singlePolygons = [];
			polygonsData.forEach(polygon => {
				counter++;

				var geoJson = polygon['geometry'];
				var geoProperties = polygon['properties'];

			    var geoId = polygon.__id || `${Math.round(Math.random() * 1e9)}`; // generate and stamp polygon ids to keep track in digest
			    polygon.__id = geoId;

				if (geoJson.type === 'Polygon') {
					singlePolygons.push({
					  id: `${geoId}_0`,
					  coords: geoJson.coordinates,
					  label: geoProperties.ADMIN
					});
				} else if (geoJson.type === 'MultiPolygon') {
					geoJson.coordinates.map(function(coords, idx)
						{
							singlePolygons.push(
							{
								id: `${geoId}_${idx}`,
								coords,
								label: geoProperties.ADMIN
							});
						}
					);
				} else {
					console.warn(`Unsupported GeoJson geometry type: ${geoJson.type}. Skipping geometry...`);
				}
			});

			for(var i in singlePolygons)
			{
				var countryInfo = singlePolygons[i];
				var geometry = new ConicPolygonBufferGeometry(countryInfo.coords, 1, 1, false);
		        var capMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFF77, side: THREE.FrontSide, depthWrite: true, depthTest: true, transparent: false, emissive: 0xFF1100, shininess: 1 });
				geometry.computeVertexNormals();
		        var mesh = new THREE.Mesh(geometry, capMaterial);
		        this.add(mesh);
		        mesh.origMaterial = capMaterial;
				mesh.label = countryInfo.label;
		        _this.interceptObjects.push(mesh);
			}
	    });

	}

	select() {
		this.click = true;
		if(this.hoverCountry)
		{
			this.preSelectedCountry = this.hoverCountry;
			var list = this.getCountryObjectList(this.hoverCountry);
			this.setSelectCountry(list);
			this.hoverCountry = null;
		}else{
			if(this.preSelectedCountry){
				var list = this.getCountryObjectList(this.preSelectedCountry);
				this.setDeselectCountry(list);
			}
		}
	}

	deselect() {
		if(this.preSelectedCountry)
		{
			if(this.selectedCountry)
			{
				var list = this.getCountryObjectList(this.selectedCountry);
				this.setDeselectCountry(list);
			}
			this.selectedCountry = this.preSelectedCountry;
			this.preSelectedCountry = null;
			Global.data.selectCountry(this.selectedCountry);
		}else if(this.click){
			if(this.selectedCountry)
			{
				var list = this.getCountryObjectList(this.selectedCountry);
				this.setDeselectCountry(list);
				this.selectedCountry = null;

				Global.data.selectCountry(null);
			}

		}
	}

	move() {
		this.click = false;

		// Cancel pre-selection
		if(this.preSelectedCountry)
		{
			var list = this.getCountryObjectList(this.preSelectedCountry);
			this.setDeselectCountry(list);
			this.preSelectedCountry = null;
		}
	}

	setHoverCountry(list) {
		for(var i in list)
		{
			var obj = list[i];
			obj.material = this.hoverMaterial;
			obj.renderOrder = 2000;
		}
	}

	setSelectCountry(list) {
		for(var i in list)
		{
			var obj = list[i];
			obj.material = this.selectedMaterial;
		}
	}

	setDeselectCountry(list) {
		for(var i in list)
		{
			var obj = list[i];
			obj.material = obj.origMaterial;
			obj.renderOrder = 0;
		}
	}

	getCountryObjectList(countryName) {
		var list = [];
		var len = this.interceptObjects.length;
		for(var i = 0; i < len; i++)
		{
			var obj = this.interceptObjects[i];
			if(obj.label == countryName)
			{
				list.push(obj);
			}
		}
		return list;
	}

	update(timeStamp) {
		if(!Global.input.normalizedMousePos)
			return;

		if(this.hoverCountry)
		{
			var list = this.getCountryObjectList(this.hoverCountry);
			this.setDeselectCountry(list);
			this.hoverCountry = null;
		}

		if(!Global.input.mouseClicked)
		{
			var raycaster = new THREE.Raycaster();
	        raycaster.setFromCamera(Global.input.normalizedMousePos, Global.camera);
	        var intersects = raycaster.intersectObjects(this.interceptObjects, true /* false ??? */);
	        if(intersects.length > 0)
	        {
	        	var object = intersects[0].object;
	        	var hoveringCountry = object.label;
	        	if(hoveringCountry != this.preSelectedCountry && hoveringCountry != this.selectedCountry)
	        	{
	        		var list = this.getCountryObjectList(hoveringCountry);
	        		this.setHoverCountry(list);
	        		this.hoverCountry = hoveringCountry;
	        	}
	        }
    	}
	}

};