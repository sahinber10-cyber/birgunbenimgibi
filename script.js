const modal=document.getElementById('modal');const body=document.getElementById('modalBody');
const data={
  dyslexia:{title:'Disleksi Deneyimi',html:`<h2>Disleksi Deneyimi</h2><p>Bu örnekte harflerin yer değiştirmesi, okuma sürecinin bazı bireyler için ne kadar yorucu olabileceğini hissettirmek içindir.</p><div class="demoText scramble"><span>H</span><span>e</span><span>r</span><span>k</span><span>e</span><span>s</span> aynı hızda okumaz; önemli olan doğru desteği bulmaktır.</div>`},
  autism:{title:'Otizm Spektrum Bozukluğu',html:`<h2>Otizm Spektrum Bozukluğu</h2><p>Yoğun ışık, ses ve kalabalık bazı bireyler için zorlayıcı olabilir. Anlayışlı olmak, ortamı düzenlemek ve iletişimde net olmak önemlidir.</p><div class="demoText flash">Işıklar, sesler, kalabalık... Bazen dünya çok fazla gelebilir.</div>`},
  dehb:{title:'DEHB Deneyimi',html:`<h2>DEHB Deneyimi</h2><p>Dikkat eksikliği ve hiperaktivite bozukluğu tembellik değildir. Bireyin dikkatini sürdürmesini etkileyen nörogelişimsel bir farklılıktır.</p><div class="demoText">Şimdi şu cümleyi oku... ama ekranda her şey aynı anda dikkatini çekiyor gibi düşün.</div>`},
  hearing:{title:'İşitme Yetersizliği',html:`<h2>İşitme Yetersizliği</h2><p>İletişim yalnızca sesle kurulmaz. Göz teması, yüz ifadesi, açık konuşma ve destekleyici araçlar iletişimi güçlendirir.</p>`},
  vision:{title:'Görme Yetersizliği',html:`<h2>Görme Yetersizliği</h2><p>Erişilebilir tasarım, büyük yazılar, kontrast ve betimlemeler herkes için daha kapsayıcı bir deneyim sağlar.</p>`},
  society:{title:'Toplumsal Farkındalık',html:`<h2>Toplumsal Farkındalık</h2><p>En büyük değişim bazen küçük bir cümleyle başlar: “Seni anlamak için buradayım.”</p>`}
};
document.querySelectorAll('[data-modal]').forEach(btn=>btn.addEventListener('click',()=>{body.innerHTML=data[btn.dataset.modal].html;modal.classList.add('show')}));
function closeModal(){modal.classList.remove('show')}modal.addEventListener('click',e=>{if(e.target===modal)closeModal()});
function answer(ok){const r=document.getElementById('result');r.textContent=ok?'Doğru! Özel eğitim, bireysel farklılıklara uygun destek sunar.':'Tekrar düşün. Özel eğitim yalnızca tek bir gruba yönelik değildir.';r.style.color=ok?'#58d68d':'#ff6b6b'}
