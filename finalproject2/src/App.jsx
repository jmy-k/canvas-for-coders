import { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Text3D, Center } from '@react-three/drei';
import { useSpring, animated, config } from '@react-spring/three';
import { Physics, RigidBody } from '@react-three/rapier';
import { EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

import * as THREE from 'three';
import './App.css';

const fragments = [
  { french: "attente", english: "waiting", saying: "tumult of anxiety provoked by waiting for the loved being", connections: ["absence", "angoisse", "dépendence", "conduite"] },
  { french: "absence", english: "absence", saying: "any episode of language which stages the absence of the loved object", connections: ["attente", "angoisse", "dérealité"] },
  { french: "adorable", english: "adorable", saying: "the sentiment of admiration experienced by the subject for the loved being", connections: ["comblement", "dédicace", "déclaration"] },
  { french: "angoisse", english: "anxiety", saying: "the fear of a danger, a wound, an abandonment", connections: ["attente", "absence", "fou", "coeur", "corps", "conduite"] },
  { french: "s'abimer", english: "to be engulfed", saying: "outburst of annihilation which affects the amorous subject in despair or fulfillment.", connections: ["fou", "écorché", "comblement", "annulation"] },
  { french: "gene", english: "embarrassment", saying: "a group scene in which the implicit nature of the amorous relation functions as a constraint and provokes a collective embarrassment which is not spoken", connections: ["facheux", "corps", "déclaration"] },
  { french: "dépendence", english: "dependency", saying: "a figure in which common opinion sees the very condition of the amorous subject, subjugated to the loved object", connections: ["attente", "conduite"] },
  { french: "comblement", english: "fulfillment", saying: "all the delights of the earth", connections: ["adorable", "s'abimer", "corps", "étreinte"] },
  { french: "fou", english: "mad", saying: "it frequently occurs to the amorous subject that he is or is going mad", connections: ["angoisse", "s'abimer", "dérealité", "demons"] },
  { french: "facheux", english: "irksome", saying: "sentiment of slight jealousy which overcomes the amorous subject when he sees the loved being's interest attracted or distracted by persons, objects, or occupations which in his eyes function as so many secondary rivals", connections: ["gene", "image"] },
  { french: "écorché", english: "flayed", saying: "he particular sensibility of the amorous subject, which renders him vulnerable, defenseless to the slightest injuries", connections: ["s'abimer", "corps", "compassion"] },
  { french: "coeur", english: "heart", saying: "this word refers to all kinds of movements and desires, but what is constant is that the heart is constituted into a gift-abject-whether ignored or rejected", connections: ["angoisse", "corps", "dédicace", "je-t'-aime"] },
  { french: "corps", english: "body", saying: "any thought, any feeling, any interest aroused in the amorous subject by the loved body", connections: ["écorché", "coeur", "comblement", "angoisse", "image", "gene", "étreinte"] },
  { french: "image", english: "image", saying: "in the amorous realm, the most painful wounds are inflicted more often by what one sees than by what one knows", connections: ["corps", "dérealité", "facheux", "inconnaissable"] },
  { french: "dédicace", english: "dedication", saying: "an episode of language which accompanies any amorous gift, whether real or projected; and, more generally, every gesture, whether actual or interior, by which the subject dedicates something to the loved bein", connections: ["adorable", "coeur"] },
  { french: "dérealité", english: "disreality", saying: "sentiment of absence and withdrawal of reality experienced by the amorous subject, confronting the world", connections: ["absence", "image", "fou"] },
  { french: "je-t'-aime", english: "i love you", saying: "the figure refers not to the declaration of love, to the avowal, but to the repeated utterance of the love cry", connections: ["coeur", "déclaration", "annulation", "affirmation"] },
  { french: "annulation", english: "annulment", saying: "explosion of language during which the subject manages to annul the loved object under the volume of love itself: by a specifically amorous perversion, it is love the subject loves, not the object", connections: ["s'abimer", "je-t'-aime"] },
  { french: "déclaration", english: "declaration", saying: "the amorous subject's propensity to talk copiously, with repressed feeling, to the loved being, about his love for that being, for himself, for them: the declaration does not bear upon the avowal of love, but upon the endlessly glossed form of the amorous relatio", connections: ["adorable", "je-t'-aime", "gene"] },
  { french: "conduite", english: "behavior", saying: "a deliberative figure: the amorous subject raises (generally) futile problems of behavior: faced with this or that alternative, what is to be done? How is he to act", connections: ["dépendence", "angoisse", "attente"] },
  { french: "compassion", english: "compassion", saying: "the subject experiences a sentiment of violent compassion with regard to the loved object each time he sees, feels, or knows the loved object is unhappy or in danger, for whatever reason external to the amorous relation itself", connections: ["écorché", "insupportable"] },
  { french: "affirmation", english: "affirmation", saying: "against and in spite of everything, the subject affirms love as value", connections: ["je-t'-aime", "insupportable"] },
  { french: "inconnaissable", english: "unknowable", saying: "efforts of the amorous subject to understand and define the loved being 'in itself,' by some standard of character type, psychological or neurotic personality, independent of the particular data of the amorous relation", connections: ["image", "monstreux"] },
  { french: "monstreux", english: "monstrous", saying: "the subject suddenly realizes that he is imprisoning the loved object in a net of tyrannies: he has been pitiable, now he becomes monstrous.", connections: ["nuit", "inconnaissable", "demons"] },
  { french: "nuit", english: "night", saying: "subject suddenly realizes that he is imprisoning the loved object in a net of tyrannies: he has been pitiable, now he becomes monstrous.", connections: ["monstreux"] },
  { french: "insupportable", english: "unbearable", saying: "the sentiment of an accumulation of amorous sufferings explodes in this cry : 'This can't go on...'", connections: ["compassion", "affirmation"] },
  { french: "étreinte", english: "embrace", saying: "the gesture of the amorous embrace seems to fulfil!, for a time, the subject's dream of total union with the loved being", connections: ["comblement", "corps"] },
  { french: "demons", english: "demons", saying: "it occasionally seems to the amorous subject that he is possessed by a demon of language which impels him to injure himself and to expel himself-according to Goethe's expression-from the paradise which at other moments the amorous relation constitutes for him.", connections: ["fou", "monstreux"] },
];

// falling english word
function FallingEnglishWord({ english, spawnPosition, id }) {
  const springs = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: config.gentle
  });

  return (
    <RigidBody
      position={spawnPosition}
      colliders="cuboid"
      restitution={0.5}
      friction={0.1}
    >
      <Text3D
        font="./fonts/Inconsolata_Regular.json"
        size={0.8}
        height={0.15}
        curveSegments={12}
        castShadow
      >
        {english}
        <animated.meshStandardMaterial
          color={0xd91e36}
          transparent
          opacity={springs.opacity}
        />
      </Text3D>
    </RigidBody>
  );
}

