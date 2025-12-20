import { SolutionModule } from '../types';

// Define the logic
const solution: SolutionModule = {
    tests: [
        { input: `L68
L30
R48
L5
R60
L55
L1
L99
R14
L82`, expected: 3 }
    ],
    solve: async (input: string) => {

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
    }
};

export default solution;