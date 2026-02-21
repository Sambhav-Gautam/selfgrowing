import { World } from './World.js';
import { v4 as uuidv4 } from 'uuid';
import type { Person, Building } from './types.js';

const GRID_SIZE = 200;

export function seedWorld(world: World) {
    console.log('Seeding new 200x200 world...');

    // 1. Geography: River & Sand banks
    // Sine wave river
    for (let y = 0; y < GRID_SIZE; y++) {
        // center around x = 50, with a wide sine wave
        const riverCenter = Math.floor(50 + Math.sin(y / 20) * 15);
        for (let x = riverCenter - 4; x <= riverCenter + 4; x++) {
            world.grid.setCellType(x, y, 'water');
        }
        // Sand banks
        for (let x = riverCenter - 8; x <= riverCenter + 8; x++) {
            const cell = world.grid.getCell(x, y);
            if (cell && cell.type !== 'water') cell.type = 'sand';
        }
    }

    // Forest on the edges
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            if (world.grid.getCell(x, y)?.type === 'grass') {
                // Dense trees at edges
                if (x < 20 || x > 180 || y < 20 || y > 180) {
                    if (Math.random() > 0.6) world.grid.setCellType(x, y, 'forest');
                } else if (Math.random() > 0.96) {
                    // Sparse trees elsewhere
                    world.grid.setCellType(x, y, 'forest');
                }
            }
        }
    }

    // 2. City Center (Plaza)
    const CX = 130; // Shifted center so it doesn't overlap river
    const CY = 100;
    const PLAZA_RADIUS = 15;

    for (let x = CX - PLAZA_RADIUS; x <= CX + PLAZA_RADIUS; x++) {
        for (let y = CY - PLAZA_RADIUS; y <= CY + PLAZA_RADIUS; y++) {
            if (world.grid.getCell(x, y)?.type === 'grass' || world.grid.getCell(x, y)?.type === 'forest') {
                world.grid.setCellType(x, y, 'stone');
            }
        }
    }

    // Main Roads
    for (let i = 0; i < GRID_SIZE; i++) {
        // Vertical Road
        if (world.grid.getCell(CX, i)?.type !== 'water') {
            world.grid.setCellType(CX, i, 'road');
            world.grid.setCellType(CX - 1, i, 'road');
        }
        // Horizontal Road
        if (world.grid.getCell(i, CY)?.type !== 'water') {
            world.grid.setCellType(i, CY, 'road');
            world.grid.setCellType(i, CY - 1, 'road');
        }
    }

    // Helper to spawn a building
    function spawnBuilding(x: number, y: number, type: Building['type'], level: number = 1): string {
        const id = uuidv4();
        world.state.buildings[id] = { id, type, x, y, employees: [], level };
        const cell = world.grid.getCell(x, y);
        if (cell) cell.buildingId = id;
        return id;
    }

    // Core Architecture
    // Government Building in the center-top of plaza
    spawnBuilding(CX, CY - 8, 'government', 3);
    // Hospital in the center-right of plaza
    spawnBuilding(CX + 8, CY, 'hospital', 3);
    // Commercial hubs
    spawnBuilding(CX - 8, CY - 8, 'commercial', 2);
    spawnBuilding(CX + 8, CY + 8, 'commercial', 2);

    // Parks in the inner corners of the stone plaza
    spawnBuilding(CX - 12, CY - 12, 'park', 1);
    spawnBuilding(CX + 12, CY - 12, 'park', 1);
    spawnBuilding(CX - 12, CY + 12, 'park', 1);
    spawnBuilding(CX + 12, CY + 12, 'park', 1);

    // 3. Residential Blocks (Grids)
    const housePlots: { x: number, y: number, isPrime: boolean }[] = [];

    for (let bx = CX - 60; bx <= CX + 60; bx += 10) {
        for (let by = CY - 60; by <= CY + 60; by += 10) {
            // Skip plaza area and water region
            if (Math.abs(bx - CX) < 20 && Math.abs(by - CY) < 20) continue;

            let waterFound = false;
            for (let dx = -2; dx < 12; dx++) {
                if (world.grid.getCell(bx + dx, by)?.type === 'water') waterFound = true;
            }
            if (waterFound) continue;

            // Draw block road outline
            for (let i = 0; i < 10; i++) {
                if (world.grid.getCell(bx + i, by)?.type !== 'water') world.grid.setCellType(bx + i, by, 'road');
                if (world.grid.getCell(bx, by + i)?.type !== 'water') world.grid.setCellType(bx, by + i, 'road');
            }

            // Valid plots in this block
            const isPrime = Math.abs(bx - CX) <= 30 && Math.abs(by - CY) <= 30; // Close to center = prime real estate
            housePlots.push({ x: bx + 2, y: by + 2, isPrime });
            housePlots.push({ x: bx + 7, y: by + 2, isPrime });
            housePlots.push({ x: bx + 2, y: by + 7, isPrime });
            housePlots.push({ x: bx + 7, y: by + 7, isPrime });
        }
    }

    // 4. Agents
    const POPULATION = 150;
    const firstNames = ['Aria', 'Bael', 'Cian', 'Dara', 'Elian', 'Fae', 'Gael', 'Hana', 'Ian', 'Jael', 'Kael', 'Lia', 'Mara', 'Nial', 'Oryn', 'Pia', 'Quin', 'Ria', 'Sian', 'Tor', 'Una', 'Vim', 'Wyn', 'Xan', 'Yara', 'Zane', 'Ash', 'Birch', 'Cedar', 'Dawn', 'Elm', 'Fern', 'Glen', 'Hazel', 'Iris', 'Jade', 'Kale', 'Lily', 'Moss', 'Nova', 'Oak', 'Pine', 'Quill', 'Rose', 'Sage', 'Teal', 'Umber', 'Vine', 'Willow', 'Xylo', 'Yew', 'Zephyr'];
    const surNames = ['Smith', 'Baker', 'Miller', 'Cooper', 'Fisher', 'Hunter', 'Carter', 'Wright', 'Turner', 'Mason', 'Hill', 'Wood', 'Stone', 'Rivers', 'Fields', 'Brook', 'Marsh', 'Dale', 'Vale', 'Glen', 'Storm', 'Rain', 'Frost', 'Snow', 'Swift', 'Strong', 'Wise', 'Wild', 'Green', 'Red', 'Blue', 'White', 'Black', 'Grey', 'Brown', 'Gold'];

    let plotIndex = 0;

    for (let i = 0; i < POPULATION; i++) {
        const id = uuidv4();
        const gender = i % 2 === 0 ? 'male' : 'female';
        const age = 10 + Math.floor(Math.random() * 50);

        const isRich = Math.random() < 0.15;
        const wealth = isRich ? 5000 + Math.floor(Math.random() * 5000) : 50 + Math.floor(Math.random() * 200);

        // Assign to a house plot if available
        let x = CX + Math.floor(Math.random() * 20 - 10);
        let y = CY + Math.floor(Math.random() * 20 - 10);
        let residenceId: string | undefined = undefined;

        // Try to find an appropriate plot
        if (plotIndex < housePlots.length) {
            let foundPlotIdx = plotIndex;
            for (let j = plotIndex; j < Math.min(plotIndex + 30, housePlots.length); j++) {
                if (housePlots[j].isPrime === isRich) {
                    foundPlotIdx = j;
                    break;
                }
            }

            const plot = housePlots[foundPlotIdx];
            // Swap to logically remove it
            const temp = housePlots[plotIndex];
            housePlots[plotIndex] = housePlots[foundPlotIdx];
            housePlots[foundPlotIdx] = temp;

            x = plot.x;
            y = plot.y;

            // Build house
            residenceId = uuidv4();
            world.state.buildings[residenceId] = {
                id: residenceId,
                type: 'house',
                x, y,
                ownerId: id,
                employees: [],
                level: isRich ? 3 : 1
            };
            const cell = world.grid.getCell(x, y);
            if (cell) {
                cell.buildingId = residenceId;
                cell.ownerId = id;
            }
            plotIndex++;
        }

        const person: Person = {
            id,
            name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${surNames[Math.floor(Math.random() * surNames.length)]}`,
            age,
            yearBorn: 1 - age,
            isAlive: true,
            gender: gender as 'male' | 'female',
            x, y,
            state: 'idle',
            stats: {
                wealth,
                influence: Math.floor(Math.random() * 10),
                reputation: 0,
                happiness: 60 + Math.floor(Math.random() * 40),
                crimePropensity: Math.floor(Math.random() * 10),
                fertility: gender === 'female' && age < 45 ? 80 : 0
            },
            relationships: {},
            needs: { food: 100, safety: 100, social: 100, rest: 100 },
            parents: [], children: [],
            visuals: {
                skinColor: ['#f5d0b0', '#e0ac69', '#8d5524', '#c68642', '#302621', '#ffcc99'][Math.floor(Math.random() * 6)],
                hairColor: ['#000000', '#4a4a4a', '#e8e8a0', '#a52a2a', '#0a0a0a'][Math.floor(Math.random() * 5)],
                height: 0.9 + Math.random() * 0.4,
                bodyType: Math.random() > 0.8 ? 'stocky' : (Math.random() > 0.2 ? 'average' : 'thin')
            },
            residenceId
        };

        world.state.people[id] = person;
    }

    console.log(`Seeded fully organized town with 150 agents.`);
}
