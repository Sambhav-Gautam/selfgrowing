import { World } from '../World.js';

export interface WorldStats {
    population: number;
    averageHappiness: number;
    averageWealth: number;
    crimeRate: number; // 0-1 (ratio of high crime propensity or recent crimes)
    homelessCount: number;
}

export class StatsSystem {
    // We can compute this derived state every tick or every X ticks.
    // For now, let's just compute it on demand or store it in world.state.lists?
    // Actually, let's add a 'stats' object to WorldState.lists or top level.
    // user didn't explicitly ask for persistent stats history yet, but HUD needs current values.

    currentStats: WorldStats = {
        population: 0,
        averageHappiness: 0,
        averageWealth: 0,
        crimeRate: 0,
        homelessCount: 0
    };

    process(world: World, _context: { isNewDay: boolean, isNewWeek: boolean, isNewYear: boolean }) {
        // Run every 10 ticks to save perf? Or every tick for responsiveness?
        // Let's run every tick for now, optimizing later if needed.

        const people = world.socialGraph.getAllPeople();
        const livingPeople = people.filter(p => p.isAlive);

        const pop = livingPeople.length;
        if (pop === 0) return;

        let totalHappiness = 0;
        let totalWealth = 0;
        let potentialCriminals = 0;
        let homeless = 0;

        livingPeople.forEach(p => {
            totalHappiness += p.stats.happiness;
            totalWealth += p.stats.wealth;
            if (p.stats.crimePropensity > 50) potentialCriminals++;

            // Check homelessness
            // Simple check: do they own ANY land with a building?
            // checking ownership is O(Grid), slow. 
            // Reuse logic? For now, approximation: if wealth < 10, count as struggling/homeless proxy
            if (p.stats.wealth < 50) homeless++;
        });

        this.currentStats = {
            population: pop,
            averageHappiness: Math.floor(totalHappiness / pop),
            averageWealth: Math.floor(totalWealth / pop),
            crimeRate: Number((potentialCriminals / pop).toFixed(2)),
            homelessCount: homeless
        };
    }

    getStats() {
        return this.currentStats;
    }
}
