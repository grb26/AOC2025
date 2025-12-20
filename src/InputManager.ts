import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const CACHE_DIR = path.join(__dirname, 'inputs');

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
    console.log(`Input cache directory not found - creating at ${CACHE_DIR}`);
    fs.mkdirSync(CACHE_DIR);
}

export class InputManager {
    static async getInput(day: number): Promise<string> {
        const filePath = path.join(CACHE_DIR, `day${day}.txt`);

        // 1. Check Cache (File System)
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath, 'utf-8');
        }

        // 2. Fetch from Web
        console.log(`Fetching input for Day ${day} from web...`);
        const session = process.env.AOC_SESSION;
        if (!session) throw new Error("AOC_SESSION cookie missing in .env");

        try {
            const response = await axios.get(`https://adventofcode.com/2025/day/${day}/input`, {
                headers: { Cookie: `session=${session}` }
            });

            const data = typeof response.data === 'string' 
                ? response.data 
                : JSON.stringify(response.data); // Handle edge cases

            // 3. Write to Cache
            fs.writeFileSync(filePath, data.trim());
            return data.trim();
        } catch (error: any) {
            throw new Error(`Failed to fetch input: ${error.message}`);
        }
    }
}