// particles
function LetterParticle({ shouldShow, index }) {
  const meshRef = useRef();

  // random values using useMemo
  const particleData = useMemo(() => ({
    velocity: {
      x: (Math.random() - 0.5) * 0.1,
      y: (Math.random() - 0.5) * 0.1,
      z: (Math.random() - 0.5) * 0.1
    },
    startPosition: [
      (Math.random() - 0.5) * 15,
      (Math.random() - 0.5) * 8,
      (Math.random() - 0.5) * 3
    ]
  }), []);

  // opacity anim
  const springs = useSpring({
    opacity: shouldShow ? 0.8 : 0,
    config: { ...config.molasses, delay: index * 20 }
  });

  useFrame(() => {
    if (!meshRef.current) return;

    meshRef.current.position.x += particleData.velocity.x;
    meshRef.current.position.y += particleData.velocity.y;
    meshRef.current.position.z += particleData.velocity.z;

    meshRef.current.rotation.x += 0.02;
    meshRef.current.rotation.y += 0.02;
  });

  return (
    <animated.mesh
      ref={meshRef}
      position={particleData.startPosition}
    >
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <animated.meshStandardMaterial
        color={0xef7674}
        transparent
        opacity={springs.opacity}
        metalness={0.1}
        roughness={0.8}
      />
    </animated.mesh>
  );
}

