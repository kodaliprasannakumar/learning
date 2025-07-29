import { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
// Work around the missing module declaration by using dynamic import
// @ts-ignore
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import OpenAI from 'openai';

import { Volume2, VolumeX, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Space questions related to specific planets in our solar system
const PLANET_QUESTIONS = [
  {
    planet: "Sun",
    question: "Why is the Sun so hot?",
    color: 0xFDB813, // bright yellow-orange
    texture: "/textures/sun.jpg",
    rotationSpeed: 0.001,
    relativeRadius: 10.0 // Not to scale, but largest object
  },
  {
    planet: "Mercury",
    question: "Why is Mercury the fastest planet?",
    color: 0x999999, // gray
    texture: "/textures/mercury.jpg",
    rotationSpeed: 0.004,
    orbitSpeed: 0.008,
    relativeRadius: 0.38
  },
  {
    planet: "Venus",
    question: "Why is Venus called Earth's twin?",
    color: 0xE6C229, // yellowy-orange
    texture: "/textures/venus.jpg",
    rotationSpeed: 0.002, // Venus rotates very slowly in reality
    orbitSpeed: 0.006,
    relativeRadius: 0.95
  },
  {
    planet: "Earth",
    question: "Why do we have seasons on Earth?",
    color: 0x1A73E8, // blue
    texture: "/textures/earth.jpg",
    rotationSpeed: 0.005,
    orbitSpeed: 0.005,
    relativeRadius: 1.0
  },
  {
    planet: "Mars",
    question: "Why is Mars red?",
    color: 0xE34234, // red
    texture: "/textures/mars.jpg",
    rotationSpeed: 0.005,
    orbitSpeed: 0.004,
    relativeRadius: 0.53
  },
  {
    planet: "Jupiter",
    question: "What is Jupiter's Great Red Spot?",
    color: 0xD5A150, // orange-brown
    texture: "/textures/jupiter.jpg",
    rotationSpeed: 0.008, // Jupiter rotates quite fast
    orbitSpeed: 0.002,
    relativeRadius: 4.5 // Scaled down from 11.2 to be manageable
  },
  {
    planet: "Saturn",
    question: "What are Saturn's rings made of?",
    color: 0xEAD6B8, // beige
    texture: "/textures/saturn.jpg",
    rotationSpeed: 0.007,
    orbitSpeed: 0.0015,
    relativeRadius: 4.0 // Scaled down from 9.4
  },
  {
    planet: "Uranus",
    question: "Why does Uranus rotate on its side?",
    color: 0x5B92E5, // light blue
    texture: "/textures/uranus.jpg",
    rotationSpeed: 0.006,
    orbitSpeed: 0.001,
    relativeRadius: 2.5 // Scaled down from 4.0
  },
  {
    planet: "Neptune",
    question: "Why is Neptune so windy?",
    color: 0x3E66F9, // dark blue
    texture: "/textures/neptune.jpg",
    rotationSpeed: 0.006,
    orbitSpeed: 0.0008,
    relativeRadius: 2.4 // Scaled down from 3.8
  },
  {
    planet: "Pluto",
    question: "Why isn't Pluto a planet anymore?",
    color: 0xCCCCCC, // light gray
    texture: "/textures/pluto.jpg",
    rotationSpeed: 0.003,
    orbitSpeed: 0.0005,
    relativeRadius: 0.18
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

const SCALE_FACTOR = 1.5; // Increase this to make all planets bigger

interface SpaceGlobeProps {
  onAnswerGenerated?: (question: string, answer: string) => void;
  credits?: number;
  flyToTarget: string | null;
  onFlyToComplete: () => void;
}

const SpaceGlobe: React.FC<SpaceGlobeProps> = ({ onAnswerGenerated, credits = 0, flyToTarget, onFlyToComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const frameIdRef = useRef<number | null>(null);
  const planetsRef = useRef<{ mesh: THREE.Mesh; container: THREE.Object3D; }[]>([]);
  
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [answer, setAnswer] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<{ name: string; } | null>(null);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
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
    // Don't initialize if credits are 0 - This was causing the re-render bug.
    // The UI overlay handles the 0 credit case now.
    if (!containerRef.current) return;
    
    // Storing planets in a ref to access them from other effects
    const planets: { mesh: THREE.Mesh; container: THREE.Object3D; }[] = [];
    
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
    };
    
    // Create the Sun
    const createSun = () => {
      const sunGeometry = new THREE.SphereGeometry(5, 64, 64);
      const sunTexture = textureLoader.load('/textures/sun.jpg');
      const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });
      const sun = new THREE.Mesh(sunGeometry, sunMaterial);
      sun.userData.name = 'Sun';
      sun.userData.isPlanet = true; // For click detection
      
      const pointLight = new THREE.PointLight(0xFFFFFF, 1.5, 500);
      sun.add(pointLight);
      
      // Add sun glow effect
      const sunGlowMaterial = new THREE.SpriteMaterial({
        map: textureLoader.load('/textures/glow.png'),
        color: 0xFFD700,
        transparent: true,
        blending: THREE.AdditiveBlending,
        opacity: 0.7
      });
      const sunGlow = new THREE.Sprite(sunGlowMaterial);
      sunGlow.scale.set(15, 15, 1);
      sun.add(sunGlow);
      
      return sun;
    };
    
    // We'll create planets inside this function
    const createPlanet = (name: string, radius: number, orbitRadius: number, color: number, texturePath: string | null) => {
      const geometry = new THREE.SphereGeometry(radius, 32, 32);
      
      let material;
      
      if (texturePath) {
        // Use texture if available
        const texture = textureLoader.load(texturePath);
        material = new THREE.MeshStandardMaterial({ 
          map: texture,
          roughness: 0.8,
          metalness: 0.2
        });
      } else {
        // Fallback to color
        material = new THREE.MeshStandardMaterial({ 
          color,
          roughness: 0.5,
          metalness: 0.5
        });
      }
      
      const planet = new THREE.Mesh(geometry, material);
      planet.userData.isPlanet = true;
      planet.userData.name = name;
      planet.userData.radius = radius;
      planet.position.x = 0; // Start at center
      
      const orbitContainer = new THREE.Object3D();
      orbitContainer.add(planet);
      
      const angle = Math.random() * Math.PI * 2;
      // Store all necessary animation data on the MESH's userData, not the container
      planet.userData.orbitRadius = orbitRadius;
      planet.userData.orbitAngle = angle;
      planet.userData.rotationSpeed = PLANET_QUESTIONS.find(p => p.planet === name)?.rotationSpeed || 0.005;
      planet.userData.orbitSpeed = PLANET_QUESTIONS.find(p => p.planet === name)?.orbitSpeed || 0.001;

      return { mesh: planet, container: orbitContainer };
    };

    const createSatellite = (name: string, size: number, orbitRadius: number, orbitSpeed: number, parent: THREE.Object3D) => {
      const satGeometry = new THREE.BoxGeometry(size, size, size * 2);
      const satMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 }); // Silver
      const satellite = new THREE.Mesh(satGeometry, satMaterial);
      
      // Add "solar panels"
      const panelGeometry = new THREE.BoxGeometry(size * 3, size * 0.8, 0.1);
      const panelMaterial = new THREE.MeshStandardMaterial({ color: 0x00008B }); // Dark blue
      const panel1 = new THREE.Mesh(panelGeometry, panelMaterial);
      panel1.position.x = size * 2;
      const panel2 = panel1.clone();
      panel2.position.x = -size * 2;
      satellite.add(panel1, panel2);

      satellite.position.x = orbitRadius;

      const orbitContainer = new THREE.Object3D();
      parent.add(orbitContainer);

      orbitContainer.add(satellite);

      satellite.userData = {
        isSatellite: true,
        name,
        orbitSpeed,
        question: `What is the ${name} satellite?` // Generic question
      };

      return { mesh: satellite, container: orbitContainer };
    };

    // Create the asteroid belt
    const createAsteroidBelt = (innerRadius: number, outerRadius: number) => {
      const asteroids = new THREE.Group();
      const asteroidMaterial = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.8 });
      
      for (let i = 0; i < 1500; i++) {
        const size = Math.random() * 0.15 + 0.05;
        const geometry = new THREE.DodecahedronGeometry(size, 0);
        
        const angle = Math.random() * Math.PI * 2;
        const radius = innerRadius + Math.random() * (outerRadius - innerRadius);
        
        const asteroid = new THREE.Mesh(geometry, asteroidMaterial);
        asteroid.position.set(
          Math.cos(angle) * radius,
          (Math.random() - 0.5) * 1, // Add some vertical spread
          Math.sin(angle) * radius
        );
        asteroid.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
        asteroids.add(asteroid);
      }
      scene.add(asteroids);
    };

    // Create a single comet
    const createComet = () => {
      const comet = new THREE.Group();
      
      // Comet head
      const headGeometry = new THREE.SphereGeometry(0.3, 16, 16);
      const headMaterial = new THREE.MeshBasicMaterial({ color: 0xAADDFF });
      const head = new THREE.Mesh(headGeometry, headMaterial);
      comet.add(head);
      
      // Comet tail
      const tailGeometry = new THREE.ConeGeometry(0.2, 2, 8);
      const tailMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xAADDFF,
        transparent: true,
        opacity: 0.3
      });
      const tail = new THREE.Mesh(tailGeometry, tailMaterial);
      tail.position.y = -1;
      tail.rotation.x = Math.PI; // Point it away
      head.add(tail);
      
      scene.add(comet);
      return comet;
    };
    
    createStarfield();
    const sun = createSun();
    scene.add(sun);
    
    // Create all the planets
    PLANET_QUESTIONS.forEach(p => {
      if (p.planet === 'Sun' || p.planet === 'Asteroids' || p.planet === 'Comets') return;

      const orbitRadius = PLANET_QUESTIONS.indexOf(p) * 12 + 15;
      
      const planetObj = createPlanet(
        p.planet,
        (p.relativeRadius || 1.0) * SCALE_FACTOR, // Use new relativeRadius and scale factor
        orbitRadius,
        p.color,
        p.texture
      );
      
      planets.push(planetObj);
      planetsRef.current = planets; // Update the ref
      scene.add(planetObj.container);

      // If this is Earth, add the ISS
      if (p.planet === "Earth") {
        createSatellite("International Space Station", 0.2, (p.relativeRadius || 1.0) * SCALE_FACTOR + 1.5, 0.01, planetObj.mesh);
      }
    });

    createAsteroidBelt(60, 80);
    const comet = createComet();

    // Mouse move for hover
    const handleMouseMove = (event: MouseEvent) => {
      if (!rendererRef.current || !cameraRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      
      const allPlanetMeshes = planets.map(p => p.mesh).concat(sun);
      const intersects = raycaster.intersectObjects(allPlanetMeshes);
      
      if (intersects.length > 0 && intersects[0].object.userData.name) {
        setHoveredPlanet(intersects[0].object.userData.name);
      } else {
        setHoveredPlanet(null);
      }
    };

    // Click handler
    const handleClick = (event: MouseEvent) => {
      if (!rendererRef.current || !cameraRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);
      
      const allClickableMeshes = planets.map(p => p.mesh).concat(sun);
      scene.traverse(obj => {
        if (obj.userData.isSatellite) {
          allClickableMeshes.push(obj as THREE.Mesh);
        }
      });

      const intersects = raycaster.intersectObjects(allClickableMeshes);
      
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        
        // Handle planet clicks (including Sun)
        if (clickedObject.userData.isPlanet) {
          const planetData = PLANET_QUESTIONS.find(p => p.planet === clickedObject.userData.name);
          if (planetData) {
            setSelectedPlanet({ name: planetData.planet });
            setCustomQuestion(planetData.question); // Pre-fill with default question
            setIsModalOpen(true);
            setAnswer(null); // Clear previous answer
            stopSpeaking(); // Stop any previous speech
          }
        }
        
        // Handle satellite clicks
        if (clickedObject.userData.isSatellite) {
          setSelectedPlanet({ name: clickedObject.userData.name });
          setCustomQuestion(clickedObject.userData.question);
          setIsModalOpen(true);
          setAnswer(null);
          stopSpeaking();
        }
      }
    };

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      const width = containerRef.current!.clientWidth;
      const height = containerRef.current!.clientHeight;
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    const clock = new THREE.Clock();
    let initialAnimationTime = 0;
    const initialAnimationDuration = 4; // in seconds

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      controlsRef.current?.update();

      const delta = clock.getDelta();

      // Initial dispersion animation
      if (initialAnimationTime < initialAnimationDuration) {
        initialAnimationTime += delta;
        const progress = Math.min(initialAnimationTime / initialAnimationDuration, 1);
        
        // Ease-out function: starts fast, slows down
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        planets.forEach(p => {
          const { orbitRadius, orbitAngle, rotationSpeed } = p.mesh.userData;
          
          // Set the container's rotation to its final starting angle
          p.container.rotation.y = orbitAngle;

          // Animate the planet's position *inside* the container, moving it outwards
          p.mesh.position.x = orbitRadius * easedProgress;

          // Also rotate the planet on its own axis during dispersion
          p.mesh.rotation.y += rotationSpeed * easedProgress;
        });
      } else {
        // Regular orbital animation
        planets.forEach(p => {
          // Now, simply rotate the container to make the planet revolve around the sun
          p.container.rotation.y += p.mesh.userData.orbitSpeed / 10 || 0.001;
          // And continue rotating the planet on its own axis
          p.mesh.rotation.y += p.mesh.userData.rotationSpeed;
        });

        // Animate satellites
        scene.traverse(obj => {
          if (obj.userData.isSatellite) {
            const container = obj.parent as THREE.Object3D;
            if (container) {
              container.rotation.y += obj.userData.orbitSpeed;
            }
          }
        });
      }
      
      // Animate comet
      const time = clock.getElapsedTime() * 0.1;
      comet.position.set(
        Math.cos(time * 0.5) * 80,
        Math.sin(time * 0.3) * 10,
        Math.sin(time * 0.5) * 80
      );
      comet.lookAt(scene.position);

      rendererRef.current!.render(sceneRef.current!, cameraRef.current!);
    };
    
    animate();
    
    // Add event listeners
    containerRef.current.addEventListener('mousemove', handleMouseMove);
    containerRef.current.addEventListener('click', handleClick);
    window.addEventListener('resize', handleResize);
    
    // This will be called when the component unmounts
    return () => {
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (containerRef.current) {
        containerRef.current.removeEventListener('mousemove', handleMouseMove);
        containerRef.current.removeEventListener('click', handleClick);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Run only once on mount

  // Fly-to animation effect
  useEffect(() => {
    if (!flyToTarget || !cameraRef.current || !controlsRef.current) return;

    const targetPlanet = planetsRef.current.find(p => p.mesh.userData.name === flyToTarget);
    if (!targetPlanet) return;

    const camera = cameraRef.current;
    const controls = controlsRef.current;

    // Get world position of the target planet
    const targetPosition = new THREE.Vector3();
    targetPlanet.mesh.getWorldPosition(targetPosition);

    // Calculate the desired camera position (offset from the planet)
    const planetRadius = targetPlanet.mesh.userData.radius || 1.0;
    const offset = new THREE.Vector3(0, 3, planetRadius * 6);
    const newCameraPosition = targetPosition.clone().add(offset);

    // Animation logic
    const duration = 1.5; // seconds
    const clock = new THREE.Clock();

    const startCameraPos = camera.position.clone();
    const startTargetPos = controls.target.clone();

    const tick = () => {
        const elapsedTime = clock.getElapsedTime();
        const progress = Math.min(elapsedTime / duration, 1);
        const easedProgress = 0.5 * (1 - Math.cos(Math.PI * progress)); // Ease-in-out

        // Interpolate camera position
        camera.position.lerpVectors(startCameraPos, newCameraPosition, easedProgress);

        // Interpolate controls target
        controls.target.lerpVectors(startTargetPos, targetPosition, easedProgress);

        if (progress < 1) {
            requestAnimationFrame(tick);
        } else {
            // Animation complete
            camera.position.copy(newCameraPosition);
            controls.target.copy(targetPosition);
            onFlyToComplete();
        }
    };

    tick();

  }, [flyToTarget, onFlyToComplete]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      // Ensure any speaking is stopped when the component unmounts
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleCloseAnswer = () => {
    stopSpeaking();
    setAnswer(null);
    setActiveQuestion(null);
  };

  const speak = (text: string | null) => {
    if (!('speechSynthesis' in window) || !text) return;

    // Stop any previous speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for kids

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleAskQuestion = () => {
    if (!customQuestion || !selectedPlanet) return;
    generateAnswer(customQuestion, selectedPlanet.name);
    setIsModalOpen(false);
  };

  const generateAnswer = async (question: string, planetName: string) => {
    if (loading || !question) return;
    stopSpeaking();
    if (creditAmount <= 0) {
      // You can replace this with a toast notification
      alert("You don't have enough credits to ask a question.");
      return;
    }
    
    setLoading(true);
    setAnswer(null); // Clear previous answer
    setActiveQuestion(question);
    
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a friendly and knowledgeable space expert talking to a young child (around 7-10 years old). Explain complex topics simply, using analogies they can understand. Keep your answers concise, engaging, and exciting. Start with a fun greeting like 'Great question!' or 'Wow, what a cosmic query!'"
          },
          {
            role: "user",
            content: `Regarding the planet ${planetName}, a child asked: "${question}"`
          }
        ],
        max_tokens: 150,
      });
      
      const result = completion.choices[0].message.content;
      setAnswer(result);
      
      if (result) {
        speak(result);
      }
      
      if (onAnswerGenerated) {
        onAnswerGenerated(question, result || "Sorry, I couldn't find an answer to that!");
      }
    } catch (error) {
      console.error("Error generating answer:", error);
      setAnswer("Oops! My space radio seems to be malfunctioning. Please try again!");
    } finally {
      setLoading(false);
    }
  };
  
    return (
    <div className="relative">
      <div ref={containerRef} style={{ width: '100%', height: '600px', position: 'relative', borderRadius: '12px', overflow: 'hidden' }}>
        {creditAmount <= 0 && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/80">
            <h2 className="text-2xl font-bold text-white mb-2">Out of Credits!</h2>
            <p className="text-white">Please earn more credits to explore space.</p>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-cyan-400"></div>
            <p className="text-white text-lg mt-4">Getting answer from the cosmos...</p>
      </div>
        )}

        {/* Tooltip for hovered planet */}
        {hoveredPlanet && !isModalOpen && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg text-center shadow-lg backdrop-blur-sm">
            <p className="font-bold">{hoveredPlanet}</p>
            <p className="text-sm">{PLANET_QUESTIONS.find(p => p.planet === hoveredPlanet)?.question}</p>
        </div>
      )}
      
        {/* Display Answer */}
        {answer && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/60 p-4 rounded-lg text-white backdrop-blur-sm shadow-lg max-w-2xl mx-auto">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-grow">
                <h3 className="font-bold text-lg mb-2 text-cyan-300">{activeQuestion}</h3>
                <p className="text-sm">{answer}</p>
            </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => (isSpeaking ? stopSpeaking() : speak(answer))}
                  className="text-cyan-300 hover:text-white"
                  aria-label={isSpeaking ? 'Stop reading' : 'Read aloud'}
                >
                  {isSpeaking ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCloseAnswer}
                  className="text-cyan-300 hover:text-white"
                  aria-label="Close answer"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
        </div>
      )}
      </div>

      {isModalOpen && selectedPlanet && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <Card className="w-[90%] max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Ask about {selectedPlanet.name}</CardTitle>
              <CardDescription>
                You can ask the default question or type your own!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Type your question here..."
                className="text-lg"
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAskQuestion} disabled={!customQuestion.trim()}>
                Ask AI (1 Credit)
              </Button>
            </CardFooter>
          </Card>
      </div>
      )}
    </div>
  );
};

export default SpaceGlobe; 