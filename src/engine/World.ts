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
import type { WorldState, GameEvent } from './types.js';

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
                time: { year: 1, week: 1, isNight: false },
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
        // Re-link graphs to new state
        this.socialGraph = new SocialGraph(this.state.people);
        this.grid = new WorldGrid(this.state.grid);
        this.institutionGraph = new InstitutionGraph(this.state.institutions);
    }

    tick() {
        // Toggle Day/Night
        this.state.time.isNight = !this.state.time.isNight;

        if (!this.state.time.isNight) {
            // New Day (Treating 1 DayNight cycle as a "Week" for sim speed?)
            // Or just increment week every 7 cycles? 
            // Let's keep Sim Speed fast: 1 DayNight = 1 Week
            this.state.time.week++;
            if (this.state.time.week > 52) {
                this.state.time.week = 1;
                this.state.time.year++;

                // Increment ages yearly
                Object.values(this.state.people).forEach(p => {
                    if (p.isAlive) p.age++;
                });
            }
        }

        // Process systems
        this.agingSystem.process(this);
        this.economySystem.process(this);
        this.landSystem.process(this);
        this.buildingSystem.process(this);
        this.crimeSystem.process(this);
        this.eventSystem.process(this);
        this.decisionSystem.process(this);
        this.motionSystem.process(this);
        this.statsSystem.process(this);
        this.weatherSystem.process(this);

        console.log(`Week ${this.state.time.week}, Year ${this.state.time.year} - Weather: ${this.state.weather} - Events: ${this.state.events.length}`);
    }

    logEvent(event: GameEvent) {
        this.state.events.push(event);
        // Keep log size manageable?
        if (this.state.events.length > 1000) {
            this.state.events.shift();
        }
    }
}
