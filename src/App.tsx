import React, { useLayoutEffect, useState, useEffect } from 'react';
import raw from 'raw.macro';

const vertexShaderSource = raw('./vertex-shader.vert');
const fragmentShaderSource = raw('./fragment-shader.frag');

function App() {
    const [canvasWidth, setCanvasWidth] = useState(window.innerWidth);
    const [canvasHeight, setCanvasHeight] = useState(window.innerHeight);

    useEffect(() => {
        window.onresize = () => {
            setCanvasWidth(window.innerWidth);
            setCanvasHeight(window.innerHeight);
        };
    });

    const canvas = React.createRef<HTMLCanvasElement>();

    const [gl, setGl] = useState<WebGLRenderingContext | null>(null);
    const [program, setProgram] = useState<WebGLProgram | null>(null);

    const [camera, setCamera] = useState({
        zoom_center: [0.0, 0.0],
        target_zoom_center: [0.0, 0.0],
        zoom_size: 4.0,
        stop_zooming: true,
        zoom_factor: 1.0,
        max_iterations: 500,
    });

    useLayoutEffect(
        () => {
            const gl = canvas.current?.getContext('webgl');
            if (!gl) throw new Error("Couldn't get canvas context");

            // Compile and link shaders
            const vertexShader = gl.createShader(gl.VERTEX_SHADER)!;
            const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!;
            gl.shaderSource(vertexShader, vertexShaderSource);
            gl.shaderSource(fragmentShader, fragmentShaderSource);
            gl.compileShader(vertexShader);
            console.log(gl.getShaderInfoLog(vertexShader));
            gl.compileShader(fragmentShader);
            console.log(gl.getShaderInfoLog(fragmentShader));
            const program = gl.createProgram()!;
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);
            gl.useProgram(program);

            // Create a vertex buffer for a full-screen triangle
            const vertexBuf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuf);
            gl.bufferData(
                gl.ARRAY_BUFFER,
                new Float32Array([-1, -1, 3, -1, -1, 3]),
                gl.STATIC_DRAW
            );

            // Set up the position attribute
            const position_attrib_location = gl.getAttribLocation(
                program,
                'a_Position'
            );
            gl.enableVertexAttribArray(position_attrib_location);
            gl.vertexAttribPointer(
                position_attrib_location,
                2,
                gl.FLOAT,
                false,
                0,
                0
            );

            setGl(gl);
            setProgram(program);
        },
        // Empty dependency array to only run the hook once
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    useLayoutEffect(() => {
        if (!gl) return;
        if (!program) return;

        const { zoom_center, zoom_size, max_iterations } = camera;

        const zoom_center_uniform = gl.getUniformLocation(
            program,
            'u_zoomCenter'
        );
        const zoom_size_uniform = gl.getUniformLocation(program, 'u_zoomSize');
        const max_iterations_uniform = gl.getUniformLocation(
            program,
            'u_maxIterations'
        );

        // Bind inputs & render frame
        gl.uniform2f(zoom_center_uniform, zoom_center[0], zoom_center[1]);
        gl.uniform1f(zoom_size_uniform, zoom_size);
        gl.uniform1i(max_iterations_uniform, max_iterations);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);

        // /* handle zoom */
        // if (!stop_zooming) {
        //     /* zooming in progress */
        //     /* gradually decrease number of iterations, reducing detail, to speed up rendering */
        //     max_iterations -= 10;
        //     if (max_iterations < 50) max_iterations = 50;

        //     /* zoom in */
        //     zoom_size *= zoom_factor;

        //     /* move zoom center towards target */
        //     zoom_center[0] += 0.1 * (target_zoom_center[0] - zoom_center[0]);
        //     zoom_center[1] += 0.1 * (target_zoom_center[1] - zoom_center[1]);

        //     // window.requestAnimationFrame(renderFrame);
        // } else if (max_iterations < 500) {
        //     /* once zoom operation is complete, bounce back to normal detail level */
        //     max_iterations += 10;
        //     // window.requestAnimationFrame(renderFrame);
        // }
    }, [gl, program, camera, canvasWidth, canvasHeight]);

    return (
        <canvas width={canvasWidth} height={canvasHeight} ref={canvas}></canvas>
    );
}

export default App;
