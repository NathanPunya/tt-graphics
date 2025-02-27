import { tiny, defs } from "./examples/common.js";
const { vec3, vec4, color, Mat4, Shape, Shader, Component } = tiny;

function invert_3x3(mat) {
  const m00 = mat[0][0], m01 = mat[0][1], m02 = mat[0][2],
    m10 = mat[1][0], m11 = mat[1][1], m12 = mat[1][2],
    m20 = mat[2][0], m21 = mat[2][1], m22 = mat[2][2];

  const determinant = m00 * (m11 * m22 - m12 * m21) -
    m01 * (m10 * m22 - m12 * m20) +
    m02 * (m10 * m21 - m11 * m20);
  if (Math.abs(determinant) < 1e-10) throw new Error("Invalid matrix");

  const invDeterminant = 1 / determinant;
  return [
    [(m11 * m22 - m12 * m21) * invDeterminant, (m02 * m21 - m01 * m22) * invDeterminant, (m01 * m12 - m02 * m11) * invDeterminant],
    [(m12 * m20 - m10 * m22) * invDeterminant, (m00 * m22 - m02 * m20) * invDeterminant, (m02 * m10 - m00 * m12) * invDeterminant],
    [(m10 * m21 - m11 * m20) * invDeterminant, (m01 * m20 - m00 * m21) * invDeterminant, (m00 * m11 - m01 * m10) * invDeterminant]
  ];
}

function transpose_2D(mat) {
  const numRows = mat.length,
    numCols = mat[0].length;
  const transposedMatrix = [];
  for (let colIndex = 0; colIndex < numCols; colIndex++) {
    transposedMatrix[colIndex] = [];
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
      transposedMatrix[colIndex][rowIndex] = mat[rowIndex][colIndex];
    }
  }
  return transposedMatrix;
}

function multiply_2D(A, B) {
  const numRowsA = A.length,
    numColsA = A[0].length,
    numColsB = B[0].length;
  const result = new Array(numRowsA);
  for (let row = 0; row < numRowsA; row++) {
    result[row] = new Array(numColsB).fill(0);
    for (let col = 0; col < numColsB; col++) {
      for (let k = 0; k < numColsA; k++) {
        result[row][col] += A[row][k] * B[k][col];
      }
    }
  }
  return result;
}

class BodyPart {
  constructor(partName, shapeRef, localTransform) {
    this.parentJoint = null;
    this.childJoints = [];
    this.shape = shapeRef;
    this.transform = localTransform;
    this.name = partName;
  }
}

class JointConnection {
  constructor(jointName, parentPart, childPart, locationMat) {
    this.name = jointName;
    this.parent = parentPart;
    this.child = childPart;
    this.location = locationMat;
    this.jointTransform = Mat4.identity();
    this.endEffector = null;
    this.dof = { xRot: false, yRot: false, zRot: false };
  }
  setDof(rotX, rotY, rotZ) {
    this.dof.xRot = rotX;
    this.dof.yRot = rotY;
    this.dof.zRot = rotZ;
  }
  applyAngles(angleArray) {
    this.jointTransform = Mat4.identity();
    let idx = 0;
    if (this.dof.xRot) {
      this.jointTransform.pre_multiply(Mat4.rotation(angleArray[idx], 1, 0, 0));
      idx++;
    }
    if (this.dof.yRot) {
      this.jointTransform.pre_multiply(Mat4.rotation(angleArray[idx], 0, 1, 0));
      idx++;
    }
    if (this.dof.zRot) {
      this.jointTransform.pre_multiply(Mat4.rotation(angleArray[idx], 0, 0, 1));
    }
  }
}

class EndEffector {
  constructor(effName, parentJoint, localPosVec4) {
    this.globalPos = null;
    this.parentJoint = parentJoint;
    this.localPos = localPosVec4;
    this.name = effName;
  }
}

class Curve_Shape extends Shape {
  constructor(pathFunc, samples, drawColor = color(1, 0, 0, 1)) {
    super("position", "normal");
    this.material = { shader: new defs.Phong_Shader(), ambient: 1, color: drawColor };
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const pos = pathFunc(t);
      this.arrays.position.push(pos);
      this.arrays.normal.push(vec3(0, 0, 0));
    }
  }
  draw(glManager, uniforms) {
    super.draw(glManager, uniforms, Mat4.identity(), this.material, "LINE_STRIP");
  }
}

