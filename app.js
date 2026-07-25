"use strict";

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const locale = "hu-HU";
const STORAGE_KEY = "peterStartpageV4";
const LEGACY_KEYS = ["peterStartpageV3", "peterStartpageV2"];
const BACKGROUNDS = ["mountains", "aurora", "stars", "rain", "waves"];
const SEARCH_ENGINES = {
  google: query => `https://www.google.com/search?q=${encodeURIComponent(query)}`,
  duckduckgo: query => `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
  youtube: query => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
  github: query => `https://github.com/search?q=${encodeURIComponent(query)}`,
  wikipedia: query => `https://hu.wikipedia.org/w/index.php?search=${encodeURIComponent(query)}`
};
let backgroundRotationTimer = null;
let latestRates = {};
let latestChartData = {};

const DEFAULT_STATE = {
  theme: "midnight",
  background: "mountains",
  backgroundDim: 42,
  autoRotateBackground: false,
  randomBackground: false,
  backgroundMotion: true,
  glass: 82,
  quote: "„Fókuszálj a haladásra, ne a tökéletességre.”",
  searchEngine: "google",
  city: { name: "Pécs", latitude: 46.0727, longitude: 18.2323, timezone: "Europe/Budapest" },
  currencies: ["GBP", "EUR", "USD"],
  currencyRange: 30,
  currencyAmounts: { GBP: 1000, EUR: 1000, USD: 1000 },
  widgetVisibility: { weather: true, currencies: true, todos: true, links: true, focus: true },
  widgetOrder: ["weather", "currencies", "todos", "links", "focus"],
  todos: [
    { id: crypto.randomUUID(), text: "React + TypeScript tanulás", done: false },
    { id: crypto.randomUUID(), text: "Projektötlet megírása", done: true },
    { id: crypto.randomUUID(), text: "Edzés", done: true },
    { id: crypto.randomUUID(), text: "CV frissítése", done: false }
  ],
  links: [
    { id: crypto.randomUUID(), name: "Spotify", url: "https://open.spotify.com", icon: "♫" },
    { id: crypto.randomUUID(), name: "Gmail", url: "https://mail.google.com", icon: "M" },
    { id: crypto.randomUUID(), name: "GitHub", url: "https://github.com", icon: "⌘" },
    { id: crypto.randomUUID(), name: "YouTube", url: "https://youtube.com", icon: "▶" },
    { id: crypto.randomUUID(), name: "ChatGPT", url: "https://chatgpt.com", icon: "✦" },
    { id: crypto.randomUUID(), name: "ClickUp", url: "https://app.clickup.com", icon: "✓" },
    { id: crypto.randomUUID(), name: "Naptár", url: "https://calendar.google.com", icon: "31" },
    { id: crypto.randomUUID(), name: "Revolut", url: "https://app.revolut.com", icon: "R" }
  ],
  pomodoro: { workMinutes: 25, breakMinutes: 5 }
};

