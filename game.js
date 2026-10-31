import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const scene=new THREE.Scene();scene.background=new THREE.Color(0x8fc8ed);scene.fog=new THREE.Fog(0x8fc8ed,65,210);
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,420);
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;document.body.appendChild(renderer.domElement);
const hemi=new THREE.HemisphereLight(0xd9efff,0x53633c,2.1);scene.add(hemi);const sun=new THREE.DirectionalLight(0xffedc5,2.2);sun.position.set(-45,70,35);scene.add(sun);
const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(360,360),mat(0x638d42));ground.rotation.x=-Math.PI/2;ground.position.y=-.12;scene.add(ground);
function hill(x,z,sx,sy,sz,color){const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,9),mat(color));m.position.set(x,sy*.35,z);m.scale.set(sx,sy,sz);scene.add(m)}
for(let i=0;i<22;i++){const a=i/22*Math.PI*2;hill(Math.cos(a)*145,Math.sin(a)*145,24+Math.random()*20,24+Math.random()*28,25+Math.random()*20,i%2?0x65865a:0x78946b)}
hill(-58,18,22,18,30,0x71945e);hill(58,-42,28,22,25,0x6b8c59);hill(32,75,24,18,24,0x789767);
const sand=new THREE.Mesh(new THREE.CircleGeometry(18,48),mat(0xc5b47a));sand.rotation.x=-Math.PI/2;sand.position.set(-28,.01,-20);scene.add(sand);
const lake=new THREE.Mesh(new THREE.CircleGeometry(15.5,48),new THREE.MeshStandardMaterial({color:0x329bc4,roughness:.25,metalness:.12}));lake.rotation.x=-Math.PI/2;lake.position.set(-28,.04,-20);scene.add(lake);
const path=new THREE.Mesh(new THREE.PlaneGeometry(5,75),mat(0xb6a078));path.rotation.x=-Math.PI/2;path.position.set(7,.015,-22);scene.add(path);
const trees=[],trunkMat=mat(0x765033),leafMat=mat(0x28683c),leaf2=mat(0x3d8244);
function tree(x,z,s=1){const g=new THREE.Group();const t=new THREE.Mesh(new THREE.CylinderGeometry(.2*s,.3*s,2.2*s,7),trunkMat);t.position.y=1.1*s;g.add(t);const c=new THREE.Mesh(new THREE.ConeGeometry(1.35*s,3.6*s,8),leafMat);c.position.y=3.1*s;g.add(c);const c2=new THREE.Mesh(new THREE.SphereGeometry(.85*s,8,7),leaf2);c2.position.set(.45*s,3.15*s,.1*s);g.add(c2);g.position.set(x,0,z);g.userData.windPhase=Math.random()*Math.PI*2;g.userData.windStrength=.012+Math.random()*.012;scene.add(g);trees.push(g)}
for(let i=0;i<115;i++){let x=(Math.random()-.5)*220,z=(Math.random()-.5)*220;if(Math.hypot(x,z)>13&&!(x<-8&&x>-49&&z<-1&&z>-39))tree(x,z,.65+Math.random()*.8)}
for(let i=0;i<70;i++){const x=(Math.random()-.5)*200,z=(Math.random()-.5)*200;if(Math.hypot(x,z)>8){const tuft=new THREE.Mesh(new THREE.ConeGeometry(.22+Math.random()*.18,.6,5),mat(0x3f7137));tuft.position.set(x,.25,z);scene.add(tuft)}}
for(let i=0;i<38;i++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.7+Math.random()*.8,0),mat(0x858b88));r.position.set((Math.random()-.5)*190,.35,(Math.random()-.5)*190);r.scale.y=.65;scene.add(r)}

