/* ============================================================
   HODLYPODLY — zdieľaný engine
   ============================================================ */
(function(){
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- nav state ---- */
  var nav = document.getElementById("nav");
  var darkSecs = document.querySelectorAll(".scrub");
  function navState(){
    if(!nav) return;
    var overDark = false, y = 70;
    darkSecs.forEach(function(s){
      var r = s.getBoundingClientRect();
      if(r.top < y && r.bottom > 0) overDark = true;
    });
    nav.classList.toggle("on-dark", overDark);
    nav.classList.toggle("solid", !overDark && scrollY > 40);
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
          var fi=(j===0)?1:Math.min(1,lp/0.22), fo=(j===n-1)?1:Math.min(1,(1-lp)/0.22);
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


  /* ===== mini-scrub: video reaguje na poziciu vo viewporte (bez sticky) ===== */
  var minis=[];
  document.querySelectorAll("video[data-miniscrub]").forEach(function(v){
    var m={v:v,src:v.dataset.src,cur:0,fetching:false,ready:false,seekBusy:false,pending:-1};
    v.addEventListener("seeked",function(){
      m.seekBusy=false;
      if(m.pending>=0){ var t=m.pending; m.pending=-1; m.seekBusy=true; try{v.currentTime=t;}catch(e){m.seekBusy=false;} }
    });
    minis.push(m);
  });
  function loadMini(m){
    if(m.fetching) return; m.fetching=true;
    fetch(m.src).then(function(r){return r.blob();}).then(function(b){
      m.v.src=URL.createObjectURL(b); m.v.load();
      m.v.addEventListener("loadedmetadata",function(){ this.pause(); m.ready=true; m.v.classList.add("on"); },{once:true});
    }).catch(function(){});
  }
  function miniSeek(m,t){
    if(m.seekBusy){ m.pending=t; return; }
    if(Math.abs(m.v.currentTime-t)<0.006) return;
    m.seekBusy=true;
    try{ m.v.currentTime=t; }catch(e){ m.seekBusy=false; }
  }
  function miniTick(){
    var vh=innerHeight;
    minis.forEach(function(m){
      var r=m.v.getBoundingClientRect();
      if(!m.fetching && r.top<vh*1.8 && r.bottom>-vh) loadMini(m);
      if(r.bottom<0||r.top>vh) return;
      // progres: 0 ked vchadza zospodu, 1 ked odchadza hore
      var p=Math.min(1,Math.max(0,(vh-r.top)/(vh+r.height)));
      m.cur+=(p-m.cur)*0.12;
      if(Math.abs(p-m.cur)<0.0004) m.cur=p;
      var d=m.v.duration;
      if(m.ready&&d) miniSeek(m, m.cur*(d-0.05));
    });
    requestAnimationFrame(miniTick);
  }
  if(minis.length && !reduced) requestAnimationFrame(miniTick);
  else minis.forEach(function(m){ loadMini(m); });


  /* ===== ping-pong idle video: plynula sluka tam a spat, bez strihu ===== */
  var pongs=[];
  document.querySelectorAll("video[data-pingpong]").forEach(function(v){
    var m={v:v,src:v.dataset.src,t:0,dir:1,last:0,fetching:false,ready:false,seekBusy:false,pending:-1};
    v.addEventListener("seeked",function(){
      m.seekBusy=false;
      if(m.pending>=0){ var t=m.pending; m.pending=-1; m.seekBusy=true; try{v.currentTime=t;}catch(e){m.seekBusy=false;} }
    });
    pongs.push(m);
  });
  function loadPong(m){
    if(m.fetching) return; m.fetching=true;
    fetch(m.src).then(function(r){return r.blob();}).then(function(b){
      m.v.src=URL.createObjectURL(b); m.v.load();
      m.v.addEventListener("loadedmetadata",function(){ this.pause(); m.ready=true; m.v.classList.add("on"); },{once:true});
    }).catch(function(){});
  }
  function pongSeek(m,t){
    if(m.seekBusy){ m.pending=t; return; }
    m.seekBusy=true;
    try{ m.v.currentTime=t; }catch(e){ m.seekBusy=false; }
  }
  function pongTick(now){
    var vh=innerHeight;
    pongs.forEach(function(m){
      var r=m.v.getBoundingClientRect();
      if(!m.fetching && r.top<vh*1.8 && r.bottom>-vh) loadPong(m);
      if(!m.ready || r.bottom<0 || r.top>vh){ m.last=now; return; }
      var dt=Math.min((now-m.last)/1000, .05); m.last=now;
      var d=m.v.duration-0.08;
      m.t += m.dir*dt*0.8;               /* 0.8x rychlost = este jemnejsie */
      if(m.t>=d){ m.t=d; m.dir=-1; }
      if(m.t<=0){ m.t=0; m.dir=1; }
      pongSeek(m, m.t);
    });
    requestAnimationFrame(pongTick);
  }
  if(pongs.length && !reduced) requestAnimationFrame(pongTick);
  else pongs.forEach(function(m){ loadPong(m); });

  /* ===== kontakt formular na podstranke ===== */
  var cf = document.querySelector(".cform");
  if(cf){
    var cform = cf.querySelector("form");
    cform.addEventListener("submit", function(e){
      e.preventDefault();
      var data = new FormData(cform);
      fetch("/", {method:"POST", headers:{"Content-Type":"application/x-www-form-urlencoded"},
        body:new URLSearchParams(data).toString()})
        .then(function(){ cf.classList.add("done"); })
        .catch(function(){ cf.classList.add("done"); });
    });
  }

  /* ===== Vimeo facade: iframe az po kliku ===== */
  document.querySelectorAll("[data-vimeo]").forEach(function(f){
    function play(){
      var id=f.dataset.vimeo;
      if(f.classList.contains("playing")) return;
      f.classList.add("playing");
      f.insertAdjacentHTML("beforeend",'<iframe src="https://player.vimeo.com/video/'+id+'?app_id=122963&autoplay=1&title=0&byline=0&portrait=0&dnt=1" allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>');
    }
    f.addEventListener("click",play);
    f.addEventListener("keydown",function(e){ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); play(); } });
  });

  /* ===== mobilne menu ===== */
  var burger=document.querySelector(".burger");
  if(burger){
    burger.addEventListener("click",function(){
      var open=document.body.classList.toggle("menu-open");
      burger.setAttribute("aria-expanded", open);
    });
    document.querySelectorAll("[data-mm]").forEach(function(a){
      a.addEventListener("click",function(){ document.body.classList.remove("menu-open"); });
    });
    addEventListener("keydown",function(e){ if(e.key==="Escape") document.body.classList.remove("menu-open"); });
  }

  /* ===== drag-to-scroll pre volny rail ===== */
  document.querySelectorAll(".hrail-free").forEach(function(rail){
    var down=false,sx=0,sl=0;
    rail.addEventListener("mousedown",function(e){down=true;sx=e.pageX;sl=rail.scrollLeft;});
    addEventListener("mouseup",function(){down=false;});
    addEventListener("mousemove",function(e){ if(!down) return; e.preventDefault(); rail.scrollLeft=sl-(e.pageX-sx); });
  });

  /* ===== modaly (registrácia + kontakt) ===== */
  document.querySelectorAll(".modal-back").forEach(function(back){
    back.style.display="";  /* do inicializacie bol display:none — ziadny flash pri page load */
    var modal=back.querySelector(".modal");
    function closeM(){ back.classList.remove("open"); document.body.style.overflow=""; }
    back.addEventListener("click",function(e){ if(e.target===back) closeM(); });
    back.querySelector(".modal-x").addEventListener("click",closeM);
    addEventListener("keydown",function(e){ if(e.key==="Escape") closeM(); });
    var form=back.querySelector("form");
    if(form){
      form.addEventListener("submit",function(e){
        e.preventDefault();
        var data=new FormData(form);
        fetch("/",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
          body:new URLSearchParams(data).toString()})
        .then(function(){ modal.classList.add("done"); })
        .catch(function(){ modal.classList.add("done"); });
      });
    }
  });
  document.querySelectorAll("[data-modal-open]").forEach(function(b){
    b.addEventListener("click",function(e){
      e.preventDefault();
      var sel=b.getAttribute("data-modal-open")||"#modalBack";
      if(sel==="") sel="#modalBack";
      var back=document.querySelector(sel);
      if(back){ back.classList.add("open"); document.body.style.overflow="hidden"; }
    });
  });
})();