function deepClone(value) { return JSON.parse(JSON.stringify(value)); }
function loadSavedState() {
  const raw = localStorage.getItem(STORAGE_KEY) || LEGACY_KEYS.map(key => localStorage.getItem(key)).find(Boolean);
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}
function mergeDefaults(saved) {
  const base = deepClone(DEFAULT_STATE);
  return {
    ...base, ...saved,
    city: { ...base.city, ...(saved?.city || {}) },
    widgetVisibility: { ...base.widgetVisibility, ...(saved?.widgetVisibility || {}) },
    pomodoro: { ...base.pomodoro, ...(saved?.pomodoro || {}) },
    currencyAmounts: { ...base.currencyAmounts, ...(saved?.currencyAmounts || {}) },
    todos: Array.isArray(saved?.todos) ? saved.todos : base.todos,
    links: Array.isArray(saved?.links) ? saved.links : base.links,
    widgetOrder: Array.isArray(saved?.widgetOrder) ? saved.widgetOrder : base.widgetOrder
  };
}
let state = mergeDefaults(loadSavedState());
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function showStatus(message) {
  const element = $("#status");
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(showStatus.timer);
  showStatus.timer = setTimeout(() => element.classList.remove("show"), 2500);
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
}
function normalizeUrl(url) {
  const value = String(url || "").trim();
  if (!value) return "https://example.com";
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}
function linkDomain(url) {
  try { return new URL(normalizeUrl(url)).hostname; } catch { return ""; }
}
function faviconCandidates(url) {
  const normalized = normalizeUrl(url);
  try {
    const parsed = new URL(normalized);
    return [
      `${parsed.origin}/favicon.ico`,
      `https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(parsed.origin)}&sz=64`
    ];
  } catch { return []; }
}
function updateClock() {
  const now = new Date();
  $("#clock").textContent = now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });
  $("#date").textContent = now.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric", weekday: "long" });
}
function applyAppearance() {
  document.body.dataset.theme = state.theme;
  document.body.dataset.background = state.background;
  document.body.classList.toggle("no-background-motion", !state.backgroundMotion);
  document.documentElement.style.setProperty("--panel-alpha", (state.glass / 100).toFixed(2));
  document.documentElement.style.setProperty("--background-dim", (state.backgroundDim / 100).toFixed(2));
  $("#quoteText").textContent = state.quote;
  $("#themeSelect").value = state.theme;
  $("#backgroundSelect").value = state.background;
  $("#backgroundDimRange").value = state.backgroundDim;
  $("#autoBackgroundToggle").checked = state.autoRotateBackground;
  $("#randomBackgroundToggle").checked = state.randomBackground;
  $("#motionToggle").checked = state.backgroundMotion;
  $("#glassRange").value = state.glass;
  $("#quoteInput").value = state.quote;
  $("#searchEngine").value = state.searchEngine;
  const meta = $('meta[name="theme-color"]');
  if (meta) meta.content = state.theme === "light" ? "#e9edf3" : "#071018";
  configureBackgroundRotation();
}
function setBackground(name, persist = true) {
  if (!BACKGROUNDS.includes(name)) return;
  state.background = name;
  if (persist) saveState();
  applyAppearance();
}
function nextBackground() {
  const currentIndex = BACKGROUNDS.indexOf(state.background);
  setBackground(BACKGROUNDS[(currentIndex + 1) % BACKGROUNDS.length]);
  const label = $("#backgroundSelect").selectedOptions[0]?.textContent || state.background;
  showStatus(`Háttér: ${label}`);
}
function configureBackgroundRotation() {
  clearInterval(backgroundRotationTimer);
  backgroundRotationTimer = null;
  if (state.autoRotateBackground) {
    backgroundRotationTimer = setInterval(() => {
      const currentIndex = BACKGROUNDS.indexOf(state.background);
      state.background = BACKGROUNDS[(currentIndex + 1) % BACKGROUNDS.length];
      saveState();
      document.body.dataset.background = state.background;
      $("#backgroundSelect").value = state.background;
    }, 10 * 60 * 1000);
  }
}
function applyWidgetLayout() {
  const dashboard = $("#dashboard");
  state.widgetOrder.forEach(name => {
    const card = $(`[data-widget="${name}"]`);
    if (card) dashboard.appendChild(card);
  });
  Object.entries(state.widgetVisibility).forEach(([name, visible]) => {
    $(`[data-widget="${name}"]`)?.classList.toggle("hidden-widget", !visible);
  });
}

