# Stick Rōnin · addon de Blender: pasa una animación de Mixamo a los 11 palos del juego (clip del editor de animaciones).
#
# Instalar: Blender → Editar → Preferencias → Complementos → (flecha) Instalar desde disco → este archivo.
# Usar: importa el FBX/GLB de Mixamo, selecciona el esqueleto y abre la barra lateral (N) → pestaña «Stick Rōnin».
#   Elige la acción, cada cuántos fotogramas poner una clave y pulsa «Copiar clip» (lo deja en el portapapeles) o «Guardar .json».
#   En editor.html → Importar, pega el JSON y pulsa Importar. Luego asígnalo a un arma y una tecla como cualquier clip.
# Sin ventana (lotes): blender -b --python stickronin_mixamo.py -- entrada.glb salida.json [acción] [paso] [ensitio|encuerpo] [girar]
#
# Cómo se pasa (retarget por direcciones): de cada fotograma se leen las posiciones de los huesos de Mixamo y se reconstruye el
# stickman con SUS medidas (cuello→cabeza 0,15; pelvis→cuello 0,55; brazo 0,3+0,3; pierna 0,47+0,47) siguiendo la dirección de
# cada hueso. Así los ángulos son los de Mixamo aunque el personaje tenga otras proporciones, y el IK del juego reproduce justo
# los codos y rodillas (se guardan como eL/eR/kL/kR). Altura: el pie más bajo del stickman se pone a la altura a la que Mixamo
# levanta el suyo sobre el reposo (escalada por la pierna): pies en el suelo y saltos conservados.
# Hoja del arma: con las dos manos juntas (agarre de katana) va de la mano izquierda a la derecha; si no, la última o la del reposo.
# Ejes: Blender (Z arriba, el personaje mira a −Y) → juego (Y arriba, mira a +Z) → local del stickman (x invertida, como toW).
bl_info={"name":"Stick Rōnin · Mixamo → palos","author":"Stick Rōnin","version":(1,0,0),"blender":(4,0,0),
 "location":"Vista 3D → barra lateral (N) → Stick Rōnin","description":"Convierte una animación de Mixamo en un clip de 11 palos para el editor del juego","category":"Animation"}
import bpy,json,math,sys,os
from mathutils import Vector

# medidas del stickman del juego (finishPose / IDLE_P)
L_HEAD,L_TORSO,CHEST_K,L_ARM,L_LEG=.15,.55,.58,.3,.47
IDLE_BLADE=(lambda v:[c/math.sqrt(sum(x*x for x in v)) for c in v])([.12,-.38,.92])
NEED=['Hips','Spine1','Spine2','Neck','Head','HeadTop_End','LeftArm','LeftForeArm','LeftHand','RightArm','RightForeArm','RightHand',
      'LeftUpLeg','LeftLeg','LeftFoot','RightUpLeg','RightLeg','RightFoot']

def find_prefix(arm):
    for b in arm.data.bones:
        if b.name.endswith('Hips'):return b.name[:-4]
    return None

def check_rig(arm):
    p=find_prefix(arm)
    if p is None:return None,'No encuentro el hueso Hips: ¿es un esqueleto de Mixamo?'
    miss=[n for n in NEED if p+n not in arm.pose.bones and n!='HeadTop_End']
    if miss:return None,'Faltan huesos: '+', '.join(miss)
    return p,None

def to_local(v,turn):
    # Blender (x,y,z) → juego (x, z, −y) → local del stickman (−x, y, z); «girar» = 180° si el personaje mira a +Y
    gx,gy,gz=v.x,v.z,-v.y
    if turn:gx,gz=-gx,-gz
    return Vector((-gx,gy,gz))

def r4(v):return [round(c,4) for c in v]

