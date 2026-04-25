import { useState, useEffect, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue, get } from "firebase/database";
import { getAuth, signInAnonymously } from "firebase/auth";

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
const auth = getAuth(firebaseApp);

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

  .landing{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:40px 20px;width:100%;}
  .landing-logo{font-size:2.8rem;}
  .landing-title{font-family:'Playfair Display',serif;font-size:2.3rem;color:var(--forest);text-align:center;line-height:1.1;}
  .landing-title span{font-style:italic;color:var(--forest-light);display:block;font-size:.95rem;margin-top:5px;letter-spacing:.08em;font-weight:400;}
  .landing-sub{color:var(--text-light);font-size:.93rem;text-align:center;max-width:310px;line-height:1.65;}
  .landing-box{background:white;border-radius:20px;box-shadow:var(--shadow);padding:24px 26px;display:flex;flex-direction:column;gap:12px;width:100%;max-width:350px;}
  .landing-box-title{font-family:'Playfair Display',serif;font-size:1rem;color:var(--forest);}
  .name-input{background:var(--beige);border:2px solid var(--beige-dark);border-radius:32px;padding:10px 15px;font-family:'Lato',sans-serif;font-size:.86rem;color:var(--text-dark);outline:none;transition:border-color .2s;width:100%;}
  .name-input:focus{border-color:var(--forest-light);}
  .create-btn{background:var(--forest);color:var(--beige);border:none;border-radius:32px;padding:12px 28px;font-family:'Lato',sans-serif;font-size:.9rem;font-weight:700;letter-spacing:.06em;cursor:pointer;transition:background .2s,transform .15s;width:100%;}
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
  .recent-section{width:100%;max-width:350px;}
  .recent-title{font-family:'Playfair Display',serif;font-size:.9rem;color:var(--text-light);margin-bottom:8px;padding-left:4px;}
  .recent-list{display:flex;flex-direction:column;gap:8px;}
  .recent-item{background:white;border-radius:14px;padding:11px 16px;display:flex;align-items:center;gap:12px;cursor:pointer;box-shadow:var(--shadow);transition:transform .15s,box-shadow .15s;}
  .recent-item:hover{transform:translateY(-2px);box-shadow:var(--shadow-hover);}
  .recent-icon{font-size:1.3rem;flex-shrink:0;}
  .recent-name{font-family:'Playfair Display',serif;font-size:.9rem;color:var(--text-dark);font-weight:600;}
  .recent-code{font-size:.72rem;color:var(--text-light);font-family:monospace;letter-spacing:.1em;margin-top:2px;}
  .recent-del{margin-left:auto;background:none;border:none;color:var(--text-light);cursor:pointer;font-size:1rem;padding:4px;flex-shrink:0;}

  header{background:var(--forest);padding:17px 18px 13px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;box-shadow:0 2px 18px rgba(45,80,22,.18);width:100%;}
  .header-leaf{font-size:1.3rem;flex-shrink:0;cursor:pointer;}
  .header-title{font-family:'Playfair Display',serif;font-size:1.45rem;color:var(--beige);letter-spacing:.03em;line-height:1;min-width:0;flex:1;}
  .header-title span{color:var(--beige-dark);font-style:italic;font-size:.76rem;display:block;font-weight:400;margin-top:2px;letter-spacing:.07em;}
  .header-right{display:flex;align-items:center;gap:8px;flex-shrink:0;}
  .notes-btn{width:34px;height:34px;border-radius:50%;background:rgba(245,239,224,.15);border:1.5px solid rgba(245,239,224,.28);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1rem;transition:background .2s;flex-shrink:0;}
  .notes-btn:hover{background:rgba(245,239,224,.25);}
  .share-pill{display:flex;align-items:center;gap:6px;background:rgba(245,239,224,.12);border:1.5px solid rgba(245,239,224,.25);border-radius:32px;padding:6px 11px;cursor:pointer;transition:background .2s;flex-shrink:0;}
  .share-pill:hover{background:rgba(245,239,224,.2);}
  .share-pill-label{color:var(--beige);font-size:.68rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;}
  .share-code{color:var(--beige-dark);font-size:.83rem;font-family:monospace;letter-spacing:.16em;font-weight:700;}

  /* SUGGERIMENTO POPUP */
  .suggest-overlay{position:fixed;inset:0;background:rgba(30,47,16,0.45);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease;}
  .suggest-popup{background:var(--beige);border-radius:22px;box-shadow:0 8px 40px rgba(45,80,22,0.22);width:100%;max-width:320px;overflow:hidden;animation:popIn .25s ease;}
  @keyframes popIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
  .suggest-header{background:var(--forest);padding:16px 18px;display:flex;align-items:center;justify-content:space-between;}
  .suggest-header-title{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--beige);font-weight:600;}
  .suggest-close{background:none;border:none;color:var(--beige-dark);font-size:1.3rem;cursor:pointer;padding:4px;}
  .suggest-body{padding:20px;display:flex;flex-direction:column;align-items:center;gap:14px;}
  .suggest-poster{width:120px;height:180px;object-fit:cover;border-radius:10px;box-shadow:var(--shadow);}
  .suggest-poster-ph{width:120px;height:180px;background:linear-gradient(135deg,var(--beige-dark),var(--beige-mid));border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:3rem;}
  .suggest-type{font-size:.72rem;color:var(--text-light);font-weight:700;letter-spacing:.08em;text-transform:uppercase;}
  .suggest-title{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--text-dark);font-weight:600;text-align:center;line-height:1.3;}
  .suggest-year{font-size:.8rem;color:var(--text-light);}
  .suggest-again{background:var(--forest);color:var(--beige);border:none;border-radius:32px;padding:10px 24px;font-family:'Lato',sans-serif;font-size:.85rem;font-weight:700;cursor:pointer;transition:background .2s;}
  .suggest-again:hover{background:var(--forest-mid);}
  .suggest-empty{font-family:'Playfair Display',serif;font-style:italic;color:var(--text-light);font-size:.95rem;text-align:center;padding:8px 0;}

  /* NOTES POPUP */
  .notes-overlay{position:fixed;inset:0;background:rgba(30,47,16,0.45);z-index:200;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn .2s ease;}
  .notes-popup{background:var(--beige);border-radius:22px;box-shadow:0 8px 40px rgba(45,80,22,0.22);width:100%;max-width:420px;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;animation:popIn .25s ease;}
  .notes-header{background:var(--forest);padding:16px 18px;display:flex;align-items:center;justify-content:space-between;}
  .notes-header-title{font-family:'Playfair Display',serif;font-size:1.1rem;color:var(--beige);font-weight:600;}
  .notes-close{background:none;border:none;color:var(--beige-dark);font-size:1.3rem;cursor:pointer;padding:4px;}
  .notes-body{display:flex;flex:1;overflow:hidden;}
  .notes-tabs-vertical{display:flex;flex-direction:column;background:var(--beige-mid);border-right:1.5px solid var(--beige-dark);width:38px;flex-shrink:0;}
  .notes-tab-v{writing-mode:vertical-rl;text-orientation:mixed;transform:rotate(180deg);padding:14px 8px;font-family:'Lato',sans-serif;font-size:.72rem;font-weight:700;color:var(--text-light);cursor:pointer;border:none;background:transparent;transition:background .18s,color .18s;letter-spacing:.06em;text-align:center;border-bottom:1.5px solid var(--beige-dark);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-height:120px;}
  .notes-tab-v.active{background:var(--beige);color:var(--forest);}
  .notes-tab-v:hover:not(.active){background:rgba(245,239,224,.6);}
  .notes-content{flex:1;display:flex;flex-direction:column;overflow:hidden;}
  .notes-tab-label-row{display:flex;align-items:center;gap:8px;padding:10px 14px 0;}
  .notes-tab-label-input{font-family:'Lato',sans-serif;font-size:.78rem;font-weight:700;color:var(--forest);background:transparent;border:none;outline:none;border-bottom:1.5px dashed var(--beige-dark);padding:2px 4px;width:100%;cursor:text;}
  .notes-tab-label-input:focus{border-bottom-color:var(--forest-light);}
  .notes-textarea{flex:1;padding:12px 14px;font-family:'Lato',sans-serif;font-size:.9rem;color:var(--text-dark);background:var(--beige);border:none;outline:none;resize:none;line-height:1.7;min-height:220px;}
  .notes-save-row{padding:10px 14px;border-top:1px solid var(--beige-dark);}
  .notes-save-btn{background:var(--forest);color:var(--beige);border:none;border-radius:32px;padding:9px 22px;font-family:'Lato',sans-serif;font-size:.82rem;font-weight:700;cursor:pointer;transition:background .2s;}
  .notes-save-btn:hover{background:var(--forest-mid);}

  .tabs{display:flex;gap:8px;padding:14px 16px 0;overflow-x:auto;}
  .tab{background:transparent;border:2px solid var(--beige-dark);border-radius:32px;padding:7px 14px;font-family:'Lato',sans-serif;font-size:.82rem;font-weight:700;color:var(--text-light);cursor:pointer;transition:all .2s;white-space:nowrap;flex-shrink:0;}
  .tab.active{background:var(--forest);border-color:var(--forest);color:var(--beige);}
  .tab:hover:not(.active){border-color:var(--forest-light);color:var(--forest);}

  .list-name{text-align:center;font-family:'Playfair Display',serif;font-size:1rem;color:var(--forest);font-weight:600;padding:10px 16px 2px;letter-spacing:.03em;}
  .sync-info{display:flex;align-items:center;gap:6px;font-size:.72rem;color:var(--text-light);padding:4px 16px 0;flex-wrap:wrap;}
  .sync-dot{width:6px;height:6px;border-radius:50%;background:var(--forest-light);animation:pulse 2.5s infinite;flex-shrink:0;}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}

  .search-wrap{padding:14px 16px 0;max-width:500px;}
  .search-row{display:flex;gap:8px;}
  .search-input{flex:1;background:white;border:2px solid var(--beige-dark);border-radius:32px;padding:11px 17px;font-family:'Lato',sans-serif;font-size:.9rem;color:var(--text-dark);outline:none;transition:border-color .2s,box-shadow .2s;min-width:0;}
  .search-input:focus{border-color:var(--forest-light);box-shadow:0 0 0 3px rgba(90,138,53,.12);}
  .search-btn{background:var(--forest);color:var(--beige);border:none;border-radius:32px;padding:11px 18px;font-family:'Lato',sans-serif;font-size:.83rem;font-weight:700;letter-spacing:.06em;cursor:pointer;transition:background .2s,transform .15s;flex-shrink:0;}
  .search-btn:hover{background:var(--forest-mid);transform:translateY(-1px);}
  .search-btn:disabled{opacity:.5;cursor:not-allowed;transform:none;}
  .search-results{background:white;border:1.5px solid var(--beige-dark);border-radius:16px;margin-top:8px;overflow-y:auto;max-height:320px;box-shadow:var(--shadow);animation:fadeIn .2s ease;}
  .result-item{display:flex;align-items:center;gap:11px;padding:10px 13px;cursor:pointer;border-bottom:1px solid var(--beige-dark);transition:background .15s;}
  .result-item:last-child{border-bottom:none;}
  .result-item:hover{background:var(--beige-mid);}
  .result-poster-img{width:34px;height:51px;object-fit:cover;border-radius:4px;flex-shrink:0;}
  .result-poster-sq{width:44px;height:44px;object-fit:cover;border-radius:6px;flex-shrink:0;}
  .result-poster-ph{width:34px;height:51px;background:var(--beige-dark);border-radius:4px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;}
  .result-poster-ph-sq{width:44px;height:44px;background:var(--beige-dark);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;flex-shrink:0;}
  .result-title{font-family:'Playfair Display',serif;font-size:.88rem;color:var(--text-dark);font-weight:600;}
  .result-year{font-size:.72rem;color:var(--text-light);margin-top:2px;}
  .no-results{padding:11px 13px;color:var(--text-light);font-style:italic;font-size:.84rem;}

  .section-label{font-family:'Playfair Display',serif;font-size:1.18rem;color:var(--forest);padding:22px 16px 11px;display:flex;align-items:center;gap:9px;font-weight:600;}
  .section-label::after{content:'';flex:1;height:1.5px;background:linear-gradient(90deg,var(--forest-faint),transparent);margin-left:6px;}
  .count-badge{background:var(--forest-faint);color:var(--forest-mid);border:1px solid rgba(45,80,22,.15);font-family:'Lato',sans-serif;font-size:.69rem;font-weight:700;padding:2px 8px;border-radius:12px;letter-spacing:.05em;flex-shrink:0;}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:15px;padding:0 16px 10px;}
  .grid-sq{display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:15px;padding:0 16px 10px;}
  .card{position:relative;border-radius:12px;overflow:hidden;background:white;box-shadow:var(--shadow);transition:transform .22s,box-shadow .22s;animation:cardIn .35s ease both;}
  .card:hover{transform:translateY(-5px) scale(1.02);box-shadow:var(--shadow-hover);}
  .card.watched{opacity:.62;filter:saturate(.45);}
  .card-poster{width:100%;aspect-ratio:2/3;object-fit:cover;display:block;background:var(--beige-dark);}
  .card-poster-sq{width:100%;aspect-ratio:1/1;object-fit:cover;display:block;background:var(--beige-dark);}
  .poster-ph{width:100%;aspect-ratio:2/3;background:linear-gradient(135deg,var(--beige-dark),var(--beige-mid));display:flex;align-items:center;justify-content:center;font-size:2.2rem;}
  .poster-ph-sq{width:100%;aspect-ratio:1/1;background:linear-gradient(135deg,var(--beige-dark),var(--beige-mid));display:flex;align-items:center;justify-content:center;font-size:2.5rem;}
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

