import { FC } from 'react'
import { useQuery, useSystem } from '@react-ecs/core'
import { ThreeView } from '@react-ecs/three'
import { Acceleration, Boid, Velocity } from '../facets'
import { settings } from '../settings'
import { Vector3 } from 'three/src/math/Vector3'

export type AlignmentSystemProps = {
  weight: number
}

export const AlignmentSystem: FC<AlignmentSystemProps> = ({ weight }) => {
    const query = useQuery(e => e.hasAll(ThreeView, Boid, Velocity, Acceleration))

    return useSystem(dt => {
        query.loop([ThreeView, Boid, Velocity, Acceleration], (currentEntity, [view, boid, {velocity}, {acceleration}]) => {

            if (boid.flockmates.length > 0) {
                const accumulatedFlockVelocity = new Vector3(0,0,0)

                for (const flockmate of boid.flockmates) {
                    const otherVelocity = flockmate.get(Velocity)?.velocity
                    if (otherVelocity)
                        accumulatedFlockVelocity.add(otherVelocity)
                }

                const averageFlockVelocity = accumulatedFlockVelocity.divideScalar(boid.flockmates.length)
                const steerForce = averageFlockVelocity
                    .sub(velocity)
                    .clampLength(0, settings.maxSteerForce)
                const weightedSteerForce = steerForce.multiplyScalar(weight)

                acceleration.add(weightedSteerForce)
            }
        })
    })
}