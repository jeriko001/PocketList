import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, get } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCOeii2jYWPhUTACPEFsqQClXc-iQBQSLo",
  authDomain: "cineforesta-34e77.firebaseapp.com",
  databaseURL: "https://cineforesta-34e77-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cineforesta-34e77",
  storageBucket: "cineforesta-34e77.firebasestorage.app",
  messagingSenderId: "555430963680",
  appId: "1:555430963680:web:6d40794808625c64de2385"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

const TMDB_KEY = "86c3283ad5a8c5b4f86ec7015813ccdc";
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG = "https://image.tmdb.org/t/p/w342";

const STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Lato:wght@300;400;700&display=swap');
  :root {
    --beige:#F5EFE0;--beige-dark:#E8DCC8;--beige-mid:#EFE6D0;
    --forest:#2D5016;--forest-mid:#3D6B1F;--forest-light:#5A8A35;
    --forest-faint:rgba(74,122,42,0.09);--brown:#7A5C3A;
    --text-dark:#1E2F10;--text-light:#6B7A55;
    --shadow:0 4px 24px rgba(45,80,22,0.13);--shadow-hover:0 12px 36px rgba(45,80,22,0.22);
  }
  html,body{margin:0;padding:0;overflow-x:hidden;max-width:100vw;}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--beige);font-family:'Lato',sans-serif;color:var(--text-dark);min-height:100vh;overflow-x:hidden;}
  .app{min-height:100vh;width:100%;max-width:100vw;overflow-x:hidden;background:var(--beige);
    background-image:radial-gradient(ellipse at 10% 0%,rgba(90,138,53,0.08) 0%,transparent 60%),radial-gradient(ellipse at 90% 100%,rgba(45,80,22,0.07) 0%,transparent 60%);}

  .landing{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;padding:40px 20px;width:100%;}
  .landing-logo{font-size:2.8rem;}
  .landing-title{font-family:'Playfair Display',serif;font-size:2.3rem;color:var(--forest);text-align:center;line-height:1.1;}
  .landing-title span{font-style:italic;color:var(--forest-light);display:block;font-size:.95rem;margin-top:5px;letter-spacing:.08em;font-weight:400;}
  .landing-sub{color:var(--text-light);font-size:.93rem;text-align:center;max-width:310px;line-height:1.65;}
  .landing-box{background:white;border-radius:20px;box-shadow:var(--shadow);padding:26px 28px;display:flex;flex-direction:column;gap:13px;width:100%;max-width:350px;}
  .landing-box-title{font-family:'Playfair Display',serif;font-size:1rem;color:var(--forest);}
  .create-btn{background:var(--forest);color:var(--beige);border:none;border-radius:32px;padding:13px 28px;font-family:'Lato',sans-serif;font-size:.9rem;font-weight:700;letter-spacing:.06em;cursor:pointer;transition:background .2s,transform .15s;width:100%;}
  .create-btn:hover{background:var(--forest-mid);transform:translateY(-1px);}
  .create-btn:disabled{opacity:.6;cursor:not-allowed;transform:none;}
  .divider{display:flex;align-items:center;gap:10px;color:var(--text-light);font-size:.76rem;}
  .divider::before,.divider::after{content:'';flex:1;height:1px;background:var(--beige-dark);}
  .join-row{display:flex;gap:8px;}
  .join-input{flex:1;background:var(--beige);border:2px solid var(--beige-dark);border-radius:32px;padding:10px 15px;font-family:'Lato',sans-serif;font-size:.86rem;color:var(--text-dark);outline:none;transition:border-color .2s;text-transform:uppercase;letter-spacing:.12em;min-width:0;}
  .join-input:focus{border-color:var(--forest-light);}
  .join-btn{background:var(--beige-dark);color:var(--forest);border:none;border-radius:32px;padding:10px 15px;font-family:'Lato',sans-serif;font-size:.82rem;font-weight:700;cursor:pointer;transition:background .2s;white-space:nowrap;flex-shrink:0;}
  .join-btn:hover{background:#ddd4be;}
  .error-msg{color:#b03020;font-size:.78rem;}

  header{background:var(--forest);padding:17px 18px 13px;display:flex;align-items:center;gap:10px;position:sticky;top:0;z-index:100;box-shadow:0 2px 18px rgba(45,80,22,.18);width:100%;}
  .header-leaf{font-size:1.3rem;flex-shrink:0;}
  .header-title{font-family:'Playfair Display',serif;font-size:1.45rem;color:var(--beige);letter-spacing:.03em;line-height:1;min-width:0;}
  .header-title span{color:var(--beige-dark);font-style:italic;font-size:.76rem;display:block;font-weight:400;margin-top:2px;letter-spacing:.07em;}
  .share-pill{margin-left:auto;display:flex;align-items:center;gap:6px;background:rgba(245,239,224,.12);border:1.5px solid rgba(245,239,224,.25);border-radius:32px;padding:6px 11px;cursor:pointer;transition:background .2s;flex-shrink:0;}
  .share-pill:hover{background:rgba(245,239,224,.2);}
  .share-pill-label{color:var(--beige);font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;}
  .share-code{color:var(--beige-dark);font-size:.83rem;font-family:monospace;letter-spacing:.16em;font-weight:700;}

  .sync-info{display:flex;align-items:center;gap:6px;font-size:.72rem;color:var(--text-light);padding:7px 16px 0;flex-wrap:wrap;}
  .sync-dot{width:6px;height:6px;border-radius:50%;background:var(--forest-light);animation:pulse 2.5s infinite;flex-shrink:0;}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}

  .search-wrap{padding:18px 16px 0;max-width:500px;}
  .search-row{display:flex;gap:8px;}
  .search-input{flex:1;background:white;border:2px solid var(--beige-dark);border-radius:32px;padding:11px 17px;font-family:'Lato',sans-serif;font-size:.9rem;color:var(--text-dark);outline:none;transition:border-color .2s,box-shadow .2s;min-width:0;}
  .search-input:focus{border-color:var(--forest-light);box-shadow:0 0 0 3px rgba(90,138,53,.12);}
  .search-btn{background:var(--forest);color:var(--beige);border:none;border-radius:32px;padding:11px 18px;font-family:'Lato',sans-serif;font-size:.83rem;font-weight:700;letter-spacing:.06em;cursor:pointer;transition:background .2s,transform .15s;flex-shrink:0;}
  .search-btn:hover{background:var(--forest-mid);transform:translateY(-1px);}
  .search-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
  .search-results{background:white;border:1.5px solid var(--beige-dark);border-radius:16px;margin-top:8px;overflow:hidden;box-shadow:var(--shadow);animation:fadeIn .2s ease;}
  .result-item{display:flex;align-items:center;gap:11px;padding:10px 13px;cursor:pointer;border-bottom:1px solid var(--beige-dark);transition:background .15s;}
  .result-item:last-child{border-bottom:none;}
  .result-item:hover{background:var(--beige-mid);}
  .result-poster-img{width:34px;height:51px;object-fit:cover;border-radius:4px;flex-shrink:0;}
  .result-poster-ph{width:34px;height:51px;background:var(--beige-dark);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
  .result-title{font-family:'Playfair Display',serif;font-size:.88rem;color:var(--text-dark);font-weight:600;}
  .result-year{font-size:.72rem;color:var(--text-light);margin-top:2px;}
  .no-results{padding:11px 13px;color:var(--text-light);font-style:italic;font-size:.84rem;}

  .section-label{font-family:'Playfair Display',serif;font-size:1.18rem;color:var(--forest);padding:22px 16px 11px;display:flex;align-items:center;gap:9px;font-weight:600;}
  .section-label::after{content:'';flex:1;height:1.5px;background:linear-gradient(90deg,var(--forest-faint),transparent);margin-left:6px;}
  .count-badge{background:var(--forest-faint);color:var(--forest-mid);border:1px solid rgba(45,80,22,.15);font-family:'Lato',sans-serif;font-size:.69rem;font-weight:700;padding:2px 8px;border-radius:12px;letter-spacing:.05em;flex-shrink:0;}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:15px;padding:0 16px 10px;}
  .card{position:relative;border-radius:12px;overflow:hidden;background:white;box-shadow:var(--shadow);transition:transform .22s,box-shadow .22s;animation:cardIn .35s ease both;}
  .card:hover{transform:translateY(-5px) scale(1.02);box-shadow:var(--shadow-hover);}
  .card.watched{opacity:.62;filter:saturate(.45);}
  .card-poster{width:100%;aspect-ratio:2/3;object-fit:cover;display:block;background:var(--beige-dark);}
  .poster-ph{width:100%;aspect-ratio:2/3;background:linear-gradient(135deg,var(--beige-dark),var(--beige-mid));display:flex;align-items:center;justify-content:center;font-size:2.2rem;}
  .card-check{position:absolute;top:8px;left:8px;width:24px;height:24px;border-radius:6px;background:rgba(245,239,224,.93);border:2px solid var(--forest);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background .18s,transform .15s;z-index:2;}
  .card-check:hover{transform:scale(1.12);}
  .card-check.on{background:var(--forest);}
  .checkmark{color:var(--beige);font-size:12px;font-weight:900;}
  .card-del{position:absolute;top:8px;right:8px;width:21px;height:21px;border-radius:50%;background:rgba(245,239,224,.88);border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:11px;color:var(--brown);opacity:0;transition:opacity .18s;z-index:2;}
  .card:hover .card-del{opacity:1;}
  .card-info{padding:8px 10px 10px;background:white;}
  .card-title{font-family:'Playfair Display',serif;font-size:.82rem;color:var(--text-dark);font-weight:600;line-height:1.3;}
  .card-year{font-family:'Lato',sans-serif;font-size:.69rem;color:var(--text-light);margin-top:2px;}
  .empty{padding:12px 16px;font-family:'Playfair Display',serif;font-style:italic;color:var(--text-light);font-size:.9rem;}
  .watched-section{margin-top:4px;padding-bottom:50px;}
  .watched-section .section-label{color:var(--text-light);}

  .toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:var(--forest);color:var(--beige);border-radius:32px;padding:10px 22px;font-size:.83rem;font-weight:700;letter-spacing:.04em;box-shadow:0 4px 18px rgba(45,80,22,.25);animation:toastIn .25s ease,toastOut .25s ease 1.85s both;z-index:999;white-space:nowrap;max-width:92vw;text-align:center;}
  @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
  @keyframes toastOut{to{opacity:0;transform:translateX(-50%) translateY(8px)}}
  @keyframes fadeIn{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
  @keyframes cardIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  .loading-dots{display:inline-flex;gap:4px;align-items:center}
  .loading-dots span{width:5px;height:5px;border-radius:50%;background:var(--beige);animation:dot 1.2s infinite}
  .loading-dots span:nth-child(2){animation-delay:.2s}.loading-dots span:nth-child(3){animation-delay:.4s}
  @keyframes dot{0%,80%,100%{opacity:.25;transform:scale(.8)}40%{opacity:1;transform:scale(1)}}
`;

function lsGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

function genCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({length:6}, ()=>chars[Math.floor(Math.random()*chars.length)]).join("");
}

async function saveList(code, films) {
  await set(ref(db, "lists/" + code), films);
}

async function loadList(code) {
  const snap = await get(ref(db, "lists/" + code));
  if (snap.exists()) return snap.val();
  return null;
}

async function searchFilms(query) {
  try {
    const url = `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=it-IT&page=1`;
    const res = await fetch(url);
    const data = await res.json();
    return (data.results||[]).slice(0,6).map(m=>({
      id: m.id,
      title: m.title,
      original_title: m.original_title,
      year: m.release_date ? m.release_date.slice(0,4) : "—",
      poster: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null,
    }));
  } catch { return []; }
}

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [roomCode, setRoomCode] = useState("");
  const [joinVal, setJoinVal] = useState("");
  const [joinErr, setJoinErr] = useState("");
  const [creating, setCreating] = useState(false);
  const [films, setFilms] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [toast, setToast] = useState(null);
  const [toastKey, setToastKey] = useState(0);
  const searchRef = useRef(null);
  const toastTimer = useRef(null);
  const unsubRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg); setToastKey(k=>k+1);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToast(null), 2400);
  };

  // Ripristina ultima stanza
  useEffect(()=>{
    const last = lsGet("cf_last");
    if (last) enterRoom(last, false, true);
  }, []);

  useEffect(()=>{
    const h = e => { if(searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false); };
    document.addEventListener("mousedown", h);
    return ()=>document.removeEventListener("mousedown", h);
  },[]);

  const startListening = (code) => {
    if (unsubRef.current) unsubRef.current();
    const listRef = ref(db, "lists/" + code);
    unsubRef.current = onValue(listRef, (snap) => {
      if (snap.exists()) setFilms(snap.val());
      else setFilms([]);
    });
  };

  const enterRoom = async (code, isNew, silent=false) => {
    if (isNew) {
      await saveList(code, []);
    } else {
      const existing = await loadList(code);
      if (existing === null) {
        if (!silent) setJoinErr("Codice non trovato.");
        return false;
      }
    }
    setRoomCode(code);
    lsSet("cf_last", code);
    startListening(code);
    setScreen("app");
    return true;
  };

  const handleCreate = async () => {
    setCreating(true);
    const code = genCode();
    await enterRoom(code, true);
    showToast("Lista creata! 🌿");
    setCreating(false);
  };

  const handleJoin = async () => {
    const c = joinVal.trim().toUpperCase();
    if (c.length < 4) { setJoinErr("Codice non valido."); return; }
    setJoinErr("");
    const ok = await enterRoom(c, false);
    if (ok) showToast("Entrato! 🌿");
  };

  const updateFilms = async (next) => {
    setFilms(next);
    await saveList(roomCode, next);
  };

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true); setShowResults(true); setResults([]);
    const r = await searchFilms(query.trim());
    setResults(r); setSearching(false);
  };

  const addFilm = async (film) => {
    if (films.find(f=>f.id===film.id)) { showToast("Già in lista!"); return; }
    await updateFilms([{...film, watched:false, addedAt:Date.now()}, ...films]);
    setQuery(""); setResults([]); setShowResults(false);
    showToast(`"${film.title}" aggiunto ✓`);
  };

  const toggleWatched = (id) => updateFilms(films.map(f=>f.id===id?{...f,watched:!f.watched}:f));
  const removeFilm = (id) => updateFilms(films.filter(f=>f.id!==id));
  const copyCode = () => { navigator.clipboard?.writeText(roomCode).catch(()=>{}); showToast(`Codice copiato: ${roomCode} 📋`); };

  const toWatch = films.filter(f=>!f.watched);
  const watched = films.filter(f=>f.watched);

  if (screen === "landing") return (
    <>
      <style>{STYLE}</style>
      <div className="app">
        <div className="landing">
          <div className="landing-logo">🌿</div>
          <div className="landing-title">CineForesta<span>watchlist condivisa</span></div>
          <p className="landing-sub">Crea una lista, condividi il codice con un amico, e decidete cosa vedere stasera.</p>
          <div className="landing-box">
            <div className="landing-box-title">Inizia</div>
            <button className="create-btn" onClick={handleCreate} disabled={creating}>
              {creating ? <span className="loading-dots"><span/><span/><span/></span> : "🎬 Crea nuova lista"}
            </button>
            <div className="divider">oppure entra con un codice</div>
            <div className="join-row">
              <input className="join-input" placeholder="CODICE" value={joinVal}
                onChange={e=>{setJoinVal(e.target.value);setJoinErr("");}}
                onKeyDown={e=>e.key==="Enter"&&handleJoin()} maxLength={8}/>
              <button className="join-btn" onClick={handleJoin}>Entra →</button>
            </div>
            {joinErr && <div className="error-msg">⚠ {joinErr}</div>}
          </div>
        </div>
      </div>
      {toast && <div key={toastKey} className="toast">{toast}</div>}
    </>
  );

  return (
    <>
      <style>{STYLE}</style>
      <div className="app">
        <header>
          <span className="header-leaf">🌿</span>
          <div className="header-title">CineForesta<span>watchlist condivisa</span></div>
          <div className="share-pill" onClick={copyCode}>
            <span className="share-pill-label">Codice</span>
            <span className="share-code">{roomCode}</span>
            <span style={{color:"var(--beige-dark)"}}>📋</span>
          </div>
        </header>

        <div className="sync-info">
          <span className="sync-dot"/>
          Sincronizzata in tempo reale · codice:&nbsp;<strong style={{color:"var(--forest)"}}>{roomCode}</strong>
        </div>

        <div ref={searchRef}>
          <div className="search-wrap">
            <div className="search-row">
              <input className="search-input" placeholder="Cerca un film…"
                value={query} onChange={e=>setQuery(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&handleSearch()}
                onFocus={()=>results.length&&setShowResults(true)}/>
              <button className="search-btn" onClick={handleSearch} disabled={searching}>
                {searching?<span className="loading-dots"><span/><span/><span/></span>:"Cerca"}
              </button>
            </div>
            {showResults && (
              <div className="search-results">
                {searching && <div className="no-results">Ricerca in corso…</div>}
                {!searching && results.length===0 && <div className="no-results">Nessun risultato trovato.</div>}
                {!searching && results.map(film=>(
                  <div key={film.id} className="result-item" onClick={()=>addFilm(film)}>
                    {film.poster
                      ? <img src={film.poster} alt={film.title} className="result-poster-img"/>
                      : <div className="result-poster-ph">🎬</div>}
                    <div>
                      <div className="result-title">{film.title}</div>
                      <div className="result-year">{film.original_title&&film.original_title!==film.title?`${film.original_title} · `:""}{film.year}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="section-label">
          🎬 Da vedere {toWatch.length>0&&<span className="count-badge">{toWatch.length}</span>}
        </div>
        {toWatch.length===0
          ?<div className="empty">Cerca un film per aggiungerlo alla lista…</div>
          :<div className="grid">{toWatch.map((f,i)=><Card key={f.id} film={f} index={i} onToggle={toggleWatched} onRemove={removeFilm}/>)}</div>}

        {watched.length>0&&(
          <div className="watched-section">
            <div className="section-label">Film visti 🙃 <span className="count-badge">{watched.length}</span></div>
            <div className="grid">{watched.map((f,i)=><Card key={f.id} film={f} index={i} onToggle={toggleWatched} onRemove={removeFilm}/>)}</div>
          </div>
        )}
      </div>
      {toast&&<div key={toastKey} className="toast">{toast}</div>}
    </>
  );
}

function Card({film, index, onToggle, onRemove}) {
  const [imgErr, setImgErr] = useState(false);
  return (
    <div className={`card${film.watched?" watched":""}`} style={{animationDelay:`${index*0.05}s`}}>
      <div className={`card-check${film.watched?" on":""}`} onClick={()=>onToggle(film.id)}>
        {film.watched&&<span className="checkmark">✓</span>}
      </div>
      <button className="card-del" onClick={()=>onRemove(film.id)}>✕</button>
      {film.poster&&!imgErr
        ?<img src={film.poster} alt={film.title} className="card-poster" onError={()=>setImgErr(true)}/>
        :<div className="poster-ph">🎬</div>}
      <div className="card-info">
        <div className="card-title">{film.title}</div>
        <div className="card-year">{film.year}</div>
      </div>
    </div>
  );
}
