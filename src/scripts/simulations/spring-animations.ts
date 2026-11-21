const kEl=document.querySelector<HTMLInputElement>("#spring-k");
const cEl=document.querySelector<HTMLInputElement>("#spring-c");
const curve=document.querySelector<SVGPolylineElement>("#spring-curve");
const obj=document.querySelector<HTMLElement>("#spring-object");
if(kEl&&cEl&&curve&&obj){
  const kInput=kEl,cInput=cEl,line=curve,object=obj;
  let frame=0;
  const put=(id:string,t:string)=>{const el=document.getElementById(id);if(el)el.textContent=t};
  function displacement(t:number,k:number,c:number){
    const a=c/2,w=Math.sqrt(k),d=a*a-k;
    if(Math.abs(d)<0.001)return 1-(1+a*t)*Math.exp(-a*t);
    if(d<0){const b=Math.sqrt(-d);return 1-Math.exp(-a*t)*(Math.cos(b*t)+a/b*Math.sin(b*t))}
    const b=Math.sqrt(d),r1=-a+b,r2=-a-b;
    return 1+(r2*Math.exp(r1*t)-r1*Math.exp(r2*t))/(r1-r2);
  }
  function run(){
    cancelAnimationFrame(frame);
    const k=Number(kInput.value),c=Number(cInput.value),critical=2*Math.sqrt(k),z=c/critical;
    const regime=Math.abs(z-1)<0.001?"Crítico":z<1?"Subamortiguado":"Sobreamortiguado";
    put("spring-k-val",k.toFixed(0));put("spring-c-val",c.toFixed(2));put("spring-regime",regime);
    put("spring-ratio","ζ = "+z.toFixed(3));
    put("spring-summary",`ω₀ = ${Math.sqrt(k).toFixed(2)} rad/s · c crítico = ${critical.toFixed(2)} N·s/m · ${regime}`);
    line.setAttribute("points",Array.from({length:501},(_,i)=>{const t=i/100;return `${45+535*t/5},${220-100*displacement(t,k,c)}`}).join(" "));
    const start=performance.now();
    const animate=(now:number)=>{const t=Math.min(5,(now-start)/1000);object.style.left=(8+42*displacement(t,k,c))+"%";if(t<5)frame=requestAnimationFrame(animate);};
    frame=requestAnimationFrame(animate);
  }
  for(const el of [kInput,cInput])el.addEventListener("input",run);
  document.querySelectorAll<HTMLButtonElement>("[data-spring]").forEach(b=>b.addEventListener("click",()=>{
    const crit=2*Math.sqrt(Number(kInput.value));
    cInput.value=(crit*(b.dataset.spring==="under"?0.45:b.dataset.spring==="critical"?1:1.8)).toFixed(2);run();
  }));
  document.getElementById("spring-replay")?.addEventListener("click",run);run();
}
export {};
