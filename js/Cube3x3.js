export class Cube3x3 {
    constructor(scene) {
        this.scene = scene;
        this.group = new THREE.Group();
        this.cubies = [];
        this.isAnimating = false;
        this.moveHistory = []; // For undo feature

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
        // BoxGeometry faces: right(+x), left(-x), top(+y), bottom(-y), front(+z), back(-z)
        const mat = (color) => new THREE.MeshStandardMaterial({ 
            color: color,
            roughness: 0.3,
            metalness: 0.1
        });

        return [
            x === 1 ? mat(this.colors.R) : mat(this.colors.CORE),  // Right face (+x)
            x === -1 ? mat(this.colors.L) : mat(this.colors.CORE), // Left face (-x)
            y === 1 ? mat(this.colors.U) : mat(this.colors.CORE),  // Top face (+y)
            y === -1 ? mat(this.colors.D) : mat(this.colors.CORE), // Bottom face (-y)
            z === 1 ? mat(this.colors.F) : mat(this.colors.CORE),  // Front face (+z)
            z === -1 ? mat(this.colors.B) : mat(this.colors.CORE), // Back face (-z)
        ];
    }

    // Get cubies on a specific face (by their CURRENT world position)
    getFaceCubies(face) {
        const epsilon = 0.15;
        const axis = this.getFaceAxis(face);
        
        return this.cubies.filter(cubie => {
            // Get world position (accounting for parent group rotation)
            const worldPos = new THREE.Vector3();
            cubie.getWorldPosition(worldPos);
            
            // Check if this cubie is on the target face layer
            const targetValue = axis.direction * 1.02;
            const currentValue = worldPos[axis.coordinate];
            
            return Math.abs(currentValue - targetValue) < epsilon;
        });
    }

    getFaceAxis(face) {
        switch(face) {
            case 'U': return { coordinate: 'y', direction: 1, axis: new THREE.Vector3(0, 1, 0) };
            case 'D': return { coordinate: 'y', direction: -1, axis: new THREE.Vector3(0, -1, 0) };
            case 'F': return { coordinate: 'z', direction: 1, axis: new THREE.Vector3(0, 0, 1) };
            case 'B': return { coordinate: 'z', direction: -1, axis: new THREE.Vector3(0, 0, -1) };
            case 'R': return { coordinate: 'x', direction: 1, axis: new THREE.Vector3(1, 0, 0) };
            case 'L': return { coordinate: 'x', direction: -1, axis: new THREE.Vector3(-1, 0, 0) };
            default: return { coordinate: 'y', direction: 1, axis: new THREE.Vector3(0, 1, 0) };
        }
    }

    // Rotate a face: face = 'U','D','F','B','R','L', direction = 1 (clockwise) or -1 (counter)
    rotateFace(face, direction = 1, duration = 0.3) {
        if (this.isAnimating) return;
        this.isAnimating = true;

        // Record move for history
        this.moveHistory.push({ face, dir: direction });

        const faceCubies = this.getFaceCubies(face);
        const faceAxis = this.getFaceAxis(face);
        
        // Create pivot at center of the face layer
        const pivot = new THREE.Group();
        
        // Position pivot at the center of rotation
        const pivotPos = new THREE.Vector3();
        if (face === 'U' || face === 'D') pivotPos.set(0, faceAxis.direction * 1.02, 0);
        else if (face === 'F' || face === 'B') pivotPos.set(0, 0, faceAxis.direction * 1.02);
        else if (face === 'R' || face === 'L') pivotPos.set(faceAxis.direction * 1.02, 0, 0);
        
        pivot.position.copy(pivotPos);
        this.group.add(pivot);

        // Move cubies from main group to pivot (maintaining world transform)
        faceCubies.forEach(cubie => {
            // Save current world transform
            const worldPos = new THREE.Vector3();
            const worldQuat = new THREE.Quaternion();
            const worldScale = new THREE.Vector3();
            
            cubie.matrixWorld.decompose(worldPos, worldQuat, worldScale);
            
            // Remove from main group
            this.group.remove(cubie);
            
            // Add to pivot
            pivot.add(cubie);
            
            // Restore world transform (now relative to pivot)
            cubie.position.copy(worldPos).sub(pivotPos);
            cubie.quaternion.copy(worldQuat);
            cubie.scale.copy(worldScale);
        });

        // Animate rotation
        const targetAngle = (Math.PI / 2) * direction;
        
        gsap.to(pivot.rotation, {
            x: faceAxis.axis.x * targetAngle,
            y: faceAxis.axis.y * targetAngle,
            z: faceAxis.axis.z * targetAngle,
            duration: duration,
            ease: "power2.inOut",
            onComplete: () => {
                // Apply final rotation
                pivot.updateMatrixWorld();
                
                // Move cubies back to main group with updated transforms
                faceCubies.forEach(cubie => {
                    // Get final world transform
                    const finalWorldPos = new THREE.Vector3();
                    const finalWorldQuat = new THREE.Quaternion();
                    const finalWorldScale = new THREE.Vector3();
                    
                    cubie.matrixWorld.decompose(finalWorldPos, finalWorldQuat, finalWorldScale);
                    
                    // Remove from pivot
                    pivot.remove(cubie);
                    
                    // Add back to main group
                    this.group.add(cubie);
                    
                    // Set new position (world space)
                    cubie.position.copy(finalWorldPos);
                    cubie.quaternion.copy(finalWorldQuat);
                    cubie.scale.copy(finalWorldScale);
                    
                    // Snap to grid (round to nearest 1.02 spacing)
                    cubie.position.x = Math.round(cubie.position.x / 1.02) * 1.02;
                    cubie.position.y = Math.round(cubie.position.y / 1.02) * 1.02;
                    cubie.position.z = Math.round(cubie.position.z / 1.02) * 1.02;
                    
                    // Snap rotation to nearest 90 degrees
                    const euler = new THREE.Euler().setFromQuaternion(cubie.quaternion);
                    euler.x = Math.round(euler.x / (Math.PI/2)) * (Math.PI/2);
                    euler.y = Math.round(euler.y / (Math.PI/2)) * (Math.PI/2);
                    euler.z = Math.round(euler.z / (Math.PI/2)) * (Math.PI/2);
                    cubie.quaternion.setFromEuler(euler);
                });
                
                // Clean up pivot
                this.group.remove(pivot);
                this.isAnimating = false;
            }
        });
    }

    // Undo last move
    undo() {
        if (this.moveHistory.length === 0 || this.isAnimating) return;
        
        const lastMove = this.moveHistory.pop();
        this.rotateFace(lastMove.face, -lastMove.dir);
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

        let i = 0;
        const executeNext = () => {
            if (i >= moves.length) return;
            
            const move = moves[i++];
            this.rotateFace(move.face, move.dir, 0.15);
            setTimeout(executeNext, 250);
        };
        
        executeNext();
    }

    // Solve: reset to solved state
    solve() {
        if (this.isAnimating) return;
        
        // Remove all cubies
        this.cubies.forEach(cubie => {
            this.group.remove(cubie);
            cubie.geometry.dispose();
            cubie.material.forEach(m => m.dispose());
        });
        this.cubies = [];
        this.moveHistory = [];
        
        // Reset group rotation with animation
        gsap.to(this.group.rotation, {
            x: 0, y: 0, z: 0,
            duration: 0.5
        });
        
        // Recreate solved cube
        this.createCube();
    }

    // Get current state as string (for save/share)
    getState() {
        return this.moveHistory.map(m => m.face + (m.dir === -1 ? "'" : "")).join(' ');
    }
}
