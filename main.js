import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import gsap from "gsap";

// ? |||||||| CANVAS ||||||||
const canvas = document.querySelector(".webgl");

// ? |||||||| SIZES ||||||||
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

// ? |||||||| FONT LOADER ||||||||
const fontLoader = new FontLoader();

// ? |||||||| SCENE ||||||||
const scene = new THREE.Scene();

// ? |||||||| AXES HELPER ||||||||
const axesHelper = new THREE.AxesHelper(2000);

axesHelper.visible = false;

scene.add(axesHelper);

// ? |||||||| CAMERA ||||||||
const camera = new THREE.PerspectiveCamera(
  35, // => FOV
  sizes.width / sizes.height, // => Aspect ratio
  0.1, // => Near
  50000 // => Far
);

camera.position.set(-1000, 0, 15000);

scene.add(camera);

// ? |||||||| RENDERER ||||||||
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // => If the device has a pixel ration over 2, we'll take 2
});

// ? |||||||| MOUSE ||||||||
const mouse = new THREE.Vector2();

window.addEventListener("mousemove", (e) => {
  mouse.x = (e.clientX / sizes.width) * 2 - 1;
  mouse.y = -(e.clientY / sizes.height) * 2 + 1;
});

let currentIntersect = null;
let intersects = [];
let originalRadius = null;

const showInfo = (object) => {
  console.log("Showing info about ==> ", object);
};

window.addEventListener("click", () => {
  if (currentIntersect) {
    const objectName = currentIntersect.name;
    if (objectName === "Sun") {
      showInfo("Sun");
    } else if (objectName === "Mercury") {
      showInfo("Mercury");
    } else if (objectName === "Venus") {
      showInfo("Venus");
    } else if (objectName === "Earth") {
      showInfo("Earth");
    } else if (objectName === "Mars") {
      showInfo("Mars");
    } else if (objectName === "Jupiter") {
      showInfo("Jupiter");
    } else if (objectName === "Saturn") {
      showInfo("Saturn");
    } else if (objectName === "Uranus") {
      showInfo("Uranus");
    } else if (objectName === "Neptune") {
      showInfo("Neptune");
    } else {
      return;
    }
  }
});

// ? |||||||| CURSOR ||||||||

const cursor = {
  x: 0,
  y: 0,
};

window.addEventListener("mousemove", (e) => {
  cursor.x = e.clientX / sizes.width - 0.5;
  cursor.y = e.clientY / sizes.height - 0.5;
});

// ? |||||||| RAYCASTER ||||||||
const rayCaster = new THREE.Raycaster();

// ? |||||||| LIGHTS ||||||||
const ambientLight = new THREE.AmbientLight(0xffffff, 1);

scene.add(ambientLight);

const sunshineLight = new THREE.DirectionalLight(0xffffff, 3);

sunshineLight.castShadow = true;
sunshineLight.shadow.mapSize.width = 1024;
sunshineLight.shadow.mapSize.height = 1024;
sunshineLight.position.set(-1, 0, 0);

scene.add(sunshineLight);

// ? |||||||| TEXTURES ||||||||
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load("./textures/sun.jpg");
const mercuryTexture = textureLoader.load("./textures/mercury.jpg");
const venusTexture = textureLoader.load("./textures/venus.jpg");
const earthTexture = textureLoader.load("./textures/earth.jpg");
// const moonTexture = textureLoader.load("./textures/moon.jpg");
const marsTexture = textureLoader.load("./textures/mars.jpg");
const jupiterTexture = textureLoader.load("./textures/jupiter.jpg");
const saturnTexture = textureLoader.load("./textures/saturn.jpg");
const saturnRingTexture = textureLoader.load("./textures/saturn-ring.png");
const uranusTexture = textureLoader.load("./textures/uranus.jpg");
const neptuneTexture = textureLoader.load("./textures/neptune.jpg");

const backgroundTexture = textureLoader.load("./textures/milkyway.jpg");

saturnRingTexture.rotation = Math.PI * 0.5;

