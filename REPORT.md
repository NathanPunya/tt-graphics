CS C174C Term Project - Lego.

By: Nathan Punyataweekul, Henry Braid, Brandon Rodmel

Exclaimer: Let code run for about 15 seconds before moving to allow for objects to load into scene

Basic Instructions:

    Run app.js to begin and wait about 15 seconds before attempting to move

    Movement: 'WASD' for basic movement

    Building: Approach a broken object, once the mini-figure is close enough, hold and click 'x.' The object will begin to be built. The user must hold this
    button for a couple seconds for the object to be fully built. The object will hop once building is completed, indiciating that the user can let go of 'x.' 

    Jumping: 'left-shift' for jumping

Theme: The goal of the project was to create a Lego environment in which the user is able to interact with the environment by rebuilding various objects.
To meet this goal, a sort of sandbox had to be created, meaning that the user should able to walk around and explore as they please. The final product was
a open-world Lego park where the user is able to walk around and explore. It is up to the user to go around and "fix" the park by rebuilding various objects
such as trees and benches. There is a car, 2 trees, bench, lamppost, and sidewalk that can all be built. There are other components in the scene, but these are
static and cannot be modified by the user.

Algorithms:

    Spline Interpolation: When the user is building an object, each lego piece is moved along a path to its final destination. This path is created using
    a hermite spline. The implementation for this is very similar to assignment 1. Itcan be found in 'build.js', where a more descriptive explaination can also be found.

    Collision Detection: To add a bit of realism, collision with objects and the ground was implemented. This was done by comparing the coordinates of the mini-figure
    to that of other objects in the scene. The mini-figure will only collide with objects that are built for the sake of simplicity. In other words, the broken pieces 
    of a lego do not have collision detection and the mini-figure will be able to phase through them.

    Articulated Kinematics: Joints were incorporated into the implementation of the mini-figure. The movement of these joins was implemneted using articulated kinematics. 
    The swaying of the arms and legs are controlled using inverse kinetmatics. This is also true for the "build" animation that them mini-figure goes through when building ("x" button)
    
    Phyiscs Simulation: We also incorporated physics into our mini-figure. When the mini-figure jumps, you can see it bounce a bit. We used the euler method for our physics simulation
    This can be found in '