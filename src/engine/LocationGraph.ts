import type { ID, Location } from './types.js';

export class LocationGraph {
    private locations: Record<ID, Location>;

    constructor(initialLocations: Record<ID, Location> = {}) {
        this.locations = initialLocations;
    }

    addLocation(location: Location) {
        this.locations[location.id] = location;
    }

    getLocation(id: ID): Location | undefined {
        return this.locations[id];
    }

    getAllLocations(): Location[] {
        return Object.values(this.locations);
    }

    connect(fromId: ID, toId: ID) {
        const from = this.locations[fromId];
        const to = this.locations[toId];
        if (!from || !to) return;

        if (!from.connections.includes(toId)) {
            from.connections.push(toId);
        }
        // Assume undirected graph for movement for now, or directed? 
        // "Ashfall --road--> Norvale". It implies directed or undirected. Roads usually 2-way.
        if (!to.connections.includes(fromId)) {
            to.connections.push(fromId);
        }
    }

    getConnections(id: ID): Location[] {
        const loc = this.locations[id];
        if (!loc) return [];
        return loc.connections.map(connId => this.locations[connId]).filter(l => l !== undefined) as Location[];
    }
}