// Arbustos de frutas silvestres
const berryBushes=[];
for(let i=0;i<16;i++){const bush=new THREE.Group();const green=mat(0x356d35),red=mat(0xc93636);const leaves=new THREE.Mesh(new THREE.SphereGeometry(1.05,8,7),green);leaves.scale.set(1.2,.7,.9);leaves.position.y=.8;bush.add(leaves);for(let k=0;k<5;k++){const fruit=new THREE.Mesh(new THREE.SphereGeometry(.13,7,6),red);fruit.position.set(Math.cos(k*1.25)*.7,1+Math.sin(k*1.25)*.25,Math.sin(k*1.25)*.65);bush.add(fruit)}bush.position.set((Math.random()-.5)*90,0,(Math.random()-.5)*90);bush.userData.windPhase=Math.random()*Math.PI*2;scene.add(bush);berryBushes.push(bush)}
// Animais simples que passeiam pelo vale
const animals=[];
function makeAnimal(kind,x,z){const g=new THREE.Group();const coat=mat(kind==='cow'?0xe9e2d2:0x98633d),dark=mat(0x302820),nose=mat(0x4b3028);const torso=new THREE.Mesh(new THREE.BoxGeometry(kind==='cow'?1.6:1.15,.9,.75),coat);torso.position.y=1;g.add(torso);const head=new THREE.Mesh(new THREE.BoxGeometry(.55,.58,.55),coat);head.position.set(0,1.55,.48);g.add(head);const snout=new THREE.Mesh(new THREE.BoxGeometry(.38,.25,.28),nose);snout.position.set(0,1.42,.78);g.add(snout);for(const lx of [-.48,.48])for(const lz of [-.23,.23]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.16,.65,.17),dark);leg.position.set(lx,.35,lz);g.add(leg)}if(kind==='deer'){const ear1=new THREE.Mesh(new THREE.ConeGeometry(.09,.65,5),coat);ear1.position.set(-.2,2,.48);g.add(ear1);const ear2=ear1.clone();ear2.position.x=.2;g.add(ear2)}g.position.set(x,0,z);scene.add(g);animals.push({group:g,kind,phase:Math.random()*6,speed:.45+Math.random()*.35,homeX:x,homeZ:z})}
for(let i=0;i<5;i++)makeAnimal(i<3?'deer':'cow',(Math.random()-.5)*85+35,(Math.random()-.5)*85+25);
function nearestBush(){let best=null,d0=4.5;for(const b of berryBushes){if(!b.visible)continue;const d=Math.hypot(b.position.x-player.position.x,b.position.z-player.position.z);if(d<d0){best=b;d0=d}}return best}

