/* Stick Rōnin · modelos 3D deformados en la tarjeta gráfica (zombi y protagonista de Tripo)
   Una sola malla entera. Cada vértice sabe (en su color) a qué 2 tramos del esqueleto de palos pertenece y en qué proporción.
   Cada fotograma se calculan 11 matrices por cuerpo (una por tramo, pegada a sus puntos J[a]→J[b]) y se guardan en una textura;
   el shader mueve cada vértice mezclando sus dos tramos: articulaciones suaves, sin esqueleto de three.js.
   Todos los cuerpos de un modelo se dibujan en UNA llamada (InstancedMesh). Un tramo cortado se encoge a 0 (no se corta la malla).
   J: 0 cabeza, 1 cuello/hombros, 2 pecho, 3 pelvis, 4-5 codo/mano izq., 6-7 codo/mano der., 8-9 rodilla/pie izq., 10-11 rodilla/pie der.
   LOD (niveles de detalle): ZM.load(url, scene, [urlLOD1, urlLOD2]) carga además mallas más simples (remesh de Tripo con los pesos pasados
   en Blender, mismo _rig.json). Cada LOD es una «parte»: su InstancedMesh y su contorno, con el mismo material, la misma textura de matrices
   y su propia lista de filas (zmBody por instancia), color y ceniza. ZM.add elige la parte por la distancia horizontal del cuerpo al punto que
   marca ZM.lodAt(x,z,k) (el foco de la cámara): < lodD[0] (5 m) → LOD0, < lodD[1] (9 m) → LOD1, si no LOD2. La distancia se divide por la escala
   (los pequeños bajan antes) y por k (en calidad 0 el juego pasa k=0,5: los LOD entran a la mitad de distancia).
   Hay un objeto por modelo: window.ZM (zombis, 120 cuerpos, color por cuerpo) y window.ZMP (protagonista, 8 cuerpos, con su textura
   pasada a tinta aguada en el estilo tinta). Los ajustes del estilo (contorno, aguada, ceniza) vienen de window.INKS (models/inkstyle.js). */
