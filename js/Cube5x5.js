export class Cube5x5 {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.isAnimating = false;
        
        this.colors = {
            U: 0xffffff, D: 0xffd500, F: 0x009e60,
            B: 0x0051ba, R: 0xc41e3a, L: 0xff5800,
            CORE: 0x111111
        };

        this.createCube();
        this.scene.add(this.group);
    }

    createCube() {
        const spacing = 1.02;
        const size = 0.9;
        const range = [-2, -1, 0, 1, 2];

        for (let x of range) {
            for (let y of range) {
                for (let z of range) {
                    const materials = this.getMaterials(x, y, z);
                    const geo = new THREE.BoxGeometry(size, size, size);
                    const cubie = new THREE.Mesh(geo, materials);
                    cubie.position.set(x * spacing, y * spacing, z * spacing);
                    this.group.add(cubie);
                }
            }
        }
    }

    getMaterials(x, y, z) {
        const mat = (color) => new THREE.MeshStandardMaterial({ color });
        const c = this.colors;
        const core = c.CORE;

        return [
            x === 2 ? mat(c.R) : mat(core),
            x === -2 ? mat(c.L) : mat(core),
            y === 2 ? mat(c.U) : mat(core),
            y === -2 ? mat(c.D) : mat(core),
            z === 2 ? mat(c.F) : mat(core),
            z === -2 ? mat(c.B) : mat(core),
        ];
    }

    scramble() {
        // Simple group rotation for now
        gsap.to(this.group.rotation, {
            x: Math.PI * 2,
            y: Math.PI * 2,
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
