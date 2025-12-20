import { SolutionModule } from '../types';

// Define the logic
const solution: SolutionModule = {
    tests: [
        { input: `987654321111111
811111111111119
234234234234278
818181911112111`, expected_part1: 357, expected_part2: 3121910778619 }
    ],

    solve_part1: async (input: string) => {
        return solve_generic(input, 2);
    },

    solve_part2: async (input: string) => {
        return solve_generic(input, 12);
    }
};

function solve_generic(input: string, digits: number): number {
    const banks:string[] = input.split('\n');    
    let answer = 0;
    for (const b of banks) {
        let subtotal = 0;
        let nums = b.split('').map(d => Number(d));
        for (let i=1; i<=digits; i++) {
            const digit = Math.max(...nums.slice(0, nums.length - (digits - i)));
            nums = nums.slice(nums.indexOf(digit)+1);
            subtotal *= 10;
            subtotal += digit;
        }
        answer += subtotal;
    }
    return answer;
}

export default solution;