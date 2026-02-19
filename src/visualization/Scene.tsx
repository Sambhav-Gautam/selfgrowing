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
        <Canvas camera={{ position: [0, 10, 10], fov: 50 }}>
            <color attach="background" args={['#111']} />
            <Stars />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />

            <WorldMap />

            <OrbitControls />
        </Canvas>
    );
}
