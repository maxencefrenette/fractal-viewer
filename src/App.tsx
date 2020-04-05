import React, { useLayoutEffect } from 'react';

function App() {
  const canvas = React.createRef<HTMLCanvasElement>();

  useLayoutEffect(() => {
    const ctx = canvas.current?.getContext("2d");

    if (!ctx) {
      throw new Error("Couldn't get canvas context");
    }

    ctx.fillRect(100, 100, 100, 100)
  }, [canvas])

  return (
    <div>
      <canvas width={window.innerWidth} height={window.innerHeight} ref={canvas}></canvas>
    </div>
  );
}

export default App;
