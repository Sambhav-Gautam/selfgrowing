import { World } from '../World.js';
import type { Person, ID } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

export class DecisionSystem {
    process(world: World, context: { isNewDay: boolean, isNewWeek: boolean, isNewYear: boolean }) {
        // Decisions and Daily Needs only update once per day
        if (!context.isNewDay) return;

        const people = world.socialGraph.getAllPeople();

        people.forEach(person => {
            if (!person.isAlive) return;

            if (person.age < 5) {
                // Toddlers are fed by parents/community automatically, keep food high
                person.needs.food = 100;
                return;
            }

            // Decrement needs (hunger) daily
            person.needs.food -= 10;
            if (person.needs.food < 0) person.needs.food = 0;

            // 1. Needs
            // 2. Emotions (Social Graph)
            // 3. Opportunities (Location)
            // 4. Power (Institution)

            this.makeDecision(person, world);
        });
    }

    makeDecision(person: Person, world: World) {
        // Check Needs
        if (person.needs.food < 20) {
            // High priority: Get Food
            return this.attemptGetFood(person);
        }

        // Check Enemies (Emotions)
        const enemies = world.socialGraph.getEnemies(person.id);
        if (enemies.length > 0) {
            // Action: Attack or Plot?
            // Random chance to act on hate depending on aggression/fear?
            // Simplified: 2% chance to attack enemy per week
            if (Math.random() < 0.02) {
                const targetId = enemies[Math.floor(Math.random() * enemies.length)];
                return this.performAction(person, 'attack', targetId, world);
            }
        }

        // Check Ambition (Power)
        // TODO: Integration with InstitutionGraph

        // Default: Work / Socialize
        if (Math.random() < 0.3) {
            // Socialize with random person in same location
            const neighbors = world.socialGraph.getAllPeople().filter(p => p.x === person.x && p.y === person.y && p.id !== person.id && p.isAlive);
            if (neighbors.length > 0) {
                const target = neighbors[Math.floor(Math.random() * neighbors.length)];
                return this.performAction(person, 'socialize', target.id, world);
            }
        }
    }

    performAction(actor: Person, action: string, targetId: ID | null, world: World) {
        const target = targetId ? world.socialGraph.getPerson(targetId) : null;

        if (action === 'attack' && target) {
            world.logEvent({
                id: uuidv4(),
                type: 'attack',
                description: `${actor.name} attacked ${target.name}!`,
                date: { ...world.state.time },
                involvedIds: [actor.id, target.id]
            });

            // Victim hates attacker
            const existingHate = target.relationships[actor.id]?.value || 0;
            world.socialGraph.addRelationship(target.id, actor.id, 'enemy', existingHate - 50);

            // Chance to kill
            if (Math.random() < 0.1) {
                // Use AgingSystem to kill (assuming it exposes killPerson or we duplicate logic)
                // Accessing public method killPerson on AgingSystem
                world.agingSystem.killPerson(target, world, `murder by ${actor.name}`);
            }
        }

        if (action === 'socialize' && target) {
            // Only log sometimes to avoid spam
            if (Math.random() < 0.1) {
                world.logEvent({
                    id: uuidv4(),
                    type: 'socialize',
                    description: `${actor.name} chatted with ${target.name}.`,
                    date: { ...world.state.time },
                    involvedIds: [actor.id, target.id]
                });
            }
            // Update relationships: Mutual trust increase
            const actorToTarget = actor.relationships[target.id]?.value || 0;
            const targetToActor = target.relationships[actor.id]?.value || 0;

            world.socialGraph.addRelationship(actor.id, target.id, 'friend', actorToTarget + 2);
            world.socialGraph.addRelationship(target.id, actor.id, 'friend', targetToActor + 2);
        }
    }

    attemptGetFood(person: Person) {
        // Simplified: Foraging/Work
        person.needs.food = 100;
        person.stats.wealth += 1; // Small earning
    }
}
