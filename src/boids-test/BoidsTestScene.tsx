import 'react'
import React, {
    ForwardedRef,
    forwardRef,
    ReactNode,
    useEffect,
    useMemo,
    useState
} from 'react'
import { Entity, useAnimationFrame, useECS} from '@react-ecs/core'
import * as Cannon from 'cannon-es'
import { Body, Vec3 } from 'cannon-es'
import { ThreeView } from '@react-ecs/three'
import { Color, ConeBufferGeometry, SphereBufferGeometry} from 'three'
import { GizmoHelper, GizmoViewport, Line, OrbitControls } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import cannonDebugger from 'cannon-es-debugger'
import { useControls } from 'leva'
import { evasionDirections, EvasionSystem } from './systems/EvasionSystem'
import { MovementSystem } from './systems/MovementSystem'
import { CannonContext } from './CannonContext'
import { Acceleration, Boid, Velocity } from './facets'
import { ResetAccelerationSystem } from './systems/ResetAccelerationSystem'
import { pipe } from 'fp-ts/function'
import { array } from 'fp-ts'
import { AlignmentSystem } from './systems/AlignmentSystem'
import { FlockmatesSystem } from './systems/FlockmatesSystem'
import { WrappingSystem } from './systems/WrappingSystem'

export const BoidsTestScene = (): JSX.Element => {

    const ECS = useECS()
    const [cannon] = useState(() => new Cannon.World())
    const {scene} = useThree()

    const movementControls = useControls('Movement System', {
        enabled: true,
    })

    const evasionControls  = useControls('Evasion System',{
        enabled: true,
        weight: 10,
        collisionDistance: {
            value: 2,
            min: 1,
            max: 10,
            step: 1
        },
        amountOfRays: {
            value: 300,
            min: 10,
            max: 300,
            step: 1,
        },
    })

    const evasionRays = useMemo(() => {
        console.log('Memo')
        return evasionDirections(evasionControls.amountOfRays)
            .map(vec3 => vec3.scale(1))
    }, [evasionControls.amountOfRays])

    useEffect(() => {

        const [width, height, depth] = [30, 30, 30]
        const thickness = 0.5

        const walls =
          [
              [new Vec3(0, height/2, 0), new Vec3(width/2, thickness, depth/2)],
              [new Vec3(0, -height/2, 0), new Vec3(width/2, thickness, depth/2)],
              [new Vec3(width/2, 0, 0), new Vec3(thickness, height/2, depth/2)],
              [new Vec3(-width/2, 0, 0), new Vec3(thickness, height/2, depth/2)],
              [new Vec3(0, 0, depth/2), new Vec3(width/2, height/2, thickness)],
              [new Vec3(0, 0, -depth/2), new Vec3(width/2, height/2, thickness)],
          ]

        walls
            .map(([pos, halfExtents]) => new Body({
                type: Body.STATIC,
                shape: new Cannon.Box(halfExtents),
                position: pos
            }))
            .forEach(body => {
                cannon.addBody(body)
            })

        // cannonDebugger(scene, cannon.bodies)
    }, [cannon])

    useAnimationFrame((dt) => ECS.update(dt))

    return <ECS.Provider>
        <CannonContext.Provider value={cannon}>

            <ambientLight intensity={0.1} />
            <directionalLight color="red" position={[0, 0, 5]} />
            <OrbitControls/>
            <color attach="background" args={[0,0,0]} />

            <GizmoHelper
                alignment="bottom-right"
                margin={[80, 80]}
                onUpdate={() => {}}>
                <GizmoViewport axisColors={['red', 'green', 'blue']} labelColor="white" />
            </GizmoHelper>

            {
                pipe(
                    evasionRays,
                    array.takeLeft(30),
                    array.mapWithIndex((i, r) => <BoidEntity key={`boid-${i}`} initialVelocity={r.scale(4)} />)
                )
            }

            <ResetAccelerationSystem/>
            <FlockmatesSystem radius={100}/>
            <AlignmentSystem weight={1}/>
            {/*<EvasionSystem*/}
            {/*    enabled={evasionControls.enabled}*/}
            {/*    weight={evasionControls.weight}*/}
            {/*    collisionDistance={evasionControls.collisionDistance}*/}
            {/*    amountOfRays={evasionControls.amountOfRays}*/}
            {/*/>*/}
            <MovementSystem
                enabled={movementControls.enabled}
            />
            <WrappingSystem size={20}/>

            {evasionRays.map((r, i) => <Line
                key={`debub-ray-${i}`}
                points={[[0, 0, 0], [r.x, r.y, r.z]]}
                color={new Color(0, 1-i/evasionControls.amountOfRays, i/evasionControls.amountOfRays)}/>)
            }

        </CannonContext.Provider>
    </ECS.Provider>
}

// --

type BoidProps = {
    initialVelocity: Vec3
}

const BoidEntity = forwardRef(function boidEntityFn(props: BoidProps, ref: ForwardedRef<ReactNode>) {
    const phi = 1.618033988749895
    const geom = new ConeBufferGeometry(0.5, 0.5*phi, 4)
    const s = new SphereBufferGeometry(0.1, 4, 4)

    return <Entity>
        <ThreeView>
            <group ref={ref} dispose={null}>
                <mesh castShadow receiveShadow geometry={geom}>
                    <meshPhongMaterial attach="material" color="white" wireframe />
                </mesh>
                <mesh castShadow receiveShadow geometry={s}>
                    <meshPhongMaterial attach="material" color="orange" />
                </mesh>
            </group>
        </ThreeView>
        <Boid/>
        <Velocity velocity={props.initialVelocity}/>
        <Acceleration acceleration={new Vec3(0,0,0)}/>
    </Entity>
})
