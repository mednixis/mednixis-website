/* ══ NAV + REVEAL (multi-page) ═════════ */
function reveal(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rvs=document.querySelectorAll('.rv');
  if(reduce){rvs.forEach(function(e){e.classList.add('in');});return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},
    {threshold:.08,rootMargin:'0px 0px -5% 0px'});
  rvs.forEach(function(e,i){e.style.transitionDelay=(Math.min(i,3)*60)+'ms';io.observe(e);});
}
function markActive(){
  var page=document.body.getAttribute('data-page');
  var TABMAP={home:'home',about:'about',divisions:'divisions',clinic:'clinic',
    difference:'difference',work:'work',insights:'insights',
    'article-1':'insights','article-2':'insights','article-3':'insights',
    assessment:'assessment',contact:null};
  var active=TABMAP[page];
  document.querySelectorAll('[data-page]').forEach(function(a){
    a.classList.toggle('on',a.getAttribute('data-page')===active);
  });
}

var REDUCE=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var INK='#15171A',HL='rgba(242,241,237,.16)',TXT='rgba(242,241,237,.75)',
    MUT='rgba(242,241,237,.42)',OX='#B4585C';
function mono(x,s,c){x.font=s+'px "IBM Plex Mono",monospace';x.fillStyle=c;}
function grid(x,W,H){x.fillStyle=INK;x.fillRect(0,0,W,H);x.strokeStyle='rgba(242,241,237,.05)';
  for(var g=0;g<W;g+=32){x.beginPath();x.moveTo(g+.5,0);x.lineTo(g+.5,H);x.stroke();}}
function run(c,fn,off){var x=c.getContext('2d'),t=off||0,last=performance.now();
  function loop(now){var dt=Math.min((now-last)/1000,.05);last=now;t+=dt;fn(x,t);requestAnimationFrame(loop);}
  if(REDUCE){fn(x,(off||0)+3);}else requestAnimationFrame(loop);}
function person(x,cx,cy,s,col){x.fillStyle=col;
  x.beginPath();x.arc(cx,cy-s*.62,s*.31,0,6.3);x.fill();
  x.beginPath();x.arc(cx,cy+s*.62,s*.5,Math.PI,Math.PI*2);x.closePath();x.fill();}
function doctor(x,cx,cy,s,col){person(x,cx,cy,s,col);
  x.strokeStyle=INK;x.lineWidth=1.6;x.beginPath();x.moveTo(cx,cy+s*.16);x.lineTo(cx,cy+s*.62);x.stroke();}

/* ══ PAGE INITS ══════════════════════════ */
function init(name){
  if(name==='home'){ initTicker(); initScope(); initStatement(); initNavigator(); }
  if(name==='difference'){ initCards(); }
  if(name==='clinic'){ initTour(); initClinicLinks(); }
  if(name==='assessment'){ initAssessment(); }
  if(name==='contact'){ initForm(); }
}

/* ══ CONFIG ══════════════════════════════
   Demo destinations, taken from the live site.
   Both are Mednixis-hosted sample-data environments —
   never point these at a live clinic admin.          */
var DEMO_BACKEND = 'https://mednixis.com/demo.html';
var DEMO_SITE    = 'https://drmagedragab.com';
var LIVE_SITE    = 'https://drmagedragab.com';
/* FormSubmit endpoint — activate once by submitting
   the form and confirming the email it sends you.    */
/* FormSubmit — native POST everywhere, so emails arrive as the
   branded table. Activate once by submitting the contact form
   and clicking the confirmation email FormSubmit sends you.   */
var FORM_TARGET = 'https://formsubmit.co/contact@mednixis.com';

/* Assessment leads → Mednixis Command Center (Supabase).
   Paste the PUBLISHABLE key below (Settings → API Keys →
   Publishable key → copy). It starts with sb_publishable_
   Never use the secret key here — it bypasses RLS.          */
var LEAD_SUPABASE_URL = 'https://lblmaumusgovxciuyzbm.supabase.co';
var LEAD_SUPABASE_KEY = 'sb_publishable_aRP6R1XUsIv7AgUun4EsCA_hd8xmLz8';
var LEAD_TABLE        = 'website_leads';

/* Serverless route for the navigator + written reading —
   see AI_ENDPOINT below. Deploy /api/claude.js. */
/* Server-side Claude proxy. Falls back to written copy if unavailable. */
var AI_ENDPOINT   = '/api/claude';

function initClinicLinks(){
  var b=document.getElementById('demoBackend'), s=document.getElementById('demoSite');
  if(b){ if(DEMO_BACKEND){ b.href=DEMO_BACKEND; } else { b.classList.add('off'); b.removeAttribute('target');
    b.querySelector('.go').textContent='Demo link not yet configured'; } }
  if(s){ if(DEMO_SITE){ s.href=DEMO_SITE; } else { s.classList.add('off'); s.removeAttribute('target'); } }
}

