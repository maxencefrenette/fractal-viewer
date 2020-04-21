# Fractal Viewer

[![Netlify Status](https://api.netlify.com/api/v1/badges/36da7742-415f-4f65-a382-2047fe7cbd4d/deploy-status)](https://app.netlify.com/sites/fractal-viewer/deploys)

A simple fractal viewer I made as a weekend project. Displays the manldelbrot
set using WebGL. Based on
[this tutorial](https://gpfault.net/posts/mandelbrot-webgl.txt.html).

## Features

- GPU-accelerated rendering using WebGL
- Panning and zooming with a mouse or a touchscreen
- Support for high-DPI screens

## Limitations

- Zooming doesn't perfectly follow the fingers on touchscreens
- The float precision is quickly reached when zooming
