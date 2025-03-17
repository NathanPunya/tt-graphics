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
                    diffusitivity: 0.5,
                    specularity: 0.2,
                    color: color(1, 0.3, 0, 1)
                },
                wallsMat: {
                    shader: legoShader,
                    ambient: 1,
                    diffusitivity: 0.5,
                    specularity: 0.2,
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

export const Wall =
    class Wall {
        constructor(rootPosition = vec3(0, 0, 0), scale = vec3(1, 1, 1)) {
            this.shapes = {
                TopWall: new defs.Shape_From_File("lego_models/wall/TopWall.obj"),
                bottomWall: new defs.Shape_From_File("lego_models/wall/bottomWall.obj")
            }
            const legoShader = new defs.Decal_Phong();
            this.materials = {
                bottomMat: {
                    shader: legoShader,
                    ambient: 1,
                    diffusitivity: 0.5,
                    specularity: 0.5,
                    color: color(0.66, 0.51, 0.20, 1),
                },
                topMat: {
                    shader: legoShader,
                    ambient: 1,
                    diffusitivity: 0.5,
                    specularity: 0.5,
                    color: color(0.254, 0.178, 0.09, 1),
                }
            }

            this.transforms = {
                wallsTransform: Mat4.identity()
                    .times(Mat4.translation(rootPosition[0] + 0.45, rootPosition[1], rootPosition[2]))
                    .times(Mat4.scale(scale[0], scale[1], scale[2])),
                TopwallsTransform: Mat4.identity()
                    .times(Mat4.translation(rootPosition[0], rootPosition[1] + 1.2, rootPosition[2]))
                    .times(Mat4.scale(scale[0] * 0.95, scale[1] * 0.95, scale[2] * 0.95)),
            }
        }

        draw(webgl_manager, uniforms) {
            this.shapes.TopWall.draw(webgl_manager, uniforms, this.transforms.TopwallsTransform, this.materials.topMat);
            this.shapes.bottomWall.draw(webgl_manager, uniforms, this.transforms.wallsTransform, this.materials.bottomMat);
        }
    }

export const Porsche =
    class Porsche {
        constructor(rootPosition = vec3(0, 0, 0), scale = vec3(1, 1, 1)) {
            this.shapes = {
                Porsche: new defs.Shape_From_File("lego_models/car/porsche.obj"),
            }
            const legoShader = new defs.Decal_Phong();
            this.materials = {
                PorscheMat: {
                    shader: legoShader,
                    ambient: 1,
                    diffusitivity: 0.5,
                    specularity: 0.5,
                    color: color(0.5, 0.5, 0.5, 1),
                },
            }

            this.transforms = {
                Porsche_transform: Mat4.identity()
                    .times(Mat4.translation(rootPosition[0] + 0.45, rootPosition[1], rootPosition[2]))
                    .times(Mat4.scale(scale[0], scale[1], scale[2]))
                    .times(Mat4.rotation(Math.PI / 2, 0, -1, 0)),
            }
        }

        draw(webgl_manager, uniforms) {
            this.shapes.Porsche.draw(webgl_manager, uniforms, this.transforms.Porsche_transform, this.materials.PorscheMat);
        }
    }

export const Road =
    class Road {
        constructor(rootPosition = vec3(0, 0, 0), scale = vec3(1, 1, 1)) {
            this.shapes = {
                Road: new defs.Shape_From_File("lego_models/road/road.obj"),
            }
            const legoShader = new defs.Decal_Phong();
            this.materials = {
                RoadMat: {
                    shader: legoShader,
                    ambient: 1,
                    diffusitivity: 0.5,
                    specularity: 0.5,
                    color: color(0.1, 0.1, 0.1, 1),
                },
            }

            this.transforms = {
                Road_transform: Mat4.identity()
                    .times(Mat4.translation(rootPosition[0], rootPosition[1] - 0.5, rootPosition[2]))
                    .times(Mat4.scale(scale[0], scale[1], scale[2]))
            }
        }

        draw(webgl_manager, uniforms) {
            this.shapes.Road.draw(webgl_manager, uniforms, this.transforms.Road_transform, this.materials.RoadMat);
        }
    }

export const Tree =
    class Tree extends BuildableLego {
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
        initializeNodes(rootLocation, scale, trunkAmount) {
            const baseLocation = Mat4.translation(rootLocation[0], rootLocation[1], rootLocation[2]).times(Mat4.scale(scale[0], scale[1], scale[2]));

            for (let i = 0; i < trunkAmount; i++) {
                const trunkName = `trunk${i}`;

                const trunkLocation = baseLocation.times(Mat4.translation(0, i, 0));
                this[trunkName + "_node"] = new NodeAnimated(trunkName, this.shapes.trunk, trunkLocation, this.materials.trunkMat);
                this.nodes.push(this[trunkName + "_node"]);
            }

            const leaveLocation = this[`trunk${trunkAmount - 1}` + "_node"].end_transform_matrix.times(Mat4.translation(0, 2, 0))
                .times(Mat4.scale(3, 3, 3));
            this.leave_node = new NodeAnimated("leaves", this.shapes.leaves, leaveLocation, this.materials.leavesMat);
            this.nodes.push(this.leave_node);

        }
    }

export const Lamppost =
    class Lamppost extends BuildableLego {
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

        initializeNodes(rootLocation, scale) {
            const postLocation = Mat4.translation(rootLocation[0], rootLocation[1], rootLocation[2]).times(Mat4.scale(scale[0], scale[1], scale[2]));
            this.post_node = new NodeAnimated("post", this.shapes.post, postLocation, this.materials.postMat);
            this.nodes.push(this.post_node);

            const lampLocation = postLocation.times(Mat4.translation(0, 2, 0)).times(Mat4.scale(0.2, 0.2, 0.2));
            this.lamp_node = new NodeAnimated("lamp", this.shapes.lamp, lampLocation, this.materials.lampMat);
            this.nodes.push(this.lamp_node);

        }

    }

export const Bench =
    class Bench extends BuildableLego {
        constructor(rootLocation = vec3(0, 0, 0), scale = vec3(1, 1, 1)) {
            super();

            this.shapes = {
                leftLeg: new defs.Shape_From_File("lego_models/bench/leftLeg.obj"),
                rightLeg: new defs.Shape_From_File("lego_models/bench/rightLeg.obj"),
                seat: new defs.Shape_From_File("lego_models/bench/seat.obj"),
                backboard: new defs.Shape_From_File("lego_models/bench/backboard.obj"),
                longSlab: new defs.Shape_From_File("lego_models/bench/longSlab.obj"),
                ThinlongSlab: new defs.Shape_From_File("lego_models/bench/ThinlongSlab.obj"),
                slab: new defs.Shape_From_File("lego_models/bench/slab.obj"),
            }
            const legoShader = new defs.Decal_Phong();
            this.materials = {
                topMat: {
                    shader: legoShader,
                    ambient: 1,
                    diffusitivity: 1,
                    specularity: 1,
                    color: color(.105, 0.026, 0.004, 1)
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
                    .times(Mat4.translation(rootLocation[0], rootLocation[1], rootLocation[2])),
                topTransform: Mat4.scale(1, 1, 1) // scale down the lamp
                    .times(Mat4.translation(1, .5, 0)),
                bottomTransform: Mat4.identity(),
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

        initializeNodes(rootLocation, scale) {
            // Create the base transformation matrix.
            const base_location = Mat4.translation(rootLocation[0], rootLocation[1], rootLocation[2])
                .times(Mat4.scale(scale[0], scale[1], scale[2]))
                .times(Mat4.scale(0.6, 0.6, 0.6))
            // .times(Mat4.rotation(Math.PI / 2, 0, 1, 0));

            // Define the base node. For example, we'll use "leftLeg" for the base node.
            this.base_node = new NodeAnimated("base", this.shapes.leftLeg, base_location, this.materials.bottomMat);
            this.nodes.push(this.base_node);

            // Node for rightLeg
            const rightLegLocation = base_location.times(Mat4.translation(0, 0, 5.9));
            this.node_rightLeg = new NodeAnimated("rightLeg", this.shapes.rightLeg, rightLegLocation, this.materials.bottomMat);
            this.nodes.push(this.node_rightLeg);

            // Node for backboard
            const backboardLocation = base_location.times(Mat4.translation(3, 2.9, 3))
                .times(Mat4.scale(3, 3, 3));
            this.node_backboard = new NodeAnimated("backboard", this.shapes.backboard, backboardLocation, this.materials.topMat);
            this.nodes.push(this.node_backboard);

            // Node for ThinlongSlab
            const thinLongSlabLocation = base_location.times(Mat4.translation(0, 0.6, 3))
                .times(Mat4.scale(3, 3, 3));
            this.node_ThinlongSlab = new NodeAnimated("ThinlongSlab", this.shapes.ThinlongSlab, thinLongSlabLocation, this.materials.topMat);
            this.nodes.push(this.node_ThinlongSlab);

            // Node for longSlab
            const longSlabLocation = base_location.times(Mat4.translation(3, 5.4, 3))
                .times(Mat4.scale(2, 2, 2));
            this.node_longSlab = new NodeAnimated("longSlab", this.shapes.longSlab, longSlabLocation, this.materials.topMat);
            this.nodes.push(this.node_longSlab);

            // Node for slab
            const slabLocation = base_location.times(Mat4.translation(4.3, 0, 3))
                .times(Mat4.scale(2, 2, 2));
            this.node_slab = new NodeAnimated("slab", this.shapes.slab, slabLocation, this.materials.topMat);
            this.nodes.push(this.node_slab);

            // Node for seat
            const seatLocation = base_location.times(Mat4.translation(2.85, 0.5, 3))
                .times(Mat4.scale(1.6, 1.6, 1.6));
            this.node_seat = new NodeAnimated("seat", this.shapes.seat, seatLocation, this.materials.bottomMat);
            this.nodes.push(this.node_seat);
        }
    }