/* Wolkenpark · Verhalten der Website
   Ohne JavaScript bleibt alles bedienbar: die Navigation ist ein <details>-Element,
   die Galerie zeigt dann einfach alle Bilder und die Bilder sind direkt verlinkt. */

/* ---------- Navigation schliessen bei Escape oder Klick daneben ---------- */
const navHuelle = document.querySelector('.nav-huelle');
if (navHuelle) {
  document.addEventListener('click', e => {
    if (navHuelle.open && !navHuelle.contains(e.target)) navHuelle.open = false;
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navHuelle.open) { navHuelle.open = false; navHuelle.querySelector('summary').focus(); }
  });
  navHuelle.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navHuelle.open = false));
}

/* ---------- Bildansicht ------------------------------------------------- */
const lupe = document.getElementById('lupe');
if (lupe) {
  const bild    = lupe.querySelector('[data-lupe-bild]');
  const titel   = lupe.querySelector('[data-lupe-titel]');
  const unter   = lupe.querySelector('[data-lupe-untertitel]');
  const zaehler = lupe.querySelector('[data-lupe-zaehler]');
  const zurueck = lupe.querySelector('[data-lupe-zurueck]');
  const weiter  = lupe.querySelector('[data-lupe-weiter]');
  const buchlink= lupe.querySelector('[data-lupe-buch]');

  let liste = [], pos = 0, ausloeser = null;

  const zeigen = i => {
    const w = liste[i]; if (!w) return;
    pos = i;
    bild.src = w.dataset.bild;
    bild.alt = w.querySelector('img').alt;
    titel.textContent = w.dataset.titel;
    unter.textContent = w.dataset.untertitel;
    zaehler.textContent = `${i + 1} von ${liste.length}`;
    zurueck.disabled = i === 0;
    weiter.disabled  = i === liste.length - 1;
    if (buchlink && w.dataset.buchlink) buchlink.href = w.dataset.buchlink;
  };

  // Jede Galerie bzw. jedes Blaetterband ist eine eigene Blaettergruppe.
  document.querySelectorAll('[data-lupe-gruppe]').forEach(gruppe => {
    gruppe.addEventListener('click', e => {
      const w = e.target.closest('.werk'); if (!w) return;
      ausloeser = w;
      liste = [...gruppe.querySelectorAll('.werk')].filter(el => !el.hidden);
      zeigen(liste.indexOf(w));
      lupe.showModal();
    });
  });

  zurueck.addEventListener('click', () => zeigen(pos - 1));
  weiter .addEventListener('click', () => zeigen(pos + 1));
  lupe.querySelector('.schliessen').addEventListener('click', () => lupe.close());

  lupe.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft'  && pos > 0)                zeigen(pos - 1);
    if (e.key === 'ArrowRight' && pos < liste.length - 1) zeigen(pos + 1);
  });
  // Klick auf den Hintergrund schliesst - auf dem Smartphone fuellt der Dialog den Schirm.
  lupe.addEventListener('click', e => { if (e.target === lupe) lupe.close(); });
  lupe.addEventListener('close', () => ausloeser && ausloeser.focus());
}

/* ---------- Galeriefilter ------------------------------------------------ */
const galerie = document.getElementById('galerie');
if (galerie) {
  const werke   = [...galerie.querySelectorAll('.werk')];
  const treffer = document.getElementById('treffer');
  const leer    = document.getElementById('leerzustand');
  const ohne    = document.getElementById('ohne-treffer');
  const werkzeuge = document.querySelector('.galerie-werkzeuge');
  const raster  = document.getElementById('galerie-raster');
  const filter  = { buch: 'alle', motiv: 'alle' };

  const anwenden = () => {
    let sichtbar = 0;
    werke.forEach(w => {
      const passt = (filter.buch  === 'alle' || w.dataset.buch  === filter.buch)
                 && (filter.motiv === 'alle' || w.dataset.motiv === filter.motiv);
      w.hidden = !passt;
      if (passt) sichtbar++;
    });
    // Zwei verschiedene Leerzustände, die verschiedene Texte brauchen:
    // noch gar keine Einsendung gegenüber "dieser Filter trifft nichts".
    const nochNichts = werke.length === 0;
    raster.hidden    = sichtbar === 0;
    leer.hidden      = !nochNichts;
    ohne.hidden      = nochNichts || sichtbar !== 0;
    werkzeuge.hidden = nochNichts;   // Filtern, wenn es nichts zu filtern gibt, hilft niemandem
    treffer.textContent = sichtbar === 1 ? '1 Bild' : `${sichtbar} Bilder`;
    treffer.hidden = sichtbar === 0;
  };

  galerie.querySelectorAll('button[data-filter]').forEach(knopf => {
    knopf.addEventListener('click', () => {
      const art = knopf.dataset.filter;
      filter[art] = knopf.dataset.wert;
      galerie.querySelectorAll(`button[data-filter="${art}"]`).forEach(k =>
        k.setAttribute('aria-pressed', String(k === knopf)));
      anwenden();
    });
  });

  const motivfeld = galerie.querySelector('select[data-filter]');
  if (motivfeld) motivfeld.addEventListener('change', () => {
    filter[motivfeld.dataset.filter] = motivfeld.value;
    anwenden();
  });

  // Filter zurücksetzen
  const zuruecksetzen = document.getElementById('filter-zuruecksetzen');
  if (zuruecksetzen) zuruecksetzen.addEventListener('click', () => {
    filter.buch = filter.motiv = 'alle';
    galerie.querySelectorAll('button[data-filter]').forEach(k =>
      k.setAttribute('aria-pressed', String(k.dataset.wert === 'alle')));
    if (motivfeld) motivfeld.value = 'alle';
    anwenden();
  });

  anwenden();
}

/* ---------- E-Mail-Adresse kopieren -------------------------------------- */
document.querySelectorAll('[data-kopieren]').forEach(knopf => {
  const rueckmeldung = document.getElementById(knopf.dataset.kopieren);
  knopf.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText('bilder@wolkenpark.de');
      rueckmeldung.textContent = 'Adresse kopiert.';
    } catch {
      rueckmeldung.textContent = 'Bitte die Adresse von Hand markieren und kopieren.';
    }
    setTimeout(() => rueckmeldung.textContent = '', 4000);
  });
});
