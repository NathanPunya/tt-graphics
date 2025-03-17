import { BuildableLego, NodeAnimated } from "./build.js";
import { tiny, defs } from "./examples/common.js";
import { Shape_From_File } from "./examples/obj-file-demo.js";
const { vec3, vec4, color, Mat4, Shape, Material, Shader, Texture, Component } = tiny;

export const House =
    class House {
        constructor(rootPosition = vec3(0, 0, 0), scale = vec3(1, 1, 1)) {
            this.shapes = {
                roof: new defs.Shape_From_File("lego_models/background_house/roof/roof.obj"),
                walls: new defs.Shape_From_File("lego_models/background_house/walls/background_house.obj")
            }
            const legoShader = new defs.Decal_Phong();
            this.materials = {
                roofMat: {
                    shader: legoShader,
                    ambient: 1,
                    diffusitivity: 1,
                    specularity: 1,
                    color: color(1, 0.3, 0, 1)
                },
                wallsMat: {
                    shader: legoShader,
                    ambient: 1,
                    diffusitivity: 1,
                    specularity: 1,
                    color: color(0.4, 0.2, 0, 1),

                }
            }

            this.transforms = {
                houseTransform: Mat4.identity()
                    .times(Mat4.translation(rootPosition[0], rootPosition[1], rootPosition[2]))
                    .times(Mat4.scale(scale[0], scale[1], scale[2])),
                roofTransform: Mat4.translation(0, 0.5, 0),
                wallsTransform: Mat4.identity(),
            }


        }

        draw(webgl_manager, uniforms) {
            this.shapes.roof.draw(webgl_manager, uniforms, this.transforms.houseTransform.times(this.transforms.roofTransform), this.materials.roofMat);
            this.shapes.walls.draw(webgl_manager, uniforms, this.transforms.houseTransform.times(this.transforms.wallsTransform), this.materials.wallsMat);
        }
    }

export const Tree =
    class Tree extends BuildableLego{
        constructor(rootLocation = vec3(1, 1, 1), scale = vec3(1, 1, 1), treeAmount) {
            super();
            this.shapes = {
                leaves: new defs.Shape_From_File("lego_models/Tree/Leaves/Tree.obj"),
                trunk: new defs.Shape_From_File("lego_models/Tree/Trunk/Tree.obj")
            }
            const legoShader = new defs.Decal_Phong();
            this.materials = {
                leavesMat: {
                    shader: legoShader,
                    ambient: 1,
                    diffusitivity: 1,
                    specularity: 1,
                    color: color(0.007, 0.205, 0.019, 1)
                },
                trunkMat: {
                    shader: legoShader,
                    ambient: 1,
                    diffusitivity: 1,
                    specularity: 1,
                    color: color(0.4, 0.2, 0, 1),

                }
            }

            // Wait for all shapes to load before creating nodes:
            Promise.all(Object.values(this.shapes).map(shape => shape.loadPromise))
            .then(() => {
                // All shapes are ready. Now initialize the car's nodes.
                this.initializeNodes(rootLocation, scale, treeAmount);
                this._setReady(); // Notify that nodes are now ready.
            })
            .catch(error => console.error("Error loading shapes: ", error));


        }
        initializeNodes(rootLocation, scale, trunkAmount){
            const baseLocation = Mat4.translation(rootLocation[0], rootLocation[1], rootLocation[2]).times(Mat4.scale(scale[0], scale[1], scale[2]));
        
            for(let i = 0; i<trunkAmount; i++){
                const trunkName = `trunk${i}`;

                const trunkLocation = baseLocation.times(Mat4.translation(0, i, 0));
                this[trunkName + "_node"] = new NodeAnimated(trunkName, this.shapes.trunk, trunkLocation, this.materials.trunkMat);
                this.nodes.push(this[trunkName+"_node"]);
            }

            const leaveLocation = this[`trunk${trunkAmount-1}`+"_node"].end_transform_matrix.times(Mat4.translation(0, 2, 0))
                                    .times(Mat4.scale(3, 3, 3));
            this.leave_node = new NodeAnimated("leaves", this.shapes.leaves, leaveLocation, this.materials.leavesMat);
            this.nodes.push(this.leave_node);

        }
    }

