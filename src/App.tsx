import React, { useLayoutEffect } from 'react';
import raw from 'raw.macro';

const vertexShaderSource = raw('./vertex-shader.glsl');
const fragmentShaderSource = raw('./fragment-shader.glsl');

function App() {
    const canvas = React.createRef<HTMLCanvasElement>();

    useLayoutEffect(() => {
        const gl = canvas.current?.getContext('webgl');
        if (!gl) throw new Error("Couldn't get canvas context");

        // const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
        // const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
        // const program = createProgram(gl, vertexShader, fragmentShader);

        /* compile and link shaders */
        var vertex_shader = gl.createShader(gl.VERTEX_SHADER)!;
        var fragment_shader = gl.createShader(gl.FRAGMENT_SHADER)!;
        gl.shaderSource(vertex_shader, vertexShaderSource);
        gl.shaderSource(fragment_shader, fragmentShaderSource);
        gl.compileShader(vertex_shader);
        console.log(gl.getShaderInfoLog(vertex_shader));
        gl.compileShader(fragment_shader);
        console.log(gl.getShaderInfoLog(fragment_shader));
        var mandelbrot_program = gl.createProgram()!;
        gl.attachShader(mandelbrot_program, vertex_shader);
        gl.attachShader(mandelbrot_program, fragment_shader);
        gl.linkProgram(mandelbrot_program);
        gl.useProgram(mandelbrot_program);

        /* create a vertex buffer for a full-screen triangle */
        var vertex_buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buf);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([-1, -1, 3, -1, -1, 3]),
            gl.STATIC_DRAW
        );

        /* set up the position attribute */
        var position_attrib_location = gl.getAttribLocation(
            mandelbrot_program,
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

        /* find uniform locations */
        var zoom_center_uniform = gl.getUniformLocation(
            mandelbrot_program,
            'u_zoomCenter'
        );
        var zoom_size_uniform = gl.getUniformLocation(
            mandelbrot_program,
            'u_zoomSize'
        );
        var max_iterations_uniform = gl.getUniformLocation(
            mandelbrot_program,
            'u_maxIterations'
        );

        /* these hold the state of zoom operation */
        var zoom_center = [0.0, 0.0];
        var target_zoom_center = [0.0, 0.0];
        var zoom_size = 4.0;
        var stop_zooming = true;
        var zoom_factor = 1.0;
        var max_iterations = 500;

        var renderFrame = function () {
            /* bind inputs & render frame */
            gl.uniform2f(zoom_center_uniform, zoom_center[0], zoom_center[1]);
            gl.uniform1f(zoom_size_uniform, zoom_size);
            gl.uniform1i(max_iterations_uniform, max_iterations);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            /* handle zoom */
            if (!stop_zooming) {
                /* zooming in progress */
                /* gradually decrease number of iterations, reducing detail, to speed up rendering */
                max_iterations -= 10;
                if (max_iterations < 50) max_iterations = 50;

                /* zoom in */
                zoom_size *= zoom_factor;

                /* move zoom center towards target */
                zoom_center[0] +=
                    0.1 * (target_zoom_center[0] - zoom_center[0]);
                zoom_center[1] +=
                    0.1 * (target_zoom_center[1] - zoom_center[1]);

                window.requestAnimationFrame(renderFrame);
            } else if (max_iterations < 500) {
                /* once zoom operation is complete, bounce back to normal detail level */
                max_iterations += 10;
                window.requestAnimationFrame(renderFrame);
            }
        };

        renderFrame();
    }, [canvas]);

    return (
        <div>
            <canvas
                width={window.innerWidth}
                height={window.innerHeight}
                ref={canvas}
            ></canvas>
        </div>
    );
}

export default App;
