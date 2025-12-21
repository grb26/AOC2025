import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import fs from 'fs';
import path from 'path';
import { WorkerPool } from './WorkerPool';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const pool = new WorkerPool();

// Serve the UI
app.use(express.static(path.join(__dirname, '../public')));

// Listen for updates from the WorkerPool and broadcast to frontend
pool.on('message', (data) => {
    io.emit('worker-update', data);
});

// Scan for solutions
const solutionsDir = path.join(__dirname, 'solutions');
function getAvailableDays() {
    return fs.readdirSync(solutionsDir)
        .filter(f => f.match(/^day\d+\.ts$/))
        .map(f => {
            const match = f.match(/^day(\d+)\.ts$/);
            return match ? parseInt(match[1]) : 0;
        })
        .sort((a, b) => a - b);
}

io.on('connection', (socket) => {
    // Send list of days immediately on connect
    socket.emit('init', getAvailableDays());

    socket.on('run-all', () => {
        const days = getAvailableDays();
        days.forEach(day => {
            pool.runTask({
                day,
                solutionPath: path.join(solutionsDir, `day${day}.ts`)
            });
        });
    });

    socket.on('run-day', (day: number) => {
        // console.log('Received run-day event for day:', day);
        pool.runTask({
            day,
            solutionPath: path.join(solutionsDir, `day${day}.ts`)
        });
    });
});

server.listen(3000, () => {
    console.log('AoC Runner at http://localhost:3000');
});