import { Facet } from "@react-ecs/core"
import { Vector3 } from "three/src/math/Vector3"
import { Entity } from "tick-knock"

export class Boid extends Facet<Boid> {
  flockmates?: Entity[] = []
}

export class Velocity extends Facet<Velocity> {
  velocity = new Vector3(0, 0, 0)
}

export class Acceleration extends Facet<Acceleration> {
  acceleration = new Vector3(0, 0, 0)
}
