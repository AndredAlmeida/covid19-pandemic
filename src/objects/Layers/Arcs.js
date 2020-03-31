import * as THREE from 'three';
import { polar2Cartesian } from '../../utils/CoordTranslate';
import { geoDistance, geoInterpolate } from 'd3-geo';
import Global, { GLOBE_RADIUS, SIDE_MARGIN } from './../../Global';

const gradientShaders = {
  uniforms: {
    // dash param defaults, all relative to full length
    dashOffset: { value: 0.0 },
    dashSize: { value: 1 },
    gapSize: { value: 0 },
    dashTranslate: { value: 0 }, // used for animating the dash
    worldSize: { value: GLOBE_RADIUS * SIDE_MARGIN }
  },
  vertexShader: `
    uniform float dashTranslate; 

    varying vec4 vColor;
    
    attribute float vertexRelDistance;
    varying float vRelDistance;
    varying vec3 p;
    varying float z;
    void main() {
      // pass through colors and distances
      vColor = vec4(1,0.0,0.0,0.5);
      vRelDistance = vertexRelDistance + dashTranslate;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      p = (modelViewMatrix * vec4(position, 1.0)).xyz;
      z = gl_Position.z;
    }
  `,
  fragmentShader: `
    uniform float dashOffset; 
    uniform float dashSize;
    uniform float gapSize; 
    uniform float worldSize;

    varying vec4 vColor;
    varying float vRelDistance;
    varying vec3 p;
    varying float z;

    void main() {
      // ignore pixels in the gap
      if (vRelDistance < dashOffset) discard;
      if (mod(vRelDistance - dashOffset, dashSize + gapSize) > dashSize) discard;

      float d = sqrt(p.x*p.x + p.y*p.y);
      //if (d > 7.8) discard;
      if (z > 0.0 && d < worldSize) discard;
      //if(p.x > 7.8) discard;
      // set px color: [r, g, b, a], interpolated between vertices 
      gl_FragColor = vColor; 
    }
  `
};
const setAttributeFn = new THREE.BufferGeometry().setAttribute ? 'setAttribute' : 'addAttribute';


export default class Arcs extends THREE.Group  {

	getVec([lng, lat, alt]) {
        const { x, y, z } = polar2Cartesian(lat, lng, alt);
        return new THREE.Vector3(x, y, z);
	}

	calcCurve(alt, altAutoScale, startLat, startLng, endLat, endLng) {
			
		const startPnt = [startLng, startLat];
		const endPnt = [endLng, endLat];

		var altitude = alt;
		altitude = geoDistance(startPnt, endPnt) / 2 * altAutoScale;

        const interpolate = geoInterpolate(startPnt, endPnt);
        const [m1Pnt, m2Pnt] = [0.25, 0.75].map(function(t){
          var inter = interpolate(t);
          return [inter[0], inter[1], altitude * 1.5];
        });

        var v1 = this.getVec(startPnt);
        var v2 = this.getVec(m1Pnt);
        var v3 = this.getVec(m2Pnt);
        var v4 = this.getVec(endPnt);
        const curve = new THREE.CubicBezierCurve3(v1,v2,v3,v4);
        return curve;

	}

    calcVertexRelDistances(numSegments, numVerticesPerSegment = 1, invert = false) {
      const numVerticesGroup = numSegments + 1; // one between every two segments and two at the ends
      const arrLen = numVerticesGroup * numVerticesPerSegment;

      const vertexDistanceArray = new THREE.Float32BufferAttribute(arrLen, 1);

      for (let v = 0, l = numVerticesGroup; v < l; v++) {
        const relDistance = v / (l - 1);
        for (let s = 0; s < numVerticesPerSegment; s++) {
          const idx = v * numVerticesPerSegment + s;
          const pos = invert ? arrLen - 1 - idx :idx;
          vertexDistanceArray.setX(pos, relDistance);
        }
      }

      return vertexDistanceArray;
    }

    createArc(day, startLat, startLng, endLat, endLng) {

		// Init vars
		var arcCurveResolution = 32;
		var arcCircularResolution = 3;
		var stroke = 0.007;
		var alt = 1;
		var altAutoScale = 0.5;

		this.mesh = new THREE.Mesh();
		this.mesh.material = this.sharedMaterial.clone();
		this.mesh.renderOrder = 150;
		this.mesh.day = day;

		var curve = this.calcCurve(alt, altAutoScale, startLat, startLng, endLat, endLng);
		this.mesh.geometry = new THREE.TubeBufferGeometry(curve, arcCurveResolution, stroke / 2, arcCircularResolution);

        // calculate vertex relative distances (for dashed lines)
        const vertexRelDistanceArray = this.calcVertexRelDistances(
          arcCurveResolution, // numSegments
          arcCircularResolution + 1, // num vertices per segment
          true // run from end to start, to animate in the correct direction
        );

        this.mesh.geometry[setAttributeFn]('vertexRelDistance', vertexRelDistanceArray);

        this.add(this.mesh);
        this.arcList.push(this.mesh);
    }

	constructor() {
		super();

		this.arcList = [];
		this.sharedMaterial = new THREE.ShaderMaterial({
		      uniforms: gradientShaders.uniforms,
          vertexShader: gradientShaders.vertexShader,
          fragmentShader: gradientShaders.fragmentShader,
		      transparent: true,
		      //blending: THREE.AdditiveBlending,
		      depthWrite: false,
		      depthTest: false
		    });

	}

	update(dt) {
		var len = this.arcList.length;
		for(var i = 0; i < len; i++)
		{
			var mesh = this.arcList[i];
			var delta = mesh.day - Global.data.day;
			var arcDelay = 1.0;
			if(delta < arcDelay){
				delta = delta/arcDelay;
				if(delta < 0.0)
					delta = 0.0;
			}else{
				delta = 1.0;
			}

			mesh.material.uniforms.dashOffset.value = delta;
			mesh.material.uniforms.worldSize.value = this.parent.scale.x;
		}
	}

};