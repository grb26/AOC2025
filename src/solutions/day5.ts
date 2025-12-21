import { SolutionModule } from '../types';

// Define the logic
const solution: SolutionModule = {
    tests: [
        { input: `3-5
10-14
16-20
12-18

1
5
8
11
17
32`, expected_part1: 3, expected_part2: 14 }
    ],

    solve_part1: async (input: string) => {
        type Range = { start: number, end: number };
        const lines = input.split('\n');
        const ranges: Range[] = lines.slice(0, lines.indexOf('')).map(range => {
            const [start, end] = range.split('-').map(Number);
            return { start, end };
        });
        const items = lines.slice(lines.indexOf('') + 1).map(Number);

        let answer = 0;
        for (const item of items) {
            for (const range of ranges) {
                if (item >= range.start && item <= range.end) {
                    answer++;
                    break;
                }
            }
        }
        return answer;
    },

    solve_part2: async (input: string) => {
        type Range = { start: number, end: number };
        const lines = input.split('\n');
        let ranges: Range[] = lines.slice(0, lines.indexOf('')).map(range => {
            const [start, end] = range.split('-').map(Number);
            return { start, end };
        });

        // Sort ranges by start position
        ranges.sort((a, b) => a.start - b.start);

        // Merge overlapping ranges
        const merged: Range[] = [];
        for (const range of ranges) {
            if (merged.length === 0 || merged[merged.length - 1].end < range.start - 1) {
                merged.push(range);
            } else {
                merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, range.end);
            }
        }

        // Count total items covered
        let answer = 0;
        for (const range of merged) {
            answer += (range.end - range.start + 1);
        }
        return answer;
    }
};


export default solution;