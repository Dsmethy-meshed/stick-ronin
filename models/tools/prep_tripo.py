# Prepara el zombi de Tripo para Stick Ronin: esqueleto simple, menos triángulos, textura pequeña y clips para el editor
import bpy,sys,json,math,mathutils
src,out_glb,out_json,target_tris=sys.argv[-4],sys.argv[-3],sys.argv[-2],int(sys.argv[-1])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
for o in list(bpy.data.objects):
    if o.type=='MESH' and not o.vertex_groups:bpy.data.objects.remove(o)
arm=[o for o in bpy.data.objects if o.type=='ARMATURE'][0]
mesh=[o for o in bpy.data.objects if o.type=='MESH'][0]
KEEP=['Hip','Pelvis','Waist','Spine01','Spine02','NeckTwist01','Head','L_Clavicle','L_Upperarm','L_Forearm','L_Hand','R_Clavicle','R_Upperarm','R_Forearm','R_Hand','L_Thigh','L_Calf','L_Foot','R_Thigh','R_Calf','R_Foot']
# ---------- 1) clips (antes de tocar el esqueleto) ----------
def J_at():
    dg=bpy.context.evaluated_depsgraph_get();ae=arm.evaluated_get(dg);M=ae.matrix_world;P=ae.pose.bones
    h=lambda n:M@P[n].head;t=lambda n:M@P[n].tail
    pts={'head':(h('Head')+t('Head'))/2,'neck':h('NeckTwist01'),'chest':h('Spine01'),'pel':h('Hip'),
         'eL':h('L_Forearm'),'hL':h('L_Hand'),'eR':h('R_Forearm'),'hR':h('R_Hand'),
         'kL':h('L_Calf'),'fL':h('L_Foot'),'kR':h('R_Calf'),'fR':h('R_Foot')}
    return pts
K=1.96 # escala modelo -> juego (torso 0,265 -> 0,52)
def toLocal(v):return [round(-v.x*K,3),round(v.z*K,3),round(-v.y*K,3)]
clips={}
sc=bpy.context.scene;fps=sc.render.fps/sc.render.fps_base
for act in list(bpy.data.actions):
    name=act.name.split('.')[0]
    arm.animation_data_create();arm.animation_data.action=act
    try:
        if hasattr(act,'slots') and act.slots:arm.animation_data.action_slot=act.slots[0]
    except Exception:pass
    f0,f1=int(act.frame_range[0]),int(act.frame_range[1]);step=max(1,round((f1-f0)/24))
    keys=[]
    frames=list(range(f0,f1+1,step))
    if frames[-1]!=f1:frames.append(f1)
    base=None
    for f in frames:
        sc.frame_set(f);pts=J_at()
        if base is None:base=mathutils.Vector((pts['pel'].x,pts['pel'].y,0))
        p={k:toLocal(v-base) for k,v in pts.items()}
        keys.append({'t':round((f-f0)/fps,3),'ease':'linear','p':p,'blade':[0,1,0],'root':[0,0,0],'ry':0,'rx':0,'rz':0,'we':0,'wo':[0,0,0]})
    clips[name]={'dur':round((f1-f0)/fps,3),'loop':False,'keys':keys}
    print('CLIP',name,len(keys),'keys',clips[name]['dur'],'s')
arm.animation_data.action=None
for pb in arm.pose.bones:pb.matrix_basis=mathutils.Matrix()
with open(out_json,'w',encoding='utf-8') as f:json.dump(clips,f)
# ---------- 2) pesos de los huesos que sobran -> su hueso conservado más cercano hacia arriba ----------
bones=arm.data.bones
def keeper(name):
    b=bones[name]
    while b and b.name not in KEEP:b=b.parent
    return b.name if b else 'Hip'
vg={g.name:g for g in mesh.vertex_groups}
for g in list(mesh.vertex_groups):
    if g.name in KEEP:continue
    dst=keeper(g.name)
    if dst not in vg:vg[dst]=mesh.vertex_groups.new(name=dst)
    D=vg[dst]
    for v in mesh.data.vertices:
        for ge in v.groups:
            if ge.group==g.index and ge.weight>0:D.add([v.index],ge.weight,'ADD')
for g in list(mesh.vertex_groups):
    if g.name not in KEEP:mesh.vertex_groups.remove(g)
bpy.context.view_layer.objects.active=arm;bpy.ops.object.mode_set(mode='EDIT')
for eb in list(arm.data.edit_bones):
    if eb.name not in KEEP:arm.data.edit_bones.remove(eb)
bpy.ops.object.mode_set(mode='OBJECT')
# ---------- 3) menos triángulos ----------
tris=sum(len(p.vertices)-2 for p in mesh.data.polygons)
bpy.context.view_layer.objects.active=mesh
mods=[m for m in mesh.modifiers if m.type=='ARMATURE']
d=mesh.modifiers.new('dec','DECIMATE');d.ratio=min(1,target_tris/tris);d.use_collapse_triangulate=True
# el decimate tiene que ir antes que el armature
while mesh.modifiers[0].name!='dec':bpy.ops.object.modifier_move_up(modifier='dec')
bpy.ops.object.modifier_apply(modifier='dec')
# normaliza pesos y limita a 4 influencias
bpy.ops.object.vertex_group_limit_total(limit=4);bpy.ops.object.vertex_group_normalize_all(lock_active=False)
tris2=sum(len(p.vertices)-2 for p in mesh.data.polygons)
print('TRIS',tris,'->',tris2,'BONES',len(arm.data.bones))
# ---------- 4) sin textura: color plano (el juego pone el color de cada enemigo) ----------
for m in bpy.data.materials:
    if m.use_nodes:
        for n in list(m.node_tree.nodes):
            if n.type=='TEX_IMAGE':m.node_tree.nodes.remove(n)
for im in list(bpy.data.images):bpy.data.images.remove(im)
# sin animaciones en el GLB del juego
for a in list(bpy.data.actions):bpy.data.actions.remove(a)
bpy.ops.export_scene.gltf(filepath=out_glb,export_format='GLB',export_animations=False,export_image_format='JPEG',export_jpeg_quality=80,export_skins=True,export_morph=False,export_apply=False,use_selection=False)
print('OK',out_glb)
