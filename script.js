const modal = document.getElementById('modal');
const modalContent = document.getElementById('modalContent');
const closeModal = document.getElementById('closeModal');
let audioCtx, oscillator, noiseNode, intervalId;

function stopAll(){
  clearInterval(intervalId);
  intervalId = null;
  if(oscillator){try{oscillator.stop()}catch(e){} oscillator=null;}
  if(audioCtx){audioCtx.close(); audioCtx=null;}
}
closeModal.onclick = () => { stopAll(); modal.classList.add('hidden'); modalContent.innerHTML=''; };
modal.addEventListener('click', e => { if(e.target===modal) closeModal.click(); });

document.querySelectorAll('.exp-card').forEach(btn=>btn.addEventListener('click',()=>openExp(btn.dataset.exp)));

function openExp(type){
  stopAll();
  const templates = {dyslexia, adhd, autism, hearing, vision, society};
  modalContent.innerHTML = templates[type]();
  modal.classList.remove('hidden');
  if(type==='dyslexia') initDyslexia();
  if(type==='adhd') initADHD();
  if(type==='autism') initAutism();
}

function dyslexia(){return `<h2 class="exp-title">Disleksi Deneyimi</h2><p class="exp-note">Aşağıdaki metni 20 saniye içinde okumaya çalış. Harfler bilinçli olarak zorlayıcı biçimde karışacak.</p><div class="timer">Süre: <span id="time">20</span></div><div class="demo-box"><p id="scramble" class="scramble-text">Özel eğitim, her bireyin farklı öğrenme biçimine saygı duymayı gerektirir. Farkındalık, anlamanın ilk adımıdır.</p></div><div class="action-row"><button class="small-btn" onclick="initDyslexia()">Tekrar Başlat</button></div><p class="exp-note">Amaç dalga geçmek değil; okuma sürecinin bazı bireyler için ne kadar yorucu olabileceğini hissettirmektir.</p>`}
function adhd(){return `<h2 class="exp-title">DEHB Deneyimi</h2><p class="exp-note">Aşağıdaki göreve odaklanmaya çalış. Ekrandaki uyaranlar ve ses dikkatini dağıtacak.</p><div class="demo-box adhd-demo"><p class="task">Görev: Bu cümlede kaç tane “a” harfi olduğunu say.</p><p style="margin-top:20px;color:#ddd;font-size:22px">Anlamak bazen sadece bakmak değil, gerçekten dikkat vermektir.</p><div class="distractor d1">BİLDİRİM!</div><div class="distractor d2">Bak buraya!</div><div class="distractor d3">Süre azalıyor!</div><div class="distractor d4">Yeni mesaj!</div></div><div class="action-row"><button class="small-btn" onclick="startNoise()">Dikkat Dağıtıcı Sesi Aç</button><button class="small-btn" onclick="stopAll()">Sesi Durdur</button></div>`}
function autism(){return `<h2 class="exp-title">Otizm Spektrum Deneyimi</h2><p class="exp-note">Yoğun ışık ve ani uyaranların rahatsız edici olabileceğini göstermek için hazırlanmıştır. Rahatsız olursan hemen durdur.</p><div id="flashBox" class="demo-box flash-demo"><h3 style="font-size:34px">Çok fazla ışık, ses ve hareket aynı anda geldiğinde...</h3><p style="font-size:22px;margin-top:20px">Ortamı takip etmek zorlaşabilir.</p></div><div class="action-row"><button class="small-btn" onclick="document.getElementById('flashBox').classList.add('flashing'); startBeep()">Efekti Başlat</button><button class="small-btn" onclick="document.getElementById('flashBox').classList.remove('flashing'); stopAll()">Durdur</button></div>`}
function hearing(){return `<h2 class="exp-title">İşitme Yetersizliği Deneyimi</h2><p class="exp-note">Bir konuşmayı bozuk ve eksik seslerle dinlediğini düşün. Altyazı ve görsel destek bu yüzden önemlidir.</p><div class="demo-box"><div class="hearing-wave">〰 〰 〰</div><p style="font-size:24px;text-align:center">“B_gün s_z_ anl_tmak ist_d_ğim şey...”</p></div><div class="action-row"><button class="small-btn" onclick="startBrokenVoice()">Bozuk Ses Simülasyonu</button><button class="small-btn" onclick="stopAll()">Durdur</button></div><p class="exp-note">Çözüm: altyazı, yüz yüze iletişim, net konuşma ve görsel destek.</p>`}
function vision(){return `<h2 class="exp-title">Görme Yetersizliği Deneyimi</h2><p class="exp-note">Önce bulanık metni okumayı dene, sonra erişilebilir hâlini karşılaştır.</p><div class="demo-box"><p id="visionText" class="blurred">Erişilebilir tasarım; okunabilir yazı, yeterli kontrast ve sade düzen ile başlar.</p></div><div class="action-row"><button class="small-btn" onclick="document.getElementById('visionText').className='cleartext'">Erişilebilir Hâle Getir</button><button class="small-btn" onclick="document.getElementById('visionText').className='blurred'">Bulanık Göster</button></div>`}
function society(){return `<h2 class="exp-title">Toplumsal Farkındalık</h2><p class="exp-note">Küçük cümleler büyük fark yaratır.</p><div class="society-list"><div><b>❌ Yanlış:</b><br>“Abartıyorsun.”</div><div><b>✅ Doğru:</b><br>“Seni anlamaya çalışıyorum.”</div><div><b>❌ Yanlış:</b><br>“Herkes gibi yap.”</div><div><b>✅ Doğru:</b><br>“Nasıl destek olabilirim?”</div></div>`}

