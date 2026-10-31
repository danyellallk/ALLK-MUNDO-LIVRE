import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const scene=new THREE.Scene();scene.background=new THREE.Color(0x8fc8ed);scene.fog=new THREE.Fog(0x8fc8ed,65,210);
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,420);
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;document.body.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xd9efff,0x53633c,2.1));const sun=new THREE.DirectionalLight(0xffedc5,2.2);sun.position.set(-45,70,35);scene.add(sun);
const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(360,360),mat(0x638d42));ground.rotation.x=-Math.PI/2;ground.position.y=-.12;scene.add(ground);
function hill(x,z,sx,sy,sz,color){const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,9),mat(color));m.position.set(x,sy*.35,z);m.scale.set(sx,sy,sz);scene.add(m)}
for(let i=0;i<22;i++){const a=i/22*Math.PI*2;hill(Math.cos(a)*145,Math.sin(a)*145,24+Math.random()*20,24+Math.random()*28,25+Math.random()*20,i%2?0x65865a:0x78946b)}
hill(-58,18,22,18,30,0x71945e);hill(58,-42,28,22,25,0x6b8c59);hill(32,75,24,18,24,0x789767);
const sand=new THREE.Mesh(new THREE.CircleGeometry(18,48),mat(0xc5b47a));sand.rotation.x=-Math.PI/2;sand.position.set(-28,.01,-20);scene.add(sand);
const lake=new THREE.Mesh(new THREE.CircleGeometry(15.5,48),new THREE.MeshStandardMaterial({color:0x329bc4,roughness:.25,metalness:.12}));lake.rotation.x=-Math.PI/2;lake.position.set(-28,.04,-20);scene.add(lake);
const path=new THREE.Mesh(new THREE.PlaneGeometry(5,75),mat(0xb6a078));path.rotation.x=-Math.PI/2;path.position.set(7,.015,-22);scene.add(path);
const trees=[],trunkMat=mat(0x765033),leafMat=mat(0x28683c),leaf2=mat(0x3d8244);
function tree(x,z,s=1){const g=new THREE.Group();const t=new THREE.Mesh(new THREE.CylinderGeometry(.2*s,.3*s,2.2*s,7),trunkMat);t.position.y=1.1*s;g.add(t);const c=new THREE.Mesh(new THREE.ConeGeometry(1.35*s,3.6*s,8),leafMat);c.position.y=3.1*s;g.add(c);const c2=new THREE.Mesh(new THREE.SphereGeometry(.85*s,8,7),leaf2);c2.position.set(.45*s,3.15*s,.1*s);g.add(c2);g.position.set(x,0,z);scene.add(g);trees.push(g)}
for(let i=0;i<115;i++){let x=(Math.random()-.5)*220,z=(Math.random()-.5)*220;if(Math.hypot(x,z)>13&&!(x<-8&&x>-49&&z<-1&&z>-39))tree(x,z,.65+Math.random()*.8)}
for(let i=0;i<70;i++){const x=(Math.random()-.5)*200,z=(Math.random()-.5)*200;if(Math.hypot(x,z)>8){const tuft=new THREE.Mesh(new THREE.ConeGeometry(.22+Math.random()*.18,.6,5),mat(0x3f7137));tuft.position.set(x,.25,z);scene.add(tuft)}}
for(let i=0;i<38;i++){const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.7+Math.random()*.8,0),mat(0x858b88));r.position.set((Math.random()-.5)*190,.35,(Math.random()-.5)*190);r.scale.y=.65;scene.add(r)}

