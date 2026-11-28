# Stick Ronin · pose de reposo para modelos de Mixamo antes de prepararlos (la usa prep_tripo.py con 'apose=…' y 'fist=…')
# - apose: baja los brazos desde la pose en T (grados). En el juego los brazos van ~55° hacia abajo: con el reposo cerca de eso
#   la mezcla de 2 tramos no pellizca el hombro.
# - fist: cierra los dedos para que la mano agarre la katana. 'fist' es el giro de referencia (grados); cada falange gira
#   distinto (la del medio más) y el pulgar se dobla por encima de los dedos.
#
# Cómo se cierra el puño (28 nov 2026, tras dos intentos fallidos):
# - Girar cada falange sobre SU eje X no sirve en este rig: la mano izquierda se cerraba hacia el dorso y, en la derecha, cada dedo
#   tiene el hueso girado distinto (el índice dobla con Z, el meñique con −X…) y salían ganchos hacia los lados.
# - Ahora el puño se cierra ANTES de bajar los brazos, en la pose en T, donde las palmas miran hacia ABAJO (el pulgar apunta hacia
#   delante). Cada falange gira alrededor de (dirección del dedo × abajo): por la regla de la mano derecha eso la dobla siempre hacia
#   la palma, tenga el hueso el giro que tenga. Después se bajan los brazos y la mano cerrada los acompaña.
import bpy,math,mathutils
FIST_J=(1.05,1.25,.85)   # proporción del giro de cada falange (1 = base, 2 = media, 3 = punta)
PALM_T=mathutils.Vector((0,0,-1))   # palmas en la pose en T (mundo de Blender, Z arriba)
def _rot_arm_space(arm,pb,axis_world,ang):
    M=arm.matrix_world.to_3x3();ax=(M.inverted()@mathutils.Vector(axis_world)).normalized()
    head=pb.matrix.to_translation();R=mathutils.Matrix.Rotation(ang,4,ax)
    pb.matrix=mathutils.Matrix.Translation(head)@R@mathutils.Matrix.Translation(-head)@pb.matrix
    bpy.context.view_layer.update()
def _axis(arm,pb,palm=PALM_T):
    # eje del dedo: se calcula UNA vez con la primera falange sin doblar y vale para las tres (si se recalculara con la falange ya
    # doblada, que apunta casi hacia la palma, el producto saldría casi nulo y el dedo se cerraría a medias: medido 0,043 m)
    M=arm.matrix_world;d=(M@pb.tail-M@pb.head).normalized();ax=d.cross(palm)
    return ax.normalized() if ax.length>1e-6 else None
def apply_rest_pose(arm,apose=0,fist=0,thumb_in=25,thumb_curl=.7):
    P=arm.pose.bones;mx=lambda n:'mixamorig:'+n
    if fist:
        f=math.radians(fist)
        for side in('Left','Right'):
            for fin in('Index','Middle','Ring','Pinky'):
                b1=mx(side+'Hand'+fin+'1')
                if b1 not in P:continue
                ax=_axis(arm,P[b1])
                if ax is None:continue
                for j in(1,2,3):
                    n=mx(side+'Hand'+fin+str(j))
                    if n in P:_rot_arm_space(arm,P[n],ax,f*FIST_J[j-1])
            # pulgar: la base baja un poco hacia la palma y las dos falanges se doblan por encima de los dedos (mismo eje para las tres)
            t1=mx(side+'HandThumb1')
            if t1 in P:
                ax=_axis(arm,P[t1])
                if ax is not None:
                    _rot_arm_space(arm,P[t1],ax,math.radians(thumb_in))
                    for j in(2,3):
                        n=mx(side+'HandThumb'+str(j))
                        if n in P:_rot_arm_space(arm,P[n],ax,f*thumb_curl)
    if apose:
        a=math.radians(apose)
        # brazo izquierdo (+X del modelo) baja girando alrededor de Y; el derecho al revés
        _rot_arm_space(arm,P[mx('LeftArm')],(0,1,0),a)
        _rot_arm_space(arm,P[mx('RightArm')],(0,1,0),-a)
def bake_pose(mesh):
    # deja la malla deformada por el esqueleto como forma fija (la pose pasa a ser el reposo)
    bpy.context.view_layer.objects.active=mesh;mesh.select_set(True)
    for m in list(mesh.modifiers):
        if m.type=='ARMATURE':bpy.ops.object.modifier_apply(modifier=m.name)
