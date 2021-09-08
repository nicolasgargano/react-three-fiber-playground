import { FC } from 'react'
import { useQuery, useSystem } from '@react-ecs/core'
import { ThreeView } from '@react-ecs/three'
import { Acceleration, Boid, Velocity } from './facets'
import { Vec3 } from 'cannon-es'
import { capMagnitudeMutable } from './helpers'
import { settings } from './settings'

export type AlignmentSystemProps = {
  weight: number
}

export const AlignmentSystem: FC<AlignmentSystemProps> = ({ weight }) => {
    const query = useQuery(e => e.hasAll(ThreeView, Boid, Velocity, Acceleration))

    return useSystem(dt => {
        query.loop([ThreeView, Boid, Velocity, Acceleration], (currentEntity, [view, boid, {velocity}, {acceleration}]) => {
            const accumulated = new Vec3(0,0,0)

            for (const flockmate of boid.flockmates) {
                const otherVelocity = flockmate.get(Velocity)?.velocity
                if (otherVelocity)
                    accumulated.vadd(otherVelocity, accumulated)
            }

            if (boid.flockmates.length && boid.flockmates.length >= 0) {
                accumulated.scale(1/boid.flockmates.length, accumulated)
                accumulated.vsub(velocity, accumulated)
                capMagnitudeMutable(accumulated, 1)
            }

            acceleration
                .unit(acceleration)
                .scale(settings.maxSpeed, acceleration)
                .vsub(velocity, acceleration)
            capMagnitudeMutable(acceleration, settings.maxSteerForce)
            acceleration.scale(weight, acceleration)
        })
    })
}