/* eslint-disable no-unused-vars */
/**
 * HandModel3D Component
 * Core 3D model viewer using @react-three/fiber and @react-three/drei
 * Loads GLTF models and provides interactive viewing experience
 */

import React, { Suspense, useRef, useState, useEffect, useCallback, memo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, useGLTF, Center, Environment } from '@react-three/drei';
import * as THREE from 'three';

// ============================================
// PLACEHOLDER MODEL
// ============================================

const PlaceholderModel = memo(({ letter, color = '#6366F1' }) => {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
        }
    });

    return (
        <group ref={meshRef}>
            <mesh castShadow receiveShadow>
                <boxGeometry args={[1.5, 1.5, 1.5]} />
                <meshStandardMaterial color={color} roughness={0.4} metalness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.76]}>
                <planeGeometry args={[1.2, 1.2]} />
                <meshBasicMaterial color="#1E293B" />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.2, 0.05, 16, 100]} />
                <meshStandardMaterial color="#8B5CF6" emissive="#8B5CF6" emissiveIntensity={0.2} />
            </mesh>
        </group>
    );
});

PlaceholderModel.displayName = 'PlaceholderModel';

// ============================================
// GLTF MODEL LOADER
// ============================================

const GLTFModel = memo(({ modelPath, scale = 1, onLoad }) => {
    const { scene } = useGLTF(modelPath, true);
    const clonedScene = React.useMemo(() => scene.clone(true), [scene]);

    const modelRef = useRef();
    const hasCalledOnLoad = useRef(false);

    useEffect(() => {
        if (clonedScene && !hasCalledOnLoad.current) {
            hasCalledOnLoad.current = true;

            const box = new THREE.Box3().setFromObject(clonedScene);
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);

            const normalizeScale = maxDim > 0 ? 2 / maxDim : 1;
            clonedScene.scale.setScalar(normalizeScale * scale);

            const center = box.getCenter(new THREE.Vector3());
            clonedScene.position.sub(center.multiplyScalar(normalizeScale * scale));

            clonedScene.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                    if (child.material) {
                        child.material.roughness = 0.5;
                        child.material.metalness = 0.2;
                    }
                }
            });

            console.log('✅ Model loaded and normalized:', modelPath, 'scale:', normalizeScale);
            onLoad?.();
        }
    }, [clonedScene, scale, modelPath, onLoad]);

    if (!clonedScene) return null;

    return (
        <group ref={modelRef}>
            <primitive object={clonedScene} />
        </group>
    );
});

GLTFModel.displayName = 'GLTFModel';

// ============================================
// ERROR BOUNDARY FOR 3D MODELS
// ============================================

class ModelErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.log('Model loading error caught:', error);
        this.props.onError?.(error);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || null;
        }
        return this.props.children;
    }
}

// ============================================
// MODEL CONTENT (Inner Canvas Component)
// ============================================

const ModelContent = memo(({
    modelPath,
    letter,
    scale = 1,
    autoRotate = false,
    onLoad,
    onError,
    controlsRef
}) => {
    const [modelFailed, setModelFailed] = useState(false);
    const pendingErrorRef = useRef(null);
    const { camera } = useThree();

    useEffect(() => {
        camera.position.set(0, 0, 5);
        camera.lookAt(0, 0, 0);
    }, [camera, letter]);

    const handleModelError = useCallback((error) => {
        pendingErrorRef.current = error;
    }, []);

    useEffect(() => {
        if (pendingErrorRef.current && !modelFailed) {
            console.log('Model failed to load, using placeholder:', pendingErrorRef.current);
            const errorTimer = setTimeout(() => {
                setModelFailed(true);
                onError?.(pendingErrorRef.current);
                pendingErrorRef.current = null;
            }, 0);
            return () => clearTimeout(errorTimer);
        }
    });

    // FIXED: The cascading render issue is fixed by using a timeout
    useEffect(() => {
        const resetTimer = setTimeout(() => {
            setModelFailed(false);
            pendingErrorRef.current = null;
        }, 0);
        return () => clearTimeout(resetTimer);
    }, [modelPath, letter]);

    const letterColors = {
        A: '#6366F1', B: '#8B5CF6', C: '#EC4899', D: '#10B981',
        E: '#F59E0B', F: '#EF4444', G: '#6366F1', H: '#8B5CF6',
        I: '#EC4899', J: '#10B981', K: '#F59E0B', L: '#EF4444',
        M: '#6366F1', N: '#8B5CF6', O: '#EC4899', P: '#10B981',
        Q: '#F59E0B', R: '#EF4444', S: '#6366F1', T: '#8B5CF6',
        U: '#EC4899', V: '#10B981', W: '#F59E0B', X: '#EF4444',
        Y: '#6366F1', Z: '#8B5CF6',
    };

    return (
        <>
            <ambientLight intensity={0.5} />
            <directionalLight position={[5, 5, 5]} intensity={1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
            <directionalLight position={[-5, 3, -5]} intensity={0.5} />
            <directionalLight position={[0, -5, 0]} intensity={0.3} />
            <Environment preset="city" />

            {modelPath && !modelFailed ? (
                <ModelErrorBoundary
                    onError={handleModelError}
                    fallback={<PlaceholderModel letter={letter} color={letterColors[letter] || '#6366F1'} />}
                >
                    <Suspense fallback={<PlaceholderModel letter={letter} color={letterColors[letter] || '#6366F1'} />}>
                        <GLTFModel modelPath={modelPath} scale={scale} onLoad={onLoad} />
                    </Suspense>
                </ModelErrorBoundary>
            ) : (
                <PlaceholderModel letter={letter} color={letterColors[letter] || '#6366F1'} />
            )}

            <OrbitControls
                ref={controlsRef}
                enableRotate={true}
                enableZoom={true}
                enablePan={false}
                minDistance={2}
                maxDistance={10}
                enableDamping={true}
                dampingFactor={0.05}
                autoRotate={autoRotate}
                autoRotateSpeed={2}
            />
        </>
    );
});

ModelContent.displayName = 'ModelContent';

// ============================================
// MAIN COMPONENT
// ============================================

const HandModel3D = memo(({
    modelPath,
    letter = 'A',
    scale = 1,
    autoRotate = false,
    onLoad,
    onError,
    controlsRef,
    className = '',
}) => {
    return (
        <div className={`w-full h-full ${className}`}>
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50, near: 0.1, far: 1000 }}
                shadows
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                dpr={[1, 2]}
            >
                <color attach="background" args={['#1E293B']} />
                <ModelContent
                    modelPath={modelPath}
                    letter={letter}
                    scale={scale}
                    autoRotate={autoRotate}
                    onLoad={onLoad}
                    onError={onError}
                    controlsRef={controlsRef}
                />
            </Canvas>
        </div>
    );
});

HandModel3D.displayName = 'HandModel3D';

export default HandModel3D;