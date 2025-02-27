import {tiny, defs} from './examples/common.js';
import { Shape_From_File } from './examples/obj-file-demo.js';
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

const shapes = {
    'head': new Shape_From_File("lego_models/minifigure/head/Untitled Model.obj"),
    'body': new Shape_From_File("lego_models/minifigure/body/Untitled Model.obj"),
    'left_arm': new Shape_From_File("lego_models/minifigure/left_arm/Untitled Model.obj"),
    'left_hand': new Shape_From_File("lego_models/minifigure/left_hand/Untitled Model.obj"),
    'left_leg': new Shape_From_File("lego_models/minifigure/left_leg/Untitled Model.obj"),
    'right_arm': new Shape_From_File("lego_models/minifigure/right_arm/Untitled Model.obj"),
    'right_hand': new Shape_From_File("lego_models/minifigure/right_hand/Untitled Model.obj"),
    'right_leg': new Shape_From_File("lego_models/minifigure/right_leg/Untitled Model.obj")
}

export const Mini_Figure =
class Mini_Figure {
    constructor() {

        let scale = Mat4.scale(1, 1, 1);
        let origin = Mat4.translation(0, 0, 0);

        const head_shape = shapes.head;
        const head_transform = Mat4.scale(1, 1, 1).times(Mat4.translation(0, 5, 0));
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

    draw(webgl_manager, uniforms, material) {
        this.head_node.shape.draw(webgl_manager, uniforms, this.head_node.transform_matrix, { ...material, color: color(0, 0, 1, 1)});
        this.body_node.shape.draw(webgl_manager, uniforms, this.body_node.transform_matrix, { ...material, color: color(0, 1, 0, 1)});
        this.left_arm_node.shape.draw(webgl_manager, uniforms, this.left_arm_node.transform_matrix, { ...material, color: color(0, 1, 1, 1)});
        this.left_hand_node.shape.draw(webgl_manager, uniforms, this.left_hand_node.transform_matrix, { ...material, color: color(1, 0, 0, 1)});
        this.left_leg_node.shape.draw(webgl_manager, uniforms, this.left_leg_node.transform_matrix, { ...material, color: color(1, 0, 1, 1)});
        this.right_arm_node.shape.draw(webgl_manager, uniforms, this.right_arm_node.transform_matrix, { ...material, color: color(1, 1, 0, 1)});
        this.right_hand_node.shape.draw(webgl_manager, uniforms, this.right_hand_node.transform_matrix, { ...material, color: color(1, 0.5, 0, 1)});
        this.right_leg_node.shape.draw(webgl_manager, uniforms, this.right_leg_node.transform_matrix, { ...material, color: color(0.5, 0, 1, 1)});
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
