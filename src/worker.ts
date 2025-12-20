import { parentPort, workerData } from 'worker_threads';
import { InputManager } from './InputManager';
import { SolutionModule, WorkerTask, WorkerMessage } from './types';

// Helper to send typed messages back to parent
function post(msg: WorkerMessage) {
    parentPort?.postMessage(msg);
}

async function run() {
    const { day, solutionPath } = workerData as WorkerTask;

    try {
        // 1. Dynamic Import (Registry Pattern)
        // We use require() because it's synchronous and works well with CommonJS/ts-node
        const module = require(solutionPath); 
        
        // Handle "export default" or "module.exports"
        const solution: SolutionModule = module.default || module;

        if (!solution || !solution.solve_part1 || !solution.solve_part2) {
            throw new Error(`Day ${day} solution is missing 'solve_part1' or 'solve_part2' functions.`);
        }

        // Fetch input (cached)
        const input = await InputManager.getInput(day);

        let testsFailed = false;

        // 2. Run Tests for Part 1
        if (solution.tests && solution.tests.length > 0) {
            post({ type: 'test-start', count: solution.tests.length, part: 1 });
            
            for (const [index, test] of solution.tests.entries()) {
                console.log(`Running Day ${day} Part 1 Test #${index + 1}`);
                const result = await solution.solve_part1(test.input);
                const success = result == test.expected_part1;
                
                post({ 
                    type: 'test-result', 
                    success, 
                    index, 
                    expected: test.expected_part1, 
                    actual: result,
                    part: 1
                });

                if (!success) {
                    testsFailed = true;
                }
            }
        }

        // 3. Run Tests for Part 2
        if (solution.tests && solution.tests.length > 0) {
            post({ type: 'test-start', count: solution.tests.length, part: 2 });
            
            for (const [index, test] of solution.tests.entries()) {
                console.log(`Running Day ${day} Part 2 Test #${index + 1}`);
                const result = await solution.solve_part2(test.input);
                const success = result == test.expected_part2;
                
                post({ 
                    type: 'test-result', 
                    success, 
                    index, 
                    expected: test.expected_part2, 
                    actual: result,
                    part: 2
                });

                if (!success) {
                    testsFailed = true;
                }
            }
        }

        // Throw error if any tests failed
        if (testsFailed) {
            throw new Error(`Some tests failed`);
        }

        // 4. Run Real Solution for Part 1
        post({ type: 'solve-start', part: 1 });
        const start1 = performance.now();
        const result1 = await solution.solve_part1(input);
        const end1 = performance.now();

        post({ 
            type: 'solve-done', 
            result: result1, 
            durationMs: parseFloat((end1 - start1).toFixed(2)),
            part: 1
        });

        // 5. Run Real Solution for Part 2
        post({ type: 'solve-start', part: 2 });
        const start2 = performance.now();
        const result2 = await solution.solve_part2(input);
        const end2 = performance.now();

        post({ 
            type: 'solve-done', 
            result: result2, 
            durationMs: parseFloat((end2 - start2).toFixed(2)),
            part: 2
        });

    } catch (err: any) {
        post({ type: 'error', error: err.message || String(err) });
    }
}

run();