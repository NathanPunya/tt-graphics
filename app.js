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

      // Create the mini figure and add a physics velocity property.
      this.mini_fig = new Mini_Figure();
      this.mini_fig.physicsVelocity = vec3(0, 0, 0);

      // Create Houses.
      this.houseOne = new House(vec3(-56, 5.2, -45), vec3(7, 7, 7));
      this.houseTwo = new House(vec3(-30, 5.2, -45), vec3(7, 7, 7));
      this.houseThree = new House(vec3(-4, 5.2, -45), vec3(7, 7, 7));
      this.houseFour = new House(vec3(22, 5.2, -45), vec3(7, 7, 7));
      this.houseFive = new House(vec3(48, 5.2, -45), vec3(7, 7, 7));

      // Create Walls.
      this.wallNegativeTwo = new Wall(vec3(-59.5, 2.5, -30), vec3(4, 4, 4));
      this.wallNegativeOne = new Wall(vec3(-50.7, 2.5, -30), vec3(4, 4, 4));
      this.wallZero = new Wall(vec3(-35.1, 2.5, -30), vec3(4, 4, 4));
      this.wallOne = new Wall(vec3(-19.5, 2.5, -30), vec3(4, 4, 4));
      this.wallTwo = new Wall(vec3(-3.9, 2.5, -30), vec3(4, 4, 4));
      this.wallThree = new Wall(vec3(11.7, 2.5, -30), vec3(4, 4, 4));
      this.wallFour = new Wall(vec3(27.3, 2.5, -30), vec3(4, 4, 4));
      this.wallFive = new Wall(vec3(42.9, 2.5, -30), vec3(4, 4, 4));
      this.wallSix = new Wall(vec3(58.5, 2.5, -30), vec3(4, 4, 4));

      // Create Porsche.
      this.Porsche = new Porsche(vec3(50, 2.5, 10), vec3(5, 5, 5));

      // Create Roads.
      this.RoadOne = new Road(vec3(-53.7, 0, 10), vec3(7, 7, 7));
      this.RoadTwo = new Road(vec3(-26.75, 0, 10), vec3(7, 7, 7));
      this.RoadThree = new Road(vec3(0.2, 0, 10), vec3(7, 7, 7));
      this.RoadFour = new Road(vec3(27.04, 0, 10), vec3(7, 7, 7));
      this.RoadFive = new Road(vec3(53.85, 0, 10), vec3(7, 7, 7));

      // Create Sandbox (optional).
      this.sandbox = new SandBox(vec3(-10, -0.5, -10), vec3(3, 3, 3));

      this.animateObjectList = [];

      // Create and animate Car.
      this.car = new Car(vec3(-20, 3, 10), vec3(1, 1, 1));
      this.car.onReady(() => {
        this.animateCar = new AnimateBuild(this.car, [-15, 0, 0, 20]);
        this.animateObjectList.push(this.animateCar);
      });

      // Create and animate Trees.
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

      // Create and animate Lamppost.
      this.lamppostOne = new Lamppost(vec3(18, 3, -5), vec3(2, 2, 2));
      this.lamppostOne.onReady(() => {
        this.animateLamppost = new AnimateBuild(this.lamppostOne, [10, 20, -3, 2]);
        this.animateObjectList.push(this.animateLamppost);
      });

      // Create and animate Bench.
      this.benchOne = new Bench(vec3(15, 1, -10), vec3(0.7, 0.7, 0.7));
      this.benchOne.onReady(() => {
        this.animateBench = new AnimateBuild(this.benchOne, [-3, 5, -10, 0]);
        this.animateObjectList.push(this.animateBench);
      });

      // Create and animate Sidewalk.
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

    // Update physics each frame.
    updatePhysics(dt) {
      // dt is in milliseconds.
      const gravity = -0.0005 * dt;
      const bounceFactor = 0.7;
      const groundLevel = 0;   // world ground level
      const footOffset = 3.4;    // mini figure's feet are 1 unit below its origin

      // Update vertical velocity with gravity.
      this.mini_fig.physicsVelocity = vec3(
        this.mini_fig.physicsVelocity[0],
        this.mini_fig.physicsVelocity[1] + gravity,
        this.mini_fig.physicsVelocity[2]
      );

      // Get current mini figure position.
      let pos = this.mini_fig.getMiniFigPosition();
      // Update vertical position based on velocity.
      pos[1] += this.mini_fig.physicsVelocity[1] * dt;

      // Bounce when hitting the ground (taking into account the foot offset).
      if (pos[1] - footOffset < groundLevel) {
        pos[1] = groundLevel + footOffset;
        if (this.mini_fig.physicsVelocity[1] < 0)
          this.mini_fig.physicsVelocity[1] = -this.mini_fig.physicsVelocity[1] * bounceFactor;
      }

      // Adjust the mini figure's vertical position.
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

      // Update physics simulation.
      let dt = caller.animation_delta_time || 16; // dt in milliseconds
      this.updatePhysics(dt);

      // Set up lighting.
      this.uniforms.projection_transform = Mat4.perspective(
        Math.PI / 4, caller.width / caller.height, 1, 1000
      );
      const lightPos = vec4(10, 10, 10, 1);
      this.uniforms.lights = [
        defs.Phong_Shader.light_source(lightPos, color(1, 1, 1, 1), 1e6)
      ];

      // Draw baseplates.
      const platformSize = 10;
      const gapFactor = 0.95;
      for (let i = -2; i <= 2; i++) {
        for (let j = -2; j <= 2; j++) {
          const transform = Mat4.translation(2.68 * i * platformSize, 0, 2.68 * j * platformSize)
            .times(Mat4.scale(platformSize * gapFactor, platformSize, platformSize * gapFactor));
          this.shapes.greenBasePlate.draw(caller, this.uniforms, transform, this.materials.lego);
        }
      }

      // Draw sky.
      const sky_transform = Mat4.translation(0, 0, -70).times(Mat4.scale(120, 100, 1));
      this.shapes.box.draw(caller, this.uniforms, sky_transform, this.materials.sky);

      // Draw the mini figure.
      this.mini_fig.draw(caller, this.uniforms);

      // Draw environment objects.
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

      // Draw any animated buildable objects.
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
    this.movement_speed = 0.08;
    this.key_pressed = {};
    this.jumpInitiated = false;
    this.setup_key_listeners();
  }

  setup_key_listeners() {
    document.addEventListener("keydown", (event) => {
      this.key_pressed[event.key.toLowerCase()] = true;
    });

    document.addEventListener("keyup", (event) => {
      this.key_pressed[event.key.toLowerCase()] = false;
      if (event.key.toLowerCase() === "shift") {
        this.jumpInitiated = false;
      }
    });
  }

  render_animation(caller) {
    let move = Mat4.identity();

    // Check for jump using left shift.
    if (this.key_pressed["shift"] && !this.jumpInitiated) {
      let pos = this.main.mini_fig.getMiniFigPosition();
      if (Math.abs(pos[1] - (0 + 3.4)) < 0.01) { // Only jump if on the ground.
        this.main.mini_fig.physicsVelocity = vec3(
          this.main.mini_fig.physicsVelocity[0],
          0.1, // Jump impulse; adjust as needed.
          this.main.mini_fig.physicsVelocity[2]
        );
        this.jumpInitiated = true;
      }
    }

    // Handle horizontal movement.
    switch (true) {
      case this.key_pressed["w"]:
        move.post_multiply(Mat4.translation(0, 0, -this.movement_speed));
        this.main.mini_fig.move_mini_fig(move);
        this.main.mini_fig.direction = [0, -1];
        break;
      case this.key_pressed["s"]:
        move.post_multiply(Mat4.translation(0, 0, this.movement_speed));
        this.main.mini_fig.move_mini_fig(move);
        this.main.mini_fig.direction = [0, 1];
        break;
      case this.key_pressed["a"]:
        move.post_multiply(Mat4.translation(-this.movement_speed, 0, 0));
        this.main.mini_fig.move_mini_fig(move);
        this.main.mini_fig.direction = [-1, 0];
        break;
      case this.key_pressed["d"]:
        move.post_multiply(Mat4.translation(this.movement_speed, 0, 0));
        this.main.mini_fig.move_mini_fig(move);
        this.main.mini_fig.direction = [1, 0];
        break;
      case this.key_pressed["x"]:
        this.main.mini_fig.build();
        break;
      default:
        this.main.mini_fig.reset();
        break;
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
