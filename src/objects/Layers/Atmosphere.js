// Based on http://stemkoski.github.io/Three.js/Shader-Glow.html

import * as THREE from 'three';

export default class Atmosphere extends THREE.Group  {

	constructor() {
		super();
		var geometry, material;
	    var geometry = new THREE.SphereGeometry(1.3, 75, 75);

		var vertexShader = `
			uniform vec3 viewVector;
			uniform float c;
			uniform float p;
			varying float intensity;
			void main() 
			{
			    vec3 vNormal = normalize( normalMatrix * normal );
				vec3 vNormel = normalize( normalMatrix * viewVector );
				intensity = pow(abs(c - dot(vNormal, vNormel)), p );
				
			    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}
		`;

		var fragmentShader = `
			uniform vec3 glowColor;
			varying float intensity;
			void main() 
			{
				vec3 glow = glowColor * intensity;
			    gl_FragColor = vec4( glow, 1.0 );
			}
		`;

		var customMaterial = new THREE.ShaderMaterial( 
		{
		    uniforms: 
			{ 
				"c":   { type: "f", value: 0.1 },
				"p":   { type: "f", value: 3.0 },
				glowColor: { type: "c", value: new THREE.Color('lightskyblue') },
				viewVector: { type: "v3", value: new THREE.Vector3(0,0,-1) }
			},
			vertexShader:   vertexShader,
			fragmentShader: fragmentShader,
			side: THREE.BackSide,
			blending: THREE.AdditiveBlending,
			transparent: true
		}   );

	    this.mesh = new THREE.Mesh(geometry, customMaterial);
	    this.add(this.mesh);
	}

};