function lsGet(key) { try{const v=localStorage.getItem(key);return v?JSON.parse(v):null;}catch{return null;} }
function lsSet(key,val) { try{localStorage.setItem(key,JSON.stringify(val));}catch{} }
function genCode() { const c="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";return Array.from({length:6},()=>c[Math.floor(Math.random()*c.length)]).join(""); }

async function saveList(code,data){await set(ref(db,"lists/"+code),data);}
async function loadList(code){const snap=await get(ref(db,"lists/"+code));return snap.exists()?snap.val():null;}

async function searchMusic(query){
  try{
    const url=`https://musicbrainz.org/ws/2/release/?query=${encodeURIComponent(query)}&fmt=json&limit=12`;
    const res=await fetch(url,{headers:{"User-Agent":"CineForesta/1.0 (personal app)"}});
    const data=await res.json();
    return (data.releases||[]).slice(0,12).map(r=>({
      id:r.id,title:r.title,
      original_title:r["artist-credit"]?.[0]?.artist?.name||"",
      year:r.date?r.date.slice(0,4):"—",
      poster:`https://coverartarchive.org/release/${r.id}/front-250`,
      isCover:true,
    }));
  }catch{return[];}
}

async function searchFilms(query,type){
  try{
    const endpoint=type==="film"?"movie":"tv";
    const url=`${TMDB_BASE}/search/${endpoint}?api_key=${TMDB_KEY}&query=${encodeURIComponent(query)}&language=it-IT&page=1`;
    const res=await fetch(url);const data=await res.json();
    return (data.results||[]).slice(0,12).map(m=>({
      id:m.id,title:m.title||m.name,
      original_title:m.original_title||m.original_name,
      year:(m.release_date||m.first_air_date||"").slice(0,4)||"—",
      poster:m.poster_path?`${TMDB_IMG}${m.poster_path}`:null,
    }));
  }catch{return[];}
}

