import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb7d1dc);
scene.fog = new THREE.Fog(0xb7d1dc, 95, 310);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 700);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
// Qualidade alta adaptativa: até 2,25x a densidade nativa, limitada para proteger o Android.
renderer.setPixelRatio(Math.min(devicePixelRatio, 2.0));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdcecff, 0x66513a, 1.25));
const sun = new THREE.DirectionalLight(0xffe1b5, 2.1);
sun.position.set(-65, 100, 45);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -95; sun.shadow.camera.right = 95;
sun.shadow.camera.top = 95; sun.shadow.camera.bottom = -95;
sun.shadow.camera.far = 260;
scene.add(sun);

const clamp = THREE.MathUtils.clamp;
function heightAt(x, z) {
  const broad = Math.sin(x * .018 + .7) * 3.8 + Math.cos(z * .021 - .4) * 3.2;
  const hills = Math.sin((x + z) * .012) * 2.5 + Math.cos((x - z) * .015) * 1.8;
  const detail = Math.sin(x * .065) * Math.cos(z * .058) * .55;
  return broad + hills + detail;
}
const groundGeo = new THREE.PlaneGeometry(320, 320, 150, 150);
groundGeo.rotateX(-Math.PI / 2);
const p = groundGeo.attributes.position;
const colors = [];
const c = new THREE.Color();
for (let i = 0; i < p.count; i++) {
  const x = p.getX(i), z = p.getZ(i), y = heightAt(x, z);
  p.setY(i, y);
  const shade = .88 + .1 * Math.sin(x * .08 + z * .03) + .04 * Math.cos(z * .12);
  c.set(0x71834a).multiplyScalar(shade);
  colors.push(c.r, c.g, c.b);
}
groundGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
groundGeo.computeVertexNormals();
const ground = new THREE.Mesh(groundGeo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }));
ground.receiveShadow = true;
scene.add(ground);

const obstacles = [];
const trunkGeo = new THREE.CylinderGeometry(.22, .34, 3.5, 8);
const leafGeo = new THREE.SphereGeometry(1, 10, 8);
const trunkMat = new THREE.MeshStandardMaterial({ color: 0x68452d, roughness: 1 });
const leafMats = [0x456b39, 0x527642, 0x3e6037].map(color => new THREE.MeshStandardMaterial({ color, roughness: .96 }));
let seed = 78123;
function rand() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }

for (let i = 0; i < 190; i++) {
  const x = (rand() - .5) * 270, z = (rand() - .5) * 270;
  if (Math.hypot(x, z) < 13) continue;
  const y = heightAt(x, z), scale = .75 + rand() * .75;
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 1.75 * scale; trunk.scale.setScalar(scale); trunk.castShadow = true;
  tree.add(trunk);
  for (let k = 0; k < 3; k++) {
    const crown = new THREE.Mesh(leafGeo, leafMats[Math.floor(rand() * leafMats.length)]);
    crown.position.set((rand() - .5) * .45, (3.25 + k * .62) * scale, (rand() - .5) * .45);
    crown.scale.set((1.15 - k * .17) * scale, (1.05 - k * .12) * scale, (1.1 - k * .15) * scale);
    crown.castShadow = true; crown.receiveShadow = true; tree.add(crown);
  }
  tree.position.set(x, y, z); tree.rotation.y = rand() * Math.PI * 2;
  scene.add(tree);
  obstacles.push({ x, z, radius: .72 * scale });
}

const rockGeo = new THREE.IcosahedronGeometry(1, 1);
const rockMat = new THREE.MeshStandardMaterial({ color: 0x77766e, roughness: 1, flatShading: true });
for (let i = 0; i < 85; i++) {
  const x = (rand() - .5) * 270, z = (rand() - .5) * 270, size = .35 + rand() * 1.15;
  const rock = new THREE.Mesh(rockGeo, rockMat);
  rock.position.set(x, heightAt(x, z) + size * .35, z);
  rock.scale.set(size * 1.2, size * .7, size);
  rock.rotation.set(rand() * .5, rand() * 6.28, rand() * .5);
  rock.castShadow = true; rock.receiveShadow = true; scene.add(rock);
  obstacles.push({ x, z, radius: size * .85 });
}

