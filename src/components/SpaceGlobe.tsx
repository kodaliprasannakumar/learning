import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
// Work around the missing module declaration by using dynamic import
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import OpenAI from 'openai';

// Space questions related to specific planets in our solar system
const PLANET_QUESTIONS = [
  {
    planet: "Sun",
    question: "Why is the Sun so hot?",
    color: 0xFDB813, // bright yellow-orange
    texture: "/textures/sun.jpg",
    rotationSpeed: 0.001
  },
  {
    planet: "Mercury",
    question: "Why is Mercury the fastest planet?",
    color: 0x999999, // gray
    texture: "/textures/mercury.jpg",
    rotationSpeed: 0.004,
    orbitSpeed: 0.008
  },
  {
    planet: "Venus",
    question: "Why is Venus called Earth's twin?",
    color: 0xE6C229, // yellowy-orange
    texture: "/textures/venus.jpg",
    rotationSpeed: 0.002, // Venus rotates very slowly in reality
    orbitSpeed: 0.006
  },
  {
    planet: "Earth",
    question: "Why do we have seasons on Earth?",
    color: 0x1A73E8, // blue
    texture: "/textures/earth.jpg",
    rotationSpeed: 0.005,
    orbitSpeed: 0.005
  },
  {
    planet: "Mars",
    question: "Why is Mars red?",
    color: 0xE34234, // red
    texture: "/textures/mars.jpg",
    rotationSpeed: 0.005,
    orbitSpeed: 0.004
  },
  {
    planet: "Jupiter",
    question: "What is Jupiter's Great Red Spot?",
    color: 0xD5A150, // orange-brown
    texture: "/textures/jupiter.jpg",
    rotationSpeed: 0.008, // Jupiter rotates quite fast
    orbitSpeed: 0.002
  },
  {
    planet: "Saturn",
    question: "What are Saturn's rings made of?",
    color: 0xEAD6B8, // beige
    texture: "/textures/saturn.jpg",
    rotationSpeed: 0.007,
    orbitSpeed: 0.0015
  },
  {
    planet: "Uranus",
    question: "Why does Uranus rotate on its side?",
    color: 0x5B92E5, // light blue
    texture: "/textures/uranus.jpg",
    rotationSpeed: 0.006,
    orbitSpeed: 0.001
  },
  {
    planet: "Neptune",
    question: "Why is Neptune so windy?",
    color: 0x3E66F9, // dark blue
    texture: "/textures/neptune.jpg",
    rotationSpeed: 0.006,
    orbitSpeed: 0.0008
  },
  {
    planet: "Pluto",
    question: "Why isn't Pluto a planet anymore?",
    color: 0xCCCCCC, // light gray
    texture: "/textures/pluto.jpg",
    rotationSpeed: 0.003,
    orbitSpeed: 0.0005
  },
  {
    planet: "Asteroids",
    question: "What is the asteroid belt?",
    color: 0x8B8680, // gray-brown
    texture: null,
    rotationSpeed: 0
  },
  {
    planet: "Comets", 
    question: "What are comets made of?",
    color: 0x95C8D8, // icy blue
    texture: null,
    rotationSpeed: 0,
    orbitSpeed: 0.001
  }
];

interface SpaceGlobeProps {
  onAnswerGenerated?: (question: string, answer: string) => void;
  credits?: number;
}

