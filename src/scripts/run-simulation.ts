import fs from 'fs';
import path from 'path';
import { World } from '../engine/World.js';
import type { WorldState } from '../engine/types.js';
import { seedWorld } from '../engine/seed.js';

// Paths
const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const STATE_FILE = path.join(DATA_DIR, 'world.json');
const HISTORY_FILE = path.join(DATA_DIR, 'history.json');

// Ensure data dir exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Load or Initialize World
let state: WorldState | undefined;
let isNewWorld = false;

if (fs.existsSync(STATE_FILE)) {
    try {
        const raw = fs.readFileSync(STATE_FILE, 'utf-8');
        state = JSON.parse(raw);
        console.log('Loaded existing world state.');
    } catch (e) {
        console.error('Failed to load state, starting fresh.', e);
        isNewWorld = true;
    }
} else {
    console.log('No state found, creating new world.');
    isNewWorld = true;
}

const world = new World(state);

if (isNewWorld) {
    seedWorld(world);
}

console.log(`Starting simulation at Year ${world.state.time.year}, Week ${world.state.time.week}`);

// Run Ticks (e.g., 1 week per run, or configurable)
const TICKS_TO_RUN = 1;

for (let i = 0; i < TICKS_TO_RUN; i++) {
    world.tick();
}

console.log(`Simulation advanced to Year ${world.state.time.year}, Week ${world.state.time.week}`);

// Save State
fs.writeFileSync(STATE_FILE, JSON.stringify(world.toJSON(), null, 2));
console.log(`Saved world state to ${STATE_FILE}`);

// Save History (Append events)
// In a real optimized system, we might separate events per year or something.
// For now, we just dump the events currently in state (which are strictly recent if we trim them)
// OR we append them to a history log.
// World.ts trims events > 1000.
// Let's just save the world state which contains recent events. 
// If we want a permanent history log, we should read history.json, parse, append new events, save.

let history = [];
if (fs.existsSync(HISTORY_FILE)) {
    try {
        history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf-8'));
    } catch (e) { }
}

// Append NEW events since last save?
// Complex to track. For now, let's just assume `state.events` is the log we care about.
// Or we can snapshot the state.

