import { Cube3x3 } from './Cube3x3.js';
import { Cube5x5 } from './Cube5x5.js';
import { Pyraminx } from './Pyraminx.js';
import { TutorialEngine } from './Tutorial.js';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);
camera.position.set(6, 5, 8);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 10, 10);
dirLight.castShadow = true;
scene.add(dirLight);

const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
backLight.position.set(-5, -5, -10);
scene.add(backLight);

// Cube management
let currentCube = null;
const tutorial = new TutorialEngine();

// Move notation mapping
const moveMap = {
    'U': () => currentCube.rotateFace('U', 1),
    "U'": () => currentCube.rotateFace('U', -1),
    'D': () => currentCube.rotateFace('D', 1),
    "D'": () => currentCube.rotateFace('D', -1),
    'F': () => currentCube.rotateFace('F', 1),
    "F'": () => currentCube.rotateFace('F', -1),
    'B': () => currentCube.rotateFace('B', 1),
    "B'": () => currentCube.rotateFace('B', -1),
    'R': () => currentCube.rotateFace('R', 1),
    "R'": () => currentCube.rotateFace('R', -1),
    'L': () => currentCube.rotateFace('L', 1),
    "L'": () => currentCube.rotateFace('L', -1),
};

function loadCube(type) {
    if (currentCube) {
        scene.remove(currentCube.group);
    }

    switch (type) {
        case "3x3":
            currentCube = new Cube3x3(scene);
            createMoveControls();
            break;
        case "5x5":
            currentCube = new Cube5x5(scene);
            removeMoveControls();
            break;
        case "pyraminx":
            currentCube = new Pyraminx(scene);
            removeMoveControls();
            break;
    }
}

// Create move control buttons
function createMoveControls() {
    removeMoveControls();
    
    const container = document.createElement('div');
    container.id = 'move-controls';
    
    const moves = ['U', "U'", 'D', "D'", 'F', "F'", 'B', "B'", 'R', "R'", 'L', "L'"];
    
    moves.forEach(move => {
        const btn = document.createElement('button');
        btn.className = 'move-btn';
        btn.textContent = move;
        btn.onclick = () => {
            if (moveMap[move]) moveMap[move]();
        };
        container.appendChild(btn);
    });
    
    document.body.appendChild(container);
}

function removeMoveControls() {
    const existing = document.getElementById('move-controls');
    if (existing) existing.remove();
}

// Execute algorithm from tutorial
function executeAlgorithm(algorithm) {
    if (!algorithm || !currentCube) return;
    
    let i = 0;
    const runNext = () => {
        if (i >= algorithm.length) return;
        
        const move = algorithm[i++];
        if (moveMap[move]) {
            moveMap[move]();
            setTimeout(runNext, 350);
        }
    };
    
    runNext();
}

// Initialize
loadCube("3x3");

// Event Listeners
document.getElementById("cube-selector").addEventListener("change", (e) => {
    loadCube(e.target.value);
});

document.getElementById("scramble-btn").addEventListener("click", () => {
    if (currentCube && currentCube.scramble) {
        currentCube.scramble();
    }
});

document.getElementById("solve-btn").addEventListener("click", () => {
    if (currentCube && currentCube.solve) {
        currentCube.solve();
    }
});

// Tutorial controls
document.getElementById("tutorial-toggle").addEventListener("click", () => {
    document.getElementById("tutorial-panel").classList.toggle("hidden");
});

document.getElementById("tutorial-next").addEventListener("click", () => {
    const step = tutorial.next();
    updateTutorialUI(step);
    
    // Auto-play algorithm if available
    const algo = tutorial.getAlgorithm();
    if (algo) executeAlgorithm(algo);
});

document.getElementById("tutorial-prev").addEventListener("click", () => {
    const step = tutorial.prev();
    updateTutorialUI(step);
});

function updateTutorialUI(step) {
    document.getElementById("tutorial-title").textContent = step.title;
    document.getElementById("tutorial-desc").textContent = step.desc;
    document.getElementById("tutorial-step").textContent = `${step.index + 1} / ${step.total}`;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Resize handler
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Keyboard controls for 3x3
window.addEventListener('keydown', (e) => {
    if (!currentCube || currentCube.constructor.name !== 'Cube3x3') return;
    
    const keyMap = {
        'u': () => currentCube.rotateFace('U', 1),
        'U': () => currentCube.rotateFace('U', -1),
        'd': () => currentCube.rotateFace('D', 1),
        'D': () => currentCube.rotateFace('D', -1),
        'f': () => currentCube.rotateFace('F', 1),
        'F': () => currentCube.rotateFace('F', -1),
        'b': () => currentCube.rotateFace('B', 1),
        'B': () => currentCube.rotateFace('B', -1),
        'r': () => currentCube.rotateFace('R', 1),
        'R': () => currentCube.rotateFace('R', -1),
        'l': () => currentCube.rotateFace('L', 1),
        'L': () => currentCube.rotateFace('L', -1),
    };
    
    if (keyMap[e.key]) {
        e.preventDefault();
        keyMap[e.key]();
    }
});