// Personagem humano aprimorado, com roupa de viajante do século XIX e articulações animáveis.
const player = new THREE.Group();
const fallbackAvatar = new THREE.Group();
fallbackAvatar.visible = false;
player.add(fallbackAvatar);
const skin = new THREE.MeshStandardMaterial({ color: 0xa96f4d, roughness: .92 });
const coat = new THREE.MeshStandardMaterial({ color: 0x514234, roughness: 1 });
const vest = new THREE.MeshStandardMaterial({ color: 0x8a6a45, roughness: .95 });
const trousers = new THREE.MeshStandardMaterial({ color: 0x343633, roughness: 1 });
const leather = new THREE.MeshStandardMaterial({ color: 0x30251d, roughness: .95 });
const hatMat = new THREE.MeshStandardMaterial({ color: 0x30271f, roughness: .9 });
const detailMat = new THREE.MeshStandardMaterial({ color: 0xc1a16b, metalness: .25, roughness: .65 });
function makeMesh(parent, geo, mat, pos, scale) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...pos);
  if (scale) m.scale.set(...scale);
  m.castShadow = true; m.receiveShadow = true; parent.add(m);
  return m;
}
const torso = new THREE.Group();
torso.position.y = 1.05;
fallbackAvatar.add(torso);
makeMesh(torso,new THREE.CapsuleGeometry(.34,.55,6,12),coat,[0,.22,0],[.92,1,.62]);
makeMesh(torso,new THREE.BoxGeometry(.42,.55,.035),vest,[0,.22,-.205]);
makeMesh(torso,new THREE.CylinderGeometry(.115,.13,.16,12),leather,[0,-.17,0]);
makeMesh(torso,new THREE.BoxGeometry(.09,.12,.035),detailMat,[0,-.17,-.09]);
const neck = makeMesh(torso,new THREE.CylinderGeometry(.105,.12,.18,12),skin,[0,.67,0]);
const head = new THREE.Group(); head.position.set(0,.82,0); torso.add(head);
makeMesh(head,new THREE.SphereGeometry(.235,16,14),skin,[0,.08,0],[.88,1.13,.9]);
// Nariz, orelhas e olhos dão volume ao rosto sem depender de texturas externas.
makeMesh(head,new THREE.SphereGeometry(.055,10,8),skin,[0,.06,-.205],[.7,1,.8]);
for (const side of [-1,1]) {
  makeMesh(head,new THREE.SphereGeometry(.055,10,8),skin,[side*.205,.08,0],[.55,.9,.7]);
  makeMesh(head,new THREE.SphereGeometry(.025,8,6),new THREE.MeshStandardMaterial({color:0x28231f}),[side*.085,.12,-.198],[1,1,.5]);
}
// Chapéu de aba larga, visual de viajante do período.
makeMesh(head,new THREE.CylinderGeometry(.19,.2,.12,16),hatMat,[0,.34,0]);
makeMesh(head,new THREE.CylinderGeometry(.31,.31,.035,20),hatMat,[0,.27,0]);
makeMesh(head,new THREE.BoxGeometry(.18,.035,.018),detailMat,[0,.3,-.195]);

