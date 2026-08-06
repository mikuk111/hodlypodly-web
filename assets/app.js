/* ============================================================
   HODLYPODLY — zdieľaný engine
   ============================================================ */
(function(){
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- nav state ---- */
  var nav = document.getElementById("nav");
  var darkHero = nav && nav.classList.contains("on-dark");
  function navState(){
    if(!nav) return;
    var solidAt = darkHero ? innerHeight*0.5 : 40;
    nav.classList.toggle("solid", scrollY > solidAt);
  }

  /* ---- reveal on scroll ---- */
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target);} });
  },{threshold:.15, rootMargin:"0px 0px -8% 0px"});
  document.querySelectorAll(".rv").forEach(function(el){io.observe(el);});

  /* ===== scrub engine: blob-backed video + coalesced seeks (no jank) ===== */
  var scrubs=[];
  document.querySelectorAll("[data-scrub]").forEach(function(sec){
    var len=+sec.dataset.len||360;
    sec.style.height=len+"vh";
    var v=sec.querySelector("video");
    var s={sec:sec,v:v,msgs:sec.querySelectorAll(".msg"),cur:0,src:sec.dataset.src,
           fetching:false,ready:false,seekBusy:false,pending:-1};
    v.addEventListener("seeked",function(){
      s.seekBusy=false;
      if(s.pending>=0){ var t=s.pending; s.pending=-1; s.seekBusy=true; try{v.currentTime=t;}catch(e){s.seekBusy=false;} }
    });
    scrubs.push(s);
  });
  function loadVideo(s){
    if(s.fetching) return; s.fetching=true;
    fetch(s.src).then(function(r){return r.blob();}).then(function(b){
      var url=URL.createObjectURL(b);
      s.v.src=url; s.v.load();
      s.v.addEventListener("loadedmetadata",function(){ this.pause(); s.ready=true; s.v.classList.add("on"); },{once:true});
    }).catch(function(){
      s.v.src=s.src; s.v.load();
      s.v.addEventListener("loadedmetadata",function(){ this.pause(); s.ready=true; s.v.classList.add("on"); },{once:true});
    });
  }
  if(scrubs[0] && !reduced) loadVideo(scrubs[0]);
  var prime=function(){ scrubs.forEach(function(s){ if(s.ready) s.v.play().then(function(){s.v.pause();}).catch(function(){}); }); removeEventListener("touchstart",prime); };
  addEventListener("touchstart",prime,{passive:true});

  function seekTo(s,t){
    if(s.seekBusy){ s.pending=t; return; }
    if(Math.abs(s.v.currentTime-t)<0.006) return;
    s.seekBusy=true;
    try{ s.v.currentTime=t; }catch(e){ s.seekBusy=false; }
  }

  function tick(){
    var vh=innerHeight;
    scrubs.forEach(function(s){
      var r=s.sec.getBoundingClientRect();
      if(!s.fetching && r.top<vh*2.5) loadVideo(s);
      if(r.bottom<-vh||r.top>vh*2) return;
      var p=Math.min(1,Math.max(0,-r.top/(r.height-vh)));
      s.cur+=(p-s.cur)*0.16;
      if(Math.abs(p-s.cur)<0.0004) s.cur=p;
      var d=s.v.duration;
      if(s.ready&&d) seekTo(s, s.cur*(d-0.05));
      var n=s.msgs.length;
      s.msgs.forEach(function(m,j){
        var a=j/n,b=(j+1)/n,lp=(s.cur-a)/(b-a);
        var o=0,y=40;
        if(lp>0&&lp<1){
          var fi=Math.min(1,lp/0.3), fo=(j===n-1)?1:Math.min(1,(1-lp)/0.3);
          o=Math.min(fi,fo); y=(1-fi)*40-(1-fo)*46;
        } else if(j===0 && s.cur<=a){ o=1; y=0; }
          else if(j===n-1 && lp>=1){ o=1; y=0; }
        m.style.opacity=o;
        m.style.transform="translate3d(0,"+y+"px,0)";
        m.style.pointerEvents = o>0.6 ? "auto" : "none";
      });
    });
    navState();
    requestAnimationFrame(tick);
  }
  if(!reduced) requestAnimationFrame(tick);
  else scrubs.forEach(function(s){ s.sec.style.height="auto"; loadVideo(s); });
  navState();
  addEventListener("scroll", navState, {passive:true});

  /* ===== horizontal scrub rail ===== */
  var hs=document.querySelector("[data-hscrub]");
  if(hs && !reduced){
    var hlen=+hs.dataset.hlen||320;
    hs.style.height=hlen+"vh";
    var rail=hs.querySelector(".hrail"), fill=hs.querySelector(".hprog i");
    var hcur=0;
    function htick(){
      var vh=innerHeight, r=hs.getBoundingClientRect();
      if(r.bottom>=-vh && r.top<=vh*2){
        var p=Math.min(1,Math.max(0,-r.top/(r.height-vh)));
        hcur+=(p-hcur)*0.16;
        if(Math.abs(p-hcur)<0.0004) hcur=p;
        var max=Math.max(0, rail.scrollWidth-innerWidth+innerWidth*0.2);
        rail.style.transform="translate3d(-"+(hcur*max)+"px,0,0)";
        if(fill) fill.style.transform="scaleX("+hcur+")";
      }
      requestAnimationFrame(htick);
    }
    requestAnimationFrame(htick);
  }

  /* ===== modal registrácia ===== */
  var back=document.getElementById("modalBack");
  if(back){
    var modal=back.querySelector(".modal");
    function openM(){ back.classList.add("open"); document.body.style.overflow="hidden"; }
    function closeM(){ back.classList.remove("open"); document.body.style.overflow=""; }
    document.querySelectorAll("[data-modal-open]").forEach(function(b){
      b.addEventListener("click",function(e){ e.preventDefault(); openM(); });
    });
    back.addEventListener("click",function(e){ if(e.target===back) closeM(); });
    back.querySelector(".modal-x").addEventListener("click",closeM);
    addEventListener("keydown",function(e){ if(e.key==="Escape") closeM(); });
    var form=back.querySelector("form");
    if(form){
      form.addEventListener("submit",function(e){
        e.preventDefault();
        /* TODO: sem napojiť reálnu webinárovú platformu (WebinarJam / EverWebinar embed alebo API) */
        modal.classList.add("done");
      });
    }
  }
})();
