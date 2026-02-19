import { World } from '../World.js';

export class MotionSystem {
    process(world: World) {
        const people = world.socialGraph.getAllPeople();
        const isNight = world.state.time.isNight;

        people.forEach(person => {
            if (!person.isAlive) return;
            if (person.state === 'imprisoned') return;

            // Day / Night Logic
            if (isNight) {
                // NIGHT: Go Home or Sleep
                if (person.residenceId) {
                    const house = world.state.buildings[person.residenceId];
                    if (house) {
                        person.targetX = house.x;
                        person.targetY = house.y;

                        // If arrived at home
                        if (person.x === house.x && person.y === house.y) {
                            person.state = 'sleeping'; // Assume sleeping inside
                            person.needs.rest = 100;
                        } else {
                            person.state = 'moving';
                        }
                    } else {
                        // House destroyed?
                        person.residenceId = undefined;
                    }
                } else {
                    // Homeless: Sleep on street
                    if (person.state !== 'sleeping') {
                        // Find random spot if not already there?
                        // actually just sleep where you are or find a park?
                        // Let's find a road
                        person.state = 'sleeping';
                        // Find nearby road to look "natural" or just sidewalk?
                        // Current position is fine.
                    }
                    person.needs.rest = Math.min(100, person.needs.rest + 5);
                }
            } else {
                // DAY: Work or Wander
                person.state = 'idle'; // Reset sleeping

                if (person.job && person.job.buildingId) {
                    const workplace = world.state.buildings[person.job.buildingId];
                    if (workplace) {
                        person.targetX = workplace.x;
                        person.targetY = workplace.y;

                        if (person.x === workplace.x && person.y === workplace.y) {
                            person.state = 'working';
                        } else {
                            person.state = 'moving';
                        }
                    }
                } else {
                    // Unemployed / Day off
                    // Wander Logic
                    if (Math.random() < 0.1 && person.state === 'idle') {
                        const range = 5;
                        const rX = Math.floor(Math.random() * (range * 2 + 1)) - range;
                        const rY = Math.floor(Math.random() * (range * 2 + 1)) - range;
                        const newX = Math.max(0, Math.min(99, person.x + rX));
                        const newY = Math.max(0, Math.min(99, person.y + rY));
                        person.targetX = newX;
                        person.targetY = newY;
                    }
                }
            }

            // Movement Execution
            if (person.targetX !== undefined && person.targetY !== undefined) {
                // Simple movement logic: Move 1 step closer
                const dx = person.targetX - person.x;
                const dy = person.targetY - person.y;

                if (dx === 0 && dy === 0) {
                    // Arrived
                    // State handled above
                    person.targetX = undefined;
                    person.targetY = undefined;
                } else {
                    person.state = 'moving';
                    // Move X first, then Y (Manhattan-ish)
                    if (Math.abs(dx) > Math.abs(dy)) {
                        person.x += Math.sign(dx);
                    } else {
                        person.y += Math.sign(dy);
                    }
                }
            }
        });
    }
}
