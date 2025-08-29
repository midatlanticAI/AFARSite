(function(){
  const API = (window.TRIAGE_API || 'http://127.0.0.1:8000');
  const BRAND = (window.TRIAGE_BRAND || 'All Fixed Appliance Repair');
  const THEME = (window.TRIAGE_THEME || {primary:'#A10041', secondary:'#8B0037'});

  let sessionId = null;
  let root = null;

  function createEl(tag, cls){ const el=document.createElement(tag); if(cls) el.className=cls; return el; }

  async function ensureSession(){
    if(sessionId) return sessionId;
    const res = await fetch(`${API}/api/v1/chat/sessions`, {method:'POST', headers:{'Content-Type':'application/json','Idempotency-Key':crypto.randomUUID()}, body: JSON.stringify({ source:'triage' })});
    const data = await res.json();
    sessionId = data.session_id; return sessionId;
  }

  async function sendMessage(text){
    await ensureSession();
    const res = await fetch(`${API}/api/v1/chat/messages`, {method:'POST', headers:{'Content-Type':'application/json','Idempotency-Key':crypto.randomUUID()}, body: JSON.stringify({ session_id: sessionId, text })});
    return await res.json();
  }

  function addBubble(container, text, user){
    const b=createEl('div', 'triage-bubble'+(user?' user':'')); b.textContent=text; container.appendChild(b); container.scrollTop=container.scrollHeight; }

  function open(){ if(root) { root.style.display='flex'; return; } mount(); }
  function embed(container){
    if(!container) return; if(!root) mount();
    // Presentation tweaks to match site aesthetics
    root.style.position='static';
    root.style.inset='';
    root.style.background='transparent';
    const header = root.querySelector('.triage-header');
    header.style.display='none';
    const body = root.querySelector('.triage-body');
    body.style.border='1px solid rgba(255,255,255,0.2)';
    body.style.borderRadius='16px';
    body.style.boxShadow='0 10px 30px rgba(0,0,0,0.25)';
    body.style.height='520px';
    const msgs = root.querySelector('.triage-messages');
    msgs.style.background='linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.06))';
    const input = root.querySelector('.triage-input');
    input.style.background='rgba(255,255,255,0.85)';
    container.appendChild(root);
  }
  function close(){ if(root) root.style.display='none'; }

  function mount(){
    root=createEl('div','triage-widget');
    const header=createEl('div','triage-header'); header.textContent=`${BRAND} — Triage Center`;
    const closeBtn=createEl('span','triage-close'); closeBtn.textContent='✖'; closeBtn.title='Close'; header.appendChild(closeBtn);
    const body=createEl('div','triage-body');
    const msgs=createEl('div','triage-messages');
    const inputWrap=createEl('div','triage-input');
    const input=createEl('input'); input.type='text'; input.placeholder='Describe your appliance issue…';
    const send=createEl('button'); send.textContent='Send';
    inputWrap.appendChild(input); inputWrap.appendChild(send);
    body.appendChild(msgs); body.appendChild(inputWrap);
    root.appendChild(header); root.appendChild(body);
    document.body.appendChild(root);

    function handleSend(){ const txt=input.value.trim(); if(!txt) return; addBubble(msgs, txt, true); input.value=''; sendMessage(txt).then(r=>{ const m=(r&&r.messages&&r.messages[0]&&r.messages[0].text)||'Thanks. A specialist will follow up shortly.'; addBubble(msgs, m, false); }).catch(()=>addBubble(msgs,'Temporarily unavailable. Please call or book online.', false)); }

    send.addEventListener('click', handleSend);
    // Submit only on Enter without Shift, allow regular spaces and typing
    input.addEventListener('keydown', e=>{
      if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleSend(); }
    });
    closeBtn.addEventListener('click', close);

    // greet
    addBubble(msgs, 'Hi! I can triage appliance issues and help you book service. What appliance and problem are you having?', false);

    // inline styles
    const style=document.createElement('style'); style.textContent = `
      .triage-widget{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.5);z-index:2000}
      .triage-header{background:linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary});color:#fff;padding:10px 12px;font-weight:700;display:flex;align-items:center;justify-content:space-between}
      .triage-close{cursor:pointer}
      .triage-body{background:#fff;width:720px;max-width:92vw;height:70vh;display:flex;flex-direction:column;border-radius:16px}
      .triage-messages{flex:1;padding:16px;overflow:auto;background:#fafafa;border-top-left-radius:16px;border-top-right-radius:16px}
      .triage-input{display:flex;gap:8px;border-top:1px solid #eee;padding:10px}
      .triage-input input{flex:1;padding:10px;border:1px solid #ddd;border-radius:6px}
      .triage-input button{background:${THEME.primary};color:#fff;border:none;border-radius:6px;padding:0 16px;font-weight:600;cursor:pointer}
      .triage-bubble{background:#ffffff;border:1px solid rgba(0,0,0,0.06);border-radius:10px;padding:10px 12px;margin:8px 0;max-width:80%;box-shadow:0 2px 8px rgba(0,0,0,0.05)}
      .triage-bubble.user{margin-left:auto;background:${THEME.primary};border:none;color:#fff}
    `; document.head.appendChild(style);
  }

  window.TriageWidget = { open, close, embed };
})();