// Cabana de madeira com telhado, porta e janelas
const cabin=new THREE.Group(),woodMat=mat(0x98653b),roofMat=mat(0x493c32),doorMat=mat(0x4a3022);
const floor=new THREE.Mesh(new THREE.BoxGeometry(8,.25,6),mat(0x765238));floor.position.y=.05;cabin.add(floor);
function cabinWall(w,h,d,x,y,z){const wall=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),woodMat);wall.position.set(x,y,z);cabin.add(wall)}
cabinWall(8,4.2,.25,0,2.1,-3);
cabinWall(.25,4.2,6,4,2.1,0);
cabinWall(.25,4.2,6,-4,2.1,0);
cabinWall(3.25,4.2,.25,-2.375,2.1,3);
cabinWall(3.25,4.2,.25,2.375,2.1,3);
const bed=new THREE.Group();const bedBase=new THREE.Mesh(new THREE.BoxGeometry(2.2,.35,1.2),mat(0x68452f));bedBase.position.y=.55;bed.add(bedBase);const mattress=new THREE.Mesh(new THREE.BoxGeometry(2.05,.25,1.08),mat(0xd8d0bd));mattress.position.y=.85;bed.add(mattress);bed.position.set(2.2,0,-1.7);cabin.add(bed);
const chest=new THREE.Mesh(new THREE.BoxGeometry(1.1,.8,.8),mat(0x684323));chest.position.set(-2.3,.55,-1.8);cabin.add(chest);
const roof=new THREE.Mesh(new THREE.ConeGeometry(5.8,3.2,4),roofMat);roof.rotation.y=Math.PI/4;roof.position.y=5.7;roof.scale.set(1,1,.8);cabin.add(roof);
const doorPivot=new THREE.Group();doorPivot.position.set(-.75,1.3,3.06);cabin.add(doorPivot);const door=new THREE.Mesh(new THREE.BoxGeometry(1.5,2.6,.12),doorMat);door.position.x=.75;doorPivot.add(door);let cabinOpen=false,insideCabin=false;
for(const x of [-2.4,2.4]){const w=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.1,.13),mat(0x9bd9e8,.2));w.position.set(x,2.6,3.08);cabin.add(w)}
cabin.position.set(12,0,-13);scene.add(cabin);
// Jogador humano com proporções mais naturais e roupas detalhadas
const player=new THREE.Group();
const skin=mat(0xb98260,.82),shirt=mat(0x245c91,.94),shirtDark=mat(0x173f68,.9),pants=mat(0x303744,.96),shoeMat=mat(0x17191d,.78),hairMat=mat(0x29211e,.9),eyeMat=mat(0x171717,.35);
function addPart(parent,geometry,material,x,y,z,sx=1,sy=1,sz=1){const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh}
function capsuleBetween(parent,a,b,r,material){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),delta=end.clone().sub(start);const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(r,Math.max(.01,delta.length()-r*2),5,8),material);mesh.position.copy(start.add(end).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());parent.add(mesh);return mesh}
// tronco, cintura e pescoço
addPart(player,new THREE.SphereGeometry(1,16,12),shirt,0,1.38,0,.43,.59,.25);
addPart(player,new THREE.CylinderGeometry(.27,.34,.28,12),pants,0,.82,0,1,1,.85);
addPart(player,new THREE.CylinderGeometry(.13,.14,.22,12),skin,0,1.91,0);
// cabeça, cabelo e rosto voltado para a frente (+Z)
addPart(player,new THREE.SphereGeometry(.265,18,14),skin,0,2.19,0,.88,1.12,.9);
addPart(player,new THREE.SphereGeometry(.27,16,10),hairMat,0,2.34,-.035,.92,.55,.94);
addPart(player,new THREE.SphereGeometry(.105,12,8),hairMat,0,2.28,.205,1.15,.6,.8);
for(const side of [-1,1]){
 const lock=addPart(player,new THREE.SphereGeometry(.105,12,10),hairMat,side*.19,2.29,.035,.72,1.1,.78);
 lock.rotation.z=side*-.18;
}
addPart(player,new THREE.SphereGeometry(.12,12,8),hairMat,0,2.405,-.055,1.05,.42,.92);
for(const x of [-.105,.105]){
 addPart(player,new THREE.SphereGeometry(.052,16,12),mat(0xf1e9df),x,2.22,.226,1.05,.78,.48);
 addPart(player,new THREE.SphereGeometry(.026,14,10),mat(0x5b3827),x,2.22,.251);
 addPart(player,new THREE.SphereGeometry(.013,10,8),eyeMat,x,2.22,.264);
 addPart(player,new THREE.SphereGeometry(.007,8,6),mat(0xffffff),x-.006,2.23,.271);
 addPart(player,new THREE.SphereGeometry(.045,12,8),skin,x*2.35,2.18,0,.65,1,.7);
}
addPart(player,new THREE.SphereGeometry(.055,10,8),skin,0,2.12,.25,.65,.75,.7);
// detalhes do rosto: orelhas, nariz, boca e sobrancelhas
for(const side of [-1,1]){
 addPart(player,new THREE.SphereGeometry(.075,16,12),skin,side*.232,2.18,0,.65,1,.7);
 addPart(player,new THREE.SphereGeometry(.034,10,8),mat(0x9b6250),side*.253,2.18,.038,.55,1,.45);
 addPart(player,new THREE.BoxGeometry(.09,.025,.035),hairMat,side*.105,2.265,.235);
}
capsuleBetween(player,[0,2.24,.235],[0,2.13,.29],.027,skin);
addPart(player,new THREE.SphereGeometry(.052,14,10),skin,0,2.13,.285,.9,.72,.8);
for(const side of [-1,1])addPart(player,new THREE.SphereGeometry(.012,8,6),mat(0x70483a),side*.026,2.105,.323);
addPart(player,new THREE.BoxGeometry(.075,.012,.012),mat(0x633d35),0,2.075,.247);
addPart(player,new THREE.BoxGeometry(.085,.018,.012),mat(0x8f5148),0,2.055,.246);
// Acabamento anatômico: clavículas suaves e transição do pescoço
for(const side of [-1,1]){
 const clavicle=capsuleBetween(player,[0,1.82,.205],[side*.25,1.78,.19],.035,shirtDark);
 clavicle.material=shirtDark;
 // Pálpebras superiores discretas para dar profundidade ao olhar
 addPart(player,new THREE.SphereGeometry(.052,14,8),skin,side*.105,2.255,.224,1.04,.28,.48);
}
// Queixo e maçãs do rosto com volumes suaves
addPart(player,new THREE.SphereGeometry(.105,14,10),skin,0,2.075,.17,.95,.48,.72);
for(const side of [-1,1]){
 addPart(player,new THREE.SphereGeometry(.075,12,8),mat(0xc28b6c,.9),side*.15,2.12,.18,1,.72,.48);
}
// gola, mangas, bolso e costuras da camiseta
addPart(player,new THREE.TorusGeometry(.145,.035,7,16),shirtDark,0,1.84,.015,1,1,.8).rotation.x=Math.PI/2;
for(const side of [-1,1]){
 addPart(player,new THREE.SphereGeometry(.16,12,9),shirt,side*.39,1.69,0,1,.8,.9);
 addPart(player,new THREE.BoxGeometry(.16,.19,.025),shirtDark,side*.25,1.48,.235);
}
addPart(player,new THREE.BoxGeometry(.16,.19,.025),shirtDark,.19,1.48,.235);
// cinto e detalhes das calças
addPart(player,new THREE.BoxGeometry(.55,.055,.34),shoeMat,0,.91,0);
addPart(player,new THREE.BoxGeometry(.11,.075,.025),mat(0xb69a55),0,.91,.18);
for(const side of [-1,1]){
 addPart(player,new THREE.BoxGeometry(.13,.16,.025),mat(0x252b34),side*.2,.65,.145);
 // sola clara e língua do calçado
 addPart(player,new THREE.BoxGeometry(.28,.035,.44),mat(0x777777),side*.2,.045,.09);
 addPart(player,new THREE.BoxGeometry(.13,.07,.025),mat(0x333333),side*.2,.14,.29);
}
// Volume corporal e acabamento das roupas
// Ombros arredondados e peito com transição mais humana
for(const side of [-1,1]){
 const shoulder=addPart(player,new THREE.SphereGeometry(.17,16,12),shirt,side*.34,1.69,0,1.12,.88,1);
 shoulder.rotation.z=side*.12;
 addPart(player,new THREE.SphereGeometry(.105,14,10),shirtDark,side*.405,1.62,.012,.92,.72,.94);
 // Costura lateral e punho da manga
 addPart(player,new THREE.TorusGeometry(.105,.012,6,14),shirtDark,side*.405,1.56,0,1,1,.9).rotation.x=Math.PI/2;
 // Bolsos laterais da calça e costuras discretas
 addPart(player,new THREE.BoxGeometry(.12,.19,.018),mat(0x252b34),side*.235,.72,.13);
 addPart(player,new THREE.BoxGeometry(.025,.12,.012),mat(0x59616b),side*.235,.72,.145);
}
// Barra inferior da camiseta e costura da cintura
addPart(player,new THREE.TorusGeometry(.285,.018,6,20),shirtDark,0,1.02,0,1,.72,.88).rotation.x=Math.PI/2;
for(const side of [-1,1]){
 // Cabedal arredondado do tênis, sobre a sola já existente
 addPart(player,new THREE.SphereGeometry(.15,14,10),shoeMat,side*.2,.13,.17,1,.62,1.42);
 // Detalhe da lingueta e cadarços
 addPart(player,new THREE.BoxGeometry(.09,.035,.12),mat(0x777777),side*.2,.19,.245);
 for(let lace=0;lace<3;lace++){
  addPart(player,new THREE.BoxGeometry(.105,.012,.012),mat(0xbababa),side*.2,.205+lace*.018,.27);
 }
}
// Pequenos detalhes de tecido no peito
addPart(player,new THREE.BoxGeometry(.12,.012,.012),shirtDark,0,1.55,.253);
addPart(player,new THREE.BoxGeometry(.018,.11,.012),shirtDark,.12,1.48,.253);
// Membros articulados: ombros, cotovelos, quadris e joelhos
const armPivots=[],elbowPivots=[],legPivots=[],kneePivots=[];
for(const side of [-1,1]){
 const arm=new THREE.Group();arm.position.set(side*.39,1.72,0);player.add(arm);armPivots.push(arm);
 capsuleBetween(arm,[0,0,0],[side*.035,-.36,0],.115,shirt);
 const elbow=new THREE.Group();elbow.position.set(side*.035,-.36,0);arm.add(elbow);elbowPivots.push(elbow);
 capsuleBetween(elbow,[0,0,0],[side*.015,-.34,.015],.085,skin);
 addPart(elbow,new THREE.SphereGeometry(.085,14,10),skin,side*.015,-.36,.02,.9,1,.9);
 addPart(elbow,new THREE.SphereGeometry(.078,14,10),skin,side*.015,-.445,.055,.82,.72,.72);
 for(let finger=0;finger<4;finger++){
  const fx=side*.015+(finger-1.5)*.035;
  capsuleBetween(elbow,[fx,-.47,.075],[fx,-.555-(finger===1||finger===2?.018:0),.08],.014,skin);
 }
 capsuleBetween(elbow,[side*.075,-.43,.06],[side*.105,-.50,.095],.018,skin);
 // Unhas pequenas, mantendo os dedos discretos em escala de jogo
 for(let nail=0;nail<4;nail++){
  const nx=side*.015+(nail-1.5)*.035;
  addPart(elbow,new THREE.BoxGeometry(.014,.018,.008),mat(0xd6b6a5,.75),nx,-.548,.094);
 }
 const leg=new THREE.Group();leg.position.set(side*.19,.82,0);player.add(leg);legPivots.push(leg);
 capsuleBetween(leg,[0,0,0],[0,-.39,0],.145,pants);
 const knee=new THREE.Group();knee.position.set(0,-.39,0);leg.add(knee);kneePivots.push(knee);
 capsuleBetween(knee,[0,0,0],[0,-.32,.015],.105,pants);
 addPart(knee,new THREE.BoxGeometry(.27,.14,.42),shoeMat,0,-.39,.12);
}player.position.set(0,0,0);scene.add(player);
let yaw=0,pitch=-.12,firstPerson=false,velocityY=0,grounded=true,wood=0;const fires=[];let berries=0,hunger=100,storedWood=0,storedBerries=0;
const keys={};addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
const joystick=document.querySelector('#joystick'),stick=document.querySelector('#stick');let joyX=0,joyY=0,joyPointer=null;
joystick.addEventListener('pointerdown',e=>{joyPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);moveJoy(e)});joystick.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)moveJoy(e)});
function moveJoy(e){const r=joystick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,len=Math.hypot(dx,dy),k=Math.min(1,48/(len||1));joyX=dx*k/48;joyY=dy*k/48;stick.style.transform=`translate(${joyX*38}px,${joyY*38}px)`}
function resetJoy(){joyX=joyY=0;joyPointer=null;stick.style.transform='translate(0,0)'}joystick.addEventListener('pointerup',resetJoy);joystick.addEventListener('pointercancel',resetJoy);
let lookPointer=null,lastX=0,lastY=0;renderer.domElement.addEventListener('pointerdown',e=>{if(e.clientX<innerWidth*.42&&e.clientY>innerHeight*.55)return;lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer)return;yaw-=(e.clientX-lastX)*.005;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-lastY)*.003,-.7,.45);lastX=e.clientX;lastY=e.clientY});renderer.domElement.addEventListener('pointerup',()=>lookPointer=null);
function nearestTree(){let best=null,bestD=3.8;for(const t of trees){if(!t.visible)continue;const d=Math.hypot(t.position.x-player.position.x,t.position.z-player.position.z);if(d<bestD){best=t;bestD=d}}return best}
const interact=document.querySelector('#interact');interact.onclick=()=>{
if(insideCabin){insideCabin=false;player.position.set(12,0,-8.2);interact.textContent='ABRIR CABANA';return}
if(!cabinOpen){cabinOpen=true;doorPivot.rotation.y=-1.35;interact.textContent='ENTRAR NA CABANA';return}
insideCabin=true;player.position.set(12,0,-11);interact.textContent='SAIR DA CABANA';
};
const storeButton=document.querySelector('#storeChest'),takeButton=document.querySelector('#takeChest');
storeButton.onclick=()=>{storedWood+=wood;storedBerries+=berries;wood=0;berries=0;updateInventory()};
takeButton.onclick=()=>{wood+=storedWood;berries+=storedBerries;storedWood=0;storedBerries=0;updateInventory()};
const collect=document.querySelector('#collect');
const craft=document.querySelector('#craft');const bag=document.querySelector('#bag');const inventoryPanel=document.querySelector('#inventoryPanel');const gather=document.querySelector('#gather');const eat=document.querySelector('#eat');
gather.onclick=()=>{const b=nearestBush();if(!b)return;b.visible=false;berries+=3;updateInventory()};eat.onclick=()=>{if(berries<1)return;berries--;hunger=Math.min(100,hunger+28);updateInventory()};
function updateInventory(){document.querySelector('#wood').textContent=wood;document.querySelector('#invWood').textContent=wood;document.querySelector('#fires').textContent=fires.length;document.querySelector('#invFires').textContent=fires.length;document.querySelector('#trees').textContent=trees.filter(t=>t.visible).length;document.querySelector('#berries').textContent=berries;document.querySelector('#invBerries').textContent=berries;document.querySelector('#storedWood').textContent=storedWood;document.querySelector('#storedBerries').textContent=storedBerries;document.querySelector('#hunger').textContent=Math.round(hunger)}
bag.onclick=()=>{inventoryPanel.hidden=!inventoryPanel.hidden;bag.textContent=inventoryPanel.hidden?'🎒 INVENTÁRIO':'FECHAR INVENTÁRIO'};
craft.onclick=()=>{if(wood<8){craft.textContent='PRECISA DE 8 MADEIRAS';setTimeout(()=>craft.textContent='CRIAR FOGUEIRA (8)',1500);return}wood-=8;const fire=new THREE.Group();const logMat=mat(0x654128);for(let i=0;i<3;i++){const log=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,1.5,7),logMat);log.rotation.z=Math.PI/2;log.rotation.y=i*Math.PI/3;log.position.y=.15;fire.add(log)}const flame=new THREE.Mesh(new THREE.ConeGeometry(.38,1.1,7),new THREE.MeshBasicMaterial({color:0xff8a19}));flame.position.y=.8;fire.add(flame);const glow=new THREE.PointLight(0xff8a28,1.5,9);glow.position.y=1;fire.add(glow);fire.position.set(player.position.x+Math.sin(yaw)*2,0,player.position.z+Math.cos(yaw)*2);scene.add(fire);fires.push(fire);updateInventory()};collect.onclick=()=>{const t=nearestTree();if(!t)return;t.visible=false;wood+=3;updateInventory()};updateInventory();
document.querySelector('#jump').onclick=()=>{if(grounded){velocityY=7;grounded=false}};
document.querySelector('#camera').onclick=()=>{firstPerson=!firstPerson;document.querySelector('#camera').textContent=firstPerson?'VOLTAR 3ª PESSOA':'1ª / 3ª PESSOA'};
let walkPhase=0,previousPlayerX=0,previousPlayerZ=0,running=false;
document.querySelector('#run').onclick=()=>{running=!running;document.querySelector('#run').textContent=running?'CORRIDA: LIGADA':'CORRER';};

