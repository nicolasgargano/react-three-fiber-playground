import React from "react"
import { Canvas } from "@react-three/fiber"
import { StarsScene } from "./spring-test/StarsScene"
import { Route } from "wouter"
import { BoidsTestScene } from "./boids-test/BoidsTestScene"
import { HomeScene } from "./home/HomeScene"

export const App = (): JSX.Element => (
  <>
    <Route path={"/"}>
      <HomeScene />
    </Route>

    <Route path="/boids">
      <BoidsTestScene />
    </Route>

    <Route path="/stars">
      <StarsScene />
    </Route>
  </>
)
