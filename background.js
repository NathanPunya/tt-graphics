import { tiny, defs } from "./examples/common.js";
import { Shape_From_File } from "./examples/obj-file-demo.js";
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export const House = 
class House{
    constructor(rootPosition = vec3(0,0,0), scale = vec3(1,1,1)){
        this.shapes = {
            roof: new defs.Shape_From_File("lego_models/background_house/roof/background_house.obj"),
            walls: new defs.Shape_From_File("lego_models/background_house/walls/background_house.obj")
        }
        const legoShader = new defs.Decal_Phong();
        this.materials = {
            roofMat:{
                shader: legoShader,
                ambient: 1,
                diffusitivity: 1,
                specularity: 1,
                color: color(1,0,0,1)
            },
            wallsMat:{
                shader: legoShader,
                ambient: 1,
                diffusitivity: 1,
                specularity: 1,
                color: color(0.4, 0.2, 0,1),

            }
        }

        this.transforms = {
            houseTransform: Mat4.identity()
                            .times(Mat4.translation(rootPosition[0], rootPosition[1], rootPosition[2]))
                            .times(Mat4.scale(scale[0], scale[1], scale[2])),
            roofTransform: Mat4.translation(0,0.5,0),
            wallsTransform: Mat4.identity(),
        }

        
    }

    draw(webgl_manager, uniforms){
        this.shapes.roof.draw(webgl_manager, uniforms, this.transforms.houseTransform.times(this.transforms.roofTransform), this.materials.roofMat);
        this.shapes.walls.draw(webgl_manager,uniforms,this.transforms.houseTransform.times(this.transforms.wallsTransform), this.materials.wallsMat);
    }
}

export const Tree = 
class Tree{
    constructor(rootPosition = vec3(1,1,1), scale = vec3(1,1,1)){
        this.shapes = {
            leaves: new defs.Shape_From_File("lego_models/Tree/Leaves/Tree.obj"),
            trunk: new defs.Shape_From_File("lego_models/Tree/Trunk/Tree.obj")
        }
        const legoShader = new defs.Decal_Phong();
        this.materials = {
            leavesMat:{
                shader: legoShader,
                ambient: 1,
                diffusitivity: 1,
                specularity: 1,
                color: color(0.007, 0.205, 0.019, 1)
            },
            trunkMat:{
                shader: legoShader,
                ambient: 1,
                diffusitivity: 1,
                specularity: 1,
                color: color(0.4, 0.2, 0,1),

            }
        }

        this.transforms = {
            treeTransform: Mat4.identity()
            .times(Mat4.scale(scale[0], scale[1], scale[2]))
            .times(Mat4.translation(rootPosition[0], rootPosition[1], rootPosition[2])),
            leavesTransform: Mat4.translation(0,2.7,0),
            trunkTransform: Mat4.identity(),
        }

        
    }

    draw(webgl_manager, uniforms){
        this.shapes.leaves.draw(webgl_manager, uniforms, this.transforms.treeTransform.times(this.transforms.leavesTransform), this.materials.leavesMat);
        this.shapes.trunk.draw(webgl_manager,uniforms,this.transforms.treeTransform.times(this.transforms.trunkTransform), this.materials.trunkMat);
    }
}

export const Lamppost = 
class Lamppost{
    constructor(rootPosition = vec3(1,1,1), scale = vec3(0,0,0)){
        this.shapes = {
            lamp: new defs.Shape_From_File("lego_models/lampost/lamp/lampost.obj"),
            post: new defs.Shape_From_File("lego_models/lampost/post/lampost.obj")
        }
        const legoShader = new defs.Decal_Phong();
        this.materials = {
            lampMat:{
                shader: legoShader,
                ambient: 1,
                diffusitivity: 1,
                specularity: 1,
                color: color(1, 0.75, 0, 1)
            },
            postMat:{
                shader: legoShader,
                ambient: 1,
                diffusitivity: 1,
                specularity: 1,
                color: color(0.5, 0.5, 0.5, 1),

            }
        }

        this.transforms = {
            lamppostTransform: Mat4.identity()
            .times(Mat4.scale(scale[0], scale[1], scale[2]))
            .times(Mat4.translation(rootPosition[0], rootPosition[1], rootPosition[2])),
            lampTransform: Mat4.scale(0.25, 0.25, 0.25) // scale down the lamp
            .times(Mat4.translation(0,9,0)),
            postTransform: Mat4.identity(),
        }

        
    }

    draw(webgl_manager, uniforms){
        this.shapes.lamp.draw(webgl_manager, uniforms, this.transforms.lamppostTransform.times(this.transforms.lampTransform), this.materials.lampMat);
        this.shapes.post.draw(webgl_manager,uniforms,this.transforms.lamppostTransform.times(this.transforms.postTransform), this.materials.postMat);
    }
}

export const Bench = 
class Bench{
    constructor(rootPosition = vec3(1,1,1), scale = vec3(0,0,0)){
        this.shapes = {
            top: new defs.Shape_From_File("lego_models/bench/top/park_set.obj"),
            bottom: new defs.Shape_From_File("lego_models/bench/bottom/park_set.obj")
        }
        const legoShader = new defs.Decal_Phong();
        this.materials = {
            topMat:{
                shader: legoShader,
                ambient: 1,
                diffusitivity: 1,
                specularity: 1,
                color: color(1, 0.75, 0, 1)
            },
            bottomMat:{
                shader: legoShader,
                ambient: 1,
                diffusitivity: 1,
                specularity: 1,
                color: color(0.5, 0.5, 0.5, 1),

            }
        }

        this.transforms = {
            benchTransform: Mat4.identity()
            .times(Mat4.scale(scale[0], scale[1], scale[2]))
            .times(Mat4.translation(rootPosition[0], rootPosition[1], rootPosition[2])),
            topTransform: Mat4.scale(1, 1, 1) // scale down the lamp
            .times(Mat4.translation(1,.5,0)),
            bottomTransform: Mat4.identity(),
        }

        
    }

    draw(webgl_manager, uniforms){
        this.shapes.top.draw(webgl_manager, uniforms, this.transforms.benchTransform.times(this.transforms.topTransform), this.materials.topMat);
        this.shapes.bottom.draw(webgl_manager,uniforms,this.transforms.benchTransform.times(this.transforms.bottomTransform), this.materials.bottomMat);
    }
}