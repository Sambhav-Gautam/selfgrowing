import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Stars, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
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
        <Canvas camera={{ position: [50, 120, 120], fov: 45 }} shadows={{ type: THREE.PCFShadowMap }}>
            <color attach="background" args={['#1e1e24']} />
            <Stars />
            <ambientLight intensity={0.4} />
            <pointLight position={[50, 50, 50]} intensity={1.5} />
            <directionalLight
                position={[10, 100, 10]}
                intensity={1}
                castShadow
                shadow-mapSize={[2048, 2048]}
                shadow-camera-far={200}
                shadow-camera-left={-100}
                shadow-camera-right={100}
                shadow-camera-top={100}
                shadow-camera-bottom={-100}
            />
            <Environment preset="city" />

            <WorldMap />

            <OrbitControls target={[100, 0, 100]} maxPolarAngle={Math.PI / 2.1} />

            <EffectComposer>
                <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} intensity={0.5} />
                <Vignette eskil={false} offset={0.1} darkness={0.8} />
            </EffectComposer>
        </Canvas>
    );
}
