import { World } from '../World.js';
import { GRID_SIZE } from '../WorldGrid.js';

export class LandSystem {
    process(world: World) {
        // 1. Land Value dynamics (simple for now)
        // 2. People buying land

        const people = world.socialGraph.getAllPeople();

        people.forEach(person => {
            if (!person.isAlive) return;
            if (person.age < 18) return;

            // Simplified: If wealthy and homeless, buy land
            // Check if they own any land
            const ownedLand = this.getOwnedLand(person.id, world);

            if (ownedLand.length === 0 && person.stats.wealth > 100) {
                // Try to buy land near current position
                this.tryBuyLand(person, world);
            }
        });
    }

    getOwnedLand(ownerId: string, world: World) {
        const owned = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                const cell = world.grid.getCell(x, y);
                if (cell && cell.ownerId === ownerId) {
                    owned.push(cell);
                }
            }
        }
        return owned;
    }

    tryBuyLand(person: any, world: World) {
        const x = person.x;
        const y = person.y;

        // Check current cell
        const cell = world.grid.getCell(x, y);
        if (cell && !cell.ownerId && cell.type === 'grass') {
            const cost = 50; // Base land cost
            if (person.stats.wealth >= cost) {
                person.stats.wealth -= cost;
                cell.ownerId = person.id;
                world.logEvent({
                    id: crypto.randomUUID(), // Assume crypto or uuid import available
                    type: 'construction', // repurpose or add 'purchase'
                    description: `${person.name} bought land at ${x},${y}`,
                    date: { ...world.state.time },
                    involvedIds: [person.id],
                    location: { x, y }
                });
            }
        }
    }
}
