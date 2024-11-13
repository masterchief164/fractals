import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const fragmentShader = `
precision highp float;

uniform vec2 resolution;
uniform float aspect;
uniform float zoom;
uniform vec2 offset;
uniform int color_scheme;

vec2 cm(vec2 a, vec2 b) {
    return vec2(a.x * b.x - a.y * b.y, a.x * b.y + b.x * a.y);
}

float burningShip(vec2 point) {
    float alpha = 1.0;
    vec2 z = vec2(0.0, 0.0);
    vec2 z_0;
    vec2 z_1;

    for (int i = 0; i < 200; i++) {
        z_1 = z_0;
        z_0 = z;
        z_0.x = abs(z_0.x);
        z_0.y = abs(z_0.y);
        
        float x_0_sq = z_0.x * z_0.x;
        float y_0_sq = z_0.y * z_0.y;
        vec2 z_0_sq = vec2(x_0_sq - y_0_sq, 2.0 * z_0.x * z_0.y);
        
        z = z_0_sq + point;

        float z_0_mag = x_0_sq + y_0_sq;
        float z_1_mag = z_1.x * z_1.x + z_1.y * z_1.y;

        if (z_0_mag > 15.0) {
            float frac = (12.0 - z_1_mag) / (z_0_mag - z_1_mag);
            alpha = (float(i) - 1.0 + frac) / 200.0;
            break;
        }
    }
    return alpha;
}

// Function to draw grid lines
float grid(vec2 uv, float gridSize) {
    vec2 gridLines = fract(uv / gridSize);
    return step(0.0005, gridLines.x) * step(0.0005, gridLines.y); // Adjust the 0.05 to control the grid thickness
}

void main() {
    vec2 uv = zoom * vec2(aspect, 1.0) * gl_FragCoord.xy / resolution + offset;
    float s = 1.0 - burningShip(uv);
    
    // Color scheme and fractal coloring
    vec3 shade = vec3(7.0, 3.0, 2.0);
    vec3 color = pow(vec3(s), shade);

    // Create grid overlay
    float gridLines = grid(uv, 0.1*zoom);  // Adjust the grid size as needed
    vec3 gridColor = vec3(1.0, 1.0, 1.0); // White grid lines

    // Inverse the logic for grid blending
    color = mix(gridColor, color, gridLines);  // Grid lines are opaque, background is transparent

    gl_FragColor = vec4(color, 1.0);
}

`;

const vertexShader = `
varying vec2 vUv;

void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
}
`;