// ? |||||||| GROUPS ||||||||
const solarSystem = new THREE.Group();
const saturnGroup = new THREE.Group();
const objectsReferences = new THREE.Group();

solarSystem.position.set(-5000, 0, 0);
objectsReferences.position.set(-5000, 0, 0);

scene.add(solarSystem, saturnGroup, objectsReferences);

solarSystem.add(saturnGroup);

const objectsToUpdate = [];

// ? |||||||| OBJECTS ||||||||
const initialMargin = 2000;
// const maxDistanceFromSun = 10.118;

const planetsScales = {
  sun: {
    radius: 1399,
    inclination: Math.PI / 0,
    distanceFromSun: 0,
  },
  mercury: {
    radius: 4.9,
    inclination: Math.PI / 0.034,
    distanceFromSun: 58,
  },
  venus: {
    radius: 12,
    inclination: Math.PI / 2.64,
    distanceFromSun: 108 * 7,
  },
  earth: {
    radius: 12.7,
    inclination: Math.PI / 23.4,
    distanceFromSun: 150 * 9,
  },
  mars: {
    radius: 6.8,
    inclination: Math.PI / 25.19,
    distanceFromSun: 228 * 11,
  },
  jupiter: {
    radius: 143,
    inclination: Math.PI / 3.13,
    distanceFromSun: 778 * 5,
  },
  saturn: {
    radius: 120,
    inclination: Math.PI / 26.73,
    distanceFromSun: 1427 * 4,
  },
  saturnRing: {
    radius: 80,
    distanceFromSun: 1427 * 4,
  },
  uranus: {
    radius: 52,
    inclination: Math.PI / 97.77,
    distanceFromSun: 2871 * 2.75,
  },
  neptune: {
    radius: 50,
    inclination: Math.PI / 28.32,
    distanceFromSun: 4497 * 2.25,
  },
};

const planetsObjects = [
  {
    name: "Sun",
    radius: planetsScales.sun.radius,
    rotationX: planetsScales.mercury.inclination,
    distanceFromSun: 0,
  },
  {
    texture: mercuryTexture,
    name: "Mercury",
    radius: planetsScales.mercury.radius,
    rotationX: planetsScales.mercury.inclination,
    distanceFromSun: planetsScales.mercury.distanceFromSun,
  },
  {
    name: "Venus",
    texture: venusTexture,
    radius: planetsScales.venus.radius,
    rotationX: planetsScales.venus.inclination,
    distanceFromSun: planetsScales.venus.distanceFromSun,
  },
  {
    name: "Earth",
    texture: earthTexture,
    radius: planetsScales.earth.radius,
    rotationX: planetsScales.earth.inclination,
    distanceFromSun: planetsScales.earth.distanceFromSun,
  },
  {
    name: "Mars",
    texture: marsTexture,
    radius: planetsScales.mars.radius,
    rotationX: planetsScales.mars.inclination,
    distanceFromSun: planetsScales.mars.distanceFromSun,
  },
  {
    name: "Jupiter",
    texture: jupiterTexture,
    radius: planetsScales.jupiter.radius,
    rotationX: planetsScales.jupiter.inclination,
    distanceFromSun: planetsScales.jupiter.distanceFromSun,
  },
  {
    name: "Saturn",
    texture: saturnTexture,
    radius: planetsScales.saturn.radius,
    rotationX: planetsScales.saturn.inclination,
    distanceFromSun: planetsScales.saturn.distanceFromSun,
  },
  {
    name: "Uranus",
    texture: uranusTexture,
    radius: planetsScales.uranus.radius,
    rotationX: planetsScales.uranus.inclination,
    distanceFromSun: planetsScales.uranus.distanceFromSun,
  },
  {
    name: "Neptune",
    texture: neptuneTexture,
    radius: planetsScales.neptune.radius,
    rotationX: planetsScales.neptune.inclination,
    distanceFromSun: planetsScales.neptune.distanceFromSun,
  },
];

const objectGeometry = new THREE.SphereGeometry(1, 64, 64);
const sunMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
});

