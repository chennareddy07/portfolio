

const canvas = document.getElementById("bg-3d");
let enable3D = true;


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 7.5;

const renderer = new THREE.WebGLRenderer({
  canvas,
  alpha: true,
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


const group = new THREE.Group();
scene.add(group);
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hoveredObject = null;

function createMaterial(color) {
  return new THREE.MeshPhysicalMaterial({
    color,
    transparent: true,
    opacity: 0.35,
    roughness: 0.25,
    metalness: 0.1,
    transmission: 0.9,
    thickness: 0.8
  });
}


const geometries = [
  new THREE.IcosahedronGeometry(1),
  new THREE.TorusGeometry(0.8, 0.25, 16, 60),
  new THREE.OctahedronGeometry(0.9),
  new THREE.DodecahedronGeometry(0.7)
];


const shapes = [];
const shapeCount = 12; // MORE SHAPES

for (let i = 0; i < shapeCount; i++) {
  const mesh = new THREE.Mesh(
    geometries[i % geometries.length],
    createMaterial(0x2563eb)
  );

  mesh.position.set(
    (Math.random() - 0.5) * 14, 
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 9
  );

  const scale = 0.6 + Math.random() * 0.6;
  mesh.scale.set(scale, scale, scale);

  
  mesh.userData = {
    basePosition: mesh.position.clone(),
    speed: 0.004 + Math.random() * 0.002,
    offset: Math.random() * 1000
  };

  group.add(mesh);
  shapes.push(mesh);
}


scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);


document.addEventListener("mousemove", e => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
});


function animate(time) {
  if (!enable3D) return;

  group.rotation.y += 0.0015;
  group.rotation.x += 0.0004;


  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(shapes);

  if (intersects.length > 0) {
    if (hoveredObject !== intersects[0].object) {
      if (hoveredObject) {
        hoveredObject.material.color.set(0x2563eb);
        hoveredObject.scale.set(1, 1, 1);
      }
      hoveredObject = intersects[0].object;
      hoveredObject.material.color.set(0xff6b6b);
      hoveredObject.scale.set(1.05, 1.05, 1.05);
    }
  } else if (hoveredObject) {
    hoveredObject.material.color.set(0x2563eb);
    hoveredObject.scale.set(1, 1, 1);
    hoveredObject = null;
  }

  shapes.forEach(mesh => {
    const t = time * 0.0005 + mesh.userData.offset;

    
    mesh.position.y += Math.sin(t) * 0.002;
    mesh.rotation.x += mesh.userData.speed;
    mesh.rotation.y += mesh.userData.speed;
    const attraction = 0.015;
    mesh.position.x += mouse.x * attraction;
    mesh.position.y += mouse.y * attraction;
    const returnStrength = 0.05;
    mesh.position.x += (mesh.userData.basePosition.x - mesh.position.x) * returnStrength;
    mesh.position.y += (mesh.userData.basePosition.y - mesh.position.y) * returnStrength;
    const bounds = { x: 6, y: 4.5, z: 4.5 };
    mesh.position.x = THREE.MathUtils.clamp(mesh.position.x, -bounds.x, bounds.x);
    mesh.position.y = THREE.MathUtils.clamp(mesh.position.y, -bounds.y, bounds.y);
    mesh.position.z = THREE.MathUtils.clamp(mesh.position.z, -bounds.z, bounds.z);
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate(0);
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
document.getElementById("toggle-3d").onclick = () => {
  enable3D = !enable3D;
  document.getElementById("toggle-3d").textContent =
    enable3D ? "3D On" : "3D Off";
  if (enable3D) animate(0);
};

