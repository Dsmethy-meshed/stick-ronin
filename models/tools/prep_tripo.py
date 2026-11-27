# Stick Ronin · prepara un modelo de Tripo (con rig) como PIEZAS RÍGIDAS pegadas a los 12 puntos del juego.
# Uso: blender -b --factory-startup --python prep_tripo.py -- entrada.glb salida.glb salida_rig.json [triangulos]
# - Baja la malla a N triángulos y quita las texturas (el juego pone el color de cada enemigo).
# - Reparte cada cara en el tramo (a-b) de su hueso dominante y exporta 11 mallas "seg_a_b" sin esqueleto.
# - Guarda en el JSON los 12 puntos de reposo y los puntos raíz de brazos y piernas (en coordenadas Y-arriba del juego).
import bpy,bmesh,sys,json,mathutils
a=sys.argv[sys.argv.index('--')+1:]
src,out_glb,out_json=a[0],a[1],a[2];target=int(a[3]) if len(a)>3 else 1500
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
for o in list(bpy.data.objects):
    if o.type=='MESH' and not o.vertex_groups:bpy.data.objects.remove(o)
arm=[o for o in bpy.data.objects if o.type=='ARMATURE'][0]
mesh=[o for o in bpy.data.objects if o.type=='MESH'][0]
if arm.animation_data:arm.animation_data.action=None
for pb in arm.pose.bones:pb.matrix_basis=mathutils.Matrix()
B=arm.data.bones;M=arm.matrix_world
def H(n):return M@B[n].head_local
def T(n):return M@B[n].tail_local
# hueso del rig de Tripo -> tramo del juego (a=punto de anclaje, b=punto al que apunta)
SEG={'Hip':(3,2),'Pelvis':(3,2),'Waist':(3,2),'BoneRoot':(3,2),
 'Spine01':(2,1),'Spine02':(2,1),'L_Clavicle':(2,1),'R_Clavicle':(2,1),
 'NeckTwist01':(1,0),'NeckTwist02':(1,0),'Head':(1,0),'FacialBone':(1,0),'L_Eye':(1,0),'R_Eye':(1,0),
 'L_Upperarm':(1,4),'L_UpperarmTwist01':(1,4),'L_UpperarmTwist02':(1,4),'L_ElbowShareBone':(4,5),'L_Forearm':(4,5),'L_ForearmTwist01':(4,5),'L_ForearmTwist02':(4,5),'L_Hand':(4,5),
 'R_Upperarm':(1,6),'R_UpperarmTwist01':(1,6),'R_UpperarmTwist02':(1,6),'R_ElbowShareBone':(6,7),'R_Forearm':(6,7),'R_ForearmTwist01':(6,7),'R_ForearmTwist02':(6,7),'R_Hand':(6,7),
 'L_Thigh':(3,8),'L_ThighTwist01':(3,8),'L_ThighTwist02':(3,8),'L_KneeShareBone':(8,9),'L_Calf':(8,9),'L_CalfTwist01':(8,9),'L_CalfTwist02':(8,9),'L_Foot':(8,9),'L_ToeBase':(8,9),
 'R_Thigh':(3,10),'R_ThighTwist01':(3,10),'R_ThighTwist02':(3,10),'R_KneeShareBone':(10,11),'R_Calf':(10,11),'R_CalfTwist01':(10,11),'R_CalfTwist02':(10,11),'R_Foot':(10,11),'R_ToeBase':(10,11)}
def segOf(name):
    b=B.get(name)
    while b and b.name not in SEG:b=b.parent
    if b:return SEG[b.name]
    if '_Hand' in name or name[2:] in('Index1','Index2','Index3','Mid1','Mid2','Mid3','Ring1','Ring2','Ring3','Pinky1','Pinky2','Pinky3','Thumb1','Thumb2','Thumb3'):return (4,5) if name.startswith('L_') else (6,7)
    return (3,2)
# 12 puntos de reposo y raíces de miembros (Blender Z-arriba -> juego Y-arriba: x, z, -y)
g=lambda v:[round(v.x,4),round(v.z,4),round(-v.y,4)]
RJ=[(H('Head')+T('Head'))/2,H('NeckTwist01'),H('Spine01'),H('Hip'),H('L_Forearm'),H('L_Hand'),H('R_Forearm'),H('R_Hand'),H('L_Calf'),H('L_Foot'),H('R_Calf'),H('R_Foot')]
ROOT={'1-4':H('L_Upperarm'),'1-6':H('R_Upperarm'),'3-8':H('L_Thigh'),'3-10':H('R_Thigh')}
# menos triángulos (en reposo, sin el modificador de esqueleto)
for m in list(mesh.modifiers):
    if m.type=='ARMATURE':mesh.modifiers.remove(m)
tris=sum(len(p.vertices)-2 for p in mesh.data.polygons)
bpy.context.view_layer.objects.active=mesh;mesh.select_set(True)
d=mesh.modifiers.new('dec','DECIMATE');d.ratio=min(1,target/tris);d.use_collapse_triangulate=True
bpy.ops.object.modifier_apply(modifier='dec')
mesh.data.transform(mesh.matrix_world);mesh.matrix_world=mathutils.Matrix()
# tramo de cada cara = tramo con más peso sumado en sus vértices
gname={vg.index:vg.name for vg in mesh.vertex_groups}
def vseg(v):
    best=None;bw=-1;acc={}
    for ge in v.groups:
        s=segOf(gname[ge.group]);acc[s]=acc.get(s,0)+ge.weight
    for s,w in acc.items():
        if w>bw:bw=w;best=s
    return best or (3,2)
vs=[vseg(v) for v in mesh.data.vertices]
faceSeg=[]
for p in mesh.data.polygons:
    acc={}
    for vi in p.vertices:acc[vs[vi]]=acc.get(vs[vi],0)+1
    faceSeg.append(max(acc,key=acc.get))
segs=sorted(set(faceSeg))
# quita texturas
for m in bpy.data.materials:
    if m.use_nodes:
        for n in list(m.node_tree.nodes):
            if n.type=='TEX_IMAGE':m.node_tree.nodes.remove(n)
for im in list(bpy.data.images):bpy.data.images.remove(im)
# una malla por tramo
outs=[]
for sg in segs:
    o=mesh.copy();o.data=mesh.data.copy();o.name='seg_%d_%d'%sg;bpy.context.scene.collection.objects.link(o)
    bm=bmesh.new();bm.from_mesh(o.data);bm.faces.ensure_lookup_table()
    bmesh.ops.delete(bm,geom=[f for f in bm.faces if faceSeg[f.index]!=sg],context='FACES')
    bm.to_mesh(o.data);bm.free();o.vertex_groups.clear();o.data.name=o.name;outs.append(o)
    print('PIEZA',o.name,len(o.data.polygons),'caras')
bpy.data.objects.remove(mesh);bpy.data.objects.remove(arm)
bpy.ops.object.select_all(action='DESELECT')
for o in outs:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=out_glb,export_format='GLB',use_selection=True,export_animations=False,export_skins=False,export_morph=False,export_materials='NONE')
json.dump({'RJ':[g(v) for v in RJ],'root':{k:g(v) for k,v in ROOT.items()},'tris':sum(len(o.data.polygons) for o in outs)},open(out_json,'w'))
print('OK',out_glb,'piezas',len(outs))
