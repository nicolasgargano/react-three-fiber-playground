import React, { createContext, FC, MutableRefObject, useCallback, useContext, useRef, useState } from 'react'
import { OrbitControls, OrbitControlsProps, Stars, useCamera } from '@react-three/drei'
import { EffectComposer, Outline} from '@react-three/postprocessing'
import { Object3D } from 'three'
import { Vector3 } from 'three/src/math/Vector3'
import { useSpring } from '@react-spring/three'
import { MeshProps, useThree } from '@react-three/fiber'

export type StarProps = MeshProps

const hoveredObjectsContext = createContext<React.Dispatch<React.SetStateAction<React.MutableRefObject<Object3D>[]>>>(() => [])

function useHover() {
    const ref = useRef<Object3D>()
    const setHovered = useContext(hoveredObjectsContext)
    const onPointerOver = useCallback(() => {
        if (ref.current) {
            const r = ref as unknown as React.MutableRefObject<Object3D>
            setHovered((state => [...state, r]))
        }
    }, [])

    const onPointerOut = useCallback(() => setHovered(state => state.filter(mesh => mesh !== ref)), [])
    return { ref, onPointerOver, onPointerOut }
}

export const Star : FC<StarProps> = ({...props}) => {
    const {ref, onPointerOver, onPointerOut} = useHover()

    return <mesh ref={ref} onPointerOver={onPointerOver} onPointerOut={onPointerOut} {...props}>
        <sphereGeometry/>
        <meshStandardMaterial color="orange" />
    </mesh>
}

export const StarsScene = () => {
    const [hovered, setHovered] = useState<MutableRefObject<Object3D>[]>([])
    const [target, setTarget] = useState<[number,number,number]>([0,0,0])

    const [v, set] = useState(new Vector3(0,0,0))
    const [starPositions] = useState([new Vector3(-5, 0, 0), new Vector3(5, 0, 0)])

    const { gl, camera } = useThree()

    type CameraAnimationProps = {
        lookAt: [number, number, number],
        position: [number, number, number]
    }

    const [cameraProps, api] = useSpring<CameraAnimationProps>(() => ({
        reset: true,
        from: {
            lookAt: [0, 0, 0],
            position: [0, 10, 10]
        },
        to: {
            lookAt: [0, 0, 0],
            position: [0, 10, 10]
        }
    }))

    const [controlsEnabled, setControlsEnabled] = useState(true)

    const focusStar = (vec3: Vector3) => {
        const offsetFromCurrentTarget = camera.position.clone().sub(new Vector3(target[0], target[1], target[2]))

        console.log('focus star')
        api.start({
            reset: true,
            from: {
                lookAt: target,
                position: camera.position.toArray()
            },
            to: {
                lookAt: vec3.toArray(),
                position: vec3.clone().add(offsetFromCurrentTarget).toArray()
            },
            onStart: () => {
                console.log('On start')
                setControlsEnabled(() => false)
            },
            onRest: () => {
                console.log('On rest')
                setTarget(vec3.toArray())
                setControlsEnabled(() => true)
            },
            onChange: (result) => {
                console.log('on change')
                camera.position.set(result.value.position[0], result.value.position[1], result.value.position[2])
                camera.lookAt(result.value.lookAt[0], result.value.lookAt[1], result.value.lookAt[2])
            }
        })
    }


    return <>
        <ambientLight intensity={0.1} />
        <directionalLight />
        <color attach="background" args={[0,0,0]} />
        <OrbitControls enabled={controlsEnabled} target={target} enablePan={true} enableZoom={true} enableRotate={true} />

        <Stars
            radius={100} // Radius of the inner sphere (default=100)
            depth={50} // Depth of area where stars should fit (default=50)
            count={500} // Amount of stars (default=5000)
            factor={4} // Size factor (default=4)
            saturation={0} // Saturation 0-1 (default=0)
            fade // Faded dots (default=false)
        />

        <hoveredObjectsContext.Provider value={setHovered}>
            {
                starPositions.map((pos, i) =>
                    <Star
                        key={`star-${i}`}
                        position={pos}
                        onClick={_ => focusStar(pos)}
                    />)
            }
        </hoveredObjectsContext.Provider>

        <EffectComposer multisampling={8} autoClear={false}>
            <Outline
                selection={hovered}
                edgeStrength={10}
                visibleEdgeColor={0xffffff}
                blur
            />
        </EffectComposer>
    </>
}