export class Hermite_Spline {
  constructor() {
    this.ctrlPts = [];
    this.tangents = [];
  }
  addPt(pt, tan) {
    this.ctrlPts.push(pt);
    this.tangents.push(tan);
  }
  getPos(t) {
    if (this.ctrlPts.length < 2) return vec3(0, 0, 0);
    const segCount = this.ctrlPts.length - 1;
    let seg = Math.floor(t * segCount);
    if (seg >= segCount) seg = segCount - 1;
    const localT = (t * segCount) - seg;

    const p0 = this.ctrlPts[seg];
    const p1 = this.ctrlPts[seg + 1];
    const m0 = this.tangents[seg].times(1.0 / segCount);
    const m1 = this.tangents[seg + 1].times(1.0 / segCount);

    const h0 = 2 * localT ** 3 - 3 * localT ** 2 + 1;
    const h1 = localT ** 3 - 2 * localT ** 2 + localT;
    const h2 = -2 * localT ** 3 + 3 * localT ** 2;
    const h3 = localT ** 3 - localT ** 2;
    return p0.times(h0)
      .plus(m0.times(h1))
      .plus(p1.times(h2))
      .plus(m1.times(h3));
  }
}

export class IKRig {
  constructor() {
    const sphere = new defs.Subdivision_Sphere(4);

    const torsoXf = Mat4.identity().times(Mat4.scale(0.75, 1.5, 0.75));
    this.torso = new BodyPart("torso", sphere, torsoXf);

    const rootXf = Mat4.identity().times(Mat4.translation(1, 5.6, 2));
    this.rootJoint = new JointConnection("root", null, this.torso, rootXf);
    this.rootJoint.setDof(true, true, true);

    const headXf = Mat4.identity()
      .times(Mat4.translation(0, -0.5, 0))
      .times(Mat4.scale(0.5, 0.5, 0.5));
    this.head = new BodyPart("head", sphere, headXf);

    const neckXf = Mat4.identity().times(Mat4.translation(0, 2.5, 0));
    this.neckJoint = new JointConnection("neck", this.torso, this.head, neckXf);
    this.torso.childJoints.push(this.neckJoint);

    const rUpperArmXf = Mat4.identity()
      .times(Mat4.translation(1, 0, 0))
      .times(Mat4.scale(1, 0.25, 0.25));
    this.rUpperArm = new BodyPart("r_upper_arm", sphere, rUpperArmXf);

    const rShoulderXf = Mat4.identity().times(Mat4.translation(0.45, 1.25, 0));
    this.rShoulderJoint = new JointConnection("r_shoulder", this.torso, this.rUpperArm, rShoulderXf);
    this.torso.childJoints.push(this.rShoulderJoint);
    this.rShoulderJoint.setDof(true, true, true);

    const rLowerArmXf = Mat4.identity()
      .times(Mat4.translation(1, 0, 0))
      .times(Mat4.scale(1, 0.25, 0.25));
    this.rLowerArm = new BodyPart("r_lower_arm", sphere, rLowerArmXf);

    const rElbowXf = Mat4.identity().times(Mat4.translation(2, 0, 0));
    this.rElbowJoint = new JointConnection("r_elbow", this.rUpperArm, this.rLowerArm, rElbowXf);
    this.rUpperArm.childJoints.push(this.rElbowJoint);
    this.rElbowJoint.setDof(true, true, false);

    const rHandXf = Mat4.identity()
      .times(Mat4.translation(0.5, 0, 0))
      .times(Mat4.scale(0.5, 0.3, 0.3));
    this.rHand = new BodyPart("r_hand", sphere, rHandXf);

    const rWristXf = Mat4.identity().times(Mat4.translation(2, 0, 0));
    this.rWristJoint = new JointConnection("r_wrist", this.rLowerArm, this.rHand, rWristXf);
    this.rLowerArm.childJoints.push(this.rWristJoint);
    this.rWristJoint.setDof(false, true, true);

    const rHandEffPos = vec4(1, 0, 0, 1);
    this.rightHandEffector = new EndEffector("r_end_eff", this.rWristJoint, rHandEffPos);
    this.rWristJoint.endEffector = this.rightHandEffector;

    const lUpperArmXf = Mat4.identity()
      .times(Mat4.translation(-1, 0, 0))
      .times(Mat4.scale(1, 0.25, 0.25));
    this.lUpperArm = new BodyPart("l_upper_arm", sphere, lUpperArmXf);

    const lShoulderXf = Mat4.identity().times(Mat4.translation(-0.45, 1.25, 0));
    this.lShoulderJoint = new JointConnection("l_shoulder", this.torso, this.lUpperArm, lShoulderXf);
    this.torso.childJoints.push(this.lShoulderJoint);
    this.lShoulderJoint.setDof(true, true, true);

    const lLowerArmXf = Mat4.identity()
      .times(Mat4.translation(-1, 0, 0))
      .times(Mat4.scale(1, 0.25, 0.25));
    this.lLowerArm = new BodyPart("l_lower_arm", sphere, lLowerArmXf);

    const lElbowXf = Mat4.identity().times(Mat4.translation(-2, 0, 0));
    this.lElbowJoint = new JointConnection("l_elbow", this.lUpperArm, this.lLowerArm, lElbowXf);
    this.lUpperArm.childJoints.push(this.lElbowJoint);
    this.lElbowJoint.setDof(true, true, false);

    const lHandXf = Mat4.identity()
      .times(Mat4.translation(-0.5, 0, 0))
      .times(Mat4.scale(0.5, 0.3, 0.3));
    this.lHand = new BodyPart("l_hand", sphere, lHandXf);

    const lWristXf = Mat4.identity().times(Mat4.translation(-2, 0, 0));
    this.lWristJoint = new JointConnection("l_wrist", this.lLowerArm, this.lHand, lWristXf);
    this.lLowerArm.childJoints.push(this.lWristJoint);
    this.lWristJoint.setDof(true, false, true);

    const lUlegXf = Mat4.identity()
      .times(Mat4.translation(-0.3, -2.4, 0))
      .times(Mat4.scale(0.25, 1, 0.25));
    this.lUpperLeg = new BodyPart("l_upper_leg", sphere, lUlegXf);

    const lHipXf = Mat4.identity().times(Mat4.translation(0, 0, 0));
    this.lHipJoint = new JointConnection("l_hip", this.torso, this.lUpperLeg, lHipXf);
    this.torso.childJoints.push(this.lHipJoint);

    const lLlegXf = Mat4.identity()
      .times(Mat4.translation(-0.3, -4.4, 0))
      .times(Mat4.scale(0.25, 1, 0.25));
    this.lLowerLeg = new BodyPart("l_lower_leg", sphere, lLlegXf);

    const lKneeXf = Mat4.identity().times(Mat4.translation(0, 0, 0));
    this.lKneeJoint = new JointConnection("l_knee", this.lUpperLeg, this.lLowerLeg, lKneeXf);
    this.lUpperLeg.childJoints.push(this.lKneeJoint);

    const lFootXf = Mat4.identity()
      .times(Mat4.translation(-0.3, -8, 0))
      .times(Mat4.scale(0.3, 0.125, 0.125));
    this.lFoot = new BodyPart("l_foot", sphere, lFootXf);

    const lAnkleXf = Mat4.identity().times(Mat4.translation(0, 2.5, 0));
    this.lAnkleJoint = new JointConnection("l_ankle", this.lLowerLeg, this.lFoot, lAnkleXf);
    this.lLowerLeg.childJoints.push(this.lAnkleJoint);

    const rUlegXf = Mat4.identity()
      .times(Mat4.translation(0.3, -2.4, 0))
      .times(Mat4.scale(0.25, 1, 0.25));
    this.rUpperLeg = new BodyPart("r_upper_leg", sphere, rUlegXf);

    const rHipXf = Mat4.identity().times(Mat4.translation(0, 0, 0));
    this.rHipJoint = new JointConnection("r_hip", this.torso, this.rUpperLeg, rHipXf);
    this.torso.childJoints.push(this.rHipJoint);
    this.rHipJoint.setDof(true, true, true);

    const rLlegXf = Mat4.identity()
      .times(Mat4.translation(0.3, -4.4, 0))
      .times(Mat4.scale(0.25, 1, 0.25));
    this.rLowerLeg = new BodyPart("r_lower_leg", sphere, rLlegXf);

    const rKneeXf = Mat4.identity().times(Mat4.translation(0, 0, 0));
    this.rKneeJoint = new JointConnection("r_knee", this.rUpperLeg, this.rLowerLeg, rKneeXf);
    this.rUpperLeg.childJoints.push(this.rKneeJoint);

    const rFootXf = Mat4.identity()
      .times(Mat4.translation(-0.7, -8, 0))
      .times(Mat4.scale(0.3, 0.125, 0.125));
    this.rFoot = new BodyPart("r_foot", sphere, rFootXf);

    const rAnkleXf = Mat4.identity().times(Mat4.translation(1, 2.5, 0));
    this.rAnkleJoint = new JointConnection("r_ankle", this.rLowerLeg, this.rFoot, rAnkleXf);
    this.rLowerLeg.childJoints.push(this.rAnkleJoint);

    // Hat time
    const hatBrimTransform = Mat4.identity()
      .times(Mat4.translation(0, -0.1, 0))
      .times(Mat4.scale(0.7, 0.1, 0.7));
    this.hatBrim = new BodyPart("hat_brim", new defs.Cube(), hatBrimTransform);

    this.hatBrimJoint = new JointConnection("hat_brim_joint", this.head, this.hatBrim, Mat4.identity());
    this.head.childJoints.push(this.hatBrimJoint);

    const hatTopTransform = Mat4.identity()
      .times(Mat4.translation(0, 0.3, 0))
      .times(Mat4.scale(0.5, 0.5, 0.5));
    this.hatTop = new BodyPart("hat_top", new defs.Cube(), hatTopTransform);

    this.hatTopJoint = new JointConnection("hat_top_joint", this.hatBrim, this.hatTop, Mat4.identity());
    this.hatBrim.childJoints.push(this.hatTopJoint);

    this.numAngles = 7;
    this.angles = [0, 0, 0, 0, 0, 0, 0];
    this.applyAngles();
  }