(function(){
// el orden importa: es el que guarda prep_tripo.py en el color de cada vértice
const SEGS=[[3,2],[2,1],[1,0],[1,4,[2,1]],[4,5],[1,6,[2,1]],[6,7],[3,8,[3,2]],[8,9],[3,10,[3,2]],[10,11]],NS=SEGS.length,TW=NS*4;
const segKey=(a,b)=>a<b?a+'-'+b:b+'-'+a;
const V=()=>new THREE.Vector3(),Q=()=>new THREE.Quaternion();
const _a=V(),_b=V(),_c=V(),_d=V(),_z=V(),_k=V(),_q=Q(),_qy=Q(),_m=new THREE.Matrix4(),_s=new THREE.Matrix4(),_t=new THREE.Matrix4(),YAX=new THREE.Vector3(0,1,0);
const PQ=Array.from({length:144},()=>Q());
function loadScript(src){return new Promise((ok,ko)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=ko;document.head.appendChild(s)})}
let gltfP=null;const needGLTF=()=>gltfP||(gltfP=THREE.GLTFLoader?Promise.resolve():loadScript('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js'));
// ajustes compartidos del estilo tinta (si no se cargó inkstyle.js, valores fijos)
const IU=()=>window.INKS?INKS.u:(IU.d||(IU.d={on:{value:0},wModel:{value:.028},outCol:{value:new THREE.Color(0x0e0c0b)},ash:{value:new THREE.Vector2(.055,1)},
 wash:{value:new THREE.Vector4(.18,.7,.35,40)},edge:{value:new THREE.Vector3(.55,.3,.85)},washPaper:{value:new THREE.Color(0xefe9df)},washInk:{value:new THREE.Color(0x141210)},washRed:{value:new THREE.Color(0xb5121f)},redKeep:{value:1},washOn:{value:1}}));

/* correcciones hechas a mano en modelo.html (esqueleto, escala, estiramiento y pesos pintados):
   primero las del dispositivo (localStorage 'stickronin_mfix_<nombre>'), si no, models/<nombre>_fix.json (si el _rig.json dice hasFix) */
const FIXKEY=n=>'stickronin_mfix_'+n;
// versión de los archivos de modelos: SÚBELA (aquí y en el ?v= de las etiquetas <script> de las páginas) cada vez que cambien los modelos o este archivo
const AV='20261128e',vq=u=>u+'?v='+AV;
async function loadFix(name,url,rig){let f=null;try{f=JSON.parse(localStorage.getItem(FIXKEY(name))||'null')}catch(_){}
 if(!f&&rig.hasFix){try{const r=await fetch(vq(url.replace(/\.glb$/,'_fix.json')));if(r.ok)f=await r.json()}catch(_){}}return f}
function mk(cfg){
const ZM={ready:false,failed:false,K:1.96,smin:.65,smax:1.6,cap:cfg.cap||120,glow:cfg.glow==null?.12:cfg.glow,wash:!!cfg.wash,base:null,n:0,ink:false,
 parts:[],lodD:[5,9],lodS:1,lodOn:false,lx:0,lz:0,lodN:[0,0,0]};
// lee un .glb preparado por prep_tripo.py: geometría en el mundo y, del color de cada vértice, sus 2 tramos y la proporción
async function readGeo(url){
  const gltf=await new Promise((ok,ko)=>new THREE.GLTFLoader().load(vq(url),ok,undefined,ko));gltf.scene.updateMatrixWorld(true);
  let src=null;gltf.scene.traverse(o=>{if(o.isMesh&&!src)src=o});if(!src||!src.geometry.getAttribute('color'))throw new Error('malla sin datos de tramos');
  const g=src.geometry.clone();g.applyMatrix4(src.matrixWorld);
  // color (a/10, b/10, peso de a) → atributo propio
  const C=g.getAttribute('color'),n=C.count,seg=new Float32Array(n*3),A=C.array,nd=!C.normalized?1:A instanceof Uint16Array?65535:A instanceof Uint8Array?255:1;
  for(let i=0;i<n;i++){seg[i*3]=Math.round(C.getX(i)/nd*10);seg[i*3+1]=Math.round(C.getY(i)/nd*10);seg[i*3+2]=C.getZ(i)/nd}
  return {g,seg,n,src}}
// una parte (LOD): InstancedMesh + contorno de tinta sobre la geometría g, con el material compartido; zmBody dice la fila de cada instancia
function mkPart(g,scene){
  const body=new THREE.InstancedBufferAttribute(new Float32Array(ZM.cap),1);body.setUsage(THREE.DynamicDrawUsage);g.setAttribute('zmBody',body);
  // disuelto en ceniza por cuerpo (0 = entero, 1 = desaparecido)
  const dis=new THREE.InstancedBufferAttribute(new Float32Array(ZM.cap),1);dis.setUsage(THREE.DynamicDrawUsage);g.setAttribute('zmDis',dis);
  const I=new THREE.Matrix4(),mesh=new THREE.InstancedMesh(g,ZM.mat,ZM.cap);mesh.frustumCulled=false;for(let i=0;i<ZM.cap;i++)mesh.setMatrixAt(i,I);
  mesh.instanceColor=new THREE.InstancedBufferAttribute(new Float32Array(ZM.cap*3),3);mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);mesh.count=0;scene.add(mesh);
  const ol=new THREE.InstancedMesh(g,ZM.om,ZM.cap);ol.frustumCulled=false;for(let i=0;i<ZM.cap;i++)ol.setMatrixAt(i,I);ol.count=0;ol.visible=false;scene.add(ol);
  const P={g,mesh,outline:ol,body,dis,n:0};ZM.parts.push(P);return P}
ZM.load=async function(url,scene,lods){
 try{
  await needGLTF();
  url=url.split('?')[0];const rig=await (await fetch(vq(url.replace(/\.glb$/,'_rig.json')))).json();
  const {g,seg,n,src}=await readGeo(url);
  ZM.name=url.split('/').pop().replace(/\.glb$/,'');const fix=await loadFix(ZM.name,url,rig);ZM.fix=fix;
  if(fix&&fix.w&&fix.n&&fix.n!==n){console.warn('[zmodel] el modelo cambió: se ignoran los pesos pintados a mano de',url);fix.w=null}
  if(fix&&fix.w)for(const k in fix.w){const i=+k,v=fix.w[k];if(i<n){seg[i*3]=v[0];seg[i*3+1]=v[1];seg[i*3+2]=v[2]}}
  if(fix){if(fix.K)ZM.K=fix.K;if(fix.smin)ZM.smin=fix.smin;if(fix.smax)ZM.smax=fix.smax}
  g.deleteAttribute('color');g.setAttribute('zmSeg',new THREE.BufferAttribute(seg,3));ZM.seg=seg;ZM.geo=g;ZM.rig=rig;
  // textura de matrices: cada fila = un cuerpo, 4 texels (columnas) por tramo
  ZM.data=new Float32Array(TW*ZM.cap*4);ZM.tex=new THREE.DataTexture(ZM.data,TW,ZM.cap,THREE.RGBAFormat,THREE.FloatType);ZM.tex.magFilter=ZM.tex.minFilter=THREE.NearestFilter;ZM.tex.needsUpdate=true;
  ZM.base=new THREE.Color(ZM.wash?0xffffff:0x7d8c6a);
  const map=ZM.wash&&src.material&&src.material.map||null;if(map)map.encoding=THREE.LinearEncoding;
  const mat=new THREE.MeshLambertMaterial({color:0xffffff,map,emissive:new THREE.Color(ZM.glow,ZM.glow,ZM.glow),side:THREE.DoubleSide});
  if(ZM.wash)mat.defines={ZM_WASH:''};
  const key='zm'+(ZM.wash?'W':'')+(map?'M':'');mat.customProgramCacheKey=()=>key;
  const u=IU();
  mat.onBeforeCompile=sh=>{sh.uniforms.zmTex={value:ZM.tex};sh.uniforms.zmH={value:ZM.cap};sh.uniforms.zmAsh=u.ash;
   for(const k of['wash','edge','washPaper','washInk','washRed','redKeep','washOn'])sh.uniforms['ink_'+k]=u[k];sh.uniforms.ink_on=u.on;
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform sampler2D zmTex;uniform float zmH;attribute vec3 zmSeg;attribute float zmBody;attribute float zmDis;varying vec3 zmP;varying float zmD;varying float zmRim;\nmat4 zmM(float s){float y=(zmBody+.5)/zmH,x=s*4.;return mat4(texture2D(zmTex,vec2((x+.5)/'+TW+'.,y)),texture2D(zmTex,vec2((x+1.5)/'+TW+'.,y)),texture2D(zmTex,vec2((x+2.5)/'+TW+'.,y)),texture2D(zmTex,vec2((x+3.5)/'+TW+'.,y)));}')
    .replace('#include <beginnormal_vertex>','mat4 zmA=zmM(zmSeg.x),zmB=zmM(zmSeg.y);float zmHA=zmA[3][3],zmHB=zmB[3][3],zmWA=zmSeg.z*zmHA,zmWB=(1.-zmSeg.z)*zmHB,zmV=zmWA+zmWB;\nvec3 objectNormal=normalize(mat3(zmA)*normal*zmWA+mat3(zmB)*normal*zmWB+1e-6);\n#ifdef USE_TANGENT\nvec3 objectTangent=vec3(tangent.xyz);\n#endif')
    // tramo cortado: su matriz lleva [3][3]=0 y en la columna 3 su punto de unión. El vértice que es sobre todo de ese tramo se encoge ahí;
    // el que es sobre todo del tramo que sigue unido se queda entero con él (corte limpio, sin pinchos)
    .replace('#include <begin_vertex>','zmP=position;zmD=zmDis;vec3 transformed=zmV<.5?(zmHA<.5?zmA[3].xyz:zmB[3].xyz):(zmA*vec4(position,1.)*zmWA+zmB*vec4(position,1.)*zmWB).xyz/zmV;')
    // borde de la silueta (para el pincel de la aguada)
    .replace('#include <fog_vertex>','#include <fog_vertex>\nzmRim=1.-abs(dot(normalize(transformedNormal),normalize(-mvPosition.xyz)));');
   /* disuelto con borde de brasa (idea: Codrops «dissolve effect with shaders and particles»): ruido 3D fijo en la malla de reposo;
      se quita lo que queda por debajo del umbral y justo encima hay una franja incandescente (blanco-amarillo → naranja) y luego carbón.
      Arde de arriba abajo, con ruido, como papel. */
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 zmP;varying float zmD;varying float zmRim;uniform vec2 zmAsh;uniform float ink_on,ink_redKeep,ink_washOn;uniform vec4 ink_wash;uniform vec3 ink_edge,ink_washPaper,ink_washInk,ink_washRed;\nfloat zmH3(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}\nfloat zmN3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(zmH3(i),zmH3(i+vec3(1,0,0)),f.x),mix(zmH3(i+vec3(0,1,0)),zmH3(i+vec3(1,1,0)),f.x),f.y),mix(mix(zmH3(i+vec3(0,0,1)),zmH3(i+vec3(1,0,1)),f.x),mix(zmH3(i+vec3(0,1,1)),zmH3(i+vec3(1,1,1)),f.x),f.y),f.z);}')
    /* guerrero en tinta aguada (solo el protagonista, ZM_WASH): la textura se pasa a papel/tinta según su luminosidad, con grano de pincel
       y bordes de la silueta como pincelada seca; el rojo (fajín, cintas) se conserva. Encima, el sombreado en tonos del juego. */
    .replace('#include <color_fragment>','#include <color_fragment>\n#ifdef ZM_WASH\nif(ink_on*ink_washOn>.5){vec3 zc=diffuseColor.rgb;float zL=dot(zc,vec3(.299,.587,.114)),zMx=max(zc.r,max(zc.g,zc.b)),zMn=min(zc.r,min(zc.g,zc.b));\n'+
     'float zRed=smoothstep(.42,.58,1.-max(zc.g,zc.b)/max(zc.r,1e-3))*smoothstep(.1,.22,zc.r)*ink_redKeep;float zg=zmN3(zmP*ink_wash.w)*.6+zmN3(zmP*ink_wash.w*2.7)*.4;\n'+
     'float zi=smoothstep(ink_wash.x,ink_wash.y,1.-zL+(zg-.5)*ink_wash.z);float ze=smoothstep(ink_edge.x,ink_edge.x+ink_edge.y,zmRim+(zg-.5)*.5)*ink_edge.z;\n'+
     'vec3 zw=mix(ink_washPaper,ink_washInk,max(zi,ze));diffuseColor.rgb=mix(zw,ink_washRed*(.55+.6*zL),zRed*(1.-ze));}\n#endif')
    .replace('#include <fog_fragment>','if(zmD>.001){float zn=.62*(.65*zmN3(zmP*9.)+.35*zmN3(zmP*23.))+.38*(1.-clamp(zmP.y/.95,0.,1.));float th=zmD*1.25-.12,e=zmAsh.x;if(zn<th)discard;float u=(zn-th)/e;\n vec3 em=u<1.?mix(vec3(1.6,1.35,.7),vec3(1.3,.32,.04),u):vec3(.55,.13,.02)*(1.-smoothstep(1.,2.2,u));float ch=1.-smoothstep(1.,3.6,u);gl_FragColor.rgb=mix(gl_FragColor.rgb,vec3(.07,.05,.045),ch*.92)+em*zmAsh.y;}\n#include <fog_fragment>')};
  // contorno de tinta (estilo tinta): la misma malla, solo caras traseras, en el color del contorno e inflada por la normal; usa el mismo parche (cortes y ceniza)
  const om=new THREE.MeshLambertMaterial({color:0x000000,side:THREE.BackSide});
  om.onBeforeCompile=sh=>{mat.onBeforeCompile(sh);sh.uniforms.zmOW=u.wModel;sh.uniforms.zmOC=u.outCol;
   sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float zmOW;').replace('#include <morphtarget_vertex>','if(zmV>=.5)transformed+=objectNormal*zmOW;\n#include <morphtarget_vertex>');
   sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform vec3 zmOC;').replace('#include <fog_fragment>','gl_FragColor.rgb=zmD>.001?gl_FragColor.rgb:zmOC;\n#include <fog_fragment>')};
  om.customProgramCacheKey=()=>key+'Out';
  ZM.mat=mat;ZM.om=om;const P0=mkPart(g,scene);ZM.mesh=P0.mesh;ZM.outline=P0.outline;ZM.dis=P0.dis;
  ZM.map=map;ZM.setRig((fix&&fix.RJ)||rig.RJ,Object.assign({},rig.root,fix&&fix.root||{}));
  ZM.ready=true;
  // LOD: se cargan después, en orden; mientras no estén, todo se dibuja con el LOD0. Los pesos pintados a mano (fix.w) son solo del LOD0.
  if(lods)(async()=>{for(const u of lods){try{const r=await readGeo(u.split('?')[0]);r.g.deleteAttribute('color');r.g.setAttribute('zmSeg',new THREE.BufferAttribute(r.seg,3));mkPart(r.g,scene)}
   catch(e){console.warn('[zmodel] LOD no cargado',u,e);break}}})();
  return true
 }catch(e){ZM.failed=true;console.warn('[zmodel] no se pudo cargar',url,e);return false}
};
// punto de referencia para elegir LOD (cada fotograma, antes de añadir cuerpos)
ZM.lodAt=function(x,z,k){ZM.lodOn=true;ZM.lx=x;ZM.lz=z;ZM.lodS=k||1};
ZM.setRig=function(RJ,root){ZM.RJ=RJ.map(v=>new THREE.Vector3(...v));ZM.roots=SEGS.map(([a,b,par])=>par?new THREE.Vector3(...root[segKey(a,b)]):null)};
ZM.SEGS=SEGS;ZM.TW=TW;ZM.FIXKEY=FIXKEY;
ZM.begin=function(){ZM.n=0;for(const P of ZM.parts)P.n=0;ZM.lodN[0]=ZM.lodN[1]=ZM.lodN[2]=0};
/* añade un cuerpo: J = 12 puntos en el mundo, yaw = hacia dónde mira, s = escala, vis = Set de tramos visibles (null = todos), col = THREE.Color, dis = ceniza 0..1,
   lod = forzar un nivel (si no, por distancia a ZM.lodAt) */
