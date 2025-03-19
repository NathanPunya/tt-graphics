import { tiny, defs } from "./examples/common.js";
import { Shape_From_File } from "./examples/obj-file-demo.js";
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;
import { Mini_Figure } from './mini_figure.js';
import { House, Tree, Lamppost, Bench, Wall, Porsche, Road, Sidewalk, SandBox } from "./background.js";
import { Car } from './car.js';
import { HermiteSpline, Curve_Shape } from "./spline.js";
import { MoveCamera } from "./camera.js";
import { AnimateBuild } from "./build.js";

export const external = defs.external =
  class external extends Component {
    constructor() {
      super();
      this.t_sim = 0;
    }

    init() {
      this.shapes = {
        box: new defs.Cube(),
        ball: new defs.Subdivision_Sphere(4),
        greenBasePlate: new Shape_From_File('lego_models/greenBasePlate/floor.obj'),
      };

      const phong = new defs.Phong_Shader();
      const legoPhong = new defs.Decal_Phong();
      this.materials = {
        plastic: { shader: phong, ambient: 0.2, diffusivity: 1, specularity: 0.5, color: color(0.9, 0.5, 0.9, 1) },
        metal: { shader: phong, ambient: 0.2, diffusivity: 1, specularity: 1, color: color(0.1, 0.9, 0.1, 1) },
        lego: { shader: phong, ambient: 1, diffusivity: 1, specularity: 1, color: color(0.007, 0.205, 0.019, 1) },
        sky: { shader: phong, ambient: 1, diffusivity: 1, specularity: 0, color: color(0, 0.3, 0.8, 1) }
      };

      this.mini_fig = new Mini_Figure();
      this.mini_fig.physicsVelocity = vec3(0, 0, 0);

      // Ensure that these objects store their starting position and scale!
      this.houseOne = new House(vec3(-56, 5.2, -45), vec3(7, 7, 7));
      this.houseTwo = new House(vec3(-30, 5.2, -45), vec3(7, 7, 7));
      this.houseThree = new House(vec3(-4, 5.2, -45), vec3(7, 7, 7));
      this.houseFour = new House(vec3(22, 5.2, -45), vec3(7, 7, 7));
      this.houseFive = new House(vec3(48, 5.2, -45), vec3(7, 7, 7));

      this.wallNegativeTwo = new Wall(vec3(-59.5, 2.5, -30), vec3(4, 4, 4));
      this.wallNegativeOne = new Wall(vec3(-50.7, 2.5, -30), vec3(4, 4, 4));
      this.wallZero = new Wall(vec3(-35.1, 2.5, -30), vec3(4, 4, 4));
      this.wallOne = new Wall(vec3(-19.5, 2.5, -30), vec3(4, 4, 4));
      this.wallTwo = new Wall(vec3(-3.9, 2.5, -30), vec3(4, 4, 4));
      this.wallThree = new Wall(vec3(11.7, 2.5, -30), vec3(4, 4, 4));
      this.wallFour = new Wall(vec3(27.3, 2.5, -30), vec3(4, 4, 4));
      this.wallFive = new Wall(vec3(42.9, 2.5, -30), vec3(4, 4, 4));
      this.wallSix = new Wall(vec3(58.5, 2.5, -30), vec3(4, 4, 4));

      this.Porsche = new Porsche(vec3(50, 2.5, 10), vec3(5, 5, 5));

      this.RoadOne = new Road(vec3(-53.7, 0, 10), vec3(7, 7, 7));
      this.RoadTwo = new Road(vec3(-26.75, 0, 10), vec3(7, 7, 7));
      this.RoadThree = new Road(vec3(0.2, 0, 10), vec3(7, 7, 7));
      this.RoadFour = new Road(vec3(27.04, 0, 10), vec3(7, 7, 7));
      this.RoadFive = new Road(vec3(53.85, 0, 10), vec3(7, 7, 7));

      this.sandbox = new SandBox(vec3(-10, -0.5, -10), vec3(3, 3, 3));

      this.animateObjectList = [];

      // For the car, ensure its class sets "position" and "scale".
      this.car = new Car(vec3(-20, 3, 10), vec3(1, 1, 1));
      this.car.onReady(() => {
        this.animateCar = new AnimateBuild(this.car, [-15, 0, 0, 20]);
        this.animateObjectList.push(this.animateCar);
      });

      this.treeOne = new Tree(vec3(18, 1.2, -9), vec3(0.8, 0.8, 0.8), 16);
      this.treeOne.onReady(() => {
        this.animateTreeOne = new AnimateBuild(this.treeOne, [10, 25, -18, -4]);
        this.animateObjectList.push(this.animateTreeOne);
      });

      this.treeTwo = new Tree(vec3(-34, 1.2, -8), vec3(0.8, 0.8, 0.8), 11);
      this.treeTwo.onReady(() => {
        this.animateTreeTwo = new AnimateBuild(this.treeTwo, [-28, -10, -15, -5]);
        this.animateObjectList.push(this.animateTreeTwo);
      });

      this.lamppostOne = new Lamppost(vec3(18, 3, -5), vec3(2, 2, 2));
      this.lamppostOne.onReady(() => {
        this.animateLamppost = new AnimateBuild(this.lamppostOne, [10, 20, -3, 2]);
        this.animateObjectList.push(this.animateLamppost);
      });

      this.benchOne = new Bench(vec3(15, 1, -10), vec3(0.7, 0.7, 0.7));
      this.benchOne.onReady(() => {
        this.animateBench = new AnimateBuild(this.benchOne, [-3, 5, -10, 0]);
        this.animateObjectList.push(this.animateBench);
      });

      this.sidewalk = new Sidewalk(vec3(30, 0, -25), vec3(15, 2, 2));
      this.sidewalk.onReady(() => {
        this.animateSidewalk = new AnimateBuild(this.sidewalk, [-10, 10, -30, -20]);
        this.animateObjectList.push(this.animateSidewalk);
      });

      this.uniforms.model_transform = Mat4.identity();
      this.uniforms.projection_transform = Mat4.perspective(Math.PI / 4, 1, 1, 100);
      this.uniforms.lights = [];

      this.move_camera = new MoveCamera(this);
    }

    updatePhysics(dt) {
      const gravity = -0.0001 * dt;
      const bounceFactor = 0.7;
      const groundLevel = 0;
      const footOffset = 3.4;
      this.mini_fig.physicsVelocity = vec3(
        this.mini_fig.physicsVelocity[0],
        this.mini_fig.physicsVelocity[1] + gravity,
        this.mini_fig.physicsVelocity[2]
      );
      let pos = this.mini_fig.getMiniFigPosition();
      pos[1] += this.mini_fig.physicsVelocity[1] * dt;
      if (pos[1] - footOffset < groundLevel) {
        pos[1] = groundLevel + footOffset;
        if (this.mini_fig.physicsVelocity[1] < 0)
          this.mini_fig.physicsVelocity[1] = -this.mini_fig.physicsVelocity[1] * bounceFactor;
      }
      let currentY = this.mini_fig.getMiniFigPosition()[1];
      let dy = pos[1] - currentY;
      if (Math.abs(dy) > 0.0001) {
        this.mini_fig.move_mini_fig(Mat4.translation(0, dy, 0));
      }
    }

    render_animation(caller) {
      if (!caller.controls) {
        this.animated_children.push(
          caller.controls = new Movement_Controls(this)
        );
      }
      this.move_camera.render_animation(caller);
      let dt = caller.animation_delta_time || 16;
      this.updatePhysics(dt);
      this.uniforms.projection_transform = Mat4.perspective(
        Math.PI / 4, caller.width / caller.height, 1, 1000
      );
      const lightPos = vec4(10, 10, 10, 1);
      this.uniforms.lights = [
        defs.Phong_Shader.light_source(lightPos, color(1, 1, 1, 1), 1e6)
      ];
      const platformSize = 10;
      const gapFactor = 0.95;
      for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
          const transform = Mat4.translation(2.68 * i * platformSize, 0, 2.68 * j * platformSize)
            .times(Mat4.scale(platformSize * gapFactor, platformSize, platformSize * gapFactor));
          this.shapes.greenBasePlate.draw(caller, this.uniforms, transform, this.materials.lego);
        }
      }
      const sky_transform = Mat4.translation(0, 0, -70).times(Mat4.scale(120, 100, 1));
      this.shapes.box.draw(caller, this.uniforms, sky_transform, this.materials.sky);
      this.mini_fig.draw(caller, this.uniforms);
      this.houseOne.draw(caller, this.uniforms);
      this.houseTwo.draw(caller, this.uniforms);
      this.houseThree.draw(caller, this.uniforms);
      this.houseFour.draw(caller, this.uniforms);
      this.houseFive.draw(caller, this.uniforms);
      this.benchOne.draw(caller, this.uniforms);
      this.wallNegativeTwo.draw(caller, this.uniforms);
      this.wallNegativeOne.draw(caller, this.uniforms);
      this.wallZero.draw(caller, this.uniforms);
      this.wallOne.draw(caller, this.uniforms);
      this.wallTwo.draw(caller, this.uniforms);
      this.wallThree.draw(caller, this.uniforms);
      this.wallFour.draw(caller, this.uniforms);
      this.wallFive.draw(caller, this.uniforms);
      this.wallSix.draw(caller, this.uniforms);
      this.Porsche.draw(caller, this.uniforms);
      this.RoadOne.draw(caller, this.uniforms);
      this.RoadTwo.draw(caller, this.uniforms);
      this.RoadThree.draw(caller, this.uniforms);
      this.RoadFour.draw(caller, this.uniforms);
      this.RoadFive.draw(caller, this.uniforms);
      const currentMiniFigPos = this.mini_fig.getMiniFigPosition();
      for (let animIndex = 0; animIndex < this.animateObjectList.length; animIndex++) {
        let animateObject = this.animateObjectList[animIndex];
        animateObject.draw(caller, this.uniforms, this.mini_fig.requestingBuild, currentMiniFigPos);
      }
    }
  };

