export class Pyraminx {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        
        this.colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
        
        this.createPyraminx();
        this.scene.add(this.group);
    }

    createPyraminx() {
        // Create a simple tetrahedron as placeholder
        const geo = new THREE.TetrahedronGeometry(3);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x888888,
            wireframe: false,
            flatShading: true
        });
        const mesh = new THREE.Mesh(geo, mat);
        
        // Add colored face indicators (small triangles)
        this.group.add(mesh);
    }

    scramble() {
        gsap.to(this.group.rotation, {
            x: Math.PI * 2,
            y: Math.PI,
            duration: 2
        });
    }

    solve() {
        gsap.to(this.group.rotation, {
            x: 0, y: 0, z: 0,
            duration: 1
        });
    }
}
