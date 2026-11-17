// Configurazione pubblica (la chiave "publishable" e' fatta per stare nel browser).
// NON inserire mai qui la chiave "secret" / "service_role".
const CONFIG = {
  URL: 'https://nxeyvyzertieklnglppr.supabase.co',
  KEY: 'sb_publishable_yyHrs_BL2q451VlyS4v7_Q_ZgE-uI_J'
};

// Aspetto del sito: per un altro ente basta cambiare queste righe.
const BRAND = {
  nome: 'Presenze',            // nome del servizio, in alto a sinistra
  ente: 'Progetto pilota',     // es. 'Scuola di Management ed Economia' (solo dopo autorizzazione)
  logo: '',                    // es. 'logo.png' (file da caricare nel repository, solo se autorizzato)
  colore: ''                   // facoltativo, es. '#0E5A45'
};
