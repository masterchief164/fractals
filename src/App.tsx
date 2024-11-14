import './App.css'
import BurningShip from "./Components/BurningShip/BurningShip.tsx";
import Controls from "./Components/Controls/Controls.tsx";
import {useState} from "react";
function App() {
    const [position, setPosition] = useState({x: 0, y: 0});
    const [reset, setReset] = useState(false);
    const [maxIterations, setMaxIterations] = useState(100);
    const [colorScheme, setColorScheme] = useState(1);
    const [fractal, setFractal] = useState('mandelbrot');
    const updatePosition = (position: {x: number, y: number}) => {
        setPosition(position);
    }
  return (
    <>
        <BurningShip updatePosition={updatePosition}
                     reset={reset}
                     maxIterations={maxIterations}
                     fractal={fractal}
                     colorScheme={colorScheme}/>
        <Controls position={position}
                  setReset={setReset}
                  setMaxIterations={setMaxIterations}
                  setFractal={setFractal}
                  fractal={fractal}
                  maxIterations={maxIterations}
                  colorScheme={colorScheme}
                  setColorScheme={setColorScheme}/>
    </>
  )
}

export default App