function initForm(){
  /* thank-you state after FormSubmit redirects back */
  if(/[?&]sent=1/.test(location.search)){
    var f=document.getElementById('cform'), s=document.getElementById('csent');
    if(f) f.style.display='none';
    if(s) s.style.display='block';
    var np=document.querySelector('.no-pricing'); if(np) np.style.display='none';
    return;
  }
  var form=document.getElementById('cform'); if(!form||form.dataset.on) return;
  form.dataset.on='1';
  var msg=document.getElementById('fmsg');
  form.addEventListener('submit',function(e){
    var bad=false;
    [['Full_Name',2],['Email',0]].forEach(function(p){
      var el=form.elements[p[0]], val=el.value.trim(), ok;
      ok = p[0]==='Email' ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) : val.length>p[1];
      el.classList.toggle('bad',!ok); if(!ok) bad=true;
    });
    if(bad){ e.preventDefault(); msg.className='fmsg err';
      msg.textContent='Name and a valid email are required'; return; }
    msg.className='fmsg'; msg.textContent='Sending…';
  });
}
function initTour(){
  var TOUR=[
    {t:'Dashboard',h:'The clinic at a glance',
     p:'One screen that tells the owner exactly how the practice is performing — today, this week, this month.',
     l:['Daily bookings, revenue and patient flow','Upcoming surgeries and follow-ups','Clinic-by-clinic performance comparison','Outstanding payments at a glance']},
    {t:'Bookings',h:'Multi-clinic scheduling',
     p:'Every appointment across every location in one calendar, with confirmation handled automatically.',
     l:['Online booking from the patient website','Separate schedules per clinic and per doctor','Automatic WhatsApp confirmation and reminder','Rescheduling and cancellation tracking']},
    {t:'Patients & Records',h:'Structured medical records',
     p:'Records built around how the specialty actually works, not a generic notes field.',
     l:['Case-type specific history forms','Full visit history per patient','Investigations and results attached to the record','Searchable across both clinics']},
    {t:'Surgeries',h:'The surgical pipeline',
     p:'Every case from decision through to post-operative follow-up, linked to the patient record.',
     l:['Surgery scheduling linked to patient_id','Pre-operative checklist and consent tracking','Automated post-operative follow-up sequence','Outcome notes retained on the record']},
    {t:'Payments & Reports',h:'The money, visible',
     p:'What was charged, what was collected, and what is outstanding — without a manual reconciliation.',
     l:['Payment capture per visit and per procedure','Revenue by clinic, doctor and service','Outstanding balance tracking','Exportable financial reports by period']},
    {t:'WhatsApp',h:'Patient-journey automation',
     p:'The channel Egyptian patients actually use, automated through the Meta Cloud API.',
     l:['Booking confirmation and reminders','Post-operative follow-up sequences','Recall messages for due appointments','Bilingual message templates, AR and EN']},
    {t:'Roles & Access',h:'Four roles, four views',
     p:'Everyone sees what they need and nothing they should not.',
     l:['Owner — full access and financials','Doctor — clinical records and schedule','Secretary — bookings and payments','Editor — website content only']}
  ];
  var tabs=document.getElementById('tourtabs'), panel=document.getElementById('tourpanel');
  if(!tabs||tabs.children.length) return;
  function show(i){
    Array.prototype.forEach.call(tabs.children,function(b,k){b.classList.toggle('on',k===i);});
    var d=TOUR[i];
    panel.innerHTML='<h3></h3><p></p><ul>'+d.l.map(function(){return '<li></li>';}).join('')+'</ul>';
    panel.querySelector('h3').textContent=d.h;
    panel.querySelector('p').textContent=d.p;
    Array.prototype.forEach.call(panel.querySelectorAll('li'),function(li,k){li.textContent=d.l[k];});
  }
  TOUR.forEach(function(d,i){
    var b=document.createElement('button'); b.textContent=d.t;
    b.addEventListener('click',function(){show(i);});
    tabs.appendChild(b);
  });
  show(0);
}

/* ticker */
function initTicker(){
  var items=['Healthcare Management','Branding & Marketing','Research & Strategy','Growth & Digital Systems',
    'Medical Events','The Clinic System','Feasibility Studies','Patient Journey Design',
    'Operational Systems','Market Research','Expansion Planning','Executive Reporting'];
  var tk=document.getElementById('tk'); if(!tk) return;
  var h=items.map(function(i){return '<span>'+i+'</span>';}).join(''); tk.innerHTML=h+h;
}

/* hero monitor */
function initScope(){
  var c=document.getElementById('scope'); if(!c) return;
  var x=c.getContext('2d'),W=c.width,H=c.height,N=170,data=[],t=0;
  function val(i){return .5+Math.sin(i*.075)*.16+Math.sin(i*.021+1.3)*.1+Math.sin(i*.31)*.03;}
  for(var j=0;j<N;j++)data.push(val(j));
  function draw(){
    x.fillStyle=INK;x.fillRect(0,0,W,H);
    x.strokeStyle='rgba(242,241,237,.08)';x.lineWidth=1;
    for(var gx=0;gx<W;gx+=45){x.beginPath();x.moveTo(gx+.5,0);x.lineTo(gx+.5,H);x.stroke();}
    for(var gy=0;gy<H;gy+=45){x.beginPath();x.moveTo(0,gy+.5);x.lineTo(W,gy+.5);x.stroke();}
    x.fillStyle='rgba(242,241,237,.04)';x.fillRect(0,H*.34,W,H*.3);
    x.strokeStyle='rgba(242,241,237,.2)';x.setLineDash([3,5]);
    x.beginPath();x.moveTo(0,H*.34);x.lineTo(W,H*.34);x.stroke();
    x.beginPath();x.moveTo(0,H*.64);x.lineTo(W,H*.64);x.stroke();x.setLineDash([]);
    x.beginPath();
    for(var i=0;i<N;i++){var px=(i/(N-1))*W,py=H-(data[i]*H*.82)-H*.09;i?x.lineTo(px,py):x.moveTo(px,py);}
    x.strokeStyle='rgba(242,241,237,.7)';x.lineWidth=1.4;x.stroke();
    for(var k=0;k<N;k++){var yv=H-(data[k]*H*.82)-H*.09;
      if(yv<H*.34){x.fillStyle='rgba(180,88,92,.95)';x.beginPath();x.arc((k/(N-1))*W,yv,2.6,0,6.3);x.fill();}}
    var sx=(t%N)/(N-1)*W,g=x.createLinearGradient(sx-90,0,sx,0);
    g.addColorStop(0,'rgba(110,43,47,0)');g.addColorStop(1,'rgba(110,43,47,.3)');
    x.fillStyle=g;x.fillRect(sx-90,0,90,H);
    x.strokeStyle='rgba(180,88,92,.85)';x.lineWidth=1;
    x.beginPath();x.moveTo(sx,0);x.lineTo(sx,H);x.stroke();
  }
  function tick(){t+=.55;data.shift();data.push(val(t+N));draw();if(!REDUCE)requestAnimationFrame(tick);}
  draw(); if(!REDUCE)tick();
  if(!REDUCE)setInterval(function(){
    document.getElementById('m1').textContent=(70.2+Math.random()*2.1).toFixed(1)+'%';
    document.getElementById('m2').textContent=(13.9+Math.random()*1.4).toFixed(1)+'%';
    document.getElementById('m3').textContent=(1810+Math.floor(Math.random()*70)).toLocaleString();
  },2600);
}

function initStatement(){
  var sr=document.getElementById('strule'); if(!sr) return;
  if(REDUCE){sr.classList.add('in');return;}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){sr.classList.add('in');io.disconnect();}});},{threshold:.4});
  io.observe(sr.parentElement);
}

