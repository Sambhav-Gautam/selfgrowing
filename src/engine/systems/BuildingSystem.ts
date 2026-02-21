import { World } from '../World.js';
import { v4 as uuidv4 } from 'uuid';
import type { Building } from '../types.js';

export class BuildingSystem {
    process(world: World, context: { isNewDay: boolean, isNewWeek: boolean, isNewYear: boolean }) {
        if (!context.isNewDay) return;
        const people = world.socialGraph.getAllPeople();

        people.forEach(owner => {
            if (!owner.isAlive) return;

            // 1. Build House (if homeless and has money)
            // Simplified: if owns land and no building, build house
            const cell = world.grid.getCell(owner.x, owner.y); // Assuming building on current pos
            if (cell && cell.ownerId === owner.id && !cell.buildingId) {
                // Cost: 50
                if (owner.stats.wealth >= 50) {
                    this.constructBuilding(world, owner.x, owner.y, 'house', owner.id);
                    owner.stats.wealth -= 50;
                }
            }
        });

        // Government Construction (Schools, etc)
        // Check govt funds
        if (world.state.lists.govtFunds > 500) {
            // Build random infrastructure if needed?
            // Placeholder logic
        }
    }

    constructBuilding(world: World, x: number, y: number, type: Building['type'], ownerId?: string) {
        const id = uuidv4();
        const building: Building = {
            id,
            type,
            x,
            y,
            ownerId,
            employees: [],
            level: 1
        };

        world.state.buildings[id] = building;

        const cell = world.grid.getCell(x, y);
        if (cell) {
            cell.buildingId = id;
        }

        world.logEvent({
            id: uuidv4(),
            type: 'construction',
            description: `${type} built at ${x},${y}`,
            date: { ...world.state.time },
            involvedIds: ownerId ? [ownerId] : [],
            location: { x, y }
        });
    }
}
