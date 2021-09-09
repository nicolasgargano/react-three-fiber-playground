import { FC } from 'react'
import { useQuery, useSystem } from '@react-ecs/core'
import { ThreeView } from '@react-ecs/three'
import { Acceleration, Boid, Velocity } from '../facets'
import { settings } from '../settings'
import { Vector3 } from 'three/src/math/Vector3'

export type SeparationSystemProps = {
  weight: number
}

export const SeparationSystem: FC<SeparationSystemProps> = ({ weight }) => {
    const query = useQuery(e => e.hasAll(ThreeView, Boid, Velocity, Acceleration))

    return useSystem(_ => {
        query.loop([ThreeView, Boid, Velocity, Acceleration], (currentEntity, [view, boid, {velocity}, {acceleration}]) => {

            if (boid.flockmates.length > 0) {
                const accumulatedDistancing = new Vector3(0,0,0)

                for (const flockmate of boid.flockmates) {
                    const otherPosition = flockmate.get(ThreeView)?.object3d.position
                    if (otherPosition) {
                        const mateToThis = view.object3d.position.clone().sub(otherPosition)
                        const inverselyProportional = mateToThis.divideScalar(Math.pow(mateToThis.length(), 2))
                        accumulatedDistancing.add(inverselyProportional)
                    }
                }

                const averageDistancing = accumulatedDistancing.divideScalar(boid.flockmates.length)

                const steerForce = averageDistancing
                    .setLength(settings.maxSpeed)
                    .sub(velocity)
                    .clampLength(0, settings.maxSteerForce)

                const weightedSteerForce = steerForce.multiplyScalar(weight)

                acceleration.add(weightedSteerForce)
            }
        })
    })
}