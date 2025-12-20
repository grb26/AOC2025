// The shape of a test case in your solution files
export interface TestCase {
    input: string;
    expected: string | number;
}

// The Registry Pattern: Every day*.ts must export an object matching this interface
export interface SolutionModule {
    tests: TestCase[];
    // solve can return a value or a Promise (if it needs to await something)
    solve: (input: string) => string | number | Promise<string | number>;
}

// Messages sent FROM the Main Thread TO the Worker
export interface WorkerTask {
    day: number;
    solutionPath: string; // Absolute path to the day's solution file
}

// Messages sent FROM the Worker TO the Main Thread
export type WorkerMessage = 
    | { type: 'log'; message: string }
    | { type: 'test-start'; count: number }
    | { type: 'test-result'; success: boolean; index: number; expected: any; actual: any }
    | { type: 'solve-start' }
    | { type: 'solve-done'; result: string | number; durationMs: number }
    | { type: 'error'; error: string };

// Configuration for our Worker Pool
export interface PoolConfig {
    maxWorkers: number;
}