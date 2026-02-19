import type { ID, Person, Relationship } from './types.js';


export class SocialGraph {
    private people: Record<ID, Person>;

    constructor(initialPeople: Record<ID, Person> = {}) {
        this.people = initialPeople;
    }

    addPerson(person: Person) {
        this.people[person.id] = person;
    }

    getPerson(id: ID): Person | undefined {
        return this.people[id];
    }

    getAllPeople(): Person[] {
        return Object.values(this.people);
    }

    // Create a unidirectional relationship
    addRelationship(fromId: ID, toId: ID, type: Relationship['type'], value: number) {
        const person = this.people[fromId];
        if (!person) return;

        person.relationships[toId] = {
            targetId: toId,
            type,
            value
        };
    }

    // Helper: Get strongest relationships for a person
    getStrongestRelationships(personId: ID, topN: number = 3): Relationship[] {
        const person = this.people[personId];
        if (!person) return [];

        return Object.values(person.relationships)
            .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
            .slice(0, topN);
    }

    // Helper: Find enemies (high negative value)
    getEnemies(personId: ID, threshold: number = -50): ID[] {
        const person = this.people[personId];
        if (!person) return [];

        return Object.values(person.relationships)
            .filter(rel => rel.value <= threshold)
            .map(rel => rel.targetId);
    }
}
