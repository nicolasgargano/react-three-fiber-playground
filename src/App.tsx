import React, {useRef, useState} from 'react'
import {Canvas, MeshProps, useFrame} from '@react-three/fiber'
import {Mesh} from 'three'
import { BoidsTestScene } from './boids-test/BoidsTestScene'

function Box(props: MeshProps) {
    // This reference will give us direct access to the mesh
    const ref = useRef<Mesh>()
    // Set up state for the hovered and active state
    const [hovered, setHover] = useState(false)
    const [active, setActive] = useState(false)
    // Rotate mesh every frame, this is outside of React without overhead
    useFrame(() => {
        if (ref.current)
            ref.current.rotation.x = ref.current.rotation.y += 0.01
    })
    return (
        <mesh
            {...props}
            ref={ref}
            scale={active ? 1.5 : 1}
            onClick={_ => setActive(!active)}
            onPointerOver={_ => setHover(true)}
            onPointerOut={_ => setHover(false)}>
            <boxGeometry args={[1, 1, 1]}/>
            <meshStandardMaterial color={hovered ? 'hotpink' : 'orange'}/>
        </mesh>
    )
}

export const App = (): JSX.Element =>
    <Canvas>
        <BoidsTestScene/>
    </Canvas>
