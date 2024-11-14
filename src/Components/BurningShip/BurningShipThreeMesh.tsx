import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import { useFrame, ThreeEvent } from '@react-three/fiber';
import { Vector2 } from "three";
import * as THREE from 'three';
import burningShipShader from '../../shaders/burningShipShader.glsl';
// import mandelbrotShader from '../../shaders/mandelbrotShader.glsl';

import { getDefaultUniforms, getWindowSize, getAspectRatio } from '../../helpers/renderingHelpers.ts';

interface ILocalProps {
  updatePosition: (position: {x: number, y: number}) => void;
  reset: boolean;
  maxIterations: number;
  colorScheme: number;
  fractal: string;
}
type Props = ILocalProps;

export const BurningShipThreeMesh: React.FC<Props> = (props) => {

  const startZoom = 2;
  const zoomSpeed = 1;

  // useState
  const [, hover] = useState(false);
  // const [shader, setShader] = useState(mandelbrotShader);
  const meshRef = useRef<THREE.Mesh>(null!);
  const materialRef = useRef<THREE.ShaderMaterial>(null!);
  const mouseDown0 = useRef(false);
  const mouseDown1 = useRef(false);
  const isQPressed = useRef(false);
  const isAPressed = useRef(false);
  const isCtrlPressed = useRef(false);
  const mousePosition = useRef({ x: 0, y: 0 });
  const mouseDelta = useRef({ x: 0.0, y: 0.0 });

  const uniforms = useMemo(
    () => ({
      ...getDefaultUniforms(startZoom),
      u_maxIterations: {
        value: props.maxIterations,
      },
      u_color_scheme: {
        value: props.colorScheme-1,
      }
    }), []
  );

  useEffect(() => {
    console.log(props.colorScheme)
    materialRef.current.uniforms.u_maxIterations.value = props.maxIterations;
    materialRef.current.uniforms.u_color_scheme.value = props.colorScheme-1;
    // materialRef.current.fragmentShader = props.fractal === "burningShip" ? burningShipShader : mandelbrotShader;
    console.log(props.maxIterations)
    // console.log(props.fractal)
    // console.log(shader)
  }, [props.maxIterations, props.colorScheme]);

  // useCallback
  const updateScreenSize = useCallback(() => {
    const windowSize = getWindowSize();
    uniforms.u_resolution.value = windowSize;
    uniforms.u_aspectRatio.value = windowSize.x / windowSize.y;
  }, []);

  const updateMousePosition = useCallback((e: MouseEvent) => {

    mousePosition.current = { x: e.clientX, y: e.clientY };
    mouseDelta.current = { x: e.movementX, y: e.movementY };
  }, []);
  const updateKeyDown = useCallback((e: KeyboardEvent) => {

    if (e.code === "KeyQ")
      isQPressed.current = true;
    if (e.code === "KeyA")
      isAPressed.current = true;
    if (e.code === "ControlLeft")
      isCtrlPressed.current = true;
  
  }, []);
  const updateKeyUp = useCallback((e: KeyboardEvent) => {

    if (e.code === "KeyQ")
      isQPressed.current = false;
    if (e.code === "KeyA")
      isAPressed.current = false;
    if (e.code === "ControlLeft")
      isCtrlPressed.current = false;
  
  }, []);

  // useEffects
  useEffect(() => {
 
    if (props.reset) {

      materialRef.current.uniforms.u_zoomSize.value = startZoom;
      materialRef.current.uniforms.u_offset.value = new Vector2(-(startZoom / 2) * getAspectRatio(), -(startZoom / 2));
      props.updatePosition({x: 0, y: 0});
    }

  }, [props.reset]);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();

      const rect = materialRef.current.uniforms.u_resolution.value as Vector2;
      const mouseX = (rect.width / 2) / rect.width * 2 - 1;
      const mouseY = (rect.height / 2) / rect.height * -2 + 1;

      const centerFractalBeforeZoom = new THREE.Vector2(
          mouseX * materialRef.current.uniforms.u_zoomSize.value * materialRef.current.uniforms.u_aspectRatio.value + materialRef.current.uniforms.u_offset.value.x,
          mouseY * materialRef.current.uniforms.u_zoomSize.value + materialRef.current.uniforms.u_offset.value.y
      );

      const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
      materialRef.current.uniforms.u_zoomSize.value *= zoomFactor;

      const centerFractalAfterZoom = new THREE.Vector2(
          mouseX * materialRef.current.uniforms.u_zoomSize.value * materialRef.current.uniforms.u_aspectRatio.value + materialRef.current.uniforms.u_offset.value.x,
          mouseY * materialRef.current.uniforms.u_zoomSize.value + materialRef.current.uniforms.u_offset.value.y
      );

      materialRef.current.uniforms.u_offset.value.x += centerFractalBeforeZoom.x - centerFractalAfterZoom.x;
      materialRef.current.uniforms.u_offset.value.y += centerFractalBeforeZoom.y - centerFractalAfterZoom.y;
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("resize", updateScreenSize, false);

    return () => {
      window.removeEventListener("resize", updateScreenSize, false);
    };
  }, [updateScreenSize]);
  useEffect(() => {
    window.addEventListener("mousemove", updateMousePosition, false);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition, false);
    };
  }, [updateMousePosition]);
  useEffect(() => {
    window.addEventListener("keydown", updateKeyDown, false);

    return () => {
      window.removeEventListener("keydown", updateKeyDown, false);
    };
  }, [updateKeyDown]);
  useEffect(() => {
    window.addEventListener("keyup", updateKeyUp, false);

    return () => {
      window.removeEventListener("keyup", updateKeyUp, false);
    };
  }, [updateKeyUp]);


  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {

    if (e.button === 0)
      mouseDown0.current = true;
    if (e.button === 1)
      mouseDown1.current = true;
    if (e.button === 2)
      mouseDown1.current = true;
  };

  const handleClick = () => {
    const zoom = materialRef.current.uniforms.u_zoomSize.value as number;
    const offset = materialRef.current.uniforms.u_offset.value as Vector2;
    const coordinates = [];
    const mouseX = mousePosition.current.x / window.innerWidth;
    const mouseY = 1 - mousePosition.current.y / window.innerHeight;

    coordinates[0] = zoom * getAspectRatio() * mouseX + offset.x;
    coordinates[1] = zoom * mouseY + offset.y;
    props.updatePosition({x: coordinates[0], y: coordinates[1]});
    console.log(coordinates);
  }

  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {

    if (e.button === 0)
      mouseDown0.current = false;
    if (e.button === 1)
      mouseDown1.current = false;
    if (e.button === 2)
      mouseDown1.current = false;
  };

  // useFrame
  useFrame((_state, delta) => {

    let zoom = materialRef.current.uniforms.u_zoomSize.value as number;
    let offset = materialRef.current.uniforms.u_offset.value as Vector2;

    if (mouseDown0.current && isQPressed.current)
      zoom *= 1 - zoomSpeed * delta;
    if (mouseDown0.current && isAPressed.current)
      zoom *= 1 + zoomSpeed * delta;

    if ((mouseDown0.current && isQPressed.current) ||
    (mouseDown0.current && isAPressed.current)) {
      if(zoom < 0.000045)
        return;

      const zoomDelta = zoom - materialRef.current.uniforms.u_zoomSize.value;
      const mouseX = mousePosition.current.x / window.innerWidth;
      const mouseY = 1 - mousePosition.current.y / window.innerHeight;

      offset = offset.add(new Vector2(-mouseX * zoomDelta * materialRef.current.uniforms.u_aspectRatio.value, -mouseY * zoomDelta));
      materialRef.current.uniforms.u_zoomSize.value = zoom;
      materialRef.current.uniforms.u_offset.value = offset;
      // vec2 z = u_zoomSize * vec2(u_aspectRatio, 1.0) * gl_FragCoord.xy / u_resolution + u_offset;
      console.log(zoom);
    }

    if (mouseDown0.current) {

      offset = offset.add(new Vector2(-mouseDelta.current.x * zoom * 0.001, mouseDelta.current.y * zoom * 0.001));
      materialRef.current.uniforms.u_offset.value = offset;
    }

  });

  return (

    <mesh
      {...props}
      ref={meshRef}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}>

      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        fragmentShader={burningShipShader} />
    </mesh>

  );
};
