import { useStore } from '../store';
import { Text, Sky } from '@react-three/drei';
import type { Person } from '../engine/types';
import { useMemo } from 'react';
import type { Building } from '../engine/types';

const GRID_SIZE = 100;

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
            <mesh position={[50, -1, 50]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[102, 102]} />
                <meshStandardMaterial color="#1a1a1a" />
            </mesh>
        </group>
    )
}

function Tree({ x, y, scale }: { x: number, y: number, scale: number }) {
    return (
        <group position={[x, 0, y]} scale={[scale, scale, scale]}>
            <mesh position={[0, 0.5, 0]} castShadow>
                <coneGeometry args={[0.3, 1.5, 8]} />
                <meshStandardMaterial color="#2d6a4f" />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
                <cylinderGeometry args={[0.1, 0.2, 0.5]} />
                <meshStandardMaterial color="#4a4036" />
            </mesh>
        </group>
    )
}

function BuildingMesh({ building, onClick }: { building: Building, onClick: () => void }) {
    const { world } = useStore();
    let color = building.type === 'house' ? '#e76f51' : '#2a9d8f';
    let height = building.type === 'house' ? 1 : 2;
    let width = 0.8;
    const isHouse = building.type === 'house';

    if (isHouse && building.ownerId) {
        const owner = world.state.people[building.ownerId];
        if (owner) {
            if (owner.stats.wealth > 1000) {
                // Estate
                color = '#f4a261'; // Sandy brown/Gold-ish
                height = 1.5;
                width = 1.2;
            } else if (owner.stats.wealth < 100) {
                // Shack
                color = '#8d5524'; // Wood/Mud
                height = 0.6;
                width = 0.6;
            }
        }
    }

    return (
        <group position={[building.x, 0, building.y]} onClick={(e) => { e.stopPropagation(); onClick(); }}>
            <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
                <boxGeometry args={[width, height, width]} />
                <meshStandardMaterial color={color} />
            </mesh>
            {isHouse && (
                <mesh position={[0, height + (width * 0.5), 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                    <coneGeometry args={[width, width, 4]} />
                    <meshStandardMaterial color={building.ownerId && world.state.people[building.ownerId]?.stats.wealth > 1000 ? '#264653' : '#8d5524'} />
                </mesh>
            )}
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
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[GRID_SIZE / 2, -0.05, GRID_SIZE / 2]}>
                <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
                <meshStandardMaterial color="#3a5a40" />
            </mesh>

            {/* Roads & Water (Rendered as simple planes slightly above) */}
            {cells.map((cell, i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[cell.x, 0, cell.y]}>
                    <planeGeometry args={[1, 1]} />
                    <meshStandardMaterial color={cell.color} />
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
            <mesh position={[0, 1.5, 0]} castShadow>
                <boxGeometry args={[1, 1.5, 0.5]} />
                <meshStandardMaterial color={shirtColor} />
            </mesh>
            {/* ... rest of mesh ... */}

            {/* Head */}
            <mesh position={[0, 2.6, 0]} castShadow>
                <boxGeometry args={[0.8, 0.9, 0.8]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>

            {/* Hair */}
            <mesh position={[0, 3.1, 0]} castShadow>
                <boxGeometry args={[0.9, 0.2, 0.9]} />
                <meshStandardMaterial color={hairColor} />
            </mesh>

            {/* Eyes */}
            <mesh position={[0.2, 2.7, 0.41]}>
                <sphereGeometry args={[0.1]} />
                <meshStandardMaterial color="black" />
            </mesh>
            <mesh position={[-0.2, 2.7, 0.41]}>
                <sphereGeometry args={[0.1]} />
                <meshStandardMaterial color="black" />
            </mesh>

            {/* Arms */}
            <mesh position={[0.6, 1.5, 0]}>
                <boxGeometry args={[0.3, 1.5, 0.3]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>
            <mesh position={[-0.6, 1.5, 0]}>
                <boxGeometry args={[0.3, 1.5, 0.3]} />
                <meshStandardMaterial color={skinColor} />
            </mesh>

            {/* Legs */}
            <mesh position={[0.3, 0.5, 0]}>
                <boxGeometry args={[0.35, 1.2, 0.35]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            <mesh position={[-0.3, 0.5, 0]}>
                <boxGeometry args={[0.35, 1.2, 0.35]} />
                <meshStandardMaterial color="#333" />
            </mesh>

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
