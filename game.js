import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
const scene=new THREE.Scene();
// Lista criada no início para evitar acesso antes da inicialização.
const townsfolk=[];scene.background=new THREE.Color(0xa9cbdc);scene.fog=new THREE.Fog(0xa9c3c9,125,330);
const camera=new THREE.PerspectiveCamera(68,innerWidth/innerHeight,.1,420);
const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));renderer.setSize(innerWidth,innerHeight);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;document.body.appendChild(renderer.domElement);
const hemi=new THREE.HemisphereLight(0xe5f3ff,0x596348,1.85);scene.add(hemi);const sun=new THREE.DirectionalLight(0xffe4bd,2.35);sun.position.set(-45,70,35);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-95;sun.shadow.camera.right=95;sun.shadow.camera.top=95;sun.shadow.camera.bottom=-95;sun.shadow.camera.near=1;sun.shadow.camera.far=190;sun.shadow.bias=-.00018;sun.shadow.normalBias=.025;sun.shadow.radius=3;scene.add(sun);
const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness});
// Texturas procedurais leves: geradas localmente, sem downloads ou serviços pagos.
function makeSurfaceTexture(base,spots,seed=1){
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
 const ctx=canvas.getContext('2d');ctx.fillStyle=base;ctx.fillRect(0,0,512,512);
 let n=seed;
 const rand=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296};
 for(let i=0;i<10500;i++){
  const x=rand()*512,y=rand()*512,r=.5+rand()*3.2;
  ctx.globalAlpha=.08+rand()*.22;ctx.fillStyle=spots[Math.floor(rand()*spots.length)];
  ctx.beginPath();ctx.ellipse(x,y,r*1.8,r,rand()*Math.PI,0,Math.PI*2);ctx.fill();
 }
 ctx.globalAlpha=1;
 const tex=new THREE.CanvasTexture(canvas);tex.wrapS=tex.wrapT=THREE.RepeatWrapping;
 tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());
 return tex;
}
const grassTexture=makeSurfaceTexture('#587943',['#b5bd65','#3f6735','#82a64a','#c0b66a','#554b2c','#8b9950'],171);
grassTexture.repeat.set(18,18);
grassTexture.magFilter=THREE.LinearFilter;
grassTexture.minFilter=THREE.LinearMipmapLinearFilter;
// Pequenas manchas orgânicas e grãos finos para quebrar a aparência chapada do terreno.
function makeGroundDetail(){
 const c=document.createElement('canvas');c.width=1024;c.height=1024;
 const q=c.getContext('2d');q.fillStyle='#59472f';q.fillRect(0,0,1024,1024);
 let seed=8421;const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<22000;i++){
  const x=rnd()*1024,y=rnd()*1024,r=.5+rnd()*3.5;
  q.globalAlpha=.08+rnd()*.2;q.fillStyle=['#d2b982','#34291e','#806342','#b49a6c','#493a29'][i%5];
  q.beginPath();q.ellipse(x,y,r*1.8,r,.0,0,Math.PI*2);q.fill();
 }
 for(let i=0;i<180;i++){
  const x=rnd()*1024,y=rnd()*1024,rx=5+rnd()*30,ry=3+rnd()*18;
  q.globalAlpha=.05+rnd()*.09;q.fillStyle=rnd()>.5?'#c2ad72':'#243b20';
  q.beginPath();q.ellipse(x,y,rx,ry,rnd()*Math.PI,0,Math.PI*2);q.fill();
 }
 q.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;
 t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());return t;
}
const groundDetail=makeGroundDetail();groundDetail.repeat.set(9,9);
const groundMaterial=new THREE.MeshStandardMaterial({map:grassTexture,bumpMap:groundDetail,bumpScale:.19,color:0xe9f1d9,roughness:1});
// Relevo real em malha 3D. A altura é calculada uma única vez e guardada em cache.
const TERRAIN_SIZE=360,TERRAIN_SEGMENTS=180,TERRAIN_STEP=TERRAIN_SIZE/TERRAIN_SEGMENTS;
const TERRAIN_HALF=TERRAIN_SIZE*.5,TERRAIN_ROW=TERRAIN_SEGMENTS+1;
const terrainHeights=new Float32Array(TERRAIN_ROW*TERRAIN_ROW);
function rawTerrainHeight(x,z){
 const edge=THREE.MathUtils.smoothstep(Math.hypot(x,z),48,82);
 const peaks=[[-102,-88,25,26,35],[-60,-125,18,24,28],[8,-132,23,30,34],[88,-105,27,32,30],[130,-35,20,27,34],[-128,30,23,30,35],[-88,112,20,34,30],[5,132,19,32,30],[105,100,25,34,30]];
 let h=0;
 for(const [cx,cz,amp,wx,wz] of peaks){const dx=(x-cx)/wx,dz=(z-cz)/wz;h+=amp*Math.exp(-(dx*dx+dz*dz));}
 const rolling=(Math.sin(x*.045+z*.021)+Math.cos(z*.052-x*.018))*.8;
 const ridges=2.2*Math.max(0,Math.sin(x*.035+z*.018))*Math.exp(-Math.pow((z-x*.22)/95,2));
 return Math.max(0,(h+rolling+ridges)*edge);
}
const terrainGeometry=new THREE.PlaneGeometry(TERRAIN_SIZE,TERRAIN_SIZE,TERRAIN_SEGMENTS,TERRAIN_SEGMENTS);
const terrainPositions=terrainGeometry.attributes.position,terrainColors=new Float32Array(terrainPositions.count*3);
const terrainLow=new THREE.Color(0xffffff),terrainHigh=new THREE.Color(0x8c826f),terrainTint=new THREE.Color();
for(let i=0;i<terrainPositions.count;i++){
 const x=terrainPositions.getX(i),z=-terrainPositions.getY(i),h=rawTerrainHeight(x,z);
 terrainHeights[i]=h;terrainPositions.setZ(i,h);
 terrainTint.copy(terrainLow).lerp(terrainHigh,THREE.MathUtils.smoothstep(h,5,25));
 terrainColors[i*3]=terrainTint.r;terrainColors[i*3+1]=terrainTint.g;terrainColors[i*3+2]=terrainTint.b;
}
terrainGeometry.setAttribute('color',new THREE.Float32BufferAttribute(terrainColors,3));terrainGeometry.computeVertexNormals();
function terrainHeight(x,z){
 const gx=THREE.MathUtils.clamp((x+TERRAIN_HALF)/TERRAIN_STEP,0,TERRAIN_SEGMENTS),gy=THREE.MathUtils.clamp((z+TERRAIN_HALF)/TERRAIN_STEP,0,TERRAIN_SEGMENTS);
 const x0=Math.floor(gx),y0=Math.floor(gy),x1=Math.min(TERRAIN_SEGMENTS,x0+1),y1=Math.min(TERRAIN_SEGMENTS,y0+1),tx=gx-x0,ty=gy-y0;
 const a=terrainHeights[y0*TERRAIN_ROW+x0],b=terrainHeights[y0*TERRAIN_ROW+x1],c=terrainHeights[y1*TERRAIN_ROW+x0],d=terrainHeights[y1*TERRAIN_ROW+x1];
 return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a,b,tx),THREE.MathUtils.lerp(c,d,tx),ty);
}
groundMaterial.vertexColors=true;
const ground=new THREE.Mesh(terrainGeometry,groundMaterial);ground.rotation.x=-Math.PI/2;ground.position.y=0;ground.receiveShadow=true;scene.add(ground);
// Montanhas de fundo com silhueta irregular e camadas rochosas; cenário distante, fora da área de colisão.
function hill(x,z,sx,sy,sz,color){
 const geo=new THREE.SphereGeometry(1,24,16),p=geo.attributes.position;
 const hillColors=new Float32Array(p.count*3),baseColor=new THREE.Color(color),stoneColor=new THREE.Color(0xaaa397),shadowStone=new THREE.Color(0x77766e),mixedColor=new THREE.Color();
 for(let i=0;i<p.count;i++){
  const px=p.getX(i),py=p.getY(i),pz=p.getZ(i);
  const ridge=1+.085*Math.sin(px*11+x*.07)*Math.cos(pz*9+z*.05)+.04*Math.sin(py*17+x*.03+z*.04);
  const detail=Math.sin(px*23+pz*17+x*.13)*Math.sin(py*19+pz*13+z*.11);
  p.setXYZ(i,px*ridge,py*(1+.045*Math.sin(px*8+pz*6)),pz*ridge);
  const exposed=THREE.MathUtils.smoothstep(py+detail*.10,.20,.78);
  mixedColor.copy(baseColor).lerp(stoneColor,exposed*.78);
  mixedColor.lerp(shadowStone,Math.max(0,detail)*.10);
  hillColors[i*3]=mixedColor.r;hillColors[i*3+1]=mixedColor.g;hillColors[i*3+2]=mixedColor.b;
 }
 geo.setAttribute('color',new THREE.Float32BufferAttribute(hillColors,3));
 geo.computeVertexNormals();
 const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:1,flatShading:true}));
 m.position.set(x,terrainHeight(x,z)+sy*.35,z);m.scale.set(sx,sy,sz);m.receiveShadow=true;scene.add(m);
 const foot=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),new THREE.MeshStandardMaterial({color:0x526f4a,roughness:1}));
 foot.position.set(x,terrainHeight(x,z)+sy*.13,z);foot.scale.set(sx*1.12,sy*.43,sz*1.12);foot.receiveShadow=true;scene.add(foot);
}
for(let i=0;i<22;i++){const a=i/22*Math.PI*2;hill(Math.cos(a)*145,Math.sin(a)*145,24+Math.random()*20,24+Math.random()*28,25+Math.random()*20,i%2?0x65865a:0x78946b)}
hill(-58,18,22,18,30,0x71945e);hill(58,-42,28,22,25,0x6b8c59);hill(32,75,24,18,24,0x789767);
const sand=new THREE.Mesh(new THREE.CircleGeometry(18,48),mat(0xc5b47a));sand.rotation.x=-Math.PI/2;sand.position.set(-28,.01,-20);scene.add(sand);
// Superfície do lago com textura procedural de ondulações, sem dependência externa.
const waterCanvas=document.createElement('canvas');waterCanvas.width=512;waterCanvas.height=512;
const waterCtx=waterCanvas.getContext('2d');
const waterGradient=waterCtx.createRadialGradient(256,256,25,256,256,270);
waterGradient.addColorStop(0,'#4aa9c5');waterGradient.addColorStop(.62,'#268db5');waterGradient.addColorStop(1,'#176b91');
waterCtx.fillStyle=waterGradient;waterCtx.fillRect(0,0,512,512);
let waterSeed=4401;const waterRand=()=>{waterSeed=(waterSeed*1664525+1013904223)>>>0;return waterSeed/4294967296};
for(let k=0;k<230;k++){
 const x=waterRand()*512,y=waterRand()*512,len=8+waterRand()*46;
 waterCtx.globalAlpha=.08+waterRand()*.2;waterCtx.strokeStyle=waterRand()>.5?'#d2f6f2':'#124f79';
 waterCtx.lineWidth=.7+waterRand()*2.2;waterCtx.beginPath();
 waterCtx.moveTo(x,y);waterCtx.quadraticCurveTo(x+len*.5,y-3-waterRand()*5,x+len,y+waterRand()*3);waterCtx.stroke();
}
waterCtx.globalAlpha=1;
const waterTexture=new THREE.CanvasTexture(waterCanvas);waterTexture.colorSpace=THREE.SRGBColorSpace;
waterTexture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
const lakeMaterial=new THREE.MeshStandardMaterial({map:waterTexture,color:0xe5f8ff,roughness:.16,metalness:.12});
const lake=new THREE.Mesh(new THREE.CircleGeometry(15.5,64),lakeMaterial);lake.rotation.x=-Math.PI/2;lake.position.set(-28,.04,-20);scene.add(lake);
const lakeWaveMaterial=new THREE.MeshBasicMaterial({color:0xc8f4ff,transparent:true,opacity:.22,side:THREE.DoubleSide,depthWrite:false});
const lakeWaves=[];
for(let i=0;i<9;i++){
 const wave=new THREE.Mesh(new THREE.RingGeometry(.28,.36,32),lakeWaveMaterial.clone());
 wave.rotation.x=-Math.PI/2;
 const angle=i*2.399,dist=2.2+(i%3)*3.1;
 wave.position.set(-28+Math.cos(angle)*dist,.065+i*.0005,-20+Math.sin(angle)*dist);
 scene.add(wave);
 lakeWaves.push({mesh:wave,phase:i*.83,speed:.45+(i%4)*.12});
}
const waterRipples=[];
const rippleMaterial=new THREE.MeshBasicMaterial({color:0xbcefff,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false});
function makeWaterRipple(x,z){
 const ring=new THREE.Mesh(new THREE.RingGeometry(.12,.2,32),rippleMaterial.clone());
 ring.rotation.x=-Math.PI/2;ring.position.set(x,.075,z);scene.add(ring);
 waterRipples.push({mesh:ring,life:0});
}
const dirtTexture=makeSurfaceTexture('#806344',['#d8bd8a','#4c3928','#b59667','#685037','#e0c99b'],291);dirtTexture.repeat.set(2,18);dirtTexture.magFilter=THREE.LinearFilter;dirtTexture.minFilter=THREE.LinearMipmapLinearFilter;
const path=new THREE.Mesh(new THREE.PlaneGeometry(7,95),new THREE.MeshStandardMaterial({map:dirtTexture,color:0xd1b184,roughness:1}));path.rotation.x=-Math.PI/2;path.position.set(7,.015,-22);scene.add(path);
function makeBarkTexture(){
 const c=document.createElement('canvas');c.width=256;c.height=512;const q=c.getContext('2d');
 q.fillStyle='#60402b';q.fillRect(0,0,256,512);let seed=73;
 const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<950;i++){const x=rnd()*256,y=rnd()*512;q.globalAlpha=.12+rnd()*.28;q.strokeStyle=['#ad8050','#241b15','#d0a16b','#49301f'][i%4];q.lineWidth=1+rnd()*4;q.beginPath();q.moveTo(x,y);q.lineTo(x+(rnd()-.5)*9,y+12+rnd()*85);q.stroke()}
 q.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;return t;
}
function makeLeafTexture(){
 const c=document.createElement('canvas');c.width=256;c.height=256;const q=c.getContext('2d');
 q.fillStyle='#315f2b';q.fillRect(0,0,256,256);let seed=119;
 const rnd=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
 for(let i=0;i<1800;i++){const x=rnd()*256,y=rnd()*256,r=1+rnd()*5;q.globalAlpha=.18+rnd()*.5;q.fillStyle=['#8fb84c','#477d32','#244d27','#c0c96a','#39703a'][i%5];q.beginPath();q.ellipse(x,y,r*1.5,r,.4,0,Math.PI*2);q.fill()}
 q.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;
}
const barkTexture=makeBarkTexture(),leafTexture=makeLeafTexture();
const trees=[],trunkMat=new THREE.MeshStandardMaterial({map:barkTexture,roughness:1}),leafMat=new THREE.MeshStandardMaterial({map:leafTexture,roughness:1});
const canopyGeo=new THREE.SphereGeometry(1,14,11);
function tree(x,z,s=1){
 const g=new THREE.Group();
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18*s,.34*s,2.7*s,10,5),trunkMat);trunk.position.y=1.35*s;trunk.castShadow=true;trunk.receiveShadow=true;g.add(trunk);
 for(let k=0;k<3;k++){const branch=new THREE.Mesh(new THREE.CylinderGeometry(.045*s,.10*s,.9*s,7),trunkMat);branch.position.set((k-1)*.23*s,2.15*s,.12*s);branch.rotation.z=(k-1)*-.55;branch.castShadow=true;g.add(branch)}
 const clusters=[[-.55,3.05,0,.92],[.48,3.15,.12,1.02],[0,3.75,-.12,.95],[.02,2.85,.62,.82]];
 for(const [cx,cy,cz,r] of clusters){const crown=new THREE.Mesh(canopyGeo,leafMat);crown.position.set(cx*s,cy*s,cz*s);crown.scale.set(r*s,r*.82*s,r*s);crown.receiveShadow=true;g.add(crown)}
 g.position.set(x,terrainHeight(x,z),z);g.userData.windPhase=Math.random()*Math.PI*2;g.userData.windStrength=.012+Math.random()*.012;scene.add(g);trees.push(g)
}
for(let i=0;i<115;i++){let x=(Math.random()-.5)*220,z=(Math.random()-.5)*220;if(Math.hypot(x,z)>13&&!(x<-8&&x>-49&&z<-1&&z>-39))tree(x,z,.65+Math.random()*.8)}
// Grama 3D: milhares de folhas finas em pequenos tufos, desenhadas em uma única chamada por instância.
{
 const bladeMat=new THREE.MeshStandardMaterial({color:0x6b963f,roughness:1,side:THREE.DoubleSide});
 const bladeGeo=new THREE.BufferGeometry();
 const verts=[
  0,0,0, -.075,.42,0, .075,.42,0,
  0,0,0, 0,.53,.035, .045,.38,.035,
  0,0,0, -.035,.36,-.035, 0,.49,-.035
 ];
 bladeGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
 bladeGeo.computeVertexNormals();
 const grass=new THREE.InstancedMesh(bladeGeo,bladeMat,12500);
 const dummy=new THREE.Object3D();
 let count=0;
 for(let i=0;i<12500;i++){
  const x=(Math.random()-.5)*210,z=(Math.random()-.5)*210;
  const lakeDist=Math.hypot(x+28,z+20);
  const pathZone=Math.abs(x-7)<3.8&&z>-61&&z<17;
  const sandZone=lakeDist<18.8;
  if(lakeDist<16.2||pathZone||sandZone)continue;
  dummy.position.set(x,terrainHeight(x,z)+.015,z);
  dummy.rotation.set(0,Math.random()*Math.PI*2,0);
  const scale=.55+Math.random()*1.05;
  dummy.scale.set(scale,.65+Math.random()*.8,scale);
  dummy.updateMatrix();grass.setMatrixAt(count++,dummy.matrix);
 }
 grass.count=count;
 grass.instanceMatrix.needsUpdate=true;
 scene.add(grass);
}
// Pedras físicas: podem ser empurradas pelo jogador e desaceleram no terreno.
const rocks=[];
for(let i=0;i<38;i++){
 const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.7+Math.random()*.8,0),mat(0x858b88));
 const rx=(Math.random()-.5)*190,rz=(Math.random()-.5)*190;rock.position.set(rx,terrainHeight(rx,rz)+.35,rz);
 rock.scale.y=.65;rock.castShadow=true;rock.receiveShadow=true;rock.rotation.set(Math.random()*.3,Math.random()*Math.PI,Math.random()*.3);
 rock.userData={vx:0,vz:0,radius:.72+rock.scale.x*.45};
 scene.add(rock);rocks.push(rock);
}

