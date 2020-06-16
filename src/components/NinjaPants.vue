<template>
  <div class="NinjaPants">
    <canvas id="pants" height="320" width="320"></canvas>
  </div>
</template>

<script>
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default {
  name: "NinjaPants",
  mounted() {
    const clock = new THREE.Clock();
    const mixers = [];
    const $canvas = document.getElementById("pants");
    const canvasWidth = $canvas.clientWidth;
    const canvasHeight = $canvas.clientHeight;
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas: $canvas
    });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(canvasWidth / canvasHeight);
    renderer.physicallyCorrectLights = true;
    renderer.setClearColor(0x000000, 0);
    const scene = new THREE.Scene();
    const fov = 35;
    const aspect = canvasWidth / canvasHeight;
    const near = 1;
    const far = 100;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set(0, 1.4, 3);
    camera.rotateX(-Math.PI / 12);
    const ambientLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 5);
    const mainLight = new THREE.DirectionalLight(0xffffff, 8);
    mainLight.position.set(18, 18, 18);
    const secondaryLight = new THREE.DirectionalLight(0xffffff, 6);
    secondaryLight.position.set(-8, 5, 6);
    scene.add(ambientLight, mainLight, secondaryLight);
    const loader = new GLTFLoader();
    loader.load("assets/Test-jorts.glb", function(gltf) {
      const model = gltf.scene.children[0];
      const mixer = new THREE.AnimationMixer(model);
      mixers.push(mixer);
      const animation = gltf.animations[0];
      const action = mixer.clipAction(animation);
      action.play();
      scene.add(model);
      renderer.setAnimationLoop(() => {
        const delta = clock.getDelta();
        for (const mixer of mixers) {
          mixer.update(delta);
        }
        model.rotateY(-Math.PI / 512);
        renderer.render(scene, camera);
      });
    });
  }
};
</script>

<style lang="scss" scoped>
.NinjaPants {
  padding: 8px;

  & > canvas {
    background-color: whitesmoke;
  }
}
</style>
