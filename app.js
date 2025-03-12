import { tiny, defs } from "./examples/common.js";
import { Shape_From_File } from "./examples/obj-file-demo.js";
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

import { Mini_Figure } from './mini_figure.js';
import { House, Tree,  Lamppost, Bench} from "./background.js";

export const external = defs.external =
  class external extends Component {

    constructor(){
      super();
      this.t_sim = 0; 
    }

    init() {
      this.shapes = {
        box: new defs.Cube(),
        ball: new defs.Subdivision_Sphere(4),
        greenBasePlate: new Shape_From_File('lego_models/greenBasePlate/greenBasePlate.obj')
      };

      const phong = new defs.Phong_Shader();
      this.materials = {
        plastic: { shader: phong, ambient: 0.2, diffusivity: 1, specularity: 0.5, color: color(0.9, 0.5, 0.9, 1) },
        metal: { shader: phong, ambient: 0.2, diffusivity: 1, specularity: 1, color: color(0.1, 0.9, 0.1, 1) },
        lego: { shader: phong, ambient: 1, diffusivity: 1, specularity: 1, color: color(0.007, 0.205, 0.019, 1) }
      };

      this.mini_fig = new Mini_Figure();
      this.houseOne = new House(vec3(-4, 3.7, -10), vec3(7, 7, 7));
      this.treeOne = new Tree(vec3(5, .5, -5), vec3(2, 2, 2));
      this.lamppostOne = new Lamppost(vec3(5, 2, 5), vec3(1, 1, 1));
      this.benchOne = new Bench(vec3(-4, 1, 4), vec3(1, 1, 1));

      this.uniforms = {
        model_transform: Mat4.identity(),
        projection_transform: Mat4.perspective(Math.PI / 4, 1, 1, 100),
        lights: []
      };
    }

    render_animation(caller) {
      if (!caller.controls) {
        this.animated_children.push(
          caller.controls = new Movement_Controls(this) // Uses custom movement controls
        );

        Shader.assign_camera(
          Mat4.look_at(vec3(5, 8, 25), vec3(0, 5, 0), vec3(0, 1, 0)),
          this.uniforms
        );
      }

      // Lighting
      this.uniforms.projection_transform = Mat4.perspective(Math.PI / 4, caller.width / caller.height, 1, 100);
      const lightPos = vec4(10, 10, 10, 1);
      this.uniforms.lights = [
        defs.Phong_Shader.light_source(lightPos, color(1, 1, 1, 1), 1e6)
      ];
    }
  };

export class Movement_Controls extends Component {
  constructor(main_instance) {
    super();
    this.main = main_instance;
    this.movement_speed = 0.5; // Adjust movement speed
    this.key_pressed = {};

    this.setup_key_listeners();
  }

  setup_key_listeners() {
    document.addEventListener("keydown", (event) => {
      this.key_pressed[event.key.toLowerCase()] = true;
    });

    document.addEventListener("keyup", (event) => {
      this.key_pressed[event.key.toLowerCase()] = false;
    });
  }

  render_animation(caller) {

    let move = Mat4.identity();
    
    switch(true) {
      case this.key_pressed["w"]:
        move.post_multiply(Mat4.translation(0, 0, -this.movement_speed)); // move forward (-z direction)
        this.main.mini_fig.move_mini_fig(move);
        this.main.mini_fig.direction = [0, -1];
        break;
      case this.key_pressed["s"]:
        move.post_multiply(Mat4.translation(0, 0, this.movement_speed)); // move backward (+z direction)
        this.main.mini_fig.move_mini_fig(move);
        this.main.mini_fig.direction = [0, 1];
        break;
      case this.key_pressed["a"]:
        move.post_multiply(Mat4.translation(-this.movement_speed, 0, 0)); // move left (-x direction)
        this.main.mini_fig.move_mini_fig(move);
        this.main.mini_fig.direction = [-1, 0];
        break;
      case this.key_pressed["d"]:
        move.post_multiply(Mat4.translation(this.movement_speed, 0, 0)); // move right (+x direction)
        this.main.mini_fig.move_mini_fig(move);
        this.main.mini_fig.direction = [1, 0];
        break;
      case this.key_pressed["x"]: // build
        this.main.mini_fig.build();
        break;
      default:
        this.main.mini_fig.reset();
        break;
    }
  
    // Draw Mini Figure with updated root transformation
    this.main.mini_fig.draw(caller, this.main.uniforms);
  }
}

export class main extends external {
  constructor() {
    super();
  }

  render_animation(caller) {
    super.render_animation(caller);

    // Draw Mini Figure with updated transformation
    this.mini_fig.draw(caller, this.uniforms);

    // Draw environment
    const greenBasePlate_transform = Mat4.scale(10, 10, 10);
    this.shapes.greenBasePlate.draw(caller, this.uniforms, greenBasePlate_transform, this.materials.lego);
    this.houseOne.draw(caller, this.uniforms);
    this.treeOne.draw(caller, this.uniforms);
    this.lamppostOne.draw(caller, this.uniforms);
    this.benchOne.draw(caller, this.uniforms);
  }
} 