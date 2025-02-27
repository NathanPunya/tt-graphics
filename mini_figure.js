import {tiny, defs} from './examples/common.js';
import { Shape_From_File } from './examples/obj-file-demo.js';
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

const shapes = {
    'hair': new Shape_From_File("lego_models/minifigure/hair/Untitled Model.obj"),
    'head': new Shape_From_File("lego_models/minifigure/head/Untitled Model.obj"),
    'body': new Shape_From_File("lego_models/minifigure/body/Untitled Model.obj"),
    'left_arm': new Shape_From_File("lego_models/minifigure/left_arm/Untitled Model.obj"),
    'left_hand': new Shape_From_File("lego_models/minifigure/left_hand/Untitled Model.obj"),
    'left_leg': new Shape_From_File("lego_models/minifigure/left_leg/Untitled Model.obj"),
    'right_arm': new Shape_From_File("lego_models/minifigure/right_arm/Untitled Model.obj"),
    'right_hand': new Shape_From_File("lego_models/minifigure/right_hand/Untitled Model.obj"),
    'right_leg': new Shape_From_File("lego_models/minifigure/right_leg/Untitled Model.obj")
}

const phong = new defs.Phong_Shader();
const texturedPhong = new defs.Textured_Phong();
const bumpmap = new defs.Fake_Bump_Map(1);
const legoShader = new defs.Decal_Phong();

const pantsColor = color(0.11953842797895521, 0.171441100722554, 0.26225065751888765, 1);
const jacketColor = color(0.005181516700061659, 0.005181516700061659, 0.005181516700061659, 1);
const skinColor = color(0.9386857284565036, 0.5711248294565854, 0.009134058699157796,1);
const hairColor = color(0.18, 0.1, 0,1);

const materials = {
    hairMat:{
        shader: legoShader,
        ambient: 1,
        diffusivity:1,
        specularity:1,
        color: hairColor,
    },
    headMat: { shader: legoShader, 
        ambient: 1, 
        diffusivity: 1, 
        specularity: 1, 
        texture: new Texture("lego_models/minifigure/head/textures/2/official/color/3626d1304.png"),
        color: skinColor
    },
    bodyMat: {shader: legoShader,
        ambient: 1,
        diffusivity: 1,
        specularity: 1,
        texture: new Texture("lego_models/minifigure/body/textures/2/official/color/3814d1062.png"),
        color: jacketColor
    },
    left_armMat:{
        shader: legoShader,
        ambient: 1,
        diffusivity:1,
        specularity:1,
        color: jacketColor
    },
    left_handMat:{
        shader: legoShader,
        ambient: 1,
        diffusivity:1,
        specularity:1,
        color: skinColor
    },
    left_legMat:{
        shader: legoShader,
        ambient: 1,
        diffusivity: 1,
        specularity: 1,
        texture: new Texture("lego_models/minifigure/left_leg/textures/2/official/color/3817d395.png"),
        color: pantsColor
    },
    right_armMat:{
        shader: legoShader,
        ambient: 1,
        diffusivity:1,
        specularity:1,
        color: jacketColor
    },
    right_handMat:{
        shader: legoShader,
        ambient: 1,
        diffusivity:1,
        specularity:1,
        color: skinColor
    },
    right_legMat:{
        shader: legoShader,
        ambient: 1,
        diffusivity: 1,
        specularity: 1,
        texture: new Texture("lego_models/minifigure/right_leg/textures/2/official/color/3816d395.png"),
        color: pantsColor
    }, 
}

export const Mini_Figure =
class Mini_Figure {
    constructor() {

        let scale = Mat4.scale(1, 1, 1);
        let origin = Mat4.translation(0, 0, 0);

        const hair_shape = shapes.hair;
        const hair_transform = Mat4.scale(1.15,1.15,1.15).times(Mat4.translation(0,4.6,0));
        this.hair_node = new Node("hair", hair_shape, hair_transform);

        const head_shape = shapes.head;
        const head_transform = Mat4.scale(0.98,0.98,0.98).times(Mat4.translation(0, 5.1, 0));
        this.head_node = new Node("head", head_shape, head_transform);
        
        const body_shape = shapes.body;
        const body_transform = Mat4.scale(1, 1, 1).times(Mat4.translation(0, 2.5, 0));
        this.body_node = new Node("body", body_shape, body_transform);

        const left_arm_shape = shapes.left_arm;
        const left_arm_transform = Mat4.scale(0.5, 0.5, 0.5).times(Mat4.translation(1.8, 6, 0));
        this.left_arm_node = new Node("left_arm", left_arm_shape, left_arm_transform);

        const left_hand_shape = shapes.left_hand;
        const left_hand_transform = Mat4.scale(0.4, 0.4, 0.4).times(Mat4.translation(3.3, 5, 1));
        this.left_hand_node = new Node("left_hand", left_hand_shape, left_hand_transform);

        const left_leg_shape = shapes.left_leg;
        const left_leg_transform = Mat4.scale(0.6, 0.6, 0.6).times(Mat4.translation(0.75, 1.9, 0));
        this.left_leg_node = new Node("left_leg", left_leg_shape, left_leg_transform);

        const right_arm_shape = shapes.right_arm;
        const right_arm_transform = Mat4.scale(0.5, 0.5, 0.5).times(Mat4.translation(-1.8, 6, 0));
        this.right_arm_node = new Node("right_arm", right_arm_shape, right_arm_transform);

        const right_hand_shape = shapes.right_hand;
        const right_hand_transform = Mat4.scale(0.4, 0.4, 0.4).times(Mat4.translation(-3.3, 5, 1));
        this.right_hand_node = new Node("right_hand", right_hand_shape, right_hand_transform);

        const right_leg_shape = shapes.right_leg;
        const right_leg_transform = Mat4.scale(0.6, 0.6, 0.6).times(Mat4.translation(-0.75, 1.9, 0));
        this.right_leg_node = new Node("right_leg", right_leg_shape, right_leg_transform);
    }

    draw(webgl_manager, uniforms) {
        this.hair_node.shape.draw(webgl_manager, uniforms, this.hair_node.transform_matrix, materials.hairMat);
        this.head_node.shape.draw(webgl_manager, uniforms, this.head_node.transform_matrix, materials.headMat);
        this.body_node.shape.draw(webgl_manager, uniforms, this.body_node.transform_matrix, materials.bodyMat);
        this.left_arm_node.shape.draw(webgl_manager, uniforms, this.left_arm_node.transform_matrix, materials.left_armMat);
        this.left_hand_node.shape.draw(webgl_manager, uniforms, this.left_hand_node.transform_matrix, materials.left_handMat);
        this.left_leg_node.shape.draw(webgl_manager, uniforms, this.left_leg_node.transform_matrix, materials.left_legMat);
        this.right_arm_node.shape.draw(webgl_manager, uniforms, this.right_arm_node.transform_matrix, materials.right_armMat);
        this.right_hand_node.shape.draw(webgl_manager, uniforms, this.right_hand_node.transform_matrix, materials.right_handMat);
        this.right_leg_node.shape.draw(webgl_manager, uniforms, this.right_leg_node.transform_matrix, materials.right_legMat);
    }
}

class Node {
    constructor(name, shape, transform) {
        this.name = name;
        this.shape = shape;
        this.transform_matrix = transform;
        this.children_arcs = [];
    }
}
