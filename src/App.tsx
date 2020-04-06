import React, { useLayoutEffect, useState, useEffect } from 'react';
import raw from 'raw.macro';
import panzoom from 'pan-zoom';
import { mat2d, mat3 } from 'gl-matrix';

const vertexShaderSource = raw('./vertex-shader.vert');
const fragmentShaderSource = raw('./fragment-shader.frag');

function App() {
    const [canvasWidth, setCanvasWidth] = useState(
        window.innerWidth * window.devicePixelRatio
    );
    const [canvasHeight, setCanvasHeight] = useState(
        window.innerHeight * window.devicePixelRatio
    );

    const canvas = React.createRef<HTMLCanvasElement>();

    const [gl, setGl] = useState<WebGLRenderingContext | null>(null);
    const [program, setProgram] = useState<WebGLProgram | null>(null);
    const [cameraUniform, setCameraUniform] = useState<WebGLUniformLocation  | null>(null);

    const [camera, setCamera] = useState(() => {
        let camera = mat2d.create();
        mat2d.translate(camera, camera, [-2.4, -1.1]);
        const zoom = 2.2 / Math.min(canvasWidth, canvasHeight);
        mat2d.scale(camera, camera, [zoom, zoom]);

        return camera;
    });

    // Initialize webgl
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
            setCameraUniform(gl.getUniformLocation(program, 'camera'));
        },
        // Empty dependency array to only run the hook once
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    // Redraw the fractal when something changed
    useLayoutEffect(() => {
        if (!gl) return;
        if (!program) return;

        // Resize viewport in case the window was resized
        gl.viewport(0, 0, canvasWidth, canvasHeight);

        // Bind inputs & render frame
        gl.uniformMatrix3fv(
            cameraUniform,
            false,
            mat3.fromMat2d(mat3.create(), camera)
        );
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
    }, [gl, program, cameraUniform, camera, canvasWidth, canvasHeight]);

    // Resize the canvas when the window is resized
    useEffect(() => {
        window.onresize = () => {
            setCanvasWidth(window.innerWidth * window.devicePixelRatio);
            setCanvasHeight(window.innerHeight * window.devicePixelRatio);
        };
    });

    useEffect(
        () =>
            panzoom(canvas.current!, (e) => {
                setCamera((oldCamera) => {
                    let camera = mat2d.clone(oldCamera);

                    // Pan
                    mat2d.translate(camera, camera, [
                        -e.dx * window.devicePixelRatio,
                        e.dy * devicePixelRatio,
                    ]);

                    // Zoom
                    const zoom = Math.exp(0.001 * e.dz);
                    mat2d.translate(camera, camera, [
                        e.x * window.devicePixelRatio,
                        canvasHeight - e.y * window.devicePixelRatio,
                    ]);
                    mat2d.scale(camera, camera, [zoom, zoom]);
                    mat2d.translate(camera, camera, [
                        -e.x * window.devicePixelRatio,
                        e.y * window.devicePixelRatio - canvasHeight,
                    ]);

                    return camera;
                });
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <canvas
            width={canvasWidth}
            height={canvasHeight}
            ref={canvas}
            style={{ width: '100vw', height: '100vh' }}
        ></canvas>
    );
}

export default App;
