import { Vector3 } from 'three'
import { Vec3 } from 'cannon-es'

export const toVec3 = (vector3: Vector3) : Vec3 => new Vec3(vector3.x, vector3.y, vector3.z)
export const toVector3 = (vec3: Vec3) : Vector3 => new Vector3(vec3.x, vec3.y, vec3.z)

export const capMagnitude = (vec3: Vec3, max: number): Vec3  =>
    vec3.length() > max
        ? vec3.clone().unit().scale(max)
        : vec3

export const capMagnitudeMutable = (vec3: Vec3, max: number): Vec3 =>
    vec3.length() > max
        ? vec3.unit(vec3).scale(max, vec3)
        : vec3