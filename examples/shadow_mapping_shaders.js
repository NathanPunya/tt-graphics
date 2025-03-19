import { tiny } from '../tiny-graphics.js';
// Pull these names into this module's scope for convenience:
const { Vector, Vector3, vec, vec3, vec4, color, Matrix, Mat4, Shape, Shader, Component } = tiny;

const defs = {};
export { tiny, defs };

// ----------------------------
// Basic Phong and Utility Shaders
// ----------------------------

const Basic_Shader = defs.Basic_Shader =
    class Basic_Shader extends Shader {
        update_GPU(context, gpu_addresses, uniforms, model_transform, material) {
            const [P, C, M] = [uniforms.projection_transform, uniforms.camera_inverse, model_transform],
                PCM = P.times(C).times(M);
            context.uniformMatrix4fv(gpu_addresses.projection_camera_model_transform, false,
                Matrix.flatten_2D_to_1D(PCM.transposed()));
        }
        shared_glsl_code() {
            return `precision mediump float;
                  varying vec4 VERTEX_COLOR;
          `;
        }
        vertex_glsl_code() {
            return this.shared_glsl_code() + `
            attribute vec4 color;
            attribute vec3 position;
            uniform mat4 projection_camera_model_transform;
  
            void main() { 
              gl_Position = projection_camera_model_transform * vec4(position, 1.0);
              VERTEX_COLOR = color;
            }`;
        }
        fragment_glsl_code() {
            return this.shared_glsl_code() + `
            void main() {                                                   
              gl_FragColor = VERTEX_COLOR;
            }`;
        }
    };

const Phong_Shader = defs.Phong_Shader =
    class Phong_Shader extends Shader {
        constructor(num_lights = 2) {
            super();
            this.num_lights = num_lights;
        }
        shared_glsl_code() {
            return ` 
        precision mediump float;
        const int N_LIGHTS = ` + this.num_lights + `;
        uniform float ambient, diffusivity, specularity, smoothness;
        uniform vec4 light_positions_or_vectors[N_LIGHTS], light_colors[N_LIGHTS];
        uniform float light_attenuation_factors[N_LIGHTS];
        uniform vec4 shape_color;
        uniform vec3 squared_scale, camera_center;
  
        varying vec3 N, vertex_worldspace;
        vec3 phong_model_lights(vec3 N, vec3 vertex_worldspace) {
            vec3 E = normalize(camera_center - vertex_worldspace);
            vec3 result = vec3(0.0);
            for(int i = 0; i < N_LIGHTS; i++) {
                vec3 surface_to_light_vector = light_positions_or_vectors[i].xyz -
                                               light_positions_or_vectors[i].w * vertex_worldspace;
                float distance_to_light = length(surface_to_light_vector);
                vec3 L = normalize(surface_to_light_vector);
                vec3 H = normalize(L + E);
                float diffuse  = max(dot(N, L), 0.0);
                float specular = pow(max(dot(N, H), 0.0), smoothness);
                float attenuation = 1.0 / (1.0 + light_attenuation_factors[i] * distance_to_light * distance_to_light);
                vec3 light_contribution = shape_color.xyz * light_colors[i].xyz * diffusivity * diffuse +
                                          light_colors[i].xyz * specularity * specular;
                result += attenuation * light_contribution;
              }
            return result;
          } `;
        }
        vertex_glsl_code() {
            return this.shared_glsl_code() + `
        attribute vec3 position, normal;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
  
        void main() {                                                                
            gl_Position = projection_camera_model_transform * vec4(position, 1.0);
            N = normalize(mat3(model_transform) * normal / squared_scale);
            vertex_worldspace = (model_transform * vec4(position, 1.0)).xyz;
          } `;
        }
        fragment_glsl_code() {
            return this.shared_glsl_code() + `
        void main() {
            gl_FragColor = vec4(shape_color.xyz * ambient, shape_color.w);
            gl_FragColor.xyz += phong_model_lights(normalize(N), vertex_worldspace);
          } `;
        }
        static light_source(position, color, size) {
            return { position, color, attenuation: 1 / size };
        }
        send_material(gl, gpu, material) {
            gl.uniform4fv(gpu.shape_color, material.color);
            gl.uniform1f(gpu.ambient, material.ambient);
            gl.uniform1f(gpu.diffusivity, material.diffusivity);
            gl.uniform1f(gpu.specularity, material.specularity);
            gl.uniform1f(gpu.smoothness, material.smoothness);
        }
        send_uniforms(gl, gpu, uniforms, model_transform) {
            const O = vec4(0, 0, 0, 1), camera_center = uniforms.camera_transform.times(O).to3();
            gl.uniform3fv(gpu.camera_center, camera_center);

            // Use squared scale trick:
            const squared_scale = model_transform.reduce(
                (acc, r) => acc.plus(vec4(...r).times_pairwise(r)),
                vec4(0, 0, 0, 0)).to3();
            gl.uniform3fv(gpu.squared_scale, squared_scale);

            // Precompute the combined transformation:
            const PCM = uniforms.projection_transform.times(uniforms.camera_inverse).times(model_transform);
            gl.uniformMatrix4fv(gpu.model_transform, false,
                Matrix.flatten_2D_to_1D(model_transform.transposed()));
            gl.uniformMatrix4fv(gpu.projection_camera_model_transform, false,
                Matrix.flatten_2D_to_1D(PCM.transposed()));

            if (!uniforms.lights || !uniforms.lights.length) return;

            const light_positions_flattened = [], light_colors_flattened = [];
            for (var i = 0; i < 4 * uniforms.lights.length; i++) {
                light_positions_flattened.push(uniforms.lights[Math.floor(i / 4)].position[i % 4]);
                light_colors_flattened.push(uniforms.lights[Math.floor(i / 4)].color[i % 4]);
            }
            gl.uniform4fv(gpu.light_positions_or_vectors, light_positions_flattened);
            gl.uniform4fv(gpu.light_colors, light_colors_flattened);
            gl.uniform1fv(gpu.light_attenuation_factors, uniforms.lights.map(l => l.attenuation));
        }
        update_GPU(context, gpu_addresses, uniforms, model_transform, material) {
            const defaults = { color: color(0, 0, 0, 1), ambient: 0, diffusivity: 1, specularity: 1, smoothness: 40 };
            let full_material = Object.assign(defaults, material);
            this.send_material(context, gpu_addresses, full_material);
            this.send_uniforms(context, gpu_addresses, uniforms, model_transform);
        }
    };