function initDyslexia(){
  clearInterval(intervalId);
  const el = document.getElementById('scramble');
  const timeEl = document.getElementById('time');
  if(!el) return;
  const original = 'Özel eğitim, her bireyin farklı öğrenme biçimine saygı duymayı gerektirir. Farkındalık, anlamanın ilk adımıdır.';
  let t=20;
  timeEl.textContent=t;
  intervalId=setInterval(()=>{
    t--; if(timeEl) timeEl.textContent=t;
    el.textContent = original.split('').map(ch=>{
      if(ch===' ' || ch==='.' || ch===',' ) return ch;
      return Math.random()>.42 ? randomChar(ch) : ch;
    }).join('');
    el.style.transform = `translate(${Math.random()*6-3}px, ${Math.random()*4-2}px)`;
    if(t<=0){clearInterval(intervalId); el.textContent='Deneyim bitti. Şimdi düşün: Bir metni okumak herkes için aynı kolaylıkta olmayabilir.';}
  },700);
}
function randomChar(ch){const letters='abcçdefgğhıijklmnoöprsştuüvyzABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';return letters[Math.floor(Math.random()*letters.length)]}
function startNoise(){ stopAll(); audioCtx=new (window.AudioContext||window.webkitAudioContext)(); oscillator=audioCtx.createOscillator(); const gain=audioCtx.createGain(); oscillator.type='sawtooth'; oscillator.frequency.value=110; gain.gain.value=.035; oscillator.connect(gain); gain.connect(audioCtx.destination); oscillator.start(); }
function startBeep(){ stopAll(); audioCtx=new (window.AudioContext||window.webkitAudioContext)(); oscillator=audioCtx.createOscillator(); const gain=audioCtx.createGain(); oscillator.frequency.value=880; oscillator.type='square'; gain.gain.value=.025; oscillator.connect(gain); gain.connect(audioCtx.destination); oscillator.start(); }
function startBrokenVoice(){ stopAll(); audioCtx=new (window.AudioContext||window.webkitAudioContext)(); oscillator=audioCtx.createOscillator(); const gain=audioCtx.createGain(); oscillator.type='sine'; oscillator.frequency.value=180; gain.gain.value=.04; oscillator.connect(gain); gain.connect(audioCtx.destination); oscillator.start(); intervalId=setInterval(()=>{oscillator.frequency.value=120+Math.random()*340; gain.gain.value=Math.random()>.45?.05:.004},120); }
