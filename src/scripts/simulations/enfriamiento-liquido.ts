const input=document.querySelector<HTMLInputElement>("#flow");
if(input){
 const flow=input;
 const speed=(q:number,d:number)=>q/(Math.PI*(d/1000)**2/4);
 function update(){
  const lpm=Number(flow.value),q=lpm/60000,v0=speed(q,30);
  const pressure=(d:number)=>150+0.5*(v0*v0-speed(q,d)**2);
  const pts=Array.from({length:101},(_,i)=>10+i/5);
  document.querySelector("#fluid-speed")?.setAttribute("points",pts.map(d=>`${55+(d-10)*525/20},${215-195*speed(q,d)/4}`).join(" "));
  document.querySelector("#fluid-pressure")?.setAttribute("points",pts.map(d=>`${55+(d-10)*525/20},${215-195*(pressure(d)-140)/10}`).join(" "));
  const val=document.getElementById("flow-value"),res=document.getElementById("flow-result");
  if(val)val.textContent=String(lpm);
  if(res)res.textContent=`A 30 mm: ${v0.toFixed(2)} m/s · A 10 mm: ${speed(q,10).toFixed(2)} m/s y ${pressure(10).toFixed(2)} kPa.`;
 }
 flow.addEventListener("input",update);update();
}
export {};
