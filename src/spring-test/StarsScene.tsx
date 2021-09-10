import React, { createContext, FC, MutableRefObject, useCallback, useContext, useRef, useState } from 'react'
import { OrbitControls, Stars } from '@react-three/drei'
import { EffectComposer, Outline } from '@react-three/postprocessing'
import { Object3D } from 'three'
import { MeshProps } from '@react-three/fiber'

export type StarProps = {

}

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

    return <>
        <ambientLight intensity={0.1} />
        <directionalLight />
        <color attach="background" args={[0,0,0]} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

        <Stars
            radius={100} // Radius of the inner sphere (default=100)
            depth={50} // Depth of area where stars should fit (default=50)
            count={5000} // Amount of stars (default=5000)
            factor={4} // Size factor (default=4)
            saturation={0} // Saturation 0-1 (default=0)
            fade // Faded dots (default=false)
        />

        <hoveredObjectsContext.Provider value={setHovered}>
            <Star/>

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