import { World } from '../World.js';

export class WeatherSystem {
    process(world: World) {
        // Change weather occasionally
        if (Math.random() < 0.01) {
            const weathers: ('clear' | 'rain' | 'snow')[] = ['clear', 'rain', 'snow'];

            // Season bias
            const week = world.state.time.week;
            let weights = [0.6, 0.3, 0.1]; // Default clear bias

            if (week > 45 || week < 10) { // Winter
                weights = [0.3, 0.2, 0.5];
            } else if (week > 10 && week < 25) { // Spring
                weights = [0.4, 0.6, 0.0];
            } else if (week > 25 && week < 40) { // Summer
                weights = [0.8, 0.2, 0.0];
            }

            // Weighted random
            const r = Math.random();
            let sum = 0;
            let newWeather = 'clear';
            for (let i = 0; i < 3; i++) {
                sum += weights[i];
                if (r < sum) {
                    newWeather = weathers[i];
                    break;
                }
            }

            if (world.state.weather !== newWeather) {
                world.state.weather = newWeather as any;
                // Log event? Maybe too spammy.
            }
        }
    }
}
