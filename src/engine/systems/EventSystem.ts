import { World } from '../World.js';
import { v4 as uuidv4 } from 'uuid';

export class EventSystem {
    process(world: World) {
        // Run logic less frequently? Every tick is fine for now.

        const stats = world.statsSystem.getStats();
        if (!stats) return;

        // 1. Protests / Riots
        // Trigger: Low Happiness (< 30) AND High Tax (> 20%)?
        if (stats.averageHappiness < 30 && world.state.lists.taxRate > 0.2) {
            // Chance to start a riot
            if (Math.random() < 0.1) {
                this.triggerProtest(world);
            }
        }

        // 2. Famine
        // Random chance (e.g., bad harvest)
        // 1 in 1000 chance per tick
        if (Math.random() < 0.001) {
            this.triggerFamine(world);
        }
    }

    triggerProtest(world: World) {
        world.logEvent({
            id: uuidv4(),
            type: 'protest',
            description: `MASS PROTESTS ERUPT due to unhappiness and high taxes!`,
            date: { ...world.state.time },
            involvedIds: []
        });

        // Consequences: 
        // 1. Damage Buildings?
        // 2. Halt Work (Economy stops?)
        // 3. Violence (Deaths?)

        // Let's damage some random buildings
        const buildings = Object.values(world.state.buildings);
        if (buildings.length > 0) {
            const target = buildings[Math.floor(Math.random() * buildings.length)];
            // Reduce level or destroy?
            // Simplified: Just log it for now, maybe reduce government funds (reparations)
            world.state.lists.govtFunds -= 100;
            // Maybe mark building as damaged in future
            console.log(`Protestors damaged building ${target.id}`);
        }
    }

    triggerFamine(world: World) {
        world.logEvent({
            id: uuidv4(),
            type: 'death', // generic bad event
            description: `FAMINE STRIKES! Crop failures lead to food shortages.`,
            date: { ...world.state.time },
            involvedIds: []
        });

        // Consequences:
        // Reduce everyone's food
        const people = world.socialGraph.getAllPeople();
        people.forEach(p => {
            if (p.isAlive) {
                p.needs.food = Math.max(0, p.needs.food - 50);
                p.stats.happiness -= 20;
            }
        });
    }
}