// Arbustos de frutas silvestres
const berryBushes=[];
for(let i=0;i<16;i++){const bush=new THREE.Group();const green=mat(0x356d35),red=mat(0xc93636);const leaves=new THREE.Mesh(new THREE.SphereGeometry(1.05,8,7),green);leaves.scale.set(1.2,.7,.9);leaves.position.y=.8;bush.add(leaves);for(let k=0;k<5;k++){const fruit=new THREE.Mesh(new THREE.SphereGeometry(.13,7,6),red);fruit.position.set(Math.cos(k*1.25)*.7,1+Math.sin(k*1.25)*.25,Math.sin(k*1.25)*.65);bush.add(fruit)}const bx=(Math.random()-.5)*90,bz=(Math.random()-.5)*90;bush.position.set(bx,terrainHeight(bx,bz),bz);bush.userData.windPhase=Math.random()*Math.PI*2;scene.add(bush);berryBushes.push(bush)}
// Animais simples que passeiam pelo vale
const animals=[];
function makeAnimal(kind,x,z){
 const g=new THREE.Group(),isCow=kind==='cow',isLamb=kind==='lamb',isSheep=kind==='sheep'||isLamb;
 const coat=mat(isCow?0xe5dfd3:isSheep?0xeee8dc:0x98613d,.95),dark=mat(0x302820,.9),muzzle=mat(isCow?0x92746c:isSheep?0x51413c:0x50352c,.85),hoofMat=mat(0x292522,.8),eyeMat=mat(0x17130f,.4),white=mat(0xffffff,.3);
 const noseMat=mat(isCow?0x765a55:isSheep?0x403331:0x402a22,.9),innerEarMat=mat(isCow?0xb98c88:isSheep?0x9b7770:0x72503d,.95);
 function oval(parent,material,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0){const m=new THREE.Mesh(new THREE.SphereGeometry(1,28,20),material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);parent.add(m);return m}
 // Corpo mais anatômico: tronco alongado, barriga menos funda e peito integrado
 const torso=oval(g,coat,0,1.015,-.045,isCow?.75:.60,isCow?.385:.325,isCow?1.02:.91);
 // Deformação anatômica sutil: dorso mais firme e ventre inferior menos redondo
 const bodyPos=torso.geometry.attributes.position;
 for(let i=0;i<bodyPos.count;i++){
  const x=bodyPos.getX(i),y=bodyPos.getY(i),z=bodyPos.getZ(i);
  const lower=Math.max(0,-y);
  const upper=Math.max(0,y);
  // Dorso um pouco mais firme, flancos suaves e ventre menos pesado
  const bellyTaper=1-lower*.095;
  const backWidth=1+upper*.025;
  const flank=1-Math.pow(Math.abs(z),2)*.018;
  // Linha superior mais firme, sem criar uma lombada arredondada
  const backFlatten=Math.max(0,y-.58)*.045;
  // Garupa discretamente mais larga na região traseira do tronco
  const rump=Math.max(0,-z-.28);
  const rumpWidth=1+rump*.055;
  bodyPos.setXYZ(i,x*bellyTaper*backWidth*flank*rumpWidth,y+(y<0?y*.055:0)-backFlatten,z*(1-lower*.035));
 }
 // Micro-relevo orgânico da lã: ondulações rasas na própria malha, sem tufos esféricos.
 if(isSheep){
  for(let i=0;i<bodyPos.count;i++){
   const px=bodyPos.getX(i),py=bodyPos.getY(i),pz=bodyPos.getZ(i);
   const wave=Math.sin(px*17+py*11+pz*13)*Math.sin(py*19-pz*9+px*7);
   const amount=wave*.009;
   bodyPos.setXYZ(i,px+px*amount,py+py*amount,pz+pz*amount);
  }
 }
 torso.geometry.computeVertexNormals();
 torso.geometry.computeBoundingSphere();
 // Peitoral integrado ao tronco, com volume gradual e parte inferior menos saliente
 const chest=oval(g,coat,0,1.095,.385,isCow?.385:.31,isCow?.285:.245,isCow?.35:.30);
 const chestPos=chest.geometry.attributes.position;
 for(let vi=0;vi<chestPos.count;vi++){
  const px=chestPos.getX(vi),py=chestPos.getY(vi),pz=chestPos.getZ(vi);
  const lower=THREE.MathUtils.clamp(-py,0,1);
  chestPos.setXYZ(vi,px*(1-lower*.075),py,pz*(1-lower*.045));
 }
 // Continuidade da textura da lã no peito, com relevo ainda mais discreto.
 if(isSheep){
  for(let i=0;i<chestPos.count;i++){
   const px=chestPos.getX(i),py=chestPos.getY(i),pz=chestPos.getZ(i);
   const wave=Math.sin(px*15+py*12+pz*10)*Math.sin(py*17-pz*8+px*6);
   const amount=wave*.006;
   chestPos.setXYZ(i,px+px*amount,py+py*amount,pz+pz*amount);
  }
 }
 chest.geometry.computeVertexNormals();
 chest.geometry.computeBoundingSphere();
 // Pescoço com base mais larga e topo suavemente estreito
 const neck=oval(g,coat,0,1.39,.59,isCow?.215:isSheep?.155:.16,isCow?.365:isSheep?.315:.30,isCow?.34:.29,-.43);
 const neckPos=neck.geometry.attributes.position;
 for(let vi=0;vi<neckPos.count;vi++){
  const py=neckPos.getY(vi);
  const base=THREE.MathUtils.clamp(-py,0,1);
  const width=1+base*.09;
  neckPos.setX(vi,neckPos.getX(vi)*width);
  neckPos.setZ(vi,neckPos.getZ(vi)*width);
 }
 neck.geometry.computeVertexNormals();
 // Ombros ligados ao peito por uma transição alongada, evitando efeito de esfera separada
 oval(g,coat,0,1.12,.34,isCow?.39:.30,isCow?.29:.245,isCow?.40:.34,-.12);
 const head=oval(g,coat,0,1.685,.825,isCow?.245:.20,isCow?.255:.22,isCow?.275:.235,-.08);
 // Crânio com testa mais contínua e bochechas discretas, evitando cabeça esférica
 const headPos=head.geometry.attributes.position;
 for(let vi=0;vi<headPos.count;vi++){
  const x=headPos.getX(vi),y=headPos.getY(vi),z=headPos.getZ(vi);
  const forehead=Math.max(0,y)*.045;
  const cheek=Math.max(0,-y)*Math.max(0,1-Math.abs(x)*1.5)*.035;
  const muzzleSlope=Math.max(0,z)*.025;
  headPos.setXYZ(vi,x*(1+cheek),y+forehead,z*(1+muzzleSlope));
 }
 head.geometry.computeVertexNormals();
 const muzzleShape=oval(g,muzzle,0,1.545,1.005,isCow?.205:.135,isCow?.115:.085,isCow?.205:.155,-.08);
 // Focinho com base mais larga e ponta suavemente afunilada
 const muzzlePos=muzzleShape.geometry.attributes.position;
 for(let vi=0;vi<muzzlePos.count;vi++){
  const mz=muzzlePos.getZ(vi),my=muzzlePos.getY(vi);
  const tip=THREE.MathUtils.clamp((mz+.05)/.95,0,1);
  const taper=1-tip*.13;
  muzzlePos.setX(vi,muzzlePos.getX(vi)*taper);
  muzzlePos.setY(vi,my*(1-tip*.08));
 }
 muzzleShape.geometry.computeVertexNormals();
 // Ponte nasal alongada, estreita e ligada à testa
 oval(g,coat,0,1.625,.94,isCow?.105:.078,.09,.16,-.18);
 oval(g,muzzle,0,1.535,1.075,isCow?.135:.085,.048,.085);
 // Mandíbula inferior mais fina e ligeiramente alongada para a frente
 const jaw=oval(g,muzzle,0,1.485,1.005,isCow?.15:.095,.043,.12);
 jaw.scale.z=isCow?.13:.105;
 const mouthMat=mat(0x38251f,.95);
 oval(g,mouthMat,0,1.49,1.073,isCow?.105:.065,.009,.008);
 // Narinas discretas integradas ao focinho
 for(const side of [-1,1]){
  oval(g,noseMat,side*(isCow?.105:.065),1.575,1.105,isCow?.035:.018,.022,.012);
 }
 // Orelhas com formato natural e interior mais escuro
 const ears=[];
 for(const side of [-1,1]){
  const ear=oval(g,coat,side*(isCow?.32:.255),1.79,.72,isCow?.145:.17,.047,.235,side*-.16,0,side*-.30);
  // Orelha afinada junto à cabeça e ligeiramente mais larga na região central
  const earPos=ear.geometry.attributes.position;
  for(let vi=0;vi<earPos.count;vi++){
   const ez=earPos.getZ(vi),ey=earPos.getY(vi);
   const base=THREE.MathUtils.clamp(ez,0,1);
   const mid=1-Math.abs(ez)*.12;
   earPos.setX(vi,earPos.getX(vi)*(mid-base*.13));
   earPos.setY(vi,ey*(1-base*.08));
  }
  ear.geometry.computeVertexNormals();
  const innerEar=oval(g,innerEarMat,side*(isCow?.32:.255),1.795,.755,isCow?.078:.085,.016,.15,side*-.16,0,side*-.30);
  const innerPos=innerEar.geometry.attributes.position;
  for(let vi=0;vi<innerPos.count;vi++){
   const ez=innerPos.getZ(vi);
   innerPos.setX(vi,innerPos.getX(vi)*(1-THREE.MathUtils.clamp(ez,0,1)*.12));
  }
  innerEar.geometry.computeVertexNormals();
  // Pequena transição na raiz, sem formar uma bola separada
  oval(g,coat,side*(isCow?.255:.205),1.79,.735,.055,.041,.075,side*-.12,0,side*-.2);
  ears.push(ear);
 }
 for(const side of [-1,1]){
  oval(g,dark,side*(isCow?.09:.06),1.56,1.125,.022,.018,.012);
  oval(g,dark,side*(isCow?.19:.16),1.72,.965,.055,.065,.035);
  // Íris castanha, pupila e brilho dos olhos
  // Olhos menores e assentados mais perto do crânio
  oval(g,mat(isCow?0x493326:0x68452e,.55),side*(isCow?.205:.175),1.72,1.006,.015,.020,.006);
  oval(g,eyeMat,side*(isCow?.205:.175),1.72,1.013,.007,.014,.004);
  oval(g,white,side*(isCow?.212:.181),1.731,1.018,.0035,.0045,.0025);
  // Pálpebras finas, sem contorno volumoso
  oval(g,coat,side*(isCow?.19:.16),1.759,.997,.062,.016,.018,side*.08);
  oval(g,coat,side*(isCow?.19:.16),1.684,.997,.056,.011,.016,-side*.04);
  // Sobrancelha discreta, acompanhando a testa
  oval(g,coat,side*(isCow?.19:.16),1.782,.987,.061,.014,.019,0,0,side*.06);
  // Bochecha sutil, sem formar uma esfera saliente
  oval(g,coat,side*(isCow?.205:.16),1.59,.91,isCow?.064:.047,.067,.061,0,0,side*.12);
 }
 // Pequenos tufos arredondados no contorno do pescoço e ombros, simulando pelagem
 if(!isCow&&!isSheep){
  const furMat=mat(0x805033,.98);
  for(let n=0;n<6;n++){
   const side=n%2===0?1:-1;
   oval(g,furMat,side*(.19+(n%3)*.035),1.24-(n%3)*.075,.43+(n%3)*.12,.075,.11,.095,0,0,side*.22);
  }
 }else if(isCow){
  const furLight=mat(0xeee8df,.98);
  for(let n=0;n<4;n++){
   const side=n%2===0?1:-1;
   oval(g,furLight,side*.28,1.37-n*.09,.48-n*.08,.055,.075,.08,0,0,side*.18);
  }
 }
 // Pernas com articulações mais definidas e transições anatômicas suaves
 const legs=[],knees=[];
 const xs=isCow?[-.47,.47]:[-.33,.33],zs=[.47,-.57];
 for(let xi=0;xi<2;xi++)for(let zi=0;zi<2;zi++){
  const front=zi===0;
  const upperRadius=isCow?.064:isSheep?.047:.043;
  const lowerRadius=isCow?.036:isSheep?.027:.025;
  const pivot=new THREE.Group();pivot.position.set(xs[xi],.79,zs[zi]);g.add(pivot);
  const upperGeo=new THREE.CapsuleGeometry(upperRadius,front?.25:.29,8,16);
  // Parte superior ligeiramente mais larga, fundindo a perna ao quadril sem criar uma bola
  const upperPos=upperGeo.attributes.position;
  for(let vi=0;vi<upperPos.count;vi++){
   const yy=upperPos.getY(vi);
   const blend=THREE.MathUtils.clamp((yy+.10)/.24,0,1);
   const smoothBlend=blend*blend*(3-2*blend);
   const factor=1+smoothBlend*.12;
   upperPos.setX(vi,upperPos.getX(vi)*factor);
   upperPos.setZ(vi,upperPos.getZ(vi)*factor);
  }
  upperGeo.computeVertexNormals();
  const upper=new THREE.Mesh(upperGeo,coat);
  // Sobreposição discreta com o tronco para esconder a emenda sem criar volume esférico
  upper.position.y=front?-.155:-.175;pivot.add(upper);
  const knee=new THREE.Group();knee.position.set(0,front?-.37:-.39,0);pivot.add(knee);
  // Articulação compacta, acompanhando a largura real da perna
  oval(knee,coat,0,-.008,0,upperRadius*.91,.052,upperRadius*.94);
  const lowerGeo=new THREE.CapsuleGeometry(lowerRadius,.29,8,14);
  const lowerPos=lowerGeo.attributes.position;
  for(let vi=0;vi<lowerPos.count;vi++){
   const yy=lowerPos.getY(vi);
   const taper=1-THREE.MathUtils.clamp((-yy-.12)/.28,0,1)*.12;
   lowerPos.setX(vi,lowerPos.getX(vi)*taper);
   lowerPos.setZ(vi,lowerPos.getZ(vi)*taper);
  }
  lowerGeo.computeVertexNormals();
  const lower=new THREE.Mesh(lowerGeo,coat);
  lower.position.y=-.18;knee.add(lower);
  // Boleto estreito e casco curto, apoiado no chão
  oval(knee,coat,0,-.325,.018,lowerRadius*1.25,.055,.052);
  const hoofGeo=new THREE.CylinderGeometry(isCow?.049:.041,isCow?.064:.054,.115,24,2);
  // Casco mais orgânico: ponta frontal larga, calcanhar estreito e bordas suavizadas
  const hoofPos=hoofGeo.attributes.position;
  for(let vi=0;vi<hoofPos.count;vi++){
   const zz=hoofPos.getZ(vi), yy=hoofPos.getY(vi);
   const toe=THREE.MathUtils.clamp((zz+.5),0,1);
   const edge=1-Math.pow(Math.abs(yy)/.0575,6)*.045;
   const front=1+toe*.13;
   hoofPos.setX(vi,hoofPos.getX(vi)*front*edge);
   hoofPos.setZ(vi,zz+(yy>.02?-.006:0));
  }
  hoofGeo.computeVertexNormals();
  const hoof=new THREE.Mesh(hoofGeo,hoofMat);
  hoof.position.set(0,-.405,.045);hoof.scale.z=1.32;knee.add(hoof);
  // Fenda frontal sutil no casco, especialmente visível nas vacas
  if(isCow){const split=new THREE.Mesh(new THREE.BoxGeometry(.009,.065,.008),mat(0x171615,.9));split.position.set(0,-.405,.116);knee.add(split);}
  // Pequenos ergôs arredondados atrás do casco, detalhe anatômico de bovinos e cervídeos
  for(const dewSide of [-1,1]){
   oval(knee,hoofMat,dewSide*(isCow?.038:.032),-.285,-.075,isCow?.025:.019,.052,.028,-.18);
  }
  legs.push(pivot);knees.push(knee);
 }
 if(isCow){
  // Manchas assimétricas no pelo para dar identidade visual à vaca
  const patchMat=mat(0x55483f,.98);
  oval(g,patchMat,.69,1.22,.18,.035,.22,.31,.08,0,.12);
  oval(g,patchMat,-.68,.91,-.28,.032,.19,.25,-.12,0,-.1);
  oval(g,patchMat,.48,.86,-.48,.028,.14,.19,.1,0,.18);
  // Manchas menores e irregulares para quebrar a aparência uniforme do pelo
  oval(g,patchMat,-.73,1.32,.38,.025,.13,.18,.18,0,-.16);
  oval(g,patchMat,.72,1.05,-.48,.024,.12,.16,-.12,0,.2);
  oval(g,patchMat,-.61,.78,-.62,.022,.09,.13,.1,0,-.2);
  // Úbere discreto e arredondado, com quatro tetos curtos sob o ventre
  const udderMat=mat(0xc99c91,.96);
  oval(g,udderMat,0,.62,-.18,.29,.16,.31);
  for(const ux of [-.13,.13])for(const uz of [-.34,-.04]){
   const teat=oval(g,udderMat,ux,.48,uz,.045,.105,.05,.12);
  }
  for(const side of [-1,1]){
   oval(g,coat,side*.34,1.77,.7,.19,.065,.095,0,0,side*.18);
   const horn=new THREE.Mesh(new THREE.ConeGeometry(.055,.2,12),mat(0xd8c9aa));horn.position.set(side*.17,1.98,.75);horn.rotation.z=side*-.32;g.add(horn);
   oval(g,dark,side*.57,1.12,-.1,.035,.22,.27);
  }
 }else if(!isSheep){
  // Peito e ventre mais claros, característicos de um cervídeo
  oval(g,mat(0xd8c4a4,.98),0,.83,.39,.36,.25,.52,.12);
  for(const side of [-1,1]){
   oval(g,coat,side*.25,1.88,.72,.17,.055,.075,0,0,side*.25);
   const antler=new THREE.Group();antler.position.set(side*.13,1.91,.78);g.add(antler);
   const beam=new THREE.Mesh(new THREE.CylinderGeometry(.018,.032,.38,10),mat(0x60432c));beam.position.y=.19;antler.add(beam);
   for(let k=0;k<3;k++){const tine=new THREE.Mesh(new THREE.CylinderGeometry(.012,.021,.18,9),mat(0x68482d));tine.position.set(side*(.045+k*.03),.25+k*.075,0);tine.rotation.z=side*-.38;antler.add(tine)}
  }
  for(let n=0;n<11;n++){const x0=((n%4)-1.5)*.22,z0=-.48+Math.floor(n/4)*.23;oval(g,mat(0xe7d7b8),x0,1.37+(n%2)*.06,z0,.018,.025,.018)}
 }else{
  // Pelagem contínua e orgânica: uma única superfície, sem bolas ou tufos salientes
  const wool=mat(0xeee8dc,.99);
  const fleeceGeo=new THREE.SphereGeometry(1,64,40);
  const pos=fleeceGeo.attributes.position;
  for(let i=0;i<pos.count;i++){
   const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
   // Ondas finas e contínuas, orientadas no sentido do pelo; relevo baixo e sem nódulos
   const flow=Math.sin(z*15-y*5+x*3)*Math.cos(x*11+z*4)*.0028;
   const fine=Math.sin(x*27+y*15+z*17)*Math.sin(z*19-y*13+x*9)*.0014;
   const broad=(Math.sin(x*7+z*6+y*5)+Math.sin(z*4-y*7+x*3))*.0022;
   const k=1+flow+fine+broad;
   pos.setXYZ(i,x*.655*k,y*.445*k,z*.845*k);
  }
  fleeceGeo.computeVertexNormals();
  const fleece=new THREE.Mesh(fleeceGeo,wool);
  fleece.position.set(0,1.105,-.035);
  fleece.scale.set(.625,.385,.895);
  g.add(fleece);
  // Cabeça e focinho permanecem descobertos para destacar o rosto da ovelha
  oval(g,mat(0x51413c,.9),0,1.56,1.075,.11,.075,.055);
 }
 const tail=new THREE.Group();tail.position.set(0,1.17,-.84);g.add(tail);
 const tailMesh=new THREE.Mesh(new THREE.CylinderGeometry(.018,.035,.38,10),isCow?coat:dark);tailMesh.position.y=-.17;tailMesh.rotation.x=-.55;tail.add(tailMesh);const tailTuft=oval(tail,isCow?dark:coat,0,-.36,-.015,isCow?.075:.065,.12,.075);
 g.scale.setScalar(isCow?.92:isLamb?.68:isSheep?.82:.84);
 g.position.set(x,terrainHeight(x,z),z);scene.add(g);
 animals.push({group:g,kind,legs,knees,tail,ears,neck,head,torso,tailTuft,phase:Math.random()*6,gaitPhase:Math.random()*6,lastX:x,lastZ:z,speed:.45+Math.random()*.35,homeX:x,homeZ:z,wanderX:kind==='lamb'?1.8+Math.random()*1.2:3.5+Math.random()*3.5,wanderZ:kind==='lamb'?1.5+Math.random()*1.2:2.5+Math.random()*3.5,turnPhase:Math.random()*6.28,friendlyUntil:0});
}
for(let i=0;i<5;i++)makeAnimal(i<3?'deer':'cow',(Math.random()-.5)*85+35,(Math.random()-.5)*85+25);
// Reposiciona o rebanho para evitar que os modelos se sobreponham.
makeAnimal('sheep',5,7);
makeAnimal('sheep',32,24);
makeAnimal('sheep',-28,30);
makeAnimal('lamb',9,10);
makeAnimal('lamb',13,13);
makeAnimal('deer',3,5);
const horseAnimal=animals[animals.length-1];
horseAnimal.kind='horse';
(async()=>{
 try{
  const {GLTFLoader}=await import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js?bundle');
  const loader=new GLTFLoader();
  loader.load('https://raw.githubusercontent.com/amaraauguste/amaraauguste.github.io/master/courses/CISC3620/models/Horse.glb',(gltf)=>{
   const model=gltf.scene;
   const bounds=new THREE.Box3().setFromObject(model);
   const dims=new THREE.Vector3();bounds.getSize(dims);
   const maxDim=Math.max(dims.x,dims.y,dims.z);
   if(!Number.isFinite(maxDim)||maxDim<=0){console.warn('Modelo de cavalo inválido');return}
   model.scale.setScalar(2.15/maxDim);
   const fitted=new THREE.Box3().setFromObject(model);
   model.position.y-=fitted.min.y;
   for(const child of horseAnimal.group.children)child.visible=false;
   horseAnimal.group.add(model);
   horseAnimal.realisticModel=model;
   horseAnimal.modelBaseY=model.position.y;
   if(gltf.animations&&gltf.animations.length){
    horseAnimal.mixer=new THREE.AnimationMixer(model);
    const gallop=gltf.animations.find(c=>/gallop|run|walk/i.test(c.name))||gltf.animations[0];
    horseAnimal.mixer.clipAction(gallop).play();
   }
   console.info('Cavalo 3D carregado:',gltf.animations.map(c=>c.name));
  },undefined,(err)=>console.error('Falha ao carregar cavalo 3D:',err));
 }catch(err){console.error('Falha ao iniciar cavalo 3D:',err)}
})();


