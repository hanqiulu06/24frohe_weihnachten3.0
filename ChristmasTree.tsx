
import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, Stars } from '@react-three/drei';

const Group = 'group' as any;
const Points = 'points' as any;
const BufferGeometry = 'bufferGeometry' as any;
const BufferAttribute = 'bufferAttribute' as any;
const PointsMaterial = 'pointsMaterial' as any;
const Mesh = 'mesh' as any;
const SphereGeometry = 'sphereGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const OctahedronGeometry = 'octahedronGeometry' as any;
const PointLight = 'pointLight' as any;
const AmbientLight = 'ambientLight' as any;
const InstancedMesh = 'instancedMesh' as any;
const TetrahedronGeometry = 'tetrahedronGeometry' as any;

interface ChristmasTreeProps {
  power: boolean;
  spread: number;
  rotation: number;
  isExploded: boolean;
  isPointing: boolean;
}

const Ribbon: React.FC<{ active: boolean; spread: number; explosionOffset: number }> = ({ active, spread, explosionOffset }) => {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const count = 5000;
  const growthRef = useRef(0);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // 为每个实例创建透明度属性：底部 0% -> 顶部 100%
  // 针对下半部分加入了 40% 的额外不透明度削减
  const alphaArray = useMemo(() => {
    const arr = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1); 
      let alpha = t;
      if (t < 0.5) {
        alpha *= 0.6; 
      }
      arr[i] = alpha;
    }
    return arr;
  }, [count]);

  useEffect(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.MeshStandardMaterial;
      
      material.onBeforeCompile = (shader) => {
        shader.vertexShader = `
          attribute float instanceAlpha;
          varying float vInstanceAlpha;
          ${shader.vertexShader}
        `.replace(
          '#include <begin_vertex>',
          `#include <begin_vertex>
           vInstanceAlpha = instanceAlpha;`
        );

        shader.fragmentShader = `
          varying float vInstanceAlpha;
          ${shader.fragmentShader}
        `.replace(
          '#include <opaque_fragment>',
          `#include <opaque_fragment>
           gl_FragColor.a *= vInstanceAlpha;`
        );
      };
      material.needsUpdate = true;
    }
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    if (active) {
      growthRef.current = THREE.MathUtils.lerp(growthRef.current, 1, 0.05);
    } else {
      growthRef.current = THREE.MathUtils.lerp(growthRef.current, 0, 0.1);
    }

    const time = state.clock.getElapsedTime();
    const currentGrowth = growthRef.current;

    for (let i = 0; i < count; i++) {
      const t = i / count;
      const y = -4 + t * 8.2;
      const rBase = (1 - (y + 4) / 8.2) * 2.5 + 0.3; 
      
      const r = rBase + (spread * 4) + (explosionOffset * 1.5);
      const angle = (t * Math.PI * 12) + (time * 0.8); 
      
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;

      // 加粗丝带：将基础缩放比例从 0.04 提升至 0.09
      const s = (0.09 + Math.sin(time * 3 + i) * 0.02) * currentGrowth;
      
      dummy.position.set(x, y, z);
      dummy.rotation.set(time * 0.5, i, time * 0.2);
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    
    meshRef.current.instanceMatrix.needsUpdate = true;
    
    if (meshRef.current.material instanceof THREE.MeshStandardMaterial) {
      meshRef.current.material.opacity = currentGrowth * 0.95; 
      meshRef.current.material.emissiveIntensity = currentGrowth * 45;
    }
  });

  return (
    <InstancedMesh ref={meshRef} args={[null, null, count]}>
      <TetrahedronGeometry args={[1, 0]}>
        <BufferAttribute
          attach="attributes-instanceAlpha"
          count={count}
          array={alphaArray}
          itemSize={1}
        />
      </TetrahedronGeometry>
      <MeshStandardMaterial 
        color="#ffff00" 
        emissive="#ffff00" 
        metalness={1} 
        roughness={0} 
        transparent 
        depthWrite={false}
        toneMapped={false} 
      />
    </InstancedMesh>
  );
};

