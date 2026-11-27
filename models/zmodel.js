/* Stick Rōnin · modelos 3D deformados en la tarjeta gráfica (zombi de Tripo)
   Una sola malla entera. Cada vértice sabe (en su color) a qué 2 tramos del esqueleto de palos pertenece y en qué proporción.
   Cada fotograma se calculan 11 matrices por cuerpo (una por tramo, pegada a sus puntos J[a]→J[b]) y se guardan en una textura;
   el shader mueve cada vértice mezclando sus dos tramos: articulaciones suaves, sin esqueleto de three.js.
   Todos los cuerpos se dibujan en UNA llamada (InstancedMesh). Un tramo cortado se encoge a 0 (no se corta la malla).
   J: 0 cabeza, 1 cuello/hombros, 2 pecho, 3 pelvis, 4-5 codo/mano izq., 6-7 codo/mano der., 8-9 rodilla/pie izq., 10-11 rodilla/pie der. */
(function(){
const ZM={ready:false,failed:false,K:1.96,cap:120,glow:.12,base:null,n:0,ink:false,inkU:{value:.028}};
// el orden importa: es el que guarda prep_tripo.py en el color de cada vértice
const SEGS=[[3,2],[2,1],[1,0],[1,4,[2,1]],[4,5],[1,6,[2,1]],[6,7],[3,8,[3,2]],[8,9],[3,10,[3,2]],[10,11]],NS=SEGS.length,TW=NS*4;
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
  let src=null;gltf.scene.traverse(o=>{if(o.isMesh&&!src)src=o});if(!src||!src.geometry.getAttribute('color'))throw new Error('malla sin datos de tramos');
  const g=src.geometry.clone();g.applyMatrix4(src.matrixWorld);
  // color (a/10, b/10, peso de a) → atributo propio
  const C=g.getAttribute('color'),n=C.count,seg=new Float32Array(n*3),A=C.array,nd=!C.normalized?1:A instanceof Uint16Array?65535:A instanceof Uint8Array?255:1;
  for(let i=0;i<n;i++){seg[i*3]=Math.round(C.getX(i)/nd*10);seg[i*3+1]=Math.round(C.getY(i)/nd*10);seg[i*3+2]=C.getZ(i)/nd}
  g.deleteAttribute('color');g.setAttribute('zmSeg',new THREE.BufferAttribute(seg,3));
  const body=new Float32Array(ZM.cap);for(let i=0;i<ZM.cap;i++)body[i]=i;g.setAttribute('zmBody',new THREE.InstancedBufferAttribute(body,1));
  // disuelto en ceniza por cuerpo (0 = entero, 1 = desaparecido)
  ZM.dis=new THREE.InstancedBufferAttribute(new Float32Array(ZM.cap),1);ZM.dis.setUsage(THREE.DynamicDrawUsage);g.setAttribute('zmDis',ZM.dis);
  // textura de matrices: cada fila = un cuerpo, 4 texels (columnas) por tramo
  ZM.data=new Float32Array(TW*ZM.cap*4);ZM.tex=new THREE.DataTexture(ZM.data,TW,ZM.cap,THREE.RGBAFormat,THREE.FloatType);ZM.tex.magFilter=ZM.tex.minFilter=THREE.NearestFilter;ZM.tex.needsUpdate=true;
  ZM.base=new THREE.Color(0x7d8c6a);
  const mat=new THREE.MeshLambertMaterial({color:0xffffff,emissive:new THREE.Color(ZM.glow,ZM.glow,ZM.glow),side:THREE.DoubleSide});
  mat.customProgramCacheKey=()=>'zmBody';
  mat.onBeforeCompile=sh=>{sh.uniforms.zmTex={value:ZM.tex};sh.uniforms.zmH={value:ZM.cap};
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform sampler2D zmTex;uniform float zmH;attribute vec3 zmSeg;attribute float zmBody;attribute float zmDis;varying vec3 zmP;varying float zmD;\nmat4 zmM(float s){float y=(zmBody+.5)/zmH,x=s*4.;return mat4(texture2D(zmTex,vec2((x+.5)/'+TW+'.,y)),texture2D(zmTex,vec2((x+1.5)/'+TW+'.,y)),texture2D(zmTex,vec2((x+2.5)/'+TW+'.,y)),texture2D(zmTex,vec2((x+3.5)/'+TW+'.,y)));}')
    .replace('#include <beginnormal_vertex>','mat4 zmA=zmM(zmSeg.x),zmB=zmM(zmSeg.y);float zmHA=zmA[3][3],zmHB=zmB[3][3],zmWA=zmSeg.z*zmHA,zmWB=(1.-zmSeg.z)*zmHB,zmV=zmWA+zmWB;\nvec3 objectNormal=normalize(mat3(zmA)*normal*zmWA+mat3(zmB)*normal*zmWB+1e-6);\n#ifdef USE_TANGENT\nvec3 objectTangent=vec3(tangent.xyz);\n#endif')
    // tramo cortado: su matriz lleva [3][3]=0 y en la columna 3 su punto de unión. El vértice que es sobre todo de ese tramo se encoge ahí;
    // el que es sobre todo del tramo que sigue unido se queda entero con él (corte limpio, sin pinchos)
    .replace('#include <begin_vertex>','zmP=position;zmD=zmDis;vec3 transformed=zmV<.5?(zmHA<.5?zmA[3].xyz:zmB[3].xyz):(zmA*vec4(position,1.)*zmWA+zmB*vec4(position,1.)*zmWB).xyz/zmV;');
   /* disuelto con borde de brasa (idea: Codrops «dissolve effect with shaders and particles»): ruido 3D fijo en la malla de reposo;
      se quita lo que queda por debajo del umbral y justo encima hay una franja incandescente (blanco-amarillo → naranja) y luego carbón.
      Arde de arriba abajo, con ruido, como papel. */
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 zmP;varying float zmD;\nfloat zmH3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}\nfloat zmN3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(zmH3(i),zmH3(i+vec3(1,0,0)),f.x),mix(zmH3(i+vec3(0,1,0)),zmH3(i+vec3(1,1,0)),f.x),f.y),mix(mix(zmH3(i+vec3(0,0,1)),zmH3(i+vec3(1,0,1)),f.x),mix(zmH3(i+vec3(0,1,1)),zmH3(i+vec3(1,1,1)),f.x),f.y),f.z);}')
    .replace('#include <fog_fragment>','if(zmD>.001){float zn=.62*(.65*zmN3(zmP*9.)+.35*zmN3(zmP*23.))+.38*(1.-clamp(zmP.y/.95,0.,1.));float th=zmD*1.25-.12,e=.055;if(zn<th)discard;float u=(zn-th)/e;\n vec3 em=u<1.?mix(vec3(1.6,1.35,.7),vec3(1.3,.32,.04),u):vec3(.55,.13,.02)*(1.-smoothstep(1.,2.2,u));float ch=1.-smoothstep(1.,3.6,u);gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(.07,.05,.045),ch*.92)+em;}\n#include <fog_fragment>')};
  const mesh=new THREE.InstancedMesh(g,mat,ZM.cap);mesh.frustumCulled=false;
  for(let i=0;i<ZM.cap;i++)mesh.setMatrixAt(i,new THREE.Matrix4());
  mesh.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(ZM.cap*3),3);mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);mesh.count=0;
  scene.add(mesh);ZM.mesh=mesh;
  // contorno de tinta (estilo tinta): la misma malla, solo caras traseras, en negro e inflada ZM.inkU por la normal; usa el mismo parche (cortes y ceniza)
  const om=new THREE.MeshLambertMaterial({color:0x000000,side:THREE.BackSide});
  om.onBeforeCompile=sh=>{mat.onBeforeCompile(sh);sh.uniforms.zmOW=ZM.inkU;
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float zmOW;').replace('#include <morphtarget_vertex>','if(zmV>=.5)transformed+=objectNormal*zmOW;\n#include <morphtarget_vertex>')};
  om.customProgramCacheKey=()=>'zmOutline';
  const ol=new THREE.InstancedMesh(g,om,ZM.cap);ol.frustumCulled=false;for(let i=0;i<ZM.cap;i++)ol.setMatrixAt(i,new THREE.Matrix4());ol.count=0;ol.visible=false;scene.add(ol);ZM.outline=ol;
  ZM.RJ=rig.RJ.map(v=>new THREE.Vector3(...v));
  ZM.roots=SEGS.map(([a,b,par])=>par?new THREE.Vector3(...rig.root[segKey(a,b)]):null);
  ZM.ready=true;return true
 }catch(e){ZM.failed=true;console.warn('[zmodel] no se pudo cargar',e);return false}
};
function segRot(out,ra,rb,ja,jb){_a.subVectors(rb,ra).applyQuaternion(_qy);const l0=_a.length();if(l0<1e-6){out.copy(_qy);return}_a.multiplyScalar(1/l0);
 _b.set(jb[0]-ja[0],jb[1]-ja[1],jb[2]-ja[2]);const l1=_b.length();if(l1<1e-6){out.copy(_qy);return}_b.multiplyScalar(1/l1);
 out.setFromUnitVectors(_a,_b).multiply(_qy)}
