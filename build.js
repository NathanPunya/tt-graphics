import { HermiteSpline, Curve_Shape } from "./spline.js";
import { tiny, defs } from "./examples/common.js";
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

import { Node } from "./mini_figure.js";
import { getRandomInt, getRandomFloat} from "./utils.js";

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
    constructor(shape, startPosBoundary){
        this.shape = shape;

        this.splines = [];

        this.animationStartTime =-1;
        this.startTimes = [];

        this.startPosBoundaries = startPosBoundary; // array or vec4 structured as [minX, maxX, minZ, maxZ]

        this.generatePath();
    }

    generateStartPosition(allStartPositions, minDist, maxAttempts = 100) 
    {
        const minX = this.startPosBoundaries[0];
        const maxX = this.startPosBoundaries[1];
        const minZ = this.startPosBoundaries[2];
        const maxZ = this.startPosBoundaries[3];

        let lastCandidate;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          // randomly pick a candidate position
          const x = getRandomFloat(minX, maxX);
          const y = 1;
          const z = getRandomFloat(minZ, maxZ);
          const candidate = vec3(x, y, z);
          // check distance from every existing position
          let valid = true;
          for (const existingPos of allStartPositions) {
            const dx = candidate[0] - existingPos[0];
            //const dy = candidate[1] - existingPos[1];
            const dz = candidate[2] - existingPos[2];
            const dist = Math.sqrt(dx*dx + dz*dz);
      
            // if too close, reject and try again
            if (dist < minDist) {
              valid = false;
              break;
            }
          }
      
          // if it's not overlapping, accept
          if (valid) {
            return candidate;
          }
        }
      
        // if we couldn't find a non-overlapping position, return something or throw an error
        console.warn("Could not find a non-overlapping position after many attempts!");
        // fallback: just return the last candidate or null
        return vec3((minX + maxX)/2, 1, (minZ + maxZ)/2);
      }
      

    generatePath(){
        this.allStartPositions = [];
        for(let i = 0; i<this.shape.nodes.length; i++){
            let node = this.shape.nodes[i];

            this.splines[i] = new HermiteSpline();

            const M = node.end_transform_matrix;
            const origin = vec4(0,0,0,1);
            const position = M.times(origin); 

            const x = position[0];
            const y = position[1];
            const z = position[2];

            const endPos = vec3(x, y, z);
            const startPos = this.generateStartPosition(this.allStartPositions, 3, 100);
            node.setStartPos(startPos);

            //Add Starting and End point to the spline:
            let midpoint = vec3(0,0,0);
            for(let i = 0; i<startPos.length; i++){
                midpoint[i] = (startPos[i] + endPos[i])/2;
            }
            const variedIndex = getRandomInt(0, 2);
            midpoint[variedIndex]  = Math.min(startPos[variedIndex], endPos[variedIndex]) - 20; //make it curve sort of upwards/sideways in random direction
            
            const bendFactor = 2.5; //increasing will make the "bend" steeper or more drastic
            let startTan = midpoint.minus(startPos);
            let endTan = midpoint.minus(endPos);
            startTan = startTan.times(bendFactor);
            endTan = endTan.times(bendFactor);

            this.splines[i].add_point(startPos[0], startPos[1], startPos[2], startTan[0], startTan[1], startTan[2]);
            //this.splines[i].add_point(midpoint[0], midpoint[1], midpoint[2], midpoint[0] -1, midpoint[1] + 1, midpoint[2] -1);
            this.splines[i].add_point(endPos[0], endPos[1], endPos[2], endTan[0], endTan[1], endTan[2]);
            
            
            //const curves = (t) => this.splines[i].get_position(t);
            //this.curve = new Curve_Shape(curves, 1000, color(1,0,0,1));

        }       
    }

    getPathTransform(uniforms, index){
        const global_t = uniforms.animation_time / 1000;
        const timeDiff = global_t - this.startTimes[index];
        let t_on_line;
        if(global_t < this.startTimes[index]){
            t_on_line = 0;
        }else{
            t_on_line = Math.min(2 * timeDiff , 1); //scale timeDiff to change speed
        }
        let node = this.shape.nodes[index];

        const M = node.transform_matrix;
        const origin = vec4(0,0,0,1);
        const currentPos = M.times(origin); 

        const pathPoint = this.splines[index].get_position(t_on_line);
        const posChange = pathPoint.minus(currentPos);

        node.setCurrentPos(posChange);

        return node.transform_matrix;
    }

    drawPieces(caller, uniforms){
        if(this.animationStartTime==-1){
            this.animationStartTime = uniforms.animation_time / 1000;
            for(let i = 0; i<this.shape.nodes.length; i++){
                this.startTimes[i] = this.animationStartTime + 0.25 * i;
            }
        }
        for(let i = 0; i<this.shape.nodes.length; i++){
            let node = this.shape.nodes[i];
            node.shape.draw(caller, uniforms, this.getPathTransform(uniforms, i), node.material);
            //this.curve.draw(caller, uniforms);
        }
    }

}