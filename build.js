import { HermiteSpline, Curve_Shape } from "./spline.js";
import { tiny, defs } from "./examples/common.js";
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

import { Node } from "./mini_figure.js";

export class NodeAnimated extends Node{
    constructor(name, shape, transform, material, start_transform_matrix){
        super(name, shape, transform, material);
        this.end_transform_matrix = transform;
        this.start_transform_matrix = transform;
    }

    setStartPos(startPos){
        const start_matrix = this.start_transform_matrix.pre_multiply(Mat4.translation(startPos[0], startPos[1], startPos[2]));
        this.start_transform_matrix = start_matrix;
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

export class AnimateBuild{
    constructor(shape){
        this.shape = shape;

        this.spline = new HermiteSpline();

        this.generatePath();
    }

    generatePath(){
        this.firstPoint = this.shape.nodes[0];

        const M = this.firstPoint.transform_matrix;
        const origin = vec4(0,0,0,1);
        const position = M.times(origin); 
        console.log(position);

        const x = position[0];
        const y = position[1];
        const z = position[2];

        let startPos = vec3(- x, -y, - z); //needs to be reset back to the origin so can properly find the position it needs to be in
        //startPos.plus(vec3(0,this.firstPoint.shape.heightY, 0));
        //console.log(this.firstPoint.shape.heightY);
        console.log(startPos);
        this.firstPoint.setStartPos(startPos);

        const position_after = this.firstPoint.start_transform_matrix.times(origin)
        console.log(position_after);

    }

    drawPieces(caller, uniforms){
        this.firstPoint.shape.draw(caller, uniforms, this.firstPoint.start_transform_matrix, this.firstPoint.material);
    }

}