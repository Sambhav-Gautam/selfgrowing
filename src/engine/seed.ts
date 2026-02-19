import { World } from './World.js';
import { v4 as uuidv4 } from 'uuid';

export function seedWorld(world: World) {
    console.log('Seeding world...');

    // 1. Locations
    const ashfallId = uuidv4();
    const norvaleId = uuidv4();
    const eldenPortId = uuidv4();

    world.locationGraph.addLocation({
        id: ashfallId,
        name: 'Ashfall',
        description: 'A volcanic region known for its smiths.',
        connections: [],
        coordinates: { x: -5, y: 0, z: 0 }
    });

    world.locationGraph.addLocation({
        id: norvaleId,
        name: 'Norvale',
        description: 'A lush valley with fertile lands.',
        connections: [],
        coordinates: { x: 0, y: 0, z: 0 }
    });

    world.locationGraph.addLocation({
        id: eldenPortId,
        name: 'Elden Port',
        description: 'A coastal trade hub.',
        connections: [],
        coordinates: { x: 5, y: 0, z: 0 }
    });

    // Connect them
    world.locationGraph.connect(ashfallId, norvaleId);
    world.locationGraph.connect(norvaleId, eldenPortId);

    // 2. People
    const karoId = uuidv4();
    const liraId = uuidv4();
    const brenId = uuidv4();

    world.socialGraph.addPerson({
        id: karoId,
        name: 'Karo',
        age: 30,
        isAlive: true,
        gender: 'male',
        locationId: ashfallId,
        stats: { wealth: 50, influence: 80, reputation: 20 },
        relationships: {},
        needs: { food: 100, safety: 80, status: 50 }
    });

    world.socialGraph.addPerson({
        id: liraId,
        name: 'Lira',
        age: 25,
        isAlive: true,
        gender: 'female',
        locationId: norvaleId,
        stats: { wealth: 100, influence: 40, reputation: 90 },
        relationships: {},
        needs: { food: 100, safety: 100, status: 60 }
    });

    world.socialGraph.addPerson({
        id: brenId,
        name: 'Bren',
        age: 40,
        isAlive: true,
        gender: 'male',
        locationId: eldenPortId,
        stats: { wealth: 20, influence: 10, reputation: 5 },
        relationships: {},
        needs: { food: 60, safety: 40, status: 30 }
    });

    // 3. Relationships
    // Karo trusts Lira (+40)
    world.socialGraph.addRelationship(karoId, liraId, 'trust', 40);
    // Karo hates Bren (-80)
    world.socialGraph.addRelationship(karoId, brenId, 'hate', -80);
    // Bren fears Lira (-20)
    world.socialGraph.addRelationship(brenId, liraId, 'fear', -20);

    console.log('World seeded.');
}