/* ══ CARDS (difference page) ═════════════ */
function initCards(){
  var D1=[
    {bad:true,lbl:'Without a system',big:'19',of:'people seen in one day',
     p:'Rooms stand empty between patients while the waiting area fills. Eventually some people give up and walk out.',
     human:'Four of them left without being seen.'},
    {bad:false,lbl:'With Mednixis',big:'31',of:'people seen in one day',
     p:'The next person is called the moment a room is free. Same hours, same doctors, more people through the door.',
     human:'Nobody left without being seen.'}];
  var h1=document.getElementById('c1');
  D1.forEach(function(d,i){
    var el=document.createElement('div'); el.className='card'+(d.bad?' bad':'');
    el.innerHTML='<canvas width="420" height="250"></canvas><div class="body">'+
      '<div class="lbl">'+d.lbl+'</div><div class="big">'+d.big+'</div><div class="of">'+d.of+'</div>'+
      '<p>'+d.p+'</p><div class="human">'+d.human+'</div></div>';
    h1.appendChild(el);
    run(el.querySelector('canvas'),function(x,t){
      var W=420,H=250;grid(x,W,H);var p=(t%6)/6;
      mono(x,9.5,MUT);x.fillText('CONSULTATION ROOMS',30,20);
      for(var r=0;r<3;r++){
        var rx=30+r*126,ry=30,rw=108,rh=88;
        var busy=d.bad?(((p*3+r*.37)%1)<.40):(((p*3+r*.3)%1)<.90);
        x.fillStyle=busy?'rgba(242,241,237,.08)':'rgba(110,43,47,.18)';x.fillRect(rx,ry,rw,rh);
        x.strokeStyle=busy?'rgba(242,241,237,.45)':OX;x.lineWidth=1;x.strokeRect(rx+.5,ry+.5,rw,rh);
        if(busy){doctor(x,rx+34,ry+50,21,'rgba(242,241,237,.9)');person(x,rx+72,ry+52,19,'rgba(242,241,237,.62)');}
        else{x.strokeStyle='rgba(180,88,92,.65)';x.lineWidth=1.4;x.strokeRect(rx+44.5,ry+42.5,20,18);
          x.beginPath();x.moveTo(rx+44,ry+62);x.lineTo(rx+44,ry+70);x.moveTo(rx+64,ry+62);x.lineTo(rx+64,ry+70);x.stroke();
          mono(x,9.5,OX);x.textAlign='center';x.fillText('EMPTY',rx+rw/2,ry+82);x.textAlign='left';}
      }
      mono(x,9.5,MUT);x.fillText('WAITING',30,152);
      x.strokeStyle=HL;x.beginPath();x.moveTo(24,196.5);x.lineTo(W-24,196.5);x.stroke();
      x.beginPath();x.moveTo(24,234.5);x.lineTo(W-24,234.5);x.stroke();
      var n=d.bad?10+Math.round(Math.sin(p*6.3)*2+2):2;
      for(var q=0;q<n;q++){var row=Math.floor(q/7),qx=44+(q%7)*54,qy=182+row*38;
        person(x,qx,qy,20,(d.bad&&q>5)?'rgba(180,88,92,.9)':'rgba(242,241,237,.85)');}
      if(d.bad){mono(x,9.5,OX);x.fillText('WAITING TOO LONG',W-152,152);}
    },i*1.4);
  });

  var D2=[
    {bad:true,lbl:'Most clinics today',keep:12,big:'12',of:'out of 100 come back',
     p:'Calls go unanswered, appointments are never confirmed, and nobody follows up after the first visit.',
     human:'Eighty-eight people needed care and went somewhere else.'},
    {bad:false,lbl:'With a growth system',keep:38,big:'38',of:'out of 100 come back',
     p:'Every enquiry is answered and recorded, appointments are confirmed, and patients are recalled on time.',
     human:'Three times as many stay with you.'}];
  var h2=document.getElementById('c2');
  D2.forEach(function(d,i){
    var el=document.createElement('div'); el.className='card'+(d.bad?' bad':'');
    el.innerHTML='<canvas width="420" height="250"></canvas><div class="body">'+
      '<div class="lbl">'+d.lbl+'</div><div class="big">'+d.big+'</div><div class="of">'+d.of+'</div>'+
      '<p>'+d.p+'</p><div class="human">'+d.human+'</div></div>';
    h2.appendChild(el);
    run(el.querySelector('canvas'),function(x,t){
      var W=420,H=250;grid(x,W,H);var p=Math.min((t%8)/5,1);
      var cols=10,cw=36,chh=21,ox=(W-cols*cw)/2+cw/2,oy=54;
      mono(x,9.5,MUT);x.fillText('100 PEOPLE CONTACT YOUR CLINIC',30,26);
      for(var k=0;k<100;k++){
        var cx=ox+(k%cols)*cw,cy=oy+Math.floor(k/cols)*chh;
        var kept=k<d.keep, gone=kept?0:Math.min(Math.max((p-.12-(k/100)*.6)/.28,0),1);
        person(x,cx,cy+gone*7,13,kept?'rgba(242,241,237,.92)':'rgba(180,88,92,'+(0.92-0.72*gone)+')');
      }
      if(p>.85){mono(x,10,d.bad?OX:'rgba(242,241,237,.8)');x.fillText(d.keep+' STILL WITH YOU',30,H-16);}
    },i*.9);
  });

  var STEPS=[
    {n:'01',t:'We look',w:'Days 1–5',p:'We go through your appointment book, your cases, the staff rota and the money coming in. Nothing changes yet.'},
    {n:'02',t:'We write it down',w:'Days 6–9',p:'Every number on one page, and you sign it. If a figure looks wrong to you, we fix it before going further.'},
    {n:'03',t:'We find the problem',w:'Days 10–12',p:'The three things costing you the most, in order. It is usually not the one you expected.'},
    {n:'04',t:'We fix it',w:'Days 13–14',p:'A plan with names and dates, and a date to check the same numbers again in three months.'}];
  var h3=document.getElementById('c3');
  STEPS.forEach(function(s,i){
    var d=document.createElement('div'); d.className='card';
    d.innerHTML='<canvas width="380" height="200"></canvas><div class="body"><div class="n">'+s.n+
      '</div><h3>'+s.t+'</h3><p>'+s.p+'</p><span class="when">'+s.w+'</span></div>';
    h3.appendChild(d);
    run(d.querySelector('canvas'),function(x,t){
      var W=380,H=200;grid(x,W,H);var p=(t%5)/5;
      if(i===0){
        for(var k=0;k<4;k++){var px=48+k*76,on=p>k*.2;
          x.strokeStyle=on?'rgba(242,241,237,.5)':HL;x.strokeRect(px+.5,58.5,54,84);
          if(on){x.fillStyle='rgba(242,241,237,.08)';x.fillRect(px,58,54,84);
            for(var r=0;r<5;r++){x.fillStyle='rgba(242,241,237,.35)';x.fillRect(px+9,72+r*14,36-((r*7)%18),2);}}}
        var sx=40+p*300;x.strokeStyle=OX;x.lineWidth=1;x.beginPath();x.moveTo(sx,44);x.lineTo(sx,158);x.stroke();
      } else if(i===1){
        x.strokeStyle='rgba(242,241,237,.4)';x.strokeRect(120.5,38.5,140,124);
        x.fillStyle='rgba(242,241,237,.06)';x.fillRect(120,38,140,124);
        for(var r2=0;r2<4;r2++){var rp=Math.min(Math.max((p-r2*.16)/.14,0),1);
          x.fillStyle='rgba(242,241,237,.5)';x.fillRect(134,62+r2*22,60*rp,2);
          x.fillStyle='rgba(242,241,237,.85)';x.fillRect(214,62+r2*22,32*rp,2);}
        var sp=Math.min(Math.max((p-.68)/.3,0),1);x.strokeStyle=OX;x.lineWidth=1.4;
        x.beginPath();x.moveTo(134,146);x.lineTo(134+72*sp,146);x.stroke();
      } else if(i===2){
        [.88,.55,.3].forEach(function(v,k){var y=58+k*40,lp=Math.min(Math.max((p-k*.16)/.4,0),1);
          x.fillStyle='rgba(242,241,237,.1)';x.fillRect(48,y,270,12);
          x.fillStyle=(k===0&&p>.55)?OX:'rgba(242,241,237,.55)';x.fillRect(48,y,270*v*lp,12);});
        if(p>.62){mono(x,10,OX);x.fillText('THIS ONE FIRST',48,172);}
      } else {
        var lp2=Math.min(p/.35,1);x.strokeStyle='rgba(242,241,237,.35)';
        x.beginPath();x.moveTo(50,104.5);x.lineTo(50+270*lp2,104.5);x.stroke();
        [0,1,2,3].forEach(function(k){var np=Math.min(Math.max((p-.28-k*.14)/.14,0),1);if(np<=0)return;
          var nx=50+90*k;x.globalAlpha=np;x.fillStyle=k===3?OX:'rgba(242,241,237,.9)';
          x.beginPath();x.arc(nx,104,5,0,6.3);x.fill();x.strokeStyle=k===3?OX:HL;
          x.beginPath();x.moveTo(nx,96);x.lineTo(nx,74);x.stroke();x.globalAlpha=1;});
        if(p>.84){mono(x,10,OX);x.fillText('CHECK AGAIN AT 3 MONTHS',50,166);}
      }
    },i*.9);
  });
}

