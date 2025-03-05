import { tiny, defs } from "./examples/common.js";
import { Shape_From_File } from "./examples/obj-file-demo.js";
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

import {Node, Arc} from './mini_figure.js';

export class Car{
    constructor(){
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
        const white = color(1,1,1,1);

        const phong = new defs.Phong_Shader();
        const legoShader = new defs.Decal_Phong();

        this.materials = {
            wheelMat: {
                shader: phong,
                ambient: 1,
                diffusivity:1,
                specularity:1,
                color: black,
            },
            bodyMat: {
                shader: phong,
                ambient: 1,
                diffusivity:1,
                specularity:1,
                color: green,
            }
        }

        const base_location = Mat4.scale(3,3,3).times(Mat4.translation(0,6,0));
        this.base_node = new Node("base", this.shapes.base, base_location, this.materials.bodyMat);

        const front_wheel_connector_location = base_location.times(Mat4.translation(-1.25,-0.40, 0))
                                                            .times(Mat4.scale(0.5,0.5,0.5))
                                                            .times(Mat4.rotation(Math.PI/2, 0, 1, 0));
        this.front_wheel_connector_node = new Node("front_wheel_connector", this.shapes.wheel_connector, front_wheel_connector_location, {...this.materials.bodyMat, color: white});

        const back_wheel_connector_location = base_location.times(Mat4.translation(1.5, -0.40, 0))
                                                        .times(Mat4.scale(0.5,0.5,0.5)).times(Mat4.rotation(Math.PI/2, 0, 1, 0));
        this.back_wheel_connector_node = new Node("back_wheel_connector", this.shapes.wheel_connector, back_wheel_connector_location, {...this.materials.bodyMat, color: white});
    }

    draw(caller, uniforms){
        this.base_node.shape.draw(caller, uniforms, this.base_node.transform_matrix, this.base_node.material);

        this.front_wheel_connector_node.shape.draw(caller, uniforms, this.front_wheel_connector_node.transform_matrix, this.front_wheel_connector_node.material);

        this.back_wheel_connector_node.shape.draw(caller, uniforms, this.back_wheel_connector_node.transform_matrix, this.back_wheel_connector_node.material);
    }
}