// connectinos component
function ConnectionLines({ fragments, centerPositions, shouldShow, selectedWords }) {
  // find connections for all selected words
  const activeConnections = useMemo(() => {
    if (!selectedWords || selectedWords.length === 0) return [];

    const connections = [];
    const addedConnections = new Set(); // unique connections

    selectedWords.forEach(selectedWord => {
      const selectedIndex = fragments.findIndex(f => f.french === selectedWord);

      if (selectedIndex === -1) return;

      const selectedFragment = fragments[selectedIndex];
      if (!selectedFragment.connections) return;

      selectedFragment.connections.forEach(connectedWord => {
        const connectedIndex = fragments.findIndex(f => f.french === connectedWord);

        if (connectedIndex !== -1) {
          const connectedFragment = fragments[connectedIndex];

          // if mutual connection
          if (connectedFragment.connections &&
            connectedFragment.connections.includes(selectedFragment.french)) {

            // unique key for this connection (order doesn't matter)
            const connectionKey = [selectedIndex, connectedIndex].sort().join('-');

            if (!addedConnections.has(connectionKey)) {
              connections.push({ from: selectedIndex, to: connectedIndex });
              addedConnections.add(connectionKey);
            }
          }
        }
      });
    });

    return connections;
  }, [fragments, selectedWords]);

  const springs = useSpring({
    opacity: shouldShow && selectedWords.length > 0 ? 0.8 : 0,
    config: config.gentle
  });

  return (
    <>
      {activeConnections.map((connection, i) => {
        const startPos = centerPositions[connection.from];
        const endPos = centerPositions[connection.to];

        if (!startPos || !endPos) return null;

        const start = new THREE.Vector3(startPos.x, startPos.y, startPos.z);
        const end = new THREE.Vector3(endPos.x, endPos.y, endPos.z);

        const points = [start, end];
        const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

        return (
          <animated.line key={`line-${i}`} geometry={lineGeometry}>
            <animated.lineBasicMaterial
              color={0xec5766}
              transparent
              opacity={springs.opacity}
            />
          </animated.line>
        );
      })}
    </>
  );
}

// sayings marquee
function CircularMarquee({ saying, position }) {
  const groupRef = useRef();
  const letterRefs = useRef([]);
  const radius = 5;
  const numChars = saying.length;

  // fade in
  const springs = useSpring({
    opacity: 1,
    from: { opacity: 0 },
    config: config.gentle
  });

  useFrame(({ clock }) => {
    if (groupRef.current) {
      const rotation = clock.getElapsedTime() * 0.3;
      groupRef.current.rotation.y = -rotation;

      // rotate each letter to keep them facing outward
      letterRefs.current.forEach((letterGroup, i) => {
        if (letterGroup) {
          const angle = (i / numChars) * Math.PI * 2;
          letterGroup.rotation.y = -rotation - angle;
        }
      });
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {saying.split('').map((char, i) => {
        const angle = -(i / numChars) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        return (
          <group
            key={i}
            position={[x, 0, z]}
            ref={(el) => (letterRefs.current[i] = el)}
          >
            <Text3D
              font="./fonts/Inconsolata_Regular.json"
              size={0.3}
              height={0.05}
              curveSegments={8}
            >
              {char}
              <animated.meshStandardMaterial
                color={0xda344d}
                transparent
                opacity={springs.opacity}
                metalness={0.1}
                roughness={0.8}
              />
            </Text3D>
          </group>
        );
      })}
    </group>
  );
}

// french word
function FrenchWord({ fragment, position, shouldShow, index, onSelect, isSelected, onCenterUpdate, cameraMoving, heartbeatPhase, onSpawnEnglish }) {
  const meshRef = useRef();
  const groupRef = useRef();
  const initialized = useRef(false);
  const [isHovered, setIsHovered] = useState(false);
  const [centerPosition, setCenterPosition] = useState(position);

  // scale and opacity anim
  const springs = useSpring({
    scale: shouldShow ? 1 : 0,
    opacity: shouldShow ? 1 : 0,
    config: { ...config.wobbly, delay: index * 150 }
  });

  // anim size increase and pink color
  const selectionSpring = useSpring({
    selectedScale: isSelected ? 1.5 : 1,
    config: config.gentle
  });

  const color = isSelected ? 0xd91e36 : 0xec5766;

  useFrame(() => {
    if (!groupRef.current || !meshRef.current) return;

    if (!initialized.current) {
      groupRef.current.position.set(position[0], position[1], position[2]);
      initialized.current = true;
    }

    // only heartbeat pulsing when camera is NOT moving
    if (!cameraMoving && shouldShow && initialized.current) {
      // sine wave heart beat
      const beat1 = Math.sin(heartbeatPhase) * 0.5 + 0.5;
      const beat2 = Math.sin(heartbeatPhase * 2 + Math.PI / 4) * 0.3 + 0.7;
      const heartbeat = Math.max(beat1, beat2);

      const pulseScale = 1.0 + heartbeat * 0.15;
      const finalScale = springs.scale.get() * pulseScale * selectionSpring.selectedScale.get();
      groupRef.current.scale.setScalar(finalScale);
    } else if (cameraMoving && initialized.current) {
      // reset scale to normal when camera is moving (but still apply selection scale)
      const finalScale = springs.scale.get() * selectionSpring.selectedScale.get();
      groupRef.current.scale.setScalar(finalScale);
    }

    // center position of this text mesh
    if (meshRef.current.geometry.boundingBox === null) {
      meshRef.current.geometry.computeBoundingBox();
    }

    const boundingBox = meshRef.current.geometry.boundingBox;
    if (boundingBox) {
      const center = new THREE.Vector3();
      boundingBox.getCenter(center);

      // transform to world coordinates
      const worldCenter = center.clone();
      groupRef.current.localToWorld(worldCenter);

      // local center position state for marquee
      setCenterPosition([worldCenter.x, worldCenter.y, worldCenter.z]);

      onCenterUpdate(index, worldCenter);
    }
  });

  return (
    <>
      <animated.group
        ref={groupRef}
        scale={springs.scale}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(fragment.french);
          // spawn falling english word at the center
          onSpawnEnglish(fragment.english, centerPosition);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'pointer';
          setIsHovered(true);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          document.body.style.cursor = 'default';
          setIsHovered(false);
        }}
      >
        <Text3D
          font="./fonts/Inconsolata_Regular.json"
          ref={meshRef}
          size={1}
          height={0.2}
          curveSegments={12}
        >
          {fragment.french}
          <animated.meshStandardMaterial
            color={color}
            transparent
            opacity={springs.opacity}
            metalness={0.1}
            roughness={0.8}
          />
        </Text3D>
      </animated.group>

      {/* marquee on hover or selected */}
      {(isHovered || isSelected) && shouldShow && (
        <CircularMarquee
          saying={fragment.saying}
          position={centerPosition}
        />
      )}
    </>
  );
}

