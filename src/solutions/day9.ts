import { SolutionModule } from '../types';

// Define the logic
const solution: SolutionModule = {
    tests: [
        { input: `7,1
11,1
11,7
9,7
9,5
2,5
2,3
7,3`, expected_part1: 50, expected_part2: 24 }
    ],

    solve_part1: async (input: string) => {
        const tiles = input.split('\n').map(line => line.split(',').map(Number) ) as [number, number][];
        let answer = 0;
        for (const t1 of tiles) {
            for (const t2 of tiles) {
                const area = (1+Math.abs(t1[0]-t2[0])) * (1+Math.abs(t1[1]-t2[1]));
                if (area > answer) {
                    answer = area;
                }
            }
        }
        return answer;
    },

    solve_part2: async (input: string) => {
        const tiles = input.split('\n').map(line => line.split(',').map(Number) ) as [number, number][];
        let answer = 0;

        // Plan: Walk the list of tiles in pairs to define the edges of the tiled area, recording
        // whether a corner is left or right turn. For each edge, one side is red and one blue
        // ...unless another edge is adjecent... which fortunately never happens. 
        // One turn direction will have four more turns, which tells us which colour is the
        // interior of the shape. We can then test all possible rectangles to check that they 
        // don't contain the exterior side of any edge.
        type Coordinate = [number, number];
        type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';
        type Turn = 'L' | 'R';
        const directions:Array<Direction> = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
        const dir:Map<Direction, {dx:number, dy:number}> = new Map([
            ['N', {dx:0, dy:-1}],       // Y axis is row ID, i.e. row 0 is top, so increasing Y goes South
            ['NE', {dx:1, dy:-1}],
            ['E', {dx:1, dy:0}],
            ['SE', {dx:1, dy:1}],
            ['S', {dx:0, dy:1}],
            ['SW', {dx:-1, dy:1}],
            ['W', {dx:-1, dy:0}],
            ['NW', {dx:-1, dy:-1}],
        ]);
        function sign(n:number): number {
            return n < 0 ? -1 : (n > 0 ? 1 : 0);
        }
        function getDirection(from:Coordinate, to:Coordinate): Direction {
            const dx = sign(to[0] - from[0]);
            const dy = sign(to[1] - from[1]);
            for (const [d, vec] of dir.entries()) {
                if (vec.dx == dx && vec.dy == dy) {
                    return d;
                }
            }
            throw new Error(`Cannot determine direction from (${from[0]},${from[1]}) to (${to[0]},${to[1]})`);
        }
        function getTurnDirection(fromDir:Direction, toDir:Direction): Turn {
            const fromIdx = directions.indexOf(fromDir);
            const toIdx = directions.indexOf(toDir);
            const diff = (toIdx - fromIdx + 8) % 8;
            if (diff === 2) return 'R';
            if (diff === 6) return 'L';
            throw new Error(`Invalid turn from ${fromDir} to ${toDir}`);
        }

        function getColours(dir:Direction): {redSide:Direction, blueSide:Direction} {
            const toIdx = directions.indexOf(dir);
            return {redSide:directions[(toIdx + 2) % 8], blueSide:directions[(toIdx + 6) % 8] };
        }

        type Edge = { from:Coordinate, to:Coordinate, direction:Direction, redSide: Direction, blueSide:Direction };
        const edges:Edge[] = [];
        let turnCountL = 0;
        let turnCountR = 0;

        for (let i=0; i<tiles.length; i++) {
            const this_tile = tiles[i];
            const x = this_tile[0];
            const y = this_tile[1];
            const prev_tile = tiles[(i-1+tiles.length) % tiles.length];
            const next_tile = tiles[(i+1) % tiles.length];
            const from_dir = getDirection(prev_tile, this_tile);
            const to_dir = getDirection(this_tile, next_tile);
            const turn: Turn = getTurnDirection(from_dir, to_dir);
            const {redSide, blueSide} = getColours(to_dir);
            edges.push({ from: this_tile, to: next_tile, direction: to_dir, redSide:redSide, blueSide:blueSide });
            
            if (turn === 'L') turnCountL++;
            else turnCountR++;
        }

        // One direction should have four more turns than the other, allowing us to 
        // identify which side of the line is inside the shape, and therefore whether
        // red or blue is the interior.
        const interiorColour:string = (turnCountR > turnCountL) ? 'red' : 'blue';

        // Test pairs of tiles to find the largest rectangle with no external tiles.
        let largestArea = 0;

        for (let i=0; i<tiles.length; i++) {
            const t1 = tiles[i];
            for (let j=i+1; j<tiles.length; j++) {

                const t2 = tiles[j];

                // Lots of edges to check, so more efficient to rule out small rectangles early
                const area = (1+Math.abs(t1[0]-t2[0])) * (1+Math.abs(t1[1]-t2[1]));
                if (area <= largestArea) {
                    continue;
                }

                // Okay, it would be a big one... but is it valid?
                
                // Check for edges within the rectangle
                const xmin = Math.min(t1[0], t2[0]);
                const xmax = Math.max(t1[0], t2[0]);
                const ymin = Math.min(t1[1], t2[1]);
                const ymax = Math.max(t1[1], t2[1]);
                let valid = true;
                for (const edge of edges) {

                    const horz = (edge.direction === 'E' || edge.direction === 'W');
                    const vert = !horz;
                    const vpos = edge.to[1];    // if horizontal, edge.from[1]==edge.to[1]; if not, we will never use this anyway
                    const hpos = edge.to[0];    // ...and vice versa

                    // Edges outside the rectangle are irrelevant
                    if (vert && ( hpos < xmin || hpos > xmax) ) continue;
                    if (horz && ( vpos < ymin || vpos > ymax) ) continue;

                    // Edges on the boundary might be irrelevant, if the exterior colour is on the outside
                    const forbiddenSide = (interiorColour === 'blue') ? edge.redSide : edge.blueSide;
                    if (horz && vpos == ymin && forbiddenSide == 'N') continue;
                    if (horz && vpos == ymax && forbiddenSide == 'S') continue;
                    if (vert && hpos == xmin && forbiddenSide == 'W') continue;
                    if (vert && hpos == xmax && forbiddenSide == 'E') continue;

                    // Even if it overlaps in one axis, it's still irrelevant if it doesn't overlap on the other axis
                    if (horz && edge.to[0] < xmin) continue;
                    if (horz && edge.from[0] > xmax) continue;
                    if (vert && edge.to[1] < ymin) continue;
                    if (vert && edge.from[1] > ymax) continue;

                    // If we got this far, we have bad tiles in the rectangle
                    valid = false;
                    break;

                }
                if (!valid) {
                    continue;
                }

                // If we got this far, it's valid (and we already know it's the biggest found so far)
                largestArea = area;
            }
        }

        answer = largestArea;
        return answer;
    }
};


export default solution;