/* Stick Rōnin · modelos 3D por PIEZAS RÍGIDAS (zombi de Tripo)
   El modelo está partido en 11 piezas, una por tramo del esqueleto de palos (BONES). Cada pieza se pega a sus dos puntos
   (J[a] → J[b]) y gira con ellos: sirven todas las animaciones del juego y del editor, sin esqueleto ni huesos.
   Todas las piezas iguales se dibujan juntas (InstancedMesh): 11 llamadas de dibujo para todos los zombis.
   Un tramo cortado simplemente no se dibuja.
   J: 0 cabeza, 1 cuello/hombros, 2 pecho, 3 pelvis, 4-5 codo/mano izq., 6-7 codo/mano der., 8-9 rodilla/pie izq., 10-11 rodilla/pie der. */
(function(){
const ZM={ready:false,failed:false,K:1.96,cap:120,glow:.12,base:null,segs:[],n:0};
// tramo → [a (anclaje), b (apunta a), tramo padre si es raíz de brazo/pierna]
const SEGS=[[3,2],[2,1],[1,0],[1,4,[2,1]],[4,5],[1,6,[2,1]],[6,7],[3,8,[3,2]],[8,9],[3,10,[3,2]],[10,11]];
const segKey=(a,b)=>a<b?a+'-'+b:b+'-'+a;
const V=()=>new THREE.Vector3(),Q=()=>new THREE.Quaternion();
const _a=V(),_b=V(),_c=V(),_d=V(),_z=V(),_k=V(),_q=Q(),_qy=Q(),_m=new THREE.Matrix4(),_s=new THREE.Matrix4(),_t=new THREE.Matrix4(),YAX=new THREE.Vector3(0,1,0);
const PQ=Array.from({length:144},()=>Q());
function loadScript(src){return new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=ko;document.head.appendChild(s)})}
ZM.load=async function(url,scene){
 try{
  if(!THREE.GLTFLoader)await loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js');
  const rig=await (await fetch(url.replace(/\.glb$/,'_rig.json'))).json();
  const gltf=await new Promise((ok,ko)=>new THREE.GLTFLoader().load(url,ok,undefined,ko));gltf.scene.updateMatrixWorld(true);
  const geo={};gltf.scene.traverse(o=>{if(o.isMesh){const m=/seg_(\d+)_(\d+)/.exec(o.name)||/seg_(\d+)_(\d+)/.exec(o.parent&&o.parent.name||'');if(m){const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);geo[m[1]+'_'+m[2]]=g}}});
  ZM.base=new THREE.Color(0x7d8c6a);
  const RJ=rig.RJ.map(v=>new THREE.Vector3(...v));
  for(const [a,b,par] of SEGS){const g=geo[a+'_'+b];if(!g)continue;
   const mat=new THREE.MeshLambertMaterial({color:0xffffff,emissive:new THREE.Color(ZM.glow,ZM.glow,ZM.glow),side:THREE.DoubleSide});
   const mesh=new THREE.InstancedMesh(g,mat,ZM.cap);mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
   mesh.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(ZM.cap*3),3);mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);mesh.count=0;
   const root=par?new THREE.Vector3(...rig.root[segKey(a,b)]):null;
   ZM.segs.push({a,b,par,key:segKey(a,b),mesh,root});scene.add(mesh)}
  ZM.RJ=RJ;ZM.ready=ZM.segs.length>0;if(!ZM.ready)throw new Error('sin piezas');return true
 }catch(e){ZM.failed=true;console.warn('[zmodel] no se pudo cargar',e);return false}
};
// rotación de un tramo: primero el giro del cuerpo (yaw), luego lo que haga falta para que el tramo de reposo apunte al actual
function segRot(out,ra,rb,ja,jb){_a.subVectors(rb,ra).applyQuaternion(_qy);const l0=_a.length();if(l0<1e-6){out.copy(_qy);return}_a.multiplyScalar(1/l0);
 _b.set(jb[0]-ja[0],jb[1]-ja[1],jb[2]-ja[2]);const l1=_b.length();if(l1<1e-6){out.copy(_qy);return}_b.multiplyScalar(1/l1);
 out.setFromUnitVectors(_a,_b).multiply(_qy)}
ZM.begin=function(){ZM.n=0;for(const S of ZM.segs)S.mesh.count=0};
/* añade un cuerpo: J = 12 puntos en el mundo, yaw = hacia dónde mira, s = escala, vis = Set de tramos visibles (null = todos), col = THREE.Color */
ZM.add=function(J,yaw,s,vis,col){if(!ZM.ready||ZM.n>=ZM.cap)return false;
 for(let i=0;i<12;i++){const j=J[i];if(!j||j[0]!==j[0]){const b=J[3]&&J[3][0]===J[3][0]?J[3]:null;if(!b)return false;J=J.map(x=>x&&x[0]===x[0]?x:b);break}}
 ZM.n++;const k=ZM.K*(s||1),RJ=ZM.RJ;_qy.setFromAxisAngle(YAX,yaw||0);const c=col||ZM.base;
 for(const S of ZM.segs){const {a,b,par}=S;
  if(vis&&!vis.has(S.key))continue;
  let ra,anchor;
  if(par){// raíz de brazo/pierna: el hombro/cadera va pegado al tramo padre
   const pq=PQ[par[0]*12+par[1]];segRot(pq,RJ[par[0]],RJ[par[1]],J[par[0]],J[par[1]]);
   anchor=_c.copy(S.root).sub(RJ[par[0]]).applyQuaternion(pq).multiplyScalar(k);anchor.x+=J[par[0]][0];anchor.y+=J[par[0]][1];anchor.z+=J[par[0]][2];ra=S.root}
  else{anchor=_c.set(J[a][0],J[a][1],J[a][2]);ra=RJ[a]}
  const mesh=S.mesh,idx=mesh.count;if(idx>=ZM.cap)continue;
  // rotación: el tramo de reposo (ra→RJ[b]) apunta al actual (anclaje→J[b])
  _a.subVectors(RJ[b],ra).applyQuaternion(_qy);const l0=_a.length()||1e-4;_a.multiplyScalar(1/l0);
  _d.set(J[b][0]-anchor.x,J[b][1]-anchor.y,J[b][2]-anchor.z);const l1=_d.length()||1e-4;_d.multiplyScalar(1/l1);
  _q.setFromUnitVectors(_a,_d).multiply(_qy);
  const f=Math.min(1.6,Math.max(.65,l1/(l0*k)));
  // matriz = T(anclaje) · estirado a lo largo del tramo · R · S(k) · T(-anclaje de reposo)
  _m.compose(_z,_q,_k.set(k,k,k));_t.makeTranslation(-ra.x,-ra.y,-ra.z);_m.multiply(_t);
  if(Math.abs(f-1)>.02){const u=_d,g=f-1;_s.set(1+g*u.x*u.x,g*u.x*u.y,g*u.x*u.z,0,g*u.y*u.x,1+g*u.y*u.y,g*u.y*u.z,0,g*u.z*u.x,g*u.z*u.y,1+g*u.z*u.z,0,0,0,0,1);_m.premultiply(_s)}
  const e=_m.elements;e[12]+=anchor.x;e[13]+=anchor.y;e[14]+=anchor.z;
  mesh.setMatrixAt(idx,_m);mesh.setColorAt(idx,c);mesh.count=idx+1}
 return true};
ZM.end=function(){for(const S of ZM.segs){S.mesh.instanceMatrix.needsUpdate=true;if(S.mesh.instanceColor)S.mesh.instanceColor.needsUpdate=true}};
ZM.segKey=segKey;
window.ZM=ZM;
})();
