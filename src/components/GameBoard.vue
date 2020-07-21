<template>
  <div class="GameBoard">
    <canvas id="board" :height="height" :width="width"></canvas>
  </div>
</template>

<script>
import * as THREE from "three";
import { default as TWEEN } from "@tweenjs/tween.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { ROOM_SEND_EVENT } from "@/models/room.js";

export default {
  name: "GameBoard",
  props: {
    height: Number,
    width: Number
  },
  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,
      loader: new GLTFLoader(),
      Atlas: null,
      Dragon: null,
      clock: new THREE.Clock(),
      mixers: [],
      mouseTarget: new THREE.Vector2()
    };
  },
  mounted() {
    const self = this;

    // Renderer
    const canvas = document.getElementById("board");
    self.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      canvas
    });
    self.renderer.setSize(self.width, self.height);
    self.renderer.setPixelRatio(self.width / self.height);
    self.renderer.physicallyCorrectLights = true;
    self.renderer.setClearColor(0x000000, 0);

    // Camera
    const fov = 35;
    const aspect = self.width / self.height;
    const near = 1;
    const far = 100;
    self.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    self.camera.position.set(0, 5, 18);
    self.camera.rotateX(-Math.PI / 12);

    // Lights & Scene
    const ambientLight = new THREE.HemisphereLight(0xddeeff, 0x0f0e0d, 5);
    const mainLight = new THREE.DirectionalLight(0xffffff, 8);
    mainLight.position.set(18, 18, 18);
    const secondaryLight = new THREE.DirectionalLight(0xffffff, 6);
    secondaryLight.position.set(-8, 5, 6);
    self.scene = new THREE.Scene();
    self.scene.add(ambientLight, mainLight, secondaryLight);

    // Handle Window Resize
    window.addEventListener("resize", function() {
      self.camera.aspect = self.width / self.height;
      self.camera.updateProjectionMatrix();
      self.renderer.setSize(self.width, self.height);
      self.renderer.setPixelRatio(self.width / self.height);
    });

    canvas.addEventListener("click", event => {
      if (self.yourTurn) {
        self.mouseTarget = {
          x: ((event.clientX - canvas.offsetLeft) / canvas.clientWidth) * 2 - 1,
          y: -((event.clientY - canvas.offsetTop) / canvas.clientHeight) * 2 + 1
        };
      }
    });

    // Setup Dynamic Animation Loop
    self.renderer.setAnimationLoop(time => {
      const delta = self.clock.getDelta();
      for (const mixer of self.mixers) {
        mixer.update(delta);
      }
      TWEEN.update(time);
      self.renderer.render(self.scene, self.camera);
    });

    // Load Platform
    self.loader.load("assets/platform.glb", function(gltf) {
      const model = gltf.scene.children[0];
      model.name = "Platform";
      model.position.x = 0;
      model.position.z = 0;
      model.scale.x = 8;
      model.scale.z = 8;
      self.scene.add(model);
    });

    // Load Opponent if they were first
    if (self.name === "Atlas" && self.room.hasDragon) {
      self.loadJorts("Dragon", false);
    } else if (self.name === "Dragon" && self.room.hasAtlas) {
      self.loadJorts("Atlas", false);
    }

    // Drop in
    self.loadJorts(self.name, true);
  },
  computed: {
    name: function() {
      return this.$store.getters.name;
    },
    room: function() {
      return this.$store.getters.room;
    },
    lastTurn: function() {
      return this.$store.getters.lastTurn;
    },
    yourTurn: function() {
      const round = this.room.currentRound;
      if (!round) return false;
      const turn = round.turns[round.turns.length - 1];
      return !!turn && turn.agent === this.name;
    },
    enemy: function() {
      return this.name === "Atlas" ? "Dragon" : "Atlas";
    }
  },
  methods: {
    loadJorts(agent, dropIn) {
      const self = this;
      const pants =
        agent === this.name
          ? "assets/pants/blue_jorts.glb"
          : "assets/pants/red_jorts.glb";
      // load appropriate pants
      self.loader.load(pants, function(gltf) {
        self[agent] = gltf;
        // add model
        const jorts = gltf.scene.children[0];
        jorts.name = agent;
        self.scene.add(jorts);
        // set board position
        const location = self.room.board[agent];
        jorts.position.x = location.x;
        jorts.position.z = location.z;
        // handle dropIn
        if (dropIn) {
          const origin = { y: 6 };
          const target = { y: jorts.position.y };
          const duration = 800;
          jorts.position.y = origin;
          const tween = new TWEEN.Tween(origin).to(target, duration);
          tween.onUpdate(() => {
            jorts.position.y = origin.y;
          });
          tween.onComplete(() => {
            if (self.room.hasAtlas && self.room.hasDragon) {
              const otherAgent = agent === self.name ? self.enemy : self.name;
              const otherJorts = self.scene.getObjectByName(otherAgent);
              self.rotateJorts(agent, otherJorts.position);
              self.rotateJorts(otherAgent, jorts.position);
            }
          });
          tween.start();
        }
      });
    },
    removeJorts(agent) {
      const model = this.scene.getObjectByName(agent);
      this.scene.remove(model);
    },
    rotateJorts(agent, targetLocation) {
      const scene = this.scene;
      const jorts = scene.getObjectByName(agent);
      const origin = new THREE.Vector2(jorts.position.z, jorts.position.x);
      const target = new THREE.Vector2(targetLocation.z, targetLocation.x);
      const xDiff = target.x - origin.x;
      const yDiff = target.y - origin.y;
      const angle = Math.atan(Math.abs(yDiff) / Math.abs(xDiff));
      // calculate rotation
      let rotation = Math.PI / 2;
      if (xDiff > 0) {
        if (yDiff > 0) {
          rotation += angle;
        } else {
          rotation += 2 * Math.PI - angle;
        }
      } else {
        if (yDiff > 0) {
          rotation += Math.PI - angle;
        } else {
          rotation += Math.PI + angle;
        }
      }
      rotation = rotation % (2 * Math.PI);
      jorts.rotation.y = rotation;
    },
    moveJorts(agent, origin, target) {
      const scene = this.scene;
      // start walking animation
      const gltf = this[agent];
      // ["Block", "Die", "GetHit", "Heavy Kick", "Jump", "Kick", "WalkLoop"]
      const animation = gltf.animations[6];
      const jorts = scene.getObjectByName(agent);
      this.rotateJorts(agent, target);
      const mixer = new THREE.AnimationMixer(jorts);
      const action = mixer.clipAction(animation);
      this.mixers.push(mixer);
      // tween movement
      const multiplier = 130;
      const distance = Math.sqrt(
        (target.z - origin.z) ** 2 + (target.x - origin.x) ** 2
      );
      const tween = new TWEEN.Tween(origin).to(target, distance * multiplier);
      const isPlayer = agent === this.name;
      const otherAgent = isPlayer ? this.enemy : this.name;
      const otherJorts = scene.getObjectByName(otherAgent);
      const self = this;
      tween.onUpdate(() => {
        jorts.position.x = origin.x;
        jorts.position.z = origin.z;
        if (isPlayer) {
          self.drawPlayerCircle(origin);
          const config = {
            name: "Target",
            color: 0x2196f3,
            radius: 0.5
          };
          self.drawCircleOutline(target, config);
          self.drawLine(origin, target);
        }
        self.rotateJorts(otherAgent, jorts.position);
      });
      tween.onComplete(() => {
        mixer.stopAllAction();
        self.clearPathUI();
        self.rotateJorts(agent, otherJorts.position);
      });
      // kick it off
      tween.start();
      action.play();
    },
    attackJorts(agent, success) {
      const scene = this.scene;
      // agent animation
      const gltf = this[agent];
      const animation = gltf.animations[3];
      const jorts = scene.getObjectByName(agent);
      const mixer = new THREE.AnimationMixer(jorts);
      const attackAction = mixer.clipAction(animation);
      attackAction.repetitions = 1;
      this.mixers.push(mixer);
      // response animation
      const other = agent === this.name ? this.enemy : this.name;
      const otherGltf = this[other];
      const otherAnimation = otherGltf.animations[success ? 1 : 0];
      const otherJorts = scene.getObjectByName(other);
      const otherMixer = new THREE.AnimationMixer(otherJorts);
      const responseAction = otherMixer.clipAction(otherAnimation);
      responseAction.repetitions = 1;
      this.mixers.push(otherMixer);
      // start both animations
      attackAction.play();
      responseAction.play();
    },
    clearPathUI() {
      const scene = this.scene;
      const oldCircle = scene.getObjectByName("Player");
      scene.remove(oldCircle);
      const oldOutline = scene.getObjectByName("Target");
      scene.remove(oldOutline);
      const oldLine = scene.getObjectByName("Line");
      scene.remove(oldLine);
      this.$store.commit("setPath", []);
    },
    drawPathUI(target) {
      const camera = this.camera;
      const scene = this.scene;
      const raycaster = new THREE.Raycaster();

      raycaster.setFromCamera(target, camera);
      const intersects = raycaster.intersectObjects(scene.children);
      const platform = intersects.find(
        intersection => intersection.object.name === "Platform"
      );
      if (platform) {
        const player = scene.getObjectByName(this.name);
        const origin = new THREE.Vector3(
          player.position.x,
          0.1,
          player.position.z
        );
        const target = new THREE.Vector3(
          platform.point.x,
          0.1,
          platform.point.z
        );

        this.drawPlayerCircle(origin);
        const config = {
          name: "Target",
          color: 0x2196f3,
          radius: 0.5
        };
        this.drawCircleOutline(target, config);
        this.drawLine(origin, target);
        return [origin, target];
      } else return null;
    },
    drawPlayerCircle(origin) {
      const scene = this.scene;
      const oldCircle = scene.getObjectByName("Player");
      scene.remove(oldCircle);
      const radius = 0.5;
      const geometry = new THREE.CircleGeometry(radius, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0x2196f3 });
      const circle = new THREE.Mesh(geometry, material);
      circle.name = "Player";
      circle.position.x = origin.x;
      circle.position.y = origin.y;
      circle.position.z = origin.z;
      circle.rotation.x = -Math.PI / 2;
      scene.add(circle);
    },
    drawEnemyUI(position) {
      const scene = this.scene;
      const radius = 0.5;
      const geometry = new THREE.CircleGeometry(radius, 32);
      const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const circle = new THREE.Mesh(geometry, material);
      circle.name = "Enemy";
      circle.position.x = position.x;
      circle.position.y = 0.1;
      circle.position.z = position.z;
      circle.rotation.x = -Math.PI / 2;
      scene.add(circle);
      // Draw Attack Range
      const config = {
        name: "Range",
        color: 0xff0000,
        radius: 2
      };
      this.drawCircleOutline(circle.position, config);
    },
    drawCircleOutline(target, config) {
      const scene = this.scene;
      const oldOutline = scene.getObjectByName(config.name);
      scene.remove(oldOutline);
      const radius = config.radius;
      const geometry = new THREE.CircleGeometry(radius, 32);
      const material = new THREE.MeshBasicMaterial({ color: config.color });
      const circle = new THREE.Mesh(geometry, material);
      circle.position.x = target.x;
      circle.position.y = target.y;
      circle.position.z = target.z;
      circle.rotation.x = -Math.PI / 2;
      circle.updateMatrix();
      // get translated vertices
      const points = [];
      circle.geometry.vertices.forEach((vertex, index) => {
        if (index > 0) {
          const vector = new THREE.Vector3();
          vector.copy(vertex);
          vector.applyMatrix4(circle.matrix);
          points.push(vector);
        }
      });
      const vector = new THREE.Vector3();
      vector.copy(points[0]);
      points.push(vector);
      // create outline
      const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
      const lineMaterial = new THREE.LineBasicMaterial({ color: config.color });
      const outline = new THREE.Line(lineGeometry, lineMaterial);
      outline.name = config.name;
      scene.add(outline);
    },
    drawLine(origin, target) {
      const scene = this.scene;
      // Remove Old Line
      const oldLine = scene.getObjectByName("Line");
      scene.remove(oldLine);
      // Create New Line
      const lineGeometry = new THREE.BufferGeometry().setFromPoints([
        origin,
        target
      ]);
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x2196f3 });
      const line = new THREE.Line(lineGeometry, lineMaterial);
      line.name = "Line";
      scene.add(line);
    }
  },
  watch: {
    room: function(newRoom, oldRoom) {
      if (this.name === "Atlas") {
        if (!oldRoom.hasDragon && newRoom.hasDragon) {
          this.loadJorts("Dragon", true);
        }
        if (oldRoom.hasDragon && !newRoom.hasDragon) {
          this.removeJorts("Dragon");
        }
      }
      if (this.name === "Dragon") {
        if (!oldRoom.hasAtlas && newRoom.hasAtlas) {
          this.loadJorts("Atlas", true);
        }
        if (oldRoom.hasAtlas && !newRoom.hasAtlas) {
          this.removeJorts("Atlas");
        }
      }
    },
    lastTurn: function(newTurn, oldTurn) {
      // Initiative Turn
      if (oldTurn && newTurn.number === oldTurn.number) return;
      if (newTurn) {
        if (newTurn.action === ROOM_SEND_EVENT.MOVE) {
          this.moveJorts(newTurn.agent, newTurn.data.from, newTurn.data.to);
        } else if (newTurn.action === ROOM_SEND_EVENT.ATTACK) {
          this.attackJorts(newTurn.agent, newTurn.data);
        }
      }
      // Your non-MOVE Event
      if (
        newTurn &&
        newTurn.agent === this.name &&
        newTurn.action !== ROOM_SEND_EVENT.MOVE
      ) {
        this.clearPathUI();
      }
    },
    yourTurn: function(isYourTurn) {
      if (isYourTurn) {
        const enemyPosition = this.room.board[this.enemy];
        this.drawEnemyUI(enemyPosition);
      } else {
        const enemy = this.scene.getObjectByName("Enemy");
        const range = this.scene.getObjectByName("Range");
        this.scene.remove(enemy);
        this.scene.remove(range);
      }
    },
    mouseTarget: function(target) {
      const points = this.drawPathUI(target);
      if (points !== null) {
        this.$store.commit("setPath", points);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.GameBoard {
  height: 100%;
  width: 100%;
  overflow: hidden;

  canvas {
    display: block;
    background-color: gray;
  }
}
</style>
