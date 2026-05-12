const $ = (q) => document.querySelector(q);
const $$ = (q) => document.querySelectorAll(q);
const overlay = $('#experienceOverlay');
const simHome = $('#simHome');
let audioCtx;
let activeOscillators = [];

function ensureAudio(){
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}
function stopAudio(){
  activeOscillators.forEach(o => { try{o.stop()}catch(e){} });
  activeOscillators = [];
}
function tone(freq=440, dur=.4, type='sine', gain=.035){
  ensureAudio();
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type; osc.frequency.value = freq; g.gain.value = gain;
  osc.connect(g); g.connect(audioCtx.destination); osc.start();
  activeOscillators.push(osc);
  setTimeout(()=>{try{osc.stop()}catch(e){}}, dur*1000);
}
function noise(dur=1.2, gain=.025){
  ensureAudio();
  const bufferSize = audioCtx.sampleRate * dur;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for(let i=0;i<bufferSize;i++) data[i] = (Math.random()*2-1)*0.55;
  const src = audioCtx.createBufferSource(); src.buffer = buffer;
  const filter = audioCtx.createBiquadFilter(); filter.type='lowpass'; filter.frequency.value=550;
  const g = audioCtx.createGain(); g.gain.value = gain;
  src.connect(filter); filter.connect(g); g.connect(audioCtx.destination); src.start();
}

$$('[data-open-experience]').forEach(btn => btn.addEventListener('click', () => {
  overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false'); showHome();
}));
$('[data-close-overlay]').addEventListener('click', closeOverlay);
overlay.addEventListener('click', e => { if(e.target === overlay) closeOverlay(); });
function closeOverlay(){ overlay.classList.remove('open'); overlay.setAttribute('aria-hidden','true'); stopAllSims(); }
function showHome(){ stopAllSims(); $$('.sim-screen').forEach(s=>s.classList.remove('active-sim')); simHome.classList.add('active-sim'); }
$$('[data-back-sim]').forEach(btn => btn.addEventListener('click', showHome));
$$('[data-open-sim]').forEach(btn => btn.addEventListener('click', () => {
  overlay.classList.add('open'); overlay.setAttribute('aria-hidden','false'); openSim(btn.dataset.openSim);
}));
function openSim(name){
  stopAllSims(); simHome.classList.remove('active-sim'); $$('.sim-screen').forEach(s=>s.classList.remove('active-sim'));
  const target = $(`#sim-${name}`); if(target) target.classList.add('active-sim');
}
function stopAllSims(){
  stopAudio();
  clearInterval(window.dyslexiaInterval); clearInterval(window.adhdInterval); clearInterval(window.autismInterval);
  $('#dyslexiaTimer').textContent='30';
  $('#dyslexiaText').textContent='Özel eğitim, bireyin öğrenme yolculuğunu anlamak ve ona uygun destek sunmak için vardır.';
  $('#distractors').innerHTML=''; $('.adhd-screen').classList.remove('active-noise'); $('.autism-screen').classList.remove('flash');
}

const baseText = 'Özel eğitim, bireyin öğrenme yolculuğunu anlamak ve ona uygun destek sunmak için vardır.';
function scramble(text){
  const chars = 'abcçdefgğhıijklmnoöprsştuüvyz0123456789';
  return text.split('').map(ch => {
    if(ch === ' ' || ',.?!'.includes(ch)) return ch;
    return Math.random() > .42 ? chars[Math.floor(Math.random()*chars.length)] : ch;
  }).join('');
}
$('#startDyslexia').addEventListener('click', () => {
  let t = 30; $('#dyslexiaTimer').textContent=t;
  clearInterval(window.dyslexiaInterval);
  window.dyslexiaInterval = setInterval(()=>{
    t--; $('#dyslexiaTimer').textContent=t;
    $('#dyslexiaText').textContent = scramble(baseText);
    if(t<=0){clearInterval(window.dyslexiaInterval); $('#dyslexiaText').textContent='Bazı bireyler için okuma süreci her gün bu kadar yorucu olabilir.';}
  }, 650);
});

