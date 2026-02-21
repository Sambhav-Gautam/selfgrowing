import { World } from '../World.js';


export class EconomySystem {
    process(world: World, context: { isNewDay: boolean, isNewWeek: boolean, isNewYear: boolean }) {
        if (!context.isNewWeek) return;
        const people = world.socialGraph.getAllPeople();
        const buildings = Object.values(world.state.buildings);

        // Yearly Tax & Daily Wages
        const isYearlyTaxDay = world.state.time.week === 1; // Collection week
        let govtRevenue = 0;

        // 1. Hiring Logic (Rich people hire poor people)
        buildings.forEach(b => {
            if (b.ownerId && b.type !== 'house') { // Businesses/Farms
                const owner = world.state.people[b.ownerId];
                if (owner && owner.stats.wealth > 500) {
                    // Need employees?
                    const maxEmployees = b.level * 2;
                    if (!b.employees) b.employees = []; // Init if missing

                    if (b.employees.length < maxEmployees) {
                        // Find unemployed in range
                        const candidate = people.find(p => !p.job && p.id !== owner.id && p.age > 16 && p.age < 60);
                        if (candidate) {
                            // Hire them
                            const jobTitle = b.type === 'farm' ? 'Farmer' : (b.type === 'shop' ? 'Merchant' : 'Laborer');
                            candidate.job = {
                                title: jobTitle,
                                salary: 10 + (b.level * 2),
                                employerId: owner.id,
                                buildingId: b.id
                            };
                            b.employees.push(candidate.id);
                            // Log?
                        }
                    }
                }
            }

            // House Guards logic
            if (b.type === 'house' && b.ownerId) {
                const owner = world.state.people[b.ownerId];
                if (owner && owner.stats.wealth > 1000) { // Very rich
                    if (!b.employees) b.employees = [];
                    if (b.employees.length < 1) { // 1 Guard per house level?
                        const candidate = people.find(p => !p.job && p.id !== owner.id && p.age > 18);
                        if (candidate) {
                            candidate.job = {
                                title: 'Guard',
                                salary: 20, // Guards pay well
                                employerId: owner.id,
                                buildingId: b.id
                            };
                            b.employees.push(candidate.id);
                        }
                    }
                }
            }
        });

        people.forEach(person => {
            if (!person.isAlive) return;

            // 2. Pay Wages (Daily/Weekly)
            if (person.job) {
                const salary = person.job.salary;
                if (person.job.employerId) {
                    const employer = world.state.people[person.job.employerId];
                    // Private sector
                    if (employer && employer.stats.wealth >= salary) {
                        employer.stats.wealth -= salary;
                        person.stats.wealth += salary;
                    } else {
                        // Employer broke, fire employee
                        person.job = undefined;
                        // Remove from building list? (Complex lookup, skip for now or TODO)
                    }
                } else {
                    // Govt job (if any) or basic income fallback
                }
            }

            // 3. Taxes (Yearly)
            if (isYearlyTaxDay) {
                if (person.stats.wealth > 0) {
                    const tax = Math.floor(person.stats.wealth * 0.1); // 10% Flat
                    if (tax > 0) {
                        person.stats.wealth -= tax;
                        govtRevenue += tax;
                    }
                }
            }

            // 4. Consumption (Survival)
            if (person.needs.food < 50) {
                const foodCost = 5;
                if (person.stats.wealth >= foodCost) {
                    person.stats.wealth -= foodCost;
                    person.needs.food = 100;
                    // Sales tax
                    govtRevenue += 1;
                }
            }
        });

        world.state.lists.govtFunds += govtRevenue;
    }
}
