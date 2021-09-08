import { Facet } from '@react-ecs/core'
import { Vec3 } from 'cannon-es'
import { Entity } from 'tick-knock'

export class Boid extends Facet<Boid> {
  flockmates?: Entity[] = []
}

export class Velocity extends Facet<Velocity> {
  velocity = new Vec3(0,0,0)
}

export class Acceleration extends Facet<Acceleration> {
  acceleration = new Vec3(0,0,0)
}