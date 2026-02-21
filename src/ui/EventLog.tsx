import { useStore } from '../store';
import { useMemo } from 'react';

export function EventLog() {
    const { world } = useStore();

    const events = useMemo(() => {
        return [...world.state.events].reverse();
    }, [world.state.events]);

    return (
        <div className="glass-panel" style={{
            position: 'absolute', bottom: 20, left: 20,
            width: '320px', maxHeight: '300px', overflowY: 'auto',
            display: 'flex', flexDirection: 'column', gap: '8px',
            fontSize: '13px'
        }}>
            <h3 style={{ margin: '0', fontSize: '15px', fontWeight: 600, color: '#fca311', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px', position: 'sticky', top: '-16px', background: 'rgba(15,15,20,0.8)', backdropFilter: 'blur(5px)', paddingTop: '16px', zIndex: 1, marginTop: '-16px' }}>History Log</h3>
            {events.length === 0 && <div style={{ color: '#888', fontStyle: 'italic', padding: '10px 0' }}>The world waits in silence...</div>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {events.map((event, i) => (
                    <div key={event.id} style={{
                        display: 'flex', alignItems: 'flex-start',
                        padding: '6px 8px', borderRadius: '4px',
                        background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent',
                        borderLeft: `2px solid ${event.type === 'death' ? '#ef233c' : event.type === 'birth' ? '#06d6a0' : 'rgba(255,255,255,0.2)'}`
                    }}>
                        <div style={{ flex: 1, color: '#e5e5e5', lineHeight: 1.4 }}>
                            {event.description}
                        </div>
                        <div style={{ fontSize: '10px', color: '#666', whiteSpace: 'nowrap', marginLeft: '10px', marginTop: '2px' }}>
                            Y{event.date.year}/W{event.date.week}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
