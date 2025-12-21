import { Worker } from 'worker_threads';
import path from 'path';
import os from 'os';
import { EventEmitter } from 'events';
import { WorkerTask, WorkerMessage } from './types';

export class WorkerPool extends EventEmitter {
    private queue: WorkerTask[] = [];
    private activeWorkers = 0;
    private maxWorkers: number;

    constructor() {
        super();
        const cpus = os.cpus().length;
        // Constraint: Leave 2 cores free, but ensure at least 1 worker
        this.maxWorkers = Math.max(1, cpus - 2);
        // console.log(`WorkerPool initialized with size: ${this.maxWorkers}`);
    }

    // Add a task to the queue
    public runTask(task: WorkerTask) {
        // console.log(`[WorkerPool] Adding task for day: ${task.day}, Queue size before: ${this.queue.length}, Active workers: ${this.activeWorkers}/${this.maxWorkers}`);
        this.queue.push(task);
        this.processNext();
    }

    private processNext() {
        if (this.queue.length === 0) {
            // console.log(`[WorkerPool] Queue is empty, nothing to process`);
            return;
        }
        if (this.activeWorkers >= this.maxWorkers) {
            // console.log(`[WorkerPool] Max workers reached (${this.activeWorkers}/${this.maxWorkers}), waiting...`);
            return;
        }

        const task = this.queue.shift()!;
        // console.log(`[WorkerPool] Processing task for day: ${task.day}, Active workers now: ${this.activeWorkers + 1}/${this.maxWorkers}`);
        this.activeWorkers++;

        this.spawnWorker(task);
    }

    private spawnWorker(task: WorkerTask) {
        // We point to a worker wrapper that registers ts-node
        const workerScript = path.join(__dirname, 'workerRunner.js');
        
        const worker = new Worker(workerScript, {
            workerData: task
        });

        // Forward messages from Worker to Server (which sends to Frontend)
        worker.on('message', (msg: WorkerMessage) => {
            this.emit('message', { day: task.day, ...msg });
        });

        worker.on('error', (err: Error) => {
            this.emit('message', { day: task.day, type: 'error', error: err.message });
        });

        worker.on('exit', () => {
            this.activeWorkers--;
            this.processNext(); // Worker freed up, check queue
        });
    }
}