import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Destination,
  KARNATAKA_DESTINATIONS,
  RouteOptimizeMode,
} from '../data/karnatakaData';
import { Compass, Eye, EyeOff, Layers, Navigation, Sparkles } from 'lucide-react';

interface Karnataka3DSceneProps {
  activeDestinationIds: string[];
  selectedDestination: Destination;
  onSelectDestination: (dest: Destination) => void;
  routeMode: RouteOptimizeMode;
  onChangeRouteMode: (mode: RouteOptimizeMode) => void;
  totalDistanceKm: number;
  totalDriveHours: number;
  onOpenDestinationGuide: (dest: Destination) => void;
  variant?: 'hero' | 'map';
}

type CameraPreset = 'overview' | 'ghats' | 'heritage' | 'coast' | 'route';

// Pre-allocated module-scope math scratch vectors (Zero GC in render loop)
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _worldPos = new THREE.Vector3();
const _splinePoint = new THREE.Vector3();

function groundHeightAt(x: number, z: number): number {
  // Western Ghats ridge runs along x ≈ -3.5 to -1.5
  const ghatRidge = Math.exp(-Math.pow((x + 2.4) / 1.8, 2)) * 1.35;
  // Deccan plateau sits gently elevated on the east
  const deccanPlateau = x > -1.5 ? 0.45 + 0.15 * Math.sin(x * 0.5) * Math.cos(z * 0.4) : 0.15;
  // Arabian sea coast drops off on x < -4.0
  const coastDrop = x < -4.2 ? -0.35 : 0;
  return Math.max(0.05, ghatRidge + deccanPlateau + coastDrop);
}

// Composite 3-12 part procedural 3D landmark builder
function createHampiChariotLandmark(): THREE.Group {
  const group = new THREE.Group();
  const sandstoneMat = new THREE.MeshStandardMaterial({
    color: 0xd97706,
    roughness: 0.72,
    metalness: 0.15,
  });
  const carvedTrimMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    roughness: 0.35,
    metalness: 0.65,
  });
  const wheelMat = new THREE.MeshStandardMaterial({
    color: 0x92400e,
    roughness: 0.5,
    metalness: 0.3,
  });

  // 1. Stepped Plinth Base
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.16, 0.5), sandstoneMat);
  plinth.position.y = 0.08;
  group.add(plinth);

  // 2. Main Sanctum Body
  const sanctum = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.38, 0.38), sandstoneMat);
  sanctum.position.y = 0.35;
  group.add(sanctum);

  // 3-4. Stepped Dravida Shikara Tiers
  const tier1 = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.3), carvedTrimMat);
  tier1.position.y = 0.61;
  group.add(tier1);

  const kalasha = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.24, 6), sandstoneMat);
  kalasha.position.y = 0.8;
  group.add(kalasha);

  // 5-8. Four Carved Stone Wheels
  const wheelGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.05, 12);
  wheelGeo.rotateZ(Math.PI / 2);
  const wheelOffsets = [
    [-0.34, 0.11, 0.16],
    [0.34, 0.11, 0.16],
    [-0.34, 0.11, -0.16],
    [0.34, 0.11, -0.16],
  ];
  for (const [wx, wy, wz] of wheelOffsets) {
    const w = new THREE.Mesh(wheelGeo, wheelMat);
    w.position.set(wx, wy, wz);
    group.add(w);
  }

  return group;
}

function createMysuruPalaceLandmark(): THREE.Group {
  const group = new THREE.Group();
  const facadeMat = new THREE.MeshStandardMaterial({
    color: 0xfef3c7,
    roughness: 0.65,
    metalness: 0.2,
  });
  const goldDomeMat = new THREE.MeshStandardMaterial({
    color: 0xf59e0b,
    roughness: 0.22,
    metalness: 0.85,
  });
  const archTrimMat = new THREE.MeshStandardMaterial({
    color: 0xb45309,
    roughness: 0.45,
    metalness: 0.5,
  });

  // 1. Main Durbar Hall Block
  const mainHall = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.34, 0.42), facadeMat);
  mainHall.position.y = 0.17;
  group.add(mainHall);

  // 2. Central Tower Drum
  const centralDrum = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.26, 8), archTrimMat);
  centralDrum.position.y = 0.47;
  group.add(centralDrum);

  // 3. Indo-Saracenic Golden Onion Dome
  const mainDome = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), goldDomeMat);
  mainDome.position.y = 0.64;
  group.add(mainDome);

  // 4-5. Flanking Chhatri Towers & Domes
  for (const side of [-0.32, 0.32]) {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.42, 0.2), facadeMat);
    tower.position.set(side, 0.21, 0.08);
    group.add(tower);

    const subDome = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 10), goldDomeMat);
    subDome.position.set(side, 0.47, 0.08);
    group.add(subDome);
  }

  return group;
}