def sample_pose(arm,p,turn,k_leg):
    M=arm.matrix_world;PB=arm.pose.bones
    H=lambda n:to_local(M@PB[p+n].head,turn)
    def top():
        if p+'HeadTop_End' in PB:return H('HeadTop_End')
        b=PB[p+'Head'];return to_local(M@b.tail,turn)
    d=lambda a,b:(b-a).normalized() if (b-a).length>1e-6 else Vector((0,1,0))
    hips=H('Hips');pel=Vector((hips.x*k_leg,hips.y*k_leg,hips.z*k_leg))
    chest=pel+d(H('Hips'),H('Spine2'))*(L_TORSO*CHEST_K)
    neck=chest+d(H('Spine2'),H('Neck'))*(L_TORSO*(1-CHEST_K))
    hm=(H('Head')+top())/2;head=neck+d(H('Neck'),hm)*L_HEAD
    out={'head':head,'neck':neck,'pel':pel,'chest':chest}
    for s,a,f in(('L','Left','Left'),('R','Right','Right')):
        e=neck+d(H(a+'Arm'),H(a+'ForeArm'))*L_ARM;h=e+d(H(a+'ForeArm'),H(a+'Hand'))*L_ARM
        kn=pel+d(H(f+'UpLeg'),H(f+'Leg'))*L_LEG;ft=kn+d(H(f+'Leg'),H(f+'Foot'))*L_LEG
        out['e'+s]=e;out['h'+s]=h;out['k'+s]=kn;out['f'+s]=ft
    # altura del pie más bajo de Mixamo (Blender Z) para apoyar el stickman igual
    foot=min((M@PB[p+'LeftFoot'].head).z,(M@PB[p+'RightFoot'].head).z)
    return out,foot

def leg_scale(arm,p):
    # longitud de la pierna en reposo (media de las dos) → escala Mixamo→stickman; y altura del tobillo en reposo
    M=arm.matrix_world;B=arm.data.bones;hl=lambda n:M@B[p+n].head_local
    lm=sum(((hl(s+'UpLeg')-hl(s+'Leg')).length+(hl(s+'Leg')-hl(s+'Foot')).length) for s in('Left','Right'))/2
    return (2*L_LEG/lm if lm>1e-6 else 1),min(hl('LeftFoot').z,hl('RightFoot').z)

def set_action(arm,act):
    ad=arm.animation_data or arm.animation_data_create()
    saved=(ad.action,[(t,t.mute) for t in ad.nla_tracks])
    for t in ad.nla_tracks:t.mute=True
    ad.action=act
    try:
        if hasattr(ad,'action_slot') and act and len(getattr(act,'slots',[]))>0 and ad.action_slot is None:ad.action_slot=act.slots[0]
    except Exception:pass
    return saved

def restore_action(arm,saved):
    ad=arm.animation_data;ad.action=saved[0]
    for t,m in saved[1]:t.mute=m

GRIP_D=.36  # manos más cerca que esto (medidas del stickman) = agarre a dos manos
def build_clip(arm,act,step=2,mode='ensitio',turn=False,loop=False,name=None,weapon='katana',blade='auto'):
    p,err=check_rig(arm)
    if err:raise RuntimeError(err)
    sc=bpy.context.scene;fps=sc.render.fps/sc.render.fps_base
    saved=set_action(arm,act);f0,f1=[int(round(x)) for x in act.frame_range];keep=sc.frame_current
    try:
        k,ank=leg_scale(arm,p);frames=list(range(f0,f1+1,max(1,step)))
        if frames[-1]!=f1:frames.append(f1)
        keys=[];base=None;last_bl=None
        for f in frames:
            sc.frame_set(f);P,foot=sample_pose(arm,p,turn,k)
            # agarre a dos manos: la hoja va de la mano izquierda (pomo) a la derecha (guarda) de los palos, que es lo que se ve
            grip=P['hR']-P['hL'];two=grip.length<GRIP_D
            bl=r4(grip.normalized()) if (blade=='manos' or blade=='auto' and two) and grip.length>1e-4 else (last_bl if blade=='auto' and last_bl else r4(IDLE_BLADE))
            last_bl=bl
            if base is None:base=P['pel'].copy()
            # desplazamiento horizontal: en el sitio (se quita en cada fotograma) o en el cuerpo (solo se quita el del inicio)
            off=Vector((P['pel'].x,0,P['pel'].z)) if mode=='ensitio' else Vector((base.x,0,base.z))
            for j in P:P[j]=P[j]-off
            # apoyo: el pie más bajo del stickman a la altura (escalada) a la que Mixamo levanta el suyo sobre su reposo
            up=Vector((0,max(0.,(foot-ank)*k)-min(P['fL'].y,P['fR'].y),0))
            for j in P:P[j]=P[j]+up
            keys.append({'t':round((f-f0)/fps,3),'ease':'lin','p':{j:r4(v) for j,v in P.items()},'blade':bl,'root':[0,0,0],'ry':0})
    finally:
        restore_action(arm,saved);sc.frame_set(keep)
    dur=max(.1,keys[-1]['t'])
    return {'name':(name or act.name)[:60],'dur':round(dur,3),'loop':bool(loop),'weapon':weapon,'keys':keys,
            'hurt':{'r':.3,'h':1.8},'hits':[],'slot':'none','live':False,'fx':[],'src':'mixamo'}