/* ══ NAVIGATOR ═══════════════════════════ */
function initNavigator(){
  var log=document.getElementById('log'),inp=document.getElementById('inp'),
      send=document.getElementById('send'),status=document.getElementById('status'),
      statusTxt=document.getElementById('statusTxt');
  if(!log) return;
  var hist=[];
  var SYSTEM=["You are the navigator for Mednixis, a healthcare management and growth firm in Egypt serving clinics, hospitals, medical centres and healthcare investors in Egypt and the GCC.",
   "DIVISIONS you can route to:",
   "div-management (Healthcare Management — operational systems, patient journey, workflow optimisation, performance tracking);",
   "div-branding (Branding & Marketing — medical brand identity, positioning, content strategy, website direction);",
   "div-research (Research & Strategy — market research, competitor analysis, feasibility and pricing studies, expansion planning);",
   "div-growth (Growth & Digital Systems — CRM, booking systems, patient tracking, dashboards, analytics);",
   "div-events (Medical Events — conferences, CME programmes, brand launches);",
   "div-system (The Clinic System — patient records, booking, role-based access, owner dashboards).",
   "Every engagement begins with a strategic assessment. Never publish, estimate or hint at pricing or packages. If asked about cost, say scope is set after the assessment.",
   "Voice: plain, measured, unsentimental. Name the likely constraint first. Short declaratives. Never use exclamation marks. Never use the words unlock, empower, holistic, end-to-end or seamless. Never invent statistics.",
   "Reply ONLY with a JSON object — no markdown fences, no preamble:",
   '{"reply":"2-4 sentences naming the likely constraint and which division addresses it","target":"one division id above, or null","label":"short button label, max 5 words"}'].join(" ");

  function add(who,txt,cls){
    var d=document.createElement('div');d.className='msg '+(cls||'');
    d.innerHTML='<div class="who"></div><div class="txt"></div>';
    d.querySelector('.who').textContent=who;d.querySelector('.txt').textContent=txt;
    log.appendChild(d);log.scrollTop=log.scrollHeight;return d;
  }
  function route(node,target,label){
    var b=document.createElement('button');b.className='route';
    b.textContent=(label||'Take me there')+' →';
    b.addEventListener('click',function(){
      window.location.href='services.html#'+target;
    });
    node.appendChild(b);
  }
  function busy(on,m){status.classList.toggle('busy',on);statusTxt.textContent=m||(on?'Reading':'Ready');send.disabled=on;}
  async function ask(q){
    if(!q.trim())return;
    add('You',q,'you');inp.value='';hist.push({role:'user',content:q});busy(true,'Reading');
    try{
      var res=await fetch(AI_ENDPOINT,{method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({max_tokens:1000,system:SYSTEM,messages:hist})});
      if(!res.ok) throw new Error('proxy '+res.status);
      var data=await res.json();
      var raw=(data.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join("\n");
      hist.push({role:'assistant',content:raw});
      var clean=raw.replace(/```json/g,'').replace(/```/g,'').trim();
      var parsed;try{parsed=JSON.parse(clean);}catch(e){parsed={reply:clean,target:null,label:null};}
      var node=add('Navigator',parsed.reply||'');
      if(parsed.target&&parsed.target!=='null')route(node,parsed.target,parsed.label);
      busy(false);
    }catch(err){
      add('System','Navigator unavailable in this environment. In production this runs through a server route.','sys');
      busy(false,'Offline');
    }
  }
  send.addEventListener('click',function(){ask(inp.value);});
  inp.addEventListener('keydown',function(e){if(e.key==='Enter')ask(inp.value);});
  document.querySelectorAll('.chip').forEach(function(c){
    c.addEventListener('click',function(){ask(c.getAttribute('data-q'));});});
}

/* ══ ASSESSMENT ══════════════════════════ */
var BANKS={
operating:{label:'Operating practice',rtag:'Baseline read',
 caveat:'This is a self-reported screen, not a diagnosis. A full assessment reads the appointment book, case mix, staffing rota and collections directly. Scope and engagement model are set after that reading — we do not publish packages or pricing.',
 dims:[{id:'positioning',name:'Positioning'},{id:'operations',name:'Operations'},{id:'journey',name:'Patient journey'},{id:'systems',name:'Systems & data'}],
 q:[
  {d:'positioning',t:'If a patient asked why they should choose you over the clinic down the road, how clear is the answer?',o:[['We have written positioning and every staff member says the same thing',4],['I know the answer, but staff would each phrase it differently',2],['We would say quality care and good doctors',1],['Honestly, we compete on price and convenience',0]]},
  {d:'positioning',t:'How defined is your ideal patient?',o:[['Defined by segment, condition and value — we market only to them',4],['Broadly defined, more instinct than document',2],['Anyone who needs our specialty',1],['We take whoever walks in',0]]},
  {d:'operations',t:'Do you know your chair or room utilisation?',o:[['Measured weekly, per room and per doctor',4],['Measured occasionally, when something feels wrong',2],['I have a rough sense of it',1],['We have never measured it',0]]},
  {d:'operations',t:'When a doctor runs late or cancels, what happens to the slots?',o:[['Documented protocol — slots are reallocated the same day',4],['Reception improvises, and it usually works out',2],['Patients wait, and the day runs behind',1],['Patients leave, and many never rebook',0]]},
  {d:'journey',t:'Of the people who enquire, how many actually book?',o:[['We track it and I could tell you the number now',4],['We could work it out if we had to',2],['No idea, but it feels lower than it should be',1],['We do not track enquiries at all',0]]},
  {d:'journey',t:'What happens after a patient\u2019s first visit?',o:[['Structured follow-up and recall sequence, run automatically',4],['Someone usually calls, when there is time',2],['Nothing unless they book again themselves',1],['Nothing at all',0]]},
  {d:'systems',t:'Where do your patient records live?',o:[['One system — searchable, with full history per patient',4],['Software, but parts of it are still on paper',2],['Mostly paper files',1],['In the doctors\u2019 own notebooks',0]]},
  {d:'systems',t:'If I asked for last month\u2019s revenue per visit, how long would it take?',o:[['Minutes — it is on a dashboard',4],['A day or two of manual work',2],['About a week, and it would be approximate',1],['We could not produce that figure',0]]}],
 c:{
  positioning:{div:'Branding & Marketing',scope:'Brand identity · Positioning · Content strategy · Medical communication · Website direction',
   text:'A practice without written positioning competes on price, because price is the only comparison a patient can make unaided. Every marketing pound then works harder for less return, buying attention without buying preference.',
   fallback:'Your weakest dimension is positioning. Until the answer to "why you" is written down and used consistently by everyone who speaks to a patient, marketing spend keeps buying attention rather than preference.'},
  operations:{div:'Healthcare Management',scope:'Operational systems · Clinic structure · Patient journey development · Workflow optimisation · Performance tracking',
   text:'Unmeasured capacity is the most common hidden loss in private practice. A clinic at 55% utilisation and one at 75% look identical from the waiting room, while the second earns substantially more from the same rent, staff and equipment.',
   fallback:'Your weakest dimension is operations. Capacity that is not measured cannot be recovered. Before spending on acquiring more patients, find out how much of the capacity you already pay for is going unused.'},
  journey:{div:'Growth & Digital Systems',scope:'CRM setup · Booking systems · Patient tracking · Dashboards · Analytics · Digital journey mapping',
   text:'Untracked enquiries are the quietest loss in a practice, because nobody sees the patients who never arrived. Without a recall sequence, each patient is acquired once and monetised once.',
   fallback:'Your weakest dimension is the patient journey. Enquiries that are never tracked cannot be recovered, and without a recall sequence every patient is acquired once and monetised once.'},
  systems:{div:'The Clinic System',scope:'Patient records · Online booking & confirmation · Role-based staff access · Owner dashboards',
   text:'A practice that cannot produce its own numbers on demand cannot be managed on evidence, and cannot be valued properly by a buyer or a bank.',
   fallback:'Your weakest dimension is systems and data. If the practice cannot produce its own figures on demand, decisions default to instinct and the operation cannot be valued properly.'}}},

prelaunch:{label:'New clinic or project',rtag:'Readiness read',
 caveat:'This is a self-reported screen, not a feasibility study. A full assessment models the catchment, the competitor set, the capex and break-even position, and the operating plan before capital is committed. Scope and engagement model are set after that reading — we do not publish packages or pricing.',
 dims:[{id:'concept',name:'Concept & positioning'},{id:'market',name:'Market evidence'},{id:'model',name:'Operating model'},{id:'readiness',name:'Launch readiness'}],
 q:[
  {d:'concept',t:'Who exactly is this clinic being built for?',o:[['A defined segment, with the conditions and price point written down',4],['A specialty and a general area of the city',2],['Whoever in the neighbourhood needs this specialty',1],['We will find out once we open',0]]},
  {d:'concept',t:'Why would a patient choose you over an established clinic nearby?',o:[['A specific capability or experience they cannot get there, and we can prove it',4],['We will be newer, cleaner and more modern',2],['Better service and shorter waiting times',1],['We have not worked that out yet',0]]},
  {d:'market',t:'What do you know about the competitors in your catchment?',o:[['Mapped by location, specialty, pricing and apparent volume',4],['I know the main names and roughly what they charge',2],['I know a few of them by reputation',1],['I have not looked into it',0]]},
  {d:'market',t:'How was your pricing set?',o:[['From a costing model and a competitor and willingness-to-pay study',4],['Benchmarked against a few nearby clinics',2],['Based on what I charged at my previous position',1],['Not decided yet',0]]},
  {d:'model',t:'Do you know how many patients per week you need to break even?',o:[['Yes — modelled monthly, with fixed and variable costs separated',4],['I have an approximate figure in mind',2],['I know the rent and the salaries, but not the number',1],['I have not calculated it',0]]},
  {d:'model',t:'How is capacity planned — rooms, doctors, and hours?',o:[['Planned against the break-even number, with a staged hiring schedule',4],['We know the room count and roughly who will cover which days',2],['We will start with what we have and adjust',1],['Not planned yet',0]]},
  {d:'readiness',t:'What exists today of the brand and the patient-facing presence?',o:[['Identity, messaging, website and booking all built to one written standard',4],['A logo and a social account, built ad hoc',2],['A name, and nothing else yet',1],['Nothing, and no plan for it',0]]},
  {d:'readiness',t:'How will the first hundred patients find you?',o:[['A written acquisition plan with channels, budget and a target cost per patient',4],['Social media, and referrals from colleagues',2],['Word of mouth, and the location itself',1],['We have not planned that',0]]}],
 c:{
  concept:{div:'Branding & Marketing',scope:'Brand identity · Positioning · Service architecture · Medical communication · Website direction',
   text:'A clinic that opens without written positioning defaults to competing on price and proximity, and those are the two things a new entrant is worst equipped to win.',
   fallback:'Your weakest dimension is the concept itself. A clinic that opens without written positioning defaults to competing on price and proximity — the two things a new entrant is least able to win.'},
  market:{div:'Research & Strategy',scope:'Market research · Competitor analysis · Feasibility studies · Pricing studies · Expansion planning',
   text:'Most clinic failures are decided before opening, in the choice of catchment and price point. Without a competitor map and a costed pricing study, the capital is committed against an assumption.',
   fallback:'Your weakest dimension is market evidence. Most clinic failures are decided before opening, in the choice of catchment and price point. Settle the demand question before the lease, not after.'},
  model:{div:'Healthcare Management',scope:'Operating model · Break-even modelling · Clinic structure · Capacity planning · Staffing schedule',
   text:'A founder who cannot state the weekly break-even patient count has no way to judge whether the plan is working in month three, when there is still time to change it.',
   fallback:'Your weakest dimension is the operating model. Without a weekly break-even patient number you cannot judge whether the plan is working while there is still time to change course.'},
  readiness:{div:'Growth & Digital Systems',scope:'Booking systems · CRM setup · Patient tracking · Launch acquisition plan · Analytics',
   text:'An opening without an acquisition plan burns its most valuable months on word of mouth that has not accumulated yet. The first ninety days set the referral base for the following two years.',
   fallback:'Your weakest dimension is launch readiness. The first ninety days set the referral base for the next two years and cannot be run again.'}}}
};

var B=null,answers=[],cur=0,aReady=false;
function initAssessment(){
  if(aReady) return; aReady=true;
  var back=document.getElementById('back');
  back.addEventListener('click',function(){if(cur>0){cur--;renderQ();}});
  document.getElementById('switch').addEventListener('click',function(){
    document.getElementById('instrument').classList.remove('show');
    document.getElementById('result').classList.remove('show');
    document.getElementById('a-intro').scrollIntoView({behavior:'smooth'});
  });
  document.getElementById('restart').addEventListener('click',function(){
    document.getElementById('instrument').classList.remove('show');
    document.getElementById('result').classList.remove('show');
    window.scrollTo(0,0);
  });
  document.querySelectorAll('.path').forEach(function(p){
    p.addEventListener('click',function(){startA(p.getAttribute('data-mode'));});
  });
}
function startA(mode){
  B=BANKS[mode]; answers=new Array(B.q.length).fill(null); cur=0;
  document.getElementById('rlabel').textContent=B.label;
  var prog=document.getElementById('prog'), dims=document.getElementById('dims');
  prog.innerHTML=''; dims.innerHTML='';
  B.q.forEach(function(){var d=document.createElement('div');d.className='pd';prog.appendChild(d);});
  B.dims.forEach(function(d){
    var el=document.createElement('div');el.className='dimrow';el.id='dim-'+d.id;
    el.innerHTML='<div class="dimtop"><span class="nm"></span><span class="sc">—</span></div>'+
      '<div class="track"><div class="fill"></div><div class="band"></div></div>';
    el.querySelector('.nm').textContent=d.name; dims.appendChild(el);
  });
  document.getElementById('result').classList.remove('show');
  document.getElementById('instrument').classList.add('show');
  renderQ();
  document.getElementById('instrument').scrollIntoView({behavior:'smooth'});
}
function dimScore(id){
  var got=0,max=0,any=false;
  B.q.forEach(function(q,i){if(q.d!==id)return;max+=4;if(answers[i]!==null){got+=answers[i];any=true;}});
  return {any:any,pct:max?Math.round(got/max*100):0,
    complete:B.q.every(function(q,i){return q.d!==id||answers[i]!==null;})};
}
function paintReadout(){
  var done=answers.every(function(a){return a!==null;});
  B.dims.forEach(function(d){
    var s=dimScore(d.id),el=document.getElementById('dim-'+d.id);
    el.querySelector('.fill').style.width=(s.any?s.pct:0)+'%';
    el.querySelector('.sc').textContent=s.any?s.pct+'%':'—';
    el.classList.toggle('done',s.complete);
    el.classList.toggle('low',s.complete&&s.pct<60);
  });
  document.getElementById('rstate').textContent=done?'Complete':'Incomplete';
}
function renderQ(){
  var q=B.q[cur],opts=document.getElementById('opts'),prog=document.getElementById('prog');
  document.getElementById('qcount').textContent='Question '+String(cur+1).padStart(2,'0')+' / '+String(B.q.length).padStart(2,'0');
  document.getElementById('qdim').textContent=B.dims.filter(function(d){return d.id===q.d;})[0].name;
  document.getElementById('qtext').textContent=q.t;
  opts.innerHTML='';
  q.o.forEach(function(o,i){
    var b=document.createElement('button');
    b.className='opt'+(answers[cur]===o[1]?' sel':'');
    b.innerHTML='<span class="oi">'+String.fromCharCode(65+i)+'</span><span></span>';
    b.querySelector('span:last-child').textContent=o[0];
    b.addEventListener('click',function(){
      answers[cur]=o[1];paintReadout();
      if(cur<B.q.length-1){cur++;renderQ();}else{askDetails();}
    });
    opts.appendChild(b);
  });
  document.getElementById('back').disabled=cur===0;
  Array.prototype.forEach.call(prog.children,function(d,i){
    d.classList.toggle('on',answers[i]!==null);d.classList.toggle('cur',i===cur);});
  paintReadout();
}
var LEAD={};
function askDetails(){
  var sec=document.getElementById('a-details');
  if(!sec){ finishA(); return; }
  document.getElementById('instrument').classList.remove('show');
  sec.style.display='block';
  sec.scrollIntoView({behavior:'smooth'});
  if(sec.dataset.on) return; sec.dataset.on='1';

  function collect(){
    LEAD={
      name:  (document.getElementById('d-name').value||'').trim(),
      phone: (document.getElementById('d-phone').value||'').trim(),
      email: (document.getElementById('d-email').value||'').trim(),
      org:   (document.getElementById('d-org').value||'').trim()
    };
  }
  document.getElementById('d-go').addEventListener('click',function(){
    collect();
    var m=document.getElementById('d-msg');
    if(!LEAD.name || (!LEAD.phone && !LEAD.email)){
      m.className='fmsg err';
      m.textContent='Name, and either a phone or an email';
      return;
    }
    sec.style.display='none'; finishA();
  });
  document.getElementById('d-skip').addEventListener('click',function(){
    collect(); sec.style.display='none'; finishA();
  });
}

/* send the completed assessment as a lead */
function sendLead(scored,worst,overall,band){
  var answers_text = B.q.map(function(q,i){
    var ch=q.o.filter(function(o){return o[1]===answers[i];})[0];
    return (i+1)+'. '+q.t+'  →  '+(ch?ch[0]:'—');
  }).join('\n');
  var dims = scored.map(function(s){return s.name+': '+s.pct+'%';}).join('  |  ');
  var path = (B===BANKS.prelaunch) ? 'New clinic / pre-launch' : 'Operating practice';
  var contacted = LEAD.name || LEAD.phone || LEAD.email;

  /* a) email — posted through a hidden form so FormSubmit
        renders its table template, exactly like the old site.
        Targeting a hidden iframe keeps the page in place.      */
  var frameName='fs_lead_frame';
  if(!document.getElementById(frameName)){
    var ifr=document.createElement('iframe');
    ifr.name=frameName; ifr.id=frameName; ifr.style.display='none';
    document.body.appendChild(ifr);
  }
  var f=document.createElement('form');
  f.method='POST'; f.target=frameName;
  f.action=FORM_TARGET;
  f.style.display='none';

  var fields={
    '_subject':'Assessment '+(contacted?'Lead':'Completed')+' — '+(LEAD.name||'Anonymous')+' — '+overall+'/100',
    '_template':'table',
    '_captcha':'false',
    'Full_Name': LEAD.name||'— not given —',
    'Phone': LEAD.phone||'— not given —',
    'Email': LEAD.email||'— not given —',
    'Organization': LEAD.org||'—',
    'Assessment_Path': path,
    'Overall_Score': overall+' / 100',
    'Band': band,
    'Primary_Constraint': worst.name,
    'Recommended_Division': B.c[worst.id].div,
    'Dimension_Scores': dims,
    'Their_Answers': answers_text,
    'Completed_At': new Date().toLocaleString('en-GB')
  };
  Object.keys(fields).forEach(function(k){
    var i=document.createElement('input');
    i.type='hidden'; i.name=k; i.value=fields[k];
    f.appendChild(i);
  });
  document.body.appendChild(f);
  try{ f.submit(); }catch(e){ console.warn('lead email failed',e); }
  setTimeout(function(){ f.remove(); },4000);

  /* b) Command Center — Supabase leads table */
  if(LEAD_SUPABASE_URL && LEAD_SUPABASE_KEY && LEAD_SUPABASE_KEY.indexOf('PASTE')<0){
    var row={
      source:'website_assessment',
      name: LEAD.name||null,
      phone: LEAD.phone||null,
      email: LEAD.email||null,
      organisation: LEAD.org||null,
      assessment_path: path,
      score: overall,
      band: band,
      primary_constraint: worst.name,
      recommended_division: B.c[worst.id].div,
      dimension_scores: scored.reduce(function(o,s){o[s.id]=s.pct;return o;},{}),
      answers: B.q.map(function(q,i){
        var ch=q.o.filter(function(o){return o[1]===answers[i];})[0];
        return {q:q.t, a:ch?ch[0]:null, points:answers[i]};
      }),
      status:'new'
    };
    window.MEDNIXIS_LAST_LEAD = row;   /* inspectable in console */

    var url = LEAD_SUPABASE_URL.replace(/\/$/,'') + '/rest/v1/' + LEAD_TABLE;

    /* new sb_publishable_ keys want apikey only; legacy anon JWTs
       also accept Bearer. Try the modern form, fall back once.  */
    function push(withBearer){
      var h={'Content-Type':'application/json',
             'apikey':LEAD_SUPABASE_KEY,
             'Prefer':'return=representation'};
      if(withBearer) h['Authorization']='Bearer '+LEAD_SUPABASE_KEY;
      return fetch(url,{method:'POST',headers:h,body:JSON.stringify(row)})
        .then(function(r){
          return r.text().then(function(t){ return {ok:r.ok,status:r.status,body:t}; });
        });
    }

    push(false).then(function(res){
      if(res.ok){ console.log('%c✓ Lead saved to Command Center','color:#5E9E88',res.body); return; }
      console.warn('Supabase attempt 1 failed —',res.status,res.body);
      return push(true).then(function(res2){
        if(res2.ok){ console.log('%c✓ Lead saved (Bearer)','color:#5E9E88',res2.body); }
        else{ console.error('✗ Supabase rejected the lead —',res2.status,res2.body,
              '\nURL:',url,'\nRow:',row); }
      });
    }).catch(function(e){
      console.error('✗ Supabase unreachable:',e,'\nURL:',url);
    });
  } else {
    console.warn('Supabase not configured — LEAD_SUPABASE_URL / KEY are empty. Email only.');
  }
}

function finishA(){
  var scored=B.dims.map(function(d){return {id:d.id,name:d.name,pct:dimScore(d.id).pct};});
  var worst=scored.slice().sort(function(a,b){return a.pct-b.pct;})[0];
  var C=B.c[worst.id];

  /* overall score — plain mean of the four dimensions, computed from answers */
  var overall=Math.round(scored.reduce(function(s,d){return s+d.pct;},0)/scored.length);
  var BANDS=[
    {max:39,name:'Structural risk',
     op:'The practice is running on individual effort rather than structure. More than one area needs work before growth spending makes sense.',
     pre:'The project is not yet ready for capital commitment. Several foundations are missing, and fixing them now costs a fraction of fixing them after opening.'},
    {max:59,name:'Below range',
     op:'The practice works, but it is losing value in ways that are recoverable. One area is holding back the others.',
     pre:'The plan has real gaps. The concept may be sound, but at least one foundation is not evidenced well enough to commit against.'},
    {max:79,name:'Functioning',
     op:'The practice is soundly run. The gains available now are specific rather than structural — one constraint, addressed properly.',
     pre:'The project is broadly prepared. What remains is closing the weakest area before opening rather than rebuilding the plan.'},
    {max:100,name:'Strong',
     op:'The practice is well structured. At this level the work shifts from fixing to scaling, and the constraint below is where the next gain sits.',
     pre:'The project is unusually well prepared. The remaining question is execution discipline through the first ninety days.'}
  ];
  var band=BANDS.filter(function(b){return overall<=b.max;})[0];
  var pre=(B===BANKS.prelaunch);

  var oscore=document.getElementById('oscore');
  oscore.classList.toggle('low',overall<60);
  document.getElementById('oband').textContent=band.name;
  document.getElementById('oread').textContent=pre?band.pre:band.op;
  var onum=document.getElementById('onum'), n=0;
  (function count(){ n+=Math.max(1,Math.round((overall-n)/6)); if(n>overall)n=overall;
    onum.textContent=n; if(n<overall) requestAnimationFrame(count); })();
  setTimeout(function(){document.getElementById('ome').style.left=overall+'%';},120);

  try{ sendLead(scored,worst,overall,band.name); }catch(e){ console.warn('lead not sent',e); }

  document.getElementById('rtag').textContent=B.rtag;
  document.getElementById('rtitle').innerHTML='Your primary constraint is <em>'+worst.name.toLowerCase()+'</em>.';
  document.getElementById('cname').textContent=worst.name;
  document.getElementById('cstatic').textContent=C.text;
  document.getElementById('recname').textContent=C.div;
  document.getElementById('recscope').textContent=C.scope;
  document.getElementById('caveat').textContent=B.caveat;
  var box=document.getElementById('scores');box.innerHTML='';
  scored.forEach(function(s){
    var row=document.createElement('div');
    row.className='srow'+(s.id===worst.id?' flag':'');
    row.innerHTML='<div><div class="nm"></div></div><div class="strack"><div class="sfill"></div><div class="sband"></div></div>'+
      '<div><div class="val"></div><div class="nt"></div></div>';
    row.querySelector('.nm').textContent=s.name;
    row.querySelector('.val').textContent=s.pct+'%';
    row.querySelector('.nt').textContent=s.pct<60?'Below range':'Within range';
    box.appendChild(row);
    requestAnimationFrame(function(){row.querySelector('.sfill').style.width=s.pct+'%';});
  });
  document.getElementById('result').classList.add('show');
  document.getElementById('result').scrollIntoView({behavior:'smooth'});
  writeReading(scored,worst,C);
}
async function writeReading(scored,worst,C){
  var out=document.getElementById('creading'),st=document.getElementById('cstatus');
  out.textContent='';st.textContent='Writing the reading…';
  var ctx=(B===BANKS.prelaunch)
    ?"The respondent is opening a new clinic or is under six months old. Do not reference utilisation, no-show rates, recall sequences or existing patient volumes — none of these exist yet."
    :"The respondent runs an operating clinic already seeing patients.";
  var lines=scored.map(function(s){return s.name+' '+s.pct+'%';}).join(', ');
  var picked=B.q.map(function(q,i){
    var ch=q.o.filter(function(o){return o[1]===answers[i];})[0];
    return q.t+' → '+(ch?ch[0]:'—');}).join('\n');
  var SYSTEM="You write the interpretation for a Mednixis assessment. Mednixis is a healthcare management and growth firm in Egypt. "+ctx+
    " Voice: plain, measured, unsentimental. Short declaratives. Name the mechanism, not the feeling."+
    " Never use exclamation marks. Never use the words unlock, empower, holistic, end-to-end or seamless."+
    " Never invent statistics, percentages or currency figures. Never mention pricing or packages. Do not repeat the scores back."+
    " Write 3 to 4 sentences of continuous prose, no headings, no lists, no preamble. Address the reader as you."+
    " Explain what their weakest dimension causes in practice, and what a full assessment would examine first. Reply with the prose only.";
  try{
    var res=await fetch(AI_ENDPOINT,{method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({max_tokens:1000,system:SYSTEM,
        messages:[{role:"user",content:"Dimension scores: "+lines+". Weakest: "+worst.name+".\n\nTheir answers:\n"+picked}]})});
    if(!res.ok) throw new Error('proxy '+res.status);
    var data=await res.json();
    var txt=(data.content||[]).filter(function(b){return b.type==='text';}).map(function(b){return b.text;}).join("\n").trim();
    if(!txt) throw new Error('empty');
    out.textContent=txt; st.textContent='Written for your answers · scores computed from your responses';
  }catch(e){
    out.textContent=C.fallback; st.textContent='Standard reading shown · scores computed from your responses';
  }
}


/* ══ BOOT ════════════════════════════════ */
(function(){
  var b=document.getElementById('burger'), d=document.getElementById('drawer');
  if(b&&d) b.addEventListener('click',function(){d.classList.toggle('open');});
  markActive();
  reveal();
  var page=document.body.getAttribute('data-page');
  try{ init(page); }catch(e){ console.warn('init failed:',page,e); }
})();

/* highlight a division when linked from the navigator */
(function(){
  if(document.body.getAttribute('data-page')!=='divisions') return;
  var id=(location.hash||'').replace('#','');
  if(!id) return;
  var el=document.getElementById(id); if(!el) return;
  el.classList.add('lit');
  setTimeout(function(){el.scrollIntoView({behavior:'smooth',block:'center'});},220);
})();
