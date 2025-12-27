(function () {
  const qs = (s, root=document) => root.querySelector(s);
  const qsa = (s, root=document) => Array.from(root.querySelectorAll(s));

  // ---------------------------
  // WhatsApp helper
  // ---------------------------
  function openWA(text){
    const phone = (window.WA_PHONE || "34677745834").replace(/\D/g,'');
    const msg = encodeURIComponent(text);
    const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, "_blank");
  }

  // Bind buttons with data-wa
  qsa("[data-wa]").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const t = btn.getAttribute("data-wa") || "Hola, quiero pedir presupuesto.";
      openWA(t);
    });
  });

  // ---------------------------
  // Hours stepper (optional)
  // ---------------------------
  const hoursInput = qs("#hours");
  const minus = qs("#hoursMinus");
  const plus = qs("#hoursPlus");

  function clampHours(v){
    v = parseInt(v || "0", 10);
    if (Number.isNaN(v)) v = 2;
    if (v < 1) v = 1;
    if (v > 12) v = 12;
    return v;
  }

  if (hoursInput && minus && plus) {
    hoursInput.value = clampHours(hoursInput.value || 2);

    minus.addEventListener("click", (e) => {
      e.preventDefault();
      hoursInput.value = clampHours(parseInt(hoursInput.value, 10) - 1);
    });

    plus.addEventListener("click", (e) => {
      e.preventDefault();
      hoursInput.value = clampHours(parseInt(hoursInput.value, 10) + 1);
    });
  }

  // ---------------------------
  // Form submit -> WhatsApp (optional)
  // ---------------------------
  const form = qs("form[data-service]");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const service = (form.getAttribute("data-service") || "Servicio").trim();
      const name = (qs("#name")?.value || "").trim();
      const phone = (qs("#phone")?.value || "").trim();
      const email = (qs("#email")?.value || "").trim();
      const date = (qs("#date")?.value || "").trim();
      const place = (qs("#place")?.value || "").trim();
      const hours = (qs("#hours")?.value || "").trim();

      const lines = [
        `Hola, quiero pedir presupuesto.`,
        `Servicio: ${service}`,
        name ? `Nombre: ${name}` : "",
        phone ? `Teléfono: ${phone}` : "",
        email ? `E-mail: ${email}` : "",
        date ? `Fecha: ${date}` : "",
        place ? `Ubicación: ${place}` : "",
        hours ? `Horas: ${hours}` : "",
      ].filter(Boolean);

      openWA(lines.join("\n"));
    });
  }

  // ---------------------------
  // Accordion (one open)
  // ---------------------------
  const accButtons = qsa(".acc-btn");
  const accPanels  = qsa(".acc-panel");

  function closeAll(){
    accPanels.forEach(p => p.classList.remove("is-open"));
    accButtons.forEach(b => b.classList.remove("is-active"));
  }

  accButtons.forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute("data-target");
      const panel = targetId ? qs(targetId) : null;
      if (!panel) return;

      const isOpen = panel.classList.contains("is-open");
      closeAll();
      if (!isOpen){
        btn.classList.add("is-active");
        panel.classList.add("is-open");
      }
    });
  });

  // Close when clicking anywhere on opened panel,
  // BUT do not close if click is inside ".no-close" (slider etc.)
  accPanels.forEach(panel => {
    panel.addEventListener("click", (e) => {
      if (!panel.classList.contains("is-open")) return;
      if (e.target.closest(".no-close")) return;
      closeAll();
    });
  });

  // ---------------------------
  // Lightweight slider (scroll-snap + buttons)
  // ---------------------------
  qsa("[data-slider]").forEach(slider => {
    const track = qs("[data-track]", slider);
    const prev = qs(".prev", slider);
    const next = qs(".next", slider);

    if (!track) return;

    // Ensure slider clicks don't bubble to panel close
    slider.classList.add("no-close");

    function step(dir){
      const slide = qs(".slide", track);
      if(!slide) return;
      const w = slide.getBoundingClientRect().width;
      track.scrollBy({ left: dir * (w + 12), behavior: "smooth" });
    }

    prev && prev.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); step(-1); });
    next && next.addEventListener("click", (e) => { e.preventDefault(); e.stopPropagation(); step(1); });
  });
 document.querySelectorAll("[data-yt]").forEach(box => {
  const id = box.getAttribute("data-yt");
  if(!id) return;

  box.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    box.innerHTML =
      `<iframe
        src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen
      ></iframe>`;
  });
});
document.querySelectorAll(".yt-card[data-yt]").forEach(card => {
  const id = card.getAttribute("data-yt");
  if(!id) return;

  card.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    card.innerHTML =
      `<iframe
        src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen
      ></iframe>`;
  });
});
function ytThumbUrl(id){
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

function resetYtCard(card){
  const id = card.getAttribute("data-yt");
  if(!id) return;

  // Якщо вже на прев'ю — нічого не робимо
  if(!card.querySelector("iframe")) return;

  // Беремо alt зі старого img якщо був, інакше дефолт
  const alt = card.getAttribute("data-alt") || "Video";
  card.innerHTML = `
    <img class="yt-thumb" src="${ytThumbUrl(id)}" alt="${alt}" loading="lazy" decoding="async">
    <span class="yt-play" aria-hidden="true">▶</span>
  `;
}

function openYtCard(card){
  const id = card.getAttribute("data-yt");
  if(!id) return;

  // Не відкривати повторно
  if(card.querySelector("iframe")) return;

  card.innerHTML = `
    <iframe
      src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&playsinline=1&rel=0"
      allow="autoplay; encrypted-media; picture-in-picture"
      allowfullscreen
    ></iframe>
  `;
}

document.querySelectorAll("[data-yt-slider]").forEach(slider => {
  const cards = slider.querySelectorAll(".yt-card[data-yt]");

  // Зберігаємо alt, щоб при reset не губити
  cards.forEach((card, i) => {
    const img = card.querySelector("img");
    if(img) card.setAttribute("data-alt", img.getAttribute("alt") || `Video ${i+1}`);

    card.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Закриваємо всі інші
      cards.forEach(c => { if(c !== card) resetYtCard(c); });

      // Відкриваємо поточне
      openYtCard(card);
    });
  });

  // --- Auto-stop on swipe/scroll in slider ---
  // Коли трек прокручується, ми після паузи "snap" закриваємо всі відео,
  // окрім найбільш видимого слайда.
  const track = slider.querySelector("[data-track]");
  if(!track) return;

  let t = null;
  track.addEventListener("scroll", () => {
    clearTimeout(t);
    t = setTimeout(() => {
      // знайти найбільш видимий slide
      const trackRect = track.getBoundingClientRect();
      let best = null;
      let bestArea = 0;

      track.querySelectorAll(".slide").forEach(slide => {
        const r = slide.getBoundingClientRect();
        const left = Math.max(r.left, trackRect.left);
        const right = Math.min(r.right, trackRect.right);
        const visibleW = Math.max(0, right - left);
        if(visibleW > bestArea){
          bestArea = visibleW;
          best = slide;
        }
      });

      // reset всі, крім того що в best
      cards.forEach(card => {
        const slide = card.closest(".slide");
        if(!best || slide !== best) resetYtCard(card);
      });
    }, 180);
  }, { passive: true });
});




})();
