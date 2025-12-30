import { useMemo, useRef, useLayoutEffect } from "react";
import { useControls } from "leva";
import { uniform } from "three/tsl";
import { NodeMaterial } from "three/webgpu";
import { extend } from "@react-three/fiber";
import { useThree, useFrame } from "@react-three/fiber";
import { useHexTransitionTextures } from "../hooks/useHexTransitionTextures";
import { createMaterialProps } from "../materials/hexTransitionMaterial";

extend({ NodeMaterial });

export default function HexTransition() {
  const { viewport } = useThree();
  const materialRef = useRef(null);

  const [tex1, tex2] = useHexTransitionTextures(
    "textures/the-kiss.png",
    "textures/fulfillment.png"
  );

  const { transition } = useControls({
    transition: {
      value: 0,
      min: 0,
      max: 1,
      step: 0.01,
    },
  });

  const uTransition = useMemo(() => uniform(transition), []);
  const uTime = useMemo(() => uniform(0), []);

  useLayoutEffect(() => {
    uTransition.value = transition;
  }, [transition]);

  const materialProps = useMemo(() => {
    if (!tex1 || !tex2) return null;

    return createMaterialProps({
      tex1,
      tex2,
      uTransition,
      uTime,
      aspect: viewport.aspect,
    });
  }, [tex1, tex2, uTransition, uTime, viewport.aspect]);

  useFrame((state) => {
    uTime.value = state.clock.elapsedTime;
  });

  if (!materialProps) return null;

  return (
    <mesh>
      <planeGeometry args={[1, 1.2]} />
      <nodeMaterial key={Math.random()} ref={materialRef} {...materialProps} />
    </mesh>
  );
}