function createCoastalLighthouseLandmark(): THREE.Group {
  const group = new THREE.Group();
  const rockMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.85, metalness: 0.1 });
  const towerMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4, metalness: 0.2 });
  const lanternMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.9,
    roughness: 0.15,
    metalness: 0.6,
  });

  const baseRock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), rockMat);
  baseRock.scale.set(1.3, 0.6, 1.1);
  baseRock.position.y = 0.08;
  group.add(baseRock);

  const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.11, 0.55, 12), towerMat);
  spire.position.y = 0.38;
  group.add(spire);

  const gallery = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12), rockMat);
  gallery.position.y = 0.66;
  group.add(gallery);

  const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), lanternMat);
  lantern.position.y = 0.74;
  group.add(lantern);

  return group;
}

export const Karnataka3DScene: React.FC<Karnataka3DSceneProps> = ({
  activeDestinationIds,
  selectedDestination,
  onSelectDestination,
  routeMode,
  onChangeRouteMode,
  totalDistanceKm,
  totalDriveHours,
  onOpenDestinationGuide,
  variant = 'map',
}) => {
  const canvasMountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredDest, setHoveredDest] = useState<Destination | null>(null);
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('overview');
  const [dockCollapsed, setDockCollapsed] = useState(false);

  // Store mutable callbacks & state in refs so React HUD re-renders never recreate WebGL
  const onSelectRef = useRef(onSelectDestination);
  onSelectRef.current = onSelectDestination;

  const activeIdsRef = useRef<string[]>(activeDestinationIds);
  activeIdsRef.current = activeDestinationIds;

  const selectedIdRef = useRef<string>(selectedDestination.id);
  selectedIdRef.current = selectedDestination.id;

  const cameraPresetRef = useRef<CameraPreset>(cameraPreset);
  cameraPresetRef.current = cameraPreset;

  const sceneRebuildRouteRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (sceneRebuildRouteRef.current) {
      sceneRebuildRouteRef.current();
    }
  }, [activeDestinationIds, selectedDestination.id, routeMode]);

  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Software-WebGL detection from GPU renderer string (never userAgent)
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || 1200;
    const height = container.clientHeight || 640;

    const scene = new THREE.Scene();
    const horizonHex = 0x09110f;
    scene.background = new THREE.Color(horizonHex);
    scene.fog = new THREE.FogExp2(horizonHex, 0.024);

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 150);
    camera.position.set(0, 14.5, 18.5);
    camera.lookAt(0, 0.5, 1.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Studio Environment Reflection (RoomEnvironment + PMREMGenerator)
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3-Point Warm/Cool Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x0a1f17, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfde68a, 1.85);
    keyLight.position.set(12, 22, 14);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.camera.left = -14;
      keyLight.shadow.camera.right = 14;
      keyLight.shadow.camera.top = 14;
      keyLight.shadow.camera.bottom = -14;
      keyLight.shadow.bias = -0.0005;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 0.9);
    rimLight.position.set(-14, 10, -12);
    scene.add(rimLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2.15;
    controls.minDistance = 6;
    controls.maxDistance = 32;
    controls.target.set(0, 0.5, 1.5);

    let activePresetTransition = false;
    controls.addEventListener('start', () => {
      activePresetTransition = false;
    });

    // Fluid Ocean & River Base Plane with vertex wave animation
    const waterGeo = new THREE.PlaneGeometry(54, 54, 42, 42);
    waterGeo.rotateX(-Math.PI / 2);
    const waterPosAttr = waterGeo.attributes.position as THREE.BufferAttribute;
    const baseWaterY = new Float32Array(waterPosAttr.count);
    for (let i = 0; i < waterPosAttr.count; i++) {
      baseWaterY[i] = waterPosAttr.getY(i);
    }

    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0c2d38,
      roughness: 0.22,
      metalness: 0.68,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = -0.12;
    scene.add(waterMesh);

    // Sculpted 3D Karnataka Topographic Relief Terrain
    const terrainGeo = new THREE.PlaneGeometry(20, 24, 48, 56);
    terrainGeo.rotateX(-Math.PI / 2);
    const tPos = terrainGeo.attributes.position as THREE.BufferAttribute;
    const colors: number[] = [];
    const cScratch = new THREE.Color();

    for (let i = 0; i < tPos.count; i++) {
      const vx = tPos.getX(i);
      const vz = tPos.getZ(i);

      // Shape approximate Karnataka state silhouette mask
      const normZ = (vz + 12) / 24; // 0 (north) to 1 (south)
      const centerAxisX = -0.6 + Math.sin(normZ * Math.PI) * -0.8;
      const halfWidth = 3.8 + Math.sin(normZ * Math.PI) * 1.6;
      const distFromAxis = Math.abs(vx - centerAxisX);

      if (distFromAxis > halfWidth) {
        tPos.setY(i, -0.35);
        cScratch.setHex(0x09222b);
      } else {
        const edgeFade = THREE.MathUtils.smoothstep(halfWidth - distFromAxis, 0, 1.4);
        const h = groundHeightAt(vx, vz) * edgeFade;
        tPos.setY(i, h);

        if (h > 1.05) {
          cScratch.setHex(0x155e3b); // Western Ghats emerald shola peaks
        } else if (vx > 0.2 && vz < 0) {
          cScratch.setHex(0x5c3a1e); // Deccan sandstone plateau (Hampi/Badami)
        } else if (vx < -3.2) {
          cScratch.setHex(0x1e4e4a); // Karavali coastal belt
        } else {
          cScratch.setHex(0x163829); // Maidan & Malnad plains
        }
      }
      colors.push(cScratch.r, cScratch.g, cScratch.b);
    }

    terrainGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.78,
      metalness: 0.12,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    terrainMesh.receiveShadow = !isSoftwareGl;
    scene.add(terrainMesh);

    // InstancedMesh Western Ghats Shola Trees (> 20 instances)
    const treeCount = 65;
    const treeGeo = new THREE.ConeGeometry(0.14, 0.42, 6);
    const treeMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.65,
      metalness: 0.1,
    });
    const treeInstanced = new THREE.InstancedMesh(treeGeo, treeMat, treeCount);
    const dummy = new THREE.Object3D();
    for (let i = 0; i < treeCount; i++) {
      const tx = -2.9 + (Math.sin(i * 17.3) * 0.5 + 0.5) * 2.1;
      const tz = -1.5 + (i / treeCount) * 9.8;
      const ty = groundHeightAt(tx, tz);
      const scale = 0.85 + (i % 5) * 0.08;
      dummy.position.set(tx, ty + 0.18 * scale, tz);
      dummy.scale.set(scale, scale, scale);
      dummy.rotation.y = i * 0.7;
      dummy.updateMatrix();
      treeInstanced.setMatrixAt(i, dummy.matrix);
      cScratch.setHSL(0.41 + (i % 4) * 0.015, 0.65, 0.28 + (i % 3) * 0.05);
      treeInstanced.setColorAt(i, cScratch);
    }
    treeInstanced.instanceMatrix.needsUpdate = true;
    if (treeInstanced.instanceColor) treeInstanced.instanceColor.needsUpdate = true;
    treeInstanced.computeBoundingSphere();
    scene.add(treeInstanced);

    // Add 3-12 part Composite Landmarks at Iconic Destinations
    const hampiDest = KARNATAKA_DESTINATIONS.find((d) => d.id === 'hampi')!;
    const hampiModel = createHampiChariotLandmark();
    hampiModel.position.set(
      hampiDest.mapX + 0.55,
      groundHeightAt(hampiDest.mapX + 0.55, hampiDest.mapZ),
      hampiDest.mapZ
    );
    scene.add(hampiModel);

    const mysuruDest = KARNATAKA_DESTINATIONS.find((d) => d.id === 'mysuru')!;
    const mysuruModel = createMysuruPalaceLandmark();
    mysuruModel.position.set(
      mysuruDest.mapX + 0.6,
      groundHeightAt(mysuruDest.mapX + 0.6, mysuruDest.mapZ),
      mysuruDest.mapZ
    );
    scene.add(mysuruModel);

    const gokarnaDest = KARNATAKA_DESTINATIONS.find((d) => d.id === 'gokarna')!;
    const lighthouseModel = createCoastalLighthouseLandmark();
    lighthouseModel.position.set(
      gokarnaDest.mapX - 0.45,
      groundHeightAt(gokarnaDest.mapX - 0.45, gokarnaDest.mapZ),
      gokarnaDest.mapZ
    );
    scene.add(lighthouseModel);

    // Interactive Destination Beacons (Layer 1 for fast Raycasting)
    const clickableMeshes: THREE.Mesh[] = [];
    const beaconGroups = new Map<string, { group: THREE.Group; pinMesh: THREE.Mesh; ringMesh: THREE.Mesh }>();

    const pinGeo = new THREE.OctahedronGeometry(0.24, 1);
    const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 8);
    const shadowDiscGeo = new THREE.CircleGeometry(0.32, 16);
    shadowDiscGeo.rotateX(-Math.PI / 2);
    const shadowDiscMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.42,
      depthWrite: false,
    });

    for (const dest of KARNATAKA_DESTINATIONS) {
      const g = new THREE.Group();
      const baseH = groundHeightAt(dest.mapX, dest.mapZ);
      g.position.set(dest.mapX, baseH, dest.mapZ);

      // Contact shadow disc
      const disc = new THREE.Mesh(shadowDiscGeo, shadowDiscMat);
      disc.position.y = 0.02;
      g.add(disc);

      // Stem
      const stemMat = new THREE.MeshStandardMaterial({
        color: 0x94a3b8,
        roughness: 0.4,
        metalness: 0.7,
      });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.y = 0.25;
      g.add(stem);

      // Glowing Crystal Beacon Pin
      const pinMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(dest.accentHex),
        emissive: new THREE.Color(dest.accentHex),
        emissiveIntensity: 0.45,
        roughness: 0.2,
        metalness: 0.6,
      });
      const pin = new THREE.Mesh(pinGeo, pinMat);
      pin.position.y = 0.62;
      pin.layers.set(1);
      pin.userData = { destination: dest };
      g.add(pin);

      // Selection Halo Ring (offset on Y to avoid Z-fighting)
      const ringGeo = new THREE.RingGeometry(0.28, 0.38, 24);
      ringGeo.rotateX(-Math.PI / 2);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(dest.accentHex),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 0.035;
      g.add(ring);

      scene.add(g);
      clickableMeshes.push(pin);
      beaconGroups.set(dest.id, { group: g, pinMesh: pin, ringMesh: ring });
    }

    // Dynamic 3D Travel Route Spline + Traveling Pulse Orb
    const routeGroup = new THREE.Group();
    scene.add(routeGroup);

    const travelerOrb = new THREE.Mesh(
      new THREE.SphereGeometry(0.14, 14, 14),
      new THREE.MeshStandardMaterial({
        color: 0xfef08a,
        emissive: 0xf59e0b,
        emissiveIntensity: 1.4,
        roughness: 0.1,
      })
    );
    scene.add(travelerOrb);

    let activeCurve: THREE.CatmullRomCurve3 | null = null;

    function rebuildRouteVisuals() {
      // Clear old route meshes
      while (routeGroup.children.length > 0) {
        const child = routeGroup.children[0] as THREE.Mesh;
        if (child.geometry) child.geometry.dispose();
        routeGroup.remove(child);
      }

      const routePoints: THREE.Vector3[] = [];
      for (const id of activeIdsRef.current) {
        const d = KARNATAKA_DESTINATIONS.find((item) => item.id === id);
        if (d) {
          const y = groundHeightAt(d.mapX, d.mapZ) + 0.45;
          routePoints.push(new THREE.Vector3(d.mapX, y, d.mapZ));
        }
      }

      if (routePoints.length >= 2) {
        activeCurve = new THREE.CatmullRomCurve3(routePoints, false, 'catmullrom', 0.35);
        const tubeGeo = new THREE.TubeGeometry(activeCurve, 48, 0.065, 8, false);
        const tubeMat = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          emissive: 0xd97706,
          emissiveIntensity: 0.75,
          roughness: 0.25,
          metalness: 0.5,
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        routeGroup.add(tubeMesh);
        travelerOrb.visible = true;
      } else {
        activeCurve = null;
        travelerOrb.visible = false;
      }

      // Highlight active & selected beacons
      beaconGroups.forEach((val, id) => {
        const isSelected = id === selectedIdRef.current;
        const isInRoute = activeIdsRef.current.includes(id);
        const mat = val.pinMesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = isSelected ? 1.4 : isInRoute ? 0.85 : 0.25;
        val.ringMesh.scale.setScalar(isSelected ? 1.55 : isInRoute ? 1.15 : 0.75);
      });
    }

    sceneRebuildRouteRef.current = () => {
      rebuildRouteVisuals();
      activePresetTransition = true;
    };
    rebuildRouteVisuals();

    // Raycasting on Layer 1
    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointer = new THREE.Vector2();
    let lastHoverTime = 0;

    const handlePointerMove = (e: MouseEvent) => {
      const now = performance.now();
      if (now - lastHoverTime < 60) return;
      lastHoverTime = now;

      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        const dest = hits[0].object.userData.destination as Destination;
        setHoveredDest(dest);
        renderer.domElement.style.cursor = 'pointer';
      } else {
        setHoveredDest(null);
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(clickableMeshes, false);
      if (hits.length > 0) {
        const dest = hits[0].object.userData.destination as Destination;
        if (dest) {
          onSelectRef.current(dest);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 1200;
      const h = container.clientHeight || 640;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Software-WebGL Safe Animation Loop with afterDraw(tick)
    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl && gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      if (gl) gl.flush();
      const poll = () => {
        if (disposed) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (sync && state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function applyCameraPresetDamping(dt: number) {
      const preset = cameraPresetRef.current;
      if (preset === 'ghats') {
        _targetCamPos.set(-6.5, 8.2, 8.5);
        _targetLookAt.set(-2.2, 0.8, 4.2);
      } else if (preset === 'heritage') {
        _targetCamPos.set(4.5, 7.8, 0.5);
        _targetLookAt.set(0.5, 0.6, -3.5);
      } else if (preset === 'coast') {
        _targetCamPos.set(-9.5, 6.8, 4.8);
        _targetLookAt.set(-4.5, 0.3, 2.2);
      } else if (preset === 'route') {
        const sel = KARNATAKA_DESTINATIONS.find((d) => d.id === selectedIdRef.current);
        if (sel) {
          _targetCamPos.set(sel.mapX + 3.8, 6.5, sel.mapZ + 5.8);
          _targetLookAt.set(sel.mapX, 0.6, sel.mapZ);
        } else {
          _targetCamPos.set(0, 13.5, 16.5);
          _targetLookAt.set(0, 0.5, 1.5);
        }
      } else {
        _targetCamPos.set(0, 14.5, 18.5);
        _targetLookAt.set(0, 0.5, 1.5);
      }

      if (activePresetTransition) {
        const alpha = 1 - Math.exp(-4.0 * dt);
        camera.position.lerp(_targetCamPos, alpha);
        controls.target.lerp(_targetLookAt, alpha);
        if (camera.position.distanceTo(_targetCamPos) < 0.08) {
          activePresetTransition = false;
        }
      }
    }

    function tick() {
      if (disposed) return;
      const dt = Math.min(clock.getDelta(), 0.1);
      const elapsed = clock.getElapsedTime();

      // Animate fluid ocean ripples
      for (let i = 0; i < waterPosAttr.count; i++) {
        const wx = waterPosAttr.getX(i);
        const wz = waterPosAttr.getZ(i);
        const wave =
          Math.sin(wx * 0.45 + elapsed * 1.4) * 0.07 +
          Math.cos(wz * 0.38 + elapsed * 1.1) * 0.06;
        waterPosAttr.setY(i, baseWaterY[i] + wave);
      }
      waterPosAttr.needsUpdate = true;

      // Rotate & bob destination beacons gently
      beaconGroups.forEach((val, id) => {
        const isSel = id === selectedIdRef.current;
        val.pinMesh.rotation.y = elapsed * (isSel ? 1.8 : 0.7);
        val.pinMesh.position.y = 0.62 + Math.sin(elapsed * 2.2 + val.group.position.x) * 0.05;
      });

      // Move traveler orb along active 3D route spline
      if (activeCurve && travelerOrb.visible) {
        const u = (elapsed * 0.14) % 1;
        activeCurve.getPointAt(u, _splinePoint);
        travelerOrb.position.copy(_splinePoint);
      }

      applyCameraPresetDamping(dt);
      controls.update();
      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    // Trigger preset transition when cameraPreset changes
    (window as any).__triggerKarnatakaCamPreset = () => {
      activePresetTransition = true;
    };

    tick();

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('mousemove', handlePointerMove);
      renderer.domElement.removeEventListener('click', handleClick);
      controls.dispose();
      renderer.dispose();
    };
  }, []);

  const handleSelectCameraPreset = (preset: CameraPreset) => {
    setCameraPreset(preset);
    if ((window as any).__triggerKarnatakaCamPreset) {
      (window as any).__triggerKarnatakaCamPreset();
    }
  };

  return (
    <div
      className="relative w-full h-full min-h-[540px] rounded-2xl overflow-hidden border border-white/10 bg-[#090A0F]"
      data-testid="karnataka-3d-viewport"
    >
      {/* Isolated WebGL Canvas Mount Container */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

      {/* Top-Left Minimal Spec Header Overlay (No backdrop-filter over WebGL) */}
      <div className="absolute top-4 left-4 z-10 pointer-events-auto max-w-md bg-[#0C0E14]/95 border border-white/10 rounded-xl px-4 py-3.5">
        <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
          <Compass className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>Spatial Route Telemetry</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono-tabular text-zinc-200">{activeDestinationIds.length} Nodes</span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-3">
          <h3 className="text-base font-semibold text-white">
            {selectedDestination.name}{' '}
            <span className="text-xs font-normal text-zinc-400">
              ({selectedDestination.kannadaName})
            </span>
          </h3>
          <span className="text-xs font-mono-tabular text-indigo-400">
            {selectedDestination.elevationMeters}m ASL
          </span>
        </div>
        <p className="mt-1 text-xs text-zinc-400 line-clamp-2">{selectedDestination.tagline}</p>
        <div className="mt-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onOpenDestinationGuide(selectedDestination)}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Inspect Destination Guide
          </button>
          <span className="text-xs font-mono-tabular text-zinc-400">
            {totalDistanceKm} km · {totalDriveHours} hrs
          </span>
        </div>
      </div>

      {/* Hover Destination Preview Callout */}
      {hoveredDest && hoveredDest.id !== selectedDestination.id && (
        <div className="absolute top-4 right-4 z-10 pointer-events-none max-w-xs bg-[#0C0E14]/95 border border-indigo-500/40 rounded-xl px-4 py-3">
          <div className="text-xs text-indigo-400 font-medium">{hoveredDest.region}</div>
          <div className="text-sm font-semibold text-white mt-0.5">
            {hoveredDest.name} · {hoveredDest.elevationMeters}m
          </div>
          <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{hoveredDest.summary}</p>
          <div className="mt-1.5 text-[11px] text-zinc-300">
            {hoveredDest.bestSeason} · Click beacon to inspect
          </div>
        </div>
      )}

      {/* Unified Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-[94%] max-w-[920px] pointer-events-auto flex flex-col items-center">
        <button
          type="button"
          onClick={() => setDockCollapsed((prev) => !prev)}
          className="mb-1.5 px-3 py-1 text-xs font-medium text-zinc-300 hover:text-white bg-[#0C0E14]/95 border border-white/10 rounded-lg flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          aria-expanded={!dockCollapsed}
        >
          {dockCollapsed ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>▴ Show 3D Controls</span>
            </>
          ) : (
            <>
              <EyeOff className="w-3.5 h-3.5" />
              <span>▾ Hide 3D Controls</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="w-full bg-[#0C0E14]/95 border border-white/10 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-3">
            {/* Camera Viewpoint Presets */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-zinc-400 mr-1.5 flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-indigo-400" />
                View:
              </span>
              {(
                [
                  { id: 'overview', label: 'State Overview' },
                  { id: 'ghats', label: 'Western Ghats' },
                  { id: 'heritage', label: 'Deccan Heritage' },
                  { id: 'coast', label: 'Karavali Coast' },
                  { id: 'route', label: 'Focus Selected' },
                ] as { id: CameraPreset; label: string }[]
              ).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectCameraPreset(preset.id)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    cameraPreset === preset.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Dynamic AI Route Optimizer Modes */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-xs text-zinc-400 mr-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Optimize:
              </span>
              {(
                [
                  { id: 'scenic', label: 'Scenic Beauty' },
                  { id: 'time', label: 'Fastest Time' },
                  { id: 'cost', label: 'Lowest Cost' },
                  { id: 'comfort', label: 'Travel Comfort' },
                ] as { id: RouteOptimizeMode; label: string }[]
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onChangeRouteMode(m.id)}
                  className={`px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    routeMode === m.id
                      ? 'bg-white text-zinc-950'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
