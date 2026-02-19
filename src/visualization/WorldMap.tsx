import { useStore } from '../store';
import { Line, Text, Sphere } from '@react-three/drei';
import type { Person } from '../engine/types';

export function WorldMap() {
    const { world, tickTrigger } = useStore();
    // Use tickTrigger to force re-render
    void tickTrigger;

    const locations = world.locationGraph.getAllLocations();
    const people = world.socialGraph.getAllPeople();

    // Group people by location
    const peopleByLoc = people.reduce((acc, p) => {
        if (!p.isAlive) return acc;
        acc[p.locationId] = acc[p.locationId] || [];
        acc[p.locationId].push(p);
        return acc;
    }, {} as Record<string, Person[]>);

    return (
        <group>
            {locations.map(loc => (
                <group key={loc.id} position={[loc.coordinates.x, loc.coordinates.y, loc.coordinates.z]}>
                    <Sphere args={[0.5, 32, 32]} onClick={() => console.log('Clicked', loc.name)}>
                        <meshStandardMaterial color="#44aa88" />
                    </Sphere>
                    <Text
                        position={[0, 0.8, 0]}
                        fontSize={0.5}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                    >
                        {loc.name}
                    </Text>

                    {/* Render People */}
                    {(peopleByLoc[loc.id] || []).map((person, index, arr) => {
                        const angle = (index / arr.length) * Math.PI * 2;
                        const radius = 0.8;
                        const x = Math.cos(angle) * radius;
                        const z = Math.sin(angle) * radius;

                        // Scale based on influence (Power Hierarchy)
                        const baseSize = 0.15;
                        const influenceScale = 1 + (person.stats.influence / 100);
                        const size = baseSize * influenceScale;

                        return (
                            <group key={person.id} position={[x, 0, z]}>
                                <Sphere args={[size, 16, 16]}>
                                    <meshStandardMaterial color={person.gender === 'male' ? '#88ccff' : '#ff88cc'} />
                                </Sphere>
                                {person.stats.influence > 50 && (
                                    <Text position={[0, size + 0.2, 0]} fontSize={0.2} color="gold">
                                        Leader
                                    </Text>
                                )}
                                <Text position={[0, -0.3, 0]} fontSize={0.15} color="white">
                                    {person.name}
                                </Text>
                            </group>
                        );
                    })}
                </group>
            ))}

            {locations.map(loc =>
                loc.connections.map(targetId => {
                    const target = world.locationGraph.getLocation(targetId);
                    if (!target) return null;
                    // Avoid duplicate lines? (Undirected graph)
                    // Render line only if loc.id < target.id to avoid double rendering
                    if (loc.id > target.id) return null;

                    return (
                        <Line
                            key={`${loc.id}-${targetId}`}
                            points={[[loc.coordinates.x, loc.coordinates.y, loc.coordinates.z], [target.coordinates.x, target.coordinates.y, target.coordinates.z]]}
                            color="white"
                            lineWidth={1}
                        />
                    );
                })
            )}
        </group>
    );
}
