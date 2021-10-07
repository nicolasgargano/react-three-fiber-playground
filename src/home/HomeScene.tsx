import React, { FC, Suspense, useMemo, useRef, useState } from "react"
import { Canvas, GroupProps, useFrame, useThree } from "@react-three/fiber"
import { Environment, Stats } from "@react-three/drei"
import { AstronautModel } from "./AstronautModel"
import { Group, MathUtils, Vector3 } from "three"
import { EffectComposer, Pixelation } from "@react-three/postprocessing"
import { RocketModel } from "./RocketModel"
import { useSpector } from "../hooks/useSpector"

export const HomeScene = () => {
  useSpector()

  return <Scene count={30} />
}

type RocketsProps = {
  speed?: number
  count?: number
  depth?: number
  easing?: (n: number) => number
}

const Scene: FC<RocketsProps> = ({
  speed = 1,
  count = 80,
  depth = 80,
  easing = x => Math.sqrt(1 - Math.pow(x - 1, 2)),
}) => {
  return (
    <Canvas
      gl={{ alpha: false, antialias: false }}
      dpr={1.5}
      camera={{ position: [0, 0, 10], fov: 20, near: 0.01, far: depth + 15 }}
    >
      <color attach="background" args={["#ffbf40"]} />
      <spotLight
        position={[10, 20, 10]}
        penumbra={1}
        intensity={3}
        color="orange"
      />
      <Suspense fallback={null}>
        {Array.from({ length: count }, (_, i) => (
          <Rocket
            key={i}
            index={i}
            z={Math.round(easing(i / count) * depth)}
            speed={speed}
          />
        ))}
        <Astronaut position={[0, 0, -10]} />
        <Environment preset="sunset" />
      </Suspense>
      <EffectComposer multisampling={0}>
        <Pixelation granularity={5} />
      </EffectComposer>
    </Canvas>
  )
}

const Rocket: FC<{ index: number; z: number; speed: number }> = ({
  index,
  z,
  speed,
}) => {
  const ref = useRef<Group>()
  const { viewport, camera } = useThree()
  const target = useMemo(() => new Vector3(0, 0, -z), [z])

  const { width, height } = useMemo(
    () => viewport.getCurrentViewport(camera, target),
    [target],
  )

  const [data] = useState({
    y: MathUtils.randFloatSpread(height * 2),
    x: MathUtils.randFloatSpread(2),
    spin: MathUtils.randFloat(8, 12),
    rX: Math.random() * Math.PI,
    rZ: Math.random() * Math.PI,
  })

  useFrame((state, dt) => {
    ref.current?.position.setY(4)

    ref.current?.position.set(
      index === 0 ? 0 : data.x * width,
      (data.y += dt * speed),
      -z,
    )
    ref.current?.rotation.set(
      (data.rX += dt / data.spin),
      Math.sin(index * 1000 + state.clock.elapsedTime / 10) * Math.PI,
      (data.rZ += dt / data.spin),
    )
    if (data.y > height * (index === 0 ? 4 : 1))
      data.y = -(height * (index === 0 ? 4 : 1))
  })
  return <RocketModel ref={ref} />
}

const Astronaut: FC<GroupProps> = props => {
  const ref = useRef<Group>()

  useFrame((state, dt) => {
    const t = state.clock.getElapsedTime()

    ref.current?.rotation.set(
      0,
      MathUtils.lerp(ref.current?.rotation.y, Math.sin(t / 10) / 3, 0.1),
      MathUtils.lerp(ref.current?.rotation.y, Math.sin(t / 10) / 7, 0.1),
    )

    ref.current?.position.setY(
      MathUtils.lerp(ref.current?.position.y, Math.sin(t / 1.5) / 5, 0.1),
    )
  })

  return (
    <group {...props}>
      <AstronautModel ref={ref} {...props} />
    </group>
  )
}
