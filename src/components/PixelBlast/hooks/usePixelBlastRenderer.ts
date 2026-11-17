import { useEffect, useRef } from 'react';
import type { Effect, EffectComposer } from 'postprocessing';
import * as THREE from 'three';
import type { PixelBlastProps, ReinitConfig, ThreeUniforms } from '../types';
import {
  FRAGMENT_SRC,
  MAX_CLICKS,
  SHAPE_MAP,
  VERTEX_SRC,
} from '../shaders';
import { createLiquidEffect, createTouchTexture, type TouchTexture } from '../effects';

type ThreeState = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.OrthographicCamera;
  material: THREE.ShaderMaterial;
  clock: THREE.Clock;
  clickIx: number;
  uniforms: ThreeUniforms;
  resizeObserver?: ResizeObserver;
  raf?: number;
  quad?: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  timeOffset?: number;
  composer?: EffectComposer;
  touch?: TouchTexture;
  liquidEffect?: Effect;
};

type UsePixelBlastRendererParams = Required<
  Pick<
    PixelBlastProps,
    | 'antialias'
    | 'pixelSize'
    | 'patternScale'
    | 'patternDensity'
    | 'enableRipples'
    | 'rippleIntensityScale'
    | 'rippleThickness'
    | 'rippleSpeed'
    | 'pixelSizeJitter'
    | 'edgeFade'
    | 'transparent'
    | 'liquidStrength'
    | 'liquidRadius'
    | 'liquidWobbleSpeed'
    | 'autoPauseOffscreen'
    | 'variant'
    | 'color'
    | 'speed'
    | 'liquid'
    | 'noiseAmount'
  >
> & {
  containerRef: React.RefObject<HTMLDivElement | null>;
};

