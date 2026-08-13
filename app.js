"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const locale="hu-HU";
const STORAGE_KEY="peterStartpageV5", LEGACY_KEYS=["peterStartpageV4","peterStartpageV3","peterStartpageV2"];
const LOCAL_SNAPSHOTS_KEY="peterStartpageLocalSnapshotsV5", CLOUD_SESSION_KEY="peterStartpageCloudSessionV5";
const BACKGROUNDS=["mountains","aurora","stars","rain","waves"];
const PROFILE_LABELS={general:"Általános",study:"Tanulás",work:"Munka",vio:"Vio"};
const NORMAL_PROFILES=["general","study","work"];
const WIDGET_LABELS={weather:"Időjárás",currencies:"Deviza",todos:"Teendők",links:"Gyorsindítás",focus:"Fókuszidőzítő"};
const SEARCH_ENGINES={
  google:q=>`https://www.google.com/search?q=${encodeURIComponent(q)}`,
  duckduckgo:q=>`https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
  youtube:q=>`https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`,
  github:q=>`https://github.com/search?q=${encodeURIComponent(q)}`,
  wikipedia:q=>`https://hu.wikipedia.org/w/index.php?search=${encodeURIComponent(q)}`
};
const SEARCH_PREFIXES={g:"google",google:"google",ddg:"duckduckgo",d:"duckduckgo",yt:"youtube",youtube:"youtube",gh:"github",github:"github",w:"wikipedia",wiki:"wikipedia"};
const uuid=()=>crypto.randomUUID?crypto.randomUUID():`${Date.now()}-${Math.random().toString(16).slice(2)}`;
const profile=(label,links,extra={})=>({label,todos:[],links,widgetVisibility:{weather:true,currencies:true,todos:true,links:true,focus:true,...extra},widgetOrder:["weather","currencies","todos","links","focus"]});
const DEFAULT_STATE={
  version:5,activeProfile:"general",theme:"midnight",density:"normal",background:"mountains",backgroundDim:42,autoRotateBackground:false,randomBackground:false,backgroundMotion:true,glass:82,
  quote:"„Fókuszálj a haladásra, ne a tökéletességre.”",searchEngine:"google",
  city:{name:"Pécs",latitude:46.0727,longitude:18.2323,timezone:"Europe/Budapest"},
  currencies:["GBP","EUR","USD"],currencyRange:30,currencyWidgetSize:"auto",currencyAmounts:{GBP:1000,EUR:1000,USD:1000},pomodoro:{workMinutes:25,breakMinutes:5},
  profiles:{
    general:profile("Általános",[
      {id:uuid(),name:"Spotify",url:"https://open.spotify.com",icon:"♫"},{id:uuid(),name:"Gmail",url:"https://mail.google.com",icon:"M"},
      {id:uuid(),name:"YouTube",url:"https://youtube.com",icon:"▶"},{id:uuid(),name:"ChatGPT",url:"https://chatgpt.com",icon:"✦"},
      {id:uuid(),name:"GitHub",url:"https://github.com",icon:"⌘"},{id:uuid(),name:"Naptár",url:"https://calendar.google.com",icon:"31"}]),
    study:profile("Tanulás",[
      {id:uuid(),name:"ChatGPT",url:"https://chatgpt.com",icon:"✦"},{id:uuid(),name:"GitHub",url:"https://github.com",icon:"⌘"},
      {id:uuid(),name:"MDN",url:"https://developer.mozilla.org",icon:"MDN"},{id:uuid(),name:"Spring",url:"https://start.spring.io",icon:"S"},
      {id:uuid(),name:"YouTube",url:"https://youtube.com",icon:"▶"}],{currencies:false}),
    work:profile("Munka",[
      {id:uuid(),name:"Gmail",url:"https://mail.google.com",icon:"M"},{id:uuid(),name:"Naptár",url:"https://calendar.google.com",icon:"31"},
      {id:uuid(),name:"ChatGPT",url:"https://chatgpt.com",icon:"✦"},{id:uuid(),name:"GitHub",url:"https://github.com",icon:"⌘"},
      {id:uuid(),name:"LinkedIn",url:"https://www.linkedin.com",icon:"in"}],{currencies:false})
  },
  vio:{dailyLimitMinutes:15,day:"",usedMs:0,bonusMs:0,pinHash:"",pinSalt:"",videos:[],links:[]},
  cloud:{url:"",key:"",email:"",enabled:false}
};
const clone=v=>JSON.parse(JSON.stringify(v));
const todayKey=()=>new Date().toLocaleDateString("sv-SE");
const normalizeUrl=url=>{const v=String(url||"").trim();if(!v)return"";return/^https?:\/\//i.test(v)?v:`https://${v}`};
const esc=v=>String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
function loadSaved(){for(const key of [STORAGE_KEY,...LEGACY_KEYS]){const raw=localStorage.getItem(key);if(raw){try{return{key,value:JSON.parse(raw)}}catch{}}}return{key:null,value:null}}
function migrate(info){
  const b=clone(DEFAULT_STATE),s=info?.value;if(!s)return b;
  if(s.profiles){
    const m={...b,...s,city:{...b.city,...(s.city||{})},currencyAmounts:{...b.currencyAmounts,...(s.currencyAmounts||{})},pomodoro:{...b.pomodoro,...(s.pomodoro||{})},cloud:{...b.cloud,...(s.cloud||{})},vio:{...b.vio,...(s.vio||{})},profiles:{...b.profiles}};
    for(const k of NORMAL_PROFILES){m.profiles[k]={...b.profiles[k],...(s.profiles[k]||{}),widgetVisibility:{...b.profiles[k].widgetVisibility,...(s.profiles[k]?.widgetVisibility||{})},todos:Array.isArray(s.profiles[k]?.todos)?s.profiles[k].todos:b.profiles[k].todos,links:Array.isArray(s.profiles[k]?.links)?s.profiles[k].links:b.profiles[k].links,widgetOrder:Array.isArray(s.profiles[k]?.widgetOrder)?s.profiles[k].widgetOrder:b.profiles[k].widgetOrder}}
    m.version=5;return m;
  }
  b.theme=s.theme??b.theme;b.background=s.background??b.background;b.backgroundDim=s.backgroundDim??b.backgroundDim;b.autoRotateBackground=s.autoRotateBackground??b.autoRotateBackground;b.randomBackground=s.randomBackground??b.randomBackground;b.backgroundMotion=s.backgroundMotion??b.backgroundMotion;b.glass=s.glass??b.glass;b.quote=s.quote??b.quote;b.searchEngine=s.searchEngine??b.searchEngine;
  b.city={...b.city,...(s.city||{})};b.currencies=Array.isArray(s.currencies)?s.currencies:b.currencies;b.currencyRange=s.currencyRange??b.currencyRange;b.currencyWidgetSize=s.currencyWidgetSize??b.currencyWidgetSize;b.currencyAmounts={...b.currencyAmounts,...(s.currencyAmounts||{})};b.pomodoro={...b.pomodoro,...(s.pomodoro||{})};
  b.profiles.general.todos=Array.isArray(s.todos)?s.todos:[];b.profiles.general.links=Array.isArray(s.links)?s.links:b.profiles.general.links;b.profiles.general.widgetVisibility={...b.profiles.general.widgetVisibility,...(s.widgetVisibility||{})};b.profiles.general.widgetOrder=Array.isArray(s.widgetOrder)?s.widgetOrder:b.profiles.general.widgetOrder;return b;
}
let state=migrate(loadSaved());
if(!["midnight","light"].includes(state.theme)) state.theme="midnight";
if(!state.vio.day)state.vio.day=todayKey();
let latestRates={},latestChartData={},backgroundRotationTimer=null,localSnapshotLastAt=0,cloudBackupTimer=null,lastCloudBackupAt=0;
const currentProfile=()=>NORMAL_PROFILES.includes(state.activeProfile)?state.profiles[state.activeProfile]:state.profiles.general;
function getLocalSnapshots(){try{return JSON.parse(localStorage.getItem(LOCAL_SNAPSHOTS_KEY)||"[]")}catch{return[]}}
function saveLocalSnapshot(){const a=getLocalSnapshots();a.unshift({id:uuid(),createdAt:new Date().toISOString(),state:clone(state)});localStorage.setItem(LOCAL_SNAPSHOTS_KEY,JSON.stringify(a.slice(0,5)))}
function saveState({snapshot=true,cloud=true}={}){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));const now=Date.now();if(snapshot&&now-localSnapshotLastAt>120000){saveLocalSnapshot();localSnapshotLastAt=now}if(cloud)scheduleCloudBackup()}
function restoreLastLocalSnapshot(){const x=getLocalSnapshots()[0];if(!x)return toast("Nincs helyi pillanatkép");if(!confirm(`Visszaállítsam? ${new Date(x.createdAt).toLocaleString(locale)}`))return;state=migrate({value:x.state});saveState({snapshot:false,cloud:false});initUi();Promise.all([loadWeather(),loadCurrencies()]);toast("Helyi mentés visszaállítva")}
function toast(msg){const e=$("#status");e.textContent=msg;e.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove("show"),2600)}
function updateClock(){const n=new Date();$("#clock").textContent=n.toLocaleTimeString(locale,{hour:"2-digit",minute:"2-digit"});$("#date").textContent=n.toLocaleDateString(locale,{year:"numeric",month:"long",day:"numeric",weekday:"long"})}

