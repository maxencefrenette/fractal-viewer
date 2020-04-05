import React, { useLayoutEffect, useState, useEffect } from 'react';
import raw from 'raw.macro';

const vertexShaderSource = raw('./vertex-shader.vert');
const fragmentShaderSource = raw('./fragment-shader.frag');

function App() {
    const [canvasWidth, setCanvasWidth] = useState(window.innerWidth);
    const [canvasHeight, setCanvasHeight] = useState(window.innerHeight);

    const canvas = React.createRef<HTMLCanvasElement>();

    const [gl, setGl] = useState<WebGLRenderingContext | null>(null);
    const [program, setProgram] = useState<WebGLProgram | null>(null);

    const [camera, setCamera] = useState({
        center: [0.0, 0.0],
        zoom: 2.0,
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

        const { center, zoom } = camera;

        const cameraCenterUniform = gl.getUniformLocation(
            program,
            'cameraCenter'
        );
        const zoomUniform = gl.getUniformLocation(program, 'zoom');

        // Bind inputs & render frame
        gl.uniform2f(cameraCenterUniform, center[0], center[1]);
        gl.uniform1f(zoomUniform, zoom);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }, [gl, program, camera, canvasWidth, canvasHeight]);

    // Resize the canvas when the window is resized
    useEffect(() => {
        window.onresize = () => {
            setCanvasWidth(window.innerWidth);
            setCanvasHeight(window.innerHeight);
        };
    });

    // Zoom when scrolling
    useEffect(() => {
        window.onwheel = (e: WheelEvent) => {
            const zoom = camera.zoom * Math.exp(0.0008 * e.deltaY);
            setCamera({
                ...camera,
                zoom,
            })
        };
    });

    return (
        <canvas width={canvasWidth} height={canvasHeight} ref={canvas}></canvas>
    );
}

export default App;
