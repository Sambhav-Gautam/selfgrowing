import { useStore } from '../store';

export function HUD() {
    const world = useStore(state => state.world);
    const selectedId = useStore(state => state.selectedEntityId);
    const tickTrigger = useStore(state => state.tickTrigger);
    void tickTrigger;

    const stats = world.statsSystem.getStats();

    // Derived selected check
    const selectedPerson = selectedId ? world.state.people[selectedId] : null;
    const selectedBuilding = selectedId ? world.state.buildings[selectedId] : null;

    // Fallback if stats are empty (first tick)
    if (!stats) return null;

    return (
        <>
            <div style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: 'rgba(0,0,0,0.6)',
                color: 'white',
                padding: '15px',
                borderRadius: '8px',
                minWidth: '200px',
                fontFamily: 'monospace',
                pointerEvents: 'none' // Allow click through?
            }}>
                <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #555' }}>World Stats</h3>
                <StatRow label="Population" value={stats.population} />
                <StatRow label="Avg Happiness" value={stats.averageHappiness} />
                <StatRow label="Avg Wealth" value={stats.averageWealth} />
                <StatRow label="Crime Rate" value={`${(stats.crimeRate * 100).toFixed(1)}%`} />

                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #555' }}>
                    <StatRow label="Govt Funds" value={world.state.lists.govtFunds} />
                </div>
            </div>

            {/* Selection Panel */}
            {(selectedPerson || selectedBuilding) && (
                <div style={{
                    position: 'absolute',
                    bottom: 10,
                    left: 10,
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    minWidth: '300px',
                    fontFamily: 'monospace',
                    border: '1px solid #444'
                }}>
                    {selectedPerson && (
                        <>
                            <h2 style={{ margin: '0 0 10px 0' }}>{selectedPerson.name}</h2>
                            <StatRow label="Age" value={selectedPerson.age} />
                            <StatRow label="Gender" value={selectedPerson.gender} />
                            <StatRow label="State" value={selectedPerson.state} />
                            <br />
                            <StatRow label="Health" value="Good" />
                            <StatRow label="Happiness" value={Math.floor(selectedPerson.stats.happiness)} />
                            <StatRow label="Wealth" value={Math.floor(selectedPerson.stats.wealth)} />
                            <StatRow label="Needs (Food)" value={Math.floor(selectedPerson.needs.food)} />
                            <br />
                            <div>Pos: {selectedPerson.x}, {selectedPerson.y}</div>
                        </>
                    )}

                    {selectedBuilding && (
                        <>
                            <h2 style={{ margin: '0 0 10px 0' }}>{selectedBuilding.type.toUpperCase()}</h2>
                            <StatRow label="Level" value={selectedBuilding.level} />
                            <StatRow label="Owner" value={selectedBuilding.ownerId ? (world.state.people[selectedBuilding.ownerId]?.name || 'Unknown') : 'None'} />
                            <div>Pos: {selectedBuilding.x}, {selectedBuilding.y}</div>
                        </>
                    )}
                </div>
            )}
        </>
    );
}

function StatRow({ label, value }: { label: string, value: string | number }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span>{label}:</span>
            <span style={{ fontWeight: 'bold' }}>{value}</span>
        </div>
    );
}
