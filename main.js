import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import courtUrl from './3DAsset/tennis_court.glb?url';
import ballUrl from './3DAsset/tennis_ball.glb?url';

// create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

// add the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(15, 8, 0);

const container = document.getElementById('threejs-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

container.appendChild(renderer.domElement);

// add the lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
scene.add(directionalLight);

// add the controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
// add the loaders
const loader = new GLTFLoader();

// Load the tennis court
loader.load(
    courtUrl,
    (gltf) => {
        const court = gltf.scene;
        scene.add(court);
    },
    undefined,
    (error) => console.error('Error loading tennis court:', error)
);

// Load the tennis ball
loader.load(
    ballUrl,
    (gltf) => {
        const ball = gltf.scene;

        // move the ball to its intial position, scale the ball to it correct size
        ball.position.set(2, 0.2, 2);
        ball.scale.set(0.15, 0.15, 0.15);
        scene.add(ball);

    },
    undefined,
    (error) => console.error('Error loading tennis ball:', error)
);

// This is where the animation occurs
function animate() {
    requestAnimationFrame(animate);
    controls.update(); // required if damping enabled
    renderer.render(scene, camera);
}
animate();

// use to update the scene based on the size of the window
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