  applyAngles() {
    this.rShoulderJoint.applyAngles(this.angles.slice(0, 3));
    this.rElbowJoint.applyAngles(this.angles.slice(3, 5));
    this.rWristJoint.applyAngles(this.angles.slice(5, 7));
  }

  renderSkeleton(glManager, uniforms, material) {
    const stack = [];
    const recurseDraw = (joint, matrix) => {
      if (!joint) return;

      matrix.post_multiply(joint.location.times(joint.jointTransform));
      stack.push(matrix.copy());

      const part = joint.child;
      matrix.post_multiply(part.transform);
      part.shape.draw(glManager, uniforms, matrix, material);

      matrix = stack.pop();
      for (const cJoint of part.childJoints) {
        stack.push(matrix.copy());
        recurseDraw(cJoint, matrix);
        matrix = stack.pop();
      }
    };
    recurseDraw(this.rootJoint, Mat4.identity());
  }

  getEndEffectorPos() {
    const stack = [];
    let finalPos = vec3(0, 0, 0);

    const recurseUpdate = (joint, matrix) => {
      if (!joint) return;
      matrix.post_multiply(joint.location.times(joint.jointTransform));
      stack.push(matrix.copy());

      if (joint.endEffector) {
        joint.endEffector.globalPos = matrix.times(joint.endEffector.localPos);
        finalPos = vec3(
          joint.endEffector.globalPos[0],
          joint.endEffector.globalPos[1],
          joint.endEffector.globalPos[2]
        );
      }

      const childPart = joint.child;
      matrix.post_multiply(childPart.transform);
      matrix = stack.pop();

      for (const cJoint of childPart.childJoints) {
        stack.push(matrix.copy());
        recurseUpdate(cJoint, matrix);
        matrix = stack.pop();
      }
    };
    recurseUpdate(this.rootJoint, Mat4.identity());
    return finalPos;
  }

