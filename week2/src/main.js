import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

// Fragment data
const fragments = [
  { french: "attente", english: "waiting", definition: "tumult of anxiety provoked by waiting for the loved being" },
  { french: "absence", english: "absence", definition: "any episode of language which stages the absence of the loved object" },
  { french: "adorable", english: "adorable", definition: "the sentiment of admiration experienced by the subject for the loved being" },
  { french: "angoisse", english: "anxiety", definition: "the fear of a danger, a wound, an abandonment" }
];

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 30;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// State
let textMesh;
let textLetters = [];
let cubes = [];
let hasStartedDissolving = false;
let initialCameraPosition = camera.position.clone();

// Create cubes for fragments
function createCubes() {
  const positions = [
    { x: -6, y: 3, z: 0 },
    { x: 6, y: 3, z: 0 },
    { x: -6, y: -3, z: 0 },
    { x: 6, y: -3, z: 0 }
  ];

  fragments.forEach((fragment, index) => {
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color().setHSL(index / fragments.length, 0.7, 0.5),
      transparent: true,
      opacity: 0
    });
    const cube = new THREE.Mesh(geometry, material);

    cube.position.set(
      positions[index].x,
      positions[index].y,
      positions[index].z
    );

    cube.userData = fragment;
    cube.scale.set(0, 0, 0);

    scene.add(cube);
    cubes.push(cube);
  });
}

// Load font and create text
const loader = new FontLoader();
loader.load(
  'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json',
  function (font) {
    const textGeometry = new TextGeometry(
      'so it is a lover who speaks \nand who says...',
      {
        font: font,
        size: 90,
        height: 1,
        curveSegments: 12
      }
    );

    textGeometry.center();

    const textMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      opacity: 0.8
    });

    textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.scale.setScalar(0.2);
    textMesh.position.z = -100;
    scene.add(textMesh);

    // // Create individual letter particles
    // createLetterParticles();
  }
);

function createLetterParticles() {
  // Create a particle for each character
  for (let i = 0; i < 30; i++) {
    const particleGeom = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0
    });
    const particle = new THREE.Mesh(particleGeom, particleMat);

    // Random position around text
    particle.position.set(
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 3
    );

    particle.userData.velocity = {
      x: (Math.random() - 0.5) * 0.1,
      y: (Math.random() - 0.5) * 0.1,
      z: (Math.random() - 0.5) * 0.1
    };

    scene.add(particle);
    textLetters.push(particle);
  }
}

createCubes();

// Track camera movement
let cameraMovement = 0;
let lastCameraPosition = camera.position.clone();

function checkCameraMovement() {
  const currentPos = camera.position;
  const distance = currentPos.distanceTo(lastCameraPosition);

  if (distance > 0.01) {
    cameraMovement += distance;
    lastCameraPosition.copy(currentPos);

    if (cameraMovement > 2 && !hasStartedDissolving) {
      hasStartedDissolving = true;
    }
  }
}

// Animation
function animate() {
  requestAnimationFrame(animate);

  checkCameraMovement();

  // Dissolve text and show cubes
  if (hasStartedDissolving) {
    // Fade out text
    if (textMesh && textMesh.material.opacity > 0) {
      textMesh.material.opacity -= 0.02;

      // Explode letters
      textLetters.forEach(letter => {
        letter.material.opacity = Math.min(letter.material.opacity + 0.03, 0.8);
        letter.position.x += letter.userData.velocity.x;
        letter.position.y += letter.userData.velocity.y;
        letter.position.z += letter.userData.velocity.z;

        letter.rotation.x += 0.02;
        letter.rotation.y += 0.02;
      });
    }

    // Fade in and scale cubes
    cubes.forEach((cube, index) => {
      if (cube.material.opacity < 1) {
        cube.material.opacity += 0.01;
      }
      if (cube.scale.x < 1) {
        cube.scale.x += 0.02;
        cube.scale.y += 0.02;
        cube.scale.z += 0.02;
      }

      // Gentle rotation
      cube.rotation.x += 0.003;
      cube.rotation.y += 0.005;
    });
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});