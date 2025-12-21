import { SolutionModule } from '../types';

// Define the logic
const solution: SolutionModule = {
    tests: [
        { input: `123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   +  `, expected_part1: 4277556, expected_part2: 3263827 }
    ],

    solve_part1: async (input: string) => {
        
        const lines:Array<string> = input.split('\n')
        const nums:Array<Array<number>> = lines.slice(0,-1).map(line => line.split(/\s+/).filter(x => x.length > 0).map(x => Number(x)));
        const ops:Array<string> = lines[lines.length-1].split(/\s+/).filter(x => x.length > 0);

        let answer = 0;

        for (let col=0; col<nums[0].length; col++) {
            if (ops[col] === '*') {
                let subtotal = 1;
                for (let row=0; row<nums.length; row++) {
                    subtotal *= nums[row][col];
                }
                answer += subtotal;
            } else if (ops[col] === '+') {
                let subtotal = 0;
                for (let row=0; row<nums.length; row++) {
                    subtotal += nums[row][col];
                }
                answer += subtotal;
            } else {
                throw new Error(`Unknown operator: ${ops[col]}`);
            }
        }
        
        return answer;
    },

    solve_part2: async (input: string) => {

        const lines:Array<string> = input.split('\n');
        const n_cols:number = Math.max(...lines.map(line => line.length));
        const op_row = lines[lines.length-1];

        let op_cols:Array<number> = [0];
        let blank_cols:Array<number> = [];
        for (let c=1; c<n_cols; c++) {
            if (op_row[c] === '*' || op_row[c] === '+') {
                op_cols.push(c);
                blank_cols.push(c-1);
            }
        }
        blank_cols.push(n_cols);

        let answer = 0;

        for (let i=0; i<op_cols.length; i++) {
            const operator = op_row[op_cols[i]];
            let acc = (operator === '*') ? 1 : 0;
            for (let c=op_cols[i]; c<blank_cols[i]; c++) {
                let num_str = '';
                for (let r=0; r<lines.length-1; r++) {
                    num_str += lines[r][c];
                }
                const num = Number(num_str);
                if (operator === '*') {
                    acc *= num;
                } else {
                    acc += num;
                } 
            }
            answer += acc;
        }
        
        return answer;
    }
};


export default solution;