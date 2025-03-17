import { tiny, defs } from "./examples/common.js";
const { vec3, Mat4, Shader } = tiny;

export class MoveCamera {
  constructor(main_instance) {
    this.main = main_instance;
    // Initial camera position (fixed y and z, x can be adjusted based on the mini figure)
    this.current_eye = vec3(0, 10, 30);
    // Smoothing factor for horizontal movement (set to 1 for instant movement)
    this.smoothing = 0.1;
    // Fixed y and z positions for the camera
    this.fixed_y = 13;
    this.fixed_z = 30;
  }

  render_animation(caller) {
    // Get the mini figure's current position
    let mini_fig_position = this.main.mini_fig.getMiniFigPosition() || vec3(0, 0, 0);
    
    // Desired camera eye: match the mini figure's x coordinate, but use fixed y and z.
    let desired_eye = vec3(mini_fig_position[0], this.fixed_y, this.fixed_z);
    
    // Smoothly interpolate the current x position towards the desired x.
    this.current_eye = vec3(
      this.current_eye[0] * (1 - this.smoothing) + desired_eye[0] * this.smoothing,
      this.fixed_y,
      this.fixed_z
    );
    
    // Always have the camera look at the mini figure's position.
    let camera_at = mini_fig_position;
    let camera_up = vec3(0, 1, 0);
    
    // Set the camera view matrix.
    Shader.assign_camera(
      Mat4.look_at(this.current_eye, camera_at, camera_up),
      this.main.uniforms
    );
  }
}