const ChristmasTree: React.FC<ChristmasTreeProps> = ({ power, spread, rotation, isExploded, isPointing }) => {
  const pointsRef = useRef<THREE.Points>(null!);
  const starRef = useRef<THREE.Group>(null!);
  const explosionOffsetRef = useRef(0);

  const particleCount = 15000;
  
  const [positions, initialPositions] = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const initial = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const h = Math.random() * 8;
      const r = (1 - h / 8) * 2.5;
      const angle = Math.random() * Math.PI * 2;
      
      const x = Math.cos(angle) * r;
      const y = h - 4;
      const z = Math.sin(angle) * r;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      initial[i * 3] = x;
      initial[i * 3 + 1] = y;
      initial[i * 3 + 2] = z;
    }
    return [pos, initial];
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    const p = pointsRef.current.geometry.attributes.position;
    
    if (isExploded) {
      explosionOffsetRef.current += delta * 2.8; 
    } else {
      explosionOffsetRef.current = THREE.MathUtils.lerp(explosionOffsetRef.current, 0, 0.1);
    }

    const effectiveSpread = spread + explosionOffsetRef.current;

    for (let i = 0; i < particleCount; i++) {
      const ix = i * 3;
      const iy = i * 3 + 1;
      const iz = i * 3 + 2;

      const offsetX = Math.sin(time * 0.4 + initialPositions[iy]) * 0.05;
      const offsetZ = Math.cos(time * 0.4 + initialPositions[ix]) * 0.05;

      const explodeFactor = power ? effectiveSpread * 14 : 0;
      
      p.array[ix] = initialPositions[ix] + (initialPositions[ix] * explodeFactor) + offsetX;
      p.array[iy] = initialPositions[iy] + (initialPositions[iy] * (explodeFactor * 0.35)) + (Math.sin(time * 0.5) * 0.1);
      p.array[iz] = initialPositions[iz] + (initialPositions[iz] * explodeFactor) + offsetZ;
    }
    
    p.needsUpdate = true;
    pointsRef.current.rotation.y += power ? (0.004 + (rotation * 0.05)) : 0.002;
    
    if (starRef.current) {
      starRef.current.rotation.y += 0.03;
      starRef.current.position.y = 4.2 + (effectiveSpread * 6);
      const s = 1 + (effectiveSpread * 2);
      starRef.current.scale.set(s, s, s);
    }
  });

  return (
    <Group>
      <Stars radius={100} depth={50} count={6000} factor={4} saturation={0} fade speed={1.2} />
      
      <Points ref={pointsRef}>
        <BufferGeometry>
          <BufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
        </BufferGeometry>
        <PointsMaterial
          // 加宽粒子：将 size 从 0.035 提升至 0.06
          size={0.06}
          color={power ? "#93c5fd" : "#0f172a"} 
          transparent
          opacity={power ? 0.9 : 0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </Points>

      {/* 高亮度柠檬黄丝带系统 */}
      <Ribbon active={isPointing} spread={spread} explosionOffset={explosionOffsetRef.current} />

      <Group>
        {Array.from({ length: 12 }).map((_, i) => (
           <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Mesh 
              position={[
                Math.sin(i) * (2.2 + spread * 5 + explosionOffsetRef.current * 1.8), 
                (i - 4) + (spread * 2 + explosionOffsetRef.current), 
                Math.cos(i) * (2.2 + spread * 5 + explosionOffsetRef.current * 1.8)
              ]}
            >
              <SphereGeometry args={[0.07, 12, 12]} />
              <MeshStandardMaterial 
                color={i % 3 === 0 ? "#0ff" : i % 3 === 1 ? "#fff" : "#ffff00"} 
                emissive={i % 3 === 0 ? "#0ff" : i % 3 === 1 ? "#fff" : "#ffff00"} 
                emissiveIntensity={power ? 25 : 0.2}
                transparent
                opacity={power ? 0.95 : 0.2}
              />
            </Mesh>
          </Float>
        ))}
      </Group>

      <Group ref={starRef} position={[0, 4.2, 0]}>
        <Mesh>
          <OctahedronGeometry args={[0.45, 0]} />
          <MeshStandardMaterial 
            color="#bae6fd" 
            emissive="#bae6fd" 
            emissiveIntensity={power ? 20 : 0.5} 
            transparent
            opacity={power ? 1 : 0.4}
          />
        </Mesh>
        <PointLight intensity={power ? 25 : 0.5} color="#bae6fd" distance={12} />
      </Group>
      
      <AmbientLight intensity={power ? 0.3 : 0.05} />
      <PointLight position={[10, 10, 10]} intensity={power ? 2 : 0.1} />
    </Group>
  );
};

export default ChristmasTree;
