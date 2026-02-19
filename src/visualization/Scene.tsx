import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { WorldMap } from './WorldMap';
import { useStore } from '../store';
import { useEffect } from 'react';

export function Scene() {
    const { paused, speed, manualTick } = useStore();

    useEffect(() => {
        if (paused) return;
        const interval = setInterval(() => {
            manualTick();
        }, 1000 / speed);
        return () => clearInterval(interval);
    }, [paused, speed, manualTick]);

    return (
        <Canvas camera={{ position: [50, 120, 120], fov: 45 }}>
            <color attach="background" args={['#111']} />
            <Stars />
            <ambientLight intensity={0.5} />
            <pointLight position={[50, 50, 50]} intensity={1.5} />
            <directionalLight position={[10, 100, 10]} intensity={1} castShadow />

            <WorldMap />

            <OrbitControls target={[50, 0, 50]} />
        </Canvas>
    );
}
