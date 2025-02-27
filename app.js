import { tiny, defs } from "./examples/common.js";
import { Shape_From_File } from "./examples/obj-file-demo.js";
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

import { Mini_Figure } from './mini_figure.js';

export const external = defs.external =
  class external extends Component {
    init() {
      this.shapes = {
        box: new defs.Cube(),
        ball: new defs.Subdivision_Sphere(4),
        greenBasePlate: new Shape_From_File('lego_models/greenBasePlate/greenBasePlate.obj')
      };

      const phong = new defs.Phong_Shader();
      const tex_phong = new defs.Textured_Phong();
      this.materials = {
        plastic: { shader: phong, ambient: 0.2, diffusivity: 1, specularity: 0.5, color: color(0.9, 0.5, 0.9, 1) },
        metal: { shader: phong, ambient: 0.2, diffusivity: 1, specularity: 1, color: color(0.1, 0.9, 0.1, 1) },
        lego: { shader: phong, ambient: 1, diffusivity: 1, specularity: 1, color: color( 0.007499032040460618, 0.20507873637973145, 0.019382360952473074,1)}
      };
      // Todo: Cool stuff starts here :D

      this.mini_fig = new Mini_Figure();
      
    }

    render_animation(caller) {
      if (!caller.controls) {
        this.animated_children.push(
          caller.controls = new defs.Movement_Controls({ uniforms: this.uniforms })
        );
        caller.controls.add_mouse_controls(caller.canvas);
        Shader.assign_camera(
          Mat4.look_at(vec3(5, 8, 15), vec3(0, 5, 0), vec3(0, 1, 0)),
          this.uniforms
        );
      }
      //Todo: More cool stuff here :DDD

      //Lighting
      this.uniforms.projection_transform = Mat4.perspective(Math.PI / 4, caller.width / caller.height, 1, 100);
      const lightPos = vec4(10, 10, 10, 1);
      this.uniforms.lights = [
        defs.Phong_Shader.light_source(lightPos, color(1, 1, 1, 1), 1e6)
      ];

    }
  };

export class main extends external {
  render_animation(caller) {
    super.render_animation(caller);

    //Todo: AND here

    //Floor
    const groundColor = color(1, 0.7, 0, 1);
    /*const floorXf = Mat4.translation(0, 0, 0).times(Mat4.scale(10, 0.01, 10));
    this.shapes.box.draw(
      caller, this.uniforms, floorXf,
      { ...this.materials.plastic, color: groundColor }
    );*/

    const greenBasePlate_transform = Mat4.scale(10,10,10);
    this.shapes.greenBasePlate.draw(caller, this.uniforms,greenBasePlate_transform, this.materials.lego);

    this.mini_fig.draw(caller, this.uniforms, this.materials.lego);
  }

  render_controls() {
    this.control_panel.innerHTML += "IK Scene: Figure-8 Path<br>";
    this.new_line();
    this.key_triggered_button("Debug", ["Shift", "D"], () => {
      console.log("Angles:", this.ikChar.angles);
    });
    this.new_line();
  }
}