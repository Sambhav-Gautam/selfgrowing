import { useStore } from '../store';
import { useEffect, useState } from 'react';

export function EventLog() {
    const { world, tickTrigger } = useStore();
    const [events, setEvents] = useState(world.state.events);

    useEffect(() => {
        // Update local state when tick triggers
        // We reverse to show newest first
        setEvents([...world.state.events].reverse());
    }, [tickTrigger, world.state.events, world]);

    return (
        <div style={{
            position: 'absolute',
            bottom: 10,
            left: 10,
            width: '350px',
            maxHeight: '300px',
            overflowY: 'auto',
            background: 'rgba(0,0,0,0.8)',
            padding: '10px',
            fontSize: '14px',
            color: '#ddd',
            borderRadius: '5px'
        }}>
            <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #555' }}>History Log</h3>
            {events.length === 0 && <div>No history yet.</div>}
            {events.map(event => (
                <div key={event.id} style={{ marginBottom: '8px', borderBottom: '1px solid #333', paddingBottom: '4px' }}>
                    <span style={{ color: '#888', fontSize: '11px', marginRight: '5px' }}>
                        Y{event.date.year}/W{event.date.week}
                    </span>
                    <span style={{ color: event.type === 'death' ? '#ff6666' : event.type === 'birth' ? '#66ff66' : '#ccc' }}>
                        {event.description}
                    </span>
                </div>
            ))}
        </div>
    );
}