$('#startAdhd').addEventListener('click', () => {
  const wrap = $('#distractors'); wrap.innerHTML=''; $('.adhd-screen').classList.add('active-noise'); noise(.8,.035);
  const words = ['Bildirim!', 'Ses!', 'Hareket!', 'Biri konuşuyor', 'Yeni görev!', 'Dikkat dağıldı', 'Bak buraya!'];
  clearInterval(window.adhdInterval);
  window.adhdInterval = setInterval(()=>{
    tone(180 + Math.random()*800, .12, 'square', .018);
    const s = document.createElement('span'); s.textContent = words[Math.floor(Math.random()*words.length)];
    s.style.left = Math.random()*78 + 8 + '%'; s.style.top = Math.random()*62 + 22 + '%';
    wrap.appendChild(s); setTimeout(()=>s.remove(), 2500);
  }, 420);
  setTimeout(()=>{clearInterval(window.adhdInterval); $('.adhd-screen').classList.remove('active-noise');}, 9000);
});

$('#startAutism').addEventListener('click', () => {
  $('.autism-screen').classList.add('flash');
  clearInterval(window.autismInterval);
  window.autismInterval = setInterval(()=>{ tone(300+Math.random()*1200,.08,Math.random()>.5?'sawtooth':'square',.02); }, 180);
  setTimeout(()=>{clearInterval(window.autismInterval); $('.autism-screen').classList.remove('flash'); stopAudio();}, 6500);
});
$('#startHearing').addEventListener('click', () => { noise(2.2,.055); setTimeout(()=>tone(260,.4,'sawtooth',.02),400); setTimeout(()=>tone(190,.3,'sawtooth',.02),900); });
$('#toggleVision').addEventListener('click', () => $('#visionCard').classList.toggle('blurred'));

const questions = [
  {q:'Disleksi zekâ geriliği anlamına mı gelir?', a:['Evet','Hayır'], c:1},
  {q:'Kaynaştırma eğitiminin amacı nedir?', a:['Bireyi ayırmak','Uygun destekle birlikte öğrenmeyi sağlamak','Sadece sınav kolaylığı yapmak'], c:1},
  {q:'DEHB sadece “yaramazlık” olarak açıklanabilir mi?', a:['Evet','Hayır'], c:1},
  {q:'Otizmli bireylerin hepsi tamamen aynı özellikleri mi gösterir?', a:['Evet','Hayır'], c:1},
  {q:'Erişilebilir tasarım kimler için faydalıdır?', a:['Sadece özel gereksinimli bireyler','Herkes','Sadece öğretmenler'], c:1}
];
let qi=0, score=0;
function renderQuiz(){
  const q = questions[qi];
  if(!q){ $('#quizQuestion').textContent='Quiz tamamlandı'; $('#quizOptions').innerHTML=''; $('#quizResult').textContent=`Farkındalık puanın: ${score}/${questions.length}`; return; }
  $('#quizQuestion').textContent = `${qi+1}. ${q.q}`;
  $('#quizOptions').innerHTML = q.a.map((x,i)=>`<button data-answer="${i}">${x}</button>`).join('');
  $('#quizResult').textContent='';
  $$('[data-answer]').forEach(b=>b.addEventListener('click',()=>{ if(Number(b.dataset.answer)===q.c) score++; qi++; renderQuiz(); }));
}
renderQuiz();

const form = $('#thoughtForm'), input = $('#thoughtInput'), list = $('#thoughtList');
function loadThoughts(){
  const thoughts = JSON.parse(localStorage.getItem('thoughtsBG') || '[]');
  list.innerHTML = thoughts.length ? thoughts.map(t=>`<div class="thought">“${escapeHtml(t)}”</div>`).join('') : '<div class="thought">Henüz yorum yok. İlk anonim düşünceyi sen yaz.</div>';
}
function escapeHtml(str){return str.replace(/[&<>'"]/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[s]));}
form.addEventListener('submit',e=>{e.preventDefault(); const val=input.value.trim(); if(!val) return; const thoughts=JSON.parse(localStorage.getItem('thoughtsBG')||'[]'); thoughts.unshift(val); localStorage.setItem('thoughtsBG',JSON.stringify(thoughts.slice(0,8))); input.value=''; loadThoughts();});
loadThoughts();

const navLinks = $$('.nav a');
window.addEventListener('scroll',()=>{let current='anasayfa'; $$('main section[id]').forEach(sec=>{ if(scrollY >= sec.offsetTop-120) current=sec.id; }); navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current));});
