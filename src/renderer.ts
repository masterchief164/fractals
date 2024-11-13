import * as THREE from 'three';
import {throttle} from 'lodash';

import { rendererProps } from './types';
import { OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import shader from './shader.glsl';

export default class Renderer {
    props: rendererProps;
    uniforms;

    aspect = window.innerWidth / window.innerHeight;
    zoom = 4.0;
    offset = new THREE.Vector2(-2.0*this.aspect, -2.0);

    scene: THREE.Scene = new THREE.Scene();
    camera: THREE.OrthographicCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, -1, 1);

    renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer();

    constructor(props: rendererProps) {
        this.props = props;
        console.log("Renderer created");
        console.log(window.innerWidth, window.innerHeight);

        this.uniforms = {
            res: {type: 'vec2', value: new THREE.Vector2(window.innerWidth, window.innerHeight)},
            aspect: {type: 'float', value: this.aspect},
            zoom: {type:'float', value: this.zoom},
            offset: {type:'vec2', value: this.offset},
            color_scheme: {type: "int", value: props.color_scheme},
        };

        this.render = throttle(this.render.bind(this), 20);

        this.setupScene();

        // this.scroll = this.scroll.bind(this);
        this.subscribeEvents();
        this.attachToDOM();
        this.render();
    }

    setupScene() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.createMesh();
    }

    attachToDOM() {
        const element = document.getElementById("canvas");

        if (element && this.renderer) {
            element.appendChild(this.renderer.domElement);
        }
        else {
            console.log("uh oh");
        }
        const controls = new OrbitControls(this.camera, this.renderer?.domElement);
        controls.enablePan = true;
    }

    createMesh() {
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            fragmentShader: shader,
        });

        const mesh = new THREE.Mesh(geometry, material);
        if(this.scene)
            this.scene.add(mesh);
    }

    scroll(event: WheelEvent) {
        const zoom_0 = this.zoom;

        // accounting for the different in scrolling between Chrome and FireFox
        if (navigator.userAgent.indexOf("Firefox") != -1) {
            this.zoom *= 1 + event.deltaY * 0.003;
        } else {
            this.zoom *= 1 + event.deltaY * 0.001;
        }

        const space = this.zoom - zoom_0;
        const mouseX = event.clientX / window.innerWidth;
        const mouseY = 1 - event.clientY / window.innerHeight;
        this.offset = this.offset.add(new THREE.Vector2(-mouseX * space * this.aspect, -mouseY * space));

        this.uniforms.zoom.value = this.zoom;
        this.uniforms.offset.value = this.offset;

        this.render();
    }

    subscribeEvents() {
        document.addEventListener('wheel', this.scroll);
    }

    /// ======== UPDATING AND RENDERING ========
    updateColors(color_scheme: number) {
        this.uniforms.color_scheme  .value = color_scheme;
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
}