  buildJacobian() {
    const J = [[0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]];
    const basePos = this.getEndEffectorPos();
    const step = 0.001;

    for (let i = 0; i < this.numAngles; i++) {
      this.angles[i] += step;
      this.applyAngles();
      const newPos = this.getEndEffectorPos();
      this.angles[i] -= step;
      this.applyAngles();

      J[0][i] = (newPos[0] - basePos[0]) / step;
      J[1][i] = (newPos[1] - basePos[1]) / step;
      J[2][i] = (newPos[2] - basePos[2]) / step;
    }
    return J;
  }

  computeAngleChange(jacobian, dx) {
    const damp = 0.01;
    const Jt = transpose_2D(jacobian);   // 7x3
    const JJT = multiply_2D(jacobian, Jt); // 3x3

    JJT[0][0] += damp;
    JJT[1][1] += damp;
    JJT[2][2] += damp;

    const invJJT = invert_3x3(JJT);   // 3x3
    const pseudoInv = multiply_2D(Jt, invJJT); // 7x3

    const colDx = [[dx[0]], [dx[1]], [dx[2]]];
    return multiply_2D(pseudoInv, colDx);
  }

  performIK(targetPos, maxIter = 100, tolerance = 0.01, stepSize = 0.05) {
    let currentPos = this.getEndEffectorPos();
    for (let n = 0; n < maxIter; n++) {
      const diff = targetPos.minus(currentPos);
      if (diff.norm() < tolerance) break;

      const dx = diff.times(stepSize);
      const J = this.buildJacobian();
      const dAngles = this.computeAngleChange(J, [dx[0], dx[1], dx[2]]);

      for (let i = 0; i < this.numAngles; i++) {
        this.angles[i] += dAngles[i][0];
      }
      this.applyAngles();
      currentPos = currentPos.plus(dx);
    }
  }
}

