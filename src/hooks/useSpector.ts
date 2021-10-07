import { useEffect } from "react"
//@ts-ignore: no typings available :(
import * as SPECTOR from "spectorjs"

export const useSpector = () =>
  useEffect(() => {
    if (import.meta.env.MODE === "development") {
      const spector = new SPECTOR.Spector()
      spector.displayUI()
    }
  }, [])