// ----------------------------
// Shadow Mapping Shaders
// ----------------------------

const Shadowed_Phong_Shader = defs.Shadowed_Phong_Shader =
    class Shadowed_Phong_Shader extends Phong_Shader {
        shared_glsl_code() {
            return super.shared_glsl_code() + `
        uniform sampler2D shadow_map;
        uniform mat4 light_matrix;
        varying vec4 shadow_coord;
          `;
        }
        vertex_glsl_code() {
            return this.shared_glsl_code() + `
        attribute vec3 position, normal;
        uniform mat4 model_transform;
        uniform mat4 projection_camera_model_transform;
  
        void main() {
          gl_Position = projection_camera_model_transform * vec4(position, 1.0);
          N = normalize(mat3(model_transform) * normal / squared_scale);
          vertex_worldspace = (model_transform * vec4(position, 1.0)).xyz;
          // Compute shadow coordinate from the light’s point of view.
          shadow_coord = light_matrix * vec4(vertex_worldspace, 1.0);
        }`;
        }
        fragment_glsl_code() {
            return this.shared_glsl_code() + `
        void main() {
          vec3 ambient_color = shape_color.xyz * ambient;
          vec3 phong_color = phong_model_lights(normalize(N), vertex_worldspace);
          // Transform shadow coordinate from clip space to [0,1]:
          vec3 sc = shadow_coord.xyz / shadow_coord.w;
          sc.xy = sc.xy * 0.5 + 0.5;
          float bias = 0.005;
          // Sample the shadow map:
          float shadow_depth = texture2D(shadow_map, sc.xy).r;
          float shadow_factor = (sc.z - bias > shadow_depth) ? 0.0 : 1.0;
          vec3 final_color = ambient_color + shadow_factor * phong_color;
          gl_FragColor = vec4(final_color, shape_color.w);
        }`;
        }
        update_GPU(context, gpu_addresses, uniforms, model_transform, material) {
            super.update_GPU(context, gpu_addresses, uniforms, model_transform, material);
            if (material.shadow_map && material.shadow_map.ready) {
                context.uniform1i(gpu_addresses.shadow_map, 1);
                material.shadow_map.activate(context, 1);
            }
            context.uniformMatrix4fv(gpu_addresses.light_matrix, false,
                Matrix.flatten_2D_to_1D(uniforms.light_matrix.transposed()));
        }
    };

// A simple Depth_Shader used when rendering the scene from the light's view.
// It writes depth information into a texture.
const Depth_Shader = defs.Depth_Shader =
    class Depth_Shader extends Shader {
        shared_glsl_code() { return `precision mediump float;`; }
        vertex_glsl_code() {
            return this.shared_glsl_code() + `
        attribute vec3 position;
        uniform mat4 light_projection_model_transform;
  
        void main() {
          gl_Position = light_projection_model_transform * vec4(position, 1.0);
        }`;
        }
        fragment_glsl_code() {
            return this.shared_glsl_code() + `
        void main() {
          gl_FragColor = vec4(vec3(gl_FragCoord.z), 1.0);
        }`;
        }
        update_GPU(context, gpu_addresses, uniforms, model_transform, material) {
            const LPMT = uniforms.light_projection_transform.times(model_transform);
            context.uniformMatrix4fv(gpu_addresses.light_projection_model_transform, false,
                Matrix.flatten_2D_to_1D(LPMT.transposed()));
        }
    };

// ----------------------------
// Helper: Create Shadow Map Framebuffer
// ----------------------------

function create_shadow_map_framebuffer(gl, width, height) {
    // Create a texture to store depth info.
    const shadow_texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, shadow_texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, width, height, 0,
        gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Create and set up the framebuffer.
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, shadow_texture, 0);
    // We aren’t drawing any colors here.
    gl.drawBuffers([gl.NONE]);
    gl.readBuffer(gl.NONE);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { framebuffer: fb, texture: shadow_texture, width, height };
}
export { create_shadow_map_framebuffer };
