import { SolutionModule } from '../types';

function countPaths(node:string, target:string, avoid:string, memo:Map<string, number>, graph:Map<string, Array<string>>) : number {
    if (node === target) return 1;
    if (memo.has(node)) return memo.get(node)!;
    let paths = 0;
    if (!graph.has(node) || node === avoid) return 0;
    for (const next_step of graph.get(node)!) {
        paths += countPaths(next_step, target, avoid, memo, graph);
    }
    memo.set(node, paths);
    return paths;
}

// Define the logic
const solution: SolutionModule = {
    tests: [
        { input: `aaa: you hhh
you: bbb ccc
bbb: ddd eee
ccc: ddd eee fff
ddd: ggg
eee: out
fff: out
ggg: out
hhh: ccc fff iii
iii: out`, expected_part1: 5, expected_part2: 0 },
        { input: `svr: aaa bbb
aaa: fft
fft: ccc
bbb: tty
tty: ccc
ccc: ddd eee
ddd: hub
hub: fff
eee: dac
dac: fff
fff: ggg hhh
ggg: out
hhh: out`, expected_part1: 0, expected_part2: 2 },
    ],

    solve_part1: async (input: string) => {
        // Depth-first seach with memoization - ASSUMES GRAPH IS ACYCLIC, WHICH MAY NOT BE TRUE? ... turn out it is

        const graph = new Map<string, Array<string>>();
        for (const line of input.split('\n')) {
            const [key, vals] = line.split(":");
            const target_list = vals.trim().split(" ");
            graph.set(key.trim(), target_list);
        }

        const answer = countPaths("you", "out", "", new Map<string, number>(), graph);
        return answer;
    },

    solve_part2: async (input: string) => {
        const graph = new Map<string, Array<string>>();
        for (const line of input.split('\n')) {
            const [key, vals] = line.split(":");
            const target_list = vals.trim().split(" ");
            graph.set(key.trim(), target_list);
        }

        const dac_first = countPaths("svr", "dac", "fft", new Map<string, number>(), graph) * countPaths("dac", "fft", "", new Map<string, number>(), graph) * countPaths("fft", "out", "dac", new Map<string, number>(), graph);
        const fft_first = countPaths("svr", "fft", "dac", new Map<string, number>(), graph) * countPaths("fft", "dac", "", new Map<string, number>(), graph) * countPaths("dac", "out", "fft", new Map<string, number>(), graph);
        return dac_first + fft_first;
    }
};

export default solution;