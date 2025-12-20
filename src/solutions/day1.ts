import { SolutionModule } from '../types';

// Define the logic
const solution: SolutionModule = {
    tests: [
        { input: "L160", expected_part1: 0, expected_part2: 2 }, 
        { input: `L68
L30
R48
L5
R60
L55
L1
L99
R14
L82`, expected_part1: 3, expected_part2: 6 }
    ],
    solve_part1: async (input: string) => {

        // Process the input
        const input_lines:[string] = input.split('\n').map(line => line.trim()) as [string];
        const instructions:[number] = input_lines.map(n => parseInt(n.replace(/^L/, '-').replace(/^R/, '+'))) as [number];

        let answer = 0;
        let dial = 50;
        for (const inst of instructions) {
            dial += inst;
            dial %= 100;
            if (dial == 0) answer += 1;
        }
        return answer;
    },
    solve_part2: async (input: string) => {
        // Part 2 logic here
        const input_lines:[string] = input.split('\n').map(line => line.trim()) as [string];
        const instructions:[number] = input_lines.map(n => parseInt(n.replace(/^L/, '-').replace(/^R/, '+'))) as [number];

        let answer = 0;
        let dial = 50;
        for (const inst of instructions) {
            answer += Math.abs(Math.trunc(inst/100));
            const net_rotation = inst % 100;
            if (dial > 0 && dial + net_rotation <= 0 
                || dial < 0 && dial + net_rotation >= 0
                || dial > 0 && dial + net_rotation >= 100
                || dial < 0 && dial + net_rotation <= -100
                ) answer += 1;
            dial += net_rotation;
            dial %= 100;
        }
        return answer;
    }
};

export default solution;