// Usa somente o novo modelo 3D nas ovelhas e cordeiros.
// As peças antigas são ocultadas para não misturar dois animais no mesmo lugar.
(async()=>{
 try{
  const {GLTFLoader}=await import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js?bundle');
  const loader=new GLTFLoader();
  loader.load('https://cdn.3dassets.dev/assets/29189/v1/model.glb',(gltf)=>{
   const template=gltf.scene;
   const box=new THREE.Box3().setFromObject(template);
   const size=new THREE.Vector3();box.getSize(size);
   const maxDim=Math.max(size.x,size.y,size.z);
   if(!Number.isFinite(maxDim)||maxDim<=0){console.warn('Modelo de ovelha sem dimensões válidas');return}
   for(const animal of animals.filter(a=>a.kind==='sheep'||a.kind==='lamb')){
    const model=template.clone(true);
    const scale=(animal.kind==='lamb'?.58:1)*3.8/maxDim;
    model.scale.setScalar(scale);
    const fitted=new THREE.Box3().setFromObject(model);
    model.position.y-=fitted.min.y;
    for(const child of animal.group.children)child.visible=false;
    animal.group.add(model);
    animal.realisticModel=model;
    animal.modelBaseY=model.position.y;
   }
   console.info('Modelo 3D novo aplicado somente às ovelhas e cordeiros.');
  },undefined,(err)=>console.error('Falha ao carregar o modelo 3D de ovelha:',err));
 }catch(err){console.error('Falha ao iniciar o modelo 3D de ovelha:',err)}
})();
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
for(const x of [-2.4,2.4]){const w=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.1,.13),new THREE.MeshStandardMaterial({color:0x9a6b3e,emissive:0x5b2c0d,emissiveIntensity:.28,roughness:.9}));w.position.set(x,2.6,3.08);cabin.add(w)}
cabin.position.set(12,0,-13);scene.add(cabin);

