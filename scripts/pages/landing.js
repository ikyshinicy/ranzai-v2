/* Extracted from page inline <script>. */

/* ── MOBILE NAV ── */
function toggleDrawer(){
  const btn=document.getElementById('navHamburger');
  const drawer=document.getElementById('navDrawer');
  const isOpen=drawer.classList.contains('open');
  if(isOpen){closeDrawer();}
  else{drawer.classList.add('open');btn.classList.add('open');document.body.style.overflow='hidden';}
}
function closeDrawer(){
  document.getElementById('navDrawer').classList.remove('open');
  document.getElementById('navHamburger').classList.remove('open');
  document.body.style.overflow='';
}
document.addEventListener('click',function(e){
  const drawer=document.getElementById('navDrawer');
  const btn=document.getElementById('navHamburger');
  if(drawer&&drawer.classList.contains('open')&&!drawer.contains(e.target)&&!btn.contains(e.target))closeDrawer();
});

/* ── LANG ── */
function setLang(lang){
  document.body.className='lang-'+lang;
  document.querySelectorAll('.lang-toggle button').forEach((b,i)=>{
    b.classList.toggle('active',(i===0&&lang==='id')||(i===1&&lang==='en'));
  });
  localStorage.setItem('ranzai_lang',lang);
}
(function(){
  const saved=localStorage.getItem('ranzai_lang')||'id';
  setLang(saved);
})();

/* ── SCROLL REVEAL ── */
const obs=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible');});
},{threshold:.1});
document.querySelectorAll('.reveal').forEach(el=>obs.observe(el));

/* ── FAQ ACCORDION ── */
document.querySelectorAll('.faq-q').forEach(q=>{
  q.addEventListener('click',()=>{
    const item=q.parentElement;
    const isOpen=item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach(i=>i.classList.remove('open'));
    if(!isOpen)item.classList.add('open');
  });
});

/* ── SOCIAL PROOF ── */
const proofNames=['bima','andri','dewi','rizky','sandi','maya','nanda','fajar','raka','lina','yoga','dinda'];
const proofAmounts=['Rp30.000','Rp50.000','Rp75.000','Rp100.000'];
const proofColors=[
  'linear-gradient(135deg,#7c3aed,#1a6bff)',
  'linear-gradient(135deg,#16a34a,#22e5a0)',
  'linear-gradient(135deg,#f97316,#facc15)',
  'linear-gradient(135deg,#2563eb,#00d4c8)',
  'linear-gradient(135deg,#db2777,#f472b6)',
  'linear-gradient(135deg,#0f766e,#00d4c8)'
];
let proofIndex=0;
function maskEmail(name){return name+'******@gmail.com';}
function showProof(){
  const card=document.getElementById('proofCard');
  const avatar=document.getElementById('proofAvatar');
  const nameEl=document.getElementById('proofName');
  const amountEl=document.getElementById('proofAmount');
  const timeEl=document.getElementById('proofTime');
  if(!card)return;
  const name=proofNames[Math.floor(Math.random()*proofNames.length)];
  const amount=proofAmounts[Math.floor(Math.random()*proofAmounts.length)];
  const color=proofColors[proofIndex%proofColors.length];
  avatar.textContent=name.charAt(0).toUpperCase();
  avatar.style.background=color;
  nameEl.textContent=maskEmail(name);
  amountEl.textContent=amount;
  timeEl.textContent=proofIndex===0?'baru saja':(proofIndex*10)+' detik lalu';
  card.classList.add('show');
  setTimeout(()=>card.classList.remove('show'),7200);
  proofIndex=(proofIndex+1)%6;
}
window.addEventListener('load',()=>{
  setTimeout(showProof,1200);
  setInterval(showProof,10000);
});

/* ── REVIEW LOADER ── */
async function loadHomeReviews(){const SUPABASE_URL='https://cavouyzyasnuygkuwizy.supabase.co';const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhdm91eXp5YXNudXlna3V3aXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjQzMDIsImV4cCI6MjA5NDQ0MDMwMn0.P9TepO4RLhxHv03ybUlwGMefCwkdjCnDwNpfqzAS2lo';const reviewsList=document.getElementById('homeReviewsList');if(!reviewsList)return;try{const response=await fetch(`${SUPABASE_URL}/rest/v1/reviews?order=created_at.desc&limit=4`,{headers:{'apikey':SUPABASE_KEY,'Authorization':`Bearer ${SUPABASE_KEY}`}});const reviews=await response.json();if(reviews.length===0){reviewsList.innerHTML='<div class="reviews-loading" style="grid-column:1/-1;padding:40px 20px"><span class="id">Jadilah yang pertama memberikan review di <a href="/contact" style="color:var(--blue);font-weight:900;text-decoration:none">halaman kontak</a>! 🎉</span><span class="en">Be the first to share your feedback on the <a href="/contact" style="color:var(--blue);font-weight:900;text-decoration:none">contact page</a>! 🎉</span></div>';return;}reviewsList.innerHTML=reviews.map(r=>`<div class="review-card reveal"><div class="review-header"><div class="review-info"><div class="review-name">${escapeHtml(r.name)}</div><div class="review-date">${new Date(r.created_at).toLocaleDateString(document.body.className.includes('lang-en')?'en-US':'id-ID',{year:'numeric',month:'short',day:'numeric'})}</div></div><div class="review-rating">${'⭐'.repeat(r.rating)}</div></div><div class="review-comment">${escapeHtml(r.comment)}</div></div>`).join('');obs.observe(...document.querySelectorAll('.review-card'));}catch(e){console.error('Failed to load reviews:',e);reviewsList.innerHTML='<div class="reviews-loading" style="grid-column:1/-1;padding:40px 20px;color:#d32f2f"><span class="id">Gagal memuat review</span><span class="en">Failed to load reviews</span></div>';}}
function escapeHtml(t){const d=document.createElement('div');d.textContent=t;return d.innerHTML;}
window.addEventListener('load',()=>setTimeout(loadHomeReviews,800));
