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
    'right_leg': new Shape_From_File("lego_models/minifigure/right_leg/Untitled Model.obj"),

    ball: new defs.Subdivision_Sphere(4) // this will be used to see the joints in action
}

const phong = new defs.Phong_Shader();
const texturedPhong = new defs.Textured_Phong();
const bumpmap = new defs.Fake_Bump_Map(1);
const legoShader = new defs.Decal_Phong();

const pantsColor = color(0.11953842797895521, 0.171441100722554, 0.26225065751888765, 1);
const jacketColor = color(0.005181516700061659, 0.005181516700061659, 0.005181516700061659, 1);
const skinColor = color(0.9386857284565036, 0.5711248294565854, 0.009134058699157796,1);
const hairColor = color(0.17, 0.1, 0,1);

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
    plastic: { shader: phong, ambient: 0.2, diffusivity: 1, specularity: 0.5, color: color(0.9, 0.5, 0.9, 1) }, // to help see the joints
}

export const Mini_Figure =
class Mini_Figure {
    constructor(
        origin = vec3(0,0,0), //origin point of the character. this is based at the bottom of the minifigure's feet
        scale = vec3(1,1,1) //scale of the minifigure (should not really need this because minifigures should be the same size)
    ) {
        /*
            Lego MiniFig has 
            root, X,Y,Z translation, X, Y, Z rotation
            neck: y rotation
            right shoulder, left shoulder: X rotation
            right wrist, left wrist
            right hip, left hip: X rotation


            root -> neck
            root -> shoulders -> wrists
            root -> hips
        */

        let scaleMat = Mat4.scale(scale[0], scale[1], scale[2]);
        let originMat = Mat4.translation(origin[0], origin[1] + 3, origin[2]);


        //Torso
        // associated joint is the root
        const body_shape = shapes.body;
        const body_transform = Mat4.scale(1, 1, 1).times(Mat4.translation(0, 2.5, 0));
        this.body_node = new Node("body", body_shape, body_transform);

        const root_location = originMat;
        this.root = new Arc("root", null, this.body_node, root_location);
        this.root.set_dof(true, true, true, true, true, true);
        
        //Hair
        const hair_shape = shapes.hair;
        const hair_transform = Mat4.scale(0.85,0.85,0.85).times(Mat4.translation(0,5.7,0));
        this.hair_node = new Node("hair", hair_shape, hair_transform);
        
        //Head
        // associated joint is the neck
        const head_shape = shapes.head;
        const head_transform = Mat4.scale(0.7,0.7,0.7).times(Mat4.translation(0, 6.65, 0));
        this.head_node = new Node("head", head_shape, head_transform);
        
        const neck_location = originMat.times(Mat4.translation(0,1,0));
        this.neck = new Arc("neck", this.body_node, this.head_node, neck_location);
        this.body_node.children_arcs.push(this.neck);
        this.neck.set_dof(false, true, false, false, false, false); // only rotation in Y

        //Left Arm
        //associated joint is the left shoulder
        const left_arm_shape = shapes.left_arm;
        const left_arm_transform = Mat4.scale(0.5, 0.5, 0.5).times(Mat4.translation(1.8, 6, 0));
        this.left_arm_node = new Node("left_arm", left_arm_shape, left_arm_transform);

        const left_shoulder_location = originMat.times(Mat4.translation(0.6, 0.3, 0)); 
        this.left_shoulder = new Arc("left_shoulder", this.body_node, this.left_arm_node, left_shoulder_location);
        this.body_node.children_arcs.push(this.left_shoulder);
        this.left_shoulder.set_dof(true, false, false, false, false, false); //X rotation

        //Left Hand
        //associated joint is the left wrist
        const left_hand_shape = shapes.left_hand;
        const left_hand_transform = Mat4.scale(0.4, 0.4, 0.4).times(Mat4.translation(3.3, 5, 1));
        this.left_hand_node = new Node("left_hand", left_hand_shape, left_hand_transform);

        const left_wrist_location = originMat.times(Mat4.translation(1.2, -0.7, 0));
        this.left_wrist = new Arc("left_wrist", this.left_arm_node, this.left_hand_node, left_wrist_location);
        this.left_arm_node.children_arcs.push(this.left_wrist);
        this.left_wrist.set_dof(false, false, true, false, false, false); //might need to change?

        //Left Leg
        //associated joint is the left hip
        const left_leg_shape = shapes.left_leg;
        const left_leg_transform = Mat4.scale(0.6, 0.6, 0.6).times(Mat4.translation(0.75, 1.9, 0));
        this.left_leg_node = new Node("left_leg", left_leg_shape, left_leg_transform);

        const left_hip_location = originMat.times(Mat4.translation(0.6,-1.2,0)); 
        this.left_hip = new Arc("left_hip", this.body_node, this.left_leg_node, left_hip_location);
        this.body_node.children_arcs.push(this.left_hip);
        this.left_hip.set_dof(true, false, false, false, false, false); //X rotation

        //Right Arm
        //associated join is the right shoulder
        const right_arm_shape = shapes.right_arm;
        const right_arm_transform = Mat4.scale(0.5, 0.5, 0.5).times(Mat4.translation(-1.8, 6, 0));
        this.right_arm_node = new Node("right_arm", right_arm_shape, right_arm_transform);

        const right_shoulder_location = originMat.times(Mat4.translation(-0.6, 0.3, 0));
        this.right_shoulder = new Arc("right_shoulder", this.body_node, this.right_arm_node, right_shoulder_location);
        this.body_node.children_arcs.push(this.right_shoulder);
        this.right_shoulder.set_dof(true, false, false, false, false, false); //X rotation

        //Right Hand
        //associated joint is the right wrist
        const right_hand_shape = shapes.right_hand;
        const right_hand_transform = Mat4.scale(0.4, 0.4, 0.4).times(Mat4.translation(-3.3, 5, 1));
        this.right_hand_node = new Node("right_hand", right_hand_shape, right_hand_transform);

        const right_wrist_location = originMat.times(Mat4.translation(-1.2, -0.7, 0)); 
        this.right_wrist = new Arc("right_wrist", this.right_arm_node, this.right_hand_node, right_wrist_location);
        this.right_arm_node.children_arcs.push(this.right_wrist);
        this.right_wrist.set_dof(false, false, true, false, false, false); //might need to change?

        //Right Leg
        //associated joint is the right hip
        const right_leg_shape = shapes.right_leg;
        const right_leg_transform = Mat4.scale(0.6, 0.6, 0.6).times(Mat4.translation(-0.75, 1.9, 0));
        this.right_leg_node = new Node("right_leg", right_leg_shape, right_leg_transform);

        const right_hip_location = originMat.times(Mat4.translation(-0.6,-1.2,0));
        this.right_hip = new Arc("right_hip", this.body_node, this.right_leg_node, right_hip_location);
        this.body_node.children_arcs.push(this.right_hip);
        this.right_hip.set_dof(true, false, false, false, false, false); //X rotation
    }

