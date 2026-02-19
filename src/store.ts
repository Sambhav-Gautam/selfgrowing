import { create } from 'zustand';
import { World } from './engine/World';
import { seedWorld } from './engine/seed';

interface GameStore {
    world: World;
    paused: boolean;
    speed: number;
    tickTrigger: number;
    togglePause: () => void;
    setSpeed: (speed: number) => void;
    manualTick: () => void;
}

export const useStore = create<GameStore>((set, get) => {
    // Initialize World
    const world = new World();

    // Attempt to load from JSON
    fetch('/data/world.json')
        .then(res => {
            if (res.ok) return res.json();
            throw new Error('No saved state');
        })
        .then(data => {
            console.log('Hydrating world from /data/world.json');
            world.loadState(data);
            // Force update
            set(state => ({ tickTrigger: state.tickTrigger + 1 }));
        })
        .catch(() => {
            console.log('No persistent state found, seeding new world.');
            seedWorld(world);
            set(state => ({ tickTrigger: state.tickTrigger + 1 }));
        });

    return {
        world,
        paused: true,
        speed: 1,
        tickTrigger: 0,
        togglePause: () => set(state => ({ paused: !state.paused })),
        setSpeed: (speed) => set({ speed }),
        manualTick: () => {
            get().world.tick();
            set(state => ({ tickTrigger: state.tickTrigger + 1 }));
        }
    };
});
