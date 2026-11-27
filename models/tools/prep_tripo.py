# Stick Ronin · prepara un modelo de Tripo (con rig) como PIEZAS RÍGIDAS pegadas a los 12 puntos del juego.
# Uso: blender -b --factory-startup --python prep_tripo.py -- entrada.glb salida.glb salida_rig.json [triangulos]
# - Baja la malla a N triángulos y quita las texturas (el juego pone el color de cada enemigo).
# - Una sola malla: cada vértice guarda en su color (zm) sus 2 tramos y la proporción (se deforma en el shader del juego).
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
# tramos de cada vértice: los dos con más peso (del rig de Tripo) y la proporción entre ellos
ORDER=[(3,2),(2,1),(1,0),(1,4),(4,5),(1,6),(6,7),(3,8),(8,9),(3,10),(10,11)]
gname={vg.index:vg.name for vg in mesh.vertex_groups}
me=mesh.data
if 'zm' in me.color_attributes:me.color_attributes.remove(me.color_attributes['zm'])
ca=me.color_attributes.new(name='zm',type='FLOAT_COLOR',domain='POINT')
for v in me.vertices:
    acc={}
    for ge in v.groups:
        sg=segOf(gname[ge.group]);acc[sg]=acc.get(sg,0)+ge.weight
    if not acc:acc={(3,2):1}
    top=sorted(acc.items(),key=lambda kv:-kv[1])[:2]
    a=ORDER.index(top[0][0]);wa=top[0][1]
    if len(top)>1:b=ORDER.index(top[1][0]);wb=top[1][1]
    else:b=a;wb=0
    t=wa+wb;wa=wa/t if t>0 else 1
    ca.data[v.index].color=(a/10.0,b/10.0,wa,1.0)
me.color_attributes.active_color=ca
# quita texturas
for m in bpy.data.materials:
    if m.use_nodes:
        for n in list(m.node_tree.nodes):
            if n.type=='TEX_IMAGE':m.node_tree.nodes.remove(n)
for im in list(bpy.data.images):bpy.data.images.remove(im)
for vg_ in list(mesh.vertex_groups):mesh.vertex_groups.remove(vg_)
mesh.name='zombie_body';bpy.data.objects.remove(arm)
bpy.ops.object.select_all(action='DESELECT');mesh.select_set(True)
kw=dict(filepath=out_glb,export_format='GLB',use_selection=True,export_animations=False,export_skins=False,export_morph=False,export_materials='NONE')
try:bpy.ops.export_scene.gltf(**kw,export_vertex_color='ACTIVE')
except TypeError:bpy.ops.export_scene.gltf(**kw,export_colors=True)
json.dump({'RJ':[g(v) for v in RJ],'root':{k:g(v) for k,v in ROOT.items()},'tris':sum(len(p.vertices)-2 for p in me.polygons),'order':[list(o) for o in ORDER]},open(out_json,'w'))
print('OK',out_glb,'vertices',len(me.vertices))