function getRecents(){return lsGet("cf_recents")||[];}
function saveRecents(list){lsSet("cf_recents",list);}
function addRecent(code,name){const r=getRecents().filter(x=>x.code!==code);r.unshift({code,name});saveRecents(r.slice(0,5));}
function removeRecent(code){saveRecents(getRecents().filter(r=>r.code!==code));}

const DEFAULT_NOTES={tabs:["Note","Luoghi","Link"],contents:["","",""]};

export default function App(){
  const[screen,setScreen]=useState("landing");
  const[roomCode,setRoomCode]=useState("");
  const[roomName,setRoomName]=useState("");
  const[newName,setNewName]=useState("");
  const[joinVal,setJoinVal]=useState("");
  const[joinErr,setJoinErr]=useState("");
  const[creating,setCreating]=useState(false);
  const[activeTab,setActiveTab]=useState("film");
  const[listData,setListData]=useState({film:[],serie:[],musica:[],notes:DEFAULT_NOTES,name:""});
  const[query,setQuery]=useState("");
  const[results,setResults]=useState([]);
  const[searching,setSearching]=useState(false);
  const[showResults,setShowResults]=useState(false);
  const[recents,setRecents]=useState(getRecents());
  const[showNotes,setShowNotes]=useState(false);
  const[notesTab,setNotesTab]=useState(0);
  const[localNotes,setLocalNotes]=useState(DEFAULT_NOTES);
  const[showSuggest,setShowSuggest]=useState(false);
  const[suggestion,setSuggestion]=useState(null);
  const[toast,setToast]=useState(null);
  const[toastKey,setToastKey]=useState(0);
  const searchRef=useRef(null);
  const toastTimer=useRef(null);
  const unsubRef=useRef(null);

  const showToast=msg=>{setToast(msg);setToastKey(k=>k+1);clearTimeout(toastTimer.current);toastTimer.current=setTimeout(()=>setToast(null),2400);};

useEffect(() => {
  signInAnonymously(auth)
    .then(() => console.log("Autenticato!"))
    .catch((err) => console.error("Errore auth:", err));
}, []);

// Sotto iniziano i tuoi altri useEffect esistenti...

  
  useEffect(()=>{
    const h=e=>{if(searchRef.current&&!searchRef.current.contains(e.target))setShowResults(false);};
    document.addEventListener("mousedown",h);
    return()=>document.removeEventListener("mousedown",h);
  },[]);

  useEffect(()=>{
    const last=lsGet("cf_last");
    if(last?.code){
      setRoomCode(last.code);setRoomName(last.name||last.code);
      startListening(last.code);setScreen("app");
    }
  // eslint-disable-next-line
  },[]);

  const startListening=code=>{
    if(unsubRef.current)unsubRef.current();
    const listRef=ref(db,"lists/"+code);
    unsubRef.current=onValue(listRef,snap=>{
      if(snap.exists()){
        const val=snap.val();
        const notes=val.notes||DEFAULT_NOTES;
        setListData({film:val.film||[],serie:val.serie||[],musica:val.musica||[],notes,name:val.name||""});
        setLocalNotes(notes);
      }
    });
  };

  const enterRoom=async(code,isNew,name="")=>{
    if(isNew){await saveList(code,{film:[],serie:[],musica:[],notes:DEFAULT_NOTES,name});}
    else{const ex=await loadList(code);if(ex===null){setJoinErr("Codice non trovato.");return false;}name=ex.name||code;}
    setRoomCode(code);setRoomName(name);
    addRecent(code,name);setRecents(getRecents());
    lsSet("cf_last",{code,name});
    startListening(code);setScreen("app");return true;
  };

  const handleCreate=async()=>{
    if(!newName.trim()){setJoinErr("Dai un nome alla lista!");return;}
    setCreating(true);const code=genCode();
    await enterRoom(code,true,newName.trim());
    showToast("Lista creata! 🌿");setCreating(false);
  };

  const handleJoin=async()=>{
    const c=joinVal.trim().toUpperCase();
    if(c.length<4){setJoinErr("Codice non valido.");return;}
    setJoinErr("");const ok=await enterRoom(c,false);if(ok)showToast("Entrato! 🌿");
  };

  const goHome=()=>{
    if(unsubRef.current)unsubRef.current();
    setScreen("landing");setRoomCode("");setRoomName("");
    setQuery("");setResults([]);setShowResults(false);
    setRecents(getRecents());setShowNotes(false);setShowSuggest(false);
  };

  const updateCategory=async(category,next)=>{
    const newData={...listData,[category]:next};
    setListData(prev=>({...prev,[category]:next}));
    await saveList(roomCode,newData);
  };

  const saveNotes=async()=>{
    const newData={...listData,notes:localNotes};
    setListData(prev=>({...prev,notes:localNotes}));
    await saveList(roomCode,newData);
    showToast("Note salvate ✓");
  };

  const copyCode=()=>{navigator.clipboard?.writeText(roomCode).catch(()=>{});showToast(`Codice copiato: ${roomCode} 📋`);};

  const pickSuggestion=()=>{
    const pool=[
      ...(listData.film||[]).filter(f=>!f.watched).map(f=>({...f,_type:"film"})),
      ...(listData.serie||[]).filter(f=>!f.watched).map(f=>({...f,_type:"serie"})),
    ];
    setSuggestion(pool.length===0?null:pool[Math.floor(Math.random()*pool.length)]);
    setShowSuggest(true);
  };

  const handleSearch=async()=>{
    if(!query.trim())return;
    setSearching(true);setShowResults(true);setResults([]);
    let r=[];
    if(activeTab==="musica")r=await searchMusic(query.trim());
    else r=await searchFilms(query.trim(),activeTab);
    setResults(r);setSearching(false);
  };

  const addItem=async item=>{
    const list=listData[activeTab]||[];
    if(list.find(f=>f.id===item.id)){showToast("Già in lista!");return;}
    await updateCategory(activeTab,[{...item,watched:false,addedAt:Date.now()},...list]);
    setQuery("");setResults([]);setShowResults(false);
    showToast(`"${item.title}" aggiunto ✓`);
  };

  const toggleWatched=id=>{const list=listData[activeTab]||[];updateCategory(activeTab,list.map(f=>f.id===id?{...f,watched:!f.watched}:f));};
  const removeItem=id=>{const list=listData[activeTab]||[];updateCategory(activeTab,list.filter(f=>f.id!==id));};
  const updateNoteTab=(i,val)=>{const tabs=[...localNotes.tabs];tabs[i]=val;setLocalNotes(prev=>({...prev,tabs}));};
  const updateNoteContent=(i,val)=>{const contents=[...localNotes.contents];contents[i]=val;setLocalNotes(prev=>({...prev,contents}));};

  const currentList=listData[activeTab]||[];
  const toWatch=currentList.filter(f=>!f.watched);
  const watched=currentList.filter(f=>f.watched);
  const isMusic=activeTab==="musica";
  const tabIcon={film:"🎬",serie:"📺",musica:"🎵"};
  const watchedLabel={film:"Film visti",serie:"Viste",musica:"Condivisa"};
  const toWatchLabel={film:"Da vedere",serie:"Da vedere",musica:"Da ascoltare"};
  const searchPlaceholder={film:"Cerca un film…",serie:"Cerca una serie o anime…",musica:"Cerca artista o album…"};

  if(screen==="landing")return(
    <>
      <style>{STYLE}</style>
      <div className="app">
        <div className="landing">
          <div className="landing-logo">🌿</div>
          <div className="landing-title">PocketList<span>lista condivisa</span></div>
          <p className="landing-sub">Crea una lista, condividi il codice con un amico, e decidete cosa vedere stasera.</p>
          <div className="landing-box">
            <div className="landing-box-title">Crea nuova lista</div>
            <input className="name-input" placeholder="Nome della lista (es. Film con Marco)" value={newName} onChange={e=>{setNewName(e.target.value);setJoinErr("");}} onKeyDown={e=>e.key==="Enter"&&handleCreate()}/>
            <button className="create-btn" onClick={handleCreate} disabled={creating}>{creating?<span className="loading-dots"><span/><span/><span/></span>:"🌿 Crea lista"}</button>
            <div className="divider">oppure entra con un codice</div>
            <div className="join-row">
              <input className="join-input" placeholder="CODICE" value={joinVal} onChange={e=>{setJoinVal(e.target.value);setJoinErr("");}} onKeyDown={e=>e.key==="Enter"&&handleJoin()} maxLength={8}/>
              <button className="join-btn" onClick={handleJoin}>Entra →</button>
            </div>
            {joinErr&&<div className="error-msg">⚠ {joinErr}</div>}
          </div>
          {recents.length>0&&(
            <div className="recent-section">
              <div className="recent-title">Liste recenti</div>
              <div className="recent-list">
                {recents.map(r=>(
                  <div key={r.code} className="recent-item" onClick={()=>enterRoom(r.code,false)}>
                    <span className="recent-icon">🌿</span>
                    <div><div className="recent-name">{r.name}</div><div className="recent-code">{r.code}</div></div>
                    <button className="recent-del" onClick={e=>{e.stopPropagation();removeRecent(r.code);setRecents(getRecents());}}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {toast&&<div key={toastKey} className="toast">{toast}</div>}
    </>
  );

  return(
    <>
      <style>{STYLE}</style>
      <div className="app">
        <header>
          <span className="header-leaf" onClick={goHome}>🌿</span>

          <div className="header-right">
            <div className="notes-btn" onClick={pickSuggestion} title="Suggerimento">💡</div>
            <div className="notes-btn" onClick={()=>setShowNotes(true)} title="Note">📝</div>
            <div className="share-pill" onClick={copyCode}>
              <span className="share-pill-label">Codice</span>
              <span className="share-code">{roomCode}</span>
              <span style={{color:"var(--beige-dark)"}}>📋</span>
            </div>
          </div>
        </header>

        <div className="list-name">{roomName}</div>
        <div className="sync-info"><span className="sync-dot"/>Sincronizzata in tempo reale · codice:&nbsp;<strong style={{color:"var(--forest)"}}>{roomCode}</strong></div>

        <div className="tabs">
          <button className={`tab${activeTab==="film"?" active":""}`} onClick={()=>{setActiveTab("film");setQuery("");setResults([]);setShowResults(false);}}>🎬 Film</button>
          <button className={`tab${activeTab==="serie"?" active":""}`} onClick={()=>{setActiveTab("serie");setQuery("");setResults([]);setShowResults(false);}}>📺 Serie</button>
          <button className={`tab${activeTab==="musica"?" active":""}`} onClick={()=>{setActiveTab("musica");setQuery("");setResults([]);setShowResults(false);}}>🎵 Musica</button>
        </div>

        <div ref={searchRef}>
          <div className="search-wrap">
            <div className="search-row">
              <input className="search-input" placeholder={searchPlaceholder[activeTab]} value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()} onFocus={()=>results.length&&setShowResults(true)}/>
              <button className="search-btn" onClick={handleSearch} disabled={searching}>{searching?<span className="loading-dots"><span/><span/><span/></span>:"Cerca"}</button>
            </div>
            {showResults&&(
              <div className="search-results">
                {searching&&<div className="no-results">Ricerca in corso…</div>}
                {!searching&&results.length===0&&<div className="no-results">Nessun risultato trovato.</div>}
                {!searching&&results.map(item=>(
                  <div key={item.id} className="result-item" onClick={()=>addItem(item)}>
                    {isMusic?<MusicCover url={item.poster} size="sq"/>:item.poster?<img src={item.poster} alt={item.title} className="result-poster-img"/>:<div className="result-poster-ph">📺</div>}
                    <div><div className="result-title">{item.title}</div><div className="result-year">{item.original_title&&item.original_title!==item.title?`${item.original_title} · `:""}{item.year}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="section-label">{tabIcon[activeTab]} {toWatchLabel[activeTab]} {toWatch.length>0&&<span className="count-badge">{toWatch.length}</span>}</div>
        {toWatch.length===0?<div className="empty">Cerca qualcosa per aggiungerlo alla lista…</div>:<div className={isMusic?"grid-sq":"grid"}>{toWatch.map((f,i)=><Card key={f.id} film={f} index={i} isMusic={isMusic} tab={activeTab} onToggle={toggleWatched} onRemove={removeItem}/>)}</div>}
        {watched.length>0&&(<div className="watched-section"><div className="section-label">{watchedLabel[activeTab]} 🙃 <span className="count-badge">{watched.length}</span></div><div className={isMusic?"grid-sq":"grid"}>{watched.map((f,i)=><Card key={f.id} film={f} index={i} isMusic={isMusic} tab={activeTab} onToggle={toggleWatched} onRemove={removeItem}/>)}</div></div>)}
      </div>

      {/* SUGGERIMENTO POPUP */}
      {showSuggest&&(
        <div className="suggest-overlay" onClick={e=>e.target.className==="suggest-overlay"&&setShowSuggest(false)}>
          <div className="suggest-popup">
            <div className="suggest-header">
              <span className="suggest-header-title">💡 Cosa guardiamo?</span>
              <button className="suggest-close" onClick={()=>setShowSuggest(false)}>✕</button>
            </div>
            <div className="suggest-body">
              {suggestion===null
                ?<div className="suggest-empty">Nessun titolo da vedere nella lista!</div>
                :<>
                  <div className="suggest-type">{suggestion._type==="film"?"🎬 Film":"📺 Serie"}</div>
                  {suggestion.poster
                    ?<img src={suggestion.poster} alt={suggestion.title} className="suggest-poster"/>
                    :<div className="suggest-poster-ph">{suggestion._type==="film"?"🎬":"📺"}</div>}
                  <div className="suggest-title">{suggestion.title}</div>
                  <div className="suggest-year">{suggestion.year}</div>
                  <button className="suggest-again" onClick={pickSuggestion}>🔀 Altro</button>
                </>
              }
            </div>
          </div>
        </div>
      )}

      {/* NOTES POPUP */}
      {showNotes&&(
        <div className="notes-overlay" onClick={e=>e.target.className==="notes-overlay"&&setShowNotes(false)}>
          <div className="notes-popup">
            <div className="notes-header"><span className="notes-header-title">📝 Note condivise</span><button className="notes-close" onClick={()=>setShowNotes(false)}>✕</button></div>
            <div className="notes-body">
              <div className="notes-tabs-vertical">
                {localNotes.tabs.map((t,i)=><button key={i} className={`notes-tab-v${notesTab===i?" active":""}`} onClick={()=>setNotesTab(i)} title={t}>{t}</button>)}
              </div>
              <div className="notes-content">
                <div className="notes-tab-label-row"><input className="notes-tab-label-input" value={localNotes.tabs[notesTab]} onChange={e=>updateNoteTab(notesTab,e.target.value)} placeholder="Nome linguetta…"/></div>
                <textarea className="notes-textarea" value={localNotes.contents[notesTab]} onChange={e=>updateNoteContent(notesTab,e.target.value)} placeholder="Scrivi qui le tue note…"/>
                <div className="notes-save-row"><button className="notes-save-btn" onClick={saveNotes}>Salva note</button></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast&&<div key={toastKey} className="toast">{toast}</div>}
    </>
  );
}

function MusicCover({url,size}){const[err,setErr]=useState(false);if(!url||err)return<div className={size==="sq"?"result-poster-ph-sq":"poster-ph-sq"}>🎵</div>;return<img src={url} alt="" className={size==="sq"?"result-poster-sq":"card-poster-sq"} onError={()=>setErr(true)}/>;}

function Card({film,index,isMusic,tab,onToggle,onRemove}){
  const[imgErr,setImgErr]=useState(false);
  const emoji={film:"🎬",serie:"📺",musica:"🎵"};
  return(
    <div className={`card${film.watched?" watched":""}`} style={{animationDelay:`${index*0.05}s`}}>
      <div className={`card-check${film.watched?" on":""}`} onClick={()=>onToggle(film.id)}>{film.watched&&<span className="checkmark">✓</span>}</div>
      <button className="card-del" onClick={()=>onRemove(film.id)}>✕</button>
      {isMusic?film.poster&&!imgErr?<img src={film.poster} alt={film.title} className="card-poster-sq" onError={()=>setImgErr(true)}/>:<div className="poster-ph-sq">🎵</div>:film.poster&&!imgErr?<img src={film.poster} alt={film.title} className="card-poster" onError={()=>setImgErr(true)}/>:<div className="poster-ph">{emoji[tab]}</div>}
      <div className="card-info"><div className="card-title">{film.title}</div><div className="card-year">{isMusic&&film.original_title?film.original_title:film.year}</div></div>
    </div>
  );
}
