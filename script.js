import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyArtu0_Kx8ZwQ7RSXURD6LbXBDVaCrSMEs",
  authDomain: "birgunbenimgibi.firebaseapp.com",
  projectId: "birgunbenimgibi",
  storageBucket: "birgunbenimgibi.firebasestorage.app",
  messagingSenderId: "35097850778",
  appId: "1:35097850778:web:7750c32cf32bfc7881c023"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const thoughtsRef = collection(db, "thoughts");

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
const lookAlikes = { a:'e', e:'a', ı:'i', i:'ı', o:'ö', ö:'o', u:'ü', ü:'u', b:'d', d:'b', p:'q', m:'n', n:'m' };
function scrambleWord(word){
  if(word.length < 4 || Math.random() < 0.35) return word;
  const letters = word.split('');
  // Kelimenin ilk ve son harfi çoğunlukla kalsın; içeride küçük karışıklık olsun.
  for(let i=1; i<letters.length-1; i++){
    if(Math.random() < 0.18 && lookAlikes[letters[i].toLowerCase()]){
      const repl = lookAlikes[letters[i].toLowerCase()];
      letters[i] = letters[i] === letters[i].toUpperCase() ? repl.toUpperCase() : repl;
    }
    if(Math.random() < 0.16 && i < letters.length-2){
      [letters[i], letters[i+1]] = [letters[i+1], letters[i]];
      i++;
    }
  }
  return letters.join('');
}
function scramble(text){
  return text.split(/(\s+)/).map(part => /\s+/.test(part) ? part : scrambleWord(part)).join('');
}
$('#startDyslexia').addEventListener('click', () => {
  let t = 30; $('#dyslexiaTimer').textContent=t;
  clearInterval(window.dyslexiaInterval);
  window.dyslexiaInterval = setInterval(()=>{
    t--; $('#dyslexiaTimer').textContent=t;
    $('#dyslexiaText').textContent = scramble(baseText);
    if(t<=0){clearInterval(window.dyslexiaInterval); $('#dyslexiaText').textContent='Bazı bireyler için okuma süreci her gün bu kadar yorucu olabilir.';}
  }, 850);
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
  {q:'Disleksi zekâ geriliği anlamına mı gelir?', a:['Evet, doğrudan zekâ ile ilgilidir','Hayır, okuma-yazma süreciyle ilgili özel öğrenme güçlüğüdür','Sadece dikkat eksikliğidir'], c:1},
  {q:'Kaynaştırma/bütünleştirme eğitiminin temel amacı nedir?', a:['Bireyi sınıftan ayırmak','Uygun destekle birlikte öğrenmeyi sağlamak','Sadece sınav kolaylığı yapmak'], c:1},
  {q:'DEHB sadece “yaramazlık” olarak açıklanabilir mi?', a:['Evet','Hayır, dikkat ve dürtüsellik süreçleriyle ilgilidir'], c:1},
  {q:'Otizm spektrumundaki bireylerin hepsi aynı özellikleri mi gösterir?', a:['Evet, hepsi aynıdır','Hayır, her bireyin güçlü yönleri ve ihtiyaçları farklıdır'], c:1},
  {q:'Erişilebilir tasarım kimler için faydalıdır?', a:['Sadece özel gereksinimli bireyler','Herkes','Sadece öğretmenler'], c:1},
  {q:'İşitme yetersizliği olan bir öğrenci için hangisi daha destekleyicidir?', a:['Konuşurken yüzü görünür olmak ve altyazı/görsel destek kullanmak','Daha hızlı konuşmak','Sınıfta hiç soru sormamak'], c:0},
  {q:'Özel eğitimde en doğru yaklaşım hangisidir?', a:['Herkesten aynı performansı beklemek','Bireysel farklılıkları dikkate alıp uygun destek sunmak','Sadece hataları göstermek'], c:1}
];
let qi=0, score=0;
const resultMessages = {
  high: [
    'Bu sitedeki kullanıcıların %{p}’ünden daha farkında bir bireysin.',
    'Farkındalık düzeyin oldukça güçlü: katılımcıların %{p}’ünü geride bıraktın.',
    'Empati ve doğru yaklaşım konusunda kullanıcıların %{p}’ünden daha bilinçlisin.'
  ],
  mid: [
    'Bu sitedeki kullanıcıların %{p}’ünden daha farkında çıktın; birkaç noktayı daha güçlendirebilirsin.',
    'Farkındalık seviyen iyi: katılımcıların %{p}’ünü geride bıraktın.',
    'Doğru yerdesin; kullanıcıların %{p}’ünden daha yüksek farkındalık gösterdin.'
  ],
  low: [
    'Bu test bir başlangıç: yine de kullanıcıların %{p}’ünden daha farkında çıktın.',
    'Farkındalık öğrenilebilir; şu an katılımcıların %{p}’ünü geride bıraktın.',
    'Bazı konular tekrar edilebilir; puanın kullanıcıların %{p}’ünden yüksek.'
  ]
};
function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min; }
function percentileForScore(score){
  if(score === 7) return rand(93,98);
  if(score === 6) return rand(84,92);
  if(score === 5) return rand(74,83);
  if(score === 4) return rand(61,73);
  if(score === 3) return rand(48,60);
  if(score === 2) return rand(34,47);
  return rand(18,33);
}
function renderQuiz(){
  const q = questions[qi];
  if(!q){
    const pct = percentileForScore(score);
    const level = score >= 6 ? 'high' : score >= 3 ? 'mid' : 'low';
    const msg = resultMessages[level][rand(0,resultMessages[level].length-1)].replace('%{p}', pct);
    $('#quizQuestion').textContent='Quiz tamamlandı';
    $('#quizOptions').innerHTML='';
    $('#quizResult').innerHTML = `<b>Farkındalık puanın: ${score}/${questions.length}</b><br>${msg}<br><button class="quiz-restart" id="restartQuiz">Testi Yeniden Başlat</button>`;
    $('#restartQuiz').addEventListener('click',()=>{qi=0; score=0; renderQuiz();});
    return;
  }
  $('#quizQuestion').textContent = `${qi+1}. ${q.q}`;
  $('#quizOptions').innerHTML = q.a.map((x,i)=>`<button data-answer="${i}">${x}</button>`).join('');
  $('#quizResult').textContent='';
  $$('[data-answer]').forEach(b=>b.addEventListener('click',()=>{ if(Number(b.dataset.answer)===q.c) score++; qi++; renderQuiz(); }));
}
renderQuiz();

