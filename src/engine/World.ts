import { SocialGraph } from './SocialGraph.js';
import { WorldGrid } from './WorldGrid.js';
import { InstitutionGraph } from './InstitutionGraph.js';
import { AgingSystem } from './systems/AgingSystem.js';
import { DecisionSystem } from './systems/DecisionSystem.js';
import { EconomySystem } from './systems/EconomySystem.js';
import { MotionSystem } from './systems/MotionSystem.js';
import { LandSystem } from './systems/LandSystem.js';
import { BuildingSystem } from './systems/BuildingSystem.js';
import { StatsSystem } from './systems/StatsSystem.js';
import { CrimeSystem } from './systems/CrimeSystem.js';
import { EventSystem } from './systems/EventSystem.js';
import { WeatherSystem } from './systems/WeatherSystem.js';
import type { WorldState, GameEvent, SystemContext } from './types.js';

export class World {
    socialGraph: SocialGraph;
    grid: WorldGrid;
    institutionGraph: InstitutionGraph;
    state: WorldState;

    agingSystem: AgingSystem;
    decisionSystem: DecisionSystem;
    economySystem: EconomySystem;
    motionSystem: MotionSystem;
    landSystem: LandSystem;
    buildingSystem: BuildingSystem;
    statsSystem: StatsSystem;
    crimeSystem: CrimeSystem;
    eventSystem: EventSystem;
    weatherSystem: WeatherSystem;

    constructor(initialState?: WorldState) {
        if (initialState) {
            this.state = initialState;
        } else {
            this.state = {
                people: {},
                grid: [], // Will be filled by WorldGrid
                buildings: {},
                institutions: {},
                time: { year: 1, week: 1, day: 1, hour: 8, isNight: false },
                weather: 'clear',
                events: [],
                lists: {
                    govtFunds: 1000,
                    taxRate: 0.1
                }
            };
        }

        this.socialGraph = new SocialGraph(this.state.people);
        this.grid = new WorldGrid(this.state.grid.length > 0 ? this.state.grid : undefined);
        // Sync state grid with class grid if it was generated
        if (this.state.grid.length === 0) {
            this.state.grid = this.grid.cells;
        }

        this.institutionGraph = new InstitutionGraph(this.state.institutions);

        this.agingSystem = new AgingSystem();
        this.decisionSystem = new DecisionSystem();
        this.economySystem = new EconomySystem();
        this.motionSystem = new MotionSystem();
        this.landSystem = new LandSystem();
        this.buildingSystem = new BuildingSystem();
        this.statsSystem = new StatsSystem();
        this.crimeSystem = new CrimeSystem();
        this.eventSystem = new EventSystem();
        this.weatherSystem = new WeatherSystem();
    }

    toJSON(): WorldState {
        return this.state;
    }

    loadState(newState: WorldState) {
        this.state = newState;

        // Handle hydration from older saves that lack new time properties
        if (this.state.time.day === undefined) this.state.time.day = 1;
        if (this.state.time.hour === undefined) this.state.time.hour = 8;

        // Re-link graphs to new state
        this.socialGraph = new SocialGraph(this.state.people);
        this.grid = new WorldGrid(this.state.grid);
        this.institutionGraph = new InstitutionGraph(this.state.institutions);
    }

    tick() {
        // Time Progression: 1 tick = 1 hour (User requested slower days)
        this.state.time.hour += 1;

        let isNewDay = false;
        let isNewWeek = false;
        let isNewYear = false;

        if (this.state.time.hour >= 24) {
            this.state.time.hour -= 24;
            this.state.time.day++;
            isNewDay = true;

            if (this.state.time.day > 7) {
                this.state.time.day = 1;
                this.state.time.week++;
                isNewWeek = true;

                if (this.state.time.week > 52) {
                    this.state.time.week = 1;
                    this.state.time.year++;
                    isNewYear = true;

                    // Increment ages yearly
                    Object.values(this.state.people).forEach(p => {
                        if (p.isAlive) p.age++;
                    });
                }
            }
        }

        // Night is roughly 20:00 (8 PM) to 08:00 (8 AM)
        this.state.time.isNight = this.state.time.hour >= 20 || this.state.time.hour < 8;

        const context: SystemContext = { isNewDay, isNewWeek, isNewYear };

        // Process systems with context
        this.agingSystem.process(this, context);
        this.decisionSystem.process(this, context);
        this.economySystem.process(this, context);
        this.landSystem.process(this, context);
        this.buildingSystem.process(this, context);
        this.crimeSystem.process(this, context);
        this.eventSystem.process(this, context);
        this.motionSystem.process(this, context);
        this.statsSystem.process(this, context);
        this.weatherSystem.process(this, context);

        if (isNewDay) {
            console.log(`Day ${this.state.time.day}, Week ${this.state.time.week}, Year ${this.state.time.year} - Weather: ${this.state.weather}`);
        }
    }

    logEvent(event: GameEvent) {
        this.state.events.push(event);
        // Keep log size manageable?
        if (this.state.events.length > 1000) {
            this.state.events.shift();
        }
    }
}
