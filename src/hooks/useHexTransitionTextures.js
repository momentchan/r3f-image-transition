import { useLayoutEffect } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

/**
 * Custom hook for managing hex transition textures
 * @param {string} texture1Path - Path to first texture
 * @param {string} texture2Path - Path to second texture
 * @returns {Array} Array containing [tex1, tex2]
 */
export const useHexTransitionTextures = (texture1Path, texture2Path) => {
  const tex1 = useTexture(texture1Path);
  const tex2 = useTexture(texture2Path);

  useLayoutEffect(() => {
    if (tex1) {
      tex1.colorSpace = THREE.SRGBColorSpace;
      tex1.needsUpdate = true;
    }
    if (tex2) {
      tex2.colorSpace = THREE.SRGBColorSpace;
      tex2.needsUpdate = true;
    }
  }, [tex1, tex2]);

  return [tex1, tex2];
};