ZM.add=function(J,yaw,s,vis,col,dis,lod){if(!ZM.ready||ZM.n>=ZM.cap)return false;
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
  const f=Math.min(ZM.smax,Math.max(ZM.smin,l1/(l0*k)));
  // matriz = T(anclaje) · estirado a lo largo del tramo · R · S(k) · T(-anclaje de reposo)
  _m.compose(_z,_q,_k.set(k,k,k));_t.makeTranslation(-ra.x,-ra.y,-ra.z);_m.multiply(_t);
  if(Math.abs(f-1)>.02){const u=_d,g=f-1;_s.set(1+g*u.x*u.x,g*u.x*u.y,g*u.x*u.z,0,g*u.y*u.x,1+g*u.y*u.y,g*u.y*u.z,0,g*u.z*u.x,g*u.z*u.y,1+g*u.z*u.z,0,0,0,0,1);_m.premultiply(_s)}
  const e=_m.elements;e[12]+=anchor.x;e[13]+=anchor.y;e[14]+=anchor.z;D.set(e,off)}
 const np=ZM.parts.length;let L=0;
 if(lod!=null)L=lod;else if(np>1&&ZM.lodOn){const dx=J[3][0]-ZM.lx,dz=J[3][2]-ZM.lz,d=Math.sqrt(dx*dx+dz*dz)/((s||1)*ZM.lodS);L=d<ZM.lodD[0]?0:d<ZM.lodD[1]?1:2}
 if(L>np-1)L=np-1;const P=ZM.parts[L],i=P.n++;ZM.lodN[L]++;
 P.body.array[i]=row;P.mesh.setColorAt(i,col||ZM.base);P.dis.array[i]=dis||0;return true};