export class Movement_Controls extends Component {
  constructor(main_instance) {
    super();
    this.main = main_instance;
    this.movement_speed = 0.1;
    this.key_pressed = {};
    this.jumpInitiated = false;
    this.setup_key_listeners();
  }

  setup_key_listeners() {
    document.addEventListener("keydown", (event) => {
      let key = event.key.toLowerCase();
      this.key_pressed[key] = true;
    });
    document.addEventListener("keyup", (event) => {
      let key = event.key.toLowerCase();
      this.key_pressed[key] = false;
      if (key === "shift") {
        this.jumpInitiated = false;
      }
    });
  }

  // Updated collision detection using a bounding-circle approximation.
  // It logs a warning if an obstacle lacks a valid position.
  checkCollisions(candidatePos) {
    let miniRadius = 1; // Approximate radius for the mini-figure.
    let obstacles = [
      this.main.houseOne, this.main.houseTwo, this.main.houseThree,
      this.main.houseFour, this.main.houseFive,
      this.main.treeOne, this.main.treeTwo,
      this.main.wallNegativeTwo, this.main.wallNegativeOne,
      this.main.wallZero, this.main.wallOne, this.main.wallTwo,
      this.main.wallThree, this.main.wallFour, this.main.wallFive,
      this.main.wallSix,
      this.main.benchOne,
      this.main.Porsche,
      this.main.lamppostOne,
      this.main.sidewalk,
      this.main.car
    ];

    for (let obstacle of obstacles) {
      // If the obstacle uses an "isBuilt" flag and it's false, skip collision check.
      if ("isBuilt" in obstacle && !obstacle.isBuilt) continue;
      // Get the obstacle's position.
      let pos = obstacle.position || (obstacle.getPosition ? obstacle.getPosition() : null);
      if (!pos) {
        console.warn("Obstacle missing a position property:", obstacle);
        continue;
      }
      let dx = candidatePos[0] - pos[0];
      let dz = candidatePos[2] - pos[2];
      let distance = Math.sqrt(dx * dx + dz * dz);
      // Use half the obstacle's x scale as a rough collision radius.
      let obstacleRadius = (obstacle.boundingRadius !== undefined)
        ? obstacle.boundingRadius
        : (obstacle.scale ? obstacle.scale[0] * 0.5 : 2);


      if (distance < miniRadius + obstacleRadius) {
        return true; // Collision detected.
      }
    }
    return false;
  }