const createSun = () => {
  const mesh = new THREE.Mesh(objectGeometry, sunMaterial);
  const radius = planetsScales.sun.radius;

  mesh.material.map = sunTexture;
  mesh.scale.set(radius, radius, radius);
  mesh.castShadow = false;
  mesh.name = "Sun";

  objectsToUpdate.push(mesh);

  solarSystem.add(mesh);
};

createSun();

const createSolarSystemObject = (
  name,
  radius,
  rotationX,
  texture,
  position
) => {
  const planetMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    map: texture,
  });

  console.log(position)

  const mesh = new THREE.Mesh(objectGeometry, planetMaterial);
  mesh.name = name;

  mesh.material.map = texture;
  mesh.material.metalness = 1;
  mesh.material.roughness = 1;

  mesh.scale.set(radius, radius, radius);
  mesh.rotation.x = rotationX;
  mesh.castShadow = true;

  solarSystem.add(mesh);

  mesh.position.copy(position);

  objectsToUpdate.push(mesh);
};

planetsObjects.forEach(
  ({ name, radius, rotationX, texture, distanceFromSun }, index) => {
    if (index !== 0) {
      createSolarSystemObject(
        name,
        radius,
        rotationX,
        texture,
        {
          x: initialMargin + distanceFromSun,
          y: 0,
          z: 0,
        }
      );
    }
  }
);

const saturnRingGeometry = new THREE.TorusGeometry(3, 0.8, 2, 200);
const saturnRingMaterial = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  map: saturnRingTexture,
  alphaMap: saturnRingTexture,
  alphaTest: 0.1,
  transparent: true,
  side: THREE.DoubleSide,
});

const createSaturnRing = () => {
  const saturnRingMesh = new THREE.Mesh(saturnRingGeometry, saturnRingMaterial);
  const {
    saturnRing: { radius },
  } = planetsScales;
  saturnRingMesh.scale.set(radius, radius, radius);
  saturnRingMesh.name = "Saturn Ring";
  saturnRingMesh.rotation.x = -27;
  saturnRingMesh.position.x =
    initialMargin + planetsScales.saturn.distanceFromSun;
  saturnRingMesh.receiveShadow = true;

  saturnGroup.add(saturnRingMesh);
};

createSaturnRing();

// ? |||||||| 3D TEXT ||||||||
const textMaterial = new THREE.MeshStandardMaterial({
  color: "white",
  roughness: 0.5,
});
const create3DPlanetNames = () => {
  planetsObjects.forEach((object, index) => {
    fontLoader.load("./fonts/lato_regular.json", (font) => {
      const planetNameGeometry = new TextGeometry(object.name, {
        font,
        size: 100,
        height: 10,
        curveSegments: 30,
        bevelEnabled: true,
        bevelThickness: 1,
        bevelSize: 1,
        bevelOffset: 0,
        bevelSegments: 5,
      });
      const mesh = new THREE.Mesh(planetNameGeometry, textMaterial);
      planetNameGeometry.center();
      if (index !== 0) {
        mesh.position.x = initialMargin + object.distanceFromSun;
      } else {
        mesh.position.x = 0;
      }
      mesh.position.y = 2900;
      objectsReferences.add(mesh);
    });
  });
};

create3DPlanetNames();

// ? |||||||| LINES ||||||||
const lineGeometry = new THREE.BoxGeometry(15, 2500, 15);
const lineMaterial = new THREE.MeshBasicMaterial({ color: "white" });

const createLines = () => {
  planetsObjects.forEach((object, index) => {
    const mesh = new THREE.Mesh(lineGeometry, lineMaterial);
    mesh.position.y = 1500;
    if (index !== 0) {
      mesh.position.x = initialMargin + object.distanceFromSun;
    } else {
      mesh.position.x = 0;
    }
    objectsReferences.add(mesh);
  });
};

createLines();

