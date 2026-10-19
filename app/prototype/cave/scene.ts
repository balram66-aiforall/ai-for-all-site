export type CaveView = 'workstation' | 'suit';
export type CaveController = {
  replay(): void;
  finish(): void;
  setView(view: CaveView): void;
  setMotion(enabled: boolean): void;
  dispose(): void;
};
type Options = {
  motion: boolean;
  intro: boolean;
  onState(state: 'playing' | 'complete', remember?: boolean): void;
  onReady(): void;
  onError(): void;
};
const ASSETS = '/assets/cave/workstation/';
const DURATION = 2800;
const ease = (x: number) => 1 - (1 - x) ** 3;
const inert: CaveController = { replay() {}, finish() {}, setView() {}, setMotion() {}, dispose() {} };

/** Layered Artifactory artwork with local, choreographed motion. No agent API calls. */
export function createCaveScene(host: HTMLDivElement, options: Options): CaveController {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) { options.onError(); return inert; }
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  let disposed = false, failed = false, ready = false, visible = true;
  let allowIntro = options.intro;
  let motion = options.motion, playing = false, view: CaveView = 'workstation';
  let frame = 0, last = 0, elapsed = 0, clock = 0, width = 1, height = 1;
  let pointerX = 0, pointerY = 0, x = 0, y = 0;
  let original: HTMLImageElement | null = null, plate: HTMLImageElement | null = null;
  let left: HTMLImageElement | null = null, right: HTMLImageElement | null = null;
  const pending = new Set<HTMLImageElement>();
  const timers = new Set<ReturnType<typeof setTimeout>>();

  function load(name: string, done: (image: HTMLImageElement | null) => void) {
    const image = new Image();
    pending.add(image);
    const timer = setTimeout(() => settle(null), 8000);
    timers.add(timer);
    function settle(value: HTMLImageElement | null) {
      if (!pending.delete(image)) return;
      clearTimeout(timer); timers.delete(timer);
      image.onload = image.onerror = null;
      if (!disposed) done(value);
    }
    image.onload = () => settle(image);
    image.onerror = () => settle(null);
    image.src = ASSETS + name;
  }
  function request() {
    if (!disposed && !failed && !frame && visible && !document.hidden) frame = requestAnimationFrame(tick);
  }
  function dimensions() {
    const rect = host.getBoundingClientRect();
    width = Math.max(1, rect.width); height = Math.max(1, rect.height);
    const dpr = Math.min(devicePixelRatio || 1, width < 700 ? 1.5 : 1.75);
    canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    request();
  }
  function arm(image: HTMLImageElement, px: number, py: number, angle: number) {
    ctx!.save(); ctx!.translate(px, py); ctx!.rotate(angle);
    ctx!.drawImage(image, -px, -py, 1344, 768); ctx!.restore();
  }
  // Screen polygons follow the photographed bezels; decorative traces stay inside them.
  const screens = [
    [[66,358],[166,364],[166,438],[65,441]],
    [[174,367],[313,369],[312,441],[173,438]],
    [[337,370],[433,371],[433,447],[333,445]],
    [[444,371],[593,371],[593,445],[444,449]],
    [[744,371],[850,370],[852,446],[744,443]],
    [[860,370],[983,368],[985,445],[860,446]],
    [[998,367],[1164,361],[1166,446],[997,444]],
    [[1177,357],[1265,351],[1265,444],[1178,447]],
  ];
  function systems() {
    screens.forEach((points, i) => {
      const start = points[0], sx = start[0], sy = start[1];
      const sw = points[1][0] - sx, sh = points[3][1] - sy;
      ctx!.save(); ctx!.beginPath(); points.forEach(([a,b],j) => j ? ctx!.lineTo(a,b) : ctx!.moveTo(a,b)); ctx!.closePath(); ctx!.clip();
      ctx!.globalCompositeOperation = 'screen';
      const scan = sy + ((clock * 6 + i * 9) % Math.max(1,sh));
      const gradient = ctx!.createLinearGradient(0,scan-8,0,scan+8);
      gradient.addColorStop(0,'rgba(140,206,224,0)'); gradient.addColorStop(.5,'rgba(157,213,227,.13)'); gradient.addColorStop(1,'rgba(140,206,224,0)');
      ctx!.fillStyle=gradient; ctx!.fillRect(sx,scan-8,sw,16);
      ctx!.strokeStyle='rgba(174,224,234,.32)'; ctx!.lineWidth=.7; ctx!.beginPath();
      for(let n=0;n<=40;n++) {
        const a=sx+sw*.08+n/40*sw*.82;
        const b=sy+sh*.67+Math.sin(n*.46+clock*.8+i)*sh*.07+Math.sin(n*1.21-clock*.4)*sh*.035;
        if(n)ctx!.lineTo(a,b);else ctx!.moveTo(a,b);
      }
      ctx!.stroke(); ctx!.restore();
    });
  }
  function bat(px: number, py: number, size: number, phase: number, rotation: number) {
    const flap = .4 + Math.sin(phase) * .36;
    ctx!.save(); ctx!.translate(px,py); ctx!.rotate(rotation); ctx!.scale(size,size);
    ctx!.fillStyle='#060b10';
    for(const side of [-1,1]) {
      ctx!.save(); ctx!.scale(side,1); ctx!.beginPath(); ctx!.moveTo(0,0);
      ctx!.quadraticCurveTo(.42,-flap,1,-.2-flap);ctx!.lineTo(.79,.1);
      ctx!.quadraticCurveTo(.58,-.03,.53,.29);ctx!.quadraticCurveTo(.34,.1,.26,.35);ctx!.lineTo(0,.18);ctx!.closePath();ctx!.fill();ctx!.restore();
    }
    ctx!.beginPath();ctx!.ellipse(0,.06,.065,.22,0,0,Math.PI*2);ctx!.fill();
    ctx!.beginPath();ctx!.moveTo(-.07,-.05);ctx!.lineTo(-.075,-.24);ctx!.lineTo(0,-.15);ctx!.lineTo(.075,-.24);ctx!.lineTo(.07,-.05);ctx!.fill();ctx!.restore();
  }
  function render() {
    if (!ready || !original || disposed || failed) return;
    ctx!.fillStyle='#091015';ctx!.fillRect(0,0,width,height);
    const mobile=width<=700;
    const scale=mobile ? Math.max(width/1344,(height*.6)/768) : Math.max(width/1344,height/768);
    const w=1344*scale,h=768*scale;
    const progress=playing?Math.min(1,elapsed/DURATION):1;
    const arrival=playing?1+.09*(1-ease(progress)):1;
    const ox=(width-w)/2+x*5,oy=mobile?height*.14+y*3:(height-h)/2+y*3;
    ctx!.save();ctx!.translate(width/2,height*.49);ctx!.scale(arrival,arrival);ctx!.translate(-width/2,-height*.49);
    ctx!.translate(ox,oy);ctx!.scale(scale,scale);
    const layered=plate&&left&&right;
    ctx!.drawImage(layered?plate!:original,0,0,1344,768);
    if(layered) {
      arm(left!,381,361,Math.sin(clock*.32)*.013);
      arm(right!,1152,224,Math.sin(clock*.27)*.015);
    }
    systems();ctx!.restore();
    if(playing) {
      // The swarm crosses the lens, rather than a loader that gates the site.
      for(let i=0;i<19;i++) {
        const delay=(i%7)*.035;
        const t=(progress-delay)/.69;
        if(t<0||t>1)continue;
        const near=i%4===0;
        const px=width*(.3+(i%5)*.12)+(t*t)*(i%2===0?width*1.1:-width*1.1);
        const py=height*(.38+(i%6)*.047)-Math.sin(t*Math.PI*.7)*height*.5;
        const size=(near?25:11)*(1+t*3)*(width<700?.68:1);
        bat(px,py,size,elapsed*.019+i*2,(i%2?-.24:.28));
      }
      const darkness=(1-ease(Math.min(1,progress/.6)))*.72;
      ctx!.fillStyle=`rgba(3,7,11,${darkness})`;ctx!.fillRect(0,0,width,height);
    }
  }
  function tick(time: number) {
    frame=0;
    if(disposed||failed||!visible||document.hidden)return;
    const dt=last?Math.min(time-last,80):0;last=time;
    if(motion)clock+=dt/1000;
    if(playing) {
      elapsed+=dt;
      if(elapsed>=DURATION){playing=false;options.onState('complete',true);}
    }
    x+=(pointerX-x)*.065;y+=(pointerY-y)*.065;
    if(view==='workstation')render();
    if(motion&&ready&&view==='workstation')request();else last=0;
  }
  function finish() {
    allowIntro=false;
    const wasPlaying=playing;playing=false;elapsed=DURATION;
    pointerX=pointerY=x=y=0;
    if(wasPlaying)options.onState('complete',true);
    request();
  }
  function replay() {
    if(disposed||failed||!ready||!motion||view!=='workstation')return;
    elapsed=0;last=0;playing=true;options.onState('playing');request();
  }
  const pointer=(event:PointerEvent)=>{
    if(!motion||event.pointerType==='touch'||width<700)return;
    const r=host.getBoundingClientRect();pointerX=(event.clientX-r.left)/r.width-.5;pointerY=(event.clientY-r.top)/r.height-.5;
  };
  const leave=()=>{pointerX=pointerY=0;};
  const visibility=()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else request();};
  const loss=(event:Event)=>{event.preventDefault();if(disposed||failed)return;failed=true;playing=false;cancelAnimationFrame(frame);frame=0;options.onState('complete');options.onError();};
  const ro=new ResizeObserver(dimensions);ro.observe(host);
  const io=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;if(!visible){cancelAnimationFrame(frame);frame=0;last=0;}else request();});io.observe(host);
  host.parentElement?.addEventListener('pointermove',pointer);
  host.parentElement?.addEventListener('pointerleave',leave);
  document.addEventListener('visibilitychange',visibility);canvas.addEventListener('contextlost',loss);
  dimensions();
  load('original.webp',image=>{
    if(failed)return;
    if(!image){failed=true;options.onError();return;}
    original=image;ready=true;render();options.onReady();
    if(allowIntro&&motion)replay();else options.onState('complete');request();
  });
  load('clean-plate.webp',image=>{plate=image;request();});
  load('arm-left.webp',image=>{left=image;request();});
  load('arm-right.webp',image=>{right=image;request();});
  return {
    replay,finish,
    setView(next){finish();view=next;request();},
    setMotion(enabled){motion=enabled;if(!motion){finish();cancelAnimationFrame(frame);frame=0;render();last=0;}else request();},
    dispose(){
      if(disposed)return;disposed=true;cancelAnimationFrame(frame);ro.disconnect();io.disconnect();
      timers.forEach(clearTimeout);pending.forEach(image=>{image.onload=image.onerror=null;image.src='';});pending.clear();
      host.parentElement?.removeEventListener('pointermove',pointer);host.parentElement?.removeEventListener('pointerleave',leave);
      document.removeEventListener('visibilitychange',visibility);canvas.removeEventListener('contextlost',loss);canvas.remove();
    },
  };
}
