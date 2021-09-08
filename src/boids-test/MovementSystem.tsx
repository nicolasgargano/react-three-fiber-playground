import { FC } from 'react'
import { useQuery, useSystem } from '@react-ecs/core'
import { ThreeView } from '@react-ecs/three'
import { Acceleration, Velocity } from './facets'
import { toVector3 } from './helpers'

export type MovementSystemProps = {
  enabled: boolean
}

export const MovementSystem : FC<MovementSystemProps> = ({enabled}) => {
    const query = useQuery(e => e.hasAll(ThreeView, Velocity, Acceleration))

    return useSystem(dt => {
        if (!enabled) return
        query.loop([ThreeView, Velocity, Acceleration], (e, [view, { velocity }, { acceleration }]) => {
            const transform = view.object3d
            const vector3VelocityDelta = toVector3(velocity.scale(dt))

            if (velocity.length() > 0) {
                transform.lookAt(transform.position.clone().add(vector3VelocityDelta))
                // TODO this orients the tip of a cone mesh as the forwards vector,
                //  it would be better to do so in the boid mesh
                transform.rotateX( Math.PI / 2 )
            }

            velocity.vadd(acceleration.scale(dt), velocity)
            transform.position.add(vector3VelocityDelta)
        })
    })
}
