import React, { createContext, FC, MutableRefObject, Suspense, useCallback, useContext, useRef, useState } from 'react'
import {
    Box,
    Environment,
    OrbitControls,
    OrbitControlsProps,
    Reflector,
    Stars,
    Stats,
    useCamera
} from '@react-three/drei'
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
        <meshStandardMaterial color='orange' emissive='orange'></meshStandardMaterial>
        {/*<meshPhysicalMaterial color='orange' envMapIntensity={1} clearcoat={0.8} clearcoatRoughness={0} roughness={0.5} metalness={1} />*/}
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
        {/*<directionalLight />*/}
        <color attach="background" args={[0,0,0]} />
        <OrbitControls enabled={controlsEnabled} target={target} enablePan={true} enableZoom={true} enableRotate={true} />

        <Stars
            radius={100} // Radius of the inner sphere (default=100)
            depth={50} // Depth of area where stars should fit (default=50)
            count={1000} // Amount of stars (default=5000)
            factor={4} // Size factor (default=4)
            saturation={0} // Saturation 0-1 (default=0)
            fade // Faded dots (default=false)
        />

        <Stats
            showPanel={0} // Start-up panel (default=0)
            className="stats" // Optional className to add to the stats container dom element
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

        {/*<Suspense fallback={<Box args={[3,3,3]}/>}>*/}
        {/*    <Environment*/}
        {/*        background={true} // Whether to affect scene.background*/}
        {/*        files={['/cube-low/px.png', '/cube-low/nx.png', '/cube-low/py.png', '/cube-low/ny.png', '/cube-low/pz.png', '/cube-low/nz.png']} // Array of cubemap files OR single equirectangular file*/}
        {/*    // path={'/'} // Path to the above file(s)*/}
        {/*    // preset={null} // Preset string (overrides files and path)*/}
        {/*    // scene={undefined} // adds the ability to pass a custom THREE.Scene*/}
        {/*    />*/}
        {/*</Suspense>*/}

        <Reflector
            position={[0,-2,0]}
            rotation={[-Math.PI / 2, 0, Math.PI / 2]}
            args={[100, 100]} // PlaneBufferGeometry arguments
            resolution={1024} // Off-buffer resolution, lower=faster, higher=better quality
            mirror={1} // Mirror environment, 0 = texture colors, 1 = pick up env colors
            mixBlur={1} // How much blur mixes with surface roughness (default = 0), note that this can affect performance
            mixStrength={1} // Strength of the reflections
            depthScale={1} // Scale the depth factor (0 = no depth, default = 0)
            minDepthThreshold={0.9} // Lower edge for the depthTexture interpolation (default = 0)
            maxDepthThreshold={1} // Upper edge for the depthTexture interpolation (default = 0)
            depthToBlurRatioBias={0.25} // Adds a bias factor to the depthTexture before calculating the blur amount [blurFactor = blurTexture * (depthTexture + bias)]. It accepts values between 0 and 1, default is 0.25. An amount > 0 of bias makes sure that the blurTexture is not too sharp because of the multiplication with the depthTexture
            distortion={0} // Amount of distortion based on the distortionMap texture
            // distortionMap={distortionTexture} // The red channel of this texture is used as the distortion map. Default is null
            debug={0} /* Depending on the assigned value, one of the following channels is shown:
    0 = no debug
    1 = depth channel
    2 = base channel
    3 = distortion channel
    4 = lod channel (based on the roughness)
  */
        >
            {(Material, props) => (
                <Material
                    color="#fff"
                    metalness={0}
                    // roughnessMap={roughness}
                    roughness={0}
                    // normalMap={normal}
                    // normalScale={_normalScale}
                    {...props}
                />
            )}
        </Reflector>

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