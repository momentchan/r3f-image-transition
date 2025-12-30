import { AdaptiveDpr, CameraControls } from "@react-three/drei";
import { CanvasCapture } from "@packages/r3f-gist/components/utility";
import HexTransition from '../components/HexTransition'
import { LevaWrapper } from "@packages/r3f-gist/components";
import { Canvas } from "@react-three/fiber";
import { WebGPURenderer } from "three/webgpu";
import * as THREE from "three";

export default function App() {
    return <>
        <LevaWrapper />

        <Canvas
            shadows
            camera={{
                fov: 30,
                near: 0.1,
                far: 200,
                position: [0, 0, 3]
            }}
            gl={(canvas) => {
                const renderer = new WebGPURenderer({
                  ...canvas,
                  powerPreference: "high-performance",
                  antialias: true,
                  alpha: false,
                  stencil: false,
                  shadowMap: true,
                });
                return renderer.init().then(() => renderer);
              }}
            dpr={[1, 2]}
            performance={{ min: 0.5, max: 1 }}
        >
            <AdaptiveDpr pixelated />
            <CameraControls makeDefault />
            <HexTransition />
            <CanvasCapture />
        </Canvas>
    </>
}
