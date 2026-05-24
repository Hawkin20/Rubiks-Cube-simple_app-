export class Cube3x3 {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.cubies = [];
        this.isAnimating = false;
        
        // Standard Rubik's colors: U D F B R L
        this.colors = {
            U: 0xffffff, // White (Up)
            D: 0xffd500, // Yellow (Down)
            F: 0x009e60, // Green (Front)
            B: 0x0051ba, // Blue (Back)
            R: 0xc41e3a, // Red (Right)
            L: 0xff5800, // Orange (Left)
            CORE: 0x111111 // Inner black
        };

        this.createCube();
        this.scene.add(this.group);
    }

    createCube() {
        const spacing = 1.02;
        const size = 0.95;

        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    // Determine which faces are visible for this cubie
                    const materials = this.getMaterials(x, y, z);
                    
                    const geo = new THREE.BoxGeometry(size, size, size);
                    const cubie = new THREE.Mesh(geo, materials);

                    cubie.position.set(x * spacing, y * spacing, z * spacing);
                    
                    // Store logical position for rotation tracking
                    cubie.userData = {
                        gridPos: { x, y, z },
                        initialPos: { x, y, z }
                    };

                    this.group.add(cubie);
                    this.cubies.push(cubie);
                }
            }
        }
    }

    getMaterials(x, y, z) {
        // BoxGeometry faces: right, left, top, bottom, front, back
        // We need to map these to R, L, U, D, F, B
        
        const mat = (color) => new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.3,
            metalness: 0.1
        });

        return [
            x === 1 ? mat(this.colors.R) : mat(this.colors.CORE),  // Right
            x === -1 ? mat(this.colors.L) : mat(this.colors.CORE), // Left
            y === 1 ? mat(this.colors.U) : mat(this.colors.CORE),  // Up
            y === -1 ? mat(this.colors.D) : mat(this.colors.CORE), // Down
            z === 1 ? mat(this.colors.F) : mat(this.colors.CORE),  // Front
            z === -1 ? mat(this.colors.B) : mat(this.colors.CORE), // Back
        ];
    }

    // Get cubies on a specific face
    getFaceCubies(face) {
        const epsilon = 0.1;
        return this.cubies.filter(cubie => {
            const pos = cubie.position;
            switch(face) {
                case 'U': return Math.abs(pos.y - 1.02) < epsilon;
                case 'D': return Math.abs(pos.y + 1.02) < epsilon;
                case 'F': return Math.abs(pos.z - 1.02) < epsilon;
                case 'B': return Math.abs(pos.z + 1.02) < epsilon;
                case 'R': return Math.abs(pos.x - 1.02) < epsilon;
                case 'L': return Math.abs(pos.x + 1.02) < epsilon;
                default: return false;
            }
        });
    }

    // Rotate a face: face = 'U','D','F','B','R','L', direction = 1 (clockwise) or -1 (counter)
    rotateFace(face, direction = 1, duration = 0.3) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const faceCubies = this.getFaceCubies(face);
        const pivot = new THREE.Group();
        
        // Add face cubies to pivot
        faceCubies.forEach(cubie => {
            this.group.remove(cubie);
            pivot.add(cubie);
        });
        
        this.group.add(pivot);

        // Determine rotation axis
        const axis = new THREE.Vector3();
        switch(face) {
            case 'U': axis.set(0, 1, 0); break;
            case 'D': axis.set(0, -1, 0); break;
            case 'F': axis.set(0, 0, 1); break;
            case 'B': axis.set(0, 0, -1); break;
            case 'R': axis.set(1, 0, 0); break;
            case 'L': axis.set(-1, 0, 0); break;
        }

        // Animate rotation
        const targetRotation = (Math.PI / 2) * direction;
        
        gsap.to(pivot.rotation, {
            x: axis.x * targetRotation,
            y: axis.y * targetRotation,
            z: axis.z * targetRotation,
            duration: duration,
            ease: "power2.inOut",
            onComplete: () => {
                // Snap to exact 90 degrees and reparent
                pivot.updateMatrixWorld();
                
                faceCubies.forEach(cubie => {
                    pivot.remove(cubie);
                    
                    // Get world position/rotation
                    const worldPos = new THREE.Vector3();
                    const worldQuat = new THREE.Quaternion();
                    cubie.getWorldPosition(worldPos);
                    cubie.getWorldQuaternion(worldQuat);
                    
                    // Add back to main group
                    this.group.add(cubie);
                    cubie.position.copy(worldPos);
                    cubie.quaternion.copy(worldQuat);
                    
                    // Snap position to grid
                    cubie.position.x = Math.round(cubie.position.x / 1.02) * 1.02;
                    cubie.position.y = Math.round(cubie.position.y / 1.02) * 1.02;
                    cubie.position.z = Math.round(cubie.position.z / 1.02) * 1.02;
                });
                
                this.group.remove(pivot);
                this.isAnimating = false;
            }
        });
    }

    // Scramble: perform 20 random moves
    scramble() {
        if (this.isAnimating) return;
        
        const faces = ['U', 'D', 'F', 'B', 'R', 'L'];
        const moves = [];
        
        for (let i = 0; i < 20; i++) {
            const face = faces[Math.floor(Math.random() * faces.length)];
            const dir = Math.random() > 0.5 ? 1 : -1;
            moves.push({ face, dir });
        }

        // Execute moves sequentially
        let i = 0;
        const executeNext = () => {
            if (i >= moves.length) return;
            
            const move = moves[i++];
            this.rotateFace(move.face, move.dir, 0.15);
            
            // Wait for animation then next
            setTimeout(executeNext, 200);
        };
        
        executeNext();
    }

    // Solve: reset to solved state (instant for now)
    solve() {
        if (this.isAnimating) return;
        
        // Remove all cubies and recreate
        this.cubies.forEach(cubie => {
            this.group.remove(cubie);
            cubie.geometry.dispose();
            cubie.material.forEach(m => m.dispose());
        });
        this.cubies = [];
        
        // Reset group rotation
        gsap.to(this.group.rotation, {
            x: 0, y: 0, z: 0,
            duration: 0.5
        });
        
        this.createCube();
    }
}
