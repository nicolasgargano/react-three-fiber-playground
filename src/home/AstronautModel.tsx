/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
*/

import React, { FC, forwardRef, useEffect, useRef } from "react"
import { useGLTF } from "@react-three/drei"
import { GroupProps } from "@react-three/fiber"
import { Group } from "three"

// TODO proper type
export const AstronautModel = forwardRef<any, GroupProps>(
  function AstronautModel(props, ref) {
    // @ts-ignore
    const { nodes, materials } = useGLTF("/astronaut.glb")
    useEffect(() => {
      console.log(nodes)
    })

    return (
      <group ref={ref} {...props} dispose={null}>
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Body.geometry}
          material={nodes.Body.material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Head.geometry}
          material={nodes.Head.material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Backpack.geometry}
          material={nodes.Backpack.material}
        />
        <mesh
          castShadow
          receiveShadow
          geometry={nodes.Backpack_Tubes.geometry}
          material={nodes.Backpack_Tubes.material}
        />
      </group>
    )
  },
)

useGLTF.preload("/astronaut.glb")