//title
function MainText({ shouldDissolve }) {
  const meshRef = useRef();

  // opacity anim
  const springs = useSpring({
    opacity: shouldDissolve ? 0 : 0.8,
    config: config.slow
  });

  return (
    <Center position={[0, 0, -100]}>
      <Text3D
        font="./fonts/Inconsolata_Regular.json"
        ref={meshRef}
        size={90}
        height={1}
        curveSegments={12}
        scale={0.2}
      >
        {`so it is a lover who speaks\nand who says...`}
        <animated.meshStandardMaterial
          color={0xef7674}
          transparent
          opacity={springs.opacity}
          metalness={0.1}
          roughness={0.8}
        />
      </Text3D>
    </Center>
  );
}

// camera movement tracker
function CameraTracker({ onMovementThreshold, onCameraMoving }) {
  const { camera } = useThree();
  const lastPosition = useRef(new THREE.Vector3());
  const totalMovement = useRef(0);
  const hasTriggered = useRef(false);
  const isReady = useRef(false);
  const movementTimer = useRef(null);

  useEffect(() => {
    lastPosition.current.copy(camera.position);
    // delay before starting to track movement
    const timer = setTimeout(() => {
      isReady.current = true;
    }, 500);
    return () => clearTimeout(timer);
  }, [camera]);

  useFrame(() => {
    if (!isReady.current) return;

    const distance = camera.position.distanceTo(lastPosition.current);

    if (distance > 0.05) {
      totalMovement.current += distance;
      lastPosition.current.copy(camera.position);

      onCameraMoving(true);

      if (movementTimer.current) {
        clearTimeout(movementTimer.current);
      }

      // set timer to detect when movement stops
      movementTimer.current = setTimeout(() => {
        onCameraMoving(false);
      }, 100);

      if (totalMovement.current > 5 && !hasTriggered.current) {
        hasTriggered.current = true;
        onMovementThreshold();
      }
    }
  });

  return null;
}

