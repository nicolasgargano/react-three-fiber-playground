import { createContext } from 'react'
import * as Cannon from 'cannon-es'

export const CannonContext = createContext<Cannon.World>(new Cannon.World())
