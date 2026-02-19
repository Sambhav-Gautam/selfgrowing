import { World } from '../World.js';
import type { Person, ID } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

export class AgingSystem {
    process(world: World) {
        const people = world.socialGraph.getAllPeople();

        people.forEach(person => {
            if (!person.isAlive) return;

            // Check if birthday (simplified: every 52 weeks we could increment, 
            // but let's just use random update or assume person.age is updated elsewhere?
            // Better: person stores `age` and we increment it.
            // Actually, let's assume `age` is integer years.
            // We can increment it if world.week == 1? 
            // Or just check mortality weekly.

            this.handleMortality(person, world);
            this.handleReproduction(person, world);
        });
    }

    handleMortality(person: Person, world: World) {
        // Base death chance per week
        let deathChance = 0;

        // Age factor
        if (person.age > 50) deathChance += 0.001;
        if (person.age > 70) deathChance += 0.01;
        if (person.age > 90) deathChance += 0.05;

        // Season factor (Winter: weeks 45-52 and 1-10)
        const week = world.state.time.week;
        const isWinter = week > 45 || week < 10;
        if (isWinter) deathChance += 0.002;

        // Needs factor
        if (person.needs.food < 20) deathChance += 0.05;
        if (person.needs.food === 0) deathChance += 0.2;

        // Wealth/Resources mitigation
        // "survivalChance = hospitalLevel + doctorSkill + wealth"
        // Simplified: wealth reduces death chance
        if (person.stats.wealth > 50) deathChance *= 0.8;
        if (person.stats.wealth > 100) deathChance *= 0.5;

        if (Math.random() < deathChance) {
            this.killPerson(person, world, 'natural causes');
        }
    }

    killPerson(person: Person, world: World, cause: string) {
        person.isAlive = false;
        world.logEvent({
            id: uuidv4(),
            type: 'death',
            description: `${person.name} died at age ${person.age} from ${cause}.`,
            date: { ...world.state.time },
            involvedIds: [person.id]
        });

        // TODO: Trigger inheritance / succession logic here or in another system?
        // User said: "If king dies -> graph searches strongest influence -> successor"
        // That sounds like InstitutionSystem job.
    }

    handleReproduction(person: Person, world: World) {
        // Only females give birth in this sim for simplicity of trigger, 
        // or couples.
        if (person.gender !== 'female') return;
        if (person.age < 18 || person.age > 45) return;

        // Check for partner
        const relationships = world.socialGraph.getStrongestRelationships(person.id);
        const partnerRel = relationships.find(r => r.type === 'family' || (r.type === 'trust' && r.value > 80));

        // If no partner, low chance? Or requires partner?
        // "if couple + stable + food -> birth chance"
        if (!partnerRel) return;

        // Stability & Food
        if (person.needs.food < 50) return;
        if (person.needs.safety < 50) return;

        // Birth chance
        // Realistically human gestation is 9 months. 
        // Simplified: 0.005 chance per week?

        if (Math.random() < 0.005) {
            this.createChild(person, partnerRel.targetId, world);
        }
    }

    createChild(mother: Person, fatherId: ID, world: World) {
        const childId = uuidv4();
        const child: Person = {
            id: childId,
            name: `Child of ${mother.name}`, // Generator needed
            age: 0,
            isAlive: true,
            gender: Math.random() > 0.5 ? 'male' : 'female',
            locationId: mother.locationId,
            stats: {
                wealth: 0,
                influence: 0,
                reputation: 0
            },
            relationships: {},
            needs: {
                food: 100,
                safety: 100,
                status: 0
            }
        };

        world.socialGraph.addPerson(child);

        // Add relationships
        world.socialGraph.addRelationship(childId, mother.id, 'family', 100);
        world.socialGraph.addRelationship(mother.id, childId, 'family', 100);
        world.socialGraph.addRelationship(childId, fatherId, 'family', 100);
        world.socialGraph.addRelationship(fatherId, childId, 'family', 100);

        world.logEvent({
            id: uuidv4(),
            type: 'birth',
            description: `${child.name} was born to ${mother.name}.`,
            date: { ...world.state.time },
            involvedIds: [childId, mother.id, fatherId]
        });
    }
}
