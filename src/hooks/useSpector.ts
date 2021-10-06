import { useEffect } from "react"
//@ts-ignore: no typings available :(
import * as SPECTOR from "spector"

export const useSpector = () =>
  useEffect(() => {
    const spector = new SPECTOR.Spector()
    spector.displayUI()
  }, [])