// Pequeno bando de pássaros circulando pelo céu
const birds=[];
for(let i=0;i<5;i++){
 const bird=new THREE.Group();
 const feather=mat(0x34404a);
 const body=new THREE.Mesh(new THREE.SphereGeometry(.22,8,6),feather);
 body.scale.set(1.35,.65,.7);bird.add(body);
 const leftWing=new THREE.Mesh(new THREE.BoxGeometry(.72,.045,.28),feather);
 leftWing.position.set(-.38,.04,0);leftWing.rotation.z=-.18;bird.add(leftWing);
 const rightWing=new THREE.Mesh(new THREE.BoxGeometry(.72,.045,.28),feather);
 rightWing.position.set(.38,.04,0);rightWing.rotation.z=.18;bird.add(rightWing);
 bird.position.set(-35+i*17,19+(i%2)*3,-42-i*8);
 scene.add(bird);
 birds.push({group:bird,leftWing,rightWing,phase:i*1.7,homeX:bird.position.x,homeZ:bird.position.z});
}

 // Nuvens leves atravessando lentamente o céu
 const clouds=[];
 const cloudMaterial=new THREE.MeshStandardMaterial({color:0xf4f7f5,roughness:1,transparent:true,opacity:.92});
 for(let i=0;i<5;i++){
  const cloud=new THREE.Group();
  const puffCount=4+(i%2);
  for(let j=0;j<puffCount;j++){
   const puff=new THREE.Mesh(new THREE.SphereGeometry(1,9,7),cloudMaterial);
   puff.scale.set(3.2+(j%2)*1.1,1.05+(j%3)*.25,1.7+(j%2)*.35);
   puff.position.set((j-1.5)*2.3,(j%2)*.35,(j%3-1)*.65);
   cloud.add(puff);
  }
  cloud.position.set(-95+i*42,34+(i%3)*2,-95+(i%2)*65);
  scene.add(cloud);
  clouds.push({group:cloud,startX:cloud.position.x,speed:1.1+(i%3)*.25});
 }