const weatherMap = {
  0:["☀️","Tiszta"],1:["🌤️","Többnyire derült"],2:["⛅","Részben felhős"],3:["☁️","Borult"],
  45:["🌫️","Ködös"],48:["🌫️","Zúzmarás köd"],51:["🌦️","Enyhe szitálás"],53:["🌦️","Szitálás"],55:["🌧️","Erős szitálás"],
  61:["🌦️","Enyhe eső"],63:["🌧️","Eső"],65:["🌧️","Erős eső"],71:["🌨️","Enyhe havazás"],73:["🌨️","Havazás"],75:["❄️","Erős havazás"],
  80:["🌦️","Zápor"],81:["🌧️","Erős zápor"],82:["⛈️","Heves zápor"],95:["⛈️","Zivatar"],96:["⛈️","Zivatar jéggel"],99:["⛈️","Erős zivatar"]
};
function weatherInfo(code) { return weatherMap[code] || ["🌡️", "Változó idő"]; }
function weatherUrl() {
  const { latitude, longitude, timezone } = state.city;
  return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,surface_pressure,wind_speed_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max` +
    `&timezone=${encodeURIComponent(timezone || "auto")}&forecast_days=7`;
}
function buildWeatherAdvice(current, daily) {
  const code = Number(current.weather_code || 0);
  const rainChance = Number(daily.precipitation_probability_max?.[0] || 0);
  const uv = Number(daily.uv_index_max?.[0] || 0);
  const maximum = Number(daily.temperature_2m_max?.[0] ?? current.temperature_2m);
  const wind = Number(current.wind_speed_10m || 0);
  const pieces = [];
  if (code >= 95) pieces.push("Zivatar várható, a szabadtéri programokat érdemes rugalmasan kezelni.");
  else if (rainChance >= 55 || Number(current.precipitation || 0) > .4) pieces.push(`Eső valószínűsége ${Math.round(rainChance)}% – az esernyő jó ötlet.`);
  if (wind >= 35) pieces.push("Erős a szél, biciklizésnél számíts nehezebb szakaszokra.");
  if (maximum >= 30) pieces.push("Meleg nap lesz: víz és könnyű öltözet ajánlott.");
  if (uv >= 6) pieces.push(`Magas UV-index (${uv.toFixed(1)}), naptej ajánlott.`);
  if (Number(current.temperature_2m) <= 5) pieces.push("Hűvös van, réteges öltözet ajánlott.");
  if (!pieces.length) {
    if (wind <= 22 && rainChance < 35 && code < 80) pieces.push("Az idő kedvezőnek tűnik sétához vagy rövid biciklizéshez.");
    else pieces.push("Változó idő várható; indulás előtt érdemes még egyszer ránézni.");
  }
  return pieces.slice(0, 2).join(" ");
}
async function loadWeather() {
  $("#weatherTitle").textContent = `Időjárás – ${state.city.name}`;
  try {
    const response = await fetch(weatherUrl());
    if (!response.ok) throw new Error("weather");
    const data = await response.json();
    const current = data.current;
    const [icon, text] = weatherInfo(current.weather_code);
    $("#currentWeatherIcon").textContent = icon;
    $("#currentTemp").classList.remove("loading");
    $("#currentTemp").textContent = `${Math.round(current.temperature_2m)}°C`;
    $("#currentCondition").textContent = text;
    $("#feelsLike").textContent = `Hőérzet: ${Math.round(current.apparent_temperature)}°C`;
    $("#humidity").textContent = `${Math.round(current.relative_humidity_2m)}%`;
    $("#wind").textContent = `${Math.round(current.wind_speed_10m)} km/h`;
    $("#pressure").textContent = `${Math.round(current.surface_pressure)} hPa`;
    $("#precipitation").textContent = `${Number(current.precipitation || 0).toFixed(1)} mm`;
    $("#weatherAdviceText").textContent = buildWeatherAdvice(current, data.daily);
    $("#weatherUpdated").textContent = `Frissítve: ${new Date().toLocaleTimeString(locale, { hour:"2-digit", minute:"2-digit" })}`;
    $("#forecast").innerHTML = data.daily.time.slice(1, 7).map((date, index) => {
      const i = index + 1;
      const [forecastIcon] = weatherInfo(data.daily.weather_code[i]);
      const day = new Date(`${date}T12:00:00`).toLocaleDateString(locale, { weekday:"short" });
      return `<div class="forecast-day"><div class="day">${escapeHtml(day)}</div><div class="ico">${forecastIcon}</div><div class="high">${Math.round(data.daily.temperature_2m_max[i])}°</div><div class="low">${Math.round(data.daily.temperature_2m_min[i])}°</div></div>`;
    }).join("");
  } catch {
    $("#currentTemp").classList.remove("loading");
    $("#currentTemp").textContent = "—";
    $("#currentCondition").textContent = "Az időjárás most nem érhető el";
    $("#weatherAdviceText").textContent = "Az ajánlás az időjárási adatokkal együtt fog megjelenni.";
    $("#forecast").innerHTML = '<div class="small-muted" style="grid-column:1/-1">Ellenőrizd az internetkapcsolatot, majd frissítsd az oldalt.</div>';
  }
}

function isoDate(date) { return date.toISOString().slice(0, 10); }
function formatRate(value) { return Number(value).toLocaleString(locale, { minimumFractionDigits:2, maximumFractionDigits:2 }); }
function formatHuf(value) { return Number(value).toLocaleString(locale, { maximumFractionDigits:0 }); }
function currencyCard(code) {
  const amount = Number(state.currencyAmounts[code] ?? 1000);
  return `<section class="currency" data-code="${escapeHtml(code)}">
    <div class="currency-name">${escapeHtml(code)} / HUF</div>
    <div class="currency-value-row"><div class="currency-value loading" id="${code}Value">000,00</div><div class="currency-change" id="${code}Change">—</div></div>
    <div class="chart-label">${state.currencyRange} napos grafikon</div>
    <canvas id="${code}Chart" aria-label="${escapeHtml(code)}/HUF grafikon"></canvas>
    <div class="currency-calculator">
      <label for="${code}Amount">Devizakalkulátor</label>
      <input id="${code}Amount" class="currency-amount" data-code="${code}" type="number" min="0" step="1" value="${amount}" aria-label="${code} összeg" />
      <div class="currency-converted">= <strong id="${code}Converted">—</strong> Ft</div>
    </div>
  </section>`;
}
function renderCurrencyCards() {
  $("#currencyGrid").innerHTML = state.currencies.map(currencyCard).join("");
  $$("#rangeSelector button").forEach(button => button.classList.toggle("active", Number(button.dataset.range) === state.currencyRange));
}
function updateCurrencyCalculation(code) {
  const rate = latestRates[code];
  const input = $(`#${code}Amount`);
  const output = $(`#${code}Converted`);
  if (!input || !output) return;
  const amount = Number(input.value || 0);
  output.textContent = Number.isFinite(rate) ? formatHuf(amount * rate) : "—";
}
async function loadCurrency(code) {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - state.currencyRange - 8);
  const url = `https://api.frankfurter.dev/v1/${isoDate(start)}..${isoDate(end)}?base=${code}&symbols=HUF`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("currency");
  const data = await response.json();
  const points = Object.entries(data.rates).map(([date, rates]) => ({ date, value:rates.HUF })).filter(point => Number.isFinite(point.value)).slice(-state.currencyRange);
  const latest = points.at(-1)?.value;
  const previous = points.at(-2)?.value ?? latest;
  if (!latest) throw new Error("currency-empty");
  latestRates[code] = latest;
  latestChartData[code] = points.map(point => point.value);
  const difference = latest - previous;
  const percent = previous ? difference / previous * 100 : 0;
  const valueElement = $(`#${code}Value`);
  valueElement.classList.remove("loading");
  valueElement.textContent = formatRate(latest);
  const changeElement = $(`#${code}Change`);
  changeElement.classList.toggle("down", difference < 0);
  changeElement.innerHTML = `${difference >= 0 ? "+" : ""}${formatRate(difference)}<br>(${percent >= 0 ? "+" : ""}${percent.toFixed(2).replace(".", ",")}%)`;
  drawChart($(`#${code}Chart`), latestChartData[code], difference < 0);
  updateCurrencyCalculation(code);
}
async function loadCurrencies() {
  renderCurrencyCards();
  try {
    await Promise.all(state.currencies.map(loadCurrency));
    $("#currencyUpdated").textContent = `Frissítve: ${new Date().toLocaleTimeString(locale, { hour:"2-digit", minute:"2-digit" })}`;
  } catch {
    $("#currencyUpdated").textContent = "Az árfolyamadat nem érhető el";
    state.currencies.forEach(code => {
      const element = $(`#${code}Value`);
      if (element) { element.classList.remove("loading"); element.textContent = "—"; }
    });
  }
}
function drawChart(canvas, values, isDown) {
  if (!canvas || values.length < 2) return;
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.max(250, rect.width * ratio);
  canvas.height = 165 * ratio;
  const context = canvas.getContext("2d");
  context.scale(ratio, ratio);
  const width = canvas.width / ratio, height = canvas.height / ratio;
  const padding = { left:4, right:4, top:12, bottom:14 };
  const minimum = Math.min(...values), maximum = Math.max(...values), range = maximum - minimum || 1;
  const points = values.map((value, index) => ({ x:padding.left + index * ((width-padding.left-padding.right)/Math.max(1, values.length-1)), y:padding.top + (maximum-value)/range*(height-padding.top-padding.bottom) }));
  const rootStyle = getComputedStyle(document.documentElement);
  const lineColor = isDown ? (rootStyle.getPropertyValue("--danger").trim() || "#d96565") : (rootStyle.getPropertyValue("--accent").trim() || "#58bd68");
  context.clearRect(0,0,width,height);
  context.strokeStyle = "rgba(255,255,255,.06)";
  for (let i=1;i<4;i++) { const y=padding.top+i*((height-padding.top-padding.bottom)/4); context.beginPath(); context.moveTo(0,y); context.lineTo(width,y); context.stroke(); }
  const gradient = context.createLinearGradient(0,padding.top,0,height);
  gradient.addColorStop(0,colorWithAlpha(lineColor,.18)); gradient.addColorStop(1,colorWithAlpha(lineColor,0));
  context.beginPath(); context.moveTo(points[0].x,height-padding.bottom); points.forEach(point=>context.lineTo(point.x,point.y)); context.lineTo(points.at(-1).x,height-padding.bottom); context.closePath(); context.fillStyle=gradient; context.fill();
  context.beginPath(); points.forEach((point,index)=>index?context.lineTo(point.x,point.y):context.moveTo(point.x,point.y)); context.strokeStyle=lineColor; context.lineWidth=2.2; context.lineJoin="round"; context.lineCap="round"; context.stroke();
}
function colorWithAlpha(color, alpha) {
  if (color.startsWith("#")) { const hex=color.slice(1); const value=hex.length===3?hex.split("").map(char=>char+char).join(""):hex; const number=parseInt(value,16); return `rgba(${(number>>16)&255}, ${(number>>8)&255}, ${number&255}, ${alpha})`; }
  return color;
}