  render_animation(caller) {
    // Sum movement contributions from W, A, S, D.
    let dx = 0, dz = 0;
    if (this.key_pressed["w"]) dz -= this.movement_speed;
    if (this.key_pressed["s"]) dz += this.movement_speed;
    if (this.key_pressed["a"]) dx -= this.movement_speed;
    if (this.key_pressed["d"]) dx += this.movement_speed;

    // If moving (and not building with "x"), compute the candidate new position.
    if ((dx !== 0 || dz !== 0) && !this.key_pressed["x"]) {
      let candidatePos = this.main.mini_fig.getMiniFigPosition().slice();
      candidatePos[0] += dx;
      candidatePos[2] += dz;
      // Only move if no collision is detected.
      if (!this.checkCollisions(candidatePos)) {
        let move = Mat4.translation(dx, 0, dz);
        this.main.mini_fig.move_mini_fig(move);
        let len = Math.sqrt(dx * dx + dz * dz);
        this.main.mini_fig.direction = [dx / len, dz / len];
      }
    } else if (!this.key_pressed["x"]) {
      this.main.mini_fig.reset();
    }
    // Build animation: When "x" is pressed, trigger build.
    if (this.key_pressed["x"]) {
      this.main.mini_fig.build();
    }
    // Jump logic.
    if (this.key_pressed["shift"] && !this.jumpInitiated) {
      let pos = this.main.mini_fig.getMiniFigPosition();
      if (Math.abs(pos[1] - 3.4) < 0.01) {
        this.main.mini_fig.physicsVelocity = vec3(
          this.main.mini_fig.physicsVelocity[0],
          0.034,
          this.main.mini_fig.physicsVelocity[2]
        );
        this.jumpInitiated = true;
      }
    }
    this.main.mini_fig.draw(caller, this.main.uniforms);
  }
}

export class main extends external {
  constructor() {
    super();
  }

  render_animation(caller) {
    super.render_animation(caller);
  }
}
