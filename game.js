import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9bc5df);
scene.fog = new THREE.Fog(0x9bc5df, 35, 115);
const camera = new THREE.PerspectiveCamera(70, innerWidth/innerHeight, .1, 220);
const renderer = new THREE.WebGLRenderer({antialias:false, powerPreference:'low-power'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled = false;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xd8edff,0x52633c,2));
const sun = new THREE.DirectionalLight(0xfff0cf,2.1);
sun.position.set(-25,40,20); scene.add(sun);

const ground = new THREE.Mesh(new THREE.PlaneGeometry(220,220),new THREE.MeshStandardMaterial({color:0x527d3d,roughness:1}));
ground.rotation.x=-Math.PI/2; ground.position.y=-.08; scene.add(ground);

const grid = new THREE.GridHelper(220,44,0x456b37,0x5a8249);
grid.position.y=-.06; scene.add(grid);

function tree(x,z,s=1){
  const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18*s,.25*s,2*s,6),new THREE.MeshStandardMaterial({color:0x76502e}));
  trunk.position.set(0,s,0); group.add(trunk);
  const crown=new THREE.Mesh(new THREE.ConeGeometry(1.15*s,3*s,7),new THREE.MeshStandardMaterial({color:0x28633b}));
  crown.position.set(x,2.8*s,z); scene.add(crown);
}
function rock(x,z,s=1){
  const m=new THREE.Mesh(new THREE.DodecahedronGeometry(.65*s,0),new THREE.MeshStandardMaterial({color:0x777b78,roughness:1}));
  m.position.set(x,.35*s,z); m.scale.y=.7; scene.add(m);
}
for(let i=0;i<105;i++){
  const x=(Math.random()-.5)*180,z=(Math.random()-.5)*180;
  if(Math.hypot(x,z)>9) tree(x,z,.7+Math.random()*.65);
}
document.querySelector('#trees').textContent=trees.length;\nfor(let i=0;i<34;i++) rock((Math.random()-.5)*170,(Math.random()-.5)*170,.6+Math.random());

const player=new THREE.Group();
const skin=new THREE.MeshStandardMaterial({color:0xc58e68});
const shirt=new THREE.MeshStandardMaterial({color:0x245c91});
const pants=new THREE.MeshStandardMaterial({color:0x303744});
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.65,4,7),shirt); body.position.y=1.25; player.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.27,8,8),skin); head.position.y=2.05; player.add(head);
const legs=new THREE.Mesh(new THREE.BoxGeometry(.48,.65,.3),pants); legs.position.set(0,.55,0); player.add(legs);
player.position.set(0,0,0); scene.add(player);

let yaw=0, pitch=-.12, firstPerson=false, velocityY=0, grounded=true, wood=0;
const keys={}; addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
const joystick=document.querySelector('#joystick'),stick=document.querySelector('#stick');
let joyX=0,joyY=0,joyPointer=null;
joystick.addEventListener('pointerdown',e=>{joyPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);moveJoy(e)});
joystick.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)moveJoy(e)});
function moveJoy(e){const r=joystick.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),len=Math.hypot(dx,dy),k=Math.min(1,48/(len||1));joyX=dx*k/48;joyY=dy*k/48;stick.style.transform=`translate(${joyX*38}px,${joyY*38}px)`;}
function resetJoy(){joyX=joyY=0;joyPointer=null;stick.style.transform='translate(0,0)'}
joystick.addEventListener('pointerup',resetJoy);joystick.addEventListener('pointercancel',resetJoy);

let lookPointer=null,lastX=0,lastY=0;
renderer.domElement.addEventListener('pointerdown',e=>{if(e.clientX<innerWidth*.42 && e.clientY>innerHeight*.55)return;lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer)return;yaw-=(e.clientX-lastX)*.005;pitch=Math.max(-.7,Math.min(.45,pitch+(e.clientY-lastY)*.003));lastX=e.clientX;lastY=e.clientY});
renderer.domElement.addEventListener('pointerup',()=>lookPointer=null);
const collectButton=document.querySelector('#collect');\nfunction nearestTree(){let best=null,bestD=3.4;for(const t of trees){if(!t.visible)continue;const d=Math.hypot(t.position.x-player.position.x,t.position.z-player.position.z);if(d<bestD){best=t;bestD=d}}return best}\ncollectButton.onclick=()=>{const t=nearestTree();if(!t)return;t.visible=false;wood+=3;document.querySelector('#wood').textContent=wood;document.querySelector('#trees').textContent=trees.filter(x=>x.visible).length};\n document.querySelector('#jump').onclick=()=>{if(grounded){velocityY=7;grounded=false}};
document.querySelector('#camera').onclick=()=>{firstPerson=!firstPerson;document.querySelector('#camera').textContent=firstPerson?'VOLTAR 3ª PESSOA':'1ª / 3ª PESSOA'};

function update(dt){
 const forward=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0)-joyY;
 const side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joyX;
 const speed=6, sin=Math.sin(yaw),cos=Math.cos(yaw);
 player.position.x+=(side*cos-forward*sin)*speed*dt;
 player.position.z+=(side*sin+forward*cos)*speed*dt;
 player.position.x=THREE.MathUtils.clamp(player.position.x,-105,105);
 player.position.z=THREE.MathUtils.clamp(player.position.z,-105,105);
 if(Math.abs(forward)+Math.abs(side)>.08) player.rotation.y=Math.atan2(-sin,-cos);
 velocityY-=18*dt; player.position.y+=velocityY*dt;
 if(player.position.y<0){player.position.y=0;velocityY=0;grounded=true}
 const target=new THREE.Vector3(player.position.x,player.position.y+(firstPerson?1.8:2.2),player.position.z);
 if(firstPerson){camera.position.copy(target);camera.rotation.set(pitch,yaw,0,'YXZ')}
 else {const dist=6.5;camera.position.set(target.x+Math.sin(yaw)*dist,target.y+2.2+pitch*3,target.z+Math.cos(yaw)*dist);camera.lookAt(target)}
}
let last=performance.now();
function animate(now){requestAnimationFrame(animate);const near=nearestTree();collectButton.disabled=!near;collectButton.textContent=near?'COLETAR MADEIRA (+3)':'APROXIME-SE DE UMA ÁRVORE';const dt=Math.min((now-last)/1000,.04);last=now;update(dt);renderer.render(scene,camera)}
requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
document.querySelector('#loading').style.display='none';