function renderTodos() {
  $("#todoList").innerHTML = state.todos.map(todo => `<div class="todo ${todo.done?"done":""}" data-id="${todo.id}"><input type="checkbox" ${todo.done?"checked":""} aria-label="Feladat kész"><label>${escapeHtml(todo.text)}</label><button class="delete-todo" title="Törlés">×</button></div>`).join("");
  const open = state.todos.filter(todo => !todo.done).length;
  $("#todoCount").textContent = open ? `${open} nyitott` : "Minden kész";
}
function faviconMarkup(link) {
  const candidates = faviconCandidates(link.url);
  const fallback = escapeHtml(link.icon || link.name[0].toUpperCase());
  if (!candidates.length) return `<span class="quick-fallback">${fallback}</span>`;
  return `<img src="${escapeHtml(candidates[0])}" data-favicon-next="${escapeHtml(candidates[1] || "")}" alt="" referrerpolicy="no-referrer"><span class="quick-fallback" hidden>${fallback}</span>`;
}
function renderLinks() {
  $("#quickGrid").innerHTML = state.links.map(link => `<div class="quick-link" data-id="${link.id}">
    <a class="quick-link-anchor" href="${escapeHtml(normalizeUrl(link.url))}" aria-label="${escapeHtml(link.name)}"></a>
    <button class="link-drag" draggable="true" title="Áthúzás" aria-label="Áthúzás">⋮⋮</button>
    <button class="link-menu" title="Szerkesztés" aria-label="Szerkesztés">⋯</button>
    <span class="quick-icon">${faviconMarkup(link)}</span><span class="quick-name">${escapeHtml(link.name)}</span>
  </div>`).join("");
  $$(".quick-icon img").forEach(image => {
    image.addEventListener("error", () => {
      const next = image.dataset.faviconNext;
      if (next && image.src !== next) { image.dataset.faviconNext = ""; image.src = next; return; }
      image.hidden = true;
      image.nextElementSibling.hidden = false;
    });
  });
  initializeLinkDragAndDrop();
}
function initializeLinkDragAndDrop() {
  let draggedId = null;
  $$(".link-drag").forEach(handle => {
    handle.addEventListener("dragstart", event => {
      draggedId = handle.closest(".quick-link").dataset.id;
      handle.closest(".quick-link").classList.add("link-dragging");
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("text/plain", draggedId);
    });
    handle.addEventListener("dragend", () => {
      $$(".quick-link").forEach(item => item.classList.remove("link-dragging","link-drop-target"));
      draggedId = null;
    });
  });
  $$(".quick-link").forEach(target => {
    target.addEventListener("dragover", event => { if (!draggedId || target.dataset.id === draggedId) return; event.preventDefault(); target.classList.add("link-drop-target"); });
    target.addEventListener("dragleave", () => target.classList.remove("link-drop-target"));
    target.addEventListener("drop", event => {
      event.preventDefault(); target.classList.remove("link-drop-target");
      const sourceIndex = state.links.findIndex(link => link.id === draggedId);
      const targetIndex = state.links.findIndex(link => link.id === target.dataset.id);
      if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) return;
      const [moved] = state.links.splice(sourceIndex,1);
      state.links.splice(targetIndex,0,moved);
      saveState(); renderLinks(); showStatus("Gyorslinkek sorrendje mentve");
    });
  });
}
function openLinkDialog(link=null) {
  $("#linkId").value=link?.id||""; $("#linkName").value=link?.name||""; $("#linkUrl").value=link?.url||"https://"; $("#linkIcon").value=link?.icon||"";
  $("#linkDialogTitle").textContent=link?"Hivatkozás szerkesztése":"Új hivatkozás"; $("#deleteLinkBtn").hidden=!link; $("#linkDialog").showModal(); setTimeout(()=>$("#linkName").focus(),50);
}
function renderWidgetToggles() {
  const labels={weather:"Időjárás",currencies:"Deviza",todos:"Teendők",links:"Gyorsindítás",focus:"Fókuszidőzítő"};
  $("#widgetToggles").innerHTML=Object.entries(labels).map(([key,label])=>`<label class="toggle-item"><span>${label}</span><input type="checkbox" data-widget-toggle="${key}" ${state.widgetVisibility[key]?"checked":""}></label>`).join("");
}
function populateSettings() { $("#cityInput").value=state.city.name; $("#currenciesInput").value=state.currencies.join(", "); renderWidgetToggles(); }
function openSettings() { populateSettings(); $("#settingsPanel").classList.add("open"); $("#settingsPanel").setAttribute("aria-hidden","false"); $("#overlay").classList.add("show"); }
function closeSettings() { $("#settingsPanel").classList.remove("open"); $("#settingsPanel").setAttribute("aria-hidden","true"); $("#overlay").classList.remove("show"); }
async function saveCity() {
  const query=$("#cityInput").value.trim(); if(!query)return; showStatus("Város keresése…");
  try { const response=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=hu&format=json`); if(!response.ok)throw new Error(); const result=(await response.json()).results?.[0]; if(!result){showStatus("Nem találtam ilyen várost");return;} state.city={name:result.name,latitude:result.latitude,longitude:result.longitude,timezone:result.timezone||"auto"}; saveState(); $("#cityInput").value=state.city.name; await loadWeather(); showStatus(`Mentve: ${state.city.name}`); } catch { showStatus("A városkeresés sikertelen"); }
}
function saveCurrencies() {
  const values=$("#currenciesInput").value.split(",").map(value=>value.trim().toUpperCase()).filter(value=>/^[A-Z]{3}$/.test(value)).slice(0,3);
  if(!values.length){showStatus("Adj meg legalább egy hárombetűs devizakódot");return;} state.currencies=[...new Set(values)]; state.currencies.forEach(code=>{if(state.currencyAmounts[code]==null)state.currencyAmounts[code]=1000;}); saveState(); loadCurrencies(); showStatus("Devizák mentve");
}
function exportSettings() { const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"}); const url=URL.createObjectURL(blob); const anchor=document.createElement("a"); anchor.href=url; anchor.download=`peter-startpage-backup-${new Date().toISOString().slice(0,10)}.json`; anchor.click(); URL.revokeObjectURL(url); }
async function importSettings(file) { try { state=mergeDefaults(JSON.parse(await file.text())); saveState(); initializeUi(); await Promise.all([loadWeather(),loadCurrencies()]); showStatus("Beállítások importálva"); } catch { showStatus("A fájl nem importálható"); } }
function resetAll() { if(!confirm("Minden helyi beállítás, teendő és link törlődik. Folytatod?"))return; state=deepClone(DEFAULT_STATE); saveState(); initializeUi(); loadWeather(); loadCurrencies(); closeSettings(); showStatus("Alaphelyzet visszaállítva"); }
function initializeCardDragAndDrop() {
  let dragged=null;
  $$(".card").forEach(card=>{
    card.addEventListener("dragstart",event=>{ if(event.target.closest(".link-drag"))return; dragged=card; card.classList.add("dragging"); event.dataTransfer.effectAllowed="move"; });
    card.addEventListener("dragend",()=>{dragged?.classList.remove("dragging");dragged=null;state.widgetOrder=$$(".card",$("#dashboard")).map(item=>item.dataset.widget);saveState();});
    card.addEventListener("dragover",event=>{event.preventDefault();if(!dragged||dragged===card)return;const rect=card.getBoundingClientRect();$("#dashboard").insertBefore(dragged,event.clientY>rect.top+rect.height/2?card.nextSibling:card);});
  });
}

let timerMode="stopwatch",stopwatchStart=0,stopwatchElapsed=0,stopwatchRunning=false,timerFrame=null,lapNumber=0;
let pomodoroRemaining=state.pomodoro.workMinutes*60000,pomodoroRunning=false,pomodoroEnd=0,pomodoroPhase="work";
function formatStopwatch(ms){const total=Math.max(0,ms),hours=Math.floor(total/3600000),minutes=Math.floor(total/60000)%60,seconds=Math.floor(total/1000)%60,centiseconds=Math.floor(total/10)%100,pad=n=>String(n).padStart(2,"0");return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}<span class="timer-ms">.${pad(centiseconds)}</span>`;}
function formatCountdown(ms){const total=Math.ceil(Math.max(0,ms)/1000),minutes=Math.floor(total/60),seconds=total%60;return `${String(minutes).padStart(2,"0")}:${String(seconds).padStart(2,"0")}`;}
function tickFocus(){if(timerMode==="stopwatch"){const current=stopwatchElapsed+(stopwatchRunning?performance.now()-stopwatchStart:0);$("#timerDisplay").innerHTML=formatStopwatch(current);if(stopwatchRunning)timerFrame=requestAnimationFrame(tickFocus);return;}const remaining=pomodoroRunning?Math.max(0,pomodoroEnd-Date.now()):pomodoroRemaining;$("#timerDisplay").textContent=formatCountdown(remaining);if(pomodoroRunning&&remaining<=0){pomodoroRunning=false;pomodoroPhase=pomodoroPhase==="work"?"break":"work";pomodoroRemaining=(pomodoroPhase==="work"?state.pomodoro.workMinutes:state.pomodoro.breakMinutes)*60000;$("#focusLabel").textContent=pomodoroPhase==="work"?"Fókuszidő":"Szünet";$("#startTimer").textContent="Start";beep();showStatus(pomodoroPhase==="work"?"Kezdődhet a fókuszidő":"Jöhet a szünet");}else if(pomodoroRunning)timerFrame=requestAnimationFrame(tickFocus);}
function beep(){try{const AudioContext=window.AudioContext||window.webkitAudioContext,context=new AudioContext(),oscillator=context.createOscillator(),gain=context.createGain();oscillator.frequency.value=660;gain.gain.value=.08;oscillator.connect(gain);gain.connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+.28);}catch{}}
function setTimerMode(mode){timerMode=mode;$$(".focus-tabs button").forEach(button=>button.classList.toggle("active",button.dataset.mode===mode));cancelAnimationFrame(timerFrame);$("#lapTimer").textContent=mode==="stopwatch"?"Kör":"Ugrás";$("#focusLabel").textContent=mode==="stopwatch"?"Stopper":(pomodoroPhase==="work"?"Fókuszidő":"Szünet");$("#startTimer").textContent=mode==="stopwatch"?(stopwatchRunning?"Szünet":"Start"):(pomodoroRunning?"Szünet":"Start");$("#lapInfo").textContent=mode==="pomodoro"?`${state.pomodoro.workMinutes} perc fókusz / ${state.pomodoro.breakMinutes} perc szünet`:"";tickFocus();}
function registerServiceWorker(){if("serviceWorker" in navigator&&location.protocol!=="file:")navigator.serviceWorker.register("sw.js").catch(()=>{});}
function initializeUi(){applyAppearance();applyWidgetLayout();renderTodos();renderLinks();populateSettings();renderCurrencyCards();setTimerMode(timerMode);}

