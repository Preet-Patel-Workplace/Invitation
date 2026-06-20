document.addEventListener('DOMContentLoaded', () => {

  /* ── CONFETTI ── */
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = window.innerWidth;
  let H = canvas.height = window.innerHeight;
  const COLORS = ['#F5A623','#D4AF37','#E05080','#0D7A6B','#FFD166','#FFB6C1','#FF6B8A','#FFF8EC'];
  const SHAPES = ['circle','rect','ribbon'];
  class Particle {
    constructor(){this.reset(true);}
    reset(init=false){
      this.x=Math.random()*W; this.y=init?Math.random()*H-H:-20;
      this.r=Math.random()*6+3; this.c=COLORS[Math.floor(Math.random()*COLORS.length)];
      this.s=SHAPES[Math.floor(Math.random()*SHAPES.length)];
      this.vx=(Math.random()-.5)*1.2; this.vy=Math.random()*2+.8;
      this.a=Math.random()*Math.PI*2; this.da=(Math.random()-.5)*.08;
      this.op=Math.random()*.5+.5; this.w=Math.random()*5+3; this.h=Math.random()*12+6;
    }
    update(){this.x+=this.vx;this.y+=this.vy;this.a+=this.da;if(this.y>H+30)this.reset();}
    draw(){
      ctx.save();ctx.globalAlpha=this.op;ctx.fillStyle=this.c;
      ctx.translate(this.x,this.y);ctx.rotate(this.a);
      if(this.s==='circle'){ctx.beginPath();ctx.arc(0,0,this.r,0,Math.PI*2);ctx.fill();}
      else if(this.s==='rect'){ctx.fillRect(-this.w/2,-this.h/2,this.w,this.h);}
      else{ctx.beginPath();ctx.moveTo(0,-this.h/2);ctx.quadraticCurveTo(this.w,0,0,this.h/2);ctx.quadraticCurveTo(-this.w,0,0,-this.h/2);ctx.fill();}
      ctx.restore();
    }
  }
  const particles=Array.from({length:80},()=>new Particle());
  let animFrame;
  function renderConfetti(){ctx.clearRect(0,0,W,H);particles.forEach(p=>{p.update();p.draw();});animFrame=requestAnimationFrame(renderConfetti);}
  renderConfetti();
  setTimeout(()=>{let op=1;const fade=setInterval(()=>{op-=.02;canvas.style.opacity=Math.max(0,op);if(op<=0){cancelAnimationFrame(animFrame);clearInterval(fade);}},50);},8000);
  window.addEventListener('resize',()=>{W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;});

  /* ── COUNTDOWN ── */
  const TARGET=new Date('2025-08-17T14:00:00');
  function pad(n){return String(n).padStart(2,'0');}
  function tick(){
    let diff=TARGET-new Date();
    if(diff<=0){['days','hours','minutes','seconds'].forEach(id=>document.getElementById(id).textContent='00');return;}
    const d=Math.floor(diff/86400000);diff%=86400000;
    const h=Math.floor(diff/3600000);diff%=3600000;
    const m=Math.floor(diff/60000);diff%=60000;
    const s=Math.floor(diff/1000);
    document.getElementById('days').textContent=pad(d);
    document.getElementById('hours').textContent=pad(h);
    document.getElementById('minutes').textContent=pad(m);
    document.getElementById('seconds').textContent=pad(s);
  }
  tick();setInterval(tick,1000);

  /* ── NAV ── */
  const nav=document.getElementById('nav');
  window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',window.scrollY>40),{passive:true});

  /* ── MOBILE MENU ── */
  const burger=document.getElementById('burger'),menu=document.getElementById('mobileMenu'),close=document.getElementById('mobileClose');
  burger.addEventListener('click',()=>menu.classList.add('open'));
  close.addEventListener('click',()=>menu.classList.remove('open'));
  document.querySelectorAll('.mob-link').forEach(l=>l.addEventListener('click',()=>menu.classList.remove('open')));

  /* ── AOS ── */
  const obs=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(!e.isIntersecting)return;
      const parent=e.target.closest('.details-grid,.timeline,.gallery-grid');
      const siblings=parent?Array.from(parent.querySelectorAll('[data-aos]')):[];
      const delay=siblings.indexOf(e.target)>=0?siblings.indexOf(e.target)*130:0;
      setTimeout(()=>e.target.classList.add('aos-visible'),delay);
      obs.unobserve(e.target);
    });
  },{threshold:.12,rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('[data-aos]').forEach(el=>obs.observe(el));

  /* ── HERO FADE IN ── */
  const heroText=document.querySelector('.hero-text');
  if(heroText){
    heroText.style.opacity='0';heroText.style.transform='translateY(24px)';
    setTimeout(()=>{heroText.style.transition='opacity 1.1s ease,transform 1.1s ease';heroText.style.opacity='1';heroText.style.transform='translateY(0)';},500);
  }

  /* ── RSVP → FORMSPREE ── */
  const FORMSPREE_ID='xojoaagw';
  const btn=document.getElementById('rsvp-btn');
  if(btn){
    btn.addEventListener('click',()=>{
      const name=document.getElementById('rsvp-name').value.trim();
      const email=document.getElementById('rsvp-email').value.trim();
      const guests=document.getElementById('rsvp-guests').value;
      const attending=document.querySelector('input[name="attending"]:checked').value;
      const msg=document.getElementById('rsvp-msg').value.trim();
      const btnText=document.getElementById('rsvp-btn-text');
      if(!name){shake(document.getElementById('rsvp-name'));return;}
      if(!email||!email.includes('@')){shake(document.getElementById('rsvp-email'));return;}
      btnText.textContent='🙏 Sending...';btn.disabled=true;
      fetch(`https://formspree.io/f/${FORMSPREE_ID}`,{
        method:'POST',
        headers:{'Content-Type':'application/json','Accept':'application/json'},
        body:JSON.stringify({
          name,email,
          attending:attending==='yes'?'🎉 Yes, attending!':'😢 Cannot attend',
          number_of_guests:guests,
          message:msg||'(no message)',
          _subject:`Baby Shower RSVP — ${name} (${attending==='yes'?'Attending ✅':'Not attending ❌'})`,
          _replyto:email,
        }),
      })
      .then(res=>{
        if(res.ok){showSuccess({name,email,attending,guests,msg});}
        else{res.json().then(()=>{btnText.textContent='⚠️ Error — try again';btn.disabled=false;});}
      })
      .catch(()=>{btnText.textContent='⚠️ Connection error';btn.disabled=false;});
    });
  }

  function showSuccess({name,email,attending,guests,msg}){
    document.getElementById('rsvp-form-wrap').style.display='none';
    document.getElementById('rsvp-success').style.display='block';
    burstConfetti();
    try{const l=JSON.parse(localStorage.getItem('baby_shower_rsvps')||'[]');l.push({name,email,attending,guests,message:msg,ts:new Date().toISOString()});localStorage.setItem('baby_shower_rsvps',JSON.stringify(l));}catch(e){}
  }
  function shake(el){
    el.style.borderColor='#E05080';el.style.boxShadow='0 0 0 3px rgba(224,80,128,.2)';
    setTimeout(()=>{el.style.borderColor='';el.style.boxShadow='';},2000);
    el.animate([{transform:'translateX(-5px)'},{transform:'translateX(5px)'},{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:300});
  }
  function burstConfetti(){
    canvas.style.opacity='1';cancelAnimationFrame(animFrame);
    particles.forEach(p=>p.reset());renderConfetti();
    setTimeout(()=>{let op=1;const fade=setInterval(()=>{op-=.025;canvas.style.opacity=Math.max(0,op);if(op<=0){cancelAnimationFrame(animFrame);clearInterval(fade);}},50);},5000);
  }
});
