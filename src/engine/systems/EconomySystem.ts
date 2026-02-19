import { World } from '../World.js';


export class EconomySystem {
    process(world: World) {
        const people = world.socialGraph.getAllPeople();

        people.forEach(person => {
            if (!person.isAlive) return;

            // 1. Consumption
            // Food costs money if you don't have it? 
            // Simplified: If needs.food is low, spend money to buy food.
            if (person.needs.food < 50 && person.stats.wealth > 0) {
                const cost = 5;
                if (person.stats.wealth >= cost) {
                    person.stats.wealth -= cost;
                    person.needs.food += 20;
                }
            }

            // 2. Influence Decay/Growth
            // Influence decays naturally if not maintained
            if (person.stats.influence > 0 && Math.random() < 0.1) {
                person.stats.influence -= 1;
            }

            // Roles grant influence
            // TODO: Check InstitutionGraph for roles this person holds
            // For now, let's assume if they have high wealth, influence grows
            if (person.stats.wealth > 100 && Math.random() < 0.1) {
                person.stats.influence += 1;
            }

            // 3. Wealth Generation (Passive)
            // Jobs would go here. For now, random windfalls or based on influence.
            if (Math.random() < 0.05) {
                person.stats.wealth += 1 + Math.floor(person.stats.influence / 10);
            }
        });
    }
}