$("#searchForm").addEventListener("submit",event=>{event.preventDefault();const query=$("#searchInput").value.trim();if(!query)return;const engine=SEARCH_ENGINES[state.searchEngine]||SEARCH_ENGINES.google;location.href=engine(query);});
$("#searchEngine").addEventListener("change",event=>{state.searchEngine=event.target.value;saveState();});
document.addEventListener("keydown",event=>{const activeTag=document.activeElement?.tagName;const typing=["INPUT","TEXTAREA","SELECT"].includes(activeTag);if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==="k"){event.preventDefault();$("#searchInput").focus();$("#searchInput").select();}else if(event.key==="/"&&!typing){event.preventDefault();$("#searchInput").focus();}});
$("#todoForm").addEventListener("submit",event=>{event.preventDefault();const input=$("#todoInput"),text=input.value.trim();if(!text)return;state.todos.unshift({id:crypto.randomUUID(),text,done:false});input.value="";saveState();renderTodos();});
$("#todoList").addEventListener("click",event=>{const row=event.target.closest(".todo");if(!row)return;const id=row.dataset.id;if(event.target.matches("input"))state.todos=state.todos.map(todo=>todo.id===id?{...todo,done:event.target.checked}:todo);else if(event.target.matches(".delete-todo"))state.todos=state.todos.filter(todo=>todo.id!==id);else return;saveState();renderTodos();});
$("#clearDoneBtn").addEventListener("click",()=>{state.todos=state.todos.filter(todo=>!todo.done);saveState();renderTodos();});
$("#addLinkBtn").addEventListener("click",()=>openLinkDialog());
$("#quickGrid").addEventListener("click",event=>{const menu=event.target.closest(".link-menu");if(!menu)return;event.preventDefault();const id=menu.closest(".quick-link").dataset.id;openLinkDialog(state.links.find(link=>link.id===id));});
$("#linkForm").addEventListener("submit",event=>{event.preventDefault();const id=$("#linkId").value,item={id:id||crypto.randomUUID(),name:$("#linkName").value.trim(),url:normalizeUrl($("#linkUrl").value),icon:$("#linkIcon").value.trim()};state.links=id?state.links.map(link=>link.id===id?item:link):[...state.links,item];saveState();renderLinks();$("#linkDialog").close();showStatus("Hivatkozás mentve");});
$("#deleteLinkBtn").addEventListener("click",()=>{const id=$("#linkId").value;state.links=state.links.filter(link=>link.id!==id);saveState();renderLinks();$("#linkDialog").close();showStatus("Hivatkozás törölve");});
$("#currencyGrid").addEventListener("input",event=>{const input=event.target.closest(".currency-amount");if(!input)return;state.currencyAmounts[input.dataset.code]=Number(input.value||0);saveState();updateCurrencyCalculation(input.dataset.code);});
$("#settingsBtn").addEventListener("click",openSettings);$("#closeSettingsBtn").addEventListener("click",closeSettings);$("#overlay").addEventListener("click",closeSettings);
$("#themeSelect").addEventListener("change",event=>{state.theme=event.target.value;saveState();applyAppearance();loadCurrencies();});
$("#backgroundSelect").addEventListener("change",event=>setBackground(event.target.value));
$("#backgroundDimRange").addEventListener("input",event=>{state.backgroundDim=Number(event.target.value);saveState();applyAppearance();});
$("#autoBackgroundToggle").addEventListener("change",event=>{state.autoRotateBackground=event.target.checked;saveState();configureBackgroundRotation();});
$("#randomBackgroundToggle").addEventListener("change",event=>{state.randomBackground=event.target.checked;saveState();});
$("#motionToggle").addEventListener("change",event=>{state.backgroundMotion=event.target.checked;saveState();applyAppearance();});
$("#bgNextBtn").addEventListener("click",nextBackground);
$("#glassRange").addEventListener("input",event=>{state.glass=Number(event.target.value);saveState();applyAppearance();});
$("#quoteInput").addEventListener("change",event=>{state.quote=event.target.value.trim()||DEFAULT_STATE.quote;saveState();applyAppearance();});
$("#saveCityBtn").addEventListener("click",saveCity);$("#saveCurrenciesBtn").addEventListener("click",saveCurrencies);
$("#widgetToggles").addEventListener("change",event=>{const key=event.target.dataset.widgetToggle;if(!key)return;state.widgetVisibility[key]=event.target.checked;saveState();applyWidgetLayout();});
$("#exportBtn").addEventListener("click",exportSettings);$("#importBtn").addEventListener("click",()=>$("#importFile").click());$("#importFile").addEventListener("change",event=>{const file=event.target.files?.[0];if(file)importSettings(file);event.target.value="";});$("#resetAllBtn").addEventListener("click",resetAll);
$("#rangeSelector").addEventListener("click",event=>{const button=event.target.closest("button[data-range]");if(!button)return;state.currencyRange=Number(button.dataset.range);saveState();loadCurrencies();});
$("#refreshBtn").addEventListener("click",async()=>{showStatus("Adatok frissítése…");await Promise.all([loadWeather(),loadCurrencies()]);showStatus("Frissítve");});
$("#fullscreenBtn").addEventListener("click",()=>{if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.();});
$$(".focus-tabs button").forEach(button=>button.addEventListener("click",()=>setTimerMode(button.dataset.mode)));
$("#startTimer").addEventListener("click",()=>{cancelAnimationFrame(timerFrame);if(timerMode==="stopwatch"){if(stopwatchRunning){stopwatchElapsed+=performance.now()-stopwatchStart;stopwatchRunning=false;$("#startTimer").textContent="Start";}else{stopwatchStart=performance.now();stopwatchRunning=true;$("#startTimer").textContent="Szünet";}}else{if(pomodoroRunning){pomodoroRemaining=Math.max(0,pomodoroEnd-Date.now());pomodoroRunning=false;$("#startTimer").textContent="Start";}else{pomodoroEnd=Date.now()+pomodoroRemaining;pomodoroRunning=true;$("#startTimer").textContent="Szünet";}}tickFocus();});
$("#resetTimer").addEventListener("click",()=>{cancelAnimationFrame(timerFrame);if(timerMode==="stopwatch"){stopwatchRunning=false;stopwatchElapsed=0;lapNumber=0;$("#lapInfo").textContent="";}else{pomodoroRunning=false;pomodoroPhase="work";pomodoroRemaining=state.pomodoro.workMinutes*60000;$("#focusLabel").textContent="Fókuszidő";$("#lapInfo").textContent=`${state.pomodoro.workMinutes} perc fókusz / ${state.pomodoro.breakMinutes} perc szünet`;}$("#startTimer").textContent="Start";tickFocus();});
$("#lapTimer").addEventListener("click",()=>{if(timerMode==="stopwatch"){const current=stopwatchElapsed+(stopwatchRunning?performance.now()-stopwatchStart:0);if(current<=0)return;lapNumber+=1;$("#lapInfo").textContent=`${lapNumber}. kör: ${$("#timerDisplay").textContent}`;}else{pomodoroRunning=false;pomodoroPhase=pomodoroPhase==="work"?"break":"work";pomodoroRemaining=(pomodoroPhase==="work"?state.pomodoro.workMinutes:state.pomodoro.breakMinutes)*60000;$("#focusLabel").textContent=pomodoroPhase==="work"?"Fókuszidő":"Szünet";$("#startTimer").textContent="Start";tickFocus();}});
window.addEventListener("resize",()=>{clearTimeout(window.__chartResizeTimer);window.__chartResizeTimer=setTimeout(()=>{state.currencies.forEach(code=>{if(latestChartData[code])drawChart($(`#${code}Chart`),latestChartData[code],$("#"+code+"Change")?.classList.contains("down"));});},180);});
if(state.randomBackground){const alternatives=BACKGROUNDS.filter(name=>name!==state.background);state.background=alternatives[Math.floor(Math.random()*alternatives.length)]||state.background;saveState();}
initializeUi();initializeCardDragAndDrop();updateClock();setInterval(updateClock,1000);loadWeather();loadCurrencies();setInterval(loadWeather,20*60*1000);setInterval(loadCurrencies,60*60*1000);registerServiceWorker();
