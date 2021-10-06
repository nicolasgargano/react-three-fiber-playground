import { FC } from "react"
import { useQuery, useSystem } from "@react-ecs/core"
import { Acceleration, Boid, Velocity } from "../facets"
import { Vector3 } from "three/src/math/Vector3"
import { settings } from "../settings"

export const ClampVelocitySystem: FC = () => {
  const query = useQuery(e => e.hasAll(Boid, Velocity))
  const zero = new Vector3(0, 0, 0)

  return useSystem(_ => {
    query.loop([Boid, Velocity, Velocity], (e, [_, { velocity }]) => {
      velocity.clampLength(settings.minSpeed, settings.maxSpeed)
    })
  })
}
