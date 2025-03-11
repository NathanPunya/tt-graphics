import { HermiteSpline, Curve_Shape } from "./spline.js";
import { tiny, defs } from "./examples/common.js";
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

import { Node } from "./mini_figure.js";
import { getRandomInt } from "./utils.js";

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

    setCurrentPos(currentPos){
        const current_matrix = this.transform_matrix.pre_multiply(Mat4.translation(currentPos[0], currentPos[1], currentPos[2]));
        this.transform_matrix = current_matrix;
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

        const endPos = vec3(x, y, z);
        
        //Make start point the origin
        let originPos = vec3(x- x, y-y, z - z); //needs to be reset back to the origin so can properly find the position it needs to be in
        console.log(originPos);
        const startPos = vec3(originPos[0], originPos[1] + 1, originPos[2]);
        this.firstPoint.setStartPos(startPos);

        // //confirm the transformation:
        // //Yes it is working, can comment this out
        // const position_after = this.firstPoint.start_transform_matrix.times(origin)
        // console.log(position_after);

        //Add Starting and End point to the spline:
        let midpoint = vec3(0,0,0);
        for(let i = 0; i<startPos.length; i++){
            midpoint[i] = (startPos[i] + endPos[i])/2;
        }
        const variedIndex = getRandomInt(0, 2);
        midpoint[variedIndex] += 2;
        
        
        console.log(startPos);
        this.spline.add_point(startPos[0], startPos[1], startPos[2], startPos[0]+1, startPos[1] + 1, startPos[2] -1);
        this.spline.add_point(midpoint[0], midpoint[1], midpoint[2], midpoint[0] -1, midpoint[1] + 1, midpoint[2] -1);
        this.spline.add_point(endPos[0], endPos[1], endPos[2], endPos[0] + 1, endPos[1] + 1, endPos[2] - 1);
        
        
        const curves = (t) => this.spline.get_position(t);
        this.curve = new Curve_Shape(curves, 1000, color(1,0,0,1));

    }

    getPathTransform(uniforms){
        const t = uniforms.animation_time / 1000;
        let t_on_line = Math.min(t/4, 1);

        const M = this.firstPoint.transform_matrix;
        const origin = vec4(0,0,0,1);
        const currentPos = M.times(origin); 

        const pathPoint = this.spline.get_position(t_on_line);
        const posChange = pathPoint.minus(currentPos);

        this.firstPoint.setCurrentPos(posChange);

        return this.firstPoint.transform_matrix;
    }

    drawPieces(caller, uniforms){
        this.firstPoint.shape.draw(caller, uniforms, this.getPathTransform(uniforms), this.firstPoint.material);
        this.curve.draw(caller, uniforms);
    }

}