/* Cidade histórica de 1870: rua principal e saloon */
const townWood=mat(0x765039),townTrim=mat(0x3b2920),townRoof=mat(0x40342b),townGlass=mat(0x52616a,.35);
function makeTownSign(label){
 const c=document.createElement('canvas');c.width=512;c.height=128;
 const q=c.getContext('2d');q.fillStyle='#3a2418';q.fillRect(0,0,512,128);
 q.strokeStyle='#d2ad68';q.lineWidth=9;q.strokeRect(8,8,496,112);
 q.fillStyle='#f1d49a';q.font='bold 58px Georgia';q.textAlign='center';q.textBaseline='middle';q.fillText(label,256,66);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 return new THREE.MeshBasicMaterial({map:t});
}
const townDoors=[];
const townFurnitureColliders=[];
function buildOldWestBuilding(x,z,name,kind='saloon'){
 const g=new THREE.Group(),w=kind==='saloon'?13:10,d=kind==='saloon'?8:7,h=kind==='saloon'?5.2:4.4;
 const wallMat=new THREE.MeshStandardMaterial({map:makeSurfaceTexture('#765039',['#4c3022','#a77b50','#5a3928'],kind==='saloon'?811:812),roughness:1});
 const box=(ww,hh,dd,ma,xx,yy,zz)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(ww,hh,dd),ma);m.position.set(xx,yy,zz);g.add(m);return m};
 box(w,h,d,wallMat,0,h/2,0);
 box(w+.65,.35,d+.65,townRoof,0,h+.12,0);
 box(w+.8,.28,.48,townTrim,0,h+.45,d/2+.12);
 // Acabamento artesanal: tábuas, cantoneiras e lanternas da fachada.
 const plankMat=new THREE.MeshStandardMaterial({color:0x9a704b,roughness:1});
 const darkPlank=new THREE.MeshStandardMaterial({color:0x4b3021,roughness:1});
 // Faixas horizontais nas laterais, integradas ao volume já sólido do edifício.
 for(const side of [-1,1]){
  for(const yy of [.42,.88,1.34,1.80,2.26,2.72,3.18,3.64,4.10]){
   const board=new THREE.Mesh(new THREE.BoxGeometry(.045,.055,d-.18),yy%2?plankMat:darkPlank);
   board.position.set(side*(w/2+.018),yy,0);g.add(board);
  }
  const corner=new THREE.Mesh(new THREE.BoxGeometry(.16,h+.12,.18),townTrim);
  corner.position.set(side*(w/2+.035),h/2, d/2-.08);g.add(corner);
 }
 // Rodapé e testeira frontal dão profundidade sem bloquear portas ou janelas.
 box(w-.25,.16,.10,townTrim,0,.20,d/2+.09);
 box(w+.25,.18,.16,plankMat,0,h-.12,d/2+.13);
 // Lanternas decorativas fixadas na fachada (sem collider independente).
 const lampMat=new THREE.MeshStandardMaterial({color:0xffd18a,emissive:0xff9b38,emissiveIntensity:.75,roughness:.35});
 for(const lx of [-w*.39,w*.39]){
  box(.22,.42,.22,townTrim,lx,3.15,d/2+.34);
  const glow=new THREE.Mesh(new THREE.BoxGeometry(.14,.25,.14),lampMat);
  glow.position.set(lx,3.15,d/2+.47);g.add(glow);
  const cap=new THREE.Mesh(new THREE.ConeGeometry(.18,.13,4),townRoof);
  cap.position.set(lx,3.38,d/2+.47);cap.rotation.y=Math.PI/4;g.add(cap);
 }
 // Telhado inclinado em duas águas
 const roof=new THREE.Mesh(new THREE.ConeGeometry(w*.78,2.5,4),townRoof);roof.rotation.y=Math.PI/4;roof.scale.z=d*.78/2.5;roof.position.set(0,h+1.25,0);g.add(roof);
 // Fachada com janelas e molduras
 for(const xx of [-w*.29,w*.29]){
  box(2.15,1.85,.18,townTrim,xx,2.75,d/2+.12);
  box(1.78,1.48,.08,townGlass,xx,2.75,d/2+.23);
  box(2.35,.16,.22,townTrim,xx,3.72,d/2+.2);
  box(.14,1.9,.2,townTrim,xx,2.75,d/2+.25);
 }
 // Porta dupla articulada: cada folha gira em torno da dobradiça.
 const doorGroup=new THREE.Group();doorGroup.position.set(0,0,d/2+.3);g.add(doorGroup);
 const doorMat=mat(0x805331);
 const leftHinge=new THREE.Group();leftHinge.position.set(-.92,0,0);doorGroup.add(leftHinge);
 const leftLeaf=new THREE.Mesh(new THREE.BoxGeometry(.92,2.35,.12),doorMat);leftLeaf.position.set(.46,1.25,0);leftHinge.add(leftLeaf);
 const rightHinge=new THREE.Group();rightHinge.position.set(.92,0,0);doorGroup.add(rightHinge);
 const rightLeaf=new THREE.Mesh(new THREE.BoxGeometry(.92,2.35,.12),doorMat);rightLeaf.position.set(-.46,1.25,0);rightHinge.add(rightLeaf);
 townDoors.push({left:leftHinge,right:rightHinge,x,z:z+d/2+.3,open:false});

 // Interior mobiliado: corredor central e passagem da porta permanecem livres.
 const furnitureBox=(ww,hh,dd,ma,xx,yy,zz)=>{
  box(ww,hh,dd,ma,xx,yy,zz);
  townFurnitureColliders.push({x:x+xx,z:z+zz,w:ww/2,d:dd/2});
 };
 const furnitureWood=mat(0x573923),furnitureTop=mat(0x805936),ironDetail=mat(0x302820);
 if(kind==='saloon'){
  // Balcão no fundo, afastado do corredor de entrada.
  furnitureBox(5.2,1.05,.72,furnitureWood,0,.78,-2.65);
  furnitureBox(5.35,.13,.84,furnitureTop,0,1.36,-2.65);
  // Mesas laterais com pés sólidos.
  for(const tx of [-3.65,3.65]){
   furnitureBox(1.55,.16,1.35,furnitureTop,tx,.92,-.65);
   for(const px of [-.58,.58])for(const pz of [-.48,.48])
    furnitureBox(.13,.82,.13,furnitureWood,tx+px,.43,-.65+pz);
   // Bancos junto às mesas.
   furnitureBox(1.25,.18,.38,furnitureWood,tx,.52,.65);
   furnitureBox(.12,.48,.12,furnitureWood,tx-.48,.25,.65);
   furnitureBox(.12,.48,.12,furnitureWood,tx+.48,.25,.65);
  }
 }else{
  // Prateleiras nas paredes laterais, sem fechar a entrada.
  for(const side of [-1,1]){
   furnitureBox(.48,2.0,3.2,furnitureWood,side*4.35,1.05,-.75);
   for(const level of [.55,1.15,1.75])
    furnitureBox(.62,.10,3.0,furnitureTop,side*4.22,level,-.75);
  }
  // Caixotes e balcão de atendimento no fundo.
  furnitureBox(2.3,.95,.72,furnitureWood,0,.72,-2.55);
  furnitureBox(2.45,.12,.82,furnitureTop,0,1.25,-2.55);
  for(const [cx,cz] of [[-2.65,1.25],[2.65,1.25],[-2.7,-2.35],[2.7,-2.35]]){
   furnitureBox(.82,.78,.82,furnitureTop,cx,.48,cz);
   furnitureBox(.86,.10,.86,ironDetail,cx,.91,cz);
  }
 }

 // Varanda e pilares
 box(w+2.2,.25,2.8,townTrim,0,2.9,d/2+1.25);
 for(const xx of [-w*.43,-w*.15,w*.15,w*.43]){
  const post=new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,3.0,8),townTrim);post.position.set(xx,1.48,d/2+2.35);g.add(post);
 }
 box(w+2.4,.22,.22,townTrim,0,3.05,d/2+2.35);
 const sign=new THREE.Mesh(new THREE.PlaneGeometry(w*.7,1.35),makeTownSign(name));sign.position.set(0,h-.55,d/2+.27);g.add(sign);
 g.position.set(x,0,z);scene.add(g);return g;
}
const mainStreet=new THREE.Mesh(new THREE.PlaneGeometry(24,100),new THREE.MeshStandardMaterial({map:dirtTexture,color:0xb28d60,roughness:1}));
mainStreet.rotation.x=-Math.PI/2;mainStreet.position.set(-9,.018,8);scene.add(mainStreet);
buildOldWestBuilding(-17,1,'THE OLD SALOON','saloon');
buildOldWestBuilding(1,1,'GENERAL STORE','store');