/* appearance */
function applyAppearance(){
  document.body.dataset.theme=state.theme;document.body.dataset.background=state.background;document.body.dataset.density=state.density||"normal";document.body.classList.toggle("no-background-motion",!state.backgroundMotion);
  document.documentElement.style.setProperty("--panel-alpha",(state.glass/100).toFixed(2));document.documentElement.style.setProperty("--background-dim",(state.backgroundDim/100).toFixed(2));
  $("#quoteText").textContent=state.quote;$("#themeSelect").value=state.theme;$("#densitySelect").value=state.density||"normal";$("#backgroundSelect").value=state.background;$("#backgroundDimRange").value=state.backgroundDim;$("#autoBackgroundToggle").checked=state.autoRotateBackground;$("#randomBackgroundToggle").checked=state.randomBackground;$("#motionToggle").checked=state.backgroundMotion;$("#glassRange").value=state.glass;$("#quoteInput").value=state.quote;$("#searchEngine").value=state.searchEngine;
  $('meta[name="theme-color"]').content=state.theme==="light"?"#e8edf3":"#071018";configureBackgroundRotation()
}
function setBackground(name){if(!BACKGROUNDS.includes(name))return;state.background=name;saveState();applyAppearance()}
function nextBackground(){const i=BACKGROUNDS.indexOf(state.background);setBackground(BACKGROUNDS[(i+1)%BACKGROUNDS.length]);toast(`Háttér: ${$("#backgroundSelect").selectedOptions[0]?.textContent||state.background}`)}
function configureBackgroundRotation(){clearInterval(backgroundRotationTimer);if(state.autoRotateBackground)backgroundRotationTimer=setInterval(()=>{const i=BACKGROUNDS.indexOf(state.background);state.background=BACKGROUNDS[(i+1)%BACKGROUNDS.length];saveState();document.body.dataset.background=state.background;$("#backgroundSelect").value=state.background},600000)}
function renderWidgetToggles(){if(state.activeProfile==="vio"){ $("#widgetToggles").innerHTML='<div class="hint">A Vio külön gyerekfelület; a 🔒 Szülő gombbal állítható.</div>';return}const p=currentProfile();$("#widgetToggles").innerHTML=Object.entries(WIDGET_LABELS).map(([k,l])=>`<label class="toggle-item"><span>${l}</span><input type="checkbox" data-widget-toggle="${k}" ${p.widgetVisibility[k]?"checked":""}></label>`).join("")}
function applyWidgetLayout(){const p=currentProfile(),d=$("#dashboard");p.widgetOrder.forEach(n=>{const c=$(`[data-widget="${n}"]`);if(c)d.appendChild(c)});Object.entries(p.widgetVisibility).forEach(([n,v])=>$(`[data-widget="${n}"]`)?.classList.toggle("hidden-widget",!v))}
function renderProfile(){
  $$(".profile-tab").forEach(b=>b.classList.toggle("active",b.dataset.profile===state.activeProfile));const vio=state.activeProfile==="vio";$("#normalView").hidden=vio;$("#vioView").hidden=!vio;$("#currentProfileName").textContent=PROFILE_LABELS[state.activeProfile];
  if(vio){resetVioDay();renderVio();return}applyWidgetLayout();renderTodos();renderLinks();renderWidgetToggles();$("#todoTitle").textContent=`${PROFILE_LABELS[state.activeProfile]} teendők`;$("#linksTitle").textContent=`${PROFILE_LABELS[state.activeProfile]} gyorsindítás`
}
function switchProfile(p){if(!PROFILE_LABELS[p]||p===state.activeProfile)return;if(p!=="vio")stopVioPlayback();state.activeProfile=p;saveState();renderProfile()}

/* search */
function runSearch(raw){let q=raw.trim();if(!q)return;let engine=state.searchEngine;const parts=q.split(/\s+/),prefix=parts[0].toLowerCase();if(SEARCH_PREFIXES[prefix]&&parts.length>1){engine=SEARCH_PREFIXES[prefix];q=parts.slice(1).join(" ")}const url=(SEARCH_ENGINES[engine]||SEARCH_ENGINES.google)(q);window.open(url,"_blank","noopener,noreferrer")}

/* weather */
const weatherMap={0:["☀️","Tiszta"],1:["🌤️","Többnyire derült"],2:["⛅","Részben felhős"],3:["☁️","Borult"],45:["🌫️","Ködös"],48:["🌫️","Zúzmarás köd"],51:["🌦️","Enyhe szitálás"],53:["🌦️","Szitálás"],55:["🌧️","Erős szitálás"],61:["🌦️","Enyhe eső"],63:["🌧️","Eső"],65:["🌧️","Erős eső"],71:["🌨️","Enyhe havazás"],73:["🌨️","Havazás"],75:["❄️","Erős havazás"],80:["🌦️","Zápor"],81:["🌧️","Erős zápor"],82:["⛈️","Heves zápor"],95:["⛈️","Zivatar"],96:["⛈️","Zivatar jéggel"],99:["⛈️","Erős zivatar"]};
const weatherInfo=c=>weatherMap[c]||["🌡️","Változó idő"];
function weatherUrl(){const{latitude,longitude,timezone}=state.city;return`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&timezone=${encodeURIComponent(timezone||"auto")}&forecast_days=7`}
function weatherAdvice(c,d){const code=+c.weather_code||0,rain=+d.precipitation_probability_max?.[0]||0,uv=+d.uv_index_max?.[0]||0,max=+d.temperature_2m_max?.[0]||+c.temperature_2m,wind=+c.wind_speed_10m||0,m=[];if(code>=95)m.push("Zivatar várható, a szabadtéri programokat érdemes rugalmasan kezelni.");else if(rain>=55||+c.precipitation>.4)m.push(`Eső valószínűsége ${Math.round(rain)}% – az esernyő jó ötlet.`);if(wind>=35)m.push("Erős a szél, biciklizésnél számíts nehezebb szakaszokra.");if(max>=30)m.push("Meleg nap lesz: víz és könnyű öltözet ajánlott.");if(uv>=6)m.push(`Magas UV-index (${uv.toFixed(1)}), naptej ajánlott.`);if(+c.temperature_2m<=5)m.push("Hűvös van, réteges öltözet ajánlott.");if(!m.length)m.push(wind<=22&&rain<35&&code<80?"Az idő kedvezőnek tűnik sétához vagy rövid biciklizéshez.":"Változó idő várható; indulás előtt érdemes még egyszer ránézni.");return m.slice(0,2).join(" ")}
async function loadWeather(){$("#weatherTitle").textContent=`Időjárás – ${state.city.name}`;try{const r=await fetch(weatherUrl());if(!r.ok)throw 0;const d=await r.json(),c=d.current,[i,t]=weatherInfo(c.weather_code);$("#currentWeatherIcon").textContent=i;$("#currentTemp").classList.remove("loading");$("#currentTemp").textContent=`${Math.round(c.temperature_2m)}°C`;$("#currentCondition").textContent=t;$("#feelsLike").textContent=`Hőérzet: ${Math.round(c.apparent_temperature)}°C`;$("#humidity").textContent=`${Math.round(c.relative_humidity_2m)}%`;$("#wind").textContent=`${Math.round(c.wind_speed_10m)} km/h`;$("#pressure").textContent=`${Math.round(c.surface_pressure)} hPa`;$("#precipitation").textContent=`${Number(c.precipitation||0).toFixed(1)} mm`;$("#weatherAdviceText").textContent=weatherAdvice(c,d.daily);$("#weatherUpdated").textContent=`Frissítve: ${new Date().toLocaleTimeString(locale,{hour:"2-digit",minute:"2-digit"})}`;$("#forecast").innerHTML=d.daily.time.slice(1,7).map((date,x)=>{const n=x+1,[ico]=weatherInfo(d.daily.weather_code[n]),day=new Date(`${date}T12:00:00`).toLocaleDateString(locale,{weekday:"short"});return`<div class="forecast-day"><div class="day">${esc(day)}</div><div class="ico">${ico}</div><div class="high">${Math.round(d.daily.temperature_2m_max[n])}°</div><div class="low">${Math.round(d.daily.temperature_2m_min[n])}°</div></div>`}).join("")}catch{$("#currentTemp").classList.remove("loading");$("#currentTemp").textContent="—";$("#currentCondition").textContent="Az időjárás most nem érhető el";$("#weatherAdviceText").textContent="Ellenőrizd az internetkapcsolatot.";$("#forecast").innerHTML=""}}

