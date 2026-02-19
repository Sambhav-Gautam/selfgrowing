import { Scene } from './visualization/Scene';
import { EventLog } from './ui/EventLog';
import { HUD } from './ui/HUD';
import { useStore } from './store';
import './App.css';

function App() {
  /* 
     Using individual selectors or useShallow is required to avoid 
     "Maximum update depth exceeded" due to object identity changes.
  */
  const world = useStore((state) => state.world);
  const paused = useStore((state) => state.paused);
  const togglePause = useStore((state) => state.togglePause);
  const speed = useStore((state) => state.speed);
  const setSpeed = useStore((state) => state.setSpeed);
  // Subscribe to tickTrigger to force re-renders when world mutates
  const tickTrigger = useStore((state) => state.tickTrigger);
  void tickTrigger; // Suppress unused variable warning

  const tickValues = world.state.time;

  // Force re-render for UI when tickTrigger changes
  // Actually useStore with selector will re-render if selection changes?
  // We need to select primitive values, or object reference if changed.
  // tickValues is nested object reference, might not update if we mutate strictly?
  // But we spread it in advance() so it should work.

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Scene />

      <div style={{ position: 'absolute', top: 10, left: 10, color: 'white', background: 'rgba(0,0,0,0.5)', padding: 10 }}>
        <h1>WorldGen</h1>
        <div>Year: {tickValues.year} | Week: {tickValues.week}</div>
        <div>
          <button onClick={togglePause}>{paused ? 'Resume' : 'Pause'}</button>
          <input
            type="range"
            min="1"
            max="10"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
          Speed: {speed}x
        </div>
      </div>

      <EventLog />
      <HUD />
    </div>
  );
}

export default App;
