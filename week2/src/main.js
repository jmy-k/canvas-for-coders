import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls";
import { TextGeometry } from "three/addons/geometries/TextGeometry";
import { FontLoader } from "three/addons/loaders/FontLoader";



const cluster1 = ['bird.jpg', 'tree.jpg', 'sparkle.jpg', 'lamb.jpg', 'house.jpg'];
const cluster2 = ['folder.jpg', 'words.jpg', 'star.jpg', 'sea.jpg'];

// app
const app = document.querySelector("#app");

// renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

// scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xA53860);

// perspective camera ( fov, aspect, near, far )
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  3000
);
camera.position.set(0, 0, 400);
camera.lookAt(0, 0, 0);

// lights
const ambientLight = new THREE.AmbientLight("white", 3);
const directionalLight = new THREE.DirectionalLight("#ccc", 2);
directionalLight.position.set(-10, 10, 10);
const directionalLightHelper = new THREE.DirectionalLightHelper(
  directionalLight,
  1
);
scene.add(ambientLight, directionalLight, directionalLightHelper);

// control
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.screenSpacePanning = false;
controls.enableRotate = true;
controls.rotateSpeed = 0.3;
controls.enableZoom = true;
controls.zoomSpeed = 0.5;
controls.minDistance = 10;
controls.maxDistance = 1000;

// axes helper -> X: red, Y: green, Z: blue
const axesHelper = new THREE.AxesHelper(100);
scene.add(axesHelper);

// resize
const onResize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

window.addEventListener("resize", onResize);

///////

// geometries
const cubeSm = new THREE.BoxGeometry(100, 100, 25);
const cubeMed = new THREE.BoxGeometry(150, 150, 25);
const plane = new THREE.PlaneGeometry(100, 100);

const pink = new THREE.MeshPhongMaterial({
  color: 0xFFA5AB,
});

// create image meshes
function createImageMesh(imageName, geometry, position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }) {
  const texture = new THREE.TextureLoader().load(`/${imageName}`);
  texture.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(position.x, position.y, position.z);
  mesh.rotation.set(rotation.x, rotation.y, rotation.z);

  scene.add(mesh);
  return mesh;
}

function randomOffset(range) {
  return (Math.random() - 0.5) * range;
}

// cluster 1

// title
const fontLoader = new FontLoader();
fontLoader.load("/Inconsolata_Regular.json", (font) => {
  const text = "cluster 1";

  const textGeometry = new TextGeometry(text, {
    font: font,
    size: 500,
    height: 5,
    curveSegments: 12,

  });

  const textMesh = new THREE.Mesh(textGeometry, pink);
  textMesh.scale.setScalar(0.03);
  textMesh.position.z = 50;
  scene.add(textMesh);
});

cluster1.forEach((imageName, index) => {
  createImageMesh(
    imageName,
    cubeMed,
    {
      x: index * 150 + randomOffset(50),  // ±25 units variation
      y: 75 + randomOffset(30),            // ±15 units variation
      z: 0 + randomOffset(50)              // ±25 units variation
    },
    {
      x: 0,
      y: 0,
      z: randomOffset(Math.PI / 4)         // ±22.5 degrees rotation
    }
  );
});

// cluster 2 images
// cluster2.forEach((imageName, index) => {
//   createImageMesh(
//     imageName,
//     cubeMed,
//     {
//       x: (index * 150) + 500 + randomOffset(50),  // ±25 units variation
//       y: 100 + randomOffset(30),                   // ±15 units variation
//       z: -150 + randomOffset(50)                   // ±25 units variation
//     },
//     {
//       x: 0,
//       y: Math.PI / 4,
//       z: randomOffset(Math.PI / 3)                 // ±30 degrees rotation
//     }
//   );
// });

fontLoader.load("/Inconsolata_Regular.json", (font) => {
  const text = "cluster 2";

  const textGeometry = new TextGeometry(text, {
    font: font,
    size: 500,
    height: 5,
    curveSegments: 12,

  });

  const textMesh = new THREE.Mesh(textGeometry, pink);
  textMesh.scale.setScalar(0.03);
  textMesh.position.x = 500;
  textMesh.position.z = -200;
  scene.add(textMesh);
});

cluster2.forEach((imageName, index) => {
  createImageMesh(
    imageName,
    cubeMed,
    { x: (index * 150) + 500, y: 75, z: -300 },
    { x: 0, y: Math.PI / 4, z: 0 }
  );
})

// animate
const animate = () => {
  controls.update();
  renderer.render(scene, camera);
};
renderer.setAnimationLoop(animate);