// The shape of a test case in your solution files
export interface TestCase {
    input: string;
    expected_part1: string | number;
    expected_part2: string | number;
}

// The Registry Pattern: Every day*.ts must export an object matching this interface
export interface SolutionModule {
    tests: TestCase[];
    // solve_part1 and solve_part2 can return a value or a Promise (if it needs to await something)
    solve_part1: (input: string) => string | number | Promise<string | number>;
    solve_part2: (input: string) => string | number | Promise<string | number>;
}

// Messages sent FROM the Main Thread TO the Worker
export interface WorkerTask {
    day: number;
    solutionPath: string; // Absolute path to the day's solution file
}

// Messages sent FROM the Worker TO the Main Thread
export type WorkerMessage = 
    | { type: 'log'; message: string }
    | { type: 'test-start'; count: number; part: 1 | 2 }
    | { type: 'test-result'; success: boolean; index: number; expected: any; actual: any; part: 1 | 2 }
    | { type: 'solve-start'; part: 1 | 2 }
    | { type: 'solve-done'; result: string | number; durationMs: number; part: 1 | 2 }
    | { type: 'error'; error: string };

// Configuration for our Worker Pool
export interface PoolConfig {
    maxWorkers: number;
}