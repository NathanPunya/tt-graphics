import { HermiteSpline, Curve_Shape } from "./spline.js";
import { tiny, defs } from "./examples/common.js";
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

import { Node } from "./mini_figure.js";

export class NodeAnimated extends Node{
    constructor(name, shape, transform, material, start_transform_matrix){
        super(name, shape, transform, material);
        this.end_transform_matrix = transform;
        this.start_transform_matrix = start_transform_matrix;
    }
}


export class BuildableLego{
    constructor(){
        this.nodes = [];
    }
    getPieceNodes(){
        return this.nodes;
    }

    draw(caller, uniforms){
        for(let i = 0; i<this.nodes.length; i++){
            const node = this.nodes[i];
            node.shape.draw(caller, uniforms, node.transform_matrix, node.material);
        }
    }
}

class AnimateBuild{
    constructor(shape){
        this.shape = shape;
    }

}