// Jogador humano com proporções mais naturais e roupas detalhadas
const player=new THREE.Group();
// Materiais com microtextura para pele, tecido e cabelo, gerados localmente.
function makeClothTexture(base,tones,seed){
 const c=document.createElement('canvas');c.width=256;c.height=256;const q=c.getContext('2d');q.fillStyle=base;q.fillRect(0,0,256,256);
 let n=seed;const rnd=()=>{n=(n*1664525+1013904223)>>>0;return n/4294967296};
 for(let i=0;i<6200;i++){const x=rnd()*256,y=rnd()*256;q.globalAlpha=.035+rnd()*.10;q.fillStyle=tones[i%tones.length];q.fillRect(x,y,.6+rnd()*1.4,.6+rnd()*1.4)}
 q.globalAlpha=1;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}
const skinTex=makeClothTexture('#b98260',['#e1ad89','#8e5d45','#c98f6c'],31);
const fabricTex=makeClothTexture('#245c91',['#3979aa','#173f68','#2c6798'],62);
const denimTex=makeClothTexture('#303744',['#48515e','#202833','#626b76'],94);
const skin=new THREE.MeshStandardMaterial({color:0xffffff,map:skinTex,roughness:.88,bumpMap:skinTex,bumpScale:.018});
const shirt=new THREE.MeshStandardMaterial({color:0xffffff,map:fabricTex,roughness:1,bumpMap:fabricTex,bumpScale:.035});
const shirtDark=mat(0x173f68,.96),pants=new THREE.MeshStandardMaterial({color:0xffffff,map:denimTex,roughness:1,bumpMap:denimTex,bumpScale:.025}),shoeMat=mat(0x17191d,.78),hairMat=mat(0x29211e,.94),eyeMat=mat(0x171717,.35);
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
// Mechas sobrepostas no topo e na lateral para quebrar o aspecto liso do cabelo
const hairHighlight=mat(0x382a25,.98);
for(let strand=0;strand<7;strand++){
 const x=-.19+strand*.063;
 const z=-.13+Math.abs(x)*.16;
 const y=2.49-Math.abs(x)*.12;
 const lock=capsuleBetween(player,[x,y,z],[x+.025,y-.035,z+.105],.018,strand%3===0?hairHighlight:hairMat);
 lock.scale.set(1,.9,1);
}
for(let side of [-1,1]){
 const sideLock=capsuleBetween(player,[side*.225,2.34,-.015],[side*.235,2.20,.035],.035,hairMat);
 sideLock.scale.set(.9,1,.85);
}
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
}
// Mantém o personagem humano procedural detalhado; remove o modelo Soldier com aparência robótica.
let realisticAvatarLoaded=false,playerMixer=null,playerActions={},activePlayerAction=null;


/* Moradores humanos da cidade histórica */

