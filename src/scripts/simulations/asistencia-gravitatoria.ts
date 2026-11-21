const root = document.querySelector("#gravity-assist-lab");
if (root) {
  type View = "mission" | "jupiter" | "saturn";
  type Point = { t: number; speed: number };
  const day = 86400000;
  const epoch = Date.UTC(1977, 8, 5);
  const days = (y: number, m: number, d: number) => (Date.UTC(y,m-1,d)-epoch)/day;
  const j = days(1979,3,5), s = days(1980,11,12), end = days(1981,6,1);
  const AU = 149597870.7, muSun = 132712440018;
  const solarSpeed = (v: number, r0: number, r: number) =>
    Math.sqrt(Math.max(0, v*v+2*muSun/AU*(1/r-1/r0)));
  const flyby = (v: number, V: number, mu: number, rp: number) => {
    const u = Math.sqrt(v*v-V*V);
    const delta = 2*Math.asin(1/(1+rp*u*u/mu));
    return Math.hypot(V+u*Math.sin(delta),u*Math.cos(delta));
  };
  const jIn = solarSpeed(42,1,5.2), jOut = flyby(jIn,13.06,126686534,4.89*71398);
  const sIn = solarSpeed(jOut,5.2,9.58), sOut = flyby(sIn,9.68,37931187,3.09*60330);
  const arc = (ta:number,tb:number,ra:number,rb:number,v:number):Point[] =>
    Array.from({length:121},(_,i)=>({t:ta+(tb-ta)*i/120,speed:solarSpeed(v,ra,ra+(rb-ra)*i/120)}));
  const a=arc(0,j,1,5.2,42), b=arc(j,s,5.2,9.58,jOut), c=arc(s,end,9.58,11,sOut);
  const all=[...a,...b,...c];
  const line=document.querySelector<SVGPolylineElement>("#voyager-speed-line");
  const ticks=document.querySelector("#voyager-ticks");
  const label=document.querySelector("#assist-live-speed");
  const craft=document.querySelector<HTMLElement>("#assist-voyager");
  const buttons=document.querySelectorAll<HTMLButtonElement>("[data-voyager-view]");
  const marker=(id:string,t:number,speed:number,visible:boolean,x:(t:number)=>number,y:(v:number)=>number)=>{
    const g=document.querySelector<SVGGElement>(id);
    if(!g)return;
    g.style.display=visible?"":"none";
    const px=x(t), py=y(speed);
    const l=g.querySelector("line"), dot=g.querySelector("circle"), txt=g.querySelector("text");
    l?.setAttribute("x1",String(px)); l?.setAttribute("x2",String(px));
    dot?.setAttribute("cx",String(px)); dot?.setAttribute("cy",String(py));
    txt?.setAttribute("x",String(Math.min(px+10,680)));
  };
  function setView(view:View) {
    const lo=view==="jupiter"?j-100:view==="saturn"?s-100:0;
    const hi=view==="jupiter"?j+100:view==="saturn"?s+100:end;
    const data=all.filter(p=>p.t>=lo&&p.t<=hi);
    const ymin=0,ymax=50;
    const x=(t:number)=>75+(t-lo)/(hi-lo)*735;
    const y=(v:number)=>325-(v-ymin)/(ymax-ymin)*295;
    line?.setAttribute("points",data.map(p=>x(p.t)+","+y(p.speed)).join(" "));
    if(ticks){
      ticks.replaceChildren();
      const text=(px:number,py:number,value:string,anchor:string)=>{
        const e=document.createElementNS("http://www.w3.org/2000/svg","text");
        e.setAttribute("x",String(px));e.setAttribute("y",String(py));e.setAttribute("text-anchor",anchor);
        e.textContent=value;ticks.append(e);
      };
      for(let i=0;i<=5;i++){
        text(x(lo+(hi-lo)*i/5),347,Math.round(lo+(hi-lo)*i/5).toString(),"middle");
        text(63,y(i*10)+4,String(i*10),"end");
      }
    }
    marker("#voyager-jupiter-marker",j,jOut,view!=="saturn",x,y);
    marker("#voyager-saturn-marker",s,sOut,view!=="jupiter",x,y);
    if(label)label.textContent=view==="jupiter"?`Júpiter: ${jIn.toFixed(2)} → ${jOut.toFixed(2)} km/s (modelo)`:view==="saturn"?`Saturno: ${sIn.toFixed(2)} → ${sOut.toFixed(2)} km/s (modelo)`:"Modelo calculado · Júpiter + Saturno";
    if(craft)craft.style.transform=view==="jupiter"?"translate(25px,-15px)":view==="saturn"?"translate(50px,-35px)":"translate(0,0)";
    buttons.forEach(b=>b.classList.toggle("active",b.dataset.voyagerView===view));
  }
  buttons.forEach(b=>b.addEventListener("click",()=>{
    const v=b.dataset.voyagerView;
    if(v==="mission"||v==="jupiter"||v==="saturn")setView(v);
  }));
  setView("mission");
}
export {};
