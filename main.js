// Importaciones necesarias
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Función para inicializar una escena
function initScene(canvasId) {
  const canvas = document.getElementById(canvasId);

  // Escena, cámara y renderizador
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  // Luces mejoradas
  const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Luz ambiental aumentada
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Luz direccional aumentada
  directionalLight.position.set(1, 1, 1).normalize();
  scene.add(directionalLight);

  // Luz puntual
  const pointLight = new THREE.PointLight(0xffffff, 2, 10); // Intensidad 2, distancia 10
  pointLight.position.set(2, 3, 2); // Coloca la luz cerca del modelo
  scene.add(pointLight);

  // Luz hemisférica
  const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 1.5); // Luz de relleno
  scene.add(hemisphereLight);

  // Controles de órbita sin damping
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false; // Desactiva el "rebote"
  controls.enableZoom = true; // Permite zoom
  controls.enablePan = true; // Permite desplazar
  controls.autoRotate = true; // Permite rotación automática

  return { scene, camera, renderer, controls };
}

// Función para cargar un modelo y ajustar la cámara
function loadModelAndAdjustCamera(scene, camera, modelPath, cameraOptions = {}) {
  return new Promise((resolve) => {
    const loader = new GLTFLoader();
    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        // Calcular bounding box del modelo
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Ajustar posición inicial del modelo
        model.position.x -= center.x; // Centrar modelo en el origen
        model.position.y -= center.y;
        model.position.z -= center.z;

        // Ajustar posición inicial de la cámara según el tamaño del modelo o las opciones personalizadas
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180); // Convertir a radianes
        const adjustmentFactor = 0.8; // Factor de ajuste de la distancia para acercar más la cámara
        const cameraDistance = (maxDim / (2 * Math.tan(fov / 2))) * adjustmentFactor;

        if (cameraOptions.x !== undefined && cameraOptions.y !== undefined && cameraOptions.z !== undefined) {
          camera.position.set(cameraOptions.x, cameraOptions.y, cameraOptions.z);
        } else {
          camera.position.set(center.x, center.y + size.y / 2, cameraDistance + size.z);
        }

        if (cameraOptions.lookAt) {
          camera.lookAt(cameraOptions.lookAt.x, cameraOptions.lookAt.y, cameraOptions.lookAt.z);
        } else {
          camera.lookAt(center);
        }

        resolve(model); // Devuelve el modelo
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
        resolve(null);
      }
    );
  });
}

// Función para animar una escena
function animate(scene, camera, renderer, controls) {
  function render() {
    controls.update(); // Solo actualiza los controles sin animaciones
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();
}

// Inicialización de escenas sin animaciones automáticas
(async () => {
  // Escena 1
  const scene1 = initScene('canvas1');
  const model1 = await loadModelAndAdjustCamera(scene1.scene, scene1.camera, 'Models/PlacaChickpea.glb', {
    x: 2, y: 1, z: 1, // Posición personalizada de la cámara (más cercana)
    lookAt: { x: 0, y: 0, z: 0 }, // Punto al que mira la cámara (centro del modelo)
  });
  animate(scene1.scene, scene1.camera, scene1.renderer, scene1.controls);

  // // Escena 2
  // const scene2 = initScene('canvas2');
  // const model2 = await loadModelAndAdjustCamera(scene2.scene, scene2.camera, 'Models/mediavalbook.glb');
  // animate(scene2.scene, scene2.camera, scene2.renderer, scene2.controls);
})();