export function usePixelBlastRenderer({
  containerRef,
  variant,
  pixelSize,
  color,
  antialias,
  patternScale,
  patternDensity,
  liquid,
  liquidStrength,
  liquidRadius,
  pixelSizeJitter,
  enableRipples,
  rippleIntensityScale,
  rippleThickness,
  rippleSpeed,
  liquidWobbleSpeed,
  autoPauseOffscreen,
  speed,
  transparent,
  edgeFade,
  noiseAmount,
}: UsePixelBlastRendererParams) {
  const visibilityRef = useRef({ visible: true });
  const speedRef = useRef(speed);
  const threeRef = useRef<ThreeState | null>(null);
  const prevConfigRef = useRef<ReinitConfig | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    speedRef.current = speed;

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibilityRef.current.visible = entry.isIntersecting;
        }
      },
      { rootMargin: '200px' },
    );
    visibilityObserver.observe(container);

    const needsReinitKeys: (keyof ReinitConfig)[] = ['antialias', 'liquid', 'noiseAmount'];
    const cfg: ReinitConfig = { antialias, liquid, noiseAmount };
    let mustReinit = false;
    if (!threeRef.current) mustReinit = true;
    else if (prevConfigRef.current) {
      for (const k of needsReinitKeys)
        if (prevConfigRef.current[k] !== cfg[k]) {
          mustReinit = true;
          break;
        }
    }

    if (mustReinit) {
      if (threeRef.current) {
        const t = threeRef.current;
        t.resizeObserver?.disconnect();
        cancelAnimationFrame(t.raf!);
        t.quad?.geometry.dispose();
        t.material.dispose();
        t.composer?.dispose();
        t.renderer.dispose();
        t.renderer.forceContextLoss();
        if (t.renderer.domElement.parentElement === container) {
          container.removeChild(t.renderer.domElement);
        }
        threeRef.current = null;
      }

      const canvas = document.createElement('canvas');
      const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias,
        alpha: true,
        powerPreference: 'high-performance',
      });
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      container.appendChild(renderer.domElement);
      if (transparent) renderer.setClearAlpha(0);
      else renderer.setClearColor(0x000000, 1);

      const uniforms: ThreeUniforms = {
        uResolution: { value: new THREE.Vector2(0, 0) },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uClickPos: {
          value: Array.from({ length: MAX_CLICKS }, () => new THREE.Vector2(-1, -1)),
        },
        uClickTimes: { value: new Float32Array(MAX_CLICKS) },
        uShapeType: { value: SHAPE_MAP[variant] ?? 0 },
        uPixelSize: { value: pixelSize * renderer.getPixelRatio() },
        uScale: { value: patternScale },
        uDensity: { value: patternDensity },
        uPixelJitter: { value: pixelSizeJitter },
        uEnableRipples: { value: 0 },
        uRippleSpeed: { value: rippleSpeed },
        uRippleThickness: { value: rippleThickness },
        uRippleIntensity: { value: rippleIntensityScale },
        uEdgeFade: { value: edgeFade },
      };

      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SRC,
        fragmentShader: FRAGMENT_SRC,
        uniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        glslVersion: THREE.GLSL3,
      });

      const quadGeom = new THREE.PlaneGeometry(2, 2);
      const quad = new THREE.Mesh(quadGeom, material);
      scene.add(quad);
      const clock = new THREE.Clock();

      let isFirstSize = true;
      const initialW = container.clientWidth || window.innerWidth || 1;
      const initialH = container.clientHeight || window.innerHeight || 1;

      const setSize = () => {
        if (!isFirstSize) return;
        isFirstSize = false;
        renderer.setSize(initialW, initialH, false);
        uniforms.uResolution.value.set(
          renderer.domElement.width,
          renderer.domElement.height,
        );
        if (threeRef.current?.composer) {
          threeRef.current.composer.setSize(
            renderer.domElement.width,
            renderer.domElement.height,
          );
        }
        uniforms.uPixelSize.value = pixelSize * renderer.getPixelRatio();
      };
      setSize();

      const ro = {
        disconnect: () => {},
        observe: () => {},
        unobserve: () => {},
      };

      const randomFloat = (): number => {
        if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
          const u32 = new Uint32Array(1);
          window.crypto.getRandomValues(u32);
          return u32[0] / 0xffffffff;
        }
        return Math.random();
      };
      const timeOffset = randomFloat() * 1000;

      let composer: EffectComposer | undefined;
      let touch: ReturnType<typeof createTouchTexture> | undefined;
      let liquidEffect: Effect | undefined;

      // Load postprocessing only when an optional visual effect is enabled.
      if (liquid || noiseAmount > 0) {
        void import('postprocessing')
          .then(
            ({
              Effect: EffectConstructor,
              EffectComposer: EffectComposerConstructor,
              EffectPass,
              RenderPass,
            }) => {
              // The component may have unmounted while the optional chunk loaded.
              if (threeRef.current?.renderer !== renderer) return;

              let nextComposer: EffectComposer | undefined;
              let nextTouch: ReturnType<typeof createTouchTexture> | undefined;
              let nextLiquidEffect: Effect | undefined;

              if (liquid) {
                nextTouch = createTouchTexture();
                nextTouch.radiusScale = liquidRadius;
                nextComposer = new EffectComposerConstructor(renderer);
                const renderPass = new RenderPass(scene, camera);
                nextLiquidEffect = createLiquidEffect(EffectConstructor, nextTouch.texture, {
                  strength: liquidStrength,
                  freq: liquidWobbleSpeed,
                });
                const effectPass = new EffectPass(camera, nextLiquidEffect);
                effectPass.renderToScreen = true;
                nextComposer.addPass(renderPass);
                nextComposer.addPass(effectPass);
              }

              if (noiseAmount > 0) {
                if (!nextComposer) {
                  nextComposer = new EffectComposerConstructor(renderer);
                  nextComposer.addPass(new RenderPass(scene, camera));
                }
                const noiseEffect = new EffectConstructor(
                  'NoiseEffect',
                  `uniform float uTime; uniform float uAmount; float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453);} void mainUv(inout vec2 uv){} void mainImage(const in vec4 inputColor,const in vec2 uv,out vec4 outputColor){ float n=hash(floor(uv*vec2(1920.0,1080.0))+floor(uTime*60.0)); float g=(n-0.5)*uAmount; outputColor=inputColor+vec4(vec3(g),0.0);} `,
                  {
                    uniforms: new Map<string, THREE.Uniform>([
                      ['uTime', new THREE.Uniform(0)],
                      ['uAmount', new THREE.Uniform(noiseAmount)],
                    ]),
                  },
                );
                const noisePass = new EffectPass(camera, noiseEffect);
                noisePass.renderToScreen = true;
                nextComposer.passes.forEach((pass) => {
                  (pass as { renderToScreen?: boolean }).renderToScreen = false;
                });
                nextComposer.addPass(noisePass);
              }

              nextComposer?.setSize(
                renderer.domElement.width,
                renderer.domElement.height,
              );

              composer = nextComposer;
              touch = nextTouch;
              liquidEffect = nextLiquidEffect;

              const currentState = threeRef.current;
              if (currentState?.renderer === renderer) {
                currentState.composer = composer;
                currentState.touch = touch;
                currentState.liquidEffect = liquidEffect;
              }
            },
          )
          .catch((error: unknown) => {
            // Keep the base WebGL background running if an optional effect fails.
            console.warn('[PixelBlast] Optional postprocessing failed to load:', error);
          });
      }

      let raf = 0;
      let lastRenderTime = 0;
      const TARGET_FRAME_MS = 1000 / 30;
      const animate = (now: number) => {
        if (autoPauseOffscreen && !visibilityRef.current.visible) {
          raf = requestAnimationFrame(animate);
          return;
        }
        if (now - lastRenderTime < TARGET_FRAME_MS) {
          raf = requestAnimationFrame(animate);
          return;
        }
        lastRenderTime = now;
        uniforms.uTime.value =
          timeOffset + clock.getElapsedTime() * speedRef.current;
        if (liquidEffect) {
          const liqEffect = liquidEffect as Effect & {
            uniforms: Map<string, THREE.Uniform>;
          };
          const timeUniform = liqEffect.uniforms.get('uTime');
          if (timeUniform) timeUniform.value = uniforms.uTime.value;
        }
        if (composer) {
          if (touch) touch.update();
          composer.passes.forEach((p) => {
            const pass = p as {
              effects?: Array<Effect & { uniforms: Map<string, THREE.Uniform> }>;
            };
            if (pass.effects) {
              pass.effects.forEach((eff) => {
                const timeUniform = eff.uniforms?.get('uTime');
                if (timeUniform) timeUniform.value = uniforms.uTime.value;
              });
            }
          });
          composer.render();
        } else {
          renderer.render(scene, camera);
        }
        raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame((t) => animate(t));

      threeRef.current = {
        renderer,
        scene,
        camera,
        material,
        clock,
        clickIx: 0,
        uniforms,
        resizeObserver: ro,
        raf,
        quad,
        timeOffset,
        composer,
        touch,
        liquidEffect,
      };
    } else {
      const t = threeRef.current!;
      t.uniforms.uShapeType.value = SHAPE_MAP[variant] ?? 0;
      t.uniforms.uPixelSize.value = pixelSize * t.renderer.getPixelRatio();
      t.uniforms.uColor.value.set(color);
      t.uniforms.uScale.value = patternScale;
      t.uniforms.uDensity.value = patternDensity;
      t.uniforms.uPixelJitter.value = pixelSizeJitter;
      t.uniforms.uEnableRipples.value = 0;
      t.uniforms.uRippleIntensity.value = rippleIntensityScale;
      t.uniforms.uRippleThickness.value = rippleThickness;
      t.uniforms.uRippleSpeed.value = rippleSpeed;
      t.uniforms.uEdgeFade.value = edgeFade;
      if (transparent) t.renderer.setClearAlpha(0);
      else t.renderer.setClearColor(0x000000, 1);
      if (t.liquidEffect) {
        const liqEffect = t.liquidEffect as Effect & {
          uniforms: Map<string, THREE.Uniform>;
        };
        const uStrength = liqEffect.uniforms.get('uStrength');
        if (uStrength) uStrength.value = liquidStrength;
        const uFreq = liqEffect.uniforms.get('uFreq');
        if (uFreq) uFreq.value = liquidWobbleSpeed;
      }
      if (t.touch) t.touch.radiusScale = liquidRadius;
    }

    prevConfigRef.current = cfg;

    return () => {
      visibilityObserver.disconnect();
      if (threeRef.current && mustReinit) return;
      if (!threeRef.current) return;
      const t = threeRef.current;
      t.resizeObserver?.disconnect();
      cancelAnimationFrame(t.raf!);
      t.quad?.geometry.dispose();
      t.material.dispose();
      t.composer?.dispose();
      t.renderer.dispose();
      t.renderer.forceContextLoss();
      if (t.renderer.domElement.parentElement === container) {
        container.removeChild(t.renderer.domElement);
      }
      threeRef.current = null;
    };
  }, [
    antialias,
    liquid,
    noiseAmount,
    pixelSize,
    patternScale,
    patternDensity,
    enableRipples,
    rippleIntensityScale,
    rippleThickness,
    rippleSpeed,
    pixelSizeJitter,
    edgeFade,
    transparent,
    liquidStrength,
    liquidRadius,
    liquidWobbleSpeed,
    autoPauseOffscreen,
    variant,
    color,
    speed,
    containerRef,
  ]);
}
