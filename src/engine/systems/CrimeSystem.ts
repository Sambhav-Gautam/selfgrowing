import { World } from '../World.js';
import { v4 as uuidv4 } from 'uuid';

export class CrimeSystem {
    process(world: World) {
        const people = world.socialGraph.getAllPeople();

        people.forEach(criminal => {
            if (!criminal.isAlive) return;
            if (criminal.state === 'imprisoned') return;

            // Desperation Factor
            let desperation = 0;
            if (criminal.stats.wealth < 10) desperation += 50; // Broke
            if (criminal.needs.food < 20) desperation += 100; // Starving
            if (!criminal.job) desperation += 20;

            // Base Propensity + Desperation - Happiness
            const crimeChance = (criminal.stats.crimePropensity + desperation) / 2000; // 0.05 max base?

            // Night time increases crime
            const nightFactor = world.state.time.isNight ? 2 : 1;

            if (Math.random() < crimeChance * nightFactor) {
                this.commitCrime(criminal, world);
            }
        });
    }

    commitCrime(criminal: any, world: World) {
        // Find victim: Wealthy preferred
        const people = world.socialGraph.getAllPeople();
        // Filter for local victims?
        const potentialVictims = people.filter(p =>
            p.id !== criminal.id &&
            p.isAlive &&
            Math.abs(p.x - criminal.x) < 10 &&
            Math.abs(p.y - criminal.y) < 10
        );

        if (potentialVictims.length === 0) return;

        // Sort by wealth (Greed)
        potentialVictims.sort((a, b) => b.stats.wealth - a.stats.wealth);
        // Top 3 choices
        const victim = potentialVictims[Math.floor(Math.random() * Math.min(3, potentialVictims.length))];

        // Crime Logic
        const isViolent = criminal.stats.crimePropensity > 80;

        // Guard Check
        // Check victim's employer or if victim is near a guarded building
        let guarded = false;
        // Simple radius check for "Guard" agents
        const guards = people.filter(p => p.job?.title === 'Guard' && Math.abs(p.x - victim.x) < 5 && Math.abs(p.y - victim.y) < 5);
        if (guards.length > 0) guarded = true;

        if (guarded) {
            // High chance to be caught immediately or deterred
            if (Math.random() < 0.8) {
                // Deterred or Caught
                if (Math.random() < 0.5) {
                    this.arrest(criminal, world, 'attempted crime (caught by guards)');
                    return;
                } else {
                    return; // Deterred
                }
            }
        }

        if (isViolent && Math.random() < 0.3) {
            // Assault
            victim.stats.happiness -= 50;
            victim.needs.safety = 0;
            world.logEvent({
                id: uuidv4(),
                type: 'attack',
                description: `${criminal.name} attacked ${victim.name}!`,
                date: { ...world.state.time },
                involvedIds: [criminal.id, victim.id],
                location: { x: criminal.x, y: criminal.y }
            });
        } else {
            // Theft
            if (victim.stats.wealth > 0) {
                const stolen = Math.min(victim.stats.wealth, 50); // Take more now
                victim.stats.wealth -= stolen;
                criminal.stats.wealth += stolen;
                victim.stats.happiness -= 20;

                world.logEvent({
                    id: uuidv4(),
                    type: 'protest', // TODO: Fix type
                    description: `${criminal.name} stole ${stolen} Lumens from ${victim.name}`,
                    date: { ...world.state.time },
                    involvedIds: [criminal.id, victim.id],
                    location: { x: criminal.x, y: criminal.y }
                });
            }
        }

        // Police Catch Chance (Global)
        const catchChance = isViolent ? 0.2 : 0.05;
        if (Math.random() < catchChance) {
            this.arrest(criminal, world, 'crimes (police)');
        }
    }

    arrest(criminal: any, world: World, reason: string) {
        criminal.state = 'imprisoned';
        criminal.x = 0;
        criminal.y = 0;
        world.logEvent({
            id: uuidv4(),
            type: 'arrest',
            description: `${criminal.name} was arrested for ${reason}.`,
            date: { ...world.state.time },
            involvedIds: [criminal.id],
        });
    }
}
