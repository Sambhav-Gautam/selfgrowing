import { World } from './World.js';
import { v4 as uuidv4 } from 'uuid';
import type { Person } from './types.js';

export function seedWorld(world: World) {
    console.log('Seeding world... (Grid System)');

    // 1. Setup Terrain
    // Create a river
    for (let y = 0; y < 100; y++) {
        world.grid.setCellType(50, y, 'water');
        world.grid.setCellType(51, y, 'water');
    }

    // 2. People & Villages
    const VILLAGE_COUNT = 3;
    const POPULATION_PER_VILLAGE = 20; // Total 60

    const firstNames = ['Aria', 'Bael', 'Cian', 'Dara', 'Elian', 'Fae', 'Gael', 'Hana', 'Ian', 'Jael', 'Kael', 'Lia', 'Mara', 'Nial', 'Oryn', 'Pia', 'Quin', 'Ria', 'Sian', 'Tor', 'Una', 'Vim', 'Wyn', 'Xan', 'Yara', 'Zane', 'Ash', 'Birch', 'Cedar', 'Dawn', 'Elm', 'Fern', 'Glen', 'Hazel', 'Iris', 'Jade', 'Kale', 'Lily', 'Moss', 'Nova', 'Oak', 'Pine', 'Quill', 'Rose', 'Sage', 'Teal', 'Umber', 'Vine', 'Willow', 'Xylo', 'Yew', 'Zephyr'];

    const surNames = ['Smith', 'Baker', 'Miller', 'Cooper', 'Fisher', 'Hunter', 'Carter', 'Wright', 'Turner', 'Mason', 'Hill', 'Wood', 'Stone', 'Rivers', 'Fields', 'Brook', 'Marsh', 'Dale', 'Vale', 'Glen', 'Storm', 'Rain', 'Frost', 'Snow', 'Swift', 'Strong', 'Wise', 'Wild', 'Green', 'Red', 'Blue', 'White', 'Black', 'Grey', 'Brown', 'Gold', 'Silver'];

    // Define village centers
    const villages = [
        { x: 20, y: 20 },
        { x: 80, y: 20 },
        { x: 50, y: 80 }
    ];

    // Build roads for villages
    villages.forEach(v => {
        for (let i = -4; i <= 4; i++) {
            world.grid.setCellType(v.x + i, v.y, 'road');
            world.grid.setCellType(v.x, v.y + i, 'road');
        }
    });

    for (let v = 0; v < VILLAGE_COUNT; v++) {
        const village = villages[v];

        for (let i = 0; i < POPULATION_PER_VILLAGE; i++) {
            const id = uuidv4();
            const gender = i % 2 === 0 ? 'male' : 'female';
            const age = 18 + Math.floor(Math.random() * 25);

            // Position in village
            const x = Math.max(0, Math.min(99, village.x - 8 + Math.floor(Math.random() * 16)));
            const y = Math.max(0, Math.min(99, village.y - 8 + Math.floor(Math.random() * 16)));

            // Name generation
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = surNames[Math.floor(Math.random() * surNames.length)];

            // Wealth Distribution: 10% Rich, 90% Poor
            const isRich = Math.random() < 0.1;
            const wealth = isRich ? 1000 + Math.floor(Math.random() * 2000) : Math.floor(Math.random() * 100);

            const person: Person = {
                id,
                name: `${firstName} ${lastName}`,
                age,
                yearBorn: 1 - age,
                isAlive: true,
                gender: gender as 'male' | 'female',
                x,
                y,
                state: 'idle',
                stats: {
                    wealth,
                    influence: Math.floor(Math.random() * 10),
                    reputation: 0,
                    happiness: 70 + Math.floor(Math.random() * 30),
                    crimePropensity: Math.floor(Math.random() * 10),
                    fertility: gender === 'female' && age < 45 ? 80 : 0
                },
                relationships: {},
                needs: {
                    food: 80 + Math.floor(Math.random() * 20),
                    safety: 100,
                    social: 80,
                    rest: 100
                },
                parents: [],
                children: [],
                visuals: {
                    skinColor: ['#f5d0b0', '#e0ac69', '#8d5524', '#c68642', '#302621', '#ffcc99'][Math.floor(Math.random() * 6)],
                    hairColor: ['#000000', '#4a4a4a', '#e8e8a0', '#a52a2a', '#0a0a0a'][Math.floor(Math.random() * 5)],
                    height: 0.9 + Math.random() * 0.4,
                    bodyType: Math.random() > 0.8 ? 'stocky' : (Math.random() > 0.2 ? 'average' : 'thin')
                }
                // job/residence added below/implicitly undefined
            };

            // Rich people build a house immediately
            if (isRich) {
                const houseId = uuidv4();
                world.state.buildings[houseId] = {
                    id: houseId,
                    type: 'house',
                    x: Math.floor(person.x),
                    y: Math.floor(person.y),
                    ownerId: person.id,
                    employees: [],
                    level: 2 // Estate
                };

                // Ensure they live there
                person.residenceId = houseId;

                const cell = world.grid.getCell(Math.floor(person.x), Math.floor(person.y));
                if (cell) {
                    cell.buildingId = houseId;
                    cell.ownerId = person.id;
                    cell.type = 'grass'; // No houses on water/road
                }
            }

            world.state.people[id] = person;
        }
    }

    console.log(`Seeded ${VILLAGE_COUNT * POPULATION_PER_VILLAGE} agents in ${VILLAGE_COUNT} villages.`);
}
