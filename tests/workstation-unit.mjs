import ts from 'typescript';
import {readFile,writeFile} from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=await readFile(new URL('../app/prototype/cave/scene.ts',import.meta.url),'utf8');
const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const results=[];
function check(name,fn){try{fn();results.push({name,pass:true});console.log('PASS',name)}catch(e){results.push({name,pass:false,error:e.message});console.log('FAIL',name,e.message)}}
function setup({motion=true,intro=true,noContext=false}={}){
 const frames=new Map(),timers=new Map(),images=[],observers=[],events=new Map(),hostEvents=new Map(),canvasEvents=new Map();let id=0,draws=0,removed=false;
 const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})}, {get(o,k){return k in o?o[k]:()=>{if(k==='drawImage')draws++}},set(o,k,v){o[k]=v;return true}});
 const canvas={width:0,height:0,setAttribute(){},getContext:()=>noContext?null:ctx,addEventListener:(k,v)=>canvasEvents.set(k,v),removeEventListener:k=>canvasEvents.delete(k),remove(){removed=true}};
 const parent={addEventListener:(k,v)=>hostEvents.set(k,v),removeEventListener:k=>hostEvents.delete(k)};
 const host={parentElement:parent,appendChild(){},getBoundingClientRect:()=>({width:1440,height:960,left:0,top:0})};
 const states=[],doc={hidden:false,createElement:()=>canvas,addEventListener:(k,v)=>events.set(k,v),removeEventListener:k=>events.delete(k)};
 const context={exports:{},document:doc,devicePixelRatio:3,
  Image:class{constructor(){images.push(this)}src='';onload=null;onerror=null},
  requestAnimationFrame:fn=>{frames.set(++id,fn);return id},cancelAnimationFrame:key=>frames.delete(key),
  setTimeout:fn=>{timers.set(++id,fn);return id},clearTimeout:key=>timers.delete(key),
  ResizeObserver:class{constructor(cb){this.cb=cb;this.type='resize';observers.push(this)}observe(){}disconnect(){this.disconnected=true}},
  IntersectionObserver:class{constructor(cb){this.cb=cb;this.type='intersection';observers.push(this)}observe(){}disconnect(){this.disconnected=true}},
 };
 vm.runInNewContext(code,context);
 let ready=0,failed=0;
 const controller=context.exports.createCaveScene(host,{motion,intro,onState:(...args)=>states.push(args),onReady:()=>ready++,onError:()=>failed++});
 const step=time=>{const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn(time))};
 const load=(name,success=true)=>{const image=images.find(i=>i.src.endsWith(name));assert(image,`missing ${name}`);if(success)image.onload?.();else image.onerror?.()};
 return {controller,frames,timers,images,observers,events,hostEvents,canvasEvents,states,canvas,doc,step,load,get draws(){return draws},get removed(){return removed},get ready(){return ready},get failed(){return failed}};
}
check('canvas unavailable returns inert controls and reports once',()=>{const s=setup({noContext:true});assert.equal(s.failed,1);for(const fn of Object.values(s.controller))fn();assert.equal(s.frames.size,0)});
check('intro starts only after primary artwork loads',()=>{const s=setup();assert.equal(s.states.length,0);s.load('original.webp');assert.equal(s.ready,1);assert.equal(s.states.at(-1)[0],'playing');s.controller.dispose()});
check('finish before artwork prevents late intro and seen marker',()=>{const s=setup();s.controller.finish();s.load('original.webp');assert(!s.states.some(v=>v[0]==='playing'||v[1]));s.controller.dispose()});
check('first arrival completes after bounded elapsed rendering',()=>{const s=setup();s.load('original.webp');for(let t=100;t<3300;t+=40)s.step(t);assert.equal(s.states.at(-1)[0],'complete');assert.equal(s.states.at(-1)[1],true);s.controller.dispose()});
check('primary image failure never claims a completed arrival',()=>{const s=setup();s.load('original.webp',false);assert.equal(s.failed,1);assert(!s.states.some(v=>v[1]));s.controller.dispose()});
check('primary image timeout preserves inert fallback',()=>{const s=setup();[...s.timers.values()][0]();assert.equal(s.failed,1);assert.equal(s.ready,0);s.controller.dispose()});
check('secondary asset failure keeps original artwork renderer',()=>{const s=setup({intro:false});s.load('original.webp');s.load('clean-plate.webp',false);s.step(100);assert.equal(s.failed,0);assert(s.draws>0);s.controller.dispose()});
check('reduced motion settles without continuous frames',()=>{const s=setup({motion:false});s.load('original.webp');s.step(100);assert.equal(s.frames.size,0);assert(!s.states.some(v=>v[0]==='playing'));s.controller.dispose()});
check('pause stops frame loop and replay',()=>{const s=setup();s.load('original.webp');s.controller.setMotion(false);s.step(100);s.controller.replay();assert.equal(s.frames.size,0);assert.equal(s.states.at(-1)[0],'complete');s.controller.dispose()});
check('suit view renders no continuous workstation loop',()=>{const s=setup();s.load('original.webp');s.controller.setView('suit');s.step(100);assert.equal(s.frames.size,0);s.controller.setView('workstation');s.step(140);assert(s.frames.size>0);s.controller.dispose()});
check('hidden document cancels and visible document resumes',()=>{const s=setup();s.load('original.webp');s.doc.hidden=true;s.events.get('visibilitychange')();assert.equal(s.frames.size,0);s.doc.hidden=false;s.events.get('visibilitychange')();assert.equal(s.frames.size,1);s.controller.dispose()});
check('offscreen scene cancels frames and reentry resumes',()=>{const s=setup();s.load('original.webp');const observer=s.observers.find(o=>o.type==='intersection');observer.cb([{isIntersecting:false}]);assert.equal(s.frames.size,0);observer.cb([{isIntersecting:true}]);assert.equal(s.frames.size,1);s.controller.dispose()});
check('context loss never marks unfinished arrival seen',()=>{const s=setup();s.load('original.webp');s.canvasEvents.get('contextlost')({preventDefault(){}});assert.equal(s.failed,1);assert.equal(s.frames.size,0);assert(!s.states.some(v=>v[1]));s.controller.dispose()});
check('repeated context-loss events report degradation once',()=>{const s=setup();const loss=s.canvasEvents.get('contextlost');loss({preventDefault(){}});loss({preventDefault(){}});assert.equal(s.failed,1);s.controller.dispose()});
check('late primary image cannot revive a lost canvas context',()=>{const s=setup();s.canvasEvents.get('contextlost')({preventDefault(){}});s.load('original.webp');assert.equal(s.failed,1);assert.equal(s.ready,0);assert(!s.states.some(v=>v[0]==='playing'||v[1]));s.controller.dispose()});
check('dispose removes observers, handlers, timers and canvas',()=>{const s=setup();s.controller.dispose();assert(s.removed);assert.equal(s.frames.size,0);assert.equal(s.timers.size,0);assert.equal(s.events.size+s.hostEvents.size+s.canvasEvents.size,0);assert(s.observers.every(o=>o.disconnected));assert(s.images.every(i=>i.onload===null&&i.onerror===null&&i.src===''));s.controller.dispose()});
check('late load callback after disposal is harmless',()=>{const s=setup();const load=s.images[0].onload;s.controller.dispose();load();assert.equal(s.ready,0);assert.equal(s.frames.size,0)});
check('high DPI canvas is capped at 1.75x desktop',()=>{const s=setup();assert.equal(s.canvas.width,1440*1.75);assert.equal(s.canvas.height,960*1.75);s.controller.dispose()});
await writeFile(new URL('../../frontier-aimplify/work/builder/2026-10-11-bairam-workstation/evidence/unit.json',import.meta.url),JSON.stringify({results},null,2)+'\n');
if(results.some(r=>!r.pass))process.exitCode=1;
