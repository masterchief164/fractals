import {useEffect, useRef, useState} from 'react'
import './App.css'
import BurningShip from "./BurningShip.tsx";
function App() {

    // const instance = useRef<Renderer | null>(null);
    //
    // const [color_scheme, setColorScheme] = useState(3);
    // const [controls_hidden, setControlsHidden] = useState(false);
    //
    // useEffect(() => {
    //     instance.current = new Renderer({color_scheme: color_scheme});
    // }, []);
    //
    // function updateColorScheme(value: number) {
    //     setColorScheme(value)
    //     instance.current?.render();
    // }
    //
    // const toggleControls = () => {
    //     setControlsHidden(!controls_hidden);
    // }
  return (
    <>
        <BurningShip/>
    </>
  )
}

export default App
