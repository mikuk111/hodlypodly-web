HODLYPODLY — LANDING PAGE v2 (3× scrub-scroll + bento)
=======================================================

1) STIAHNI 4 SÚBORY DO assets/ (nie sú v balíku, idú z Higgsfield CDN):

   assets/hero-scrub.mp4  (korytnačka, 4.3 MB)
   https://upload.higgsfield.ai/user_3GGtybhhVbzWJfUQgJ8tpoH1tBG/d755a549-ec2f-488b-828c-e165f69bbeee.mp4

   assets/coin-scrub.mp4  (minca orbit, 5.5 MB)
   https://upload.higgsfield.ai/user_3GGtybhhVbzWJfUQgJ8tpoH1tBG/aaddb0d4-212a-4ae1-b6cf-aef3047e8432.mp4

   assets/ascent-scrub.mp4  (výstup k hladine, 4.9 MB)
   https://upload.higgsfield.ai/user_3GGtybhhVbzWJfUQgJ8tpoH1tBG/763e7e53-9657-45ad-88fd-eb00e5525dff.mp4

   assets/tile-wallet.jpg  (hardvérová peňaženka — bento dlaždica)
   https://upload.higgsfield.ai/user_3GGtybhhVbzWJfUQgJ8tpoH1tBG/c87611ff-d155-4663-b133-6614be6698c3.jpg

   assets/tile-shell.jpg  (textúra panciera — bento dlaždica)
   https://upload.higgsfield.ai/user_3GGtybhhVbzWJfUQgJ8tpoH1tBG/cf43593e-d037-45f1-9f8f-283ece9c733d.jpg

   Originály videí (záloha, s pôvodným kódovaním):
   - turtle: https://d8j0ntlcm91z4.cloudfront.net/user_3GGtybhhVbzWJfUQgJ8tpoH1tBG/hf_20260806_073341_8f4f35b2-6ab4-4684-8969-15f612a1faeb.mp4
   - coin:   https://d8j0ntlcm91z4.cloudfront.net/user_3GGtybhhVbzWJfUQgJ8tpoH1tBG/hf_20260806_074134_90488344-733d-4c7b-aa32-813d34c8b8ac.mp4
   - ascent: https://d8j0ntlcm91z4.cloudfront.net/user_3GGtybhhVbzWJfUQgJ8tpoH1tBG/hf_20260806_074134_ca6e4460-1f65-4543-a9de-2b898d127e97.mp4

2) Celý priečinok "site" pretiahni do Netlify Drop. Hotovo.

ŠTRUKTÚRA STRÁNKY:
  1. SCRUB 1 · Hero — korytnačka (Bitcoin v mojich rukách → claim → CTA)
  2. Problém (oranžová karta)
  3. SCRUB 2 · Minca — vlastníctvo (Nákup je len začiatok → Rozhoduje
     spôsob držania → Skutočné vlastníctvo znamená kontrolu)
  4. BENTO · Ekosystém (webinár/kurz/komunita/hardvér/Robert/obsah)
  5. O Robertovi, story video, webinár, kurz, testimonials, FAQ
  6. SCRUB 3 · Výstup k hladine — manifest (Bitcoin nie je len investícia
     → zmena vlastníctva → Bitcoin v mojich rukách + CTA)
  7. Komunita, final CTA, footer

TECHNIKA:
- Jeden generický scrub engine pre všetky [data-scrub] sekcie.
- Videá sa lazy-loadujú ako blob až keď sa sekcia blíži (rootMargin 120 %).
- Keyframe každé 4 snímky → plynulé currentTime seekovanie.
- Gradient poster fallback pre každú sekciu, prefers-reduced-motion OK.
- Sekcie mimo viewportu engine preskakuje (výkon).
