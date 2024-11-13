import { useFrame } from "@react-three/fiber";

function Plane() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
    <planeGeometry args={[5, 5]} />
    <meshStandardMaterial color="lightblue" />
        </mesh>
);
}

export default Plane;