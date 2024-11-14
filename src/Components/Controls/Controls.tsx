import React from "react";
import './Controls.css'
import {FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography} from "@mui/material";


interface ILocalProps {
    position: {x: number, y: number};
    setReset: (reset: boolean) => void;
    setMaxIterations: (maxIterations: number) => void;
    maxIterations: number;
    colorScheme: number;
    setColorScheme: (colorScheme: number) => void;
    setFractal: (fractal: string) => void;
    fractal: string;
}

const Controls: React.FC<ILocalProps> = ({position, setReset, maxIterations, setMaxIterations, setColorScheme, colorScheme}) => {

    const handleResetOn = () => {
        console.log("Resetting");
        setReset(true);
        setColorScheme(1);
        setMaxIterations(100);
    };

    const handleResetOff = () => {
        setReset(false);
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            console.log(e.target.value);
            if(e.target.value === '') {
                setMaxIterations(0);
                return;
            }
            setMaxIterations(parseInt(e.target.value));
        } catch (e) {
            console.log(e);
            setMaxIterations(1000);
        }
    }

    const handleSelectChange = (e: SelectChangeEvent) => {
        setColorScheme(parseInt(e.target.value));
    }

    // const handleFractalChange = (e: SelectChangeEvent) => {
    //     setFractal(e.target.value);
    // }

    return (
        <div id={'controls-container'} >
            <button onMouseDown={handleResetOn} onMouseUp={handleResetOff}>Reset</button>
            <Typography>Use Q+mouse button to zoom in</Typography>
            <Typography>Use A+mouse button to zoom out</Typography>
            <p>Real part: {position.x}</p>
            <p>Imaginary Part: {position.y}</p>
            <TextField sx={{margin: '10px'}} id="iterations-text" label="Max Iterations" variant="outlined"
                       value={maxIterations} onChange={handleChange}/>
            <FormControl sx={{margin: '10px'}}>
                <InputLabel id="simple-color-scheme">Color Scheme</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={colorScheme.toString()}
                    label="Color Scheme"
                    onChange={handleSelectChange}
                >
                    {[1, 2, 3, 4, 5].map((value) => (
                        <MenuItem value={value} key={value}>{value}</MenuItem>
                    ))}

                </Select>
            </FormControl>
            {/*<FormControl  sx={{margin: '10px'}}>*/}
            {/*    <InputLabel id="fractal">Fractal</InputLabel>*/}
            {/*    <Select*/}
            {/*        labelId="fractal-select-label"*/}
            {/*        id="fractal-select"*/}
            {/*        value={fractal}*/}
            {/*        label="Fractal Select"*/}
            {/*        onChange={handleFractalChange}*/}
            {/*    >*/}
            {/*        {['Mandelbrot', 'BurningShip'].map((value) => (*/}
            {/*            <MenuItem value={value.toLowerCase()} key={value}>{value}</MenuItem>*/}
            {/*        ))}*/}

            {/*    </Select>*/}
            {/*</FormControl>*/}

        </div>
    );
};

export default Controls;