function makeTownsperson(x,z,coatColor,hatColor,phase=0,stationary=false){
 const g=new THREE.Group(),coat=mat(coatColor),pants=mat(0x34312b),skin=mat(0xc18c69),hat=mat(hatColor),boots=mat(0x29221c);
 const part=(geo,ma,px,py,pz,sx=1,sy=1,sz=1)=>{const m=new THREE.Mesh(geo,ma);m.position.set(px,py,pz);m.scale.set(sx,sy,sz);g.add(m)};
 part(new THREE.CapsuleGeometry(.23,.48,4,8),coat,0,1.25,0,1,.95,.75);
 part(new THREE.SphereGeometry(.18,12,10),skin,0,1.82,.015,.95,1.08,.9);
 part(new THREE.CylinderGeometry(.2,.22,.1,12),hat,0,2.02,0,1.5,1,1.2);
 part(new THREE.CylinderGeometry(.13,.15,.2,12),hat,0,2.14,0);
 for(const side of [-1,1]){
  part(new THREE.CapsuleGeometry(.09,.42,3,7),coat,side*.28,1.28,0);
  part(new THREE.CapsuleGeometry(.105,.46,3,7),pants,side*.115,.55,0);
  part(new THREE.BoxGeometry(.22,.13,.36),boots,side*.115,.12,.06);
 }
 g.position.set(x,0,z);scene.add(g);townsfolk.push({group:g,x,z,phase,speed:stationary?0:.22+phase*.025,stationary});
}
makeTownsperson(-20,8,0x76513a,0x30271e,0);
makeTownsperson(-13,10,0x4e5b43,0x493729,1);
makeTownsperson(3,9,0x6d4938,0x29231e,2);
makeTownsperson(-22,-8,0x555b68,0x473323,3);
makeTownsperson(-17,0,0x65452f,0x30251c,4,true);
makeTownsperson(1,-.15,0x526047,0x493729,5,true);
const talkButton=document.createElement('button');
talkButton.id='talkTownsperson';talkButton.textContent='CONVERSAR';
talkButton.style.cssText='position:fixed;left:50%;bottom:112px;transform:translateX(-50%);z-index:12;padding:13px 20px;border:2px solid #d6b36d;border-radius:10px;background:#49301f;color:#fff;font-weight:800;display:none';
document.body.appendChild(talkButton);
let nearbyClerk=null;
const feedButton=document.createElement('button');feedButton.id='feedAnimal';feedButton.textContent='ALIMENTAR ANIMAL 🍓';feedButton.style.cssText='position:fixed;left:50%;bottom:166px;transform:translateX(-50%);z-index:12;padding:13px 18px;border:2px solid #9bc77b;border-radius:10px;background:#29452b;color:#fff;font-weight:800;display:none';document.body.appendChild(feedButton);
let nearbyAnimal=null;
feedButton.onclick=()=>{if(!nearbyAnimal||berries<1)return;berries--;nearbyAnimal.friendlyUntil=performance.now()+15000;nearbyAnimal.fleeing=false;updateInventory();feedButton.textContent='ANIMAL ALIMENTADO!';setTimeout(()=>feedButton.textContent='ALIMENTAR ANIMAL 🍓',1300);};
talkButton.onclick=()=>{if(!nearbyClerk)return;alert(nearbyClerk.shop==='store'?'Bem-vindo ao armazém! Em breve você poderá comprar alimentos e ferramentas.':'Bem-vindo ao saloon! Descanse um pouco e converse com o pessoal da cidade.');};


/* Carroça de madeira e cavalo de tração na rua da cidade */
const wagonGroup=new THREE.Group(),wagonWheels=[];
const wagonWood=mat(0x684329),wagonDark=mat(0x34251b),iron=mat(0x393b3a);
function wagonBox(w,h,d,ma,x,y,z){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),ma);m.position.set(x,y,z);wagonGroup.add(m);return m}
wagonBox(2.35,.18,3.5,wagonWood,0,1.05,0);
wagonBox(2.15,.75,2.7,mat(0x795333),0,1.52,-.15);
for(const side of [-1,1]){
 for(let k=0;k<5;k++)wagonBox(.08,.68,.12,wagonDark,side*1.08,1.55,-1.18+k*.52);
 const wheel=new THREE.Mesh(new THREE.TorusGeometry(.68,.09,8,20),wagonDark);wheel.position.set(side*1.22,.78,.15);wheel.rotation.y=Math.PI/2;wagonGroup.add(wheel);wagonWheels.push(wheel);
 const hub=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.22,10),iron);hub.rotation.z=Math.PI/2;hub.position.set(side*1.22,.78,.15);wagonGroup.add(hub);
 for(let spoke=0;spoke<8;spoke++){const a=spoke*Math.PI/4;const beam=new THREE.Mesh(new THREE.BoxGeometry(.065,.065,1.18),wagonWood);beam.position.set(side*1.22,.78,.15);beam.rotation.x=a;beam.rotation.z=Math.PI/2;wagonGroup.add(beam)}
}
wagonBox(.12,.12,2.5,wagonDark,0,.45,2.45);
wagonBox(.12,.12,2.5,wagonDark,0,.45,2.7);
// Assento e toldo simples de lona
wagonBox(1.45,.16,.72,wagonWood,0,2.05,-1.45);
const canopy=new THREE.Mesh(new THREE.BoxGeometry(2.5,.13,2.7),mat(0xb7a17b));canopy.position.set(0,2.45,-.15);wagonGroup.add(canopy);
wagonGroup.position.set(-2.5,0,18);wagonGroup.rotation.y=-.18;scene.add(wagonGroup);
// Cavalo de tração com corpo, pescoço, cabeça, crina e quatro pernas
const draftHorse=new THREE.Group(),horseBrown=mat(0x70472e),horseMane=mat(0x30221b),horseHoof=mat(0x272321);
function horseOval(x,y,z,sx,sy,sz,ma=horseBrown){const m=new THREE.Mesh(new THREE.SphereGeometry(1,16,12),ma);m.position.set(x,y,z);m.scale.set(sx,sy,sz);draftHorse.add(m);return m}
horseOval(0,1.22,0,.58,.42,.95);
horseOval(0,1.58,.63,.25,.52,.29).rotation.x=-.45;
horseOval(0,1.92,.84,.23,.31,.27);
horseOval(0,2.22,.94,.28,.08,.12,horseMane);
for(const side of [-1,1]){
 horseOval(side*.14,1.27,1.02,.09,.18,.12,horseMane);
 for(const z of [-.58,.55]){
  const leg=new THREE.Mesh(new THREE.CylinderGeometry(.075,.055,.72,8),horseBrown);leg.position.set(side*.34,.48,z);draftHorse.add(leg);
  const hoof=new THREE.Mesh(new THREE.CylinderGeometry(.085,.09,.13,8),horseHoof);hoof.position.set(side*.34,.12,z);draftHorse.add(hoof);
 }
}
draftHorse.position.set(-2.5,0,21.5);draftHorse.rotation.y=Math.PI;scene.add(draftHorse);

