(()=>{
'use strict';
const reduce=window.matchMedia('(prefers-reduced-motion: reduce)');
const nav=document.querySelector('#siteNav'), menu=document.querySelector('#menuButton'), mobile=document.querySelector('#mobileNav');
const updateScroll=()=>{const y=window.scrollY, max=document.documentElement.scrollHeight-window.innerHeight;nav?.classList.toggle('scrolled',y>window.innerHeight*.68);document.querySelector('#scrollProgress').style.transform=`scaleX(${max>0?Math.min(1,y/max):0})`};
window.addEventListener('scroll',updateScroll,{passive:true});updateScroll();
const closeMenu=()=>{if(!menu)return;menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','فتح قائمة الموقع');mobile.hidden=true;document.body.classList.remove('menu-open')};
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'إغلاق قائمة الموقع':'فتح قائمة الموقع');mobile.hidden=!open;document.body.classList.toggle('menu-open',open)});
mobile?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});
// The GIF is a real animated fallback. Animated WebP is selected on modern browsers.
// On reduced motion, show the same scene as a sharp static photograph.
const pic=document.querySelector('.hero-picture'), film=document.querySelector('#heroFilm');
const applyMotion=()=>{if(!pic||!film)return;if(reduce.matches){pic.querySelector('source')?.remove();film.setAttribute('src',window.innerWidth<650?'assets/hero_poster_mobile.webp':'assets/hero_poster.webp');}else{if(!pic.querySelector('source')){const s=document.createElement('source');s.type='image/webp';s.srcset='assets/hero_motion_hd.webp';pic.prepend(s)}film.setAttribute('src','assets/hero_hd.gif')}};
applyMotion();reduce.addEventListener?.('change',applyMotion);
const dateCard=document.querySelector('#dateCard'),btn=document.querySelector('#dateRevealButton');
const uncover=()=>{dateCard?.classList.add('uncovered');if(btn){btn.setAttribute('aria-expanded','true');btn.disabled=true}};
btn?.addEventListener('click',uncover);
// On the small screen auto-reveal as it enters view: never force guests to discover a click.
if('IntersectionObserver' in window){const d=new IntersectionObserver(entries=>{for(const e of entries){if(e.isIntersecting){if(reduce.matches||window.innerWidth<700)uncover();d.disconnect()}}},{threshold:.45});if(dateCard)d.observe(dateCard)}
// Timeline cards: buttons, swipe, trackpad, mouse; RTL scroll is browser-native.
const stage=document.querySelector('#programmeStage'),track=document.querySelector('#programmeTrack');
const cards=[...document.querySelectorAll('.programme-card')],dots=[...document.querySelectorAll('.dot')];
let current=0;
const mark=i=>{current=Math.max(0,Math.min(cards.length-1,i));dots.forEach((dot,j)=>{dot.classList.toggle('is-selected',j===current);if(j===current)dot.setAttribute('aria-current','true');else dot.removeAttribute('aria-current')});};
const go=i=>{mark(i);const card=cards[current];card?.scrollIntoView({behavior:reduce.matches?'instant':'smooth',block:'nearest',inline:'center'})};
document.querySelector('#prevEvent')?.addEventListener('click',()=>go((current+cards.length-1)%cards.length));
document.querySelector('#nextEvent')?.addEventListener('click',()=>go((current+1)%cards.length));
dots.forEach((dot,i)=>dot.addEventListener('click',()=>go(i)));
if(stage&&'IntersectionObserver' in window){const watch=new IntersectionObserver(entries=>{const visible=entries.filter(x=>x.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible){const i=cards.indexOf(visible.target);if(i!==-1)mark(i)}},{root:stage,threshold:[.4,.6,.85]});cards.forEach(c=>watch.observe(c))}
// Preserve the exact URL in the V6 configuration: never regenerate the map destination.
const mapLink=document.querySelector('#mapsLink'),url=window.INVITATION_CONFIG?.googleMapsUrl;
if(mapLink){try{const parsed=new URL(url);if(parsed.protocol==='https:'&&parsed.hostname==='www.google.com'&&parsed.pathname.startsWith('/maps/'))mapLink.href=url;else throw Error('Invalid map host')}catch{mapLink.removeAttribute('href');mapLink.title='رابط خرائط جوجل غير متاح'}}
// Staggered intersection entrance and subtle scroll-based depth; disabled under reduced motion.
const targets=[...document.querySelectorAll('[data-reveal]')];
if(!reduce.matches&&'IntersectionObserver' in window){document.documentElement.classList.add('motion-ready');const o=new IntersectionObserver(entries=>{entries.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in-view');o.unobserve(x.target)}})},{threshold:.08,rootMargin:'0px 0px 70px 0px'});targets.forEach(t=>o.observe(t))}
else targets.forEach(t=>t.classList.add('in-view'));
})();
