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
  // Subscribe to tickTrigger to force re-renders when world mutates
  const tickTrigger = useStore((state) => state.tickTrigger);
  void tickTrigger; // Suppress unused variable warning

  const tickValues = world.state.time;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Scene />

      <div className="glass-panel" style={{ position: 'absolute', top: 20, left: 20, minWidth: '150px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>WorldGen</h1>
        <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '0px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <div>Year <span style={{ color: 'white', fontWeight: 600 }}>{tickValues.year}</span> &nbsp;&middot;&nbsp; Week <span style={{ color: 'white', fontWeight: 600 }}>{tickValues.week}</span></div>
          <div>Day <span style={{ color: 'white', fontWeight: 600 }}>{tickValues.day ?? 1}</span> &nbsp;&middot;&nbsp; {(tickValues.hour ?? 8).toString().padStart(2, '0')}:00</div>
        </div>
      </div>

      <EventLog />
      <HUD />
    </div>
  );
}

export default App;
