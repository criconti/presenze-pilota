// Funzioni condivise dalle tre pagine
const sb = supabase.createClient(CONFIG.URL, CONFIG.KEY);
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = d => new Date(d).toLocaleString('it-IT', {day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});

// Intestazione con logo o segno + nome servizio + ente
function brand() {
  const h = $('#brand');
  if (!h) return;
  if (BRAND.colore) document.documentElement.style.setProperty('--verde', BRAND.colore);
  h.innerHTML = `<div class="brand-in">${BRAND.logo
      ? `<img class="brand-logo" src="${esc(BRAND.logo)}" alt="${esc(BRAND.ente || BRAND.nome)}">`
      : '<span class="brand-segno" aria-hidden="true"></span>'}
    <span class="brand-testo"><b>${esc(BRAND.nome)}</b>${BRAND.ente ? `<small>${esc(BRAND.ente)}</small>` : ''}</span></div>`;
}
document.addEventListener('DOMContentLoaded', brand);

// Legge TUTTE le righe (Supabase ne restituisce al massimo 1000 per richiesta)
async function all(mk) {
  let out = [], from = 0;
  for (;;) {
    const { data, error } = await mk().range(from, from + 999);
    if (error) throw error;
    out = out.concat(data);
    if (data.length < 1000) break;
    from += 1000;
  }
  return out;
}

// Accesso con link via email; quando c'e' una sessione chiama onReady(session)
function avvia(el, onReady, nota = '') {
  let fatto = false;
  const go = s => { if (!fatto) { fatto = true; onReady(s); } };
  sb.auth.onAuthStateChange((ev, s) => { if (s && (ev === 'SIGNED_IN' || ev === 'INITIAL_SESSION')) go(s); });
  sb.auth.getSession().then(({ data }) => { if (data.session) go(data.session); else mostraLogin(el, nota); });
}

function mostraLogin(el, nota) {
  el.innerHTML = `<div class="accesso"><h1>Entra con la tua email</h1>
    <p class="muted">${esc(nota || 'Ti mandiamo un link: aprilo e sei dentro, senza password.')}</p>
    <form id="lf" class="card"><div class="riga">
      <input type="email" id="le" placeholder="nome@email.it" autocomplete="email" required style="flex:1;min-width:220px">
      <button>Invia il link</button></div><div id="lm"></div></form></div>`;
  $('#lf').onsubmit = async e => {
    e.preventDefault();
    const email = $('#le').value.trim();
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } });
    $('#lm').innerHTML = error
      ? `<div class="err"><b>Non riusciamo a inviare il link.</b> Riprova tra qualche minuto. <small>(${esc(error.message)})</small></div>`
      : `<div class="ok"><b>Link inviato.</b> Controlla la posta di ${esc(email)} e aprilo da questo dispositivo. Se non lo trovi, guarda nello spam.</div>`;
  };
}

function esci() { sb.auth.signOut().then(() => { location.href = location.pathname; }); }