let ridingHorse=false;
const mountButton=document.querySelector('#mountHorse')||document.createElement('button');mountButton.id='mountHorse';mountButton.textContent='MONTAR CAVALO';if(!mountButton.parentNode)document.querySelector('#actions').prepend(mountButton);
mountButton.onclick=()=>{if(ridingHorse){ridingHorse=false;player.position.y=0;draftHorse.position.set(player.position.x-Math.sin(yaw)*1.8,0,player.position.z-Math.cos(yaw)*1.8);mountButton.textContent='MONTAR CAVALO';}else if(Math.hypot(player.position.x-draftHorse.position.x,player.position.z-draftHorse.position.z)<4){ridingHorse=true;mountButton.textContent='DESCER DO CAVALO';}};
player.position.set(0,terrainHeight(0,0),0);player.visible=true;player.scale.setScalar(1);player.traverse(o=>{o.visible=true;if(o.isMesh){o.frustumCulled=false;o.renderOrder=2;o.castShadow=true;o.receiveShadow=true}});scene.add(player);
let yaw=0,pitch=-.12,firstPerson=false,velocityY=0,grounded=true,wood=0;const fires=[];let berries=0,hunger=100,storedWood=0,storedBerries=0;
const keys={};addEventListener('keydown',e=>keys[e.key.toLowerCase()]=true);addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
const joystick=document.querySelector('#joystick'),stick=document.querySelector('#stick');let joyX=0,joyY=0,joyPointer=null;joystick.style.zIndex='8';joystick.style.touchAction='none';
joystick.addEventListener('pointerdown',e=>{joyPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);moveJoy(e)});joystick.addEventListener('pointermove',e=>{if(e.pointerId===joyPointer)moveJoy(e)});
function moveJoy(e){const r=joystick.getBoundingClientRect(),dx=e.clientX-r.left-r.width/2,dy=e.clientY-r.top-r.height/2,len=Math.hypot(dx,dy),k=Math.min(1,48/(len||1));joyX=dx*k/48;joyY=dy*k/48;stick.style.transform=`translate(${joyX*38}px,${joyY*38}px)`}
function resetJoy(){joyX=joyY=0;joyPointer=null;stick.style.transform='translate(0,0)'}joystick.addEventListener('pointerup',resetJoy);joystick.addEventListener('pointercancel',resetJoy);
let lookPointer=null,lastX=0,lastY=0;renderer.domElement.addEventListener('pointerdown',e=>{if(e.clientX<innerWidth*.42&&e.clientY>innerHeight*.55)return;lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});
renderer.domElement.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer)return;yaw-=(e.clientX-lastX)*.005;pitch=THREE.MathUtils.clamp(pitch+(e.clientY-lastY)*.003,-.7,.45);lastX=e.clientX;lastY=e.clientY});renderer.domElement.addEventListener('pointerup',()=>lookPointer=null);
function nearestTree(){let best=null,bestD=3.8;for(const t of trees){if(!t.visible)continue;const d=Math.hypot(t.position.x-player.position.x,t.position.z-player.position.z);if(d<bestD){best=t;bestD=d}}return best}
const interact=document.querySelector('#interact');interact.onclick=()=>{
if(insideCabin){insideCabin=false;player.position.set(12,terrainHeight(12,-8.2),-8.2);interact.textContent='ABRIR CABANA';return}
if(!cabinOpen){cabinOpen=true;doorPivot.rotation.y=-1.35;interact.textContent='ENTRAR NA CABANA';return}
insideCabin=true;player.position.set(12,terrainHeight(12,-11),-11);interact.textContent='SAIR DA CABANA';
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
// Salvamento local do progresso neste aparelho.
const saveButton=document.createElement('button'),loadButton=document.createElement('button');
saveButton.id='saveGame';saveButton.textContent='💾 SALVAR';
loadButton.id='loadGame';loadButton.textContent='📂 CARREGAR';
document.querySelector('#actions').append(saveButton,loadButton);
function saveProgress(){
 const data={x:player.position.x,z:player.position.z,yaw,pitch,wood,berries,hunger,storedWood,storedBerries};
 try{localStorage.setItem('allk_mundo_livre_save',JSON.stringify(data));saveButton.textContent='SALVO!';setTimeout(()=>saveButton.textContent='💾 SALVAR',1400)}catch(e){saveButton.textContent='ERRO'}
}
function loadProgress(){
 try{const raw=localStorage.getItem('allk_mundo_livre_save');if(!raw){loadButton.textContent='SEM SAVE';setTimeout(()=>loadButton.textContent='📂 CARREGAR',1400);return}
 const d=JSON.parse(raw);const savedX=THREE.MathUtils.clamp(Number(d.x)||0,-165,165),savedZ=THREE.MathUtils.clamp(Number(d.z)||0,-165,165);player.position.set(savedX,terrainHeight(savedX,savedZ),savedZ);yaw=Number(d.yaw)||0;pitch=Number(d.pitch)||0;wood=Math.max(0,Number(d.wood)||0);berries=Math.max(0,Number(d.berries)||0);hunger=THREE.MathUtils.clamp(Number(d.hunger)||100,0,100);storedWood=Math.max(0,Number(d.storedWood)||0);storedBerries=Math.max(0,Number(d.storedBerries)||0);insideCabin=false;ridingHorse=false;updateInventory();loadButton.textContent='CARREGADO!';setTimeout(()=>loadButton.textContent='📂 CARREGAR',1400)
 }catch(e){loadButton.textContent='SAVE INVÁLIDO'}
}
saveButton.onclick=saveProgress;loadButton.onclick=loadProgress;
const doorButton=document.createElement('button');doorButton.textContent='🚪 ABRIR / FECHAR PORTA';document.querySelector('#actions').append(doorButton);
doorButton.onclick=()=>{
 let nearest=null,best=6;
 for(const door of townDoors){const dist=Math.hypot(player.position.x-door.x,player.position.z-door.z);if(dist<best){best=dist;nearest=door}}
 if(!nearest){doorButton.textContent='CHEGUE PERTO DE UMA PORTA';setTimeout(()=>doorButton.textContent='🚪 ABRIR / FECHAR PORTA',1400);return}
 nearest.open=!nearest.open;nearest.left.rotation.y=nearest.open?-1.18:0;nearest.right.rotation.y=nearest.open?1.18:0;
 doorButton.textContent=nearest.open?'PORTA ABERTA':'PORTA FECHADA';setTimeout(()=>doorButton.textContent='🚪 ABRIR / FECHAR PORTA',1200);
};
document.querySelector('#jump').onclick=()=>{if(grounded){velocityY=7;grounded=false}};
document.querySelector('#camera').onclick=()=>{firstPerson=!firstPerson;document.querySelector('#camera').textContent=firstPerson?'VOLTAR 3ª PESSOA':'1ª / 3ª PESSOA'};
let walkPhase=0,previousPlayerX=0,previousPlayerZ=0,running=false;
let horizontalVX=0,horizontalVZ=0;
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

function update(dt){
 // Ondas pequenas e contínuas dão vida à superfície do lago.
 for(const wave of lakeWaves){
  wave.phase=(wave.phase+dt*wave.speed)% (Math.PI*2);
  const pulse=.75+Math.sin(wave.phase)*.25;
  wave.mesh.scale.setScalar(.8+(.5+Math.sin(wave.phase))*.42);
  wave.mesh.material.opacity=.10+pulse*.13;
 }
 // Água: ondulações que se expandem e desaparecem.
 for(let ri=waterRipples.length-1;ri>=0;ri--){const ripple=waterRipples[ri];ripple.life+=dt;const k=ripple.life/.9;ripple.mesh.scale.setScalar(.25+k*3.8);ripple.mesh.material.opacity=Math.max(0,.55*(1-k));if(k>=1){scene.remove(ripple.mesh);ripple.mesh.material.dispose();waterRipples.splice(ri,1);}}
 const lakeDistance=Math.hypot(player.position.x+28,player.position.z+20);
 const inWater=lakeDistance<15.1;
 if(inWater){
  if(!player.userData.wasInWater)makeWaterRipple(player.position.x,player.position.z);
  player.userData.waterRipple=(player.userData.waterRipple||0)+dt;
  if(player.userData.waterRipple>.65){makeWaterRipple(player.position.x,player.position.z);player.userData.waterRipple=0;}
  // Resistência da água reduz a velocidade horizontal.
  horizontalVX*=Math.exp(-1.8*dt);horizontalVZ*=Math.exp(-1.8*dt);
  player.position.y=Math.max(player.position.y,.04)+Math.sin(performance.now()*.003)*.025;
 }else{player.userData.waterRipple=0;}
 player.userData.wasInWater=inWater;
 // Pedras recebem impulso ao contato e deslizam até o atrito pará-las.
 for(const rock of rocks){
  const dx=rock.position.x-player.position.x,dz=rock.position.z-player.position.z;
  const dist=Math.hypot(dx,dz),minDist=rock.userData.radius+.38;
  if(dist<minDist&&dist>.001){
   const nx=dx/dist,nz=dz/dist;
   rock.userData.vx+=nx*2.8*dt;rock.userData.vz+=nz*2.8*dt;
   player.position.x-=nx*(minDist-dist)*.35;player.position.z-=nz*(minDist-dist)*.35;
  }
  rock.position.x+=rock.userData.vx*dt;rock.position.z+=rock.userData.vz*dt;rock.position.y=terrainHeight(rock.position.x,rock.position.z)+.35;
  const drag=Math.exp(-2.7*dt);rock.userData.vx*=drag;rock.userData.vz*=drag;
  rock.rotation.z+=rock.userData.vx*dt*.35;rock.rotation.x-=rock.userData.vz*dt*.35;
 }
 updateDayNight(dt);updateWeather(dt);updateWind(dt);const nearChest=insideCabin&&Math.hypot(player.position.x-9.7,player.position.z+14.8)<2.8;document.querySelector('#chestPanel').hidden=!nearChest;storeButton.disabled=!nearChest||(wood===0&&berries===0);takeButton.disabled=!nearChest||(storedWood===0&&storedBerries===0);const nearCabin=Math.hypot(player.position.x-12,player.position.z-(-13))<8;interact.disabled=!nearCabin;if(insideCabin){interact.disabled=false;interact.textContent='SAIR DA CABANA'}else if(!nearCabin)interact.textContent='APROXIME-SE DA CABANA';else if(!cabinOpen)interact.textContent='ABRIR CABANA';else interact.textContent='ENTRAR NA CABANA';hunger=Math.max(0,hunger-dt*.12);if(hunger===0)document.querySelector('#health').textContent=Math.max(0,Number(document.querySelector('#health').textContent)-dt*.7).toFixed(0);for(const cloud of clouds){cloud.group.position.x+=cloud.speed*dt;if(cloud.group.position.x>125)cloud.group.position.x=-125;}for(const bird of birds){bird.phase+=dt*2.2;bird.group.position.x=bird.homeX+Math.sin(bird.phase*.45)*8;bird.group.position.y=20+Math.sin(bird.phase*2)*.7;bird.group.position.z=bird.homeZ+Math.cos(bird.phase*.45)*7;bird.group.rotation.y=Math.atan2(Math.cos(bird.phase*.45),-Math.sin(bird.phase*.45));bird.leftWing.rotation.z=-.18+Math.sin(bird.phase*5)*.42;bird.rightWing.rotation.z=.18-Math.sin(bird.phase*5)*.42;}for(const a of animals){
 if(a.mixer)a.mixer.update(dt);
 a.phase+=dt*a.speed*.24;
 const oldX=a.group.position.x,oldZ=a.group.position.z;
 const dx=oldX-player.position.x,dz=oldZ-player.position.z;
 const playerDist=Math.hypot(dx,dz);
 if(playerDist<6.5&&performance.now()>a.friendlyUntil)a.fleeing=true;
 if(playerDist>10)a.fleeing=false;
 if(performance.now()<a.friendlyUntil)a.fleeing=false;
 if(a.fleeing){
  const d=playerDist||.001;
  const fleeSpeed=a.kind==='horse'?5.2:a.kind==='deer'?4.8:a.kind==='cow'?3.4:a.kind==='lamb'?3.0:3.6;
  a.group.position.x+=dx/d*fleeSpeed*dt;
  a.group.position.z+=dz/d*fleeSpeed*dt;
  a.group.position.x=THREE.MathUtils.clamp(a.group.position.x,-160,160);
  a.group.position.z=THREE.MathUtils.clamp(a.group.position.z,-160,160);
  a.group.rotation.y=Math.atan2(-dx,-dz);
 }else{
  a.group.position.x=a.homeX+Math.sin(a.phase)*a.wanderX;
  a.group.position.z=a.homeZ+Math.cos(a.phase*.7)*a.wanderZ;
  a.group.rotation.y=Math.atan2(Math.cos(a.phase)*a.wanderX,-Math.sin(a.phase*.7)*a.wanderZ);
 }
 const travel=Math.hypot(a.group.position.x-oldX,a.group.position.z-oldZ);
 a.gaitPhase+=travel*4.2;
 Math.hypot(a.group.position.x-oldX,a.group.position.z-oldZ);a.gaitPhase+=travel*4.2;const moving=travel>0.0005;const gait=a.fleeing?1:(moving?1:.12);const wander=a.fleeing?1:(Math.sin(a.phase*.22+a.turnPhase)>.82?.28:1);a.group.rotation.y=Math.atan2(Math.cos(a.phase)*a.wanderX,-Math.sin(a.phase*.7)*a.wanderZ);for(let j=0;j<a.legs.length;j++){const front=j%2===0?1:-1;const side=j<2?1:-1;const stride=Math.sin(a.gaitPhase+front*Math.PI*.5+(side<0?Math.PI:0))*gait*wander;a.legs[j].rotation.x=stride*.42;if(a.knees){a.knees[j].rotation.x=Math.max(0,-stride)*.46;a.knees[j].rotation.z=Math.sin(a.gaitPhase+front*Math.PI*.5+(side<0?Math.PI:0))*.018}}if(a.tail){a.tail.rotation.x=Math.sin(a.phase*2.2)*.24;a.tail.rotation.z=Math.sin(a.phase*1.35+1.2)*.18}if(a.tailTuft)a.tailTuft.rotation.z=Math.sin(a.phase*2.2+.6)*.12;if(a.torso){a.torso.scale.y=(a.kind==='cow'?.385:.325)*(1+Math.sin(a.phase*1.8)*.009);a.torso.position.y=1.015+Math.sin(a.phase*1.8)*.007}if(a.ears){a.ears[0].rotation.z=Math.sin(a.phase*1.7)*.08-.12;a.ears[1].rotation.z=-Math.sin(a.phase*1.5+1)*.08+.12}const graze=Math.pow(Math.max(0,Math.sin(a.phase*.32)),8);if(a.neck){a.neck.rotation.x=-.32+Math.sin(a.phase*1.4)*.065+graze*.32;a.neck.rotation.z=Math.sin(a.phase*.9)*.075}if(a.head){a.head.rotation.x=Math.sin(a.phase*1.4+.5)*.09-graze*.22;a.head.rotation.y=Math.sin(a.phase*.8)*.055;a.head.rotation.z=Math.sin(a.phase*1.1+.7)*.085}if(a.ears){a.ears[0].rotation.x=Math.sin(a.phase*2.1)*.16;a.ears[0].rotation.z=-.32+Math.sin(a.phase*1.7)*.12;a.ears[1].rotation.x=Math.sin(a.phase*1.8+1)*.16;a.ears[1].rotation.z=.32-Math.sin(a.phase*1.5+.8)*.12}if(a.kind==='sheep'||a.kind==='lamb'){const nibble=Math.pow(Math.max(0,Math.sin(a.phase*.42+1.1)),10);a.head.rotation.x+=nibble*.28;a.neck.rotation.x+=nibble*.22;a.ears[0].rotation.z+=Math.sin(a.phase*2.4)*.10;a.ears[1].rotation.z+=Math.sin(a.phase*2.1+1)*.10;a.tail.rotation.x=Math.sin(a.phase*3.1)*.32;a.tail.rotation.z=Math.sin(a.phase*2.3)*.22;const playerDist=Math.hypot(a.group.position.x-player.position.x,a.group.position.z-player.position.z);if(playerDist<4){a.head.rotation.y+=Math.sin(a.phase*5)*.16;a.ears[0].rotation.z-=.12;a.ears[1].rotation.z+=.12;}}a.group.position.y=terrainHeight(a.group.position.x,a.group.position.z)+.085;if(a.realisticModel){a.realisticModel.position.y=a.modelBaseY+Math.abs(Math.sin(a.gaitPhase*1.8))*.018}}const forward=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0)-joyY,side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joyX,s=Math.sin(yaw),c=Math.cos(yaw);const oldX=player.position.x,oldZ=player.position.z;
// Aceleração gradual e velocidade máxima com corrida.
const inputX=side*c-forward*s,inputZ=side*s-forward*c;
const inputLen=Math.hypot(inputX,inputZ)||1;
const maxSpeed=(ridingHorse?11:6)*(running?1.6:1),accel=ridingHorse?25:18;
if(Math.abs(side)+Math.abs(forward)>.04){horizontalVX+=inputX/inputLen*accel*dt;horizontalVZ+=inputZ/inputLen*accel*dt;}
else{const friction=Math.exp(-8*dt);horizontalVX*=friction;horizontalVZ*=friction;}
const speedNow=Math.hypot(horizontalVX,horizontalVZ);
if(speedNow>maxSpeed){horizontalVX*=maxSpeed/speedNow;horizontalVZ*=maxSpeed/speedNow;}
let nextX=oldX+horizontalVX*dt,nextZ=oldZ+horizontalVZ*dt;
for(const obstacle of trees){if(!obstacle.visible)continue;const dx=nextX-obstacle.position.x,dz=nextZ-obstacle.position.z,minDist=.68,d2=dx*dx+dz*dz;if(d2<minDist*minDist){const d=Math.sqrt(d2)||.001;nextX=obstacle.position.x+dx/d*minDist;nextZ=obstacle.position.z+dz/d*minDist;horizontalVX*=.18;horizontalVZ*=.18;}}
// Colisão contínua com animais: verifica todo o trajeto do jogador,
// não apenas o ponto final, para evitar atravessar ao correr.
const playerRadius=.52;
for(const animal of (ridingHorse?[]:animals)){
 const body=animal.group;
 if(!body||!body.visible)continue;
 const ax=body.position.x,az=body.position.z;
 const moveX=nextX-oldX,moveZ=nextZ-oldZ;
 const len2=moveX*moveX+moveZ*moveZ;
 const t=len2>.000001?THREE.MathUtils.clamp(((ax-oldX)*moveX+(az-oldZ)*moveZ)/len2,0,1):1;
 const closestX=oldX+moveX*t,closestZ=oldZ+moveZ*t;
 let dx=closestX-ax,dz=closestZ-az;
 const dist=Math.hypot(dx,dz);
 const animalRadius=animal.kind==='cow'?1.45:animal.kind==='horse'?1.35:animal.kind==='sheep'?1.12:animal.kind==='lamb'?.92:1.30;
 const minDist=playerRadius+animalRadius;
 if(dist<minDist){
  if(dist<.001){dx=oldX-ax;dz=oldZ-az;if(Math.hypot(dx,dz)<.001){dx=1;dz=0}}
  const n=Math.hypot(dx,dz)||1,nx=dx/n,nz=dz/n;
  // Se o caminho cruza o animal, termina antes da borda do corpo.
  nextX=ax+nx*minDist;nextZ=az+nz*minDist;
  horizontalVX*=.06;horizontalVZ*=.06;
 }
}

// Colisão física da cidade: saloon, armazém, varanda, carroça e moradores.
// Caixas usam limites no plano X/Z; o jogador é tratado como um círculo.
function pushOutBox(px,pz,cx,cz,halfW,halfD,radius){
 const qx=THREE.MathUtils.clamp(px,cx-halfW,cx+halfW);
 const qz=THREE.MathUtils.clamp(pz,cz-halfD,cz+halfD);
 let dx=px-qx,dz=pz-qz,d=Math.hypot(dx,dz);
 if(d>=radius)return [px,pz,false];
 if(d>.001)return [qx+dx/d*radius,qz+dz/d*radius,true];
 const ox=halfW-Math.abs(px-cx),oz=halfD-Math.abs(pz-cz);
 if(ox<oz)return [px+(px<cx?-1:1)*(ox+radius),pz,true];
 return [px,pz+(pz<cz?-1:1)*(oz+radius),true];
}
const solidBuildings=[
 // Paredes laterais e fundo; frente dividida para manter a porta central livre.
 {x:-17-6.5,z:1,w:.22,d:4.0},
 {x:-17+6.5,z:1,w:.22,d:4.0},
 {x:-17,z:1-4,w:6.5,d:.22},
 {x:-17-3.9,z:1+4,w:2.6,d:.22},
 {x:-17+3.9,z:1+4,w:2.6,d:.22},
 {x:1-5,z:1,w:.22,d:3.5},
 {x:1+5,z:1,w:.22,d:3.5},
 {x:1,z:1-3.5,w:5,d:.22},
 {x:1-3.1,z:1+3.5,w:1.9,d:.22},
 {x:1+3.1,z:1+3.5,w:1.9,d:.22}
];
for(const b of solidBuildings){
 const result=pushOutBox(nextX,nextZ,b.x,b.z,b.w,b.d,.30);
 if(result[2]){nextX=result[0];nextZ=result[1];horizontalVX*=.08;horizontalVZ*=.08;}
}
// Móveis internos também são sólidos: colisão alinhada às dimensões visuais.
for(const f of townFurnitureColliders){
 const hit=pushOutBox(nextX,nextZ,f.x,f.z,f.w,f.d,.30);
 if(hit[2]){nextX=hit[0];nextZ=hit[1];horizontalVX*=.08;horizontalVZ*=.08;}
}
// Carroça: carroceria e rodas são obstáculos sólidos.
if(!ridingHorse){
 const wagonHit=pushOutBox(nextX,nextZ,wagonGroup.position.x,wagonGroup.position.z,1.55,2.05,.34);
 if(wagonHit[2]){nextX=wagonHit[0];nextZ=wagonHit[1];horizontalVX*=.08;horizontalVZ*=.08;}
 const horseDist=Math.hypot(nextX-draftHorse.position.x,nextZ-draftHorse.position.z);
 if(draftHorse.visible&&horseDist<1.45+playerRadius){
  const dx=nextX-draftHorse.position.x,dz=nextZ-draftHorse.position.z,d=horseDist||.001;
  nextX=draftHorse.position.x+dx/d*(1.45+playerRadius);nextZ=draftHorse.position.z+dz/d*(1.45+playerRadius);
  horizontalVX*=.08;horizontalVZ*=.08;
 }
}
// Moradores também impedem que o jogador atravesse seus corpos.
for(const resident of townsfolk){
 const dx=nextX-resident.group.position.x,dz=nextZ-resident.group.position.z,d=Math.hypot(dx,dz),min=playerRadius+.42;
 if(d<min){const n=d||.001;nextX=resident.group.position.x+dx/n*min;nextZ=resident.group.position.z+dz/n*min;horizontalVX*=.08;horizontalVZ*=.08;}
}
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
  if(crossedDoorOut){insideCabin=false}
  else allowMove=false;
 }
}
const slopeRun=Math.hypot(nextX-oldX,nextZ-oldZ),slopeRise=Math.abs(terrainHeight(nextX,nextZ)-terrainHeight(oldX,oldZ));
if(!insideCabin&&slopeRun>.0001&&slopeRise>slopeRun*1.05+.18){allowMove=false;horizontalVX*=.12;horizontalVZ*=.12;}
if(allowMove){player.position.x=nextX;player.position.z=nextZ}else{horizontalVX*=.12;horizontalVZ*=.12}
player.position.x=THREE.MathUtils.clamp(player.position.x,-165,165);player.position.z=THREE.MathUtils.clamp(player.position.z,-165,165);const distanceMoved=Math.hypot(player.position.x-oldX,player.position.z-oldZ);
if(inWater){horizontalVX*=.985;horizontalVZ*=.985;}
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
// Inclina o corpo suavemente conforme a inclinação real do terreno.
const slopeSample=1.1;
const slopeX=(terrainHeight(player.position.x+slopeSample,player.position.z)-terrainHeight(player.position.x-slopeSample,player.position.z))/(2*slopeSample);
const slopeZ=(terrainHeight(player.position.x,player.position.z+slopeSample)-terrainHeight(player.position.x,player.position.z-slopeSample))/(2*slopeSample);
// Limita a inclinação para evitar que o boneco tombe em encostas irregulares.
const groundTiltX=grounded?THREE.MathUtils.clamp(-Math.atan(slopeZ)*.48,-.22,.22):0;
const groundTiltZ=grounded?THREE.MathUtils.clamp(Math.atan(slopeX)*.48,-.22,.22):0;
const targetTiltX=runLean+groundTiltX;
const targetTiltZ=groundTiltZ+(moving?Math.sin(walkPhase*.5)*(running?.018:.008)*moveAmount:0);
const tiltBlend=1-Math.exp(-Math.max(0,dt)*7);
player.rotation.x=THREE.MathUtils.lerp(player.rotation.x,targetTiltX,tiltBlend);
player.rotation.z=THREE.MathUtils.lerp(player.rotation.z,targetTiltZ,tiltBlend);
const floorY=terrainHeight(player.position.x,player.position.z)-.03;if(grounded&&velocityY<=0&&player.position.y-floorY<.45){player.position.y=floorY;velocityY=0;}else{velocityY-=20*dt;player.position.y+=velocityY*dt;}if(player.position.y<=floorY){player.position.y=floorY;if(velocityY<0)velocityY=0;grounded=true}else{grounded=false}if(ridingHorse){player.position.y=floorY+.92;draftHorse.visible=true;draftHorse.position.set(player.position.x,floorY,player.position.z);draftHorse.rotation.y=yaw+Math.PI;player.rotation.y=yaw;}else{player.position.y=Math.max(floorY,player.position.y);}
const horseNear=Math.hypot(player.position.x-draftHorse.position.x,player.position.z-draftHorse.position.z)<4;mountButton.disabled=!ridingHorse&&!horseNear;mountButton.style.opacity=mountButton.disabled?'.5':'1';
const target=new THREE.Vector3(player.position.x,player.position.y+(firstPerson?1.65:1.25),player.position.z);if(firstPerson){camera.position.copy(target);camera.rotation.set(pitch,yaw,0,'YXZ')}else{camera.position.set(target.x+Math.sin(yaw)*5.8,target.y+1.15+pitch*2,target.z+Math.cos(yaw)*5.8);camera.lookAt(target)}}
let last=performance.now();function animate(now){requestAnimationFrame(animate);const townTime=now*.001;for(const n of townsfolk){if(n.stationary)continue;n.group.position.x=n.x+Math.sin(townTime*n.speed+n.phase)*.7;n.group.position.z=n.z+Math.cos(townTime*n.speed+n.phase)*.45;n.group.rotation.y=Math.sin(townTime*n.speed+n.phase)*.35;}if(playerMixer)playerMixer.update(Math.min((now-last)/1000,.04));nearbyClerk=null;let clerkDistance=3.1;for(const n of townsfolk){if(!n.stationary)continue;const d=Math.hypot(player.position.x-n.group.position.x,player.position.z-n.group.position.z);if(d<clerkDistance){clerkDistance=d;nearbyClerk={shop:n.x>-5?'store':'saloon'};}}talkButton.style.display=nearbyClerk?'block':'none';nearbyAnimal=null;let animalDistance=3.2;for(const a of animals){const d=Math.hypot(player.position.x-a.group.position.x,player.position.z-a.group.position.z);if(d<animalDistance){animalDistance=d;nearbyAnimal=a;}}feedButton.style.display=nearbyAnimal?'block':'none';feedButton.disabled=!nearbyAnimal||berries<1;feedButton.style.opacity=feedButton.disabled?'.55':'1';const t=nearestTree(),b=nearestBush();collect.disabled=!t;collect.textContent=t?'COLETAR MADEIRA (+3)':'APROXIME-SE DE UMA ÁRVORE';gather.disabled=!b;gather.textContent=b?'COLETAR FRUTAS (+3)':'PROCURE ARBUSTOS';eat.disabled=berries<1||hunger>95;craft.disabled=wood<8;craft.style.opacity=wood<8?'.55':'1';const dt=Math.min((now-last)/1000,.04);last=now;update(dt);renderer.render(scene,camera)}requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});document.querySelector('#loading').style.display='none';