# ---------- interfaz ----------
def act_items(self,ctx):
    return [(a.name,a.name,'') for a in bpy.data.actions] or [('','(sin acciones)','')]
WEAPONS=['katana','maza','nito','odachi','naginata','yari','kusarigama','tessen','kama','tanegashima','yumi','shuriken']
class SRM_Props(bpy.types.PropertyGroup):
    action:bpy.props.EnumProperty(name='Acción',items=act_items)
    step:bpy.props.IntProperty(name='Clave cada',default=2,min=1,max=30,description='Fotogramas entre claves')
    mode:bpy.props.EnumProperty(name='Desplazamiento',items=[('ensitio','En el sitio','Quita el avance de la cadera: el cuerpo no se mueve'),('encuerpo','En el cuerpo','El cuerpo avanza dentro del clip (el jugador no se mueve)')])
    turn:bpy.props.BoolProperty(name='Girar 180°',description='Si el personaje mira a +Y en Blender')
    loop:bpy.props.BoolProperty(name='Ciclo',description='Animación en bucle (andar, correr…)')
    weapon:bpy.props.EnumProperty(name='Arma',items=[(w,w,'') for w in WEAPONS])
    blade:bpy.props.EnumProperty(name='Hoja',items=[('auto','Auto','Con las manos juntas, de la izquierda a la derecha; si se separan, mantiene la última'),
        ('manos','Dos manos','Siempre de la mano izquierda a la derecha'),('fija','Fija','La del reposo del juego (luego se ajusta en el editor)')])
    name:bpy.props.StringProperty(name='Nombre',description='Vacío = nombre de la acción')

def _arm(ctx):
    o=ctx.active_object
    if o and o.type=='ARMATURE':return o
    if o and o.parent and o.parent.type=='ARMATURE':return o.parent
    return next((x for x in ctx.scene.objects if x.type=='ARMATURE'),None)

def _clip(ctx):
    S=ctx.scene.srm_props;arm=_arm(ctx)
    if not arm:raise RuntimeError('Selecciona el esqueleto de Mixamo')
    act=bpy.data.actions.get(S.action)
    if not act:raise RuntimeError('Elige una acción')
    return build_clip(arm,act,S.step,S.mode,S.turn,S.loop,S.name or None,S.weapon,S.blade)

class SRM_OT_copy(bpy.types.Operator):
    bl_idname='srm.copy_clip';bl_label='Copiar clip';bl_description='Copia el clip (JSON del editor) al portapapeles'
    def execute(self,ctx):
        try:c=_clip(ctx)
        except Exception as e:self.report({'ERROR'},str(e));return{'CANCELLED'}
        ctx.window_manager.clipboard=json.dumps({'anims':[c]},separators=(',',':'))
        self.report({'INFO'},'Clip copiado: %d claves, %.2f s. Pégalo en editor.html → Importar'%(len(c['keys']),c['dur']));return{'FINISHED'}

class SRM_OT_save(bpy.types.Operator):
    bl_idname='srm.save_clip';bl_label='Guardar .json';bl_description='Guarda el clip en un archivo'
    filepath:bpy.props.StringProperty(subtype='FILE_PATH')
    filter_glob:bpy.props.StringProperty(default='*.json',options={'HIDDEN'})
    def invoke(self,ctx,ev):
        S=ctx.scene.srm_props;self.filepath=(S.name or S.action or 'clip')+'.json';ctx.window_manager.fileselect_add(self);return{'RUNNING_MODAL'}
    def execute(self,ctx):
        try:c=_clip(ctx)
        except Exception as e:self.report({'ERROR'},str(e));return{'CANCELLED'}
        fp=self.filepath if self.filepath.lower().endswith('.json') else self.filepath+'.json'
        with open(fp,'w',encoding='utf-8') as f:json.dump({'anims':[c]},f,separators=(',',':'))
        self.report({'INFO'},'Guardado '+fp);return{'FINISHED'}

class SRM_OT_preview(bpy.types.Operator):
    bl_idname='srm.preview';bl_label='Ver palos';bl_description='Crea un stickman animado (objeto «SR_palos») junto al personaje para comparar'
    def execute(self,ctx):
        try:c=_clip(ctx)
        except Exception as e:self.report({'ERROR'},str(e));return{'CANCELLED'}
        make_preview(ctx,c,_arm(ctx));self.report({'INFO'},'Palos creados: reproduce la línea de tiempo');return{'FINISHED'}

