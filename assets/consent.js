/* ============================================================
   Hodlypodly Consent Manager
   ------------------------------------------------------------
   AKTIVÁCIA MERANIA: doplňte ID nižšie. Kým sú prázdne,
   žiadny merací skript sa nenačíta a lišta funguje len
   ako správca súhlasov pripravený do budúcna.
   ============================================================ */
(function(){
  "use strict";

  /* >>> SEM DOPLNIŤ ID <<< */
  var GA_ID = "";          /* napr. "G-XXXXXXXXXX"  (Google Analytics 4) */
  var META_PIXEL_ID = "";  /* napr. "1234567890"    (Meta/Facebook pixel) */

  var KEY = "hp-consent-v1";
  var state = null; /* {necessary:true, analytics:bool, marketing:bool, ts} */

  /* ---------- Google Consent Mode v2: default = všetko zamietnuté ---------- */
  window.dataLayer = window.dataLayer || [];
  function gtag(){ dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: "denied",
    wait_for_update: 500
  });

  function read(){
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return null;
      var v = JSON.parse(raw);
      if (typeof v.analytics !== "boolean" || typeof v.marketing !== "boolean") return null;
      return v;
    } catch(e){ return null; }
  }
  function save(v){
    state = v;
    try { localStorage.setItem(KEY, JSON.stringify(v)); } catch(e){}
    apply(v);
  }

  /* ---------- aplikovanie súhlasu ---------- */
  var gaLoaded = false, fbLoaded = false;
  function loadGA(){
    if (gaLoaded || !GA_ID) return;
    gaLoaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    gtag("js", new Date());
    gtag("config", GA_ID, { anonymize_ip: true });
  }
  function loadFB(){
    if (fbLoaded || !META_PIXEL_ID) return;
    fbLoaded = true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version="2.0";n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
    document,"script","https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("consent", "grant");
    window.fbq("init", META_PIXEL_ID);
    window.fbq("track", "PageView");
  }
  function apply(v){
    gtag("consent", "update", {
      analytics_storage: v.analytics ? "granted" : "denied",
      ad_storage: v.marketing ? "granted" : "denied",
      ad_user_data: v.marketing ? "granted" : "denied",
      ad_personalization: v.marketing ? "granted" : "denied"
    });
    if (v.analytics) loadGA();
    if (v.marketing) loadFB();
    if (!v.marketing && window.fbq) window.fbq("consent", "revoke");
  }

  /* ---------- UI ---------- */
  var root;
  function ui(expanded, current){
    var c = current || {analytics:false, marketing:false};
    var el = document.createElement("div");
    el.className = "cmp";
    el.setAttribute("role","dialog");
    el.setAttribute("aria-label","Nastavenia cookies");
    el.innerHTML =
      '<p class="cmp-txt">Používame nevyhnutné cookies na fungovanie stránky. So súhlasom aj analytické a marketingové na meranie návštevnosti a kampaní. ' +
      '<a href="ochrana-osobnych-udajov.html">Ako spracúvame údaje</a></p>' +
      '<div class="cmp-opts"' + (expanded ? '' : ' hidden') + '>' +
        row("necessary","Nevyhnutné","Zabezpečujú základné fungovanie stránky.",true,true) +
        row("analytics","Analytika","Anonymné meranie návštevnosti (Google Analytics).",c.analytics,false) +
        row("marketing","Marketing","Meranie kampaní a remarketing (Meta).",c.marketing,false) +
      '</div>' +
      '<div class="cmp-btns">' +
        '<button class="btn cmp-accept" type="button">Prijať všetko</button>' +
        '<button class="btn btn-ghost cmp-reject" type="button">Odmietnuť</button>' +
        (expanded
          ? '<button class="btn btn-ghost cmp-save" type="button">Uložiť výber</button>'
          : '<button class="cmp-more" type="button">Nastavenia</button>') +
      '</div>';
    function row(id,label,desc,on,locked){
      return '<label class="cmp-row' + (locked ? ' is-locked' : '') + '">' +
        '<span><b>' + label + '</b><small>' + desc + '</small></span>' +
        '<input type="checkbox" data-c="' + id + '"' + (on ? ' checked' : '') + (locked ? ' disabled' : '') + '>' +
        '<i class="cmp-sw"></i></label>';
    }
    el.querySelector(".cmp-accept").addEventListener("click", function(){
      save({necessary:true, analytics:true, marketing:true, ts:Date.now()}); close();
    });
    el.querySelector(".cmp-reject").addEventListener("click", function(){
      save({necessary:true, analytics:false, marketing:false, ts:Date.now()}); close();
    });
    var more = el.querySelector(".cmp-more");
    if (more) more.addEventListener("click", function(){ open(true); });
    var saveBtn = el.querySelector(".cmp-save");
    if (saveBtn) saveBtn.addEventListener("click", function(){
      save({
        necessary: true,
        analytics: el.querySelector('[data-c="analytics"]').checked,
        marketing: el.querySelector('[data-c="marketing"]').checked,
        ts: Date.now()
      });
      close();
    });
    return el;
  }
  function open(expanded){
    close();
    root = ui(expanded, state || read());
    document.body.appendChild(root);
  }
  function close(){
    if (root && root.parentNode) root.parentNode.removeChild(root);
    root = null;
  }

  /* ---------- verejné API + init ---------- */
  window.hpConsent = {
    open: function(){ open(true); },
    get: function(){ return state; }
  };

  function init(){
    state = read();
    if (state) apply(state);
    else open(false);
    document.querySelectorAll("[data-cookie-settings]").forEach(function(a){
      a.addEventListener("click", function(e){ e.preventDefault(); open(true); });
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
