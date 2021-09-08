
export type Settings = {
  seed: number,
  amountOfBoids: number,
  worldSize: number
  minSpeed: number
  maxSpeed: number,
  maxSteerForce: number
}

export const settings : Settings = {
    seed: 0,
    amountOfBoids: 70,
    worldSize: 30,
    minSpeed: 4,
    maxSpeed: 12,
    maxSteerForce: 3
}
