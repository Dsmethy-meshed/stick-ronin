/* Stick Rōnin · ajustes del estilo tinta 墨 (blanco, negro y rojo), compartidos por el juego y el editor.
   Cada ajuste: [clave, grupo, etiqueta, tipo ('color' | 'num' | 'bool'), valor por defecto, mín, máx, paso].
   Se guardan en localStorage 'stickronin_ink' (solo lo que difiere del valor por defecto): el editor y el juego comparten
   ese almacenamiento si se abren desde el mismo sitio (GitHub Pages, githack o localhost), así que lo que ajustes en el
   editor se ve en el juego. Para dejarlo fijo para todos, copiar el JSON del editor en los valores por defecto de aquí.
   Guía del estilo: 02-DOCS/wiki/arte/estilo-visual.md */
(function(){
const DEF=[
 ['paper','Paleta','Papel: fondo y niebla','color','#e8e1d4'],
 ['ground','Paleta','Suelo','color','#d9d0c0'],
 ['tiles','Paleta','Rejilla del suelo','color','#b1a796'],
 ['side','Paleta','Edificios: paredes','color','#2e2a28'],
 ['top','Paleta','Edificios: techos','color','#77706a'],
 ['pag','Paleta','Pagodas lejanas (aguada)','color','#a59d92'],
 ['sun','Paleta','Sol','color','#c8102e'],
 ['fogNear','Paleta','Niebla: empieza (m)','num',16,0,60,1],
 ['fogFar','Paleta','Niebla: tapa del todo (m)','num',62,10,150,1],
 ['hemi','Luz','Luz de cielo','num',.95,0,2,.01],
 ['sunI','Luz','Luz del sol','num',.8,0,2,.01],
 ['tShadow','Tonos','Tono de sombra','num',.5,0,1.5,.01],
 ['tMid','Tonos','Tono medio','num',.8,0,1.5,.01],
 ['tLight','Tonos','Tono iluminado','num',1.05,0,1.8,.01],
 ['th1','Tonos','Corte sombra → medio','num',.85,0,2,.01],
 ['th2','Tonos','Corte medio → luz','num',1.25,0,2.5,.01],
 ['soft','Tonos','Suavidad de los cortes','num',.03,.001,.4,.001],
 ['outCol','Contorno','Color del contorno','color','#0e0c0b'],
 ['wSticks','Contorno','Grosor en palos','num',.02,0,.08,.001],
 ['wModel','Contorno','Grosor en modelos','num',.028,0,.1,.001],
 ['eBase','Enemigos','Oscuridad de los zombis','num',.11,0,.6,.005],
 ['eVar','Enemigos','Variedad de tono entre zombis','num',.3,0,.8,.01],
 ['eGlow','Enemigos','Brillo propio de los zombis','num',.12,0,.3,.005],
 ['washOn','Protagonista','Tinta aguada en el protagonista','bool',true],
 ['washPaper','Protagonista','Papel (zonas claras)','color','#efe9df'],
 ['washInk','Protagonista','Tinta (zonas oscuras)','color','#141210'],
 ['washLo','Protagonista','Contraste: empieza la tinta','num',.38,0,1,.01],
 ['washHi','Protagonista','Contraste: tinta plena','num',.82,0,1.5,.01],
 ['grain','Protagonista','Grano del pincel','num',.35,0,1.5,.01],
 ['grainScale','Protagonista','Tamaño del grano','num',40,2,160,1],
 ['edge','Protagonista','Borde a pincel: dónde empieza','num',.72,0,1,.01],
 ['edgeSoft','Protagonista','Borde a pincel: suavidad','num',.3,.01,1,.01],
 ['edgeStr','Protagonista','Borde a pincel: fuerza','num',.85,0,1,.01],
 ['redKeep','Protagonista','Conservar el rojo (fajín)','num',1,0,1,.01],
 ['washRed','Protagonista','Rojo del protagonista','color','#b5121f'],
 ['ashEdge','Ceniza','Ancho del borde de brasa','num',.055,.005,.3,.005],
 ['ashGlow','Ceniza','Brillo de la brasa','num',1,0,3,.05]
];
const KEY='stickronin_ink',V3=()=>new THREE.Vector3(),C=()=>new THREE.Color();
const INKS={DEF,v:{},u:{
 on:{value:0},               // estilo tinta encendido (lo pone el juego / el editor)
 tones:{value:V3()},th:{value:V3()},
 wSticks:{value:0},wModel:{value:0},outCol:{value:C()},
 wash:{value:new THREE.Vector4()},edge:{value:V3()},washPaper:{value:C()},washInk:{value:C()},washRed:{value:C()},redKeep:{value:1},washOn:{value:1},
 ash:{value:new THREE.Vector2()}
},listeners:[]};
const dflt=()=>{const o={};for(const d of DEF)o[d[0]]=d[4];return o};
function load(){INKS.v=dflt();try{Object.assign(INKS.v,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(_){}}
INKS.sync=function(){const v=INKS.v,u=INKS.u;
 u.tones.value.set(v.tShadow,v.tMid,v.tLight);u.th.value.set(v.th1,v.th2,v.soft);
 u.wSticks.value=v.wSticks;u.wModel.value=v.wModel;u.outCol.value.set(v.outCol);
 u.wash.value.set(v.washLo,v.washHi,v.grain,v.grainScale);u.edge.value.set(v.edge,v.edgeSoft,v.edgeStr);
 u.washPaper.value.set(v.washPaper);u.washInk.value.set(v.washInk);u.washRed.value.set(v.washRed);u.redKeep.value=v.redKeep;u.washOn.value=v.washOn?1:0;
 u.ash.value.set(v.ashEdge,v.ashGlow);
 for(const f of INKS.listeners)try{f(v)}catch(e){console.warn(e)}};
INKS.save=function(){const d=dflt(),o={};for(const k in INKS.v)if(INKS.v[k]!==d[k])o[k]=INKS.v[k];try{Object.keys(o).length?localStorage.setItem(KEY,JSON.stringify(o)):localStorage.removeItem(KEY)}catch(_){}};
INKS.set=function(k,val){INKS.v[k]=val;INKS.sync();INKS.save()};
INKS.reset=function(){INKS.v=dflt();INKS.sync();INKS.save()};
INKS.json=function(){const d=dflt(),o={};for(const k in INKS.v)if(INKS.v[k]!==d[k])o[k]=INKS.v[k];return JSON.stringify(o)};
INKS.onChange=f=>{INKS.listeners.push(f)};
/* sombreado en 3 tonos para cualquier MeshLambertMaterial (lo usan el juego y shaders.html): se inyecta tras calcular la luz;
   li = cuánta luz recibe (1 = luz de cielo normal) → sombra / medio / iluminado con dos cortes nítidos. Uniforms compartidos: no recompila. */
INKS.patch=function(m){if(!m||m.__ink||!m.isMeshLambertMaterial)return;m.__ink=1;const ob=m.onBeforeCompile,key=m.customProgramCacheKey();
 m.onBeforeCompile=function(sh,r){ob.call(this,sh,r);sh.uniforms.inkOn=INKS.u.on;sh.uniforms.inkTones=INKS.u.tones;sh.uniforms.inkTh=INKS.u.th;if(sh.fragmentShader.indexOf('inkOn')>=0)return;
  sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nuniform float inkOn;uniform vec3 inkTones,inkTh;').replace('#include <aomap_fragment>','#include <aomap_fragment>\n'+
  'if(inkOn>.5){vec3 lt=(reflectedLight.directDiffuse+reflectedLight.indirectDiffuse)/max(BRDF_Diffuse_Lambert(diffuseColor.rgb),vec3(1e-4));float li=dot(lt,vec3(.299,.587,.114))/PI;'+
  'float q=mix(inkTones.x,inkTones.y,smoothstep(inkTh.x-inkTh.z,inkTh.x+inkTh.z,li));q=mix(q,inkTones.z,smoothstep(inkTh.y-inkTh.z,inkTh.y+inkTh.z,li));reflectedLight.directDiffuse=diffuseColor.rgb*q;reflectedLight.indirectDiffuse=vec3(0.);}')};
 m.customProgramCacheKey=()=>key+'|ink';m.needsUpdate=true};
INKS.scan=function(scene){scene.traverse(o=>{const m=o.material;if(Array.isArray(m))m.forEach(INKS.patch);else INKS.patch(m)})};
// zombi en tinta: gris que conserva un poco la luminosidad de su color (eBase, eVar)
INKS.tone=function(c,out){const v=INKS.v,l=c.r*.3+c.g*.59+c.b*.11,b=v.eBase,k=v.eVar;return out.setRGB(b+k*l,b*.93+k*.9*l,b*.87+k*.85*l)};
// otra pestaña (el editor) cambió los ajustes: se ven al momento
window.addEventListener('storage',e=>{if(e.key===KEY){load();INKS.sync()}});
load();INKS.sync();window.INKS=INKS;
})();
