
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
    worldSize: 15,
    minSpeed: 2,
    maxSpeed: 5,
    maxSteerForce: 3
}
