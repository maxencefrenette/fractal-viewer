precision highp float;

const int maxIterations = 500;

uniform vec2 cameraCenter;
uniform float zoom;

vec2 f(vec2 x, vec2 c) {
	return mat2(x,-x.y,x.x)*x + c;
}

vec3 palette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(6.28318 * (c*t+d));
}

void main() {
  vec2 uv = gl_FragCoord.xy / vec2(800.0, 800.0);
  vec2 c = cameraCenter + (uv * 4.0 - vec2(2.0)) * (zoom / 4.0);
  vec2 x = vec2(0.0);
  bool escaped = false;
  int iterations = 0;    
  for (int i = 0; i < 10000; i++) {
    if (i > maxIterations) break;
    iterations = i;
    x = f(x, c);
    if (length(x) > 2.0) {
      escaped = true;
      break;
    }
  }

  gl_FragColor = escaped
    ? vec4(palette(float(iterations)/float(maxIterations), vec3(0.0),vec3(0.59,0.55,0.75),vec3(0.1, 0.2, 0.3),vec3(0.75)),1.0)
    : vec4(vec3(0.85, 0.99, 1.0), 1.0);
}