// Arbustos de frutas silvestres
const berryBushes=[];
for(let i=0;i<16;i++){const bush=new THREE.Group();const green=mat(0x356d35),red=mat(0xc93636);const leaves=new THREE.Mesh(new THREE.SphereGeometry(1.05,8,7),green);leaves.scale.set(1.2,.7,.9);leaves.position.y=.8;bush.add(leaves);for(let k=0;k<5;k++){const fruit=new THREE.Mesh(new THREE.SphereGeometry(.13,7,6),red);fruit.position.set(Math.cos(k*1.25)*.7,1+Math.sin(k*1.25)*.25,Math.sin(k*1.25)*.65);bush.add(fruit)}bush.position.set((Math.random()-.5)*90,0,(Math.random()-.5)*90);scene.add(bush);berryBushes.push(bush)}
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
cabinWall(2.7,4.2,.25,-2.65,2.1,3);
cabinWall(4,4.2,.25,2,2.1,3);
const bed=new THREE.Group();const bedBase=new THREE.Mesh(new THREE.BoxGeometry(2.2,.35,1.2),mat(0x68452f));bedBase.position.y=.55;bed.add(bedBase);const mattress=new THREE.Mesh(new THREE.BoxGeometry(2.05,.25,1.08),mat(0xd8d0bd));mattress.position.y=.85;bed.add(mattress);bed.position.set(2.2,0,-1.7);cabin.add(bed);
const chest=new THREE.Mesh(new THREE.BoxGeometry(1.1,.8,.8),mat(0x684323));chest.position.set(-2.3,.55,-1.8);cabin.add(chest);
const roof=new THREE.Mesh(new THREE.ConeGeometry(5.8,3.2,4),roofMat);roof.rotation.y=Math.PI/4;roof.position.y=5.7;roof.scale.set(1,1,.8);cabin.add(roof);
const doorPivot=new THREE.Group();doorPivot.position.set(-.65,1.3,3.06);cabin.add(doorPivot);const door=new THREE.Mesh(new THREE.BoxGeometry(1.3,2.6,.12),doorMat);door.position.x=.65;doorPivot.add(door);let cabinOpen=false,insideCabin=false;
for(const x of [-2.4,2.4]){const w=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.1,.13),mat(0x9bd9e8,.2));w.position.set(x,2.6,3.08);cabin.add(w)}
cabin.position.set(12,0,-13);scene.add(cabin);
// Jogador
const player=new THREE.Group(),skin=mat(0xc58e68),shirt=mat(0x245c91),pants=mat(0x303744);
const body=new THREE.Mesh(new THREE.CapsuleGeometry(.38,.65,4,8),shirt);body.position.y=1.25;player.add(body);
const head=new THREE.Mesh(new THREE.SphereGeometry(.27,12,10),skin);head.position.y=2.05;player.add(head);
const legs=new THREE.Mesh(new THREE.BoxGeometry(.48,.65,.3),pants);legs.position.set(0,.55,0);player.add(legs);player.position.set(0,0,0);scene.add(player);
let yaw=0,pitch=-.12,firstPerson=false,velocityY=0,grounded=true,wood=0;const fires=[];let berries=0,hunger=100;
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
const collect=document.querySelector('#collect');
const craft=document.querySelector('#craft');const bag=document.querySelector('#bag');const inventoryPanel=document.querySelector('#inventoryPanel');const gather=document.querySelector('#gather');const eat=document.querySelector('#eat');
gather.onclick=()=>{const b=nearestBush();if(!b)return;b.visible=false;berries+=3;updateInventory()};eat.onclick=()=>{if(berries<1)return;berries--;hunger=Math.min(100,hunger+28);updateInventory()};
function updateInventory(){document.querySelector('#wood').textContent=wood;document.querySelector('#invWood').textContent=wood;document.querySelector('#fires').textContent=fires.length;document.querySelector('#invFires').textContent=fires.length;document.querySelector('#trees').textContent=trees.filter(t=>t.visible).length;document.querySelector('#berries').textContent=berries;document.querySelector('#invBerries').textContent=berries;document.querySelector('#hunger').textContent=Math.round(hunger)}
bag.onclick=()=>{inventoryPanel.hidden=!inventoryPanel.hidden;bag.textContent=inventoryPanel.hidden?'🎒 INVENTÁRIO':'FECHAR INVENTÁRIO'};
craft.onclick=()=>{if(wood<8){craft.textContent='PRECISA DE 8 MADEIRAS';setTimeout(()=>craft.textContent='CRIAR FOGUEIRA (8)',1500);return}wood-=8;const fire=new THREE.Group();const logMat=mat(0x654128);for(let i=0;i<3;i++){const log=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,1.5,7),logMat);log.rotation.z=Math.PI/2;log.rotation.y=i*Math.PI/3;log.position.y=.15;fire.add(log)}const flame=new THREE.Mesh(new THREE.ConeGeometry(.38,1.1,7),new THREE.MeshBasicMaterial({color:0xff8a19}));flame.position.y=.8;fire.add(flame);const glow=new THREE.PointLight(0xff8a28,1.5,9);glow.position.y=1;fire.add(glow);fire.position.set(player.position.x+Math.sin(yaw)*2,0,player.position.z+Math.cos(yaw)*2);scene.add(fire);fires.push(fire);updateInventory()};collect.onclick=()=>{const t=nearestTree();if(!t)return;t.visible=false;wood+=3;updateInventory()};updateInventory();
document.querySelector('#jump').onclick=()=>{if(grounded){velocityY=7;grounded=false}};
document.querySelector('#camera').onclick=()=>{firstPerson=!firstPerson;document.querySelector('#camera').textContent=firstPerson?'VOLTAR 3ª PESSOA':'1ª / 3ª PESSOA'};
function update(dt){const nearCabin=Math.hypot(player.position.x-12,player.position.z-(-13))<8;interact.disabled=!nearCabin;if(insideCabin){interact.disabled=false;interact.textContent='SAIR DA CABANA'}else if(!nearCabin)interact.textContent='APROXIME-SE DA CABANA';else if(!cabinOpen)interact.textContent='ABRIR CABANA';else interact.textContent='ENTRAR NA CABANA';hunger=Math.max(0,hunger-dt*.12);if(hunger===0)document.querySelector('#health').textContent=Math.max(0,Number(document.querySelector('#health').textContent)-dt*.7).toFixed(0);for(const a of animals){a.phase+=dt*a.speed;a.group.position.x=a.homeX+Math.sin(a.phase)*5;a.group.position.z=a.homeZ+Math.cos(a.phase*.7)*4;a.group.rotation.y=Math.atan2(Math.cos(a.phase)*5,-Math.sin(a.phase*.7)*2.8)}const forward=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0)-joyY,side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joyX,s=Math.sin(yaw),c=Math.cos(yaw);player.position.x+=(side*c-forward*s)*6*dt;player.position.z+=(side*s+forward*c)*6*dt;player.position.x=THREE.MathUtils.clamp(player.position.x,-165,165);player.position.z=THREE.MathUtils.clamp(player.position.z,-165,165);if(Math.abs(forward)+Math.abs(side)>.08)player.rotation.y=Math.atan2(-s,-c);velocityY-=18*dt;player.position.y+=velocityY*dt;if(player.position.y<0){player.position.y=0;velocityY=0;grounded=true}const target=new THREE.Vector3(player.position.x,player.position.y+(firstPerson?1.8:2.2),player.position.z);if(firstPerson){camera.position.copy(target);camera.rotation.set(pitch,yaw,0,'YXZ')}else{camera.position.set(target.x+Math.sin(yaw)*7,target.y+2.1+pitch*3,target.z+Math.cos(yaw)*7);camera.lookAt(target)}}
let last=performance.now();function animate(now){requestAnimationFrame(animate);const t=nearestTree(),b=nearestBush();collect.disabled=!t;collect.textContent=t?'COLETAR MADEIRA (+3)':'APROXIME-SE DE UMA ÁRVORE';gather.disabled=!b;gather.textContent=b?'COLETAR FRUTAS (+3)':'PROCURE ARBUSTOS';eat.disabled=berries<1||hunger>95;craft.disabled=wood<8;craft.style.opacity=wood<8?'.55':'1';const dt=Math.min((now-last)/1000,.04);last=now;update(dt);renderer.render(scene,camera)}requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});document.querySelector('#loading').style.display='none';