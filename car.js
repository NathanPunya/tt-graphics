import { tiny, defs } from "./examples/common.js";
import { Shape_From_File } from "./examples/obj-file-demo.js";
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

import {Node, Arc} from './mini_figure.js';

export class Car{
    constructor(rootLocation = vec3(0, 18, 0), scale = vec3(1,1,1)){
        this.shapes = {
            base: new defs.Shape_From_File("lego_models/car_pieces/base/Untitled Model.obj"),
            flatPlate: new defs.Shape_From_File("lego_models/car_pieces/flatPlate/Untitled Model.obj"),
            stud: new defs.Shape_From_File("lego_models/car_pieces/stud/Untitled Model.obj"),
            tire: new defs.Shape_From_File("lego_models/car_pieces/tire/Untitled Model.obj"),
            topBack: new defs.Shape_From_File("lego_models/car_pieces/topBack/Untitled Model.obj"),
            wheel: new defs.Shape_From_File("lego_models/car_pieces/wheel/Untitled Model.obj"),
            wheel_connector: new defs.Shape_From_File("lego_models/car_pieces/wheel_connector/Untitled Model.obj"),
            windshield: new defs.Shape_From_File("lego_models/car_pieces/windshield/Untitled Model.obj")
        }
        const red =  color(1,0,0,1);
        const green =  color(0,1,0,1);
        const blue =  color(0,0,1,1);
        const black =  color(0,0,0,1);
        const grey = color(0.5, 0.5, 0.5, 1);
        const grey2 = color(0.1, 0.1, 0.1, 1);
        const white = color(1,1,1,1);

        const phong = new defs.Phong_Shader();
        const legoShader = new defs.Decal_Phong();

        this.materials = {
            wheelMat: {
                shader: phong,
                ambient: 1,
                diffusivity:1,
                specularity:1,
                color: grey2,
            },
            bodyMat: {
                shader: phong,
                ambient: 1,
                diffusivity:1,
                specularity:1,
                color: green,
            },
            tireMat:{
                shader: phong,
                ambient: 1,
                diffusivity: 1,
                specularity: 1,
                color: grey2
            }
        }

        this.nodes = [];

        const base_location = Mat4.translation(rootLocation[0], rootLocation[1], rootLocation[2]).times(Mat4.scale(scale[0], scale[1], scale[2])).times(Mat4.scale(3,3,3));
        this.base_node = new Node("base", this.shapes.base, base_location, this.materials.bodyMat);
        this.nodes.push(this.base_node);

        const base2_location = base_location.times(Mat4.translation(0, 0.45, 0));
        this.base2_node = new Node("base2", this.shapes.base,base2_location, this.materials.bodyMat);
        this.nodes.push(this.base2_node);

        const front_wheel_connector_location = base_location.times(Mat4.translation(-1.1,-0.40, 0))
                                                            .times(Mat4.scale(0.6,0.6,0.6))
                                                            .times(Mat4.rotation(Math.PI/2, 0, 1, 0));
        this.front_wheel_connector_node = new Node("front_wheel_connector", this.shapes.wheel_connector, front_wheel_connector_location, {...this.materials.bodyMat, color: white});
        this.nodes.push(this.front_wheel_connector_node);


        const back_wheel_connector_location = base_location.times(Mat4.translation(1.5, -0.40, 0))
                                                        .times(Mat4.scale(0.6,0.6,0.6)).times(Mat4.rotation(Math.PI/2, 0, 1, 0));
        this.back_wheel_connector_node = new Node("back_wheel_connector", this.shapes.wheel_connector, back_wheel_connector_location, {...this.materials.bodyMat, color: white});
        this.nodes.push(this.back_wheel_connector_node);


        const front_left_wheel_location = front_wheel_connector_location.times(Mat4.translation(-1.7, 0, 0)).times(Mat4.scale(0.5,0.5,0.5));
        this.front_left_wheel_node = new Node("front_left_wheel", this.shapes.wheel, front_left_wheel_location, this.materials.wheelMat);
        this.nodes.push(this.front_left_wheel_node);

        const front_right_wheel_location = front_wheel_connector_location.times(Mat4.translation(2,0,0)).times(Mat4.scale(0.5,0.5,0.5));
        this.front_right_wheel_node = new Node("front_right_wheel", this.shapes.wheel, front_right_wheel_location, this.materials.wheelMat);
        this.nodes.push(this.front_right_wheel_node);

        const back_left_wheel_location = back_wheel_connector_location.times(Mat4.translation(-1.7,0,0)).times(Mat4.scale(0.5,0.5,0.5));
        this.back_left_wheel_node = new Node("back_left_wheel", this.shapes.wheel, back_left_wheel_location, this.materials.wheelMat);
        this.nodes.push(this.back_left_wheel_node);

        const back_right_wheel_location = back_wheel_connector_location.times(Mat4.translation(2,0,0)).times(Mat4.scale(0.5,0.5,0.5));
        this.back_right_wheel_node = new Node("back_right_wheel", this.shapes.wheel, back_right_wheel_location, this.materials.wheelMat);
        this.nodes.push(this.back_right_wheel_node);

        const flatPlate_location = base2_location.times(Mat4.translation(-1.53, 0.14, 0)).times(Mat4.scale(0.47,0.47,0.47)).times(Mat4.rotation(Math.PI/2, 0, 1, 0));
        this.flatPlate_node = new Node("flatPlate", this.shapes.flatPlate, flatPlate_location, {...this.materials.bodyMat, color: blue});
        this.nodes.push(this.flatPlate_node);

        const windshield_location = base2_location.times(Mat4.translation(-0.66, 0.41, 0)).times(Mat4.scale(0.45, 0.45, 0.45)).times(Mat4.rotation(-Math.PI/2, 0, 1,0));
        this.windshield_node = new Node("windshield", this.shapes.windshield, windshield_location, {...this.materials.bodyMat, color: red});
        this.nodes.push(this.windshield_node);

        const topBack_location = base2_location.times(Mat4.translation(0.78, 0.45, 0)).times(Mat4.scale(0.67,0.67,0.67));
        this.topBack_node = new Node("topBack", this.shapes.topBack, topBack_location, {...this.materials.bodyMat, color: blue});
        this.nodes.push(this.topBack_node);

        const topBack2_location = topBack_location.times(Mat4.translation(0,0.65,0));
        this.topBack2_node = new Node("topBack2", this.shapes.topBack, topBack2_location, {...this.materials.bodyMat, color: green});
        this.nodes.push(this.topBack2_node);

        /*const front_left_tire_location = front_left_wheel_location.times(Mat4.scale(2.15,2.15,2.15));
        this.front_left_tire_node = new Node("front_left_tire", this.shapes.tire, front_left_tire_location, this.materials.tireMat);
        this.nodes.push(this.front_left_tire_node);

        const front_right_tire_location = front_right_wheel_location.times(Mat4.scale(2.15,2.15,2.15));
        this.front_right_tire_node = new Node("front_right_tire", this.shapes.tire, front_right_tire_location, this.materials.tireMat);
        this.nodes.push(this.front_right_tire_node);*/
        
    }   

    draw(caller, uniforms){
        for(let i = 0; i<this.nodes.length; i++){
            const node = this.nodes[i];
            node.shape.draw(caller, uniforms, node.transform_matrix, node.material);
        }
   
    }
}