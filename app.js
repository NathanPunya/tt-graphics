import { tiny, defs } from "./examples/common.js";
import { Shape_From_File } from "./examples/obj-file-demo.js";
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

import { Mini_Figure } from './mini_figure.js';
import { House } from "./background.js";

export const external = defs.external =
  class external extends Component {
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
      this.houseOne = new House(vec3(-4, 3.7, -10), vec3(5, 5, 5));

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

  handle_movement() {
    let move = Mat4.identity();

    if (this.key_pressed["i"]) {
      move.post_multiply(Mat4.translation(0, 0, -this.movement_speed)); // Move forward
    }
    if (this.key_pressed["k"]) {
      move.post_multiply(Mat4.translation(0, 0, this.movement_speed)); // Move backward
    }
    if (this.key_pressed["j"]) {
      move.post_multiply(Mat4.translation(-this.movement_speed, 0, 0)); // Move left
    }
    if (this.key_pressed["l"]) {
      move.post_multiply(Mat4.translation(this.movement_speed, 0, 0)); // Move right
    }

    // Apply movement to the Mini Figure's root transformation
    this.main.mini_fig.rootMat.post_multiply(move);
  }

  render_animation(caller) {
    this.handle_movement();

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
  }
} 

class HermiteSpline {

  constructor() {
    this.points = [];
    this.tangents = [];
    this.size = 0;
    this.arc_length = 0;
    this.arc_length_table =[];
  }

  h00(t) { return (2*t**3 - 3*t**2 + 1); }
  h10(t) { return (t**3 - 2*t**2 + t); }
  h01(t) { return (-2*t**3 + 3*t**2); }
  h11(t) { return (t**3 - t**2); }

  get_position(t) {
    if(this.size < 2)
      return vec3(0, 0, 0);

    let index1 = Math.floor(t * (this.size - 1));
    let index2 = Math.ceil(t * (this.size - 1));
    let s = (t * (this.size - 1)) % 1.0;


    let p0 = this.points[index1];
    let v0 = this.tangents[index1];
    let p1 = this.points[index2];
    let v1 = this.tangents[index2];

    let scaleFactor = 1 / (this.size - 1);

    let scaled_v0 = v0.times(scaleFactor);
    let scaled_v1 = v1.times(scaleFactor);

    return p0.times(this.h00(s)).plus(scaled_v0.times(this.h10(s))).plus(p1.times(this.h01(s))).plus(scaled_v1.times(this.h11(s)));
  }

  get_tangent(index) { return this.tangents[index]; }

  get_size() { return this.size; }

  // add point
  add_point(x, y, z, sx, sy, sz) {
    if(this.points.length < 20) {
        this.points.push(vec3(x, y, z));
        this.tangents.push(vec3(sx, sy, sz));
        this.size++;
    }
  } 

  // modify tangent
  set_tangent(index, x, y, z) { this.tangents[index] = vec3(x, y, z); }

  // modify position of point
  set_point(index, x, y, z) { this.points[index] = vec3(x, y, z); }

  // helper method for arc length
  get_entry(s) {
    if(s <= 0) 
      return 0;

    if(s >= this.arc_length) 
      return 1;

    for(let i = 0; i < this.arc_lengths.length - 1; i++) {

      let s_1 = this.arc_lengths[i].length;
      let s_2 = this.arc_lengths[i + 1].length;

      if(s_1 <= s && s <= s_2) {
        let t_1 = this.arc_lengths[i].t;
        let t_2 = this.arc_lengths[i + 1].t;

        let u = t_1 + ((s - s_1) * (t_2 - t_1)) / (s_2 - s_1);
        return u;
      }
    }
    return;
  }

  // return arc length
  get_arc_length() {
    let n = 1000, length = 0, p = 0;

    this.arc_lengths = [{ t: 0, length: 0 }];

    let previous_point = this.get_position(0);

    for(let i = 1; i <= n; i++) {
      let t = i / n;
      let current_point = this.get_position(t);

      length += current_point.minus(previous_point).norm();
      this.arc_lengths.push({ t: t, length: length });

      previous_point = current_point;
      p += this.get_entry(length / 2);
    }
    this.arc_length = length;
    return this.arc_length;
   }
};

class Curve_Shape extends Shape {
  // curve_function: (t) => vec3
  constructor(curve_function, sample_count, curve_color=color( 1, 0, 0, 1 )) {
    super("position", "normal");

    this.material = { shader: new defs.Phong_Shader(), ambient: 1.0, color: curve_color }
    this.sample_count = sample_count;

    if (curve_function && this.sample_count) {
      for (let i = 0; i < this.sample_count + 1; i++) {
        let t = i / this.sample_count;
        this.arrays.position.push(curve_function(t));
        this.arrays.normal.push(vec3(0, 0, 0)); // have to add normal to make Phong shader work.
      }
    }
  }

  draw(webgl_manager, uniforms) {
    // call super with "LINE_STRIP" mode
    super.draw(webgl_manager, uniforms, Mat4.identity(), this.material, "LINE_STRIP");
  }

  update(webgl_manager, uniforms, curve_function) {
    if (curve_function && this.sample_count) {
      for (let i = 0; i < this.sample_count + 1; i++) {
        let t = 1.0 * i / this.sample_count;
        this.arrays.position[i] = curve_function(t);
      }
    }
    // this.arrays.position.forEach((v, i) => v = curve_function(i / this.sample_count));
    this.copy_onto_graphics_card(webgl_manager.context);
    // Note: vertex count is not changed.
    // not tested if possible to change the vertex count.
  }
};