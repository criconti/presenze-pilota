// Funzioni condivise dalle tre pagine
const sb = supabase.createClient(CONFIG.URL, CONFIG.KEY);
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = d => new Date(d).toLocaleString('it-IT', {day:'2-digit',month:'2-digit',year:'2-digit',hour:'2-digit',minute:'2-digit'});

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
  el.innerHTML = `<h1>Accedi</h1>${nota ? `<p class="muted">${esc(nota)}</p>` : ''}
    <form id="lf" class="card"><p>Scrivi la tua email: ti mandiamo un link per entrare, senza password.</p>
    <div class="riga"><input type="email" id="le" placeholder="nome@email.it" required style="flex:1;min-width:220px"><button>Invia link</button></div>
    <div id="lm"></div></form>`;
  $('#lf').onsubmit = async e => {
    e.preventDefault();
    const email = $('#le').value.trim();
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } });
    $('#lm').innerHTML = error
      ? `<div class="err">${esc(error.message)}</div>`
      : `<div class="ok">Link inviato a <b>${esc(email)}</b>. Aprilo da questo telefono/computer (controlla anche lo spam).</div>`;
  };
}

function esci() { sb.auth.signOut().then(() => { location.href = location.pathname; }); }
