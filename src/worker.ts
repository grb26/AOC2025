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

        if (!solution || !solution.solve) {
            throw new Error(`Day ${day} solution is missing a 'solve' function.`);
        }

        // 2. Run Tests
        if (solution.tests && solution.tests.length > 0) {
            post({ type: 'test-start', count: solution.tests.length });
            
            for (const [index, test] of solution.tests.entries()) {
                const result = await solution.solve(test.input);
                const success = result == test.expected;
                
                post({ 
                    type: 'test-result', 
                    success, 
                    index, 
                    expected: test.expected, 
                    actual: result 
                });

                if (!success) {
                    throw new Error(`Test #${index + 1} Failed. Expected ${test.expected}, got ${result}`);
                }
            }
        }

        // 3. Run Real Solution
        post({ type: 'solve-start' });
        
        // Fetch input (cached)
        const input = await InputManager.getInput(day);

        const start = performance.now();
        const result = await solution.solve(input);
        const end = performance.now();

        post({ 
            type: 'solve-done', 
            result, 
            durationMs: parseFloat((end - start).toFixed(2)) 
        });

    } catch (err: any) {
        post({ type: 'error', error: err.message || String(err) });
    }
}

run();