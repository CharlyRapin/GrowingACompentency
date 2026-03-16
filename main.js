import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import courtUrl from './3DAsset/tennis_court.glb?url';
import ballUrl from './3DAsset/tennis_ball.glb?url';

// create the scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
let ballMesh = null;

// add the camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(15, 8, 0);

const container = document.getElementById('threejs-container');
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Add shadow
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
        // Make the court receive shadows
        court.traverse((child) => {
            if (child.isMesh) {
                child.receiveShadow = true;
            }
        });
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

        // Make the ball cast shadows
        ball.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
            }
        });

        scene.add(ball);
        ballMesh = ball;

    },
    undefined,
    (error) => console.error('Error loading tennis ball:', error)
);


const rallyDuration = 2000; // how long the ball is in the air for
// This is where the animation occurs
function animate(time) {
    requestAnimationFrame(animate);
    controls.update();

    if (ballMesh && time) {

        // check which side the ball is on
        const shotProgress = (time % rallyDuration) / rallyDuration; // 0 to 1

        // determine direction based on which rally we are in
        const isGoingRight = Math.floor(time / rallyDuration) % 2 === 0;

        // Z axis 
        const zStart = isGoingRight ? -12 : 12;
        const zEnd = isGoingRight ? 12 : -12;
        ballMesh.position.z = zStart + (zEnd - zStart) * shotProgress;

        // X axis 
        const xStart = isGoingRight ? -3 : 3;
        const xEnd = isGoingRight ? 3 : -3;
        ballMesh.position.x = xStart + (xEnd - xStart) * shotProgress;

        // Y axis 
        let y = 0.2;

        // create an arc for the ball to travel 
        if (shotProgress < 0.85) {

            const p = shotProgress / 0.85;
            const baseH = 1.5 * (1 - p) + 0.2 * p;
            const arcH = 4 * p * (1 - p) * 3;
            y = baseH + arcH;
        } else {
            const p = (shotProgress - 0.85) / 0.15;
            const baseH = 0.2 * (1 - p) + 1.5 * p;
            const arcH = 4 * p * (1 - p) * 1.5;
            y = baseH + arcH;
        }

        ballMesh.position.y = y;
    }

    renderer.render(scene, camera);
}
animate();

// use to update the scene based on the size of the window
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