export const Lamppost =
    class Lamppost extends BuildableLego{
        constructor(rootLocation = vec3(1, 1, 1), scale = vec3(0, 0, 0)) {
            super();
            this.shapes = {
                lamp: new defs.Shape_From_File("lego_models/lampost/lamp/lampost.obj"),
                post: new defs.Shape_From_File("lego_models/lampost/post/lampost.obj")
            }
            const legoShader = new defs.Decal_Phong();
            this.materials = {
                lampMat: {
                    shader: legoShader,
                    ambient: 1,
                    diffusitivity: 1,
                    specularity: 1,
                    color: color(1, 0.75, 0, 1)
                },
                postMat: {
                    shader: legoShader,
                    ambient: 1,
                    diffusitivity: 1,
                    specularity: 1,
                    color: color(0.5, 0.5, 0.5, 1),

                }
            }

            // Wait for all shapes to load before creating nodes:
            Promise.all(Object.values(this.shapes).map(shape => shape.loadPromise))
            .then(() => {
                // All shapes are ready. Now initialize the car's nodes.
                this.initializeNodes(rootLocation, scale);
                this._setReady(); // Notify that nodes are now ready.
            })
            .catch(error => console.error("Error loading shapes: ", error));
            

        }

        initializeNodes(rootLocation, scale){
            const postLocation = Mat4.translation(rootLocation[0], rootLocation[1], rootLocation[2]).times(Mat4.scale(scale[0], scale[1], scale[2]));
            this.post_node = new NodeAnimated("post", this.shapes.post, postLocation, this.materials.postMat);
            this.nodes.push(this.post_node);

            const lampLocation = postLocation.times(Mat4.translation(0, 2, 0)).times(Mat4.scale(0.2,0.2,0.2));
            this.lamp_node = new NodeAnimated("lamp", this.shapes.lamp, lampLocation, this.materials.lampMat);
            this.nodes.push(this.lamp_node);

        }

    }