let gameClock=9;
const daySky=new THREE.Color(0x8fc8ed),nightSky=new THREE.Color(0x101a35);
function updateDayNight(dt){
 gameClock=(gameClock+dt*.04)%24;
 const angle=(gameClock-6)/12*Math.PI;
 const sunHeight=Math.sin(angle);
 const daylight=THREE.MathUtils.smoothstep(sunHeight,-.18,.28);
 scene.background.copy(nightSky).lerp(daySky,daylight);
 scene.fog.color.copy(scene.background);
 sun.position.set(Math.cos(angle)*75,Math.max(-12,sunHeight*85),28);
 sun.intensity=.12+2.08*daylight;
 hemi.intensity=.28+1.82*daylight;
}

const rainCount=320,rainPositions=new Float32Array(rainCount*3),rainSpeeds=new Float32Array(rainCount);
for(let i=0;i<rainCount;i++){rainPositions[i*3]=(Math.random()-.5)*42;rainPositions[i*3+1]=Math.random()*24;rainPositions[i*3+2]=(Math.random()-.5)*42;rainSpeeds[i]=18+Math.random()*12;}
const rainGeometry=new THREE.BufferGeometry();
rainGeometry.setAttribute('position',new THREE.BufferAttribute(rainPositions,3));
const rainMaterial=new THREE.PointsMaterial({color:0xb8d9ef,size:.13,transparent:true,opacity:.8,depthWrite:false});
const rain=new THREE.Points(rainGeometry,rainMaterial);rain.visible=false;scene.add(rain);
let weatherClock=0,stormFlash=0;
function updateWeather(dt){
 weatherClock+=dt;
 const phase=weatherClock%120;
 const raining=phase>35&&phase<62;
 rain.visible=raining;
 rain.position.set(player.position.x,0,player.position.z);
 if(raining){
  const p=rainGeometry.attributes.position.array;
  for(let i=0;i<rainCount;i++){
   const n=i*3;p[n+1]-=rainSpeeds[i]*dt;p[n]+=.8*dt;
   if(p[n+1]<0){p[n]=(Math.random()-.5)*42;p[n+1]=20+Math.random()*5;p[n+2]=(Math.random()-.5)*42;}
  }
  rainGeometry.attributes.position.needsUpdate=true;
  rainMaterial.opacity=phase>58?.8*(62-phase)/4:.8;
  if(phase>45&&Math.random()<.012)stormFlash=.22;
 }
 if(stormFlash>0){stormFlash=Math.max(0,stormFlash-dt);sun.intensity+=stormFlash*13;hemi.intensity+=stormFlash*5;}
}