ZM.begin=function(){ZM.n=0};
/* añade un cuerpo: J = 12 puntos en el mundo, yaw = hacia dónde mira, s = escala, vis = Set de tramos visibles (null = todos), col = THREE.Color, dis = ceniza 0..1 */
ZM.add=function(J,yaw,s,vis,col,dis){if(!ZM.ready||ZM.n>=ZM.cap)return false;
 for(let i=0;i<12;i++){const j=J[i];if(!j||j[0]!==j[0]){const b=J[3]&&J[3][0]===J[3][0]?J[3]:null;if(!b)return false;J=J.map(x=>x&&x[0]===x[0]?x:b);break}}
 const row=ZM.n++,k=ZM.K*(s||1),RJ=ZM.RJ,D=ZM.data;_qy.setFromAxisAngle(YAX,yaw||0);
 for(let si=0;si<NS;si++){const [a,b,par]=SEGS[si],off=(row*TW+si*4)*4;
  let ra,anchor;
  if(par){const pq=PQ[par[0]*12+par[1]];segRot(pq,RJ[par[0]],RJ[par[1]],J[par[0]],J[par[1]]);
   ra=ZM.roots[si];anchor=_c.copy(ra).sub(RJ[par[0]]).applyQuaternion(pq).multiplyScalar(k);anchor.x+=J[par[0]][0];anchor.y+=J[par[0]][1];anchor.z+=J[par[0]][2]}
  else{anchor=_c.set(J[a][0],J[a][1],J[a][2]);ra=RJ[a]}
  if(vis&&!vis.has(segKey(a,b))){D.fill(0,off,off+16);D[off+12]=anchor.x;D[off+13]=anchor.y;D[off+14]=anchor.z;continue}
  _a.subVectors(RJ[b],ra).applyQuaternion(_qy);const l0=_a.length()||1e-4;_a.multiplyScalar(1/l0);
  _d.set(J[b][0]-anchor.x,J[b][1]-anchor.y,J[b][2]-anchor.z);const l1=_d.length()||1e-4;_d.multiplyScalar(1/l1);
  _q.setFromUnitVectors(_a,_d).multiply(_qy);
  const f=Math.min(1.6,Math.max(.65,l1/(l0*k)));
  // matriz = T(anclaje) · estirado a lo largo del tramo · R · S(k) · T(-anclaje de reposo)
  _m.compose(_z,_q,_k.set(k,k,k));_t.makeTranslation(-ra.x,-ra.y,-ra.z);_m.multiply(_t);
  if(Math.abs(f-1)>.02){const u=_d,g=f-1;_s.set(1+g*u.x*u.x,g*u.x*u.y,g*u.x*u.z,0,g*u.y*u.x,1+g*u.y*u.y,g*u.y*u.z,0,g*u.z*u.x,g*u.z*u.y,1+g*u.z*u.z,0,0,0,0,1);_m.premultiply(_s)}
  const e=_m.elements;e[12]+=anchor.x;e[13]+=anchor.y;e[14]+=anchor.z;D.set(e,off)}
 ZM.mesh.setColorAt(row,col||ZM.base);ZM.dis.array[row]=dis||0;return true};
ZM.end=function(){if(!ZM.ready)return;ZM.mesh.count=ZM.n;ZM.outline.count=ZM.n;ZM.outline.visible=ZM.ink&&ZM.n>0;ZM.mesh.material.emissive.setScalar(ZM.ink?.015:ZM.glow);ZM.tex.needsUpdate=true;ZM.mesh.instanceColor.needsUpdate=true;ZM.dis.needsUpdate=true};
ZM.segKey=segKey;
window.ZM=ZM;
})();
