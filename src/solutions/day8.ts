import { SolutionModule } from '../types';


type Box = { x: number, y: number, z: number };
function distance(b1:Box, b2:Box):number {
    return Math.sqrt( (b1.x - b2.x)**2 + (b1.y - b2.y)**2 + (b1.z - b2.z)**2 );
}
type Connection = { distance:number, b1_idx:number, b2_idx:number };
 
// Define the logic
const solution: SolutionModule = {
    tests: [
        { input: `162,817,812
57,618,57
906,360,560
592,479,940
352,342,300
466,668,158
542,29,236
431,825,988
739,650,466
52,470,668
216,146,977
819,987,18
117,168,530
805,96,715
346,949,466
970,615,88
941,993,340
862,61,35
984,92,344
425,690,689`, expected_part1: 40, expected_part2: 25272 }
    ],

    solve_part1: async (input: string) => {
        const boxes:Array<Box> = input.split('\n').map(line => line.split(',').map(Number)).map( parts => ({ x: parts[0], y: parts[1], z: parts[2] }) );
        const num_conns:number = (boxes.length > 30) ? 1000 : 10;

        // Connect the {n} nearest boxes together
        const connections:Array<Connection> = [];
        for (let i=0; i<boxes.length-1; i++) {
            for (let j=i+1; j<boxes.length; j++) {
                connections.push( { distance: distance(boxes[i], boxes[j]), b1_idx: i, b2_idx: j } );
            }
        }
        connections.sort( (a,b) => a.distance - b.distance ); // smallest distance first

        // Build bi-directional wiring map
        const wirings:Map<number, Set<number>> = new Map();
        for (const conn of connections.slice(0, num_conns)) {
            if (!wirings.has(conn.b1_idx)) wirings.set(conn.b1_idx, new Set());
            if (!wirings.has(conn.b2_idx)) wirings.set(conn.b2_idx, new Set());
            wirings.get(conn.b1_idx)!.add(conn.b2_idx);
            wirings.get(conn.b2_idx)!.add(conn.b1_idx);
        }

        // Identify connected circuits
        const circuits: Array<Set<number>> = [];
        let unevaluated: Set<number> = new Set(wirings.keys());
        while (unevaluated.size > 0) {
            const start_idx:number = unevaluated.keys().next()!.value!;
            const new_circuit: Set<number> = new Set([start_idx]);
            let changed = true;
            while (changed) {
                changed = false;
                for (const n of new_circuit) {
                    for (const m of wirings.get(n)!.values()) {
                        if (!new_circuit.has(m)) {
                            changed = true;
                            new_circuit.add(m)
                        }
                    }
                }
            }
            circuits.push(new_circuit);
            unevaluated = new Set<number>([...unevaluated].filter(x => !new_circuit.has(x)));
        }
        
        // Calculate answer based on largest 3 circuits
        const circuit_sizes: Array<number> = circuits.map( circuit => circuit.size );
        circuit_sizes.sort( (a,b) => b - a ); // largest first
        return circuit_sizes[0]*circuit_sizes[1]*circuit_sizes[2];
    },

    solve_part2: async (input: string) => {

        const boxes:Array<Box> = input.split('\n').map(line => line.split(',').map(Number)).map( parts => ({ x: parts[0], y: parts[1], z: parts[2] }) );
        const connections:Array<Connection> = [];
        for (let i=0; i<boxes.length-1; i++) {
            for (let j=i+1; j<boxes.length; j++) {
                connections.push( { distance: distance(boxes[i], boxes[j]), b1_idx: i, b2_idx: j } );
            }
        }
        connections.sort( (a,b) => a.distance - b.distance ); // smallest distance first
        const box_to_circuit: Map<number, number> = new Map();
        const circuits: Map<number, Set<number>> = new Map();
        let id_counter = 1;
        for (const conn of connections) {
            if (!box_to_circuit.has(conn.b1_idx) && !box_to_circuit.has(conn.b2_idx)) {
                // Neither box is assigned to a circuit yet; create a new circuit
                const new_circuit = new Set([conn.b1_idx, conn.b2_idx]);
                const my_id = id_counter++;
                circuits.set(my_id, new_circuit);
                box_to_circuit.set(conn.b1_idx, my_id);
                box_to_circuit.set(conn.b2_idx, my_id);

            } else if (box_to_circuit.has(conn.b1_idx) && !box_to_circuit.has(conn.b2_idx)) {
                // Box 1 is in a circuit; add box 2 to that circuit
                const circuit_id = box_to_circuit.get(conn.b1_idx)!;
                circuits.get(circuit_id)!.add(conn.b2_idx);
                box_to_circuit.set(conn.b2_idx, circuit_id);

            } else if (!box_to_circuit.has(conn.b1_idx) && box_to_circuit.has(conn.b2_idx)) {
                // Box 2 is in a circuit; add box 1 to that circuit
                const circuit_id = box_to_circuit.get(conn.b2_idx)!;
                circuits.get(circuit_id)!.add(conn.b1_idx);
                box_to_circuit.set(conn.b1_idx, circuit_id);

            } else {
                // Both boxes are already in circuits, so need to merge
                const circuit_id1 = box_to_circuit.get(conn.b1_idx)!;
                const circuit_id2 = box_to_circuit.get(conn.b2_idx)!;
                if (circuit_id1 !== circuit_id2) {
                    // Merge circuit 2 into circuit 1
                    const circuit1 = circuits.get(circuit_id1)!;
                    const circuit2 = circuits.get(circuit_id2)!;
                    for (const box_idx of circuit2) {
                        circuit1.add(box_idx);
                        box_to_circuit.set(box_idx, circuit_id1);
                    }
                    circuits.delete(circuit_id2);
                }
            }

            // Check for success condition: all boxes in one circuit
            if (circuits.size === 1 && box_to_circuit.size === boxes.length) {
                return boxes[conn.b1_idx].x * boxes[conn.b2_idx].x;
            }
        }
  
        throw new Error("Unreachable code reached");
    }
};


export default solution;