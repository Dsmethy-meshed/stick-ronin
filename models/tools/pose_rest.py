# Stick Ronin · pose de reposo para modelos de Mixamo antes de prepararlos (la usa prep_tripo.py con 'apose=…' y 'fist=…')
# - apose: baja los brazos desde la pose en T (grados). En el juego los brazos van ~55° hacia abajo: con el reposo cerca de eso
#   la mezcla de 2 tramos no pellizca el hombro.
# - fist: cierra los dedos (grados por falange) para que la mano agarre la katana; el pulgar se cierra menos.
import bpy,math,mathutils
def _rot_arm_space(arm,pb,axis_world,ang):
    M=arm.matrix_world.to_3x3();ax=(M.inverted()@mathutils.Vector(axis_world)).normalized()
    head=pb.matrix.to_translation();R=mathutils.Matrix.Rotation(ang,4,ax)
    pb.matrix=mathutils.Matrix.Translation(head)@R@mathutils.Matrix.Translation(-head)@pb.matrix
    bpy.context.view_layer.update()
def _rot_local(arm,pb,ang,axis='X'):
    m=pb.matrix.to_3x3();ax={'X':m.col[0],'Z':m.col[2]}[axis].normalized()
    head=pb.matrix.to_translation();R=mathutils.Matrix.Rotation(ang,4,ax)
    pb.matrix=mathutils.Matrix.Translation(head)@R@mathutils.Matrix.Translation(-head)@pb.matrix
    bpy.context.view_layer.update()
def apply_rest_pose(arm,apose=0,fist=0,fist_sign=1):
    P=arm.pose.bones;mx=lambda n:'mixamorig:'+n
    if apose:
        a=math.radians(apose)
        # brazo izquierdo (+X del modelo) baja girando alrededor de Y; el derecho al revés
        _rot_arm_space(arm,P[mx('LeftArm')],(0,1,0),a)
        _rot_arm_space(arm,P[mx('RightArm')],(0,1,0),-a)
    if fist:
        f=math.radians(fist)*fist_sign
        for side in('Left','Right'):
            for fin in('Index','Middle','Ring','Pinky'):
                for j in(1,2,3):
                    n=mx(side+'Hand'+fin+str(j))
                    if n in P:_rot_local(arm,P[n],f)
            for j in(2,3):
                n=mx(side+'HandThumb'+str(j))
                if n in P:_rot_local(arm,P[n],f*.6)
def bake_pose(mesh):
    # deja la malla deformada por el esqueleto como forma fija (la pose pasa a ser el reposo)
    bpy.context.view_layer.objects.active=mesh;mesh.select_set(True)
    for m in list(mesh.modifiers):
        if m.type=='ARMATURE':bpy.ops.object.modifier_apply(modifier=m.name)
