/* Lightweight WebGL fluid-noise background. No dependencies, no build step.
   Reads its two colors from data-color-a / data-color-b (hex) on the canvas element.
   Respects prefers-reduced-motion: renders one static frame and stops. */
(function () {
  "use strict";
  var canvas = document.getElementById("fluidBg");
  if (!canvas) return;
  var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) return; // no WebGL support: canvas stays transparent, plain CSS bg shows through

  function hexToRgb01(hex) {
    hex = hex.replace("#", "");
    var r = parseInt(hex.substring(0, 2), 16) / 255;
    var g = parseInt(hex.substring(2, 4), 16) / 255;
    var b = parseInt(hex.substring(4, 6), 16) / 255;
    return [r, g, b];
  }
  var colorA = hexToRgb01(canvas.dataset.colorA || "#132A46");
  var colorB = hexToRgb01(canvas.dataset.colorB || "#2FBF9E");
  var speed = parseFloat(canvas.dataset.speed || "0.065");
  var scale = parseFloat(canvas.dataset.scale || "1.1");

  var vsSource = "attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }";
  var fsSource = [
    "precision highp float;",
    "uniform float u_time;",
    "uniform vec2 u_res;",
    "uniform vec3 u_colorA;",
    "uniform vec3 u_colorB;",
    "uniform float u_scale;",
    "float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }",
    "float noise(vec2 p){",
    "  vec2 i = floor(p), f = fract(p);",
    "  float a = hash(i), b = hash(i + vec2(1.0,0.0));",
    "  float c = hash(i + vec2(0.0,1.0)), d = hash(i + vec2(1.0,1.0));",
    "  vec2 u = f * f * (3.0 - 2.0 * f);",
    "  return mix(a,b,u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;",
    "}",
    "float fbm(vec2 p){",
    "  float v = 0.0, a = 0.5;",
    "  for (int i = 0; i < 4; i++){ v += a * noise(p); p *= 2.0; a *= 0.5; }",
    "  return v;",
    "}",
    "void main(){",
    "  vec2 uv = gl_FragCoord.xy / u_res.xy;",
    "  vec2 p = uv * u_scale;",
    "  p.x *= u_res.x / u_res.y;",
    "  float t = u_time;",
    "  vec2 warp = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(t * 0.9, 5.2)));",
    "  float n = fbm(p + warp * 1.6);",
    "  vec3 col = mix(u_colorA, u_colorB, smoothstep(0.09, 0.40, n));",
    "  gl_FragColor = vec4(col, 1.0);",
    "}"
  ].join("\n");

  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error("fluid-bg shader compile error:", gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }
  var vs = compile(gl.VERTEX_SHADER, vsSource);
  var fs = compile(gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return;
  var program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("fluid-bg program link error:", gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var pLoc = gl.getAttribLocation(program, "p");
  gl.enableVertexAttribArray(pLoc);
  gl.vertexAttribPointer(pLoc, 2, gl.FLOAT, false, 0, 0);

  var uTime = gl.getUniformLocation(program, "u_time");
  var uRes = gl.getUniformLocation(program, "u_res");
  var uColorA = gl.getUniformLocation(program, "u_colorA");
  var uColorB = gl.getUniformLocation(program, "u_colorB");
  var uScale = gl.getUniformLocation(program, "u_scale");
  gl.uniform3fv(uColorA, colorA);
  gl.uniform3fv(uColorB, colorB);
  gl.uniform1f(uScale, scale);
  // u_res must never be (0,0) — gl_FragCoord / u_res would divide by zero and
  // collapse the whole shader to one flat color. Seed it from the canvas's
  // current (even if still-default) backing size; resize() below corrects it
  // to the real size as soon as clientWidth is readable.
  gl.uniform2f(uRes, canvas.width, canvas.height);

  function resize() {
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var w = Math.round(canvas.clientWidth * dpr), h = Math.round(canvas.clientHeight * dpr);
    // clientWidth/Height can read 0 for a frame or two before layout has settled
    // (web fonts, first paint). Never lock that in as the canvas's real size —
    // just skip this tick and let the next rAF frame try again.
    if (w <= 0 || h <= 0) return;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    }
  }

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function draw(t) {
    resize();
    gl.uniform1f(uTime, t);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  draw(0); // paint immediately; if clientWidth isn't ready yet resize() just
           // no-ops (guard above) rather than locking in a bad 0×0 size — the
           // very next rAF tick a few ms later will pick up the real size.
  if (reduceMotion) return;
  var start = null;
  function frame(ts) {
    if (start === null) start = ts;
    draw((ts - start) / 1000 * speed);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
