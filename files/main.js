/* Miggo — página informativa de carta y precios (vanilla JS). Todo sale de menu.json */
const $ = (s) => document.querySelector(s);
const money = (n) => "$" + n.toLocaleString("es-CO");            // 7000 -> $7.000
let data, state = { cat: "all", q: "" };

/* Requiere servidor local: python3 -m http.server */
fetch("menu.json").then(r => r.json()).then(d => { data = d; init(); })
  .catch(() => { $("#cards").innerHTML = "<p>No se pudo cargar menu.json. Abre el sitio con un servidor local.</p>"; ready(); });

function init() {
  renderMarquee(); renderCarousel(); renderChips(); renderCards(); bind(); ready();
}

/* Splash + entrada del hero */
function ready() { setTimeout(() => { $("#splash").classList.add("out"); document.body.classList.add("ready"); }, 500); }

/* Header cambia de color al salir del hero + parallax suave */
const header = $("#header"), heroBg = $("[data-parallax]");
addEventListener("scroll", () => {
  const y = scrollY, past = y > innerHeight * 0.7;
  header.classList.toggle("solid", past); header.classList.toggle("over-hero", !past);
  if (y < innerHeight) heroBg.style.transform = `translateY(${y * 0.25}px)`;
}, { passive: true });

/* Marquee: contenido repetido (par) para que el -50% cierre el bucle */
function renderMarquee() {
  $("#track").innerHTML = data.categorias.map(c => `<div class="arch">${c.emoji}</div>`).join("").repeat(6);
}

/* Carrusel de onces: solo informativo (nombre, descripción, precio) */
function renderCarousel() {
  const onces = data.categorias.find(c => c.id === "onces");
  $("#carousel").innerHTML = onces.items.map(i => `
    <article class="arch-card"><div class="ph">${onces.emoji}</div>
    <div class="info"><h4>${i.nombre}</h4><p>${i.desc || ""}</p><span class="price">${money(i.precio)}</span></div></article>`).join("");
  $("#prev").onclick = () => $("#carousel").scrollBy({ left: -260, behavior: "smooth" });
  $("#next").onclick = () => $("#carousel").scrollBy({ left: 260, behavior: "smooth" });
}

/* Chips de categorías (scroll horizontal en móvil) */
function renderChips() {
  const all = [{ id: "all", nombre: "Todo" }, ...data.categorias];
  $("#cats").innerHTML = all.map(c => `<button data-cat="${c.id}" aria-pressed="${c.id === state.cat}" class="${c.id === state.cat ? "on" : ""}">${c.nombre}</button>`).join("");
}

/* Tarjetas por categoría; alternan durazno/crema. La búsqueda filtra filas y oculta tarjetas vacías */
function renderCards() {
  const q = state.q.trim().toLowerCase();
  const html = data.categorias.filter(c => state.cat === "all" || c.id === state.cat).map((c, n) => {
    const rows = c.items.filter(i => (i.nombre + " " + (i.desc || "")).toLowerCase().includes(q));
    if (!rows.length) return "";
    return `<section class="mcard ${n % 2 ? "cream" : "peach"}">
      <h3>${c.nombre}</h3><hr>
      <ul>${rows.map(i => `<li><div><span class="n">${i.nombre}${i.destacado ? ' <em>destacado</em>' : ""}</span>${i.desc ? `<small>${i.desc}</small>` : ""}</div><b>${money(i.precio)}</b></li>`).join("")}</ul>
    </section>`;
  }).join("");
  $("#cards").innerHTML = html; $("#empty").hidden = !!html;
}

function bind() {
  $("#cats").onclick = e => { const b = e.target.closest("button"); if (!b) return; state.cat = b.dataset.cat; renderChips(); renderCards(); };
  $("#q").oninput = e => { state.q = e.target.value; renderCards(); };
}