const form = $('#thoughtForm'), input = $('#thoughtInput'), list = $('#thoughtList');
function escapeHtml(str){return str.replace(/[&<>'"]/g, s=>({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' }[s]));}
function renderThoughts(snapshot){
  if(snapshot.empty){
    list.innerHTML = '<div class="thought">Henüz yorum yok. İlk anonim düşünceyi sen yaz.</div>';
    return;
  }
  list.innerHTML = snapshot.docs.map(doc => {
    const data = doc.data();
    return `<div class="thought">“${escapeHtml(data.text || '')}”</div>`;
  }).join('');
}
try{
  const qThoughts = query(thoughtsRef, orderBy('createdAt','desc'), limit(12));
  onSnapshot(qThoughts, renderThoughts, (err)=>{
    console.error(err);
    list.innerHTML = '<div class="thought">Yorumlar şu an yüklenemedi. Firestore kurallarını kontrol et.</div>';
  });
}catch(err){
  console.error(err);
}
form.addEventListener('submit', async e=>{
  e.preventDefault();
  const val=input.value.trim();
  if(!val) return;
  const btn = form.querySelector('button');
  btn.disabled = true; btn.textContent = 'Gönderiliyor...';
  try{
    await addDoc(thoughtsRef, { text: val.slice(0,180), createdAt: serverTimestamp() });
    input.value='';
  }catch(err){
    alert('Yorum gönderilemedi. Firebase/Firestore ayarlarını kontrol et.');
    console.error(err);
  }finally{
    btn.disabled = false; btn.textContent = 'Anonim Paylaş';
  }
});

const navLinks = $$('.nav a');
window.addEventListener('scroll',()=>{let current='anasayfa'; $$('main section[id]').forEach(sec=>{ if(scrollY >= sec.offsetTop-120) current=sec.id; }); navLinks.forEach(a=>a.classList.toggle('active',a.getAttribute('href')==='#'+current));});