function updateWind(dt){
 const windPower=.55+Math.sin(weatherClock*.17)*.25+(rain.visible?.35:0);
 for(const t of trees){
  t.userData.windPhase+=dt*(.7+windPower);
  const sway=Math.sin(t.userData.windPhase)*t.userData.windStrength*windPower;
  t.rotation.z=sway;
  t.rotation.x=Math.cos(t.userData.windPhase*.8)*sway*.55;
 }
 for(const b of berryBushes){
  b.userData.windPhase+=dt*(1.1+windPower);
  b.rotation.z=Math.sin(b.userData.windPhase)*.035*windPower;
  b.rotation.x=Math.cos(b.userData.windPhase*.9)*.018*windPower;
 }
}

function update(dt){updateDayNight(dt);updateWeather(dt);updateWind(dt);const nearChest=insideCabin&&Math.hypot(player.position.x-9.7,player.position.z+14.8)<2.8;document.querySelector('#chestPanel').hidden=!nearChest;storeButton.disabled=!nearChest||(wood===0&&berries===0);takeButton.disabled=!nearChest||(storedWood===0&&storedBerries===0);const nearCabin=Math.hypot(player.position.x-12,player.position.z-(-13))<8;interact.disabled=!nearCabin;if(insideCabin){interact.disabled=false;interact.textContent='SAIR DA CABANA'}else if(!nearCabin)interact.textContent='APROXIME-SE DA CABANA';else if(!cabinOpen)interact.textContent='ABRIR CABANA';else interact.textContent='ENTRAR NA CABANA';hunger=Math.max(0,hunger-dt*.12);if(hunger===0)document.querySelector('#health').textContent=Math.max(0,Number(document.querySelector('#health').textContent)-dt*.7).toFixed(0);for(const cloud of clouds){cloud.group.position.x+=cloud.speed*dt;if(cloud.group.position.x>125)cloud.group.position.x=-125;}for(const bird of birds){bird.phase+=dt*2.2;bird.group.position.x=bird.homeX+Math.sin(bird.phase*.45)*8;bird.group.position.y=20+Math.sin(bird.phase*2)*.7;bird.group.position.z=bird.homeZ+Math.cos(bird.phase*.45)*7;bird.group.rotation.y=Math.atan2(Math.cos(bird.phase*.45),-Math.sin(bird.phase*.45));bird.leftWing.rotation.z=-.18+Math.sin(bird.phase*5)*.42;bird.rightWing.rotation.z=.18-Math.sin(bird.phase*5)*.42;}for(const a of animals){a.phase+=dt*a.speed;a.group.position.x=a.homeX+Math.sin(a.phase)*5;a.group.position.z=a.homeZ+Math.cos(a.phase*.7)*4;a.group.rotation.y=Math.atan2(Math.cos(a.phase)*5,-Math.sin(a.phase*.7)*2.8)}const forward=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0)-joyY,side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joyX,s=Math.sin(yaw),c=Math.cos(yaw);const oldX=player.position.x,oldZ=player.position.z;
const nextX=oldX+(side*c-forward*s)*6*(running?1.6:1)*dt,nextZ=oldZ+(side*s-forward*c)*6*(running?1.6:1)*dt;
const oldLX=oldX-12,oldLZ=oldZ+13,newLX=nextX-12,newLZ=nextZ+13;
const insideBounds=Math.abs(newLX)<3.72&&Math.abs(newLZ)<2.72;
const crossedDoorIn=oldLZ>=3.05&&newLZ<3.05&&Math.abs(newLX)<.88;
const crossedDoorOut=oldLZ<=3.05&&newLZ>3.05&&Math.abs(newLX)<.88;
let allowMove=true;
if(!insideCabin){
 if(insideBounds){
  if(cabinOpen&&crossedDoorIn){insideCabin=true}
  else allowMove=false;
 }
}else{
 if(Math.abs(newLX)>=3.72||newLZ<=-2.72||Math.abs(newLX)>=3.72){
  allowMove=false;
 }else if(newLZ>2.72){
  if(cabinOpen&&crossedDoorOut){insideCabin=false}
  else allowMove=false;
 }
}
if(allowMove){player.position.x=nextX;player.position.z=nextZ}
player.position.x=THREE.MathUtils.clamp(player.position.x,-165,165);player.position.z=THREE.MathUtils.clamp(player.position.z,-165,165);const distanceMoved=Math.hypot(player.position.x-oldX,player.position.z-oldZ);
const moveAmount=Math.min(1,distanceMoved/Math.max(dt*4,.001));
if(distanceMoved>.002)walkPhase+=distanceMoved*(running?3.5:2.4);
const stride=distanceMoved>.002?Math.sin(walkPhase)*(running?.9:.72)*moveAmount:0;
const jumpPose=grounded?0:1;
for(let i=0;i<2;i++){
 const direction=i===0?1:-1;
 legPivots[i].rotation.x=stride*direction-.22*jumpPose;
 kneePivots[i].rotation.x=Math.max(0,-stride*direction)*.9+.62*jumpPose;
 armPivots[i].rotation.x=-stride*direction*(running?1.05:.72)-.78*jumpPose;
 elbowPivots[i].rotation.x=-.12+Math.max(0,stride*direction)*.28+.22*jumpPose;
}
if(Math.abs(forward)+Math.abs(side)>.08)player.rotation.y=Math.atan2(-s,-c);
const moving=distanceMoved>.002;
const runLean=running&&moving&&!jumpPose?-.055:0;
player.rotation.x=runLean;
player.rotation.z=moving?Math.sin(walkPhase*.5)*(running?.035:.018)*moveAmount:0;velocityY-=18*dt;player.position.y+=velocityY*dt;if(player.position.y<0){player.position.y=0;velocityY=0;grounded=true}const target=new THREE.Vector3(player.position.x,player.position.y+(firstPerson?1.8:2.2),player.position.z);if(firstPerson){camera.position.copy(target);camera.rotation.set(pitch,yaw,0,'YXZ')}else{camera.position.set(target.x+Math.sin(yaw)*7,target.y+2.1+pitch*3,target.z+Math.cos(yaw)*7);camera.lookAt(target)}}
let last=performance.now();function animate(now){requestAnimationFrame(animate);const t=nearestTree(),b=nearestBush();collect.disabled=!t;collect.textContent=t?'COLETAR MADEIRA (+3)':'APROXIME-SE DE UMA ÁRVORE';gather.disabled=!b;gather.textContent=b?'COLETAR FRUTAS (+3)':'PROCURE ARBUSTOS';eat.disabled=berries<1||hunger>95;craft.disabled=wood<8;craft.style.opacity=wood<8?'.55':'1';const dt=Math.min((now-last)/1000,.04);last=now;update(dt);renderer.render(scene,camera)}requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});document.querySelector('#loading').style.display='none';