const SpaceGlobe: React.FC<SpaceGlobeProps> = ({ onAnswerGenerated, credits = 0 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number | null>(null);
  
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  
  // Convert credits to number to ensure proper comparison
  const creditAmount = Number(credits);
  
  // OpenAI instance
  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  // Log the credits value to verify it's being received correctly
  useEffect(() => {
    console.log("SpaceGlobe received credits:", credits);
    console.log("Credits as number:", creditAmount);
    console.log("Credits <= 0:", creditAmount <= 0);
  }, [credits, creditAmount]);

  // Setup Three.js
  useEffect(() => {
    // Don't initialize if credits are 0
    if (!containerRef.current || creditAmount <= 0) return;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000814);
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 20, 50);
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    // Enable better lighting
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Create orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 100;
    controls.maxPolarAngle = Math.PI / 1.5;
    controlsRef.current = controls;
    
    // Texture loader
    const textureLoader = new THREE.TextureLoader();
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.2);
    scene.add(ambientLight);
    
    // Add directional light for general illumination
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
    directionalLight.position.set(0, 10, 10);
    scene.add(directionalLight);
    
    // Create starfield background
    const createStarfield = () => {
      const stars = new THREE.BufferGeometry();
      const starsVertices = [];
      const starColors = [];
      
      for (let i = 0; i < 10000; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        starsVertices.push(x, y, z);
        
        // Random star colors: white, blue-ish, yellow-ish
        const colorChoice = Math.random();
        if (colorChoice > 0.8) {
          // Blue-ish stars
          starColors.push(0.7, 0.8, 1);
        } else if (colorChoice > 0.6) {
          // Yellow-ish stars
          starColors.push(1, 0.9, 0.6);
        } else {
          // White stars
          starColors.push(1, 1, 1);
        }
      }
      
      stars.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
      stars.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
      
      const starMaterial = new THREE.PointsMaterial({
        size: 0.7,
        transparent: true,
        opacity: 0.8,
        vertexColors: true,
        sizeAttenuation: true
      });
      
      const starMesh = new THREE.Points(stars, starMaterial);
      scene.add(starMesh);
      
      // Add some brighter stars with glow
      const brightStars = new THREE.BufferGeometry();
      const brightStarVertices = [];
      
      for (let i = 0; i < 100; i++) {
        const x = THREE.MathUtils.randFloatSpread(1000);
        const y = THREE.MathUtils.randFloatSpread(1000);
        const z = THREE.MathUtils.randFloatSpread(1000);
        brightStarVertices.push(x, y, z);
      }
      
      brightStars.setAttribute('position', new THREE.Float32BufferAttribute(brightStarVertices, 3));
      
      const brightStarMaterial = new THREE.PointsMaterial({
        size: 2,
        transparent: true,
        opacity: 0.9,
        color: 0xFFFFFF,
        sizeAttenuation: true
      });
      
      const brightStarMesh = new THREE.Points(brightStars, brightStarMaterial);
      scene.add(brightStarMesh);
      
      // Create a few tiny colored nebulas
      for (let i = 0; i < 5; i++) {
        const nebulaParticleCount = 500;
        const nebulaGeometry = new THREE.BufferGeometry();
        const nebulaVertices = [];
        const nebulaColors = [];
        
        // Random nebula position far from center
        const nebulaX = THREE.MathUtils.randFloatSpread(1000) + (Math.random() > 0.5 ? 500 : -500);
        const nebulaY = THREE.MathUtils.randFloatSpread(1000);
        const nebulaZ = THREE.MathUtils.randFloatSpread(1000) + (Math.random() > 0.5 ? 500 : -500);
        
        // Random nebula color
        const nebulaHue = Math.random();
        let nebulaColor;
        
        if (nebulaHue < 0.33) {
          nebulaColor = new THREE.Color(0x4477aa); // Blue
        } else if (nebulaHue < 0.66) {
          nebulaColor = new THREE.Color(0xaa4477); // Purple
        } else {
          nebulaColor = new THREE.Color(0x44aa77); // Green
        }
        
        for (let j = 0; j < nebulaParticleCount; j++) {
          // Create a cloud-like distribution
          const x = nebulaX + THREE.MathUtils.randFloatSpread(200);
          const y = nebulaY + THREE.MathUtils.randFloatSpread(200);
          const z = nebulaZ + THREE.MathUtils.randFloatSpread(200);
          
          nebulaVertices.push(x, y, z);
          
          // Adjust color opacity based on distance from center
          const distFromCenter = Math.sqrt(
            Math.pow(x - nebulaX, 2) + 
            Math.pow(y - nebulaY, 2) + 
            Math.pow(z - nebulaZ, 2)
          );
          
          const opacity = Math.max(0, 1 - (distFromCenter / 100));
          
          nebulaColors.push(
            nebulaColor.r,
            nebulaColor.g,
            nebulaColor.b
          );
        }
        
        nebulaGeometry.setAttribute('position', new THREE.Float32BufferAttribute(nebulaVertices, 3));
        nebulaGeometry.setAttribute('color', new THREE.Float32BufferAttribute(nebulaColors, 3));
        
        const nebulaMaterial = new THREE.PointsMaterial({
          size: 3,
          transparent: true,
          opacity: 0.2,
          vertexColors: true,
          sizeAttenuation: true,
          blending: THREE.AdditiveBlending
        });
        
        const nebulaMesh = new THREE.Points(nebulaGeometry, nebulaMaterial);
        scene.add(nebulaMesh);
      }
    };
    
    // Create a flat circle representing the orbital plane
    const createOrbitalPlane = () => {
      const planeGeometry = new THREE.CircleGeometry(60, 64);
      const planeMaterial = new THREE.MeshBasicMaterial({
        color: 0x333366,
        transparent: true,
        opacity: 0.1,
        side: THREE.DoubleSide
      });
      
      const plane = new THREE.Mesh(planeGeometry, planeMaterial);
      plane.rotation.x = Math.PI / 2;
      plane.position.y = -0.5;
      scene.add(plane);
      
      // Add grid lines
      const gridHelper = new THREE.GridHelper(120, 20, 0x444477, 0x444477);
      gridHelper.position.y = -0.4;
      scene.add(gridHelper);
    };
    
    // Create the sun
    const createSun = () => {
      const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
      
      // Load sun texture
      const sunQuestion = PLANET_QUESTIONS.find(q => q.planet === "Sun");
      let sunMaterial;
      
      if (sunQuestion && sunQuestion.texture) {
        const texture = textureLoader.load(sunQuestion.texture);
        sunMaterial = new THREE.MeshBasicMaterial({
          map: texture,
        });
      } else {
        // Fallback to color if texture not available
        sunMaterial = new THREE.MeshBasicMaterial({
          color: 0xFFAA33
        });
      }
      
      const sun = new THREE.Mesh(sunGeometry, sunMaterial);
      
      // Add glow effect
      const sunGlowGeometry = new THREE.SphereGeometry(5.6, 32, 32);
      const sunGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFAA33,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide
      });
      
      const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
      sun.add(sunGlow);
      
      // Add stronger glow
      const outerGlowGeometry = new THREE.SphereGeometry(7, 32, 32);
      const outerGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFDD88,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
      });
      
      const outerGlow = new THREE.Mesh(outerGlowGeometry, outerGlowMaterial);
      sun.add(outerGlow);
      
      // Add light
      const sunLight = new THREE.PointLight(0xFFFFFF, 2, 300);
      sun.add(sunLight);
      
      // Add a second, yellow-tinted light for atmosphere
      const sunAtmosphereLight = new THREE.PointLight(0xFFEEBB, 0.8, 150);
      sun.add(sunAtmosphereLight);
      
      scene.add(sun);
      
      // Add sun question
      if (sunQuestion) {
        const questionObj = createQuestionIndicator(sunQuestion.question, sunQuestion.color);
        questionObj.position.set(0, 7, 0);
        scene.add(questionObj);
      }
      
      return sun;
    };
    
    // Create orbit rings
    const createOrbitRing = (radius: number) => {
      const ringGeometry = new THREE.RingGeometry(radius - 0.1, radius + 0.1, 128);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x666666,
        transparent: true,
        opacity: 0.4,
        side: THREE.DoubleSide
      });
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      scene.add(ring);
      
      return ring;
    };
    
    // Create a question indicator
    const createQuestionIndicator = (question: string, color: number) => {
      const group = new THREE.Group();
      
      // Create question mark sphere
      const sphereGeometry = new THREE.SphereGeometry(0.6, 16, 16);
      const sphereMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.8
      });
      
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      
      // Create orbit ring around question
      const ringGeometry = new THREE.RingGeometry(0.8, 0.9, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide
      });
      
      const ring = new THREE.Mesh(ringGeometry, ringMaterial);
      ring.rotation.x = Math.PI / 2;
      
      group.add(sphere);
      group.add(ring);
      
      // Store question data
      group.userData = {
        question,
        isQuestion: true,
        planet: question
      };
      
      return group;
    };
    
    // Create a planet with a question
    const createPlanet = (name: string, radius: number, orbitRadius: number, color: number) => {
      const planetGeometry = new THREE.SphereGeometry(radius, 32, 32);
      
      // Find planet data and texture
      const planetData = PLANET_QUESTIONS.find(q => q.planet === name);
      let planetMaterial;
      
      if (planetData && planetData.texture) {
        // Use texture if available
        const texture = textureLoader.load(planetData.texture);
        planetMaterial = new THREE.MeshPhongMaterial({ 
          map: texture,
          shininess: 25,
          specular: new THREE.Color(0x333333)
        });
      } else {
        // Fallback to color
        planetMaterial = new THREE.MeshPhongMaterial({ 
          color,
          shininess: 25,
          specular: new THREE.Color(0x333333)
        });
      }
      
      const planet = new THREE.Mesh(planetGeometry, planetMaterial);
      
      // Add subtle glow to each planet
      const glowColor = planetData ? new THREE.Color(planetData.color) : new THREE.Color(color);
      const glowSize = radius * 1.2;
      const glowGeometry = new THREE.SphereGeometry(glowSize, 32, 32);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: glowColor,
        transparent: true,
        opacity: 0.1,
        side: THREE.BackSide
      });
      
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      planet.add(glow);
      
      // Create a planet group to handle positioning
      const planetGroup = new THREE.Group();
      
      // Add the planet to the group
      planetGroup.add(planet);
      
      // Position planet group in its orbit
      const angle = Math.random() * Math.PI * 2;
      planetGroup.position.x = Math.cos(angle) * orbitRadius;
      planetGroup.position.z = Math.sin(angle) * orbitRadius;
      
      // Store planet data on both the group and the mesh
      planetGroup.userData = {
        name,
        isPlanet: true,
        orbitRadius,
        orbitAngle: angle,
        orbitSpeed: planetData?.orbitSpeed || 0
      };
      
      // Set the same userData on the planet mesh
      planet.userData = {
        name,
        isPlanet: true,
        rotationSpeed: planetData?.rotationSpeed || 0.005
      };
      
      scene.add(planetGroup);
      
      // Find question for this planet
      const planetQuestion = PLANET_QUESTIONS.find(q => q.planet === name);
      if (planetQuestion) {
        const questionObj = createQuestionIndicator(planetQuestion.question, planetQuestion.color);
        questionObj.position.set(0, radius * 1.8, 0);
        planet.add(questionObj);
      }
      
      // Add special features for specific planets
      if (name === "Saturn") {
        // Add rings to Saturn
        const ringGeometry = new THREE.RingGeometry(radius * 1.4, radius * 2.0, 64);
        const ringTexture = textureLoader.load("/textures/saturn_rings.png");
        const ringMaterial = new THREE.MeshPhongMaterial({
          map: ringTexture,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.9,
          shininess: 25,
          specular: new THREE.Color(0x666666)
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.rotation.x = Math.PI / 2;
        planet.add(ring);
      } else if (name === "Earth") {
        // Add clouds to Earth
        const cloudGeometry = new THREE.SphereGeometry(radius * 1.02, 32, 32);
        const cloudTexture = textureLoader.load("/textures/earth_clouds.png");
        const cloudMaterial = new THREE.MeshLambertMaterial({
          map: cloudTexture,
          transparent: true,
          opacity: 0.6
        });
        const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);
        planet.add(clouds);
        
        // Add faint atmosphere glow
        const atmosphereGeometry = new THREE.SphereGeometry(radius * 1.15, 32, 32);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
          color: 0x8888ff,
          transparent: true,
          opacity: 0.15,
          side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        planet.add(atmosphere);
      } else if (name === "Jupiter") {
        // Add a point light to Jupiter to simulate its radiation
        const jupiterLight = new THREE.PointLight(0xffaa66, 0.3, 10);
        jupiterLight.position.set(0, 0, 0);
        planet.add(jupiterLight);
      }
      
      return planetGroup;
    };
    
    // Create asteroid belt
    const createAsteroidBelt = (innerRadius: number, outerRadius: number) => {
      const asteroidCount = 1000;
      const asteroidGeometry = new THREE.BufferGeometry();
      const asteroidVertices = [];
      
      for (let i = 0; i < asteroidCount; i++) {
        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        const angle = Math.random() * Math.PI * 2;
        
        const x = Math.cos(angle) * radius;
        const y = (Math.random() - 0.5) * 0.3; // Slight height variation
        const z = Math.sin(angle) * radius;
        
        asteroidVertices.push(x, y, z);
      }
      
      asteroidGeometry.setAttribute('position', new THREE.Float32BufferAttribute(asteroidVertices, 3));
      
      const asteroidMaterial = new THREE.PointsMaterial({
        color: 0xBBAA99,
        size: 0.15,
        sizeAttenuation: true
      });
      
      const asteroids = new THREE.Points(asteroidGeometry, asteroidMaterial);
      scene.add(asteroids);
      
      // Add asteroid belt question
      const asteroidQuestion = PLANET_QUESTIONS.find(q => q.planet === "Asteroids");
      if (asteroidQuestion) {
        const questionObj = createQuestionIndicator(asteroidQuestion.question, asteroidQuestion.color);
        questionObj.position.set((innerRadius + outerRadius) / 2, 2, 0);
        scene.add(questionObj);
      }
      
      return asteroids;
    };
    
    // Create a comet
    const createComet = () => {
      const cometGroup = new THREE.Group();
      
      // Comet nucleus
      const cometGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const cometMaterial = new THREE.MeshBasicMaterial({
        color: 0xFFFFFF
      });
      
      const comet = new THREE.Mesh(cometGeometry, cometMaterial);
      cometGroup.add(comet);
      
      // Comet tail - particle system
      const tailParticleCount = 200;
      const tailParticles = new THREE.BufferGeometry();
      const tailPositions = new Float32Array(tailParticleCount * 3);
      const tailColors = new Float32Array(tailParticleCount * 3);
      
      for (let i = 0; i < tailParticleCount; i++) {
        const distance = (i / tailParticleCount) * 6; // Longer tail
        const spread = 0.2 * distance; // Wider spread as we get further
        
        // Position with spread that increases with distance
        tailPositions[i * 3] = -distance;
        tailPositions[i * 3 + 1] = THREE.MathUtils.randFloatSpread(spread);
        tailPositions[i * 3 + 2] = THREE.MathUtils.randFloatSpread(spread);
        
        // Color gradient from white to blue to transparent
        const intensity = 1 - (i / tailParticleCount);
        tailColors[i * 3] = intensity;
        tailColors[i * 3 + 1] = intensity;
        tailColors[i * 3 + 2] = Math.min(1, intensity * 1.5); // More blue in the tail
      }
      
      tailParticles.setAttribute('position', new THREE.BufferAttribute(tailPositions, 3));
      tailParticles.setAttribute('color', new THREE.BufferAttribute(tailColors, 3));
      
      const tailMaterial = new THREE.PointsMaterial({
        size: 0.2,
        transparent: true,
        opacity: 0.8,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
      });
      
      const tail = new THREE.Points(tailParticles, tailMaterial);
      cometGroup.add(tail);
      
      // Create a glow around the nucleus
      const glowGeometry = new THREE.SphereGeometry(0.7, 16, 16);
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x88CCFF,
        transparent: true,
        opacity: 0.4,
        side: THREE.BackSide
      });
      const glow = new THREE.Mesh(glowGeometry, glowMaterial);
      cometGroup.add(glow);
      
      // Position comet and set orbit parameters
      const distance = 60;
      const angle = Math.PI / 4;
      const inclination = Math.PI / 6; // Tilt from orbital plane
      
      // Position the comet
      cometGroup.position.set(
        Math.cos(angle) * distance,
        Math.sin(inclination) * distance,
        Math.sin(angle) * distance
      );
      
      // Store comet data
      cometGroup.userData = {
        isComet: true,
        orbitDistance: distance,
        orbitAngle: angle,
        orbitInclination: inclination,
        orbitSpeed: 0.002,
        name: "Comet"
      };
      
      // Rotate the tail to point away from sun
      tail.rotation.z = Math.PI;
      
      scene.add(cometGroup);
      
      // Add comet question
      const cometQuestion = PLANET_QUESTIONS.find(q => q.planet === "Comets");
      if (cometQuestion) {
        const questionObj = createQuestionIndicator(cometQuestion.question, cometQuestion.color);
        questionObj.position.set(0, 1, 0);
        cometGroup.add(questionObj);
      }
      
      return cometGroup;
    };
    
    // Build the solar system
    createStarfield();
    createOrbitalPlane();
    
    // Create sun at the center
    createSun();
    
    // Create orbital rings and planets
    const orbitalDistances = [
      10, // Mercury
      15, // Venus
      20, // Earth
      25, // Mars
      35, // Asteroid belt inner
      40, // Asteroid belt outer
      45, // Jupiter
      52, // Saturn
      59, // Uranus
      66, // Neptune
      74  // Pluto
    ];
    
    // Create orbit rings
    orbitalDistances.forEach((distance, index) => {
      if (index !== 4 && index !== 5) { // Skip asteroid belt indexes
        createOrbitRing(distance);
      }
    });
    
    // Create planets
    createPlanet("Mercury", 0.8, orbitalDistances[0], PLANET_QUESTIONS[1].color);
    createPlanet("Venus", 1.2, orbitalDistances[1], PLANET_QUESTIONS[2].color);
    createPlanet("Earth", 1.3, orbitalDistances[2], PLANET_QUESTIONS[3].color);
    createPlanet("Mars", 1.0, orbitalDistances[3], PLANET_QUESTIONS[4].color);
    
    // Asteroid belt
    createAsteroidBelt(orbitalDistances[4], orbitalDistances[5]);
    
    createPlanet("Jupiter", 3.0, orbitalDistances[6], PLANET_QUESTIONS[5].color);
    createPlanet("Saturn", 2.6, orbitalDistances[7], PLANET_QUESTIONS[6].color);
    createPlanet("Uranus", 1.8, orbitalDistances[8], PLANET_QUESTIONS[7].color);
    createPlanet("Neptune", 1.7, orbitalDistances[9], PLANET_QUESTIONS[8].color);
    createPlanet("Pluto", 0.6, orbitalDistances[10], PLANET_QUESTIONS[9].color);
    
    // Create a comet
    createComet();
    
    // Raycaster for interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Handle mouse move
    const handleMouseMove = (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Update the raycaster
      raycaster.setFromCamera(mouse, camera);
      
      // Check for intersections
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      // Reset cursor and remove all highlight lights
      document.body.style.cursor = 'auto';
      setHoveredPlanet(null);
      
      // Remove previous highlight lights
      scene.traverse((object) => {
        if (object.userData && object.userData.isHighlight) {
          object.parent?.remove(object);
        }
      });
      
      // Find first valid intersection
      for (let i = 0; i < intersects.length; i++) {
        const object = intersects[i].object;
        let userData = null;
        let targetObject = null;
        
        // Check if the object itself has the required userData
        if (object.userData && (object.userData.isQuestion || object.userData.isPlanet)) {
          userData = object.userData;
          targetObject = object;
        } 
        // If not, traverse up the parent chain
        else {
          let parent = object.parent;
          while (parent && !userData) {
            if (parent.userData && (parent.userData.isQuestion || parent.userData.isPlanet)) {
              userData = parent.userData;
              targetObject = parent;
              break;
            }
            parent = parent.parent;
          }
        }
        
        // Handle found userData
        if (userData && targetObject) {
          document.body.style.cursor = 'pointer';
          
          // Add highlight effect
          if (userData.isPlanet || userData.isQuestion) {
            // Create a spotlight for the hovered object
            const highlightLight = new THREE.PointLight(0xffffcc, 1, 10);
            highlightLight.position.set(0, 0, 0);
            highlightLight.userData = { isHighlight: true };
            
            // If it's a question node, find its parent planet
            if (userData.isQuestion) {
              setHoveredPlanet(userData.question);
              targetObject.add(highlightLight);
            } else if (userData.isPlanet) {
              setHoveredPlanet(userData.name);
              targetObject.add(highlightLight);
            }
            
            break;
          }
        }
      }
    };
    
    // Handle clicks
    const handleClick = (event: MouseEvent) => {
      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      // Update the raycaster
      raycaster.setFromCamera(mouse, camera);
      
      // Check for intersections
      const intersects = raycaster.intersectObjects(scene.children, true);
      
      // Find first valid intersection
      for (let i = 0; i < intersects.length; i++) {
        const object = intersects[i].object;
        let userData = null;
        
        // Check if the object itself has the required userData
        if (object.userData && object.userData.isQuestion) {
          userData = object.userData;
        } 
        // If not, traverse up the parent chain
        else {
          let parent = object.parent;
          while (parent && !userData) {
            if (parent.userData && parent.userData.isQuestion) {
              userData = parent.userData;
              break;
            }
            parent = parent.parent;
          }
        }
        
        // Handle found question
        if (userData && userData.isQuestion) {
          const question = userData.question;
          setActiveQuestion(question);
          generateAnswer(question);
          break;
        }
      }
    };
    
    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    
    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation loop
    const animate = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      
      // Update planets - rotation only, no orbital movement
      scene.traverse((object) => {
        // Handle planet rotation
        if (object instanceof THREE.Mesh && object.userData && object.userData.isPlanet) {
          // Rotate the planet on its axis
          object.rotation.y += object.userData.rotationSpeed || 0;
        }
        
        // Orbital movement is commented out to stop planets from revolving around the sun
        /*
        if (object instanceof THREE.Group && object.userData && object.userData.isPlanet) {
          // Update orbit position
          if (object.userData.orbitSpeed) {
            object.userData.orbitAngle += object.userData.orbitSpeed;
            const orbitRadius = object.userData.orbitRadius;
            
            // Update position based on orbit angle
            object.position.x = Math.cos(object.userData.orbitAngle) * orbitRadius;
            object.position.z = Math.sin(object.userData.orbitAngle) * orbitRadius;
          }
        }
        
        // Handle comet movement - also stopped
        if (object instanceof THREE.Group && object.userData && object.userData.isComet) {
          // Update comet position
          object.userData.orbitAngle += object.userData.orbitSpeed;
          const distance = object.userData.orbitDistance;
          const inclination = object.userData.orbitInclination;
          
          // 3D orbit considering inclination
          object.position.x = Math.cos(object.userData.orbitAngle) * distance;
          object.position.z = Math.sin(object.userData.orbitAngle) * distance;
          object.position.y = Math.sin(object.userData.orbitAngle + Math.PI) * Math.sin(inclination) * distance * 0.3;
          
          // Always point the comet towards the direction of travel
          const tangent = new THREE.Vector3(
            -Math.sin(object.userData.orbitAngle),
            Math.cos(object.userData.orbitAngle + Math.PI) * Math.sin(inclination) * 0.3,
            Math.cos(object.userData.orbitAngle)
          ).normalize();
          
          object.lookAt(
            object.position.x + tangent.x,
            object.position.y + tangent.y,
            object.position.z + tangent.z
          );
        }
        */
      });
      
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      
      frameIdRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Clean up
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && rendererRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      // Dispose geometries and materials
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose();
          }
          
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    };
  }, [creditAmount]);
  
  // Generate answer using AI
  const generateAnswer = async (question: string) => {
    if (creditAmount <= 0) {
      setAnswer("You've run out of credits! Please purchase more credits to continue exploring the universe.");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a friendly space educator who explains complex cosmic concepts to children aged 6-12. 
            Keep your answers simple, engaging, and age-appropriate. Use friendly language and simple analogies.
            Limit your response to 2-3 short paragraphs.`
          },
          {
            role: 'user',
            content: question
          }
        ],
        temperature: 0.7,
        max_tokens: 250,
      });
      
      const generatedAnswer = response.choices[0]?.message.content || "I'm not sure about that. Let's explore another question!";
      setAnswer(generatedAnswer);
      
      if (onAnswerGenerated) {
        onAnswerGenerated(question, generatedAnswer);
      }
    } catch (error) {
      console.error('Error generating answer:', error);
      setAnswer("Oops! I couldn't find the answer to that question right now. Let's try another!");
    } finally {
      setLoading(false);
    }
  };
  
  // Render credits depleted message if no credits
  if (creditAmount <= 0) {
    return (
      <div className="relative w-full h-[600px] overflow-hidden rounded-xl bg-gradient-to-b from-gray-900 to-indigo-950 flex flex-col items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h2 className="text-3xl font-bold text-white mb-4">Space Explorer Locked</h2>
          <p className="text-xl text-gray-200 mb-6">
            You've run out of credits to explore the cosmos!
          </p>
          <div className="w-48 h-48 mx-auto mb-6 opacity-30">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full text-gray-400">
              <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-gray-300 mb-8">
            Purchase more credits to continue your journey through the solar system and discover the answers to fascinating space questions!
          </p>
          <button className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-full text-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg">
            Get More Credits
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-[600px] overflow-hidden rounded-xl bg-gradient-to-b from-gray-900 to-indigo-950">
      {/* Credits display */}
      <div className="absolute top-4 left-4 bg-indigo-900/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-10 flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.94 5.5c.944-.945 2.56-.276 5.74 1.057.588.245 1.023.5 1.506.75C15.307 8.392 17 9.1 17 11c0 1.5-2.683 2.88-6.043 4.092-1.984.872-3.79 1.558-5.507 1.935-.79.173-1.432.272-1.962.325-.53.053-.96.052-1.294-.002A1.06 1.06 0 012 16.43v-1.26c0-.478.232-.916.603-1.172 2.354-1.612 4.153-2.563 5.8-3.18.63-.234 1.223-.491 1.81-.759.588-.267 1.152-.544 1.697-.822 1.42-.724 2.375-1.5 2.375-2.238 0-.724-.955-1.5-2.375-2.238a21.032 21.032 0 00-1.697-.822c-.587-.268-1.18-.525-1.81-.76-1.647-.616-3.446-1.566-5.8-3.178A1.801 1.801 0 012 4.18v1.695c.329-.033.674-.019 1.036.03z" />
        </svg>
        <span className="font-mono font-bold">{creditAmount}Credits</span>
      </div>
      
      {/* Three.js container */}
      <div ref={containerRef} className="absolute inset-0" />
      
      {/* Planet hover */}
      {hoveredPlanet && !activeQuestion && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-indigo-900/70 text-white px-6 py-3 rounded-lg shadow-lg border border-cyan-500 z-10 backdrop-blur-sm animate-fade-in">
          <p className="text-xl font-bold">{hoveredPlanet}</p>
          {PLANET_QUESTIONS.some(q => q.question === hoveredPlanet) && (
            <p className="text-sm opacity-80">Click to explore this cosmic question! (Uses 1 credit)</p>
          )}
        </div>
      )}
      
      {/* Selected question and answer */}
      {activeQuestion && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-[600px] bg-indigo-900/70 text-white p-6 rounded-lg shadow-lg border border-fuchsia-500 z-10 backdrop-blur-sm animate-fade-in">
          <h3 className="text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400">{activeQuestion}</h3>
          
          {loading ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              <p className="ml-3">Exploring the cosmos for answers...</p>
            </div>
          ) : (
            <>
              {answer && <p className="text-lg leading-relaxed whitespace-pre-line">{answer}</p>}
              <button 
                onClick={() => {
                  setActiveQuestion(null);
                  setAnswer(null);
                }}
                className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-2 px-6 rounded-full transition-all duration-300 shadow-lg hover:shadow-cyan-500/20"
              >
                Explore Another Question
              </button>
            </>
          )}
        </div>
      )}
      
      {/* Instructions */}
      <div className="absolute top-4 right-4 bg-indigo-900/50 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-10">
        <p className="text-sm">Scroll to zoom • Drag to rotate</p>
      </div>
    </div>
  );
};

export default SpaceGlobe; 