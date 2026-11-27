/* Stick Rōnin · modelos 3D con esqueleto (zombi de Tripo)
   El modelo NO tiene animaciones propias: su esqueleto sigue los 12 puntos (J) que ya calcula el juego o el editor,
   así que sirven todas las animaciones existentes (andar, atacar, ragdoll, cortes…).
   J: 0 cabeza, 1 cuello/hombros, 2 pecho, 3 pelvis, 4-5 codo/mano izq., 6-7 codo/mano der., 8-9 rodilla/pie izq., 10-11 rodilla/pie der.
   Los huesos se colocan directamente en coordenadas del mundo (sin jerarquía), así un corte solo oculta los huesos de ese tramo. */
(function(){
const ZM={ready:false,failed:false,K:1.96,glow:.45,bright:1.35,tpl:null,pool:[],used:0,cap:80};
// tramo (a→b) que mueve cada hueso; "limb" = raíz de brazo/pierna: su posición la da el tramo padre y apunta a la articulación b
const DEFS=[
 ['Hip',[3,2]],['Pelvis',[3,2]],['Waist',[3,2]],
 ['Spine01',[2,1]],['Spine02',[2,1]],['L_Clavicle',[2,1]],['R_Clavicle',[2,1]],
 ['NeckTwist01',[1,0]],['Head',[1,0]],
 ['L_Upperarm',[1,4],[2,1]],['L_Forearm',[4,5]],['L_Hand',[4,5]],
 ['R_Upperarm',[1,6],[2,1]],['R_Forearm',[6,7]],['R_Hand',[6,7]],
 ['L_Thigh',[3,8],[3,2]],['L_Calf',[8,9]],['L_Foot',[8,9]],
 ['R_Thigh',[3,10],[3,2]],['R_Calf',[10,11]],['R_Foot',[10,11]]];
const segKey=(a,b)=>a<b?a+'-'+b:b+'-'+a;
const V=()=>new THREE.Vector3(),Q=()=>new THREE.Quaternion(),M4=()=>new THREE.Matrix4();
const _a=V(),_b=V(),_c=V(),_d=V(),_q=Q(),_qy=Q(),_m=M4(),_s=M4(),_t=M4(),YAX=new THREE.Vector3(0,1,0),ONE=new THREE.Vector3(1,1,1);
function loadScript(src){return new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=ko;document.head.appendChild(s)})}
ZM.load=async function(url){
 try{
  if(!THREE.GLTFLoader)await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js');
  const gltf=await new Promise((ok,ko)=>new THREE.GLTFLoader().load(url,ok,undefined,ko));
  let src=null;gltf.scene.traverse(o=>{if(o.isSkinnedMesh&&!src)src=o});if(!src)throw new Error('sin malla con esqueleto');
  gltf.scene.updateMatrixWorld(true);
  const names=src.skeleton.bones.map(b=>b.name),bind=src.bindMatrix.clone();
  // reposo de cada hueso en el espacio de la malla
  const rest=src.skeleton.boneInverses.map(bi=>{const m=M4().multiplyMatrices(bi,bind).invert(),p=V(),q=Q(),s=V();m.decompose(p,q,s);return{p,q}});
  const idx=n=>names.indexOf(n),P=n=>rest[idx(n)].p;
  const RJ=[P('Head').clone().add(V().set(0,.035,0)),P('NeckTwist01'),P('Spine01'),P('Hip'),P('L_Forearm'),P('L_Hand'),P('R_Forearm'),P('R_Hand'),P('L_Calf'),P('L_Foot'),P('R_Calf'),P('R_Foot')].map(v=>v.clone());
  const defs=DEFS.map(([n,seg,pos])=>({i:idx(n),n,seg,pos:pos||null,key:segKey(seg[0],seg[1])})).filter(d=>d.i>=0);
  const om=src.material,map=om.map||null;
  ZM.tpl={geo:src.geometry,map,names,bind,boneInv:src.skeleton.boneInverses,rest,RJ,defs};
  ZM.ready=true;return true
 }catch(e){ZM.failed=true;console.warn('[zmodel] no se pudo cargar',e);return false}
};
ZM.create=function(scene){const T=ZM.tpl;
 const mat=new THREE.MeshLambertMaterial({map:T.map,emissiveMap:T.map,emissive:new THREE.Color(ZM.glow,ZM.glow,ZM.glow),skinning:true,side:THREE.DoubleSide});
 const bones=T.names.map(()=>{const b=new THREE.Bone();b.matrixAutoUpdate=false;return b});
 const mesh=new THREE.SkinnedMesh(T.geo,mat);mesh.frustumCulled=false;mesh.matrixAutoUpdate=false;
 const sk=new THREE.Skeleton(bones,T.boneInv.map(m=>m.clone()));mesh.bind(sk,T.bind);
 scene.add(mesh);const I={mesh,bones,mat,sk};return I};
