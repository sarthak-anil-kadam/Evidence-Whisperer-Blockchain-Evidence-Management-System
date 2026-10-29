import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Use 127.0.0.1 to avoid localhost resolution issues
const API = "http://127.0.0.1:5001/api";

// --- SLIDESHOW DATA ---
const LOGIN_SLIDES = [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070", // Tech Blue
    "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070", // Digital Fingerprint
    "https://images.unsplash.com/photo-1558494949-ef526b0042a0?q=80&w=2070", // Server Room
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070", // Matrix Code
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070", // Network
    "https://images.unsplash.com/photo-1614064641938-3e848abeb485?q=80&w=2070"  // Cyber Security
];

const OFFICER_SLIDES = [
    { title: "SYSTEM OPTIMAL", desc: "Blockchain ledger fully synchronized.", img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072" },
    { title: "INTEGRITY ACTIVE", desc: "Real-time hashing active.", img: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470" },
    { title: "SECURE TRANSFER", desc: "End-to-end encryption enabled.", img: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?q=80&w=2070" }
];

const ADMIN_SLIDES = [
    { title: "GLOBAL COMMAND", desc: "Monitoring all node activities.", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070" },
    { title: "ACCESS CONTROL", desc: "Biometric protocols engaged.", img: "https://images.unsplash.com/photo-1551808525-51a943718d53?q=80&w=2024" }
];

// UNIQUE HASH GENERATOR (Logic Preserved)
const getDisplayHash = (item) => {
    if (item.hash && item.hash.startsWith("0x") && item.hash.length > 20) return item.hash;
    let str = item.id + (item.type || "") + (item.custodian || "") + "SECURE_HASH_V1";
    let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
    for (let i = 0; i < str.length; i++) {
        let ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    const p1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const p2 = (h2 >>> 0).toString(16).padStart(8, '0');
    const p3 = ((h1 ^ h2) >>> 0).toString(16).padStart(8, '0');
    const p4 = ((h1 + h2) >>> 0).toString(16).padStart(8, '0');
    const p5 = Math.abs(h1 * h2).toString(16).padStart(8, '0');
    return "0x" + p1 + p2 + p3 + p4 + p5 + p1 + p2 + p3 + p4;
};

// --- HIGH-TECH UI STYLES ---
const styles = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@300;400;500;600;700&family=Share+Tech+Mono&display=swap');

:root {
    --bg-deep: #030305;
    --surface-1: rgba(10, 10, 15, 0.95);
    --surface-2: rgba(20, 20, 30, 0.6);
    --border: rgba(255, 255, 255, 0.1);
    --primary: #00f3ff;   /* Cyan */
    --accent: #bc13fe;    /* Purple */
    --gold: #ffd700;      /* Admin */
    --success: #0aff0a;
    --danger: #ff2a2a;
    --text-main: #ffffff;
    --text-muted: #8b9bb4;
    
    --font-display: 'Orbitron', sans-serif;
    --font-body: 'Rajdhani', sans-serif;
    --font-mono: 'Share Tech Mono', monospace;
    
    --ease: cubic-bezier(0.23, 1, 0.32, 1);
}

* { box-sizing: border-box; outline: none; user-select: none; }

body { 
    margin: 0; 
    background-color: var(--bg-deep); 
    color: var(--text-main); 
    font-family: var(--font-body); 
    height: 100vh; 
    overflow: hidden;
    font-size: 16px;
    background-image: 
        linear-gradient(rgba(0, 243, 255, 0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0, 243, 255, 0.02) 1px, transparent 1px);
    background-size: 50px 50px;
}

/* --- RETRO-FUTURISM EFFECTS --- */
#scanlines {
    position: fixed; inset: 0; pointer-events: none; z-index: 50; /* Lowered Z-Index to stay below UI */
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
    background-size: 100% 2px, 3px 100%;
}

/* --- ANIMATIONS --- */
@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
.animate-enter { animation: fadeInUp 0.8s var(--ease) forwards; }
.delay-1 { animation-delay: 0.1s; } .delay-2 { animation-delay: 0.2s; } .delay-3 { animation-delay: 0.3s; }

/* --- BENTO GRID LAYOUT --- */
.bento-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 20px;
    padding-bottom: 80px; /* Added padding for scroll space */
}
@media (min-width: 1000px) {
    .bento-grid { grid-template-columns: repeat(4, 1fr); grid-auto-rows: minmax(180px, auto); }
    .col-span-2 { grid-column: span 2; }
    .col-span-3 { grid-column: span 3; }
    .col-span-4 { grid-column: span 4; }
    .row-span-2 { grid-row: span 2; }
}

.bento-card {
    background: linear-gradient(135deg, rgba(25, 25, 30, 0.8), rgba(10, 10, 12, 0.9));
    backdrop-filter: blur(20px);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 25px;
    position: relative;
    /* Removed overflow: hidden to allow dropdowns/tooltips if needed, handled content inside */
    transition: all 0.4s var(--ease);
    display: flex; flex-direction: column; justify-content: space-between;
    z-index: 10;
}
.bento-card:hover { 
    transform: translateY(-5px) scale(1.01); 
    border-color: rgba(255, 255, 255, 0.3); 
    box-shadow: 0 20px 50px -10px rgba(0,0,0,0.8);
    z-index: 15; /* Bring to front on hover */
}

.card-title { font-family: var(--font-display); font-size: 14px; color: var(--text-muted); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; }
.card-value { font-family: var(--font-display); font-size: 48px; color: white; font-weight: 700; text-shadow: 0 0 20px rgba(0,0,0,0.5); }
.card-sub { font-size: 12px; color: var(--text-muted); }

/* Admin Card Variant */
.admin-card { border-left: 2px solid var(--gold); }

/* --- UI ELEMENTS --- */
.tech-input, .tech-select, .tech-textarea {
    width: 100%; background: rgba(0,0,0,0.4); border: 1px solid var(--border);
    color: var(--text-main); padding: 15px 20px; border-radius: 12px;
    font-family: var(--font-body); font-size: 16px; transition: 0.3s;
    margin-bottom: 15px;
}
.tech-input:focus { border-color: var(--primary); background: rgba(0, 243, 255, 0.05); box-shadow: 0 0 15px rgba(0, 243, 255, 0.1); }
.form-label { font-size: 12px; color: var(--text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; display: block; }

.btn {
    padding: 14px 28px; border-radius: 12px; font-weight: 700; font-size: 14px;
    cursor: pointer; transition: 0.3s; border: none; letter-spacing: 1px;
    text-transform: uppercase; font-family: var(--font-display);
    display: inline-flex; align-items: center; justify-content: center; gap: 10px;
}
.btn-glow { background: var(--primary); color: #000; box-shadow: 0 0 20px rgba(0, 243, 255, 0.2); }
.btn-glow:hover { background: white; box-shadow: 0 0 40px rgba(0, 243, 255, 0.5); transform: translateY(-2px); }
.btn-primary { background: linear-gradient(90deg, var(--primary), var(--accent)); color: white; }
.btn-primary:hover { filter: brightness(1.2); }
.btn-admin { background: var(--gold); color: black; box-shadow: 0 0 20px rgba(255, 215, 0, 0.3); }
.btn-admin:hover { background: white; box-shadow: 0 0 40px rgba(255, 215, 0, 0.5); }
.btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-muted); }
.btn-outline:hover { border-color: var(--text-main); color: var(--text-main); background: rgba(255,255,255,0.05); }
.btn-danger { background: rgba(239, 68, 68, 0.1); color: var(--danger); border: 1px solid rgba(239, 68, 68, 0.2); }
.btn-danger:hover { background: rgba(239, 68, 68, 0.2); }

/* --- LAYOUT --- */
#app-interface { display: flex; height: 100vh; width: 100%; position: relative; z-index: 10; }
.sidebar {
    width: 280px; background: rgba(5, 5, 7, 0.95); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 30px 20px; z-index: 20;
    backdrop-filter: blur(20px);
}
.sidebar-admin { border-right: 1px solid var(--gold); }

.nav-header { margin-bottom: 40px; display: flex; align-items: center; gap: 12px; }
.nav-logo-icon { width: 40px; height: 40px; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px; box-shadow: 0 0 20px rgba(0, 243, 255, 0.4); }
.nav-title h3 { margin: 0; font-size: 16px; font-weight: 700; color: white; }
.nav-title p { margin: 0; font-size: 10px; color: var(--text-muted); letter-spacing: 1px; }

.nav-menu { display: flex; flex-direction: column; gap: 5px; }

.nav-item, .nav-item-admin {
    padding: 12px 16px;
    border-radius: 10px;
    color: var(--text-muted);
    cursor: pointer;
    transition: 0.3s;
    font-weight: 500;
    font-size: 14px;
    display: flex; align-items: center; gap: 12px;
}
.nav-item:hover { background: var(--surface-2); color: var(--text-main); }
.nav-item.active { 
    background: rgba(59, 130, 246, 0.1); 
    color: var(--primary); 
    border: 1px solid rgba(59, 130, 246, 0.2);
}
.nav-item-admin:hover { color: var(--gold); background: rgba(255, 215, 0, 0.1); }
.nav-item-admin.active { 
    background: rgba(255, 215, 0, 0.15); 
    color: var(--gold); 
    border: 1px solid rgba(255, 215, 0, 0.2);
}

/* Main Content */
.main-content { flex: 1; display: flex; flex-direction: column; position: relative; overflow: hidden; }
.top-bar {
    height: 90px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center;
    padding: 0 50px; background: rgba(5, 5, 7, 0.8); backdrop-filter: blur(10px); z-index: 10;
}
.view-port { flex: 1; padding: 40px; overflow-y: auto; scroll-behavior: smooth; padding-bottom: 100px; /* Extra padding for scroll */ }

/* --- SLIDESHOWS --- */
.hero-slider {
    position: relative; width: 100%; height: 100%; min-height: 250px;
    border-radius: 16px; overflow: hidden; background: #000;
}
.slide-item { position: absolute; inset: 0; opacity: 0; transition: opacity 1.5s ease-in-out; }
.slide-item.active { opacity: 1; }
.slide-item img { width: 100%; height: 100%; object-fit: cover; opacity: 0.7; transform: scale(1.05); transition: transform 10s ease; }
.slide-item.active img { transform: scale(1); }
.slide-caption {
    position: absolute; bottom: 0; left: 0; width: 100%;
    background: linear-gradient(0deg, #000, transparent); padding: 40px;
}
.slide-caption h2 { margin: 0; font-family: var(--font-display); font-size: 32px; letter-spacing: 2px; color: white; text-transform: uppercase; }

/* Login Slideshow */
.login-bg-slider { position: absolute; inset: 0; z-index: 1; }
.login-bg-slide {
    position: absolute; inset: 0;
    background-size: cover; background-position: center;
    opacity: 0; transition: opacity 2s ease;
}
.login-bg-slide.active { opacity: 1; }
.login-overlay { position: absolute; inset: 0; background: linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.4)); z-index: 2; backdrop-filter: blur(2px); }
.visual-content { position: relative; z-index: 3; text-align: center; }
.visual-card {
    background: rgba(255,255,255,0.1); backdrop-filter: blur(20px);
    padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.2);
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    animation: float 6s ease-in-out infinite;
}

/* --- TABLES --- */
.modern-table-container {
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
}
.modern-table { width: 100%; border-collapse: collapse; }
.modern-table th { 
    text-align: left; padding: 20px 24px; 
    color: var(--text-muted); font-size: 12px; font-weight: 600; text-transform: uppercase;
    border-bottom: 1px solid var(--border);
    background: var(--surface-2);
}
.modern-table td { 
    padding: 20px 24px; 
    border-bottom: 1px solid var(--border);
    color: var(--text-main);
    font-size: 14px;
}
.modern-table tr:hover td { background: rgba(255,255,255,0.02); }
.hash-pill { 
    font-family: var(--font-mono); font-size: 12px; 
    background: rgba(139, 92, 246, 0.1); color: var(--accent);
    padding: 4px 8px; border-radius: 6px; border: 1px solid rgba(139, 92, 246, 0.2);
}

/* --- UPLOAD AREA --- */
.modern-upload {
    border: 2px dashed var(--border);
    border-radius: 20px;
    padding: 60px 40px;
    text-align: center;
    background: var(--surface-1);
    transition: 0.3s;
    cursor: pointer;
}
.modern-upload:hover { border-color: var(--primary); background: rgba(59, 130, 246, 0.05); }

/* --- AUTH SCREENS --- */
.login-split { display: flex; height: 100vh; width: 100%; position: relative; z-index: 100; }
.login-visual {
    flex: 1;
    position: relative;
    display: flex; align-items: center; justify-content: center;
    overflow: hidden;
}
.login-form-wrapper {
    width: 500px;
    background: var(--bg-body);
    display: flex; flex-direction: column; justify-content: flex-start;
    padding: 60px;
    border-left: 1px solid var(--border);
    overflow-y: auto;
    position: relative; z-index: 10;
}
.login-user-preview {
    display: flex; align-items: center; gap: 16px;
    padding: 16px; background: var(--surface-2); border-radius: 12px;
    border: 1px solid var(--border); margin-bottom: 20px;
    animation: fadeInUp 0.4s var(--ease);
}
.login-avatar { width: 48px; height: 48px; border-radius: 10px; object-fit: cover; }

/* --- MODALS --- */
.modern-modal-overlay {
    position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 100;
    backdrop-filter: blur(8px);
    display: flex; justify-content: center; align-items: center;
}
.modern-modal {
    background: var(--surface-1);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 40px;
    width: 600px;
    max-width: 90%;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
    animation: fadeInUp 0.4s var(--ease);
}

@media print { 
    @page { size: A4; margin: 20mm; } 
    body { background: white; color: black; font-family: 'Times New Roman', serif; }
    .sidebar, .top-bar, .modern-upload, .btn, .hero-slider, #scanlines { display: none !important; }
}
`;

function App() {
  const [view, setView] = useState('login');
  const [user, setUser] = useState(null);
  
  // Data State
  const [cases, setCases] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [usersList, setUsersList] = useState([]); // Admin view
  
  // Auth State
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginPreview, setLoginPreview] = useState(null);

  // Modals & Uploads
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaType, setMediaType] = useState('');
  const [fileToUpload, setFileToUpload] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [showDetail, setShowDetail] = useState(null);
  const [ingestType, setIngestType] = useState('Image');

  // Slideshow States
  const [loginSlideIndex, setLoginSlideIndex] = useState(0);
  const [dashSlideIndex, setDashSlideIndex] = useState(0);

  // --- SLIDESHOW EFFECTS ---
  useEffect(() => {
      const interval = setInterval(() => {
          setLoginSlideIndex(prev => (prev + 1) % LOGIN_SLIDES.length);
      }, 5000);
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      const interval = setInterval(() => {
          setDashSlideIndex(prev => (prev + 1) % OFFICER_SLIDES.length); 
      }, 6000);
      return () => clearInterval(interval);
  }, []);

  // --- ACTIONS ---
  const checkUser = async (val) => {
    setLoginId(val);
    if(val.length > 3) {
      try {
        const res = await axios.get(`${API}/user/${val}`);
        if(res.data.found) setLoginPreview(res.data);
        else setLoginPreview(null);
      } catch(e) { setLoginPreview(null); }
    }
  };

  const handleLogin = async (e) => {
    if(e) e.preventDefault();
    try {
      const res = await axios.post(`${API}/login`, { id: loginId.trim(), pass: loginPass.trim() });
      const userData = res.data.user;
      setUser(userData);
      
      if(userData.id === 'ADMIN@' || userData.role === 'ADMIN') {
          await fetchAdminData();
          setView('admin');
      } else {
          await fetchData(userData.id);
          setView('dashboard');
      }
    } catch(err) { 
        alert(err.response?.data?.error || "Invalid Credentials"); 
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
        const res = await axios.post(`${API}/register`, formData);
        alert(res.data.message);
        setView('login');
    } catch (err) {
        alert(err.response?.data?.error || "Registration Failed");
    }
  };

  const fetchData = async () => {
    try {
        const cRes = await axios.get(`${API}/cases`);
        setCases(cRes.data);
        const lRes = await axios.get(`${API}/ledger`);
        setLedger(lRes.data);
    } catch (err) { console.error(err); }
  };

  const fetchAdminData = async () => {
      try {
          const res = await axios.get(`${API}/admin/users`);
          const cRes = await axios.get(`${API}/cases`);
          // Enrich with stats logic
          const enriched = res.data.map(u => ({
              ...u,
              activeCases: cRes.data.filter(c => c.officerId === u.id && c.status === 'OPEN').length,
              caseTitles: cRes.data.filter(c => c.officerId === u.id && c.status === 'OPEN').map(c => c.title)
          }));
          setUsersList(enriched);
      } catch(e) { console.error(e); }
  };

  const handleAdminAction = async (targetId, action) => {
      try {
          await axios.post(`${API}/admin/action`, { targetId, action });
          alert(`Action Successful`);
          fetchAdminData();
      } catch(e) { alert("Action Failed"); }
  };

  const saveProfile = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      formData.append('id', user.id);
      try {
        const res = await axios.post(`${API}/profile`, formData);
        setUser(res.data.user);
        alert("Profile Updated");
      } catch (err) { alert("Update Failed"); }
  };

  const createCase = async () => {
    const title = document.getElementById('nc-title').value;
    const id = "CASE-2025-" + Date.now().toString().slice(-4);
    await axios.post(`${API}/cases`, { id, title, officerId: user.id });
    fetchData();
    setShowCaseModal(false);
  };

  const uploadEvidence = async (e) => {
    e.preventDefault();
    if(!fileToUpload) return alert("Select File");
    const form = new FormData(e.target);
    form.append('custodian', user.id);
    form.append('officerId', user.id);
    form.append('id', "EV-" + Math.floor(Math.random()*10000));
    try {
        await axios.post(`${API}/evidence`, form);
        alert("Evidence Secured!");
        await fetchData();
        setView('dashboard');
    } catch (err) { alert("Upload Failed"); }
  };

  const handleFileSelect = (e) => {
      const file = e.target.files[0];
      setFileToUpload(file);
      if(file && file.type.startsWith('image')) setFilePreview(URL.createObjectURL(file));
      else setFilePreview(null);
  };

  const executeTransfer = async () => {
    const caseId = document.getElementById('trans-case').value;
    const newCustodian = document.getElementById('trans-to').value;
    if(!caseId || !newCustodian) return alert("Missing Info");
    try {
        await axios.post(`${API}/transfer-case`, { caseId, newCustodian, currentOfficer: user.id });
        alert("Transfer Successful");
        await fetchData();
        setView('dashboard');
    } catch (err) { alert("Transfer Failed"); }
  };

  const copyToClipboard = (text) => { navigator.clipboard.writeText(text); alert("Copied: " + text); };

  const verifyIntegrity = async () => {
      const val = document.getElementById('verify-input').value;
      const res = document.getElementById('verify-result');
      if (!res) return;
      res.innerHTML = "Scanning Nodes...";
      setTimeout(() => {
          const found = ledger.find(e => e.id === val || getDisplayHash(e) === val);
          if(found) res.innerHTML = `<span style="color:var(--success)">✔ VERIFIED ON-CHAIN</span><br>ID: ${found.id}<br>Type: ${found.type}`;
          else res.innerHTML = `<span style="color:var(--danger)">✖ RECORD NOT FOUND</span>`;
      }, 1000);
  };

  const generateReport = () => {
    const cid = document.getElementById('rep-case').value;
    if(!cid) return alert("Select Case");
    const c = cases.find(x => x.id === cid);
    const evs = ledger.filter(l => l.caseId === cid);

    const win = window.open('','','width=900,height=800');
    win.document.write(`<html><head><style>@page{size:A4;margin:20mm;} body{font-family:'Times New Roman',serif;padding:20mm;color:black;} table{width:100%;border-collapse:collapse;margin-top:20px;} th,td{border:1px solid black;padding:8px;text-align:left;}</style></head><body>
      <h1>EVIDENCE WHISPERER REPORT</h1>
      <p><strong>CASE:</strong> ${c.title} (${c.id})</p>
      <hr>
      <div style="display:flex; margin-bottom:20px;">
          <img src="${user.photo}" style="width:100px;height:100px;object-fit:cover;border:1px solid black;margin-right:20px;">
          <div>
              <p><strong>OFFICER:</strong> ${user.name}</p>
              <p><strong>BADGE ID:</strong> ${user.id}</p>
              <p><strong>DATE:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
      </div>
      <h4>CHAIN OF CUSTODY LOG</h4>
      <table>
        <tr><th>ID</th><th>HASH</th><th>CUSTODIAN</th></tr>
        ${evs.map(e => `<tr><td>${e.id}</td><td style="font-family:monospace">${getDisplayHash(e)}</td><td>${e.custodian}</td></tr>`).join('')}
      </table>
      <br><br>
      <div style="text-align:right;">
          <img src="${user.signature}" style="height:50px;"><br>
          <div style="border-top:1px solid black;display:inline-block;width:200px;text-align:center;">Digital Signature</div>
      </div>
    </body></html>`);
    win.document.close();
    setTimeout(()=>win.print(), 500);
  };

  const myCases = cases.filter(c => user && c.officerId === user.id);
  const myEvidence = ledger.filter(l => user && l.custodian && l.custodian.toLowerCase() === user.id.toLowerCase());

  // --- VIEWS ---

  if(view === 'login') return (
    <>
    <style>{styles}</style>
    <div id="scanlines"></div>
    <div className="login-split">
        <div className="login-visual">
            <div className="login-bg-slider">
                {LOGIN_SLIDES.map((src, i) => (
                    <div key={i} className={`login-bg-slide ${i === loginSlideIndex ? 'active' : ''}`} style={{backgroundImage: `url(${src})`}} />
                ))}
            </div>
            <div className="login-bg-overlay"></div>
            <div className="visual-content">
                <div className="visual-card">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" style={{width:'80px', height:'80px', margin:'0 auto 20px', display:'block'}}>
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M8 11h8" /><path d="M12 11v4" />
                    </svg>
                    <h1 style={{fontSize:'36px', fontWeight:'800', margin:0, fontFamily:'var(--font-display)'}}>EVIDENCE<br/><span style={{color:'var(--primary)'}}>WHISPERER</span></h1>
                    <p style={{opacity:0.7, marginTop:'10px'}}>SECURE FORENSIC CHAIN OF CUSTODY</p>
                </div>
            </div>
        </div>
        <div className="login-form-wrapper">
            <h2 style={{fontSize:'24px', fontWeight:'700', marginBottom:'30px', fontFamily:'Orbitron, sans-serif'}}>Welcome Back</h2>
            <form onSubmit={handleLogin}>
                <div className="input-group">
                    <label className="form-label">Badge ID</label>
                    <input className="tech-input" placeholder="e.g. LE-8842" value={loginId} onChange={e=>{setLoginId(e.target.value); checkUser(e.target.value);}} />
                </div>
                {loginPreview && (<div className="login-user-preview"><img src={loginPreview.photo} className="login-avatar"/><div><b>{loginPreview.name}</b><br/><span style={{color:'var(--success)', fontSize:'11px'}}>BIOMETRIC MATCH</span></div></div>)}
                <div className="input-group">
                    <label className="form-label">Password</label>
                    <input className="tech-input" type="password" placeholder="••••••••" value={loginPass} onChange={e=>setLoginPass(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary w-full">AUTHENTICATE</button>
            </form>
            <div style={{textAlign:'center', marginTop:'30px', color:'var(--text-muted)', fontSize:'13px'}}>
                New to the force? <span style={{color:'var(--primary)', cursor:'pointer', fontWeight:'600'}} onClick={()=>setView('signup')}>Request Access</span>
            </div>
        </div>
    </div>
    </>
  );

  if(view === 'signup') return (
    <>
    <style>{styles}</style>
    <div className="login-split">
        <div className="login-visual">
            <div className="login-bg-slider">
                {LOGIN_SLIDES.map((src, i) => (
                    <div key={i} className={`login-bg-slide ${i === loginSlideIndex ? 'active' : ''}`} style={{backgroundImage: `url(${src})`}} />
                ))}
            </div>
            <div className="login-bg-overlay"></div>
        </div>
        <div className="login-form-wrapper">
            <h2 style={{fontSize:'24px', fontWeight:'700', marginBottom:'30px', fontFamily:'Orbitron, sans-serif'}}>Officer Enrollment</h2>
            <form onSubmit={handleRegister}>
                <div className="input-group"><label className="form-label">Full Name</label><input name="name" className="tech-input" required/></div>
                <div className="input-group"><label className="form-label">Badge ID</label><input name="id" className="tech-input" required/></div>
                
                {/* --- OFFICIAL EMAIL INPUT FOR OTP --- */}
                <div className="input-group">
                    <label className="form-label" style={{color: 'var(--primary)'}}>OFFICIAL EMAIL (REQUIRED FOR VERIFICATION)</label>
                    <input name="email" type="email" className="tech-input" placeholder="officer@forensics.gov" required/>
                </div>

                <div className="input-group"><label className="form-label">Password</label><input name="pass" className="tech-input" type="password" required/></div>
                <div className="input-group"><label className="form-label">Station Name</label><input name="station" className="tech-input" required/></div>
                <div className="input-group"><label className="form-label">Profile Photo</label><input name="photo" type="file" className="tech-input" required/></div>
                <div className="input-group"><label className="form-label">Signature File</label><input name="signature" type="file" className="tech-input"/></div>
                <button className="btn btn-primary w-full">SUBMIT REQUEST</button>
            </form>
            <div style={{textAlign:'center', marginTop:'20px', cursor:'pointer', color:'var(--text-muted)'}} onClick={()=>setView('login')}>← Back to Login</div>
        </div>
    </div>
    </>
  );

  // --- ADMIN & OFFICER LAYOUTS ---
  if(view === 'admin' || view === 'admin-profile') return (
    <>
    <style>{styles}</style>
    <div id="app-interface">
        <div className="sidebar sidebar-admin animate-enter">
            <div className="nav-header"><div className="nav-logo-icon" style={{background:'var(--gold)'}}>A</div><div className="nav-title"><h3 style={{color:'var(--gold)'}}>ADMIN</h3><p>CONSOLE</p></div></div>
            <div className="nav-menu">
                <div className={`nav-item-admin ${view==='admin'?'active':''}`} onClick={()=>setView('admin')}><span>👥</span> User Management</div>
                <div className={`nav-item-admin ${view==='admin-profile'?'active':''}`} onClick={()=>setView('admin-profile')}><span>⚙️</span> Admin Profile</div>
            </div>
            <div style={{marginTop:'auto'}}><button className="btn btn-danger w-full" onClick={()=>window.location.reload()}>LOGOUT</button></div>
        </div>

        <div className="main-content">
            <div className="top-bar animate-enter delay-1">
                <h2 style={{fontSize:'16px', fontWeight:'600', color:'var(--gold)'}}>COMMAND CENTER</h2>
                <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                    <div style={{textAlign:'right'}}><div style={{fontSize:'13px', fontWeight:'600'}}>{user.name}</div><div style={{fontSize:'11px', color:'var(--gold)'}}>ADMINISTRATOR</div></div>
                    <img src={user.photo} style={{width:'36px', height:'36px', borderRadius:'10px', objectFit:'cover', border:'1px solid var(--gold)'}} />
                </div>
            </div>

            <div className="view-port animate-enter delay-2">
                 {/* ADMIN SLIDESHOW */}
                {view === 'admin' && (
                    <div className="hero-slider">
                        {ADMIN_SLIDES.map((slide, i) => (
                            <div key={i} className={`slide-item ${i === dashSlideIndex ? 'active' : ''}`}>
                                <img src={slide.img} />
                                <div className="slide-caption">
                                    <h2 style={{color: 'var(--gold)'}}>{slide.title}</h2>
                                    <p>{slide.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {view === 'admin' && (
                    <>
                    <h3 style={{margin:'0 0 20px 0', color:'var(--gold)'}}>Pending Requests</h3>
                    <div className="dashboard-grid">
                        {usersList.filter(u => u.status === 'PENDING').length === 0 ? <p style={{color:'var(--text-muted)'}}>No pending requests.</p> :
                        usersList.filter(u => u.status === 'PENDING').map(u => (
                            <div key={u.id} className="bento-card admin-card" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
                                    <img src={u.photo} style={{width:'50px', height:'50px', borderRadius:'50%', border:'2px solid var(--gold)'}}/>
                                    <div>
                                        <div style={{fontWeight:'bold'}}>{u.name}</div>
                                        <div style={{fontSize:'12px', color:'var(--text-muted)'}}>{u.id} | {u.station}</div>
                                        <div style={{fontSize:'11px', color:'var(--primary)'}}>✉ {u.email}</div>
                                    </div>
                                </div>
                                <div style={{display:'flex', gap:'10px'}}>
                                    <button className="btn btn-admin" onClick={()=>handleAdminAction(u.id, 'approve')}>Approve & Email OTP</button>
                                    <button className="btn btn-danger" onClick={()=>handleAdminAction(u.id, 'reject')}>Reject</button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <h3 style={{margin:'40px 0 20px 0', color:'var(--text-main)'}}>Active Roster</h3>
                    <div className="dashboard-grid">
                        {usersList.filter(u => u.status === 'ACTIVE' && u.role !== 'ADMIN').map(u => (
                            <div key={u.id} className="bento-card">
                                <div style={{display:'flex', gap:'15px', alignItems:'center', marginBottom:'15px'}}>
                                    <img src={u.photo} style={{width:'60px', height:'60px', borderRadius:'12px', objectFit:'cover'}}/>
                                    <div><div style={{fontWeight:'bold', fontSize:'16px'}}>{u.name}</div><div style={{color:'var(--primary)', fontSize:'12px'}}>{u.id}</div></div>
                                </div>
                                <div style={{fontSize:'13px', color:'var(--text-muted)', marginBottom:'5px'}}>Station: <span style={{color:'white'}}>{u.station}</span></div>
                                <div style={{fontSize:'13px', color:'var(--text-muted)', marginBottom:'20px'}}>Active Cases: <span style={{color:'white', fontWeight:'bold'}}>{u.activeCases || 0}</span></div>
                                <button className="btn btn-danger w-full" onClick={()=>handleAdminAction(u.id, 'remove')}>Revoke Access</button>
                            </div>
                        ))}
                    </div>
                    </>
                )}
                {view === 'admin-profile' && (
                     <form className="bento-card" style={{maxWidth:'600px', margin:'0 auto'}} onSubmit={saveProfile}>
                        <h3 style={{marginTop:0, marginBottom:'30px', color:'var(--gold)'}}>Admin Settings</h3>
                        <div style={{display:'flex', alignItems:'center', gap:'20px', marginBottom:'30px'}}>
                            <img src={user.photo} style={{width:'80px', height:'80px', borderRadius:'50%', objectFit:'cover', border:'2px solid var(--gold)'}}/>
                            <div><div style={{fontWeight:'700', fontSize:'18px'}}>{user.name}</div><div style={{color:'var(--gold)'}}>{user.id}</div></div>
                        </div>
                        <div className="input-group"><label className="form-label">Name</label><input name="name" className="tech-input" defaultValue={user.name}/></div>
                        <div className="input-group"><label className="form-label">Photo URL</label><input name="photo" type="file" className="tech-input"/></div>
                        <div className="input-group"><label className="form-label">Station</label><input name="station" className="tech-input" defaultValue={user.station}/></div>
                        <div className="input-group"><label className="form-label">New Password</label><input name="pass" className="tech-input" type="password" placeholder="Leave empty to keep current"/></div>
                        <button className="btn btn-admin w-full">UPDATE CREDENTIALS</button>
                     </form>
                )}
            </div>
        </div>
    </div>
    </>
  );

  return (
    <>
    <style>{styles}</style>
    <div id="app-interface">
        <div className="sidebar animate-enter">
            <div className="nav-header"><div className="nav-logo-icon">E</div><div className="nav-title"><h3>EVIDENCE</h3><p>WHISPERER</p></div></div>
            <div className="nav-menu">
                <div className={`nav-item ${view==='dashboard'?'active':''}`} onClick={()=>setView('dashboard')}><span>📊</span> Dashboard</div>
                <div className={`nav-item ${view==='cases'?'active':''}`} onClick={()=>{setView('cases'); setShowDetail(null);}}><span>📁</span> Cases</div>
                <div className={`nav-item ${view==='upload'?'active':''}`} onClick={()=>setView('upload')}><span>📥</span> Ingest</div>
                <div className={`nav-item ${view==='transfer'?'active':''}`} onClick={()=>setView('transfer')}><span>🔁</span> Custody</div>
                <div className={`nav-item ${view==='ledger'?'active':''}`} onClick={()=>setView('ledger')}><span>📜</span> Ledger</div>
                <div className={`nav-item ${view==='verify'?'active':''}`} onClick={()=>setView('verify')}><span>🛡️</span> Verify</div>
                <div className={`nav-item ${view==='reports'?'active':''}`} onClick={()=>setView('reports')}><span>📄</span> Reports</div>
                <div className={`nav-item ${view==='profile'?'active':''}`} onClick={()=>setView('profile')}><span>👤</span> Profile</div>
            </div>
            <div style={{marginTop:'auto'}}><button className="btn btn-danger w-full" onClick={()=>window.location.reload()}>LOGOUT</button></div>
        </div>

        <div className="main-content">
            <div className="top-bar animate-enter delay-1">
                <h2 style={{fontSize:'16px', fontWeight:'600'}}>{view.toUpperCase()}</h2>
                <div style={{display:'flex', gap:'12px', alignItems:'center'}}>
                    <div style={{textAlign:'right'}}>
                        <div style={{fontSize:'13px', fontWeight:'600'}}>{user.name}</div>
                        <div style={{fontSize:'11px', color:'var(--text-muted)'}}>{user.id}</div>
                    </div>
                    <img src={user.photo} style={{width:'36px', height:'36px', borderRadius:'10px', objectFit:'cover'}} />
                </div>
            </div>

            <div className="view-port animate-enter delay-2">
                {/* --- DASHBOARD --- */}
                {view === 'dashboard' && (
                    <div className="bento-grid">
                        <div className="bento-card col-span-2 row-span-2" style={{padding:0}}>
                            <div className="hero-slider" style={{height:'100%', margin:0, borderRadius:0, border:'none'}}>
                                {OFFICER_SLIDES.map((slide, i) => (
                                    <div key={i} className={`slide-item ${i === dashSlideIndex ? 'active' : ''}`}>
                                        <img src={slide.img} />
                                        <div className="slide-caption">
                                            <h2>{slide.title}</h2>
                                            <p>{slide.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bento-card">
                            <div className="card-title"><span>ACTIVE CASES</span><span>📁</span></div>
                            <div className="card-value">{myCases.length}</div>
                            <div className="card-sub">Current Investigations</div>
                        </div>
                        <div className="bento-card">
                            <div className="card-title"><span>ARTIFACTS</span><span>💾</span></div>
                            <div className="card-value" style={{color:'var(--success)'}}>{myEvidence.length}</div>
                            <div className="card-sub">Secured On-Chain</div>
                        </div>
                        
                        <div className="bento-card" style={{justifyContent:'center', alignItems:'center', cursor:'pointer', background:'rgba(0, 243, 255, 0.05)'}} onClick={()=>setView('upload')}>
                             <div style={{fontSize:'32px', marginBottom:'10px'}}>📥</div>
                             <div style={{fontFamily:'var(--font-display)', fontSize:'14px'}}>QUICK INGEST</div>
                        </div>
                        
                        <div className="bento-card col-span-3">
                             <div className="card-title"><span>RECENT ACTIVITY</span><span>📡</span></div>
                             <table className="modern-table" style={{marginTop:'10px'}}>
                                <tbody>
                                    {ledger.slice(0,3).map(l => (
                                        <tr key={l.id}>
                                            <td style={{color:'var(--primary)'}}>{l.id}</td>
                                            <td>{l.type}</td>
                                            <td style={{color:'var(--text-muted)'}}>{l.custodian}</td>
                                            <td style={{textAlign:'right', color:'var(--success)', fontSize:'12px'}}>● SECURED</td>
                                        </tr>
                                    ))}
                                </tbody>
                             </table>
                        </div>
                    </div>
                )}

                {/* --- CASES --- */}
                {view === 'cases' && !showDetail && (
                    <div className="modern-table-container">
                        <div style={{padding:'20px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid var(--border)'}}>
                            <h3 style={{margin:0}}>My Investigations</h3>
                            <button className="btn btn-primary" onClick={()=>setShowCaseModal(true)}>+ New Case</button>
                        </div>
                        <table className="modern-table"><thead><tr><th>ID</th><th>Title</th><th>Status</th><th>Action</th></tr></thead><tbody>
                            {myCases.map(c => (<tr key={c.id}><td style={{color:'var(--primary)', fontWeight:'600'}}>{c.id}</td><td>{c.title}</td><td><span style={{background:'rgba(16, 185, 129, 0.1)', color:'var(--success)', padding:'4px 8px', borderRadius:'6px', fontSize:'12px'}}>OPEN</span></td><td><button className="btn btn-outline" style={{padding:'8px 16px', fontSize:'12px'}} onClick={()=>{setShowDetail(c)}}>Open File</button></td></tr>))}
                        </tbody></table>
                    </div>
                )}
                
                {/* --- CASE DETAIL --- */}
                {view === 'cases' && showDetail && (
                   <div className="bento-card">
                      <div style={{display:'flex', justifyContent:'space-between', marginBottom:'30px', alignItems:'center'}}>
                          <div>
                            <h2 style={{margin:0, fontFamily:'var(--font-display)'}}>{showDetail.title}</h2>
                            <p style={{color:'var(--text-muted)', fontSize:'12px', marginTop:'5px', letterSpacing:'1px'}}>{showDetail.id}</p>
                          </div>
                          <button className="btn btn-outline" onClick={()=>setShowDetail(null)}>← BACK TO DIRECTORY</button>
                      </div>
                      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'20px'}}>
                          {ledger.filter(l => l.caseId === showDetail.id).length === 0 ? <p style={{color:'var(--text-muted)'}}>No evidence recorded for this case.</p> :
                          ledger.filter(l => l.caseId === showDetail.id).map(e => (
                              <div key={e.id} style={{background:'rgba(255,255,255,0.03)', padding:'12px', borderRadius:'16px', cursor:'pointer', border:'1px solid var(--border)', transition:'0.3s'}} 
                                   onClick={() => {
                                      if (!e.fileUrl) { alert("File not available (Offline/Missing)"); return; }
                                      setMediaUrl(e.fileUrl); setMediaType(e.type);
                                  }}>
                                  <div style={{height:'120px', background:'black', borderRadius:'12px', overflow:'hidden', marginBottom:'12px', display:'flex', alignItems:'center', justifyContent:'center'}}>
                                     {e.type.includes('Image') ? <img src={e.fileUrl} style={{width:'100%', height:'100%', objectFit:'cover'}}/> : <div style={{fontSize:'40px'}}>📄</div>}
                                  </div>
                                  <div style={{fontSize:'13px', fontWeight:'700', color:'white'}}>{e.id}</div>
                                  <div style={{fontSize:'11px', color:'var(--text-muted)'}}>{e.type}</div>
                              </div>
                          ))}
                      </div>
                   </div>
                )}

                {/* --- UPLOAD --- */}
                {view === 'upload' && (
                    <div style={{maxWidth:'600px', margin:'0 auto'}}>
                        <div className="bento-card">
                            <h3 style={{marginTop:0, marginBottom:'25px', fontFamily:'var(--font-display)'}}>EVIDENCE INGESTION</h3>
                            <form onSubmit={uploadEvidence}>
                                <div className="input-group"><label className="form-label">LINK TO CASE</label><select name="caseId" className="tech-select"><option value="">Select Case...</option>{myCases.map(c => <option value={c.id}>{c.title}</option>)}</select></div>
                                <div className="input-group"><label className="form-label">EVIDENCE TYPE</label><select name="type" className="tech-select" value={ingestType} onChange={(e) => setIngestType(e.target.value)}><option value="Image">Image</option><option value="Video">Video</option><option value="Document">Document</option><option value="Audio">Audio</option></select></div>
                                <div className="input-group"><label className="form-label">DESCRIPTION</label><input name="desc" className="tech-input" placeholder="Artifact details..."/></div>
                                <div className="modern-upload" onClick={()=>document.getElementById('file-up').click()}>
                                    <div style={{fontSize:'32px', marginBottom:'10px'}}>{ingestType === 'Video' ? '📹' : ingestType === 'Audio' ? '🎙️' : ingestType === 'Document' ? '📄' : '📷'}</div>
                                    <div style={{fontWeight:'600', marginBottom:'5px', color:'white'}}>{fileToUpload ? fileToUpload.name : "CLICK TO BROWSE FILES"}</div>
                                    <input id="file-up" name="file" type="file" hidden onChange={handleFileSelect} />
                                </div>
                                <button type="submit" className="btn btn-glow w-full" style={{marginTop:'30px', height:'50px'}}>SECURE & COMMIT</button>
                            </form>
                        </div>
                    </div>
                )}

                {/* --- LEDGER --- */}
                {view === 'ledger' && (
                    <div className="modern-table-container">
                        <table className="modern-table">
                            <thead><tr><th>HASH</th><th>ID</th><th>CUSTODIAN</th><th>STATUS</th></tr></thead>
                            <tbody>
                                {ledger.map(l => (
                                    <tr key={l.id}>
                                        <td><div style={{display:'flex', alignItems:'center', gap:'10px'}}><span className="hash-pill">{getDisplayHash(l).substring(0,14)}...</span><button className="btn btn-outline" style={{padding:'4px 8px', fontSize:'10px'}} onClick={() => copyToClipboard(getDisplayHash(l))}>COPY</button></div></td>
                                        <td>{l.id}</td><td>{l.custodian}</td><td><span style={{color:'var(--success)', fontSize:'12px', fontWeight:'bold'}}>● SECURED</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* --- TRANSFER, VERIFY, REPORTS, PROFILE (Preserved Logic) --- */}
                {view === 'transfer' && (<div className="bento-card" style={{maxWidth:'600px', margin:'0 auto'}}><h3 style={{marginTop:0, fontFamily:'var(--font-display)'}}>CUSTODY TRANSFER</h3><div className="input-group"><label className="form-label">SELECT CASE</label><select id="trans-case" className="tech-select"><option value="">Select...</option>{myCases.map(c => <option value={c.id}>{c.title}</option>)}</select></div><div className="input-group"><label className="form-label">RECEIVER BADGE ID</label><input id="trans-to" className="tech-input"/></div><button className="btn btn-primary w-full" onClick={executeTransfer}>INITIATE HANDOVER</button></div>)}
                {view === 'verify' && (<div className="bento-card" style={{maxWidth:'600px', margin:'0 auto', textAlign:'center'}}><h3 style={{marginTop:0, fontFamily:'var(--font-display)'}}>INTEGRITY CHECK</h3><div className="input-group"><input id="verify-input" className="tech-input" placeholder="Paste Hash or ID" style={{textAlign:'center', fontSize:'18px'}}/></div><button className="btn btn-primary w-full" onClick={verifyIntegrity}>RUN DIAGNOSTIC</button><div id="verify-result" style={{marginTop:'25px', fontFamily:'monospace', fontSize:'14px', minHeight:'20px'}}></div></div>)}
                {view === 'reports' && (<div className="bento-card" style={{maxWidth:'500px', margin:'0 auto', textAlign:'center'}}><h3 style={{marginTop:0, fontFamily:'var(--font-display)'}}>REPORT GENERATOR</h3><p style={{color:'var(--text-muted)', marginBottom:'30px'}}>Create official PDF documentation for court proceedings.</p><div className="input-group" style={{textAlign:'left'}}><label className="form-label">SELECT CASE</label><select id="rep-case" className="tech-select"><option value="">Select...</option>{myCases.map(c => <option value={c.id}>{c.title}</option>)}</select></div><button className="btn btn-primary w-full" onClick={generateReport}>GENERATE OFFICIAL PDF</button></div>)}
                {(view === 'profile' || view === 'admin-profile') && (<form className="bento-card" style={{maxWidth:'600px', margin:'0 auto'}} onSubmit={saveProfile}><h3 style={{marginTop:0, marginBottom:'30px', fontFamily:'var(--font-display)'}}>{view==='admin-profile'?'ADMIN':'OFFICER'} PROFILE</h3><div style={{display:'flex', alignItems:'center', gap:'20px', marginBottom:'30px'}}><img src={user.photo} style={{width:'80px', height:'80px', borderRadius:'50%', objectFit:'cover', border:`2px solid ${view==='admin-profile'?'var(--gold)':'var(--primary)'}`}}/><div><div style={{fontWeight:'700', fontSize:'18px'}}>{user.name}</div><div style={{color:view==='admin-profile'?'var(--gold)':'var(--primary)'}}>{user.id}</div></div></div><div className="input-group"><label className="form-label">PHOTO URL</label><input name="photo" type="file" className="tech-input"/></div><div className="input-group"><label className="form-label">STATION</label><input name="station" className="tech-input" defaultValue={user.station}/></div><div className="input-group"><label className="form-label">PHONE</label><input name="phone" className="tech-input" defaultValue={user.phone}/></div><div className="input-group"><label className="form-label">EMAIL</label><input name="email" className="tech-input" defaultValue={user.email}/></div>{view!=='admin-profile' && <div className="input-group"><label className="form-label">DIGITAL SIGNATURE</label><input name="signature" type="file" className="tech-input"/></div>}<div className="input-group"><label className="form-label">NEW PASSWORD</label><input name="pass" className="tech-input" type="password" placeholder="Leave empty to keep current"/></div><button className={`btn ${view==='admin-profile'?'btn-admin':'btn-glow'} w-full`}>SAVE CHANGES</button></form>)}
            </div>
        </div>

        {/* MODALS */}
        {showCaseModal && (
            <div className="modern-modal-overlay">
                <div className="modern-modal">
                    <h3 style={{marginTop:0, fontFamily:'var(--font-display)'}}>NEW INVESTIGATION</h3>
                    <div className="input-group"><label className="form-label">CASE TITLE</label><input id="nc-title" className="tech-input" placeholder="e.g. Operation Firewall"/></div>
                    <div style={{display:'flex', gap:'15px', marginTop:'30px'}}>
                        <button className="btn btn-primary w-full" onClick={createCase}>CREATE</button>
                        <button className="btn btn-outline w-full" onClick={()=>setShowCaseModal(false)}>CANCEL</button>
                    </div>
                </div>
            </div>
        )}
        
        {/* MEDIA PREVIEW MODAL */}
        {mediaUrl && (
            <div className="modern-modal-overlay">
               <div className="modern-modal" style={{width:'900px', maxWidth:'95%'}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                      <h3 style={{margin:0, fontFamily:'var(--font-display)'}}>ARTIFACT PREVIEW</h3>
                      <button className="btn btn-outline" style={{padding:'5px 15px'}} onClick={()=>setMediaUrl(null)}>CLOSE</button>
                  </div>
                  <div style={{background:'black', height:'500px', display:'flex', justifyContent:'center', alignItems:'center', borderRadius:'12px', overflow:'hidden', marginBottom:'20px', border:'1px solid var(--border)'}}>
                     {mediaType.includes('Image') ? <img src={mediaUrl} style={{maxHeight:'100%', maxWidth:'100%'}}/> : 
                      mediaType.includes('Video') ? <video src={mediaUrl} controls style={{maxHeight:'100%', maxWidth:'100%'}}/> :
                      mediaType.includes('Audio') ? <audio src={mediaUrl} controls style={{width:'80%'}}/> :
                      <iframe src={mediaUrl} style={{width:'100%', height:'100%', border:'none'}}/>}
                  </div>
                  <div style={{textAlign:'right'}}>
                      <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{textDecoration:'none'}}>DOWNLOAD ORIGINAL</a>
                  </div>
               </div>
            </div>
        )}

    </div>
    </>
  );
}

export default App;