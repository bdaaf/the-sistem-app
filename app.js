const categories = [
 {id:"habits",name:"Constancia y hábitos",freq:"4 días por semana",tasks:["Completa una misión aunque hoy tengas poco tiempo.","Prepara el entorno para facilitar un hábito.","Retoma una actividad que habías dejado pendiente.","Dedica dos minutos a preparar el día siguiente."]},
 {id:"health",name:"Salud y alimentación",freq:"3 días por semana",tasks:["Organiza una de tus comidas de hoy.","Incorpora un alimento diferente o variado en una comida.","Bebe un vaso de agua junto a una comida.","En una ocasión, elige agua en lugar de una bebida azucarada."]},
 {id:"finance",name:"Finanzas y deudas",freq:"2 días por semana",tasks:["Anota un gasto de hoy.","Revisa una deuda y registra el saldo o la fecha de pago si la conoces.","Anota los próximos compromisos de pago.","Dedica cinco minutos a ordenar tus ingresos y gastos."]},
 {id:"hygiene",name:"Higiene personal",freq:"Diaria",tasks:["Completa tu rutina básica de higiene.","Cepíllate los dientes en uno de tus momentos habituales.","Deja preparados los elementos de higiene para mañana."]},
 {id:"learning",name:"Aprendizaje y programación",freq:"2 días por semana",tasks:["Estudia Python durante 10 minutos.","Aprende un concepto básico de análisis de datos.","Resuelve un ejercicio pequeño de Python.","Explora qué es una tabla o un conjunto de datos."]},
 {id:"productivity",name:"Productividad y organización",freq:"2 días por semana",tasks:["Anota tres pendientes importantes.","Organiza un espacio durante cinco minutos.","Elige una prioridad para hoy.","Ordena una pequeña parte de tu lista de tareas."]},
 {id:"growth",name:"Desarrollo personal",freq:"2 días por semana",tasks:["Lee entre 5 y 10 minutos.","Anota una idea que te haya llamado la atención.","Investiga un tema nuevo durante cinco minutos."]},
 {id:"content",name:"Creación de contenido",freq:"2 días por semana",tasks:["Anota una idea para Entrepedidos.","Investiga un dato para una historia.","Escribe un posible gancho para un video.","Mejora una parte de un guion."]}
];
const initial = {xp:0,completed:0,level:1,streak:0,lastComplete:null,day:1,history:[],doneToday:[],date:localDate(),dailyTasks:[]};
let state = load();
function localDate(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function load(){try{return {...initial,...JSON.parse(localStorage.getItem("theSystemSave")||"{}")}}catch{return {...initial}}}
function save(){localStorage.setItem("theSystemSave",JSON.stringify(state))}
function pickTasks(){
 const day=state.day;
 const schedule=[["hygiene","habits","health"],["hygiene","finance","learning"],["hygiene","habits","growth"],["hygiene","health","productivity"],["hygiene","habits","content"],["hygiene","finance","learning"],["hygiene","habits","content"]];
 const ids=schedule[(day-1)%7];
 return ids.map(id=>{const c=categories.find(x=>x.id===id);const index=(Math.floor((day-1)/7)+day)%c.tasks.length;return {id,title:c.tasks[index],xp:10,done:false}});
}
function ensureDay(){const today=localDate();if(state.date!==today){state.date=today;state.doneToday=[];state.dailyTasks=pickTasks();save()}if(!state.dailyTasks?.length)state.dailyTasks=pickTasks();save()}
function rankFor(level){if(level>=25)return"S";if(level>=18)return"A";if(level>=12)return"B";if(level>=8)return"C";if(level>=4)return"D";return"E"}
function render(){
 ensureDay();
 const xpInLevel=state.xp%100, level=Math.floor(state.xp/100)+1;
 state.level=level;
 document.getElementById("rank").textContent=rankFor(level);
 document.getElementById("level").textContent=level;
 document.getElementById("xp").textContent=xpInLevel;
 document.getElementById("nextXp").textContent=100;
 document.getElementById("xpFill").style.width=xpInLevel+"%";
 document.getElementById("totalXp").textContent=state.xp;
 document.getElementById("completed").textContent=state.completed;
 document.getElementById("streak").textContent=state.streak+" días";
 document.getElementById("planDay").textContent=Math.min(state.day,30)+" / 30";
 document.getElementById("today").textContent=new Date().toLocaleDateString("es-CL",{weekday:"short",day:"numeric",month:"short"});
 document.getElementById("missionList").innerHTML=state.dailyTasks.map((m,i)=>`<article class="mission ${m.done?"done":""}"><div><div class="mission-title">${m.title}</div><div class="mission-meta">${categories.find(c=>c.id===m.id).name} · Muy fácil</div></div><div class="xp-tag">+${m.xp} XP</div><button class="complete-btn" data-index="${i}" ${m.done?"disabled":""}>${m.done?"✓ Completada":"Completar misión"}</button></article>`).join("");
 document.querySelectorAll(".complete-btn").forEach(b=>b.addEventListener("click",()=>complete(Number(b.dataset.index))));
 const percent=Math.min(100,Math.round((Math.min(state.day,30)/30)*100));
 document.getElementById("progressPercent").textContent=percent+"%";
 document.getElementById("daysFill").style.width=percent+"%";
 document.getElementById("progressMessage").textContent=`Día ${Math.min(state.day,30)} de 30. El objetivo es construir constancia, no perfección.`;
 const achievements=[["Primer paso","Completa tu primera misión.",state.completed>=1],["En marcha","Completa 10 misiones.",state.completed>=10],["Constancia","Completa 25 misiones.",state.completed>=25],["Nivel 5","Alcanza el nivel 5.",level>=5],["Creador","Completa una misión de Entrepedidos.",state.history.some(h=>h.category==="Creación de contenido")]];
 document.getElementById("achievements").innerHTML=achievements.map(a=>`<div class="achievement ${a[2]?"":"locked"}"><div><b>${a[0]}</b><br><small>${a[1]}</small></div><span>${a[2]?"✓":"🔒"}</span></div>`).join("");
 document.getElementById("history").innerHTML=state.history.slice(-8).reverse().map(h=>`<div class="history-item"><span>${h.title}</span><b>+${h.xp} XP</b></div>`).join("")||'<p class="hint">Todavía no hay misiones registradas.</p>';
 document.getElementById("categoryList").innerHTML=categories.map(c=>`<div class="category"><div><b>${c.name}</b><small>${c.tasks.length} misiones disponibles</small></div><span>${c.freq}</span></div>`).join("");
 save();
}
function complete(i){const m=state.dailyTasks[i];if(!m||m.done)return;m.done=true;state.xp+=m.xp;state.completed++;state.history.push({title:m.title,xp:m.xp,category:categories.find(c=>c.id===m.id).name,date:localDate()});state.history=state.history.slice(-50);state.doneToday.push(m.id);if(state.dailyTasks.every(x=>x.done)){const today=localDate();if(state.lastComplete!==today){const yesterday=new Date();yesterday.setDate(yesterday.getDate()-1);const y=`${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,"0")}-${String(yesterday.getDate()).padStart(2,"0")}`;state.streak=state.lastComplete===y?state.streak+1:1;state.lastComplete=today;}if(state.day<30)state.day++;}save();render()}
document.getElementById("newDayBtn").addEventListener("click",()=>{if(!state.dailyTasks.every(x=>x.done)&&!confirm("Aún tienes misiones pendientes. ¿Quieres generar una nueva selección?"))return;state.dailyTasks=pickTasks();state.date=localDate();save();render()});
document.querySelectorAll(".tab").forEach(t=>t.addEventListener("click",()=>{document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===t));document.querySelectorAll(".view").forEach(v=>v.classList.toggle("hidden",v.id!==t.dataset.tab))}));
document.getElementById("resetBtn").addEventListener("click",()=>{if(confirm("¿Seguro que quieres borrar todo tu progreso de este dispositivo?")){localStorage.removeItem("theSystemSave");state={...initial};render()}});
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
render();