/* currency */
const isoDate=d=>d.toISOString().slice(0,10),formatRate=v=>Number(v).toLocaleString(locale,{minimumFractionDigits:2,maximumFractionDigits:2}),formatHuf=v=>Math.round(Number(v)).toLocaleString(locale)+" Ft";
function applyCurrencyWidgetSizing(){
  const card=$('[data-widget="currencies"]');
  if(!card)return;
  const count=Math.max(1,Math.min(3,state.currencies.length||1));
  const size=["auto","small","medium","full"].includes(state.currencyWidgetSize)?state.currencyWidgetSize:"auto";
  card.dataset.currencyCount=String(count);
  card.dataset.currencySize=size;
  const select=$("#currencyWidgetSize");
  if(select)select.value=size;
}
function renderCurrencyCards(){applyCurrencyWidgetSizing();$("#currencyGrid").innerHTML=state.currencies.map(c=>`<section class="currency" data-code="${c}"><div class="currency-name">${c} / HUF</div><div class="currency-value-row"><div class="currency-value loading" id="${c}Value">000,00</div><div class="currency-change" id="${c}Change">—</div></div><div class="chart-label">${state.currencyRange} napos grafikon</div><canvas id="${c}Chart"></canvas><div class="currency-calculator"><input class="currency-amount" data-code="${c}" type="number" min="0" step="1" value="${Number(state.currencyAmounts[c]??1000)}"><span>${c}</span><span class="currency-converted" id="${c}Converted">→ …</span></div></section>`).join("");$$("[data-range]",$("#rangeSelector")).forEach(b=>b.classList.toggle("active",+b.dataset.range===state.currencyRange))}
function updateCurrencyCalculation(c){const i=$(`#${c}Value`)?.classList.contains("loading")?null:latestRates[c],out=$(`#${c}Converted`),inp=$(`.currency-amount[data-code="${c}"]`);if(out&&inp)out.textContent=i?`→ ${formatHuf((+inp.value||0)*i)}`:"→ —"}
async function loadCurrency(c){const e=new Date(),s=new Date();s.setDate(e.getDate()-state.currencyRange-10);const r=await fetch(`https://api.frankfurter.dev/v1/${isoDate(s)}..${isoDate(e)}?base=${c}&symbols=HUF`);if(!r.ok)throw 0;const d=await r.json(),pts=Object.entries(d.rates).map(([date,rates])=>({date,value:rates.HUF})).filter(p=>Number.isFinite(p.value)).slice(-state.currencyRange),last=pts.at(-1)?.value,prev=pts.at(-2)?.value??last;if(!last)throw 0;latestRates[c]=last;latestChartData[c]=pts.map(p=>p.value);const diff=last-prev,pct=prev?diff/prev*100:0,v=$(`#${c}Value`),ch=$(`#${c}Change`);v.classList.remove("loading");v.textContent=formatRate(last);ch.classList.toggle("down",diff<0);ch.innerHTML=`${diff>=0?"+":""}${formatRate(diff)}<br>(${pct>=0?"+":""}${pct.toFixed(2).replace(".",",")}%)`;drawChart($(`#${c}Chart`),latestChartData[c],diff<0);updateCurrencyCalculation(c)}
async function loadCurrencies(){renderCurrencyCards();try{await Promise.all(state.currencies.map(loadCurrency));$("#currencyUpdated").textContent=`Frissítve: ${new Date().toLocaleTimeString(locale,{hour:"2-digit",minute:"2-digit"})}`}catch{$("#currencyUpdated").textContent="Az árfolyamadat nem érhető el";state.currencies.forEach(c=>{const e=$(`#${c}Value`);if(e){e.classList.remove("loading");e.textContent="—"}})}}
function drawChart(canvas,values,down){if(!canvas||values.length<2)return;const ratio=devicePixelRatio||1,rect=canvas.getBoundingClientRect();canvas.width=Math.max(250,rect.width*ratio);canvas.height=145*ratio;const x=canvas.getContext("2d");x.scale(ratio,ratio);const w=canvas.width/ratio,h=canvas.height/ratio,p={l:4,r:4,t:12,b:14},min=Math.min(...values),max=Math.max(...values),range=max-min||1,pts=values.map((v,i)=>({x:p.l+i*((w-p.l-p.r)/Math.max(1,values.length-1)),y:p.t+(max-v)/range*(h-p.t-p.b)})),style=getComputedStyle(document.documentElement),line=down?style.getPropertyValue("--danger").trim():style.getPropertyValue("--accent").trim();x.clearRect(0,0,w,h);x.strokeStyle=getComputedStyle(document.body).getPropertyValue("--border").trim()||"rgba(255,255,255,.08)";for(let i=1;i<4;i++){const y=p.t+i*((h-p.t-p.b)/4);x.beginPath();x.moveTo(0,y);x.lineTo(w,y);x.stroke()}const g=x.createLinearGradient(0,p.t,0,h);g.addColorStop(0,alpha(line,.18));g.addColorStop(1,alpha(line,0));x.beginPath();x.moveTo(pts[0].x,h-p.b);pts.forEach(q=>x.lineTo(q.x,q.y));x.lineTo(pts.at(-1).x,h-p.b);x.closePath();x.fillStyle=g;x.fill();x.beginPath();pts.forEach((q,i)=>i?x.lineTo(q.x,q.y):x.moveTo(q.x,q.y));x.strokeStyle=line;x.lineWidth=2.2;x.lineJoin="round";x.lineCap="round";x.stroke()}
function alpha(c,a){if(c.startsWith("#")){const h=c.slice(1),v=h.length===3?h.split("").map(z=>z+z).join(""):h,n=parseInt(v,16);return`rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${a})`}return c}