//** Background sphere
const universeSphereMesh = new THREE.Mesh(
  new THREE.SphereGeometry(sizes.width * 10, 64, 64),
  new THREE.MeshBasicMaterial({
    map: backgroundTexture,
    side: THREE.DoubleSide,
  })
);

universeSphereMesh.rotation.z = Math.PI;
universeSphereMesh.position.z = 0;

scene.add(universeSphereMesh);

// ? |||||||| RESET SCALES ||||||||

const getOriginalRadius = (name) => {
  const meshes = {
    Sun: planetsScales.sun.radius,
    Mercury: planetsScales.mercury.radius,
    Venus: planetsScales.venus.radius,
    Earth: planetsScales.earth.radius,
    Mars: planetsScales.mars.radius,
    Jupiter: planetsScales.jupiter.radius,
    Saturn: planetsScales.saturn.radius,
    SaturnRing: planetsScales.saturnRing.radius,
    Uranus: planetsScales.uranus.radius,
    Neptune: planetsScales.neptune.radius,
  };

  return meshes[name];
};

// ? |||||||| VARIABLES ||||||||
let isNormalized = false;
let isScrollMode = false;
const objectsDistance = 12000;

// ? |||||||| CONTROLS ||||||||
const controls = new OrbitControls(camera, canvas);
controls.maxDistance = sizes.width * 9.9;

// ? |||||||| SCROLL EVENT ||||||||
let scrollY = null;

window.addEventListener("scroll", () => {
  scrollY = window.scrollY;
  if (isScrollMode) {
    universeSphereMesh.position.y = scrollY * -1;
  }
});

// ? |||||||| UPDATING ||||||||

const clock = new THREE.Clock();

let newRadius = null;

const animate = () => {
  const elapsedTime = clock.getElapsedTime();
  // Meshes rotations
  for (let mesh of objectsToUpdate) {
    mesh.rotation.y = elapsedTime * 0.05;
  }

  // RayCaster
  rayCaster.setFromCamera(mouse, camera);
  intersects = rayCaster.intersectObjects(objectsToUpdate);

  // Intersects
  const saturnRing = saturnGroup.getObjectByName("Saturn Ring");

  if (intersects.length && !isScrollMode) {
    if (!currentIntersect) {
      // => Mouse over an object
      currentIntersect = intersects[0].object;
      originalRadius = getOriginalRadius(currentIntersect.name);

      if (originalRadius < planetsScales.sun.radius) {
        newRadius = 200;
      } else {
        newRadius = originalRadius * 1.25;
      }
      gsap.to(currentIntersect.scale, {
        duration: 0.5,
        x: newRadius,
        y: newRadius,
        z: newRadius,
        ease: "power2.inOut",
      });

      if (currentIntersect.name === "Saturn") {
        gsap.to(saturnRing.scale, {
          duration: 0.5,
          x: getOriginalRadius(currentIntersect.name) + 20,
          y: getOriginalRadius(currentIntersect.name) + 20,
          z: getOriginalRadius(currentIntersect.name) + 20,
          ease: "power2.inOut",
        });
      }
    }
  } else {
    // => Mouse leave an object
    if (currentIntersect) {
      gsap.to(currentIntersect.scale, {
        duration: 0.5,
        x: getOriginalRadius(currentIntersect.name),
        y: getOriginalRadius(currentIntersect.name),
        z: getOriginalRadius(currentIntersect.name),
        ease: "power2.inOut",
      });
      gsap.to(saturnRing.scale, {
        duration: 0.5,
        x: getOriginalRadius("SaturnRing"),
        y: getOriginalRadius("SaturnRing"),
        z: getOriginalRadius("SaturnRing"),
        ease: "power2.inOut",
      });

      currentIntersect = null;
      originalRadius = null;
    }
  }

  if (!isScrollMode) {
    // Enable orbit controls
    controls.enabled = true;
    controls.enableDamping = true;
    universeSphereMesh.position.y = 0;
    // Controls
    controls.update();
  } else {
    // Update camera
    camera.position.set(
      -1000,
      (-scrollY / sizes.height) * objectsDistance,
      15000
    );
    camera.rotation.set(0, 0, 0);
    universeSphereMesh.position.y = camera.position.y;
    controls.enabled = false;
    controls.enableDamping = false;
  }

  // Renderer
  renderer.render(scene, camera);

  // Frame request
  window.requestAnimationFrame(animate);
};

