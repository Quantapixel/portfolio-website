/* One immutable mesh and one GPU draw call. No per-frame geometry or external library. */
(() => {
  const canvas = document.getElementById('loop-canvas');
  const scene = canvas?.closest('.loop-scene');
  if (!canvas || !scene) return;
  const hint = document.getElementById('loop-hint');
  function fallback() {
    scene.classList.remove('loop-ready');
    canvas.hidden = true;
    canvas.removeAttribute('tabindex');
    hint.textContent = 'a study in loops';
  }
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) { fallback(); return; }

  const vertexSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    uniform vec3 uAngles;
    uniform vec2 uScale;
    varying vec3 vNormal;
    varying vec3 vPosition;
    vec3 rotate(vec3 p) {
      float c=cos(uAngles.x), s=sin(uAngles.x);
      p=vec3(p.x,c*p.y-s*p.z,s*p.y+c*p.z);
      c=cos(uAngles.y);s=sin(uAngles.y);
      p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);
      c=cos(uAngles.z);s=sin(uAngles.z);
      return vec3(c*p.x-s*p.y,s*p.x+c*p.y,p.z);
    }
    void main() {
      vec3 p=rotate(aPosition);
      vPosition=p;vNormal=rotate(aNormal);
      gl_Position=vec4(p.xy*uScale,-p.z/8.0,1.0);
    }`;
  const fragmentSource = `
    precision mediump float;
    varying vec3 vNormal;
    varying vec3 vPosition;
    float softbox(vec3 r,vec3 direction,vec2 size) {
      vec3 d=normalize(direction);
      vec3 right=normalize(cross(vec3(0.0,1.0,0.0),d));
      vec3 up=cross(d,right);
      float forward=dot(r,d);
      vec2 uv=vec2(dot(r,right),dot(r,up))/max(forward,0.001);
      vec2 edge=1.0-smoothstep(size,size+vec2(0.34),abs(uv));
      return edge.x*edge.y*smoothstep(0.0,0.2,forward);
    }
    void main() {
      vec3 n=normalize(vNormal),v=normalize(vec3(0.0,0.0,11.0)-vPosition);
      vec3 r=reflect(-v,n);
      float key=softbox(r,vec3(-0.8,1.1,1.5),vec2(0.28,1.1));
      float strip=softbox(r,vec3(1.2,0.4,0.7),vec2(0.13,1.7));
      float top=softbox(r,vec3(0.0,1.3,-0.6),vec2(1.0,0.3));
      float rim=pow(1.0-max(dot(n,v),0.0),3.0);
      float diffuse=max(dot(n,normalize(vec3(-0.5,0.8,1.0))),0.0);
      vec3 metal=vec3(0.86,0.66,0.36);
      vec3 color=metal*(0.055+diffuse*0.12+rim*0.14);
      color+=vec3(1.0,0.86,0.55)*key*1.8;
      color+=vec3(0.82,0.88,0.95)*strip*0.75;
      color+=metal*top*1.5;
      color=color/(color+vec3(1.0));
      color=pow(color,vec3(0.4545));
      gl_FragColor=vec4(color,1.0);
    }`;
  function shader(type, source) {
    const result = gl.createShader(type);
    gl.shaderSource(result, source);gl.compileShader(result);
    if (!gl.getShaderParameter(result, gl.COMPILE_STATUS)) throw new Error('Sculpture shader unavailable');
    return result;
  }
  let program;
  try {
    program = gl.createProgram();
    const vertex = shader(gl.VERTEX_SHADER, vertexSource), fragment = shader(gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex);gl.attachShader(program, fragment);gl.linkProgram(program);
    gl.deleteShader(vertex);gl.deleteShader(fragment);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Sculpture program unavailable');
  } catch { fallback(); return; }
  gl.useProgram(program);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);

  const segments = 192, sides = 32, tube = .43;
  const positions = [], normals = [], indices = [];
  const center = t => [(2 + .65*Math.cos(3*t))*Math.cos(2*t), (2 + .65*Math.cos(3*t))*Math.sin(2*t), .85*Math.sin(3*t)];
  const normalize = a => { const length=Math.hypot(...a);return a.map(v=>v/length); };
  const cross = (a,b) => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  for (let i=0;i<=segments;i++) {
    const t=i/segments*Math.PI*2,p=center(t),next=center(t+.001);
    const tangent=normalize(next.map((v,j)=>v-p[j]));
    const normal=normalize(cross(tangent,[0,0,1])),binormal=cross(tangent,normal);
    for (let j=0;j<=sides;j++) {
      const angle=j/sides*Math.PI*2;
      const n=normal.map((v,k)=>v*Math.cos(angle)+binormal[k]*Math.sin(angle));
      positions.push(...p.map((v,k)=>v+n[k]*tube));normals.push(...n);
      if (i<segments && j<sides) {
        const a=i*(sides+1)+j,b=a+sides+1;
        indices.push(a,a+1,b,b,a+1,b+1);
      }
    }
  }
  function attribute(name, data) {
    const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(data),gl.STATIC_DRAW);
    const location=gl.getAttribLocation(program,name);
    gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,3,gl.FLOAT,false,0,0);
  }
  attribute('aPosition',positions);attribute('aNormal',normals);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,gl.createBuffer());
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
  const angles=gl.getUniformLocation(program,'uAngles'),scale=gl.getUniformLocation(program,'uScale');
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let pitch=.58,yaw=-.32,roll=-.48;
  let frame=0,lastTime=0,visible=false,lost=false,dragging=false,pointer=null,lastX=0,lastY=0;
  const home=document.getElementById('home');
  const canDraw=()=>!lost&&!document.hidden&&visible&&!home.hidden;
  function draw() {
    if (lost) return;
    gl.uniform3f(angles,pitch,yaw,roll);
    gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
  }
  function resize() {
    if(lost)return;
    const {width,height}=canvas.getBoundingClientRect();
    if(!width||!height)return;
    const ratio=Math.min(devicePixelRatio||1,1.5,960/Math.max(width,height));
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    gl.viewport(0,0,canvas.width,canvas.height);
    const shortest=Math.min(width,scene.querySelector('.loop-stage').getBoundingClientRect().height);
    gl.uniform2f(scale,shortest/width/3.25,shortest/height/3.25*1.2474);
    draw();
  }
  function animate(time) {
    frame=0;
    if(!canDraw()||motion.matches){lastTime=0;return;}
    const elapsed=time-lastTime;
    if(elapsed>=1000/30){
      if(lastTime&&!dragging)yaw+=Math.min(elapsed,80)*.000085;
      lastTime=time-elapsed%(1000/30);draw();
    }
    frame=requestAnimationFrame(animate);
  }
  function stop(){cancelAnimationFrame(frame);frame=0;lastTime=0;}
  function sync(){stop();if(canDraw()){draw();if(!motion.matches)frame=requestAnimationFrame(animate);}}
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:.05}).observe(scene);
  document.addEventListener('visibilitychange',sync);
  document.addEventListener('portfolio:route',sync);
  motion.addEventListener('change',sync);
  canvas.addEventListener('pointerdown',event=>{
    if(event.button!==0)return;
    dragging=true;pointer=event.pointerId;lastX=event.clientX;lastY=event.clientY;canvas.setPointerCapture(pointer);
  });
  canvas.addEventListener('pointermove',event=>{
    if(!dragging||event.pointerId!==pointer)return;
    yaw+=(event.clientX-lastX)*.008;pitch+=(event.clientY-lastY)*.008;
    lastX=event.clientX;lastY=event.clientY;
    if(motion.matches)draw();
  },{passive:true});
  const release=()=>{dragging=false;pointer=null;};
  canvas.addEventListener('pointerup',release);canvas.addEventListener('pointercancel',release);canvas.addEventListener('lostpointercapture',release);
  canvas.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
    event.preventDefault();yaw+=event.key==='ArrowLeft'?-.12:event.key==='ArrowRight'?.12:0;
    pitch+=event.key==='ArrowUp'?-.12:event.key==='ArrowDown'?.12:0;draw();
  });
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();lost=true;stop();fallback();});
  resize();scene.classList.add('loop-ready');
})();