// scene component
function Scene() {
  const [shouldDissolve, setShouldDissolve] = useState(false);
  const [selectedWords, setSelectedWords] = useState([]);
  const [centerPositions, setCenterPositions] = useState({});
  const [cameraMoving, setCameraMoving] = useState(false);
  const [fallingWords, setFallingWords] = useState([]);
  const heartbeatPhase = useRef(0);
  const wordIdCounter = useRef(0);

  const positions = [
    [-5, 3, -1],
    [6, -1, 0.5],
    [-7, -3, 1.5],
    [3, 4, -2],
    [-9, 1, 2],
    [8, -4, -1.5],
    [-4, 5, 1],
    [10, 2, -2.5],
    [-11, -2, 1.5],
    [7, -5, 2.5],
    [-2, 4, -2],
    [9, 3, 1.5],
    [4, -4, -2.5],
    [-8, 5, -1.5],
    [11, -1.5, 1],
    [-3, -3, 2],
    [6, 6, -1],
    [-10, -4, -2],
    [3.5, -2, 3],
    [-6, 1.5, -2.5],
    [5, -3, 0.5],
    [-4, -5, 2.5],
    [8, 4.5, -1],
    [-7, 2, -2],
    [2, -1, 1.5],
    [-9, -1, -1],
    [10, 1, 2],
    [-5, -4, 0]
  ];

  useFrame(() => {
    if (!cameraMoving) {
      heartbeatPhase.current += 0.03;
    }
  });

  const handleWordSelect = (word) => {
    // toggle: if clicking a word that's already selected, remove it; otherwise add it
    setSelectedWords(prev =>
      prev.includes(word)
        ? prev.filter(w => w !== word)
        : [...prev, word]
    );
  };

  const handleCenterUpdate = (index, center) => {
    setCenterPositions(prev => ({
      ...prev,
      [index]: center
    }));
  };

  const handleSpawnEnglish = (english, position) => {
    const id = wordIdCounter.current++;
    setFallingWords(prev => [...prev, { id, english, position }]);
  };

  return (
    <>
      {/* Camera */}
      <PerspectiveCamera makeDefault position={[0, 0, 30]} fov={75} />

      {/* Controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
      />

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color={0xffffff} />
      <hemisphereLight
        skyColor={0xffffff}
        groundColor={0xec5766}
        intensity={0.3}
      />

      {/* Camera Movement Tracker */}
      <CameraTracker
        onMovementThreshold={() => setShouldDissolve(true)}
        onCameraMoving={setCameraMoving}
      />

      {/* Main Text */}
      <MainText shouldDissolve={shouldDissolve} />

      {/* Physics World */}
      <Physics gravity={[0, -9.81, 0]}>
        {/* Ground Plane - invisible but receives shadows */}
        <RigidBody type="fixed" position={[0, -10, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[200, 200]} />
            <shadowMaterial transparent opacity={0.5} color={0x000000} />
          </mesh>
        </RigidBody>

        {/* Falling English Words */}
        {fallingWords.map(word => (
          <FallingEnglishWord
            key={word.id}
            english={word.english}
            spawnPosition={word.position}
            id={word.id}
          />
        ))}
      </Physics>

      {/* Connection Lines */}
      <ConnectionLines
        fragments={fragments}
        centerPositions={centerPositions}
        shouldShow={shouldDissolve}
        selectedWords={selectedWords}
      />

      {/* Letter Particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <LetterParticle key={i} shouldShow={shouldDissolve} index={i} />
      ))}

      {/* French Words */}
      {fragments.map((fragment, index) => (
        <FrenchWord
          key={fragment.french}
          fragment={fragment}
          position={positions[index]}
          shouldShow={shouldDissolve}
          index={index}
          onSelect={handleWordSelect}
          isSelected={selectedWords.includes(fragment.french)}
          onCenterUpdate={handleCenterUpdate}
          cameraMoving={cameraMoving}
          heartbeatPhase={heartbeatPhase.current}
          onSpawnEnglish={handleSpawnEnglish}
        />
      ))}
    </>
  );
}

// App Component
function App() {
  return (
    <Canvas shadows>
      <color attach="background" args={[0xc42348]} />
      <Scene />
      <EffectComposer>
        <Noise
          premultiply
          blendFunction={BlendFunction.ADD}
          opacity={0.3}
        />
        <Vignette
          offset={0.3}
          darkness={0.5}
          eskil={false}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Canvas>
  );
}

export default App;