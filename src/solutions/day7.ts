import { SolutionModule } from '../types';

// Define the logic
const solution: SolutionModule = {
    tests: [
        { input: `.......S.......
...............
.......^.......
...............
......^.^......
...............
.....^.^.^.....
...............
....^.^...^....
...............
...^.^...^.^...
...............
..^...^.....^..
...............
.^.^.^.^.^...^.
...............`, expected_part1: 21, expected_part2: 40 }
    ],

    solve_part1: async (input: string) => {
        
        let lines:Array<Array<String>> = input.split('\n').map(line => line.split(''));

        // Step 1: propagate the tachyon beams downwards
        for (let r=1; r<lines.length; r++) {
            for (let c=0; c<lines[r].length; c++) {
                if (lines[r][c] === '^' && lines[r-1][c] === '|') {
                    if (c > 0 ) lines[r][c-1] = '|';
                    if (c < lines[r].length-1) lines[r][c+1] = '|';
                } else if (lines[r][c] === '.') {
                    if ( lines[r-1][c] === '|' || lines[r-1][c] === 'S') {
                        lines[r][c] = '|';
                    }
                }
            }
        }


        // Step 2: count the number of beam split events
        let answer = 0;
        for (let r=0; r<lines.length; r++) {
            for (let c=0; c<lines[r].length; c++) {
                if (lines[r][c] === '^' && lines[r-1][c] === '|') {
                    answer++;
                }
            }
        }
        return answer;
    },

    solve_part2: async (input: string) => {

        const lines:Array<Array<String>> = input.split('\n').map(line => line.split(''));
        const worlds:Array<Array<number>> = lines.map( line => new Array<number>(line.length).fill(0) );
        worlds[0][lines[0].indexOf('S')] = 1;

        for (let r=1; r<lines.length; r++) {
            for (let c=0; c<lines[r].length; c++) {
                if (lines[r][c] === '.') {
                    worlds[r][c] += worlds[r-1][c];
                } else if (lines[r][c] === '^') {
                    if (c > 0) {
                        worlds[r][c-1] += worlds[r-1][c];
                    }
                    if (c < lines[r].length-1) {
                        worlds[r][c+1] += worlds[r-1][c];
                    }
                }
            }
        }

        return worlds[lines.length-1].reduce( (a,b) => a+b, 0 );
    }
};


export default solution;