const BurningShip = () => {
    const containerRef = useRef<any>(null);
    const sceneRef = useRef<any>(null);
    const rendererRef = useRef<any>(null);
    const materialRef = useRef<any>(null);
    const isDraggingRef = useRef<any>(false);
    const lastMousePosRef = useRef(new THREE.Vector2());
    const zoomRef = useRef(2.0);
    const offsetRef = useRef(new THREE.Vector2(-0.5, 0));

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize Three.js scene
        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const renderer = new THREE.WebGLRenderer({ antialias: true });

        sceneRef.current = scene;
        rendererRef.current = renderer;

        containerRef.current.appendChild(renderer.domElement);

        // Create shader material
        const material = new THREE.ShaderMaterial({
            fragmentShader,
            vertexShader,
            uniforms: {
                resolution: { value: new THREE.Vector2() },
                aspect: { value: 1.0 },
                zoom: { value: zoomRef.current },
                offset: { value: offsetRef.current },
                color_scheme: { value: 3 },
            }
        });

        materialRef.current = material;

        // Create fullscreen quad
        const geometry = new THREE.PlaneGeometry(2, 2);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Handle initial sizing
        const handleResize = () => {
            if (!containerRef.current || !rendererRef.current || !materialRef.current) return;

            const width = containerRef.current.clientWidth;
            const height = containerRef.current.clientHeight;

            rendererRef.current.setSize(width, height);
            materialRef.current.uniforms.resolution.value.set(width, height);
            materialRef.current.uniforms.aspect.value = width / height;
        };

        // Mouse event handlers
        const handleMouseDown = (event: any) => {
            isDraggingRef.current = true;
            lastMousePosRef.current.set(event.clientX, event.clientY);
        };

        const handleMouseMove = (event: any) => {
            if (!isDraggingRef.current || !materialRef.current) return;

            const deltaX = event.clientX - lastMousePosRef.current.x;
            const deltaY = event.clientY - lastMousePosRef.current.y;

            const scaleFactor = zoomRef.current / rendererRef.current.domElement.height;
            offsetRef.current.x -= deltaX * scaleFactor;
            offsetRef.current.y += deltaY * scaleFactor;

            materialRef.current.uniforms.offset.value = offsetRef.current;
            lastMousePosRef.current.set(event.clientX, event.clientY);

            // Calculate mouse position in normalized WebGL coordinates
            const rect = rendererRef.current.domElement.getBoundingClientRect();
            const mouseX = (event.clientX - rect.left) / rect.width * 2 - 1; // X coordinate in WebGL space
            const mouseY = -(event.clientY - rect.top) / rect.height * 2 + 1; // Y coordinate in WebGL space

            // Convert to complex coordinates (scaled by zoom and aspect)
            const realPart = mouseX * zoomRef.current * materialRef.current.uniforms.aspect.value + offsetRef.current.x;
            const imaginaryPart = mouseY * zoomRef.current + offsetRef.current.y;

            // Log the complex coordinates
            console.log(`Cursor Position: ${realPart} + ${imaginaryPart}i`);
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
        };

        const handleWheel = (event: any) => {
            event.preventDefault();

            if (!materialRef.current || !rendererRef.current) return;

            const rect = rendererRef.current.domElement.getBoundingClientRect();

            // Get the center of the screen in normalized WebGL coordinates (0, 0)
            const mouseX = (rect.width / 2) / rect.width * 2 - 1; // Center of the screen in WebGL space
            const mouseY = (rect.height / 2) / rect.height * -2 + 1; // Center of the screen in WebGL space

            // Convert the center of the screen to fractal space before zooming
            const centerFractalBeforeZoom = new THREE.Vector2(
                mouseX * zoomRef.current * materialRef.current.uniforms.aspect.value + offsetRef.current.x,
                mouseY * zoomRef.current + offsetRef.current.y
            );

            // Determine the zoom factor based on the scroll direction (scroll down zooms out, scroll up zooms in)
            const zoomFactor = event.deltaY > 0 ? 1.1 : 0.9;
            zoomRef.current *= zoomFactor;
            // @ts-ignore
            materialRef.current.uniforms.zoom.value = zoomRef.current;

            // Convert the center of the screen to fractal space after zooming
            const centerFractalAfterZoom = new THREE.Vector2(
                // @ts-ignore
                mouseX * zoomRef.current * materialRef.current.uniforms.aspect.value + offsetRef.current.x,
                mouseY * zoomRef.current + offsetRef.current.y
            );

            // Calculate the difference in the fractal coordinates before and after zooming
            offsetRef.current.x += centerFractalBeforeZoom.x - centerFractalAfterZoom.x;
            offsetRef.current.y += centerFractalBeforeZoom.y - centerFractalAfterZoom.y;

            // Update the offset in the shader material
            // @ts-ignore
            materialRef.current.uniforms.offset.value = offsetRef.current;
        };
        // Add event listeners
        window.addEventListener('resize', handleResize);
        renderer.domElement.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
        renderer.domElement.addEventListener('wheel', handleWheel);

        // Handle initial resize
        handleResize();

        // Animation loop
        let animationFrameId: number;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            renderer.domElement.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            renderer.domElement.removeEventListener('wheel', handleWheel);
            // @ts-ignore
            cancelAnimationFrame(animationFrameId);
            renderer.dispose();
            geometry.dispose();
            material.dispose();

            if (containerRef.current) {

                // @ts-ignore
                containerRef.current.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="w-full h-full"
            style={{ touchAction: 'none' }}
        />
    );
};

export default BurningShip;