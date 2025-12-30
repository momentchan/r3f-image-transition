import {
  uv,
  vec2,
  uniform,
  Fn,
  texture,
  mul,
  max,
  length,
  float,
  smoothstep,
  pow,
  oneMinus,
  mx_noise_float,
  remap,
  sin,
  vec4,
  step,
  abs,
  mix,
  dot,
  floor,
} from "three/tsl";
import * as THREE from "three";

/**
 * Rounds a value (snap round)
 * @param {Array} params - [s]
 * @returns {Function} Shader function
 */
const sround = Fn(([s]) => {
  return floor(s.add(0.5));
});

/**
 * Scales UV coordinates around center point
 * @param {Array} params - [uv, scale]
 * @returns {Function} Shader function
 */
const scaleUV = Fn(([uv, scale]) => {
  return uv.toVar().sub(vec2(0.5)).mul(scale).add(vec2(0.5));
});

/**
 * Calculates distance to hexagon edge
 * @param {Array} params - [uv]
 * @returns {Function} Shader function
 */
const hexDistance = Fn(([uv]) => {
  const s = vec2(1, 1.7320508075);
  const p = uv.toVar().abs();
  return max(dot(p, s.mul(0.5)), p.x);
});

/**
 * Calculates hexagon coordinates from UV
 * @param {Array} params - [uv]
 * @returns {Function} Shader function
 */
const hexCoordinates = Fn(([uv]) => {
  const s = vec2(1, 1.7320508075);
  const hexCenter = sround(
    vec4(uv, uv.toVar().sub(vec2(0.5, 1))).div(s.xyxy)
  );
  const offset = vec4(
    uv.sub(hexCenter.xy.mul(s)),
    uv.sub(hexCenter.zw.add(vec2(0.5)).mul(s))
  );

  const dot1 = dot(offset.xy, offset.xy);
  const dot2 = dot(offset.zw, offset.zw);
  const final1 = vec4(offset.xy, hexCenter.xy);
  const final2 = vec4(offset.zw, hexCenter.zw);
  const diff = dot1.sub(dot2);
  const final = mix(final1, final2, step(0, diff));

  return final;
});

/**
 * Creates the color node for hex transition material
 * @param {Object} params - Material parameters
 * @param {Object} params.tex1 - First texture
 * @param {Object} params.tex2 - Second texture
 * @param {Object} params.uTransition - Transition uniform
 * @param {Object} params.uTime - Time uniform
 * @param {number} params.aspect - Viewport aspect ratio
 * @returns {Function} Color node function
 */
export const createColorNode = ({ tex1, tex2, uTransition, uTime, aspect }) => {
  return Fn(() => {
    const corUV = scaleUV(uv(), vec2(1, 1));
    const distUV = scaleUV(corUV, vec2(float(1).add(length(uv().sub(0.5)))));
    const hexUV = distUV.mul(20);
    const hexCoords = hexCoordinates(hexUV);
    const hexDist = hexDistance(hexCoords.xy).add(0.03);
    const border = smoothstep(0.51, 0.51 + 0.03, hexDist);
    const y = pow(max(0, float(0.5).sub(hexDist)).oneMinus(), 10).mul(1.5);
    const z = mx_noise_float(hexCoords.zw.mul(0.6).abs());

    const offset = float(0.2);
    const bounceTransition = smoothstep(
      0,
      0.5,
      abs(uTransition.sub(0.5))
    ).oneMinus();

    const blendCut = smoothstep(
      uv().y.sub(offset),
      uv().y.add(offset),
      remap(
        uTransition.add(z.mul(0.08).mul(bounceTransition)),
        0,
        1,
        offset.mul(-1),
        float(1).add(offset)
      )
    );

    const merge = smoothstep(0, 0.5, abs(blendCut.sub(0.5))).oneMinus();

    const cut = step(
      uv().y,
      uTransition.add(y.add(z).mul(0.15).mul(bounceTransition))
    );

    const textureUV = corUV.add(
      y
        .mul(sin(uv().y.mul(15).sub(uTime.mul(0.5))))
        .mul(merge)
        .mul(0.025)
    );

    const fromUV = textureUV.toVar();
    const toUV = textureUV.toVar();

    fromUV.assign(
      scaleUV(fromUV.toVar(), vec2(float(1).add(z.mul(0.2).mul(merge))))
    );

    toUV.assign(
      scaleUV(toUV.toVar(), vec2(float(1).add(z.mul(0.2).mul(blendCut))))
    );

    const colorBlend = merge.mul(border).mul(bounceTransition);

    const sample1 = texture(tex1, toUV);
    const sample2 = texture(tex2, fromUV);
    const final = mix(sample1, sample2, cut);
    final.addAssign(vec4(1.0, 0.4, 0.0, 1.0).mul(colorBlend).mul(2.0));
    return final;
  })();
};

/**
 * Creates material properties for hex transition
 * @param {Object} params - Material parameters
 * @returns {Object} Material properties
 */
export const createMaterialProps = (params) => {
  const colorNode = createColorNode(params);

  return {
    colorNode: colorNode,
    transparent: true,
    side: THREE.DoubleSide,
  };
};

