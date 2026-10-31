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
 torso.geometry.computeVertexNormals();
 // Peitoral integrado ao tronco, com volume gradual e parte inferior menos saliente
 const chest=oval(g,coat,0,1.095,.385,isCow?.385:.31,isCow?.285:.245,isCow?.35:.30);
 const chestPos=chest.geometry.attributes.position;
 for(let vi=0;vi<chestPos.count;vi++){
  const px=chestPos.getX(vi),py=chestPos.getY(vi),pz=chestPos.getZ(vi);
  const lower=THREE.MathUtils.clamp(-py,0,1);
  chestPos.setXYZ(vi,px*(1-lower*.075),py,pz*(1-lower*.045));
 }
 chest.geometry.computeVertexNormals();
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
 g.position.set(x,0,z);scene.add(g);
 animals.push({group:g,kind,legs,knees,tail,ears,neck,head,torso,tailTuft,phase:Math.random()*6,gaitPhase:Math.random()*6,lastX:x,lastZ:z,speed:.45+Math.random()*.35,homeX:x,homeZ:z,wanderX:kind==='lamb'?1.8+Math.random()*1.2:3.5+Math.random()*3.5,wanderZ:kind==='lamb'?1.5+Math.random()*1.2:2.5+Math.random()*3.5,turnPhase:Math.random()*6.28});
}
for(let i=0;i<5;i++)makeAnimal(i<3?'deer':'cow',(Math.random()-.5)*85+35,(Math.random()-.5)*85+25);
makeAnimal('sheep',5,7);
makeAnimal('sheep',8,10);
makeAnimal('sheep',2,11);
makeAnimal('lamb',4.2,7.8);
makeAnimal('lamb',6.2,8.2);
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

function update(dt){updateDayNight(dt);updateWeather(dt);updateWind(dt);const nearChest=insideCabin&&Math.hypot(player.position.x-9.7,player.position.z+14.8)<2.8;document.querySelector('#chestPanel').hidden=!nearChest;storeButton.disabled=!nearChest||(wood===0&&berries===0);takeButton.disabled=!nearChest||(storedWood===0&&storedBerries===0);const nearCabin=Math.hypot(player.position.x-12,player.position.z-(-13))<8;interact.disabled=!nearCabin;if(insideCabin){interact.disabled=false;interact.textContent='SAIR DA CABANA'}else if(!nearCabin)interact.textContent='APROXIME-SE DA CABANA';else if(!cabinOpen)interact.textContent='ABRIR CABANA';else interact.textContent='ENTRAR NA CABANA';hunger=Math.max(0,hunger-dt*.12);if(hunger===0)document.querySelector('#health').textContent=Math.max(0,Number(document.querySelector('#health').textContent)-dt*.7).toFixed(0);for(const cloud of clouds){cloud.group.position.x+=cloud.speed*dt;if(cloud.group.position.x>125)cloud.group.position.x=-125;}for(const bird of birds){bird.phase+=dt*2.2;bird.group.position.x=bird.homeX+Math.sin(bird.phase*.45)*8;bird.group.position.y=20+Math.sin(bird.phase*2)*.7;bird.group.position.z=bird.homeZ+Math.cos(bird.phase*.45)*7;bird.group.rotation.y=Math.atan2(Math.cos(bird.phase*.45),-Math.sin(bird.phase*.45));bird.leftWing.rotation.z=-.18+Math.sin(bird.phase*5)*.42;bird.rightWing.rotation.z=.18-Math.sin(bird.phase*5)*.42;}for(const a of animals){a.phase+=dt*a.speed*.24;const oldX=a.group.position.x,oldZ=a.group.position.z;a.group.position.x=a.homeX+Math.sin(a.phase)*a.wanderX;a.group.position.z=a.homeZ+Math.cos(a.phase*.7)*a.wanderZ;const travel=Math.hypot(a.group.position.x-oldX,a.group.position.z-oldZ);a.gaitPhase+=travel*4.2;const moving=travel>0.0005;const gait=moving?1:0.12;const wander=Math.sin(a.phase*.22+a.turnPhase)>.82?.28:1;a.group.rotation.y=Math.atan2(Math.cos(a.phase)*a.wanderX,-Math.sin(a.phase*.7)*a.wanderZ);for(let j=0;j<a.legs.length;j++){const front=j%2===0?1:-1;const side=j<2?1:-1;const stride=Math.sin(a.gaitPhase+front*Math.PI*.5+(side<0?Math.PI:0))*gait*wander;a.legs[j].rotation.x=stride*.42;if(a.knees){a.knees[j].rotation.x=Math.max(0,-stride)*.46;a.knees[j].rotation.z=Math.sin(a.gaitPhase+front*Math.PI*.5+(side<0?Math.PI:0))*.018}}if(a.tail){a.tail.rotation.x=Math.sin(a.phase*2.2)*.24;a.tail.rotation.z=Math.sin(a.phase*1.35+1.2)*.18}if(a.tailTuft)a.tailTuft.rotation.z=Math.sin(a.phase*2.2+.6)*.12;if(a.torso){a.torso.scale.y=(a.kind==='cow'?.385:.325)*(1+Math.sin(a.phase*1.8)*.009);a.torso.position.y=1.015+Math.sin(a.phase*1.8)*.007}if(a.ears){a.ears[0].rotation.z=Math.sin(a.phase*1.7)*.08-.12;a.ears[1].rotation.z=-Math.sin(a.phase*1.5+1)*.08+.12}const graze=Math.pow(Math.max(0,Math.sin(a.phase*.32)),8);if(a.neck){a.neck.rotation.x=-.32+Math.sin(a.phase*1.4)*.065+graze*.32;a.neck.rotation.z=Math.sin(a.phase*.9)*.075}if(a.head){a.head.rotation.x=Math.sin(a.phase*1.4+.5)*.09-graze*.22;a.head.rotation.y=Math.sin(a.phase*.8)*.055;a.head.rotation.z=Math.sin(a.phase*1.1+.7)*.085}if(a.ears){a.ears[0].rotation.x=Math.sin(a.phase*2.1)*.16;a.ears[0].rotation.z=-.32+Math.sin(a.phase*1.7)*.12;a.ears[1].rotation.x=Math.sin(a.phase*1.8+1)*.16;a.ears[1].rotation.z=.32-Math.sin(a.phase*1.5+.8)*.12}if(a.kind==='sheep'||a.kind==='lamb'){const nibble=Math.pow(Math.max(0,Math.sin(a.phase*.42+1.1)),10);a.head.rotation.x+=nibble*.28;a.neck.rotation.x+=nibble*.22;a.ears[0].rotation.z+=Math.sin(a.phase*2.4)*.10;a.ears[1].rotation.z+=Math.sin(a.phase*2.1+1)*.10;a.tail.rotation.x=Math.sin(a.phase*3.1)*.32;a.tail.rotation.z=Math.sin(a.phase*2.3)*.22;const playerDist=Math.hypot(a.group.position.x-player.position.x,a.group.position.z-player.position.z);if(playerDist<4){a.head.rotation.y+=Math.sin(a.phase*5)*.16;a.ears[0].rotation.z-=.12;a.ears[1].rotation.z+=.12;}}a.group.position.y=.085}const forward=(keys.w||keys.arrowup?1:0)-(keys.s||keys.arrowdown?1:0)-joyY,side=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0)+joyX,s=Math.sin(yaw),c=Math.cos(yaw);const oldX=player.position.x,oldZ=player.position.z;
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