    draw(webgl_manager, uniforms) {
        //draw body parts:
        
        this.hair_node.shape.draw(webgl_manager, uniforms, this.hair_node.transform_matrix, materials.hairMat);
        this.head_node.shape.draw(webgl_manager, uniforms, this.head_node.transform_matrix, materials.headMat);
        this.body_node.shape.draw(webgl_manager, uniforms, this.body_node.transform_matrix, materials.bodyMat);
        this.left_arm_node.shape.draw(webgl_manager, uniforms, this.left_arm_node.transform_matrix, materials.left_armMat);
        this.left_hand_node.shape.draw(webgl_manager, uniforms, this.left_hand_node.transform_matrix, materials.left_handMat);
        this.left_leg_node.shape.draw(webgl_manager, uniforms, this.left_leg_node.transform_matrix, materials.left_legMat);
        this.right_arm_node.shape.draw(webgl_manager, uniforms, this.right_arm_node.transform_matrix, materials.right_armMat);
        this.right_hand_node.shape.draw(webgl_manager, uniforms, this.right_hand_node.transform_matrix, materials.right_handMat);
        this.right_leg_node.shape.draw(webgl_manager, uniforms, this.right_leg_node.transform_matrix, materials.right_legMat);
        
        //draw joints to help visualize:
        /*
        shapes.ball.draw(webgl_manager, uniforms, this.root.location_matrix.times(Mat4.scale(0.3,0.3,0.3)), materials.plastic);
        shapes.ball.draw(webgl_manager, uniforms, this.neck.location_matrix.times(Mat4.scale(0.3,0.3,0.3)), materials.plastic);
        shapes.ball.draw(webgl_manager, uniforms, this.left_shoulder.location_matrix.times(Mat4.scale(0.3,0.3,0.3)), materials.plastic);
        shapes.ball.draw(webgl_manager, uniforms, this.left_wrist.location_matrix.times(Mat4.scale(0.3,0.3,0.3)), materials.plastic);
        shapes.ball.draw(webgl_manager, uniforms, this.left_hip.location_matrix.times(Mat4.scale(0.3,0.3,0.3)), materials.plastic);
        shapes.ball.draw(webgl_manager, uniforms, this.right_shoulder.location_matrix.times(Mat4.scale(0.3,0.3,0.3)), materials.plastic);
        shapes.ball.draw(webgl_manager, uniforms, this.right_wrist.location_matrix.times(Mat4.scale(0.3,0.3,0.3)), materials.plastic);
        shapes.ball.draw(webgl_manager, uniforms, this.right_hip.location_matrix.times(Mat4.scale(0.3,0.3,0.3)), materials.plastic);
        */
    }
}


class Node {
    constructor(name, shape, transform) {
        this.name = name;
        this.shape = shape;
        this.transform_matrix = transform;
        this.parent_arc = null;
        this.children_arcs = [];
    }
}

class Arc {
    constructor(name, parent, child, location) {
        this.name = name;
        this.parent_node = parent;
        this.child_node = child;
        this.location_matrix = location;
        this.articulation_matrix = Mat4.identity();
        this.end_effector = null;
        this.dof = {
            //Rotations:
            Rx: false,
            Ry: false,
            Rz: false,
            //Translations:
            Tx: false,
            Ty: false,
            Tz: false
        }
    }

    // Here I only implement rotational DOF
    set_dof(rx, ry, rz, tx, ty, tz) {
        //Rotational:
        this.dof.Rx = rx;
        this.dof.Ry = ry;
        this.dof.Rz = rz;

        //Translational:
        this.dof.Tx = tx;
        this.dof.Ty = ty;
        this.dof.Tz = tz;
    }

    update_articulation(theta) {
        this.articulation_matrix = Mat4.identity();
        let index = 0;
        if (this.dof.Rx) {
            this.articulation_matrix.pre_multiply(Mat4.rotation(theta[index], 1, 0, 0));
            index += 1;
        }
        if (this.dof.Ry) {
            this.articulation_matrix.pre_multiply(Mat4.rotation(theta[index], 0, 1, 0));
            index += 1;
        }
        if (this.dof.Rz) {
            this.articulation_matrix.pre_multiply(Mat4.rotation(theta[index], 0, 0, 1));
        }
    }

}

class End_Effector {
    constructor(name, parent, local_position) {
        this.name = name;
        this.parent = parent;
        this.local_position = local_position;
        this.global_position = null;
    }
}
