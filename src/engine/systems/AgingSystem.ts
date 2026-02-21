import { World } from '../World.js';
import type { Person, ID } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

export class AgingSystem {
    process(world: World, context: { isNewDay: boolean, isNewWeek: boolean, isNewYear: boolean }) {
        if (!context.isNewWeek) return;

        const people = world.socialGraph.getAllPeople();

        people.forEach(person => {
            if (!person.isAlive) return;

            this.handleMortality(person, world);
            // Don't handle reproduction if they just died
            if (person.isAlive) {
                this.handleReproduction(person, world);
            }
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
    }

    handleReproduction(person: Person, world: World) {
        if (person.age < 18 || person.age > 50) return;

        // 1. Romance Logic (Courtship)
        if (!person.partner) {
            // Find a potential partner
            // Heterosexual pairing for now
            const potentialPartner = this.findRandomMate(person, world);
            if (potentialPartner) {
                // Chance to start dating
                if (Math.random() < 0.1) {
                    const rel = person.relationships[potentialPartner];
                    if (!rel) {
                        world.socialGraph.addRelationship(person.id, potentialPartner, 'friend', 10);
                        world.socialGraph.addRelationship(potentialPartner, person.id, 'friend', 10);
                    } else if (rel.value > 50 && rel.type !== 'partner') {
                        // Propose!
                        world.socialGraph.addRelationship(person.id, potentialPartner, 'partner', 100);
                        world.socialGraph.addRelationship(potentialPartner, person.id, 'partner', 100);

                        person.partner = potentialPartner;
                        world.state.people[potentialPartner].partner = person.id;

                        world.logEvent({
                            id: uuidv4(),
                            type: 'socialize',
                            description: `${person.name} and ${world.state.people[potentialPartner].name} started dating.`,
                            date: { ...world.state.time },
                            involvedIds: [person.id, potentialPartner]
                        });
                    } else {
                        // Build relationship
                        rel.value += 5;
                        world.state.people[potentialPartner].relationships[person.id].value += 5;
                    }
                }
            }
        }

        // 2. Pregnancy Logic (Married/Partnered)
        if (person.gender === 'female' && person.partner) {
            const partnerId = person.partner;
            // Removed unused partner retrieval

            // Check stability & happiness
            if (person.needs.food > 50 && person.stats.happiness > 50) {
                // 2% chance per tick if partnered
                if (Math.random() < 0.02) {
                    this.createChild(person, partnerId, world);
                }
            }
        }
    }

    findRandomMate(person: Person, world: World): ID | undefined {
        const candidates = world.socialGraph.getAllPeople().filter(p =>
            p.id !== person.id &&
            p.gender !== person.gender && // Hetero logic for simplicity
            p.age >= 18 &&
            !p.partner && // Single
            Math.abs(p.x - person.x) < 10 && // Close by
            Math.abs(p.y - person.y) < 10
        );
        if (candidates.length > 0) {
            return candidates[Math.floor(Math.random() * candidates.length)].id;
        }
        return undefined;
    }

    createChild(mother: Person, fatherId: ID, world: World) {
        const father = world.state.people[fatherId];
        const childId = uuidv4();

        // Naming: [RandomFirst] [Fatherlastname]
        const firstNames = ['Aria', 'Bael', 'Cian', 'Dara', 'Elian', 'Fae', 'Gael', 'Hana', 'Ian', 'Jael', 'Kael', 'Lia', 'Mara', 'Nial', 'Oryn', 'Pia', 'Quin', 'Ria', 'Sian', 'Tor', 'Una', 'Vim', 'Wyn', 'Xan', 'Yara', 'Zane', 'Ash', 'Birch', 'Cedar', 'Dawn', 'Sky', 'River'];
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];

        let lastName = 'Doe';
        if (father) {
            const parts = father.name.split(' ');
            if (parts.length > 1) lastName = parts[parts.length - 1];
        } else {
            const parts = mother.name.split(' ');
            if (parts.length > 1) lastName = parts[parts.length - 1];
        }

        const childName = `${firstName} ${lastName}`;

        const child: Person = {
            id: childId,
            name: childName,
            age: 0,
            yearBorn: world.state.time.year,
            isAlive: true,
            gender: Math.random() > 0.5 ? 'male' : 'female',
            x: mother.x,
            y: mother.y,
            state: 'idle',
            stats: {
                wealth: 0,
                influence: 0,
                reputation: 0,
                happiness: 100,
                crimePropensity: 0,
                fertility: 0
            },
            relationships: {},
            needs: {
                food: 100,
                safety: 100,
                social: 100,
                rest: 100
            },
            parents: [mother.id, fatherId],
            children: [],
            visuals: this.mixGenetics(mother, father)
        };

        world.socialGraph.addPerson(child);

        // Add relationships
        world.socialGraph.addRelationship(childId, mother.id, 'family', 100);
        world.socialGraph.addRelationship(mother.id, childId, 'family', 100);
        world.socialGraph.addRelationship(childId, fatherId, 'family', 100);
        world.socialGraph.addRelationship(fatherId, childId, 'family', 100);

        // Add to parents' children list
        mother.children.push(childId);
        if (father) father.children.push(childId);

        world.logEvent({
            id: uuidv4(),
            type: 'birth',
            description: `${childName} was born to ${mother.name} and ${father.name}.`,
            date: { ...world.state.time },
            involvedIds: [childId, mother.id, fatherId]
        });
    }
    mixGenetics(mother: Person, father: Person): Person['visuals'] {
        const skinColor = Math.random() > 0.5 ? mother.visuals.skinColor : (father?.visuals.skinColor || mother.visuals.skinColor);
        const hairColor = Math.random() > 0.5 ? mother.visuals.hairColor : (father?.visuals.hairColor || mother.visuals.hairColor);

        const fatherHeight = father?.visuals.height || mother.visuals.height;
        let height = (mother.visuals.height + fatherHeight) / 2;
        height += (Math.random() * 0.1) - 0.05;

        height = Math.max(0.8, Math.min(1.4, height));

        return {
            skinColor,
            hairColor,
            height,
            bodyType: Math.random() > 0.5 ? mother.visuals.bodyType : (father?.visuals.bodyType || 'average')
        };
    }
}
