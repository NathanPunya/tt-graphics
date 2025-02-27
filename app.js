import { tiny, defs } from "./examples/common.js";
const { vec3, vec4, color, Mat4, Shape, Shader, Component } = tiny;

export const external = defs.external =
  class external extends Component {
    init() {
      this.shapes = {
        box: new defs.Cube(),
        ball: new defs.Subdivision_Sphere(4),
      };

      const phong = new defs.Phong_Shader();
      const tex_phong = new defs.Textured_Phong();
      this.materials = {
        plastic: { shader: phong, ambient: 0.2, diffusivity: 1, specularity: 0.5, color: color(0.9, 0.5, 0.9, 1) },
        metal: { shader: phong, ambient: 0.2, diffusivity: 1, specularity: 1, color: color(0.1, 0.9, 0.1, 1) },
      };

      // Todo: Cool stuff starts here :D
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
      this.uniforms.projection_transform = Mat4.perspective(Math.PI / 4, caller.width / caller.height, 1, 100);

      const t = this.uniforms.animation_time / 1000;
      const timeFrac = (t / 5) % 1;
      const figure8Target = this.eightPath.getPos(timeFrac);
      this.ikChar.performIK(figure8Target);

      const lightPos = vec4(20, 20, 20, 1);
      this.uniforms.lights = [
        defs.Phong_Shader.light_source(lightPos, color(1, 1, 1, 1), 1e6)
      ];
    }
  };

export class main extends external {
  render_animation(caller) {
    super.render_animation(caller);

    const groundColor = color(1, 0.7, 0, 1);
    const wallColor = color(0.7, 1.0, 0.8, 1);
    const boardColor = color(0.2, 0.2, 0.2, 1);

    const floorXf = Mat4.translation(0, 0, 0).times(Mat4.scale(10, 0.01, 10));
    this.shapes.box.draw(
      caller, this.uniforms, floorXf,
      { ...this.materials.plastic, color: groundColor }
    );

    const wallXf = Mat4.translation(0, 5, -1.2).times(Mat4.scale(6, 5, 0.1));
    this.shapes.box.draw(
      caller, this.uniforms, wallXf,
      { ...this.materials.plastic, color: wallColor }
    );

    const boardXf = Mat4.translation(3, 6, -1).times(Mat4.scale(2.5, 2.5, 0.1));
    this.shapes.box.draw(
      caller, this.uniforms, boardXf,
      { ...this.materials.plastic, color: boardColor }
    );

    this.eightDrawer.draw(caller, this.uniforms);
    this.ikChar.renderSkeleton(caller, this.uniforms, this.materials.metal);
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