import { Vector3 } from 'three'
import { Vec3 } from 'cannon-es'
import Prando from 'prando'
import { nonEmptyArray } from 'fp-ts'

export const toVec3 = (vector3: Vector3) : Vec3 => new Vec3(vector3.x, vector3.y, vector3.z)
export const toVector3 = (vec3: Vec3) : Vector3 => new Vector3(vec3.x, vec3.y, vec3.z)

export const generateRandomStartingConditions = (seed: number, amountOfBoids: number, worldSize: number) : [Vector3, Vector3][] => {
    const rng = new Prando(seed)
    return nonEmptyArray.range(1, amountOfBoids).map(_ => {
        const x = rng.next(-worldSize, worldSize)
        const y = rng.next(-worldSize, worldSize)
        const z = rng.next(-worldSize, worldSize)
        const pos = new Vector3(x,y,z)

        const vx = rng.next(-1, 1)
        const vy = rng.next(-1, 1)
        const vz = rng.next(-1, 1)
        const speed = rng.next(0, 6)
        const vel = new Vector3(vx,vy,vz).normalize().multiplyScalar(speed)

        return ([pos, vel])
    })
}