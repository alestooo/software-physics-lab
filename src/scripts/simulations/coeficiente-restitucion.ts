const ball = document.querySelector<HTMLElement>("#bounce-ball");
const eInput = document.querySelector<HTMLInputElement>("#bounce-e");
const hInput = document.querySelector<HTMLInputElement>("#bounce-height");
const gInput = document.querySelector<HTMLInputElement>("#bounce-gravity");
if (ball && eInput && hInput && gInput) {
  const set = (id:string,value:string) => {
    const el=document.getElementById(id); if(el)el.textContent=value;
  };
  const values=()=>({e:Number(eInput.value),h:Number(hInput.value),g:Number(gInput.value)});
  let frame=0, started=0;
  const render=(h:number,count:number)=>{
    const scene=ball.parentElement;
    const floor=scene?.querySelector<HTMLElement>(".bounce-floor");
    if(scene && floor){
      const floorY=floor.getBoundingClientRect().top-scene.getBoundingClientRect().top-scene.clientTop;
      const groundY=floorY-ball.offsetHeight;
      const maxHeight=Number(hInput.max)||8;
      const scale=Math.max(0,groundY-12)/maxHeight;
      ball.style.left="50%";
      ball.style.bottom="auto";
      ball.style.top=`${groundY-Math.min(maxHeight,Math.max(0,h))*scale}px`;
      ball.style.translate="none";
      ball.style.transform="translateX(-50%)";
    }
    set("bounce-live-height",h.toFixed(2)+" m");
    set("bounce-live-count",String(count));
  };
  function reset() {
    cancelAnimationFrame(frame);
    const {e,h,g}=values(), u=Math.sqrt(2*g*h);
    set("bounce-e-value",e.toFixed(2));set("bounce-live-e",e.toFixed(2));
    set("bounce-height-value",h.toFixed(2));set("bounce-gravity-value",g.toFixed(2));
    set("bounce-impact-speed",u.toFixed(2)+" m/s");
    set("bounce-rebound-speed",(e*u).toFixed(2)+" m/s");
    set("bounce-next-height",(e*e*h).toFixed(2)+" m");
    set("bounce-energy",(100*e*e).toFixed(1)+" %");
    set("bounce-state","Listo");render(h,0);
  }
  function start() {
    reset();started=performance.now();
    const {e,h,g}=values(), fall=Math.sqrt(2*h/g), u=g*fall;
    set("bounce-state","En movimiento");
    const step=(now:number)=>{
      let t=(now-started)/1000;
      if(t<fall){render(h-g*t*t/2,0);frame=requestAnimationFrame(step);return;}
      t-=fall;let v=u*e,count=1;
      while(v>0.025 && t>=2*v/g && count<10000){t-=2*v/g;v*=e;count++;}
      if(v<=0.025||count>=10000){render(0,count);set("bounce-state","En reposo");return;}
      render(Math.max(0,v*t-g*t*t/2),count);
      frame=requestAnimationFrame(step);
    };
    frame=requestAnimationFrame(step);
  }
  [eInput,hInput,gInput].forEach(el=>el.addEventListener("input",reset));
  const presets:Record<string,number>={dead:0,realistic:0.7,arcade:0.9,elastic:1};
  document.querySelectorAll<HTMLButtonElement>("[data-bounce-preset]").forEach(b=>b.addEventListener("click",()=>{
    const val=presets[b.dataset.bouncePreset??""];
    if(val!==undefined){eInput.value=String(val);document.querySelectorAll("[data-bounce-preset]").forEach(el=>el.classList.toggle("active",el===b));reset();}
  }));
  document.getElementById("bounce-start")?.addEventListener("click",start);
  document.getElementById("bounce-reset")?.addEventListener("click",reset);
  reset();
}
export {};
