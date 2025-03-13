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

    undoHelper(M){
        const origin = vec4(0,0,0,1);
        const position = M.times(origin); 

        const x = position[0];
        const y = position[1];
        const z = position[2];

        const undo = Mat4.translation(-x, -y, -z);
        M = undo.times(M);
        return M;
    }
    
    setStartPos(newPos){
        let M = this.start_transform_matrix;
        M = this.undoHelper(M);

        this.start_transform_matrix = M.pre_multiply(Mat4.translation(newPos[0], newPos[1], newPos[2]));
    }

    setCurrentPos(newPos){
        let M = this.start_transform_matrix;
        M = this.undoHelper(M);

        this.transform_matrix = M.pre_multiply(Mat4.translation(newPos[0], newPos[1], newPos[2]));
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

        this.animationDecayStartTime = -1;
        this.decayStartTimes = [];

        //state variables
        this.UNBUILT = 0; 
        this.BUILDING = 1;
        this.BUILT = 2;
        
        //starts not built
        this.buildState = this.UNBUILT;

        //starts in upward build mode
        this.upwardBuild = true;
        
        //total amount of time it takes to build the object
        this.totalBuildTime = 1.5;

        this.startPosBoundaries = startPosBoundary; // array or vec4 structured as [minX, maxX, minZ, maxZ]

        this.generatePath();
        this.global_t = 0;

    }

    handleBuildState(buildRequest, minifigPos){
        switch(this.buildState){
            case this.UNBUILT:
                if(this.checkWithinBounds(minifigPos)){
                    if(buildRequest){
                        this.buildState = this.BUILDING;
                        this.upwardBuild = true;
                        this.createStartTimes();
                        this.decayStartTime = new Array(this.startTimes.lenth).fill(-1);

                    }else{
                        //TODO: should do the hopping animation to signify that it can be built
                    }
                }
                break;
            case this.BUILDING:
                if(buildRequest){
                    this.upwardBuild = true;
                    this.decayStartTime.fill(-1); 
                }else{
                    this.upwardBuild = false;
                    if(this.decayStartTime === -1){ //need to mark when decay starts
                        this.decayStartTime = this.global_t;
                    }
                }
                if(this.global_t >= this.animationStartTime + this.totalBuildTime){
                    this.buildState = this.BUILT;
                }
                break;
            case this.BUILT:
                //Needs to stay built
                break;

        }
    }

    checkWithinBounds(position){
        //extract values from position input
        const x = position[0];
        const y = position[1];
        const z = position[2];

        //extract values from boundary
        const minX = this.startPosBoundaries[0];
        const maxX = this.startPosBoundaries[1];
        const minZ = this.startPosBoundaries[2];
        const maxZ = this.startPosBoundaries[3];

        if(minX <= x & x <= maxX & minZ <= z <= maxZ){
            return true;
        }else{
            return false;
        }
    }

    getStartPosBoundaries(){
        return this.startPosBoundaries;
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

    getPathTransform(index){
        const pieceStartTime = this.startTimes[index];
        const timeSinceStart = this.global_t - pieceStartTime;
        //const timeDiff = this.global_t - this.startTimes[index];
        
        let t_on_line;
        if(this.global_t < pieceStartTime){
            t_on_line = 0; //before this piece animation starts
        }else{
            if(this.upwardBuild){
                t_on_line = Math.min(timeSinceStart/this.pieceDuration , 1);
            }else{
                const timeSinceDecay = this.global_t - this.decayStartTime;
                t_on_line = Math.max(1 - (timeSinceDecay/this.pieceDuration) , 0);
            }
        }
        let node = this.shape.nodes[index];

        const pathPoint = this.splines[index].get_position(t_on_line);
        node.setCurrentPos(pathPoint);
        return node.transform_matrix;
    }

    createStartTimes(){
        this.animationStartTime = this.global_t;
        const numNodes = this.shape.nodes.length;

        //these two must add up to 1
        const totalSpacingRatio = 0.7;    // last piece starts at 30% of total time
        const pieceDurationRatio = 0.3;   // each piece takes 70% of total time to finish
        
        this.totalSpacing = totalSpacingRatio * this.totalBuildTime;
        this.pieceDuration = pieceDurationRatio * this.totalBuildTime;

        for(let i = 0; i<numNodes; i++){
            const fraction = (i / (numNodes - 1)); // from 0..1
            this.startTimes[i] = this.animationStartTime + fraction * this.totalSpacing;
        }
    }

    createDecayTimes(){
        this.animationDecayStartTime = this.global_t;
        const numNodes = this.shape.nodes.length;

        for(let i = 0; i<numNodes; i++){
            this.decayStartTimes[i] = 
        }
    }

    drawPieces(caller, uniforms){
        this.global_t = uniforms.animation_time / 1000;
               
        for(let i = 0; i<this.shape.nodes.length; i++){
            let node = this.shape.nodes[i];
            let nodeTransform;
            if(this.buildState == this.UNBUILT){
                nodeTransform = node.start_transform_matrix;
            }
            if(this.buildState == this.BUILDING){
                nodeTransform = this.getPathTransform(i);
            }
            if(this.buildState == this.BUILT){
                nodeTransform = node.end_transform_matrix;
            }
            node.shape.draw(caller, uniforms, nodeTransform, node.material);
            //this.curve.draw(caller, uniforms);
        }
    }

}