export const Bench =
    class Bench {
        constructor(rootPosition = vec3(1, 1, 1), scale = vec3(0, 0, 0)) {
            this.shapes = {
                top: new defs.Shape_From_File("lego_models/bench/top/park_set.obj"),
                bottom: new defs.Shape_From_File("lego_models/bench/bottom/park_set.obj")
            }
            const legoShader = new defs.Decal_Phong();
            this.materials = {
                topMat: {
                    shader: legoShader,
                    ambient: 1,
                    diffusitivity: 1,
                    specularity: 1,
                    color: color(1, 0.75, 0, 1)
                },
                bottomMat: {
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
                    .times(Mat4.translation(1, .5, 0)),
                bottomTransform: Mat4.identity(),
            }


        }

        draw(webgl_manager, uniforms) {
            this.shapes.top.draw(webgl_manager, uniforms, this.transforms.benchTransform.times(this.transforms.topTransform), this.materials.topMat);
            this.shapes.bottom.draw(webgl_manager, uniforms, this.transforms.benchTransform.times(this.transforms.bottomTransform), this.materials.bottomMat);
        }
    }


export const Sidewalk = 
    class Sidewalk extends BuildableLego{
        constructor(rootLocation = vec3(0,0,0), scale = vec3(1,1,1)){
            super();
            this.shapes = {
                sidewalk1: new defs.Shape_From_File("lego_models/sidewalk/sidewalk1.obj")
            }
            const legoShader = new defs.Decal_Phong();
            this.materials = {
                sidewalkMat: {
                    shader: legoShader,
                    ambient: 1,
                    diffusitivity: 1,
                    specularity: 1,
                    color: color(0.3, 0.3, 0.3, 1)
                }
            }

            // Wait for all shapes to load before creating nodes:
            Promise.all(Object.values(this.shapes).map(shape => shape.loadPromise))
            .then(() => {
                // All shapes are ready. Now initialize the car's nodes.
                this.initializeNodes(rootLocation, scale);
                this._setReady(); // Notify that nodes are now ready.
            })
            .catch(error => console.error("Error loading shapes: ", error));

        }

        initializeNodes(rootLocation, scale){
            const base_location = Mat4.translation(rootLocation[0], rootLocation[1], rootLocation[2]).times(Mat4.scale(scale[0], scale[1], scale[2]));
            this.pieceOne_node = new NodeAnimated("first", this.shapes.sidewalk1, base_location, this.materials.sidewalkMat);
            this.nodes.push(this.pieceOne_node);

            const second_location = base_location.times(Mat4.translation(0, 0,0.8)).times(Mat4.scale(0.5, 1, 1)).times(Mat4.translation(-2.1, 0,0));
            this.pieceTwo_node = new NodeAnimated("second", this.shapes.sidewalk1, second_location, this.materials.sidewalkMat);
            this.nodes.push(this.pieceTwo_node);

            const third_location = second_location.times(Mat4.translation(4.2, 0, 0));
            this.pieceThree_node = new NodeAnimated("third", this.shapes.sidewalk1, third_location, this.materials.sidewalkMat);
            this.nodes.push(this.pieceThree_node);

            const fourth_location = base_location.times(Mat4.translation(-0.8, 0, -0.8));
            this.pieceFour_node = new NodeAnimated("fourth", this.shapes.sidewalk1, fourth_location, this.materials.sidewalkMat);
            this.nodes.push(this.pieceFour_node);

            const fifth_location = base_location.times(Mat4.translation(0.8, 0, 1.6));
            this.pieceFive_node = new NodeAnimated("fifth", this.shapes.sidewalk1, fifth_location, this.materials.sidewalkMat);
            this.nodes.push(this.pieceFive_node);

            const sixth_location = base_location.times(Mat4.translation(-4.2, 0, 0));
            this.pieceSix_node = new NodeAnimated("sixth", this.shapes.sidewalk1, sixth_location, this.materials.sidewalkMat);
            this.nodes.push(this.pieceSix_node);

            const seventh_location = fourth_location.times(Mat4.translation(-4.2,0,0));
            this.pieceSeven_node = new NodeAnimated("seventh", this.shapes.sidewalk1, seventh_location, this.materials.sidewalkMat);
            this.nodes.push(this.pieceSeven_node);

            const eigth_location = sixth_location.times(Mat4.translation(0, 0,1.6)).times(Mat4.scale(0.5, 1, 1)).times(Mat4.translation(-0.5, 0,0));
            this.pieceEight_node = new NodeAnimated("eighth", this.shapes.sidewalk1, eigth_location, this.materials.sidewalkMat);
            this.nodes.push(this.pieceEight_node);

            const nineth_location = eigth_location.times(Mat4.translation(4.2, 0, 0));
            this.pieceNine_node = new NodeAnimated("nineth", this.shapes.sidewalk1, nineth_location, this.materials.sidewalkMat);
            this.nodes.push(this.pieceNine_node);

            const tenth_location = nineth_location.times(Mat4.translation(-7.1, 0, 0)).times(Mat4.scale(0.37, 1, 1));
            this.pieceTen_node = new NodeAnimated("tenth", this.shapes.sidewalk1, tenth_location, this.materials.sidewalkMat);
            this.nodes.push(this.pieceTen_node);

            const eleventh_location = base_location.times(Mat4.translation(-4.2, 0, 0.8));
            this.pieceEleven_node = new NodeAnimated("eleven", this.shapes.sidewalk1, eleventh_location, this.materials.sidewalkMat);
            this.nodes.push(this.pieceEleven_node);

            const twelfth_location = tenth_location.times(Mat4.scale(1/0.37 + 0.3, 1, 1.1)).pre_multiply(Mat4.rotation(Math.PI/2, 0, 1, 0))
                                    .times(Mat4.translation(-4.3, 0,-5.25));
            this.pieceTwelve_node = new NodeAnimated("twelve", this.shapes.sidewalk1, twelfth_location, this.materials.sidewalkMat);
            this.nodes.push(this.pieceTwelve_node);

            const thirtheenth_location = twelfth_location.times(Mat4.translation(1.4, 0, 8.3));
            this.pieceThirteen_node = new NodeAnimated("thirteen", this.shapes.sidewalk1, thirtheenth_location, this.materials.sidewalkMat);
            this.nodes.push(this.pieceThirteen_node);
            
            const fourteenth_location = tenth_location.times(Mat4.translation(41, 0, -2.4));
            this.pieceFourteen_node = new NodeAnimated("fourteen", this.shapes.sidewalk1, fourteenth_location, this.materials.sidewalkMat);
            this.nodes.push(this.pieceFourteen_node);
        }
    }