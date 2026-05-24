export class TutorialEngine {
    constructor() {
        this.steps = [
            {
                title: "White Cross",
                desc: "Create the white cross on the UP face. Match edge colors with side centers.",
                move: null // No specific move, just setup
            },
            {
                title: "White Corners",
                desc: "Insert white corner pieces. Use R U R' U' (sexy move) to position corners.",
                move: "sexy"
            },
            {
                title: "Middle Layer",
                desc: "Solve middle edges. Use: U R U' R' U' F' U F (right) or U' L' U L U F U' F' (left)",
                move: "middle"
            },
            {
                title: "Yellow Cross",
                desc: "Create yellow cross on top. Use F R U R' U' F' (fruruf) when you have a line or dot.",
                move: "fruruf"
            },
            {
                title: "OLL - Orient Last Layer",
                desc: "Make all yellow face up. Use R U R' U R U2 R' for the fish pattern.",
                move: "oll"
            },
            {
                title: "PLL - Permute Last Layer",
                desc: "Position last layer pieces. Use T-perm or U-perm algorithms.",
                move: "pll"
            }
        ];
        
        this.current = 0;
        this.onMoveRequest = null; // Callback for requesting moves
    }

    next() {
        if (this.current < this.steps.length - 1) {
            this.current++;
        }
        return this.getCurrent();
    }

    prev() {
        if (this.current > 0) {
            this.current--;
        }
        return this.getCurrent();
    }

    getCurrent() {
        return {
            ...this.steps[this.current],
            index: this.current,
            total: this.steps.length
        };
    }

    reset() {
        this.current = 0;
        return this.getCurrent();
    }

    // Get algorithm for current step
    getAlgorithm() {
        const step = this.steps[this.current];
        const algorithms = {
            sexy: ["R", "U", "R'", "U'"],
            middle: ["U", "R", "U'", "R'", "U'", "F'", "U", "F"],
            fruruf: ["F", "R", "U", "R'", "U'", "F'"],
            oll: ["R", "U", "R'", "U", "R", "U2", "R'"],
            pll: ["R", "U", "R'", "U'", "R'", "F", "R2", "U'", "R'", "U'", "R", "U", "R'", "F'"]
        };
        
        return algorithms[step.move] || null;
    }
}
