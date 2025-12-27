(() => {
  // 1) Вставите сюди WhatsApp номер (без +, без пробілів). Приклад: 34600111222
  const WHATSAPP_NUMBER = "34677745834";

  // 2) Сюди вставите URL вашого Google Apps Script Web App (пізніше)
  // Приклад: https://script.google.com/macros/s/....../exec
  const FORM_ENDPOINT = "";

  const qs = new URLSearchParams(location.search);

  const getUTM = () => {
    const keys = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term"];
    const stored = JSON.parse(localStorage.getItem("hp_utm") || "{}");
    const current = {};
    keys.forEach(k => {
      const v = qs.get(k);
      if (v) current[k] = v;
    });
    const merged = { ...stored, ...current };
    localStorage.setItem("hp_utm", JSON.stringify(merged));
    return merged;
  };

  const setHidden = (form, name, value) => {
    let el = form.querySelector(`input[name="${name}"]`);
    if (!el) {
      el = document.createElement("input");
      el.type = "hidden";
      el.name = name;
      form.appendChild(el);
    }
    el.value = value ?? "";
  };

  const buildWaText = ({service, name, date, city}) => {
    const s = service ? `Servicio: ${service}` : "Servicio: Wedding services";
    const n = name ? `Nombre: ${name}` : "";
    const d = date ? `Fecha: ${date}` : "";
    const c = city ? `Ciudad/Lugar: ${city}` : "";
    const lines = [ "Hola Leo, me interesa presupuesto.", s, n, d, c ].filter(Boolean);
    return lines.join("%0A");
  };

  const setupWhatsAppLinks = () => {
    const links = document.querySelectorAll("[data-wa]");
    links.forEach(a => {
      a.addEventListener("click", () => {
        // можна додати analytics пізніше
      });
    });
  };

  const initForm = (form) => {
    const utm = getUTM();
    setHidden(form, "page", location.pathname);
    setHidden(form, "referrer", document.referrer || "");
    Object.entries(utm).forEach(([k,v]) => setHidden(form, k, v));

    const service = form.getAttribute("data-service") || "";
    setHidden(form, "service", service);

    // WhatsApp CTA — підставляємо повідомлення з полів форми
    const waLinks = document.querySelectorAll(`a[data-wa="${form.id}"], a[data-wa="global"]`);
    const updateWa = () => {
      const name = (form.querySelector('[name="name"]')?.value || "").trim();
      const date = (form.querySelector('[name="date"]')?.value || "").trim();
      const city = (form.querySelector('[name="city"]')?.value || "").trim();
      const text = buildWaText({ service, name, date, city });
      const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
      waLinks.forEach(a => a.href = url);
    };
    form.addEventListener("input", updateWa);
    updateWa();

    // Anti-spam simple
    const startedAt = Date.now();
    const honeypot = form.querySelector('[name="company"]');

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Honeypot check
      if (honeypot && honeypot.value.trim() !== "") return;

      // Time check (bots submit too fast)
      if (Date.now() - startedAt < 1200) return;

      const data = {};
      new FormData(form).forEach((v,k) => data[k] = String(v));

      // Якщо endpoint ще не підключено — просто редирект на gracias
      if (!FORM_ENDPOINT) {
        localStorage.setItem("hp_lastlead", JSON.stringify(data));
        location.href = "/gracias/";
        return;
      }

      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          mode: "cors",
        });
        // навіть якщо Apps Script поверне щось дивне — ми все одно ведемо на gracias
        localStorage.setItem("hp_lastlead", JSON.stringify(data));
        location.href = "/gracias/";
      } catch (err) {
        // fallback
        localStorage.setItem("hp_lastlead", JSON.stringify(data));
        location.href = "/gracias/";
      }
    });
  };

  document.addEventListener("DOMContentLoaded", () => {
    setupWhatsAppLinks();
    document.querySelectorAll("form[data-service]").forEach(initForm);
  });
})();
