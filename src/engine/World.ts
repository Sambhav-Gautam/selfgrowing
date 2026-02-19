import { SocialGraph } from './SocialGraph.js';
import { LocationGraph } from './LocationGraph.js';
import { InstitutionGraph } from './InstitutionGraph.js';
import { AgingSystem } from './systems/AgingSystem.js';
import { DecisionSystem } from './systems/DecisionSystem.js';
import { EconomySystem } from './systems/EconomySystem.js';
import type { WorldState, GameEvent } from './types.js';

export class World {
    socialGraph: SocialGraph;
    locationGraph: LocationGraph;
    institutionGraph: InstitutionGraph;
    state: WorldState;

    agingSystem: AgingSystem;
    decisionSystem: DecisionSystem;
    economySystem: EconomySystem;

    constructor(initialState?: WorldState) {
        if (initialState) {
            this.state = initialState;
        } else {
            this.state = {
                people: {},
                locations: {},
                institutions: {},
                time: { year: 1, week: 1 },
                events: []
            };
        }

        this.socialGraph = new SocialGraph(this.state.people);
        this.locationGraph = new LocationGraph(this.state.locations);
        this.institutionGraph = new InstitutionGraph(this.state.institutions);

        this.agingSystem = new AgingSystem();
        this.decisionSystem = new DecisionSystem();
        this.economySystem = new EconomySystem();
    }

    toJSON(): WorldState {
        return this.state;
    }

    loadState(newState: WorldState) {
        this.state = newState;
        // Re-link graphs to new state
        this.socialGraph = new SocialGraph(this.state.people);
        this.locationGraph = new LocationGraph(this.state.locations);
        this.institutionGraph = new InstitutionGraph(this.state.institutions);
    }

    tick() {
        this.state.time.week++;
        if (this.state.time.week > 52) {
            this.state.time.week = 1;
            this.state.time.year++;

            // Increment ages yearly
            Object.values(this.state.people).forEach(p => {
                if (p.isAlive) p.age++;
            });
        }

        // Process systems
        this.agingSystem.process(this);
        this.economySystem.process(this);
        this.decisionSystem.process(this);

        console.log(`Week ${this.state.time.week}, Year ${this.state.time.year} - Events: ${this.state.events.length}`);
    }

    logEvent(event: GameEvent) {
        this.state.events.push(event);
        // Keep log size manageable?
        if (this.state.events.length > 1000) {
            this.state.events.shift();
        }
    }
}
