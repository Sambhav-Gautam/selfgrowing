import { useStore } from '../store';
import { Text, Sky, RoundedBox } from '@react-three/drei';
import type { Person } from '../engine/types';
import { useMemo } from 'react';
import type { Building } from '../engine/types';

const GRID_SIZE = 200;

export function WorldMap() {
    const { world, tickTrigger, setSelectedEntityId } = useStore();
    // Force re-render on tick
    void tickTrigger;

    const people = world.socialGraph.getAllPeople();
    const buildings = Object.values(world.state.buildings);

    // Generate static trees only once based on grid seed (pseudo-random)
    const trees = useMemo(() => {
        const t = [];
        for (let i = 0; i < 200; i++) {
            const x = Math.floor(Math.random() * GRID_SIZE);
            const y = Math.floor(Math.random() * GRID_SIZE);
            t.push({ x, y, scale: 0.5 + Math.random() * 0.5 });
        }
        return t;
    }, []);

    return (
        <group>
            <Sky sunPosition={[100, 20, 100]} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[50, 50, 25]} intensity={1} castShadow shadow-mapSize={[2048, 2048]} />

            {/* Weather Overlay */}
            <WeatherOverlay weather={world.state.weather} />

            {/* Terrain Grid */}
            <TerrainGrid world={world} onClick={() => setSelectedEntityId(null)} />

            {/* Boundary Walls */}
            <Boundary />

            {/* Nature */}
            {trees.map((t, i) => (
                <Tree key={i} x={t.x} y={t.y} scale={t.scale} />
            ))}

            {/* Buildings */}
            {buildings.map(b => (
                <BuildingMesh key={b.id} building={b} onClick={() => setSelectedEntityId(b.id)} />
            ))}

            {/* Agents */}
            {people.map(person => (
                <HumanoidAgent key={person.id} person={person} onClick={() => setSelectedEntityId(person.id)} />
            ))}
        </group>
    );
}

function WeatherOverlay({ weather }: { weather: 'clear' | 'rain' | 'snow' }) {
    if (weather === 'clear') return null;

    // Rain is gray, Snow is white
    const particleColor = weather === 'rain' ? '#aaaaaa' : '#ffffff';
    // Rain is lines, Snow is box/sphere. Simplified: box for both.
    // Rain should fall fast? Just static "particles" for now as a visual indicator.

    const count = 500;
    const particles = useMemo(() => {
        const p = [];
        for (let i = 0; i < count; i++) {
            p.push({
                x: Math.random() * 100,
                y: Math.random() * 20, // Height
                z: Math.random() * 100
            });
        }
        return p;
    }, []);

    return (
        <group>
            {particles.map((p, i) => (
                <mesh key={i} position={[p.x, p.y, p.z]}>
                    <boxGeometry args={[0.05, 0.5, 0.05]} />
                    <meshBasicMaterial color={particleColor} transparent opacity={0.6} />
                </mesh>
            ))}
        </group>
    )
}

function Boundary() {
    return (
        <group>
            {/* Simple bedrock below */}
            <mesh position={[50, -1, 50]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[102, 102]} />
                <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
            </mesh>
        </group>
    )
}

function Tree({ x, y, scale }: { x: number, y: number, scale: number }) {
    return (
        <group position={[x, 0, y]} scale={[scale, scale, scale]}>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
                <coneGeometry args={[0.3, 1.5, 8]} />
                <meshPhysicalMaterial color="#2d6a4f" roughness={0.6} clearcoat={0.1} />
            </mesh>
            <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.1, 0.2, 0.5]} />
                <meshPhysicalMaterial color="#4a4036" roughness={0.9} />
            </mesh>
        </group>
    )
}

