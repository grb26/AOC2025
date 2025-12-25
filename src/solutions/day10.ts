import { SolutionModule } from '../types';

type Machine = {lights:Array<boolean>, target:Array<boolean>, wiring:Array<Array<number>>, requirements:Array<number>};
const regex = /\[(.*)\] (.*) \{(.*)\}/;
function parseMachine(spec:string) : Machine {
    const match = spec.match(regex);
    if (match){ 
        const target = match[1].split('').map(char => char==='#');
        const lights = Array<boolean>(target.length).fill(false);
        const wiring = match[2].split(" ").map(stuff => stuff.replace('(','').replace(')',"").split(',').map(Number));
        const requirements = match[3].split(',').map(Number);
        return {lights, target, wiring, requirements};
    }
    else {
        throw new Error(`Cannot parse ${spec} into a machine`);
    }
}

type State = {moves:number, lights:Array<boolean>};
function dump(vals:Array<boolean>):string {
    return vals.map(v => v ? "#" : ".").join('');
}
function dumpwiring(vals:Array<Array<number>>):string {
    return vals.map(v => v.join(',')).join('|');
}
function dumpmemo(vals: Map<string, number>): string {
    return Array.from(vals, ([k, v]) => `${k}:${v}`).join(", ");
}
function getMinMovesLights(m:Machine) : number {
    let best = Infinity;
    const mystate:State = {moves:0, lights:[...m.lights] };     // copy of m.lights, not pointer to original array
    const evalqueue:Array<State> = [mystate];
    const memo:Map<string, number> = new Map([[`${dump(m.lights)}`, 0]]);

    while (evalqueue.length > 0) {
        const state = evalqueue.shift()!;
        if(state.moves >= best) continue;

        // 1. Check whether we're in the target state
        if (state.lights.every((val,i) => val === m.target[i])) {
            best = state.moves;
            continue;
        }

        // 2. If not, press every button and send it back to the queue (unless we've been there before)
        const mymoves = state.moves + 1;
        for (const button of m.wiring) {
            const mylights = [...state.lights];
            for (const i of button) {
                mylights[i] = !mylights[i];
            }
            const mymemostr = dump(mylights);
            if(memo.has(mymemostr) && memo.get(mymemostr)! <= mymoves ) continue;
            memo.set(mymemostr, mymoves);
            evalqueue.push({moves:mymoves, lights:mylights});
        }
    }

    return best;
}

import { solve, equalTo, greaterEq, Model, Constraint, Solution } from "yalps";
function linearSolveJoltage(m:Machine):number {

    const constraints = new Map<string, Constraint>();
    // Will be "press${i}" for number of presses of button i - can't be negative
    // and "joltage${j}" for required value of joltage
    // {
    //   'press0' => { min: 0 },
    //   'press1' => { min: 0 },
    //   'press2' => { min: 0 },
    //   'press3' => { min: 0 },
    //   'press4' => { min: 0 },
    //   'press5' => { min: 0 },
    //   'joltage0' => { equal: 3 },
    //   'joltage1' => { equal: 5 },
    //   'joltage2' => { equal: 4 },
    //   'joltage3' => { equal: 7 }
    // }

    const coefficients = new Map<string, Map<string, number>>();
    // Will be a map of the effect of "press${i}" on each outcome - count of presses,
    // and joltage values (based on wiring spec)
    // {
    //   'press0' => Map(2) { 'presses' => 1, 'joltage3' => 1 },
    //   'press1' => Map(3) { 'presses' => 1, 'joltage1' => 1, 'joltage3' => 1 },
    //   'press2' => Map(2) { 'presses' => 1, 'joltage2' => 1 },
    //   'press3' => Map(3) { 'presses' => 1, 'joltage2' => 1, 'joltage3' => 1 },
    //   'press4' => Map(3) { 'presses' => 1, 'joltage0' => 1, 'joltage2' => 1 },
    //   'press5' => Map(3) { 'presses' => 1, 'joltage0' => 1, 'joltage1' => 1 }
    // }

    for (let i=0; i<m.wiring.length; i++) {
        constraints.set(`press${i}`, greaterEq(0));
        coefficients.set(`press${i}`, new Map<string, number>([["presses",1]]));
        for (const j of m.wiring[i]) {
            coefficients.get(`press${i}`)!.set(`joltage${j}`,1);
        }
    }

    for (let j=0; j<m.requirements.length; j++) {
        constraints.set(`joltage${j}`, equalTo(m.requirements[j]));
    }

    const model: Model = {
        direction: "minimize" as const,
        objective: "presses",
        constraints: constraints,
        variables: coefficients,
        integers: true, 
    };

    const solution: Solution = solve(model);
    // {
    // status: 'optimal',
    // result: 10,
    // variables: [
    //     [ 'press0', 1 ],
    //     [ 'press1', 5 ],
    //     [ 'press3', 1 ],
    //     [ 'press4', 3 ]
    // ]
    // }
    
    let answer = 0;
    for (const vpair of solution.variables) {
        answer += vpair[1];
    }
    return answer;
}

const solution: SolutionModule = {
    tests: [
        { input: `[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}`, expected_part1: 7, expected_part2: 33 }
    ],

    solve_part1: async (input: string) => {
        const machines:[Machine] = input.split('\n').map(parseMachine) as [Machine];
        let answer = 0;
        for (const m of machines) {
            answer += getMinMovesLights(m);
        }
        return answer;
    },

    solve_part2: async (input: string) => {
        const machines:[Machine] = input.split('\n').map(parseMachine) as [Machine];
        let answer = 0;
        for (const m of machines) {
            answer += linearSolveJoltage(m);
        }
        return answer;
    }
};

export default solution;