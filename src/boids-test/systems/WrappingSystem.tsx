import { FC } from 'react'
import { ThreeView } from '@react-ecs/three'
import { Boid } from '../facets'
import { useQuery, useSystem } from '@react-ecs/core'

export type WrappingSystemProps = {
  size: number;
}

export const WrappingSystem: FC<WrappingSystemProps> = ({size}) => {
    const query = useQuery(e => e.hasAll(ThreeView, Boid))

    return useSystem(_ => {
        query.loop([ThreeView, Boid], (e, [view, _]) => {
            const pos = view.object3d.position

            if (pos.x < -size)
                pos.setX(size)
            else if (pos.x > size)
                pos.setX(-size)

            if (pos.y < -size)
                pos.setY(size)
            else if (pos.y > size)
                pos.setY(-size)


            if (pos.z < -size)
                pos.setZ(size)
            else if (pos.z > size)
                pos.setZ(-size)
        })
    })
}