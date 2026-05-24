import { Cube3x3 } from './Cube3x3.js';
import { Cube5x5 } from './Cube5x5.js';
import { Pyraminx } from './Pyraminx.js';
import { TutorialEngine } from './Tutorial.js';

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x111111);

const camera =
    new THREE.PerspectiveCamera(
        45,
        window.innerWidth/window.innerHeight,
        0.1,
        100
    );

camera.position.set(6,6,8);

const renderer =
    new THREE.WebGLRenderer({
        antialias:true
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

document.body.appendChild(
    renderer.domElement
);

const controls =
    new THREE.OrbitControls(
        camera,
        renderer.domElement
    );

controls.enableDamping = true;

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        1
    )
);

const light =
    new THREE.DirectionalLight(
        0xffffff,
        1
    );

light.position.set(10,10,10);

scene.add(light);

let currentCube = null;

const tutorial =
    new TutorialEngine();

function loadCube(type){

    if(currentCube){
        scene.remove(currentCube.group);
    }

    switch(type){

        case "3x3":
            currentCube =
                new Cube3x3(scene);
            break;

        case "5x5":
            currentCube =
                new Cube5x5(scene);
            break;

        case "pyraminx":
            currentCube =
                new Pyraminx(scene);
            break;
    }
}

loadCube("3x3");

document
.getElementById("cube-selector")
.addEventListener("change",(e)=>{

    loadCube(e.target.value);

});

document
.getElementById("scramble-btn")
.addEventListener("click",()=>{

    currentCube.scramble();

});

document
.getElementById("solve-btn")
.addEventListener("click",()=>{

    currentCube.solve();

});

document
.getElementById("tutorial-toggle")
.addEventListener("click",()=>{

    document
    .getElementById("tutorial-panel")
    .classList.toggle("hidden");

});

function animate(){

    requestAnimationFrame(animate);

    controls.update();

    renderer.render(scene,camera);
}

animate();

window.addEventListener("resize",()=>{

    camera.aspect =
        window.innerWidth/window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});
