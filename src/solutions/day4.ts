import { SolutionModule } from '../types';

// Define the logic
const solution: SolutionModule = {
    tests: [
        { input: `..@@.@@@@.
@@@.@.@.@@
@@@@@.@.@@
@.@@@@..@.
@@.@@@@.@@
.@@@@@@@.@
.@.@.@.@@@
@.@@@.@@@@
.@@@@@@@@.
@.@.@@@.@.`, expected_part1: 13, expected_part2: 43 }
    ],

    solve_part1: async (input: string) => {
        const merp:Array<Array<string>> = input.split('\n').map(line => line.split(''));
        let answer = 0;
        for (let y=0; y<merp.length; y++) {
            for (let x=0; x<merp[y].length; x++) {
                if (merp[y][x] !== '@') continue;
                let neighbors = 0;
                for (let dy=-1; dy<=1; dy++) {
                    for (let dx=-1; dx<=1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const ny = y + dy;
                        const nx = x + dx;
                        if (ny >= 0 && ny < merp.length && nx >= 0 && nx < merp[y].length) {
                            if (merp[ny][nx] === '@') neighbors++;
                        }
                    }
                }
                if (neighbors < 4) answer++;
            }
        }
        return answer;
    },

    solve_part2: async (input: string) => {
        let merp:Array<Array<string>> = input.split('\n').map(line => line.split(''));
        let answer = 0;
        let found_any = true;
        while (found_any) {
            found_any = false;
            for (let y=0; y<merp.length; y++) {
                for (let x=0; x<merp[y].length; x++) {
                    if (merp[y][x] !== '@') continue;
                    let neighbors = 0;
                    for (let dy=-1; dy<=1; dy++) {
                        for (let dx=-1; dx<=1; dx++) {
                            if (dx === 0 && dy === 0) continue;
                            const ny = y + dy;
                            const nx = x + dx;
                            if (ny >= 0 && ny < merp.length && nx >= 0 && nx < merp[y].length) {
                                if (merp[ny][nx] === '@') neighbors++;
                            }
                        }
                    }
                    if (neighbors < 4) {
                        answer++;
                        found_any = true;
                        merp[y][x] = '.'; // Mark as removed
                    }
                }
            }
        }
        return answer;
    }
};


export default solution;