ORDER=['head','neck','chest','pel','eL','hL','eR','hR','kL','fL','kR','fR']
BON=[(0,1),(1,2),(2,3),(1,4),(4,5),(1,6),(6,7),(3,8),(8,9),(3,10),(10,11)]
def make_preview(ctx,c,arm):
    # malla de 12 vértices y 11 aristas con una clave de forma por clave del clip, al lado del personaje (+1 m en X)
    old=bpy.data.objects.get('SR_palos')
    if old:bpy.data.objects.remove(old)
    back=lambda v:Vector((-v[0]+1,-v[2],v[1]))  # local → Blender
    me=bpy.data.meshes.new('SR_palos');me.from_pydata([back(c['keys'][0]['p'][j]) for j in ORDER],BON,[]);ob=bpy.data.objects.new('SR_palos',me);ctx.scene.collection.objects.link(ob)
    ob.shape_key_add(name='base');sc=ctx.scene;fps=sc.render.fps/sc.render.fps_base;f0=int(bpy.data.actions[ctx.scene.srm_props.action].frame_range[0])
    ks=[]
    for i,k in enumerate(c['keys']):
        sk=ob.shape_key_add(name='k%d'%i,from_mix=False)
        for vi,j in enumerate(ORDER):sk.data[vi].co=back(k['p'][j])
        ks.append((sk,f0+k['t']*fps))
    for i,(sk,f) in enumerate(ks):
        for g,ff in((0,ks[i-1][1] if i else None),(1,f),(0,ks[i+1][1] if i+1<len(ks) else None)):
            if ff is None:continue
            sk.value=g;sk.keyframe_insert('value',frame=ff)
    return ob

class SRM_PT_panel(bpy.types.Panel):
    bl_label='Mixamo → palos';bl_space_type='VIEW_3D';bl_region_type='UI';bl_category='Stick Rōnin'
    def draw(self,ctx):
        S=ctx.scene.srm_props;l=self.layout;arm=_arm(ctx)
        if not arm:l.label(text='Selecciona el esqueleto de Mixamo',icon='ERROR');return
        p,err=check_rig(arm)
        l.label(text=arm.name,icon='ARMATURE_DATA')
        if err:l.label(text=err,icon='ERROR');return
        l.prop(S,'action');l.prop(S,'step');l.prop(S,'mode');l.prop(S,'turn');l.prop(S,'loop');l.prop(S,'weapon');l.prop(S,'blade');l.prop(S,'name')
        col=l.column(align=True);col.scale_y=1.3;col.operator('srm.copy_clip',icon='COPYDOWN');col.operator('srm.save_clip',icon='FILE_TICK');col.operator('srm.preview',icon='OUTLINER_OB_MESH')

CLASSES=(SRM_Props,SRM_OT_copy,SRM_OT_save,SRM_OT_preview,SRM_PT_panel)
def register():
    for c in CLASSES:bpy.utils.register_class(c)
    bpy.types.Scene.srm_props=bpy.props.PointerProperty(type=SRM_Props)
def unregister():
    del bpy.types.Scene.srm_props
    for c in reversed(CLASSES):bpy.utils.unregister_class(c)

# ---------- sin ventana ----------
def cli(argv):
    src,out=argv[0],argv[1];rest=argv[2:];act_name=None;step=2;mode='ensitio';turn=False
    for t in rest:
        if t.isdigit():step=int(t)
        elif t in('ensitio','encuerpo'):mode=t
        elif t=='girar':turn=True
        else:act_name=t
    bpy.ops.wm.read_factory_settings(use_empty=True)
    if src.lower().endswith('.fbx'):bpy.ops.import_scene.fbx(filepath=src)
    else:bpy.ops.import_scene.gltf(filepath=src)
    arm=next(o for o in bpy.data.objects if o.type=='ARMATURE')
    acts=[a for a in bpy.data.actions if not act_name or act_name in a.name]
    clips=[build_clip(arm,a,step,mode,turn) for a in acts]
    with open(out,'w',encoding='utf-8') as f:json.dump({'anims':clips},f,separators=(',',':'))
    for c in clips:print('CLIP',c['name'],len(c['keys']),'claves',c['dur'],'s')

if __name__=='__main__':
    if '--' in sys.argv and bpy.app.background:cli(sys.argv[sys.argv.index('--')+1:])
    else:register()