ZM.end=function(){if(!ZM.ready)return;
 const gl=ZM.ink?(ZM.wash?0:(window.INKS?INKS.v.eGlow:.015)):ZM.glow;ZM.mat.emissive.setScalar(gl);ZM.tex.needsUpdate=true;
 for(const P of ZM.parts){P.mesh.count=P.n;P.mesh.visible=P.n>0;P.outline.count=P.n;P.outline.visible=ZM.ink&&P.n>0;
  if(P.n){P.mesh.instanceColor.needsUpdate=true;P.dis.needsUpdate=true;P.body.needsUpdate=true}}};
ZM.segKey=segKey;
return ZM}
function segRot(out,ra,rb,ja,jb){_a.subVectors(rb,ra).applyQuaternion(_qy);const l0=_a.length();if(l0<1e-6){out.copy(_qy);return}_a.multiplyScalar(1/l0);
 _b.set(jb[0]-ja[0],jb[1]-ja[1],jb[2]-ja[2]);const l1=_b.length();if(l1<1e-6){out.copy(_qy);return}_b.multiplyScalar(1/l1);
 out.setFromUnitVectors(_a,_b).multiply(_qy)}
window.ZM=mk({cap:120,glow:.12});
window.ZMP=mk({cap:8,glow:0,wash:true});
window.mkZM=mk;
})();