export const Assignment2_base = defs.Assignment2_base =
  class Assignment2_base extends Component {
    init() {
      this.shapes = {
        box: new defs.Cube(),
        ball: new defs.Subdivision_Sphere(4),
      };

      const phong = new defs.Phong_Shader();
      const tex_phong = new defs.Textured_Phong();
      this.materials = {
        plastic: { shader: phong, ambient: 0.2, diffusivity: 1, specularity: 0.5, color: color(0.9, 0.5, 0.9, 1) },
        metal: { shader: phong, ambient: 0.2, diffusivity: 1, specularity: 1, color: color(0.1, 0.9, 0.1, 1) },

      };

      this.ikChar = new IKRig();

      this.eightPath = new Hermite_Spline();
      let cx = 3, cy = 7, rad = 1, z = -0.8;

      this.eightPath.addPt(vec3(cx - rad, cy, z), vec3(0, 10, 0));
      this.eightPath.addPt(vec3(cx, cy + 1, z), vec3(10, 0, 0));
      this.eightPath.addPt(vec3(cx + rad, cy, z), vec3(0, -10, 0));
      this.eightPath.addPt(vec3(cx, cy - 1, z), vec3(-10, 0, 0));
      this.eightPath.addPt(vec3(cx - rad, cy - 1.9, z), vec3(0, -10, 0));
      this.eightPath.addPt(vec3(cx, cy - 3, z), vec3(10, 0, 0));
      this.eightPath.addPt(vec3(cx + rad, cy - 1.9, z), vec3(0, 10, 0));
      this.eightPath.addPt(vec3(cx, cy - 1, z), vec3(-10, 0, 0));
      this.eightPath.addPt(vec3(cx - rad, cy, z), vec3(0, 10, 0));
      this.eightPath.addPt(vec3(cx - rad, cy, z), vec3(0, 10, 0));

      const pathFunc = (tt) => this.eightPath.getPos(tt);
      this.eightDrawer = new Curve_Shape(pathFunc, 300, color(1, 0, 0, 1));
    }

    render_animation(caller) {
      if (!caller.controls) {
        this.animated_children.push(
          caller.controls = new defs.Movement_Controls({ uniforms: this.uniforms })
        );
        caller.controls.add_mouse_controls(caller.canvas);
        Shader.assign_camera(
          Mat4.look_at(vec3(5, 8, 15), vec3(0, 5, 0), vec3(0, 1, 0)),
          this.uniforms
        );
      }
      this.uniforms.projection_transform = Mat4.perspective(Math.PI / 4, caller.width / caller.height, 1, 100);

      const t = this.uniforms.animation_time / 1000;
      const timeFrac = (t / 5) % 1;
      const figure8Target = this.eightPath.getPos(timeFrac);
      this.ikChar.performIK(figure8Target);

      const lightPos = vec4(20, 20, 20, 1);
      this.uniforms.lights = [
        defs.Phong_Shader.light_source(lightPos, color(1, 1, 1, 1), 1e6)
      ];
    }
  };

export class Assignment2 extends Assignment2_base {
  render_animation(caller) {
    super.render_animation(caller);

    const groundColor = color(1, 0.7, 0, 1);
    const wallColor = color(0.7, 1.0, 0.8, 1);
    const boardColor = color(0.2, 0.2, 0.2, 1);

    const floorXf = Mat4.translation(0, 0, 0).times(Mat4.scale(10, 0.01, 10));
    this.shapes.box.draw(
      caller, this.uniforms, floorXf,
      { ...this.materials.plastic, color: groundColor }
    );

    const wallXf = Mat4.translation(0, 5, -1.2).times(Mat4.scale(6, 5, 0.1));
    this.shapes.box.draw(
      caller, this.uniforms, wallXf,
      { ...this.materials.plastic, color: wallColor }
    );

    const boardXf = Mat4.translation(3, 6, -1).times(Mat4.scale(2.5, 2.5, 0.1));
    this.shapes.box.draw(
      caller, this.uniforms, boardXf,
      { ...this.materials.plastic, color: boardColor }
    );

    this.eightDrawer.draw(caller, this.uniforms);
    this.ikChar.renderSkeleton(caller, this.uniforms, this.materials.metal);
  }

  render_controls() {
    this.control_panel.innerHTML += "IK Scene: Figure-8 Path<br>";
    this.new_line();
    this.key_triggered_button("Debug", ["Shift", "D"], () => {
      console.log("Angles:", this.ikChar.angles);
    });
    this.new_line();
  }
}