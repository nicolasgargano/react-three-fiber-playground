import { FC } from 'react'
import { useQuery, useSystem } from '@react-ecs/core'
import { Acceleration, Boid } from './facets'
import { Vec3 } from 'cannon-es'

export const ResetAccelerationSystem: FC = () => {
    const query = useQuery(e => e.hasAll(Boid, Acceleration))
    return useSystem(_ => {
        query.loop([Boid, Acceleration], (e, [_, {acceleration}]) => {
            acceleration.copy(Vec3.ZERO)
        })
    })
}