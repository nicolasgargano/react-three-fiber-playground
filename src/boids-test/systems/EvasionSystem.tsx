import { FC, useContext, useMemo } from "react"
import { useQuery, useSystem } from "@react-ecs/core"
import { ThreeView } from "@react-ecs/three"
import { Vec3 } from "cannon-es"
import * as Cannon from "cannon-es"
import { Acceleration, Boid, Velocity } from "../facets"
import { CannonContext } from "../CannonContext"
import { settings } from "../settings"
import { toVec3, toVector3 } from "../helpers"

export type EvasionSystemProps = {
  enabled: boolean
  weight: number
  collisionDistance: number
  amountOfRays: number
}

export const EvasionSystem: FC<EvasionSystemProps> = ({
  enabled,
  weight,
  collisionDistance,
  amountOfRays,
}) => {
  const cannonWorld = useContext(CannonContext)
  const query = useQuery(e => e.hasAll(Boid, ThreeView, Velocity, Acceleration))

  const evasionRays = useMemo(() => {
    return evasionDirections(amountOfRays).map(vec3 =>
      vec3.scale(collisionDistance),
    )
  }, [amountOfRays, collisionDistance])

  return useSystem(_ => {
    if (!enabled) return
    query.loop(
      [Boid, ThreeView, Velocity, Acceleration],
      (e, [_, { object3d }, { velocity }, { acceleration }]) => {
        const vec3Pos = toVec3(object3d.position)

        const rayCollides = (ray: Vec3) =>
          cannonWorld.raycastAny(vec3Pos, vec3Pos.clone().vadd(ray))

        const gonnaCollide = rayCollides(
          toVec3(
            velocity.clone().normalize().multiplyScalar(collisionDistance),
          ),
        )

        if (gonnaCollide) {
          // Get the rotation from the forward vector to the velocity (the boid forwards)
          const rot = new Cannon.Quaternion().setFromVectors(
            Vec3.UNIT_Z,
            toVec3(velocity),
          )

          for (const ray of evasionRays) {
            // quaternion * vec is equivalent to rotating the vector by that quaternion
            const testRay = rot.vmult(ray)

            if (!rayCollides(testRay)) {
              const steerForce = toVector3(testRay)
                .normalize()
                .multiplyScalar(settings.maxSpeed)
                .sub(velocity)
                .clampLength(0, settings.maxSteerForce)

              const weightedSteerForce = steerForce.multiplyScalar(weight)
              acceleration.add(weightedSteerForce)
              break
            }
          }
        }
      },
    )
  })
}

// Get unit vectors around a sphere,
// sampling from a spiral going from the front pole to the back pole.
export const evasionDirections = (amountOfRays: number): Vec3[] => {
  // Tau is the ratio constant of a circle's circumference to radius.
  // In radians, this means a full turn.
  const tau = Math.PI * 2

  // Phi is the golden ratio.
  // Two quantities are in the golden ratio
  //    if their ratio is the same as the ratio of their sum to the larger of the two quantities.
  // Phi is defined as (1 + sqrt(5)) / 2
  const goldenRatio = 1.618033988749895

  const rays = new Array<Vec3>(amountOfRays)

  const angleIncrement = tau * goldenRatio

  for (let i = 0; i < amountOfRays; i++) {
    const t = i / amountOfRays
    const inclination = Math.acos(1 - 2 * t)
    const azimuth = angleIncrement * i

    const x = Math.sin(inclination) * Math.cos(azimuth)
    const y = Math.sin(inclination) * Math.sin(azimuth)
    const z = Math.cos(inclination)

    rays[i] = new Vec3(x, y, z)
  }

  return rays
}