animate();

// ? |||||||| GUI ||||||||
const gui = new dat.GUI();
gui.add(axesHelper, "visible");

// ! ------------- JAVASCRIPT VANILLA ------------- ! //

// Functions
const normalizeSizes = () => {
  isNormalized = !isNormalized;
  const saturnRing = saturnGroup.getObjectByName("Saturn Ring");
  if (isNormalized) {
    normalizeButton.textContent = "Reset sizes";
    for (let mesh of objectsToUpdate) {
      gsap.to(mesh.scale, {
        duration: 1,
        x: 200,
        y: 200,
        z: 200,
        ease: "power3.Out",
      });
    }
    gsap.to(saturnRing.scale, {
      duration: 1,
      x: planetsScales.saturnRing.radius + 50,
      y: planetsScales.saturnRing.radius + 50,
      z: planetsScales.saturnRing.radius + 50,
      ease: "power3.Out",
    });
  } else {
    normalizeButton.textContent = "Normalize sizes";
    for (let mesh of objectsToUpdate) {
      gsap.to(mesh.scale, {
        duration: 1,
        x: getOriginalRadius(mesh.name),
        y: getOriginalRadius(mesh.name),
        z: getOriginalRadius(mesh.name),
        ease: "power3.Out",
      });
    }
    gsap.to(saturnRingMesh.scale, {
      duration: 1,
      x: planetsScales.saturnRing.radius,
      y: planetsScales.saturnRing.radius,
      z: planetsScales.saturnRing.radius,
      ease: "power3.Out",
    });
  }
};

const changeView = () => {
  const saturnRing = saturnGroup.getObjectByName("Saturn Ring");
  isScrollMode = !isScrollMode;
  if (isScrollMode) {
    objectsReferences.visible = false;
    container.style.display = "block";
    container.classList.toggle("fadeIn");

    objectsToUpdate.forEach((mesh, index) => {
      gsap.to(mesh.scale, {
        duration: 1,
        x: 4000,
        y: 4000,
        z: 4000,
        ease: "power3.Out",
      });
      gsap.to(mesh.position, {
        duration: 1,
        x: 0,
        y: -objectsDistance * index * 2,
        z: 0,
        ease: "power3.Out",
      });
    });
    gsap.to(saturnRing.scale, {
      duration: 1,
      x: 2500,
      y: 2500,
      z: 2500,
      ease: "power3.Out",
    });
    gsap.to(saturnRing.rotation, {
      duration: 1,
      x: Math.PI * 0.5,
      y: Math.PI * 0.2,
      ease: "power3.Out",
    });
    gsap.to(saturnRing.position, {
      duration: 1,
      x: 0,
      y: -objectsDistance * 6 * 2,
      z: 0,
      ease: "power3.Out",
    });
  } else {
    objectsReferences.visible = true;
    container.style.display = "none";

    objectsToUpdate.forEach((mesh) => scene.remove(mesh));

    createSaturnRing();
    createSun();
    planetsObjects.forEach(
      ({ name, radius, rotationX, texture, distanceFromSun }, index) => {
        if (index !== 0) {
          createSolarSystemObject(name, radius, rotationX, texture, {
            x: initialMargin + distanceFromSun,
            y: 0,
            z: 0,
          });
        }
      }
    );
  }
};

// Selectors
const $ = (selector) => document.querySelector(selector);
const normalizeButton = $("#normalize__button");

normalizeButton.textContent = "Normalize sizes";
normalizeButton.addEventListener("click", normalizeSizes);

const viewButton = $("#view__button");

viewButton.textContent = "Change view mode";
viewButton.addEventListener("click", changeView);

const container = $(".container");
container.style.display = "none";

// changeView();