const legs=[];
for (const side of [-1,1]) {
  const hip = new THREE.Group(); hip.position.set(side*.17,-.13,0); torso.add(hip);
  makeMesh(hip,new THREE.CapsuleGeometry(.105,.48,5,9),trousers,[0,-.31,0],[1,1,.95]);
  const knee = new THREE.Group(); knee.position.set(0,-.59,0); hip.add(knee);
  makeMesh(knee,new THREE.CapsuleGeometry(.095,.39,5,9),trousers,[0,-.23,0]);
  makeMesh(knee,new THREE.CylinderGeometry(.105,.13,.2,10),leather,[0,-.51,-.035]);
  makeMesh(knee,new THREE.BoxGeometry(.22,.13,.38),leather,[0,-.62,-.09]);
  legs.push({hip,knee});
}
const arms=[];
for (const side of [-1,1]) {
  const shoulder=new THREE.Group(); shoulder.position.set(side*.34,.53,0); torso.add(shoulder);
  makeMesh(shoulder,new THREE.CapsuleGeometry(.105,.34,5,9),coat,[0,-.23,0],[1,1,.95]);
  const elbow=new THREE.Group(); elbow.position.set(0,-.45,0); shoulder.add(elbow);
  makeMesh(elbow,new THREE.CapsuleGeometry(.085,.32,5,9),coat,[0,-.19,0]);
  makeMesh(elbow,new THREE.SphereGeometry(.09,10,8),skin,[0,-.42,-.005]);
  arms.push({shoulder,elbow});
}

player.position.set(0,heightAt(0,0),0);
scene.add(player);

// Modelo humano 3D externo, texturizado, com esqueleto e animação.
// O avatar procedural fica como reserva caso a conexão falhe.
let humanMixer = null;
let humanWalkAction = null;
const humanLoader = new GLTFLoader();
humanLoader.load(
  'https://grab3d.com/dl/man-base-character-rigged/man-base-character-rigged.glb',
  (gltf) => {
    const human = gltf.scene;
    human.name = 'ALLK_HUMAN_4K_BASE';
    const bounds = new THREE.Box3().setFromObject(human);
    const size = bounds.getSize(new THREE.Vector3());
    const scale = 1.78 / Math.max(size.y, 0.001);
    human.scale.setScalar(scale);
    const scaledBounds = new THREE.Box3().setFromObject(human);
    human.position.y -= scaledBounds.min.y;
    human.traverse((part) => {
      if (part.isMesh) {
        part.castShadow = true;
        part.receiveShadow = true;
        if (part.material) {
          part.material.roughness = Math.max(part.material.roughness ?? 0.8, 0.72);
        }
      }
    });
    player.add(human);
    fallbackAvatar.visible = false;
    if (gltf.animations && gltf.animations.length) {
      humanMixer = new THREE.AnimationMixer(human);
      const walkClip = gltf.animations.find((clip) => /walk/i.test(clip.name)) || gltf.animations[0];
      humanWalkAction = humanMixer.clipAction(walkClip);
      humanWalkAction.play();
      humanWalkAction.paused = true;
      humanWalkAction.time = 0;
      console.info('Animação preparada:', walkClip.name);
    }
    console.info('Modelo humano 3D carregado:', gltf.animations.length, 'animações. Fonte CC0 Innerscene/MakeHuman.');
  },
  undefined,
  (error) => { fallbackAvatar.visible = true; console.error('Falha ao carregar o modelo humano externo. Verifique CORS ou disponibilidade do arquivo.', error); }
);

const move = { x: 0, y: 0 };
let yaw = 0, pitch = .22, lookId = null, lastX = 0, lastY = 0;
const joy = document.querySelector('#joystick'), knob = document.querySelector('#knob');
let joyId = null;
function setJoy(e) {
  const r = joy.getBoundingClientRect(), dx = e.clientX-r.left-r.width/2, dy=e.clientY-r.top-r.height/2;
  const d=Math.hypot(dx,dy), f=Math.min(1, d/43)/(d||1);
  move.x=dx*f; move.y=dy*f; knob.style.transform=`translate(${move.x*43}px,${move.y*43}px)`;
}
joy.addEventListener('pointerdown',e=>{joyId=e.pointerId;joy.setPointerCapture(e.pointerId);setJoy(e);e.preventDefault()});
joy.addEventListener('pointermove',e=>{if(e.pointerId===joyId)setJoy(e)});
function resetJoy(){joyId=null;move.x=move.y=0;knob.style.transform='translate(0,0)'}
joy.addEventListener('pointerup',resetJoy);joy.addEventListener('pointercancel',resetJoy);
renderer.domElement.addEventListener('pointerdown',e=>{if(e.clientX<innerWidth*.38&&e.clientY>innerHeight*.55)return;lookId=e.pointerId;lastX=e.clientX;lastY=e.clientY});
addEventListener('pointerup',e=>{if(e.pointerId===lookId)lookId=null});
addEventListener('pointercancel',e=>{if(e.pointerId===lookId)lookId=null});
addEventListener('pointermove',e=>{if(e.pointerId!==lookId)return;yaw-=(e.clientX-lastX)*.0045;pitch=clamp(pitch+(e.clientY-lastY)*.003,-.25,.8);lastX=e.clientX;lastY=e.clientY});
const keys = {};
addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);

