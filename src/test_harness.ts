import fs from 'fs';
import path from 'path';
import { SolutionModule } from './types';

const solutionsDir = path.join(__dirname, 'solutions');

// Parse command line arguments
const args = process.argv.slice(2);
const specifiedDay = args[0] ? parseInt(args[0]) : null;

// Get available days
function getAvailableDays(): number[] {
    return fs.readdirSync(solutionsDir)
        .filter(f => f.match(/^day\d+\.ts$/))
        .map(f => {
            const match = f.match(/^day(\d+)\.ts$/);
            return match ? parseInt(match[1]) : 0;
        })
        .filter(n => n > 0)
        .sort((a, b) => a - b);
}

// Run tests for a single day
async function runDayTests(day: number): Promise<boolean> {
    const solutionPath = path.join(solutionsDir, `day${day}.ts`);
    
    if (!fs.existsSync(solutionPath)) {
        console.log(`\n❌ Day ${day}: Solution file not found`);
        return false;
    }

    try {
        const module = require(solutionPath);
        const solution: SolutionModule = module.default || module;

        if (!solution || !solution.solve_part1 || !solution.solve_part2) {
            console.log(`\n❌ Day ${day}: Missing 'solve_part1' or 'solve_part2' functions`);
            return false;
        }

        if (!solution.tests || solution.tests.length === 0) {
            console.log(`\n⚠️  Day ${day}: No tests defined`);
            return true;
        }

        console.log(`\n📋 Day ${day}:`);
        let allTestsPassed = true;

        // Run Part 1 tests
        console.log(`  Part 1 Tests:`);
        for (const [index, test] of solution.tests.entries()) {
            const result = await solution.solve_part1(test.input);
            const success = result == test.expected_part1;
            
            if (success) {
                console.log(`    Test ${index + 1}: ✅ PASSED`);
            } else {
                console.log(`    Test ${index + 1}: ❌ FAILED`);
                console.log(`      Expected: ${test.expected_part1}, Got: ${result}`);
                allTestsPassed = false;
            }
        }

        // Run Part 2 tests
        console.log(`  Part 2 Tests:`);
        for (const [index, test] of solution.tests.entries()) {
            const result = await solution.solve_part2(test.input);
            const success = result == test.expected_part2;
            
            if (success) {
                console.log(`    Test ${index + 1}: ✅ PASSED`);
            } else {
                console.log(`    Test ${index + 1}: ❌ FAILED`);
                console.log(`      Expected: ${test.expected_part2}, Got: ${result}`);
                allTestsPassed = false;
            }
        }

        return allTestsPassed;
    } catch (err: any) {
        console.log(`\n❌ Day ${day}: ${err.message || String(err)}`);
        return false;
    }
}

// Main execution
async function main() {
    const days = specifiedDay ? [specifiedDay] : getAvailableDays();

    if (days.length === 0) {
        console.log('No solution files found');
        process.exit(1);
    }

    if (specifiedDay && !days.includes(specifiedDay)) {
        console.log(`Day ${specifiedDay} not found`);
        process.exit(1);
    }

    console.log(`Running tests for Day${days.length > 1 ? 's' : ''}: ${days.join(', ')}`);

    let totalPassed = 0;
    let totalFailed = 0;

    for (const day of days) {
        const passed = await runDayTests(day);
        if (passed) {
            totalPassed++;
        } else {
            totalFailed++;
        }
    }

    console.log(`\n${'='.repeat(50)}`);
    console.log(`Total: ${totalPassed} passed, ${totalFailed} failed out of ${days.length} days`);
    
    if (totalFailed > 0) {
        process.exit(1);
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
