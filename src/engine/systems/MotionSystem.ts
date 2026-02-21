import { World } from '../World.js';

export class MotionSystem {
    process(world: World, _context: { isNewDay: boolean, isNewWeek: boolean, isNewYear: boolean }) {
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
                        person.state = 'sleeping';
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
                    if (Math.random() < 0.2 && person.state === 'idle') {
                        const range = 20; // Increased range so they walk further
                        const rX = Math.floor(Math.random() * (range * 2 + 1)) - range;
                        const rY = Math.floor(Math.random() * (range * 2 + 1)) - range;
                        const newX = Math.max(0, Math.min(199, person.x + rX)); // Fixed bounds to 200 grid
                        const newY = Math.max(0, Math.min(199, person.y + rY));
                        person.targetX = newX;
                        person.targetY = newY;
                    }
                }
            }

            // Movement Execution
            if (person.targetX !== undefined && person.targetY !== undefined) {
                // Move quickly towards target: 4 steps per tick
                const SPEED = 4;

                let dx = person.targetX - person.x;
                let dy = person.targetY - person.y;

                if (Math.abs(dx) <= SPEED && Math.abs(dy) <= SPEED) {
                    // Arrived
                    person.x = person.targetX;
                    person.y = person.targetY;
                    person.targetX = undefined;
                    person.targetY = undefined;
                    // State handled above 
                } else {
                    person.state = 'moving';
                    // Move diagonally / towards target
                    if (Math.abs(dx) > SPEED) person.x += Math.sign(dx) * SPEED;
                    else person.x += dx;

                    if (Math.abs(dy) > SPEED) person.y += Math.sign(dy) * SPEED;
                    else person.y += dy;
                }
            }
        });
    }
}