function resolve(x,z) {
  for (const o of obstacles) {
    const dx=x-o.x,dz=z-o.z,d=Math.hypot(dx,dz),min=o.radius+.48;
    if(d<min&&d>.0001){x+=dx/d*(min-d);z+=dz/d*(min-d)}
  }
  return {x,z};
}
const clock = new THREE.Clock();
function frame() {
  requestAnimationFrame(frame);
  const dt=Math.min(clock.getDelta(),.04);
  if (humanMixer && humanWalkAction && !humanWalkAction.paused) humanMixer.update(dt);
  // Controles corrigidos: joystick para cima = avançar; direita = mover à direita.
  let forward = -move.y;
  let side = move.x;
  if (keys.w || keys.arrowup) forward += 1;
  if (keys.s || keys.arrowdown) forward -= 1;
  if (keys.a || keys.arrowleft) side -= 1;
  if (keys.d || keys.arrowright) side += 1;
  const len = Math.hypot(forward, side);
  const walking = len > 0.08;
  if (humanWalkAction) humanWalkAction.paused = !walking;
  if (walking) {
    const magnitude = Math.max(1, len);
    forward /= magnitude;
    side /= magnitude;
    // Movimento relativo à câmera: frente acompanha para onde a câmera olha.
    const dx = -Math.sin(yaw) * forward + Math.cos(yaw) * side;
    const dz = -Math.cos(yaw) * forward - Math.sin(yaw) * side;
    const next = resolve(
      player.position.x + dx * 5.2 * dt,
      player.position.z + dz * 5.2 * dt
    );
    player.position.x = next.x;
    player.position.z = next.z;
    // O rosto do personagem aponta para a direção em que está caminhando.
    player.rotation.y = Math.atan2(-dx, -dz);
  }
  const walkTime = clock.elapsedTime * 8.5;
  const stride = walking ? Math.sin(walkTime) : 0;
  for (let i=0;i<2;i++) {
    legs[i].hip.rotation.x = stride * .48 * (i===0?1:-1);
    legs[i].knee.rotation.x = walking ? Math.max(0,Math.sin(walkTime+(i===0?0:Math.PI)))*.55 : 0;
    arms[i].shoulder.rotation.x = -stride * .34 * (i===0?1:-1);
    arms[i].elbow.rotation.x = -.12 + Math.max(0,stride*(i===0?1:-1))*.18;
  }
  torso.position.y = 1.05 + (walking ? Math.abs(Math.sin(walkTime*2))*.025 : Math.sin(clock.elapsedTime*1.7)*.008);
  player.position.y=heightAt(player.position.x,player.position.z);
  const target=new THREE.Vector3(player.position.x,player.position.y+1.35,player.position.z);
  const distance=7.2, horizontal=Math.cos(pitch)*distance;
  camera.position.set(target.x+Math.sin(yaw)*horizontal,target.y+Math.sin(pitch)*distance,target.z+Math.cos(yaw)*horizontal);
  camera.lookAt(target);
  renderer.render(scene,camera);
}
frame();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