function BuildingMesh({ building, onClick }: { building: Building, onClick: () => void }) {
    return (
        <group position={[building.x, 0, building.y]} onClick={(e) => { e.stopPropagation(); onClick(); }}>
            {building.type === 'government' && (
                <group>
                    {/* Grand Base */}
                    <RoundedBox position={[0, 0.5, 0]} args={[4, 1, 4]} radius={0.1} castShadow receiveShadow>
                        <meshPhysicalMaterial color="#dde5b6" roughness={0.2} metalness={0.1} />
                    </RoundedBox>
                    {/* Pillars */}
                    {[-1.5, 1.5].map(px => [-1.5, 1.5].map(py => (
                        <mesh key={`${px}-${py}`} position={[px, 1.5, py]} castShadow receiveShadow>
                            <cylinderGeometry args={[0.2, 0.2, 2]} />
                            <meshPhysicalMaterial color="#ffffff" roughness={0.2} />
                        </mesh>
                    )))}
                    {/* Dome/Roof */}
                    <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                        <sphereGeometry args={[1.8, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshPhysicalMaterial color="#a8dadc" roughness={0.3} metalness={0.4} />
                    </mesh>
                </group>
            )}

            {building.type === 'hospital' && (
                <group>
                    {/* Modern White Block */}
                    <RoundedBox position={[0, 1.5, 0]} args={[3, 3, 3]} radius={0.1} castShadow receiveShadow>
                        <meshPhysicalMaterial color="#f0f3f5" roughness={0.1} clearcoat={1} />
                    </RoundedBox>
                    {/* Red Cross Signage */}
                    <mesh position={[0, 1.5, 1.51]}>
                        <planeGeometry args={[1, 0.3]} />
                        <meshBasicMaterial color="#e63946" />
                    </mesh>
                    <mesh position={[0, 1.5, 1.51]}>
                        <planeGeometry args={[0.3, 1]} />
                        <meshBasicMaterial color="#e63946" />
                    </mesh>
                    {/* Helipad */}
                    <mesh position={[0, 3.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <circleGeometry args={[1]} />
                        <meshBasicMaterial color="#333333" />
                    </mesh>
                </group>
            )}

            {building.type === 'commercial' && (
                <group>
                    <RoundedBox position={[0, 1, 0]} args={[2.5, 2, 2.5]} radius={0.05} castShadow receiveShadow>
                        <meshPhysicalMaterial color="#457b9d" roughness={0.3} metalness={0.2} />
                    </RoundedBox>
                    {/* Shop Awning */}
                    <mesh position={[0, 1.5, 1.3]} rotation={[0.4, 0, 0]}>
                        <boxGeometry args={[2.6, 0.1, 0.8]} />
                        <meshStandardMaterial color="#e63946" />
                    </mesh>
                </group>
            )}

            {building.type === 'park' && (
                <group>
                    {/* Park Fountain Component */}
                    <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
                        <cylinderGeometry args={[1.5, 1.5, 0.4]} />
                        <meshPhysicalMaterial color="#cccccc" roughness={0.7} />
                    </mesh>
                    <mesh position={[0, 0.4, 0]}>
                        <cylinderGeometry args={[1.4, 1.4, 0.1]} />
                        <meshPhysicalMaterial color="#00b4d8" clearcoat={1} roughness={0} />
                    </mesh>
                    <mesh position={[0, 0.8, 0]}>
                        <cylinderGeometry args={[0.2, 0.4, 1]} />
                        <meshPhysicalMaterial color="#cccccc" roughness={0.7} />
                    </mesh>
                </group>
            )}

            {building.type === 'house' && (() => {
                let color = '#2a9d8f';
                let height = 1; let width = 0.8;
                let isWealthy = building.level === 3;
                let isPoor = building.level === 1;

                if (isWealthy) {
                    color = '#f4a261'; height = 1.5; width = 1.2;
                } else if (isPoor) {
                    color = '#8d5524'; height = 0.6; width = 0.6;
                }

                return (
                    <group>
                        <RoundedBox position={[0, height / 2, 0]} args={[width, height, width]} radius={0.05} castShadow receiveShadow>
                            <meshPhysicalMaterial color={color} roughness={0.3} metalness={0.1} clearcoat={0.5} />
                        </RoundedBox>
                        {/* Pitched Roof */}
                        <mesh position={[0, height + (width * 0.5), 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
                            <coneGeometry args={[width, width, 4]} />
                            <meshPhysicalMaterial color={isWealthy ? '#264653' : '#3c2a21'} roughness={0.4} />
                        </mesh>
                    </group>
                );
            })()}
        </group>
    );
}

function TerrainGrid({ world, onClick }: { world: any, onClick: () => void }) {
    // ... same code ...
    // Determine visuals for each cell
    const cells = useMemo(() => {
        const c = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            for (let y = 0; y < GRID_SIZE; y++) {
                const cell = world.grid.getCell(x, y);
                if (cell) {
                    let color = '#3a5a40'; // grass
                    if (cell.type === 'water') color = '#0077be';
                    if (cell.type === 'road') color = '#555555';
                    if (cell.type === 'stone') color = '#888888';
                    if (cell.type === 'sand') color = '#e9c46a';
                    if (cell.type === 'forest') color = '#203a27'; // Darker grass base under trees

                    if (color !== '#3a5a40') {
                        c.push({ x, y, color });
                    }
                }
            }
        }
        return c;
    }, [world.grid]);

    return (
        <group onClick={(e) => { e.stopPropagation(); onClick(); }}>
            {/* Base Grass Plane */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GRID_SIZE / 2, -0.05, GRID_SIZE / 2]} receiveShadow>
                <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
                <meshStandardMaterial color="#3a5a40" roughness={0.9} />
            </mesh>

            {/* Roads & Features (Rendered as simple planes slightly above) */}
            {cells.map((cell, i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[cell.x, 0.01, cell.y]} receiveShadow>
                    <planeGeometry args={[1, 1]} />
                    <meshPhysicalMaterial color={cell.color} roughness={cell.color === '#0077be' ? 0.1 : 0.8} metalness={cell.color === '#0077be' ? 0.8 : 0.1} clearcoat={cell.color === '#0077be' ? 1 : 0} />
                </mesh>
            ))}
        </group>
    );
}

function HumanoidAgent({ person, onClick }: { person: Person, onClick: () => void }) {
    const { skinColor, hairColor, height } = person.visuals || { skinColor: '#ffcc99', hairColor: '#000', height: 1 };

    // Scale the entire group based on genetic height
    const scale = height || 1;
    const x = person.x;
    const y = person.y;

    // Clothing based on Job/Wealth
    let shirtColor = person.gender === 'male' ? '#4cc9f0' : '#f72585';
    if (person.job) {
        switch (person.job.title) {
            case 'Farmer': shirtColor = '#8d99ae'; break;
            case 'Guard': shirtColor = '#2b2d42'; break; // Dark Blue armour
            case 'Merchant': shirtColor = '#9b2226'; break;
            case 'Laborer': shirtColor = '#6c757d'; break;
        }
    }
    // Wealth Override
    if (person.stats.wealth > 1000) shirtColor = '#7209b7'; // Purple (Royal)
    if (person.stats.wealth < 50) shirtColor = '#495057'; // Rags

    // Sleeping Rotation
    const rotation = person.state === 'sleeping' ? [-Math.PI / 2, 0, 0] : [0, 0, 0];
    const position = person.state === 'sleeping' ? [x, 0.2, y] : [x, 0, y];

    return (
        <group position={position as any} rotation={rotation as any} scale={[scale * 0.4, scale * 0.4, scale * 0.4]} onClick={(e) => { e.stopPropagation(); onClick(); }}>
            {/* Body */}
            <RoundedBox position={[0, 1.5, 0]} args={[1, 1.5, 0.5]} radius={0.1} castShadow receiveShadow>
                <meshStandardMaterial color={shirtColor} />
            </RoundedBox>

            {/* Head */}
            <RoundedBox position={[0, 2.6, 0]} args={[0.8, 0.9, 0.8]} radius={0.2} castShadow receiveShadow>
                <meshStandardMaterial color={skinColor} roughness={0.4} />
            </RoundedBox>

            {/* Hair */}
            <RoundedBox position={[0, 3.1, 0]} args={[0.9, 0.2, 0.9]} radius={0.05} castShadow receiveShadow>
                <meshStandardMaterial color={hairColor} />
            </RoundedBox>

            {/* Eyes */}
            <mesh position={[0.2, 2.7, 0.41]}>
                <sphereGeometry args={[0.1]} />
                <meshPhysicalMaterial color="black" roughness={0.1} clearcoat={1} />
            </mesh>
            <mesh position={[-0.2, 2.7, 0.41]}>
                <sphereGeometry args={[0.1]} />
                <meshPhysicalMaterial color="black" roughness={0.1} clearcoat={1} />
            </mesh>

            {/* Arms */}
            <RoundedBox position={[0.6, 1.5, 0]} args={[0.3, 1.5, 0.3]} radius={0.1} castShadow receiveShadow>
                <meshStandardMaterial color={skinColor} />
            </RoundedBox>
            <RoundedBox position={[-0.6, 1.5, 0]} args={[0.3, 1.5, 0.3]} radius={0.1} castShadow receiveShadow>
                <meshStandardMaterial color={skinColor} />
            </RoundedBox>

            {/* Legs */}
            <RoundedBox position={[0.3, 0.5, 0]} args={[0.35, 1.2, 0.35]} radius={0.1} castShadow receiveShadow>
                <meshStandardMaterial color="#333" />
            </RoundedBox>
            <RoundedBox position={[-0.3, 0.5, 0]} args={[0.35, 1.2, 0.35]} radius={0.1} castShadow receiveShadow>
                <meshStandardMaterial color="#333" />
            </RoundedBox>

            {/* Name Tag */}
            <Text
                position={[0, 4, 0]}
                fontSize={1}
                color="white"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.05}
                outlineColor="black"
            >
                {person.name}
            </Text>
        </group>
    );
}
