import { SolutionModule } from '../types';

// Define the logic
const solution: SolutionModule = {
    tests: [
        { input: "11-22,95-115,998-1012,1188511880-1188511890,222220-222224,1698522-1698528,446443-446449,38593856-38593862,565653-565659,824824821-824824827,2121212118-2121212124", expected_part1: 1227775554, expected_part2: 4174379265 }
    ],

    solve_part1: async (input: string) => {

        // Process the input
        type range = { startstr: string; endstr: string; startn: number; endn: number; };
        const ranges:[range] = input.split(',')
                                    .map(line => line.trim())
                                    .map(line => {
                                        const [start, end] = line.split('-');
                                        return { startstr: start, endstr: end, startn: Number(start), endn: Number(end) };
                                    }) as [range];
        // Find the answer!
        let answer = 0;
        for (const r of ranges) {
            let candidate = r.startn;
            while (candidate <= r.endn) {
                const candidateStr = candidate.toString();
                if (candidateStr.length % 2 == 1) {
                    candidate = Math.pow(10, candidateStr.length);
                } else {
                    const halfway = candidateStr.length / 2;
                    const left = candidateStr.slice(0, halfway);
                    candidate = Number(left + left);
                    if (candidate <= r.endn && candidate >= r.startn) { 
                        answer += candidate; 
                    }
                    candidate = (Number(left) + 1) * Math.pow(10, halfway);
                }
            }
        }
        return answer;
    },

    solve_part2: async (input: string) => {
        // Process the input
        type range = { startstr: string; endstr: string; startn: number; endn: number; };
        const input_ranges:range[] = input.split(',')
                                    .map(line => line.trim())
                                    .map(line => {
                                        const [start, end] = line.split('-');
                                        return { startstr: start, endstr: end, startn: Number(start), endn: Number(end) };
                                    }) as range[];

        let my_ranges: range[] = [];
        for (const r of input_ranges) {
            if (r.startstr.length == r.endstr.length) { my_ranges.push(r); }
            else {
                // Split into multiple ranges
                for (let len = r.startstr.length; len <= r.endstr.length; len += 1) {
                    if (len == r.startstr.length) {
                        const maxStr = '9'.repeat(len);
                        my_ranges.push({ startstr: r.startstr, endstr: maxStr, startn: r.startn, endn: Number(maxStr) });
                    } else if (len == r.endstr.length) {
                        const minStr = '1' + '0'.repeat(len - 1);
                        my_ranges.push({ startstr: minStr, endstr: r.endstr, startn: Number(minStr), endn: r.endn });
                    } else {
                        const minStr = '1' + '0'.repeat(len - 1);
                        const maxStr = '9'.repeat(len);
                        my_ranges.push({ startstr: minStr, endstr: maxStr, startn: Number(minStr), endn: Number(maxStr) });
                    }
                }
            }
        }

        // Find the answer!
        let answer = 0;
        let already_found:string[] = [];
        for (const r of my_ranges) {
            const numlen = r.startstr.length;
            for (let i = 1; i <= Math.floor(numlen/2); i += 1) {
                if (numlen % i == 0) {
                    const repeats = numlen / i;
                    let fragment = r.startstr.slice(0, i);
                    let candidateStr = fragment.repeat(repeats);
                    while ( Number(candidateStr) <= r.endn ) {
                        if ( Number(candidateStr) >= r.startn && !already_found.includes(candidateStr) ) {
                            answer += Number(candidateStr);
                            already_found.push(candidateStr);
                        }
                        fragment = Number(fragment) + 1 + '';
                        candidateStr = fragment.repeat(repeats);
                    }
                }
            }
        }
        return answer;
    }
};

export default solution;