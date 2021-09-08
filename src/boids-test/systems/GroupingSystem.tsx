import { FC } from 'react'
import { useQuery, useSystem } from '@react-ecs/core'
import { ThreeView } from '@react-ecs/three'
import { Acceleration, Boid, Velocity } from '../facets'
import { settings } from '../settings'
import { Vector3 } from 'three/src/math/Vector3'

export type GroupingSystemProps = {
  weight: number
}

export const GroupingSystem: FC<GroupingSystemProps> = ({ weight }) => {
    const query = useQuery(e => e.hasAll(ThreeView, Boid, Velocity, Acceleration))

    return useSystem(dt => {
        query.loop([ThreeView, Boid, Velocity, Acceleration], (currentEntity, [view, boid, {velocity}, {acceleration}]) => {

            if (boid.flockmates.length > 0) {
                const accumulatedFlockPosition = new Vector3(0,0,0)

                for (const flockmate of boid.flockmates) {
                    const otherPosition = flockmate.get(ThreeView)?.object3d.position
                    if (otherPosition)
                        accumulatedFlockPosition.add(otherPosition)
                }

                const averageFlockPosition = accumulatedFlockPosition.divideScalar(boid.flockmates.length)
                const toAverage = averageFlockPosition.sub(view.object3d.position).setLength(settings.maxSpeed)

                const steerForce = toAverage
                    .sub(velocity)
                    .clampLength(0, settings.maxSteerForce)

                const weightedSteerForce = steerForce.multiplyScalar(weight)

                acceleration.add(weightedSteerForce)
            }
        })
    })
}