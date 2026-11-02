import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb7d1dc);
scene.fog = new THREE.Fog(0xb7d1dc, 95, 310);

const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 700);
const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.6));
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
sun.shadow.mapSize.set(1536, 1536);
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

// Protagonista provisório: corpo humanoide modular. Será substituído por modelo humano detalhado.
const player = new THREE.Group();
const skin = new THREE.MeshStandardMaterial({ color: 0xb9825d, roughness: .9 });
const shirt = new THREE.MeshStandardMaterial({ color: 0x6b4933, roughness: 1 });
const pants = new THREE.MeshStandardMaterial({ color: 0x343b3b, roughness: 1 });
const boots = new THREE.MeshStandardMaterial({ color: 0x241d18, roughness: 1 });
function part(geo, mat, x, y, z, sx=1, sy=1, sz=1) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.castShadow = true; player.add(m); return m;
}
part(new THREE.CapsuleGeometry(.34,.55,5,8), shirt, 0,1.15,0,.9,1, .58);
part(new THREE.SphereGeometry(.23,12,10), skin, 0,1.82,0, .9,1.15,.9);
part(new THREE.CylinderGeometry(.095,.12,.72,8), pants,-.17,.48,0);
part(new THREE.CylinderGeometry(.095,.12,.72,8), pants,.17,.48,0);
part(new THREE.BoxGeometry(.22,.14,.4), boots,-.17,.1,.07);
part(new THREE.BoxGeometry(.22,.14,.4), boots,.17,.1,.07);
part(new THREE.CylinderGeometry(.085,.11,.68,8), shirt,-.43,1.18,0);
part(new THREE.CylinderGeometry(.085,.11,.68,8), shirt,.43,1.18,0);
player.position.set(0,heightAt(0,0),0);
scene.add(player);

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
  let forward=move.y, side=move.x;
  if(keys.w||keys.arrowup)forward-=1;
  if(keys.s||keys.arrowdown)forward+=1;
  if(keys.a||keys.arrowleft)side-=1;
  if(keys.d||keys.arrowright)side+=1;
  const len=Math.hypot(forward,side);
  if(len>.001){
    forward/=Math.max(1,len);side/=Math.max(1,len);
    const dx=Math.sin(yaw)*(-forward)-Math.cos(yaw)*side;
    const dz=Math.cos(yaw)*(-forward)+Math.sin(yaw)*side;
    const next=resolve(player.position.x+dx*5.2*dt,player.position.z+dz*5.2*dt);
    player.position.x=next.x;player.position.z=next.z;
    player.rotation.y=Math.atan2(dx,dz);
  }
  player.position.y=heightAt(player.position.x,player.position.z);
  const target=new THREE.Vector3(player.position.x,player.position.y+1.35,player.position.z);
  const distance=7.2, horizontal=Math.cos(pitch)*distance;
  camera.position.set(target.x+Math.sin(yaw)*horizontal,target.y+Math.sin(pitch)*distance,target.z+Math.cos(yaw)*horizontal);
  camera.lookAt(target);
  renderer.render(scene,camera);
}
frame();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