// R = rotación del tramo: primero el giro del cuerpo (yaw), luego lo que haga falta para que el tramo de reposo apunte al actual
function segRot(out,ra,rb,ja,jb,qy){_a.subVectors(rb,ra).applyQuaternion(qy);if(_a.lengthSq()<1e-9){out.copy(qy);return 1}const l0=_a.length();_a.normalize();
 _b.set(jb[0]-ja[0],jb[1]-ja[1],jb[2]-ja[2]);const l1=_b.length();if(l1<1e-6){out.copy(qy);return 1}_b.multiplyScalar(1/l1);
 out.setFromUnitVectors(_a,_b).multiply(qy);return l1/l0}
/* coloca el modelo: J = 12 puntos en el mundo, yaw = hacia dónde mira, s = escala del personaje,
   vis = Set de tramos visibles ('0-1','1-2'…; null = todos), tint = THREE.Color o null */
const SQ=Array.from({length:144},()=>Q()),SF=new Float32Array(144),SS=new Int32Array(144),_rq=Q(),_k=V(),_z=V();let STAMP=1;
ZM.pose=function(I,J,yaw,s,vis,tint){const T=ZM.tpl,k=ZM.K*(s||1);_qy.setFromAxisAngle(YAX,yaw||0);
 for(let i=0;i<12;i++){const j=J[i];if(!j||j[0]!==j[0]){const b=J[3]&&J[3][0]===J[3][0]?J[3]:null;if(!b){I.mesh.visible=false;return}J=J.map(x=>x&&x[0]===x[0]?x:b);break}}
 const RJ=T.RJ,st=++STAMP;
 const seg=(a,b)=>{const id=a*12+b;if(SS[id]!==st){SS[id]=st;SF[id]=segRot(SQ[id],RJ[a],RJ[b],J[a],J[b],_qy)/k}return id};
 for(const d of T.defs){const b=I.bones[d.i],a=d.seg[0],c=d.seg[1],R=T.rest[d.i],hidden=vis&&!vis.has(d.key);
  let q,f=1;const head=_c;
  if(d.pos){// raíz de miembro: su punto lo da el tramo padre; apunta a la articulación final
   const pk=seg(d.pos[0],d.pos[1]),pa=d.pos[0];head.copy(R.p).sub(RJ[pa]).applyQuaternion(SQ[pk]).multiplyScalar(k);head.x+=J[pa][0];head.y+=J[pa][1];head.z+=J[pa][2];
   _d.set(J[c][0]-head.x,J[c][1]-head.y,J[c][2]-head.z);const l1=_d.length()||1e-4;_d.multiplyScalar(1/l1);
   _a.subVectors(RJ[c],R.p).applyQuaternion(_qy);const l0=_a.length()||1e-4;_a.multiplyScalar(1/l0);
   q=_q.setFromUnitVectors(_a,_d).multiply(_qy);f=l1/(l0*k)}
  else{const sk=seg(a,c);q=_q.copy(SQ[sk]);f=SF[sk];head.copy(R.p).sub(RJ[a]).applyQuaternion(q).multiplyScalar(k);head.x+=J[a][0];head.y+=J[a][1];head.z+=J[a][2];
   _d.set(J[c][0]-J[a][0],J[c][1]-J[a][1],J[c][2]-J[a][2]).normalize()}
  f=Math.min(1.7,Math.max(.6,f));
  // matriz = T(cabeza) · estirado a lo largo del tramo · R · Rreposo · S(k)
  _m.compose(_z,_rq.copy(q).multiply(R.q),hidden?_k.set(1e-4,1e-4,1e-4):_k.set(k,k,k));
  if(!hidden&&Math.abs(f-1)>.02){const u=_d,g=f-1;_s.set(1+g*u.x*u.x,g*u.x*u.y,g*u.x*u.z,0,g*u.y*u.x,1+g*u.y*u.y,g*u.y*u.z,0,g*u.z*u.x,g*u.z*u.y,1+g*u.z*u.z,0,0,0,0,1);_m.premultiply(_s)}
  const e=_m.elements;e[12]=head.x;e[13]=head.y;e[14]=head.z;
  b.matrixWorld.multiplyMatrices(T.bind,_m)}
 if(tint)I.mat.color.copy(tint).multiplyScalar(ZM.bright);else I.mat.color.setRGB(ZM.bright,ZM.bright,ZM.bright);I.mesh.visible=true};
// reparto por fotograma
ZM.begin=function(){ZM.used=0};
ZM.get=function(scene){if(!ZM.ready||ZM.used>=ZM.cap)return null;let I=ZM.pool[ZM.used];if(!I){I=ZM.create(scene);ZM.pool.push(I)}ZM.used++;return I};
ZM.end=function(){for(let i=ZM.used;i<ZM.pool.length;i++)ZM.pool[i].mesh.visible=false};
ZM.segKey=segKey;
window.ZM=ZM;
})();