/* todos + links */
function renderTodos(){const p=currentProfile();$("#todoList").innerHTML=p.todos.map(t=>`<div class="todo ${t.done?"done":""}" data-id="${t.id}"><button class="todo-drag" draggable="true" type="button">⋮⋮</button><input type="checkbox" ${t.done?"checked":""}><label>${esc(t.text)}</label><button class="todo-edit" type="button">✎</button></div>`).join("");const open=p.todos.filter(t=>!t.done).length;$("#todoCount").textContent=open?`${open} nyitott`:"Minden kész";initTodoDrag()}
function initTodoDrag(){let id=null;$$(".todo-drag").forEach(h=>{h.addEventListener("dragstart",e=>{id=h.closest(".todo").dataset.id;h.closest(".todo").classList.add("todo-dragging");e.dataTransfer.setData("text/plain",id)});h.addEventListener("dragend",()=>{$$(".todo").forEach(r=>r.classList.remove("todo-dragging","todo-drop-target"));id=null})});$$(".todo").forEach(t=>{t.addEventListener("dragover",e=>{if(!id||t.dataset.id===id)return;e.preventDefault();t.classList.add("todo-drop-target")});t.addEventListener("dragleave",()=>t.classList.remove("todo-drop-target"));t.addEventListener("drop",e=>{e.preventDefault();const a=currentProfile().todos,i=a.findIndex(x=>x.id===id),j=a.findIndex(x=>x.id===t.dataset.id);if(i<0||j<0||i===j)return;const[m]=a.splice(i,1);a.splice(j,0,m);saveState();renderTodos()})})}
function openTodo(t){$("#todoEditId").value=t.id;$("#todoEditText").value=t.text;$("#todoDialog").showModal()}
function faviconCandidates(url){try{const p=new URL(normalizeUrl(url));return[`${p.origin}/favicon.ico`,`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(p.origin)}&sz=64`]}catch{return[]}}
function fav(link){const c=faviconCandidates(link.url),f=esc(link.icon||link.name[0]?.toUpperCase()||"•");return c.length?`<img src="${esc(c[0])}" data-favicon-next="${esc(c[1]||"")}" alt="" referrerpolicy="no-referrer"><span class="quick-fallback" hidden>${f}</span>`:`<span class="quick-fallback">${f}</span>`}
function renderLinks(){const links=currentProfile().links;$("#quickGrid").innerHTML=links.map(l=>`<div class="quick-link" data-id="${l.id}"><a class="quick-link-anchor" href="${esc(normalizeUrl(l.url))}" target="_blank" rel="noopener noreferrer"></a><button class="link-drag" draggable="true" type="button">⋮⋮</button><button class="link-menu" type="button">⋯</button><span class="quick-icon">${fav(l)}</span><span class="quick-name">${esc(l.name)}</span></div>`).join("");$$(".quick-icon img").forEach(i=>i.addEventListener("error",()=>{const n=i.dataset.faviconNext;if(n&&i.src!==n){i.dataset.faviconNext="";i.src=n;return}i.hidden=true;if(i.nextElementSibling)i.nextElementSibling.hidden=false}));initLinkDrag()}
function initLinkDrag(){let id=null;$$(".link-drag").forEach(h=>{h.addEventListener("dragstart",e=>{id=h.closest(".quick-link").dataset.id;h.closest(".quick-link").classList.add("link-dragging");e.dataTransfer.setData("text/plain",id)});h.addEventListener("dragend",()=>{$$(".quick-link").forEach(r=>r.classList.remove("link-dragging","link-drop-target"));id=null})});$$(".quick-link").forEach(t=>{t.addEventListener("dragover",e=>{if(!id||t.dataset.id===id)return;e.preventDefault();t.classList.add("link-drop-target")});t.addEventListener("dragleave",()=>t.classList.remove("link-drop-target"));t.addEventListener("drop",e=>{e.preventDefault();const a=currentProfile().links,i=a.findIndex(x=>x.id===id),j=a.findIndex(x=>x.id===t.dataset.id);if(i<0||j<0||i===j)return;const[m]=a.splice(i,1);a.splice(j,0,m);saveState();renderLinks()})})}
function openLink(l=null){$("#linkId").value=l?.id||"";$("#linkName").value=l?.name||"";$("#linkUrl").value=l?.url||"https://";$("#linkIcon").value=l?.icon||"";$("#linkDialogTitle").textContent=l?"Hivatkozás szerkesztése":"Új hivatkozás";$("#deleteLinkBtn").hidden=!l;$("#linkDialog").showModal()}


