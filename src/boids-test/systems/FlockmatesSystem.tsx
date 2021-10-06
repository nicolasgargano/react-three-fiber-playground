import { FC } from "react"
import { useQuery, useSystem } from "@react-ecs/core"
import { ThreeView } from "@react-ecs/three"
import { Boid } from "../facets"
import { Entity } from "tick-knock"

export type FlockmatesSystemProps = {
  radius: number
}

export const FlockmatesSystem: FC<FlockmatesSystemProps> = ({ radius }) => {
  const query = useQuery(e => e.hasAll(ThreeView, Boid))

  return useSystem(dt => {
    query.loop([ThreeView, Boid], (currentEntity, [view, boid]) => {
      const transform = view.object3d

      const insideRadius = (other: Entity): boolean => {
        const otherPos = other.get(ThreeView)?.object3d.position
        return otherPos
          ? transform.position.distanceTo(otherPos) <= radius
          : false
      }

      boid.flockmates = query.entities
        .filter((other: Entity) => other.id !== currentEntity.id)
        .filter(insideRadius)
    })
  })
}
