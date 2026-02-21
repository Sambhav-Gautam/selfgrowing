import { useStore } from '../store';

export function HUD() {
    const world = useStore(state => state.world);
    const selectedId = useStore(state => state.selectedEntityId);
    const tickTrigger = useStore(state => state.tickTrigger);
    void tickTrigger;

    const stats = world.statsSystem.getStats();

    const selectedPerson = selectedId ? world.state.people[selectedId] : null;
    const selectedBuilding = selectedId ? world.state.buildings[selectedId] : null;

    if (!stats) return null;

    return (
        <>
            <div className="glass-panel" style={{
                position: 'absolute', top: 20, right: 20,
                minWidth: '220px', pointerEvents: 'none',
                display: 'flex', flexDirection: 'column', gap: '8px'
            }}>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: 600, color: '#4cc9f0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>Global Stats</h3>
                <StatRow label="Population" value={stats.population} />
                <StatRow label="Avg Happiness" value={Math.floor(stats.averageHappiness)} />
                <StatRow label="Avg Wealth" value={Math.floor(stats.averageWealth)} />
                <StatRow label="Crime Rate" value={`${(stats.crimeRate * 100).toFixed(1)}%`} />

                <div style={{ marginTop: '5px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <StatRow label="Govt Funds" value={world.state.lists.govtFunds} />
                </div>

                {/* Simulation Controls */}
                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <h3 style={{ margin: '0 0 5px 0', fontSize: '13px', fontWeight: 600, color: '#aaa' }}>Controls</h3>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); useStore.getState().togglePause(); }}
                            style={{ flex: 1, padding: '6px', background: useStore(s => s.paused) ? '#f72585' : '#4cc9f0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                        >
                            {useStore(s => s.paused) ? '▶ PLAY' : '⏸ PAUSE'}
                        </button>
                        <select
                            value={useStore(s => s.speed)}
                            onChange={(e) => { e.stopPropagation(); useStore.getState().setSpeed(Number(e.target.value)); }}
                            style={{ padding: '6px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            <option value={0.5} style={{ color: 'black' }}>0.5x</option>
                            <option value={1} style={{ color: 'black' }}>1x</option>
                            <option value={2} style={{ color: 'black' }}>2x</option>
                            <option value={5} style={{ color: 'black' }}>5x</option>
                            <option value={10} style={{ color: 'black' }}>10x</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Selection Panel */}
            {(selectedPerson || selectedBuilding) && (
                <div className="glass-panel" style={{
                    position: 'absolute', bottom: 20, right: 20,
                    minWidth: '280px', pointerEvents: 'auto'
                }}>
                    {selectedPerson && (
                        <>
                            <h2 style={{ margin: '0 0 15px 0', fontSize: '20px', fontWeight: 700, color: '#f72585' }}>{selectedPerson.name}</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <StatRow label="Age" value={selectedPerson.age} />
                                <StatRow label="Gender" value={selectedPerson.gender} />
                                <StatRow label="State" value={selectedPerson.state} colSpan={2} />
                            </div>
                            <div style={{ margin: '12px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <StatRow label="Happiness" value={Math.floor(selectedPerson.stats.happiness)} />
                                <StatRow label="Wealth" value={Math.floor(selectedPerson.stats.wealth)} />
                                <StatRow label="Food Need" value={Math.floor(selectedPerson.needs.food)} colSpan={2} />
                            </div>
                            <div style={{ margin: '12px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
                            <div style={{ fontSize: '12px', color: '#888', textAlign: 'right' }}>Pos: {selectedPerson.x.toFixed(1)}, {selectedPerson.y.toFixed(1)}</div>
                        </>
                    )}

                    {selectedBuilding && (
                        <>
                            <h2 style={{ margin: '0 0 15px 0', fontSize: '20px', fontWeight: 700, color: '#43aa8b' }}>{selectedBuilding.type.toUpperCase()}</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <StatRow label="Level" value={selectedBuilding.level} />
                                <StatRow label="Owner" value={selectedBuilding.ownerId ? (world.state.people[selectedBuilding.ownerId]?.name || 'Unknown') : 'None'} />
                            </div>
                            <div style={{ margin: '12px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}></div>
                            <div style={{ fontSize: '12px', color: '#888', textAlign: 'right' }}>Pos: {selectedBuilding.x.toFixed(1)}, {selectedBuilding.y.toFixed(1)}</div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}

function StatRow({ label, value, colSpan = 1 }: { label: string, value: string | number, colSpan?: number }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gridColumn: `span ${colSpan}`, fontSize: '14px' }}>
            <span style={{ color: '#aaa' }}>{label}</span>
            <span style={{ fontWeight: 600, color: 'white' }}>{value}</span>
        </div>
    );
}