/* focus */
let timerMode="stopwatch",stopwatchStart=0,stopwatchElapsed=0,stopwatchRunning=false,timerFrame=null,lapNumber=0;
let pomodoroRemaining=state.pomodoro.workMinutes*60000,pomodoroRunning=false,pomodoroEnd=0,pomodoroPhase="work";
function formatStopwatch(ms){const t=Math.max(0,ms),h=Math.floor(t/3600000),m=Math.floor(t/60000)%60,s=Math.floor(t/1000)%60,c=Math.floor(t/10)%100,p=n=>String(n).padStart(2,"0");return`${p(h)}:${p(m)}:${p(s)}<span class="timer-ms">.${p(c)}</span>`}
function formatCountdown(ms){const t=Math.ceil(Math.max(0,ms)/1000),m=Math.floor(t/60),s=t%60;return`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}
function tickFocus(){if(timerMode==="stopwatch"){const c=stopwatchElapsed+(stopwatchRunning?performance.now()-stopwatchStart:0);$("#timerDisplay").innerHTML=formatStopwatch(c);if(stopwatchRunning)timerFrame=requestAnimationFrame(tickFocus);return}const r=pomodoroRunning?Math.max(0,pomodoroEnd-Date.now()):pomodoroRemaining;$("#timerDisplay").textContent=formatCountdown(r);if(pomodoroRunning&&r<=0){pomodoroRunning=false;pomodoroPhase=pomodoroPhase==="work"?"break":"work";pomodoroRemaining=(pomodoroPhase==="work"?state.pomodoro.workMinutes:state.pomodoro.breakMinutes)*60000;$("#focusLabel").textContent=pomodoroPhase==="work"?"Fókuszidő":"Szünet";$("#startTimer").textContent="Start";beep()}else if(pomodoroRunning)timerFrame=requestAnimationFrame(tickFocus)}
function beep(){try{const AC=window.AudioContext||window.webkitAudioContext,c=new AC(),o=c.createOscillator(),g=c.createGain();o.frequency.value=660;g.gain.value=.08;o.connect(g);g.connect(c.destination);o.start();o.stop(c.currentTime+.28)}catch{}}
function setTimerMode(mode){timerMode=mode;$$(".focus-tabs button").forEach(b=>b.classList.toggle("active",b.dataset.mode===mode));cancelAnimationFrame(timerFrame);$("#lapTimer").textContent=mode==="stopwatch"?"Kör":"Ugrás";$("#focusLabel").textContent=mode==="stopwatch"?"Stopper":pomodoroPhase==="work"?"Fókuszidő":"Szünet";$("#startTimer").textContent=mode==="stopwatch"?(stopwatchRunning?"Szünet":"Start"):(pomodoroRunning?"Szünet":"Start");$("#lapInfo").textContent=mode==="pomodoro"?`${state.pomodoro.workMinutes} perc fókusz / ${state.pomodoro.breakMinutes} perc szünet`:"";tickFocus()}

/* Vio + PIN + YouTube */
let pinMode="unlock",pinSuccess=null,ytApiLoading=false,ytApiReady=false,ytPlayer=null,vioPlaying=false,vioPlayTickAt=0,vioUsageInterval=null,vioCurrentVideoId=null;
function resetVioDay(){const t=todayKey();if(state.vio.day!==t){state.vio.day=t;state.vio.usedMs=0;state.vio.bonusMs=0;saveState()}}
const vioLimitMs=()=>Math.max(1,+state.vio.dailyLimitMinutes||15)*60000+(+state.vio.bonusMs||0);
const vioRemainingMs=()=>{resetVioDay();return Math.max(0,vioLimitMs()-(+state.vio.usedMs||0))};
function mmss(ms){const t=Math.ceil(Math.max(0,ms)/1000),m=Math.floor(t/60),s=t%60;return`${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`}
function extractYouTubeId(url){try{const p=new URL(normalizeUrl(url));if(p.hostname.includes("youtu.be"))return p.pathname.split("/").filter(Boolean)[0]||"";if(p.hostname.includes("youtube.com")){if(p.pathname==="/watch")return p.searchParams.get("v")||"";return p.pathname.match(/\/(?:embed|shorts)\/([^/?]+)/)?.[1]||""}}catch{}return""}
function youtubeThumb(id){return`https://i.ytimg.com/vi/${encodeURIComponent(id)}/hqdefault.jpg`}
function markActiveVioVideo(){
  $$("#vioVideoGrid [data-video-id]").forEach(btn=>{
    const v=state.vio.videos.find(x=>x.id===btn.dataset.videoId);
    const active=!!v&&v.youtubeId===vioCurrentVideoId;
    btn.classList.toggle("active",active);
    btn.setAttribute("aria-pressed",active?"true":"false");
  });
}
function renderVio(){resetVioDay();const rem=vioRemainingMs(),lim=vioLimitMs(),frac=lim?rem/lim:0;$("#vioRemainingText").textContent=mmss(rem);$("#vioProgressBar").style.width=`${Math.max(0,Math.min(100,frac*100))}%`;$("#vioTimeSummary").textContent=rem>0?`Ma még ${mmss(rem)} videóidő maradt.`:"Mára elfogyott a videóidő.";$("#vioEndCard").hidden=rem>0;$("#vioContent").hidden=rem<=0;if(rem<=0)stopVioPlayback();
  $("#vioVideoGrid").innerHTML=state.vio.videos.length?state.vio.videos.map(v=>`<button class="vio-tile vio-video-tile${v.youtubeId===vioCurrentVideoId?" active":""}" type="button" data-video-id="${v.id}" aria-pressed="${v.youtubeId===vioCurrentVideoId?"true":"false"}"><span class="vio-thumb"><img src="${youtubeThumb(v.youtubeId)}" alt="" loading="lazy" referrerpolicy="no-referrer"><span class="vio-play-badge">▶</span></span><span class="vio-video-copy"><strong>${esc(v.title)}</strong><span>YouTube videó</span></span></button>`).join(""):'<div class="vio-empty">Még nincs jóváhagyott videó. A 🔒 Szülő gombnál tudsz hozzáadni.</div>';
  $("#vioLinkGrid").innerHTML=state.vio.links.length?state.vio.links.map(l=>{let host="weboldal";try{host=new URL(normalizeUrl(l.url)).hostname}catch{}return`<a class="vio-tile" href="${esc(normalizeUrl(l.url))}" target="_blank" rel="noopener noreferrer"><span class="vio-tile-icon">🌈</span><strong>${esc(l.title)}</strong><span>${esc(host)}</span></a>`}).join(""):'<div class="vio-empty">Ide kerülhetnek a kedvenc gyerekoldalak és más jóváhagyott linkek.</div>';
  markActiveVioVideo()
}
async function hashPin(pin,salt){const d=new TextEncoder().encode(`${salt}:${pin}`),h=await crypto.subtle.digest("SHA-256",d);return[...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,"0")).join("")}
function openPin(mode,cb=null){pinMode=mode;pinSuccess=cb;$("#pinInput").value="";$("#pinConfirmInput").value="";const setup=mode==="setup"||mode==="change";$("#pinTitle").textContent=setup?(mode==="change"?"Új szülői PIN":"Szülői PIN beállítása"):"Szülői PIN";$("#pinHelp").textContent=setup?"Adj meg egy 4–8 számjegyű PIN-t. A kódban nem tároljuk olvasható formában.":"Add meg a szülői PIN-t.";$("#pinConfirmWrap").hidden=!setup;$("#pinConfirmInput").required=setup;$("#pinDialog").showModal()}
async function submitPin(){const pin=$("#pinInput").value.trim();if(!/^\d{4,8}$/.test(pin))return toast("A PIN 4–8 számjegy legyen");if(pinMode==="setup"||pinMode==="change"){if(pin!==$("#pinConfirmInput").value.trim())return toast("A két PIN nem egyezik");const salt=crypto.getRandomValues(new Uint32Array(4)).join("-");state.vio.pinSalt=salt;state.vio.pinHash=await hashPin(pin,salt);saveState();$("#pinDialog").close();toast("Szülői PIN mentve");pinSuccess?.();return}if(await hashPin(pin,state.vio.pinSalt||"")!==state.vio.pinHash)return toast("Hibás PIN");$("#pinDialog").close();pinSuccess?.()}
function parentAccess(cb){state.vio.pinHash?openPin("unlock",cb):openPin("setup",cb)}
function openVioParent(){$("#vioLimitInput").value=state.vio.dailyLimitMinutes;renderVioParentLists();$("#vioParentDialog").showModal()}
function renderVioParentLists(){$("#vioParentVideoList").innerHTML=state.vio.videos.map(v=>`<div class="parent-list-row"><span>${esc(v.title)}</span><button type="button" data-delete-vio-video="${v.id}">Törlés</button></div>`).join("");$("#vioParentLinkList").innerHTML=state.vio.links.map(l=>`<div class="parent-list-row"><span>${esc(l.title)}</span><button type="button" data-delete-vio-link="${l.id}">Törlés</button></div>`).join("")}
function loadYouTubeApi(){if(ytApiReady||ytApiLoading)return;ytApiLoading=true;window.onYouTubeIframeAPIReady=()=>{ytApiReady=true;ytApiLoading=false;if(vioCurrentVideoId)createPlayer(vioCurrentVideoId)};const s=document.createElement("script");s.src="https://www.youtube.com/iframe_api";s.async=true;document.head.appendChild(s)}
function playVioVideo(id){
  if(vioRemainingMs()<=0)return renderVio();
  const v=state.vio.videos.find(x=>x.id===id);if(!v)return;
  $("#vioPlayerTitle").textContent=v.title;
  $("#vioPlayerShell").hidden=false;
  stopVioTicker();
  vioCurrentVideoId=v.youtubeId;
  markActiveVioVideo();
  if(ytApiReady&&ytPlayer&&typeof ytPlayer.loadVideoById==="function"){
    try{ytPlayer.loadVideoById(v.youtubeId)}catch{createPlayer(v.youtubeId)}
  }else if(ytApiReady){
    createPlayer(v.youtubeId)
  }else{
    loadYouTubeApi()
  }
  $("#vioPlayerShell").scrollIntoView({behavior:"smooth",block:"center"})
}
function createPlayer(videoId){
  if(!window.YT?.Player)return;
  if(ytPlayer&&typeof ytPlayer.loadVideoById==="function"){
    try{ytPlayer.loadVideoById(videoId);return}catch{}
  }
  $("#vioPlayer").innerHTML="";
  ytPlayer=new YT.Player("vioPlayer",{
    videoId,
    playerVars:{playsinline:1,rel:0,modestbranding:1},
    events:{
      onReady:e=>{try{e.target.playVideo()}catch{}},
      onStateChange:e=>e.data===YT.PlayerState.PLAYING?startVioUsage():stopVioTicker()
    }
  })
}
function startVioUsage(){if(vioRemainingMs()<=0){stopVioPlayback();renderVio();return}if(vioPlaying)return;vioPlaying=true;vioPlayTickAt=Date.now();clearInterval(vioUsageInterval);vioUsageInterval=setInterval(()=>{if(!vioPlaying)return;const now=Date.now(),delta=now-vioPlayTickAt;vioPlayTickAt=now;state.vio.usedMs+=Math.max(0,Math.min(delta,2000));saveState({snapshot:false});renderVioTime();if(vioRemainingMs()<=0){stopVioPlayback();renderVio();toast("Mára elfogyott a videóidő")}},1000)}
function renderVioTime(){const rem=vioRemainingMs(),lim=vioLimitMs(),frac=lim?rem/lim:0;$("#vioRemainingText").textContent=mmss(rem);$("#vioProgressBar").style.width=`${Math.max(0,Math.min(100,frac*100))}%`;$("#vioTimeSummary").textContent=rem>0?`Ma még ${mmss(rem)} videóidő maradt.`:"Mára elfogyott a videóidő."}
function stopVioTicker(){if(vioPlaying){const now=Date.now();state.vio.usedMs+=Math.max(0,Math.min(now-vioPlayTickAt,2000));saveState({snapshot:false})}vioPlaying=false;clearInterval(vioUsageInterval);vioUsageInterval=null}
function stopVioPlayback(){stopVioTicker();if(ytPlayer){try{ytPlayer.stopVideo()}catch{}}}
function closeVioPlayer(){stopVioPlayback();$("#vioPlayerShell").hidden=true;vioCurrentVideoId=null;markActiveVioVideo()}
function puppy(){const m=["A kiskutya már szundikál. 💤","Holnap újra jöhet egy videó! 🌙","Most jöhet egy mese, rajzolás vagy játék. 💛"];$("#vioEndMessage").textContent=m[Math.floor(Math.random()*m.length)]}

/* Cloud backup using Supabase Auth + REST */
const cloudSession=()=>{try{return JSON.parse(localStorage.getItem(CLOUD_SESSION_KEY)||"null")}catch{return null}};
const setCloudSession=s=>s?localStorage.setItem(CLOUD_SESSION_KEY,JSON.stringify(s)):localStorage.removeItem(CLOUD_SESSION_KEY);
const cloudValid=()=>/^https:\/\/.+\.supabase\.co\/?$/i.test((state.cloud.url||"").trim())&&(state.cloud.key||"").trim().length>20;
function cloudHeaders(auth=true){const s=cloudSession(),h={apikey:state.cloud.key,"Content-Type":"application/json"};if(auth&&s?.access_token)h.Authorization=`Bearer ${s.access_token}`;return h}
async function authReq(path,body){const r=await fetch(`${state.cloud.url.replace(/\/$/,"")}/auth/v1/${path}`,{method:"POST",headers:cloudHeaders(false),body:JSON.stringify(body)}),d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d.msg||d.message||d.error_description||"Supabase hiba");return d}
function saveCloudInputs(){state.cloud.url=$("#cloudUrlInput").value.trim().replace(/\/$/,"");state.cloud.key=$("#cloudKeyInput").value.trim();state.cloud.email=$("#cloudEmailInput").value.trim();saveState({cloud:false})}
async function cloudSignUp(){saveCloudInputs();if(!cloudValid())return toast("Project URL vagy kulcs hiányzik");const email=$("#cloudEmailInput").value.trim(),password=$("#cloudPasswordInput").value;if(!email||password.length<6)return toast("Adj meg e-mailt és legalább 6 karakteres jelszót");try{const d=await authReq("signup",{email,password});if(d.access_token){setCloudSession(d);state.cloud.enabled=true;saveState({cloud:false})}$("#cloudStatus").textContent=d.access_token?"Regisztráció és belépés sikerült.":"Regisztráció sikerült. Ha kell, erősítsd meg az e-mailt, majd lépj be.";$("#cloudPasswordInput").value="";await refreshCloud()}catch(e){$("#cloudStatus").textContent=e.message}}
async function cloudSignIn(){saveCloudInputs();if(!cloudValid())return toast("Project URL vagy kulcs hiányzik");try{const d=await authReq("token?grant_type=password",{email:$("#cloudEmailInput").value.trim(),password:$("#cloudPasswordInput").value});setCloudSession(d);state.cloud.enabled=true;saveState({cloud:false});$("#cloudPasswordInput").value="";$("#cloudStatus").textContent=`Bejelentkezve: ${d.user?.email||state.cloud.email}`;await refreshCloud();toast("Felhőmentés bekapcsolva")}catch(e){$("#cloudStatus").textContent=e.message}}
function parseJwt(t){try{return JSON.parse(atob(t.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")))}catch{return null}}
async function ensureSession(){let s=cloudSession();if(!s?.access_token)return null;const exp=(s.expires_at||0)*1000;if(exp&&exp-Date.now()>60000)return s;if(!s.refresh_token)return null;try{s=await authReq("token?grant_type=refresh_token",{refresh_token:s.refresh_token});setCloudSession(s);return s}catch{setCloudSession(null);return null}}
async function listCloud(limit=10){const s=await ensureSession();if(!s)return[];const r=await fetch(`${state.cloud.url}/rest/v1/startpage_backups?select=id,created_at,state&order=created_at.desc&limit=${limit}`,{headers:cloudHeaders(true)});if(!r.ok)throw new Error(await r.text());return r.json()}
async function cloudInsert(){if(!state.cloud.enabled||!cloudValid())return;const s=await ensureSession();if(!s)return;const uid=s.user?.id||parseJwt(s.access_token)?.sub;if(!uid)return;const r=await fetch(`${state.cloud.url}/rest/v1/startpage_backups`,{method:"POST",headers:{...cloudHeaders(true),Prefer:"return=minimal"},body:JSON.stringify({user_id:uid,device_id:navigator.userAgent.slice(0,120),state:clone(state)})});if(!r.ok)throw new Error(await r.text());lastCloudBackupAt=Date.now();const all=await listCloud(12);for(const old of all.slice(5))await fetch(`${state.cloud.url}/rest/v1/startpage_backups?id=eq.${encodeURIComponent(old.id)}`,{method:"DELETE",headers:cloudHeaders(true)})}
function scheduleCloudBackup(){if(!state.cloud.enabled||!cloudSession()||cloudBackupTimer)return;const delay=Math.max(2500,30000-(Date.now()-lastCloudBackupAt));cloudBackupTimer=setTimeout(()=>{cloudBackupTimer=null;cloudInsert().catch(()=>{})},delay)}
async function cloudBackupNow(){saveCloudInputs();if(!cloudSession())return toast("Előbb lépj be");try{await cloudInsert();await refreshCloud();toast("Felhőmentés elkészült")}catch(e){$("#cloudStatus").textContent=e.message}}
async function restoreCloud(item){if(!item?.state)return;if(!confirm(`Visszaállítsam? ${new Date(item.created_at).toLocaleString(locale)}`))return;state=migrate({value:item.state});saveState({cloud:false,snapshot:false});initUi();await Promise.all([loadWeather(),loadCurrencies()]);toast("Felhőmentés visszaállítva")}
async function restoreLatestCloud(){try{const a=await listCloud(1);if(!a.length)return toast("Nincs felhőmentés");await restoreCloud(a[0])}catch(e){$("#cloudStatus").textContent=e.message}}
async function refreshCloud(){$("#cloudUrlInput").value=state.cloud.url||"";$("#cloudKeyInput").value=state.cloud.key||"";$("#cloudEmailInput").value=state.cloud.email||"";const s=await ensureSession();$("#cloudStatus").textContent=s?`Bejelentkezve: ${s.user?.email||state.cloud.email||"felhasználó"} · automatikus mentés ${state.cloud.enabled?"BE":"KI"}`:"Nincs bejelentkezve.";$("#cloudSnapshots").innerHTML="";if(!s)return;try{const a=await listCloud(5);$("#cloudSnapshots").dataset.snapshots=JSON.stringify(a);$("#cloudSnapshots").innerHTML=a.map(x=>`<div class="snapshot-row"><span>${new Date(x.created_at).toLocaleString(locale)}</span><button type="button" data-cloud-restore="${x.id}">Visszaállítás</button></div>`).join("")||'<div class="hint">Még nincs felhőmentés.</div>'}catch(e){$("#cloudStatus").textContent=e.message}}
function cloudSignOut(){setCloudSession(null);state.cloud.enabled=false;saveState({cloud:false});$("#cloudStatus").textContent="Nincs bejelentkezve.";$("#cloudSnapshots").innerHTML="";toast("Kijelentkezve")}

/* settings + backup */
function populateSettings(){$("#cityInput").value=state.city.name;$("#currenciesInput").value=state.currencies.join(", ");$("#currencyWidgetSize").value=state.currencyWidgetSize||"auto";$("#currentProfileName").textContent=PROFILE_LABELS[state.activeProfile];renderWidgetToggles();refreshCloud()}
function openSettings(){populateSettings();$("#settingsPanel").classList.add("open");$("#settingsPanel").setAttribute("aria-hidden","false");$("#overlay").classList.add("show")}
function closeSettings(){$("#settingsPanel").classList.remove("open");$("#settingsPanel").setAttribute("aria-hidden","true");$("#overlay").classList.remove("show")}
async function saveCity(){const q=$("#cityInput").value.trim();if(!q)return;toast("Város keresése…");try{const r=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=hu&format=json`);if(!r.ok)throw 0;const x=(await r.json()).results?.[0];if(!x)return toast("Nem találtam ilyen várost");state.city={name:x.name,latitude:x.latitude,longitude:x.longitude,timezone:x.timezone||"auto"};saveState();await loadWeather();toast(`Mentve: ${state.city.name}`)}catch{toast("A városkeresés sikertelen")}}
function saveCurrencies(){const a=$("#currenciesInput").value.split(",").map(v=>v.trim().toUpperCase()).filter(v=>/^[A-Z]{3}$/.test(v)).slice(0,3);if(!a.length)return toast("Adj meg legalább egy devizakódot");state.currencies=[...new Set(a)];state.currencies.forEach(c=>{if(state.currencyAmounts[c]==null)state.currencyAmounts[c]=1000});saveState();applyCurrencyWidgetSizing();loadCurrencies();toast("Devizák mentve")}
function exportSettings(){saveLocalSnapshot();const b=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}),u=URL.createObjectURL(b),a=document.createElement("a");a.href=u;a.download=`lapiit-startpage-v5-${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(u)}
async function importSettings(file){try{saveLocalSnapshot();state=migrate({value:JSON.parse(await file.text())});saveState({cloud:false,snapshot:false});initUi();await Promise.all([loadWeather(),loadCurrencies()]);toast("Beállítások importálva")}catch{toast("A fájl nem importálható")}}
function resetAll(){if(!confirm("Minden helyi beállítás, teendő, link és Vio-adat törlődik. Folytatod?"))return;saveLocalSnapshot();state=clone(DEFAULT_STATE);state.vio.day=todayKey();saveState({cloud:false,snapshot:false});initUi();loadWeather();loadCurrencies();closeSettings();toast("Alaphelyzet visszaállítva")}
function initCardDrag(){let dragged=null;$$(".card").forEach(c=>{c.addEventListener("dragstart",e=>{if(e.target.closest(".link-drag,.todo-drag,input,button,select")){e.preventDefault();return}dragged=c;c.classList.add("dragging");e.dataTransfer.effectAllowed="move"});c.addEventListener("dragend",()=>{dragged?.classList.remove("dragging");dragged=null;if(NORMAL_PROFILES.includes(state.activeProfile)){currentProfile().widgetOrder=$$(".card",$("#dashboard")).map(x=>x.dataset.widget);saveState()}});c.addEventListener("dragover",e=>{e.preventDefault();if(!dragged||dragged===c)return;const r=c.getBoundingClientRect();$("#dashboard").insertBefore(dragged,e.clientY>r.top+r.height/2?c.nextSibling:c)})})}
async function cleanupLegacyPwa(){
  try{
    const base=new URL("./",location.href).href;
    if("serviceWorker"in navigator){
      const registrations=await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.filter(r=>r.scope===base||r.scope.startsWith(base)).map(r=>r.unregister()));
    }
    if("caches"in window){
      const keys=await caches.keys();
      await Promise.all(keys.filter(k=>/^((lapiit|peter)-startpage)/i.test(k)).map(k=>caches.delete(k)));
    }
  }catch{}
}
function initUi(){applyAppearance();renderProfile();renderCurrencyCards();setTimerMode(timerMode)}


/* events */
$$(".profile-tab").forEach(b=>b.addEventListener("click",()=>switchProfile(b.dataset.profile)));
$("#searchForm").addEventListener("submit",e=>{e.preventDefault();runSearch($("#searchInput").value)});
$("#searchEngine").addEventListener("change",e=>{state.searchEngine=e.target.value;saveState()});
document.addEventListener("keydown",e=>{const typing=e.target.matches?.("input,textarea,select");if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();if(!$("#normalView").hidden)$("#searchInput").focus()}else if(e.key==="/"&&!typing&&!$("#normalView").hidden){e.preventDefault();$("#searchInput").focus()}});

$("#todoForm").addEventListener("submit",e=>{e.preventDefault();const input=$("#todoInput"),text=input.value.trim();if(!text)return;currentProfile().todos.unshift({id:uuid(),text,done:false});input.value="";saveState();renderTodos()});
$("#todoList").addEventListener("click",e=>{const row=e.target.closest(".todo");if(!row)return;const t=currentProfile().todos.find(x=>x.id===row.dataset.id);if(!t)return;if(e.target.matches('input[type="checkbox"]')){t.done=e.target.checked;saveState();renderTodos()}else if(e.target.closest(".todo-edit"))openTodo(t)});
$("#todoEditForm").addEventListener("submit",e=>{e.preventDefault();const t=currentProfile().todos.find(x=>x.id===$("#todoEditId").value);if(t){t.text=$("#todoEditText").value.trim()||t.text;saveState();renderTodos()}$("#todoDialog").close()});
$("#todoDeleteBtn").addEventListener("click",()=>{const id=$("#todoEditId").value;currentProfile().todos=currentProfile().todos.filter(x=>x.id!==id);saveState();renderTodos();$("#todoDialog").close()});
$("#clearDoneBtn").addEventListener("click",()=>{currentProfile().todos=currentProfile().todos.filter(t=>!t.done);saveState();renderTodos()});

$("#addLinkBtn").addEventListener("click",()=>openLink());
$("#quickGrid").addEventListener("click",e=>{const m=e.target.closest(".link-menu");if(!m)return;e.preventDefault();e.stopPropagation();const id=m.closest(".quick-link").dataset.id;openLink(currentProfile().links.find(x=>x.id===id))});
$("#linkForm").addEventListener("submit",e=>{e.preventDefault();const id=$("#linkId").value,item={id:id||uuid(),name:$("#linkName").value.trim(),url:normalizeUrl($("#linkUrl").value),icon:$("#linkIcon").value.trim()||$("#linkName").value.trim()[0]?.toUpperCase()||"•"},a=currentProfile().links;if(id){const i=a.findIndex(x=>x.id===id);if(i>=0)a[i]=item}else a.push(item);saveState();renderLinks();$("#linkDialog").close()});
$("#deleteLinkBtn").addEventListener("click",()=>{const id=$("#linkId").value;currentProfile().links=currentProfile().links.filter(x=>x.id!==id);saveState();renderLinks();$("#linkDialog").close()});

$("#rangeSelector").addEventListener("click",e=>{const b=e.target.closest("button[data-range]");if(!b)return;state.currencyRange=+b.dataset.range;saveState();loadCurrencies()});
$("#currencyGrid").addEventListener("input",e=>{const i=e.target.closest(".currency-amount");if(!i)return;state.currencyAmounts[i.dataset.code]=+i.value||0;saveState({snapshot:false});updateCurrencyCalculation(i.dataset.code)});

$$(".focus-tabs button").forEach(b=>b.addEventListener("click",()=>setTimerMode(b.dataset.mode)));
$("#startTimer").addEventListener("click",()=>{cancelAnimationFrame(timerFrame);if(timerMode==="stopwatch"){if(stopwatchRunning){stopwatchElapsed+=performance.now()-stopwatchStart;stopwatchRunning=false;$("#startTimer").textContent="Start"}else{stopwatchStart=performance.now();stopwatchRunning=true;$("#startTimer").textContent="Szünet"}}else{if(pomodoroRunning){pomodoroRemaining=Math.max(0,pomodoroEnd-Date.now());pomodoroRunning=false;$("#startTimer").textContent="Start"}else{pomodoroEnd=Date.now()+pomodoroRemaining;pomodoroRunning=true;$("#startTimer").textContent="Szünet"}}tickFocus()});
$("#resetTimer").addEventListener("click",()=>{cancelAnimationFrame(timerFrame);if(timerMode==="stopwatch"){stopwatchRunning=false;stopwatchElapsed=0;lapNumber=0;$("#lapInfo").textContent=""}else{pomodoroRunning=false;pomodoroPhase="work";pomodoroRemaining=state.pomodoro.workMinutes*60000;$("#focusLabel").textContent="Fókuszidő";$("#lapInfo").textContent=`${state.pomodoro.workMinutes} perc fókusz / ${state.pomodoro.breakMinutes} perc szünet`}$("#startTimer").textContent="Start";tickFocus()});
$("#lapTimer").addEventListener("click",()=>{if(timerMode==="stopwatch"){const c=stopwatchElapsed+(stopwatchRunning?performance.now()-stopwatchStart:0);if(c<=0)return;lapNumber++;$("#lapInfo").textContent=`${lapNumber}. kör: ${$("#timerDisplay").textContent}`}else{pomodoroRunning=false;pomodoroPhase=pomodoroPhase==="work"?"break":"work";pomodoroRemaining=(pomodoroPhase==="work"?state.pomodoro.workMinutes:state.pomodoro.breakMinutes)*60000;$("#focusLabel").textContent=pomodoroPhase==="work"?"Fókuszidő":"Szünet";$("#startTimer").textContent="Start";tickFocus()}});

$("#settingsBtn").addEventListener("click",openSettings);$("#closeSettingsBtn").addEventListener("click",closeSettings);$("#overlay").addEventListener("click",closeSettings);
$("#themeSelect").addEventListener("change",e=>{state.theme=e.target.value;saveState();applyAppearance();loadCurrencies()});
$("#densitySelect").addEventListener("change",e=>{state.density=e.target.value;saveState();applyAppearance();loadCurrencies()});
$("#backgroundSelect").addEventListener("change",e=>setBackground(e.target.value));
$("#backgroundDimRange").addEventListener("input",e=>{state.backgroundDim=+e.target.value;saveState({snapshot:false});applyAppearance()});
$("#autoBackgroundToggle").addEventListener("change",e=>{state.autoRotateBackground=e.target.checked;saveState();configureBackgroundRotation()});
$("#randomBackgroundToggle").addEventListener("change",e=>{state.randomBackground=e.target.checked;saveState()});
$("#motionToggle").addEventListener("change",e=>{state.backgroundMotion=e.target.checked;saveState();applyAppearance()});
$("#glassRange").addEventListener("input",e=>{state.glass=+e.target.value;saveState({snapshot:false});applyAppearance()});
$("#quoteInput").addEventListener("change",e=>{state.quote=e.target.value.trim()||DEFAULT_STATE.quote;saveState();applyAppearance()});
$("#widgetToggles").addEventListener("change",e=>{const k=e.target.dataset.widgetToggle;if(!k||!NORMAL_PROFILES.includes(state.activeProfile))return;currentProfile().widgetVisibility[k]=e.target.checked;saveState();applyWidgetLayout()});
$("#saveCityBtn").addEventListener("click",saveCity);$("#saveCurrenciesBtn").addEventListener("click",saveCurrencies);
$("#currencyWidgetSize").addEventListener("change",e=>{
  state.currencyWidgetSize=e.target.value;
  saveState();
  applyCurrencyWidgetSizing();
  requestAnimationFrame(()=>loadCurrencies());
});
$("#exportBtn").addEventListener("click",exportSettings);$("#importBtn").addEventListener("click",()=>$("#importFile").click());$("#importFile").addEventListener("change",e=>{const f=e.target.files?.[0];if(f)importSettings(f);e.target.value=""});$("#restoreLocalBtn").addEventListener("click",restoreLastLocalSnapshot);$("#resetAllBtn").addEventListener("click",resetAll);
$("#refreshBtn").addEventListener("click",async()=>{toast("Adatok frissítése…");await Promise.all([loadWeather(),loadCurrencies()]);toast("Frissítve")});$("#bgNextBtn").addEventListener("click",nextBackground);$("#fullscreenBtn").addEventListener("click",()=>document.fullscreenElement?document.exitFullscreen?.():document.documentElement.requestFullscreen?.());

$("#vioParentBtn").addEventListener("click",()=>parentAccess(openVioParent));
$("#pinForm").addEventListener("submit",e=>{e.preventDefault();submitPin()});
$("#vioLimitInput").addEventListener("change",e=>{state.vio.dailyLimitMinutes=Math.max(1,Math.min(240,+e.target.value||15));saveState();renderVio()});
$("#vioPlusFiveBtn").addEventListener("click",()=>{state.vio.bonusMs+=300000;saveState();renderVio();toast("+5 perc hozzáadva mára")});
$("#vioResetTodayBtn").addEventListener("click",()=>{if(confirm("Nullázzam a mai felhasznált videóidőt?")){state.vio.usedMs=0;state.vio.bonusMs=0;saveState();renderVio()}});
$("#vioAddVideoBtn").addEventListener("click",()=>{const title=$("#vioVideoTitleInput").value.trim(),url=$("#vioVideoUrlInput").value.trim(),youtubeId=extractYouTubeId(url);if(!title||!youtubeId)return toast("Adj meg címet és érvényes YouTube URL-t");state.vio.videos.push({id:uuid(),title,url:normalizeUrl(url),youtubeId});$("#vioVideoTitleInput").value="";$("#vioVideoUrlInput").value="";saveState();renderVioParentLists();renderVio()});
$("#vioAddLinkBtn").addEventListener("click",()=>{const title=$("#vioLinkTitleInput").value.trim(),url=normalizeUrl($("#vioLinkUrlInput").value);if(!title||!url)return toast("Adj meg nevet és URL-t");state.vio.links.push({id:uuid(),title,url});$("#vioLinkTitleInput").value="";$("#vioLinkUrlInput").value="";saveState();renderVioParentLists();renderVio()});
$("#vioParentVideoList").addEventListener("click",e=>{const id=e.target.dataset.deleteVioVideo;if(!id)return;state.vio.videos=state.vio.videos.filter(v=>v.id!==id);saveState();renderVioParentLists();renderVio()});
$("#vioParentLinkList").addEventListener("click",e=>{const id=e.target.dataset.deleteVioLink;if(!id)return;state.vio.links=state.vio.links.filter(v=>v.id!==id);saveState();renderVioParentLists();renderVio()});
$("#vioChangePinBtn").addEventListener("click",()=>parentAccess(()=>openPin("change")));
$("#vioCloseParentBtn").addEventListener("click",()=>$("#vioParentDialog").close());
$("#vioVideoGrid").addEventListener("click",e=>{const t=e.target.closest("[data-video-id]");if(t)playVioVideo(t.dataset.videoId)});
$("#vioClosePlayerBtn").addEventListener("click",closeVioPlayer);$("#sleepyDog").addEventListener("click",puppy);
document.addEventListener("visibilitychange",()=>{if(document.hidden){try{ytPlayer?.pauseVideo()}catch{}stopVioTicker()}});

$("#cloudSignUpBtn").addEventListener("click",cloudSignUp);$("#cloudSignInBtn").addEventListener("click",cloudSignIn);$("#cloudBackupBtn").addEventListener("click",cloudBackupNow);$("#cloudRestoreBtn").addEventListener("click",restoreLatestCloud);$("#cloudSignOutBtn").addEventListener("click",cloudSignOut);
$("#cloudSnapshots").addEventListener("click",e=>{const id=e.target.dataset.cloudRestore;if(!id)return;try{const a=JSON.parse($("#cloudSnapshots").dataset.snapshots||"[]"),x=a.find(v=>v.id===id);if(x)restoreCloud(x)}catch{}});

window.addEventListener("resize",()=>{clearTimeout(window.__chartResizeTimer);window.__chartResizeTimer=setTimeout(()=>state.currencies.forEach(c=>latestChartData[c]&&drawChart($(`#${c}Chart`),latestChartData[c],$(`#${c}Change`)?.classList.contains("down"))),180)});
window.addEventListener("beforeunload",()=>{stopVioTicker();saveState({cloud:false,snapshot:false})});

/* boot */
if(state.randomBackground){const a=BACKGROUNDS.filter(x=>x!==state.background);state.background=a[Math.floor(Math.random()*a.length)]||state.background}
resetVioDay();saveState({cloud:false,snapshot:false});initUi();initCardDrag();updateClock();setInterval(updateClock,1000);loadWeather();loadCurrencies();setInterval(loadWeather,1200000);setInterval(loadCurrencies,3600000);cleanupLegacyPwa();
