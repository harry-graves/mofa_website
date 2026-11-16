/* MOFA Drylining Services Limited – site behaviour */

/* ---- Contact details: edit once here and the whole site updates ---- */
const CONTACT = {
  phoneDisplay: "0000 000 0000",
  phoneLink: "+440000000000",
  email: "info@example.com"
};

document.addEventListener("DOMContentLoaded", () => {
  /* Apply contact details */
  document.querySelectorAll('[data-contact="phone"]').forEach(a => {
    a.textContent = CONTACT.phoneDisplay;
    a.href = "tel:" + CONTACT.phoneLink;
  });
  document.querySelectorAll('[data-contact="phone-fab"]').forEach(a => {
    a.href = "tel:" + CONTACT.phoneLink;
  });
  document.querySelectorAll('[data-contact="email"]').forEach(a => {
    a.textContent = CONTACT.email;
    a.href = "mailto:" + CONTACT.email;
  });

  /* Footer year */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---- Mobile nav ---- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");
  const closeNav = () => {
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", closeNav));
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeNav(); });

  /* ---- Before / After tabs ---- */
  const compare = document.querySelector("[data-compare]");
  if (compare) {
    const tabs = compare.querySelectorAll("[role='tab']");
    const panes = compare.querySelectorAll("[data-pane]");
    const show = name => {
      tabs.forEach(t => t.setAttribute("aria-selected", String(t.dataset.target === name)));
      panes.forEach(p => p.classList.toggle("is-active", p.dataset.pane === name));
    };
    tabs.forEach(t => t.addEventListener("click", () => show(t.dataset.target)));
  }

  /* ---- Gallery filter ---- */
  const filters = document.querySelectorAll(".filter");
  const items = document.querySelectorAll(".g-item");
  filters.forEach(btn => {
    btn.addEventListener("click", () => {
      filters.forEach(f => f.classList.remove("is-active"));
      btn.classList.add("is-active");
      const cat = btn.dataset.filter;
      items.forEach(it => it.classList.toggle("is-hidden", cat !== "all" && it.dataset.cat !== cat));
    });
  });

  /* ---- Lightbox ---- */
  const lb = document.getElementById("lightbox");
  const lbImg = lb.querySelector("img");
  const lbCap = lb.querySelector("figcaption");
  let current = 0;
  let lastFocus = null;

  const visibleButtons = () =>
    [...document.querySelectorAll(".g-item:not(.is-hidden) .g-btn")];

  const render = () => {
    const list = visibleButtons();
    if (!list.length) return;
    current = (current + list.length) % list.length;
    const btn = list[current];
    lbImg.src = btn.dataset.full;
    lbImg.alt = btn.querySelector("img").alt;
    lbCap.textContent = btn.dataset.caption || "";
  };
  const openLb = btn => {
    lastFocus = btn;
    current = visibleButtons().indexOf(btn);
    render();
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    lb.querySelector(".lb-close").focus();
  };
  const closeLb = () => {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  };

  document.querySelectorAll(".g-btn").forEach(btn =>
    btn.addEventListener("click", () => openLb(btn)));
  lb.querySelector(".lb-close").addEventListener("click", closeLb);
  lb.querySelector(".lb-prev").addEventListener("click", () => { current--; render(); });
  lb.querySelector(".lb-next").addEventListener("click", () => { current++; render(); });
  lb.addEventListener("click", e => { if (e.target === lb) closeLb(); });
  document.addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") { current--; render(); }
    if (e.key === "ArrowRight") { current++; render(); }
  });

  /* ---- Scroll reveal ---- */
  const revealTargets = document.querySelectorAll(".card, .steps li, .section-head, .about > *, .contact > *");
  revealTargets.forEach(el => el.classList.add("reveal"));
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add("in"); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add("in"));
  }

  /* ---- Quote form (opens the visitor's email app with the enquiry filled in) ---- */
  const form = document.getElementById("quote-form");
  const note = document.getElementById("form-note");

  const setError = (input, msg) => {
    const field = input.closest(".field");
    field.classList.toggle("invalid", Boolean(msg));
    field.querySelector(".error").textContent = msg || "";
  };

  form.addEventListener("submit", e => {
    e.preventDefault();
    note.textContent = "";
    const name = form.name;
    const phone = form.phone;
    const email = form.email;
    const message = form.message;
    let ok = true;

    setError(name, name.value.trim() ? "" : "Please enter your name."); if (!name.value.trim()) ok = false;
    setError(phone, phone.value.trim().length >= 6 ? "" : "Please enter a phone number."); if (phone.value.trim().length < 6) ok = false;
    const emailBad = email.value.trim() && !/^\S+@\S+\.\S+$/.test(email.value.trim());
    setError(email, emailBad ? "Please enter a valid email." : ""); if (emailBad) ok = false;
    setError(message, message.value.trim() ? "" : "Please tell us about the job."); if (!message.value.trim()) ok = false;
    if (!ok) return;

    const subject = encodeURIComponent("Quote enquiry – " + form.service.value);
    const body = encodeURIComponent(
      `Name: ${name.value.trim()}\nPhone: ${phone.value.trim()}\nEmail: ${email.value.trim() || "n/a"}\nService: ${form.service.value}\n\n${message.value.trim()}`
    );
    window.location.href = `mailto:${CONTACT.email}?subject=${subject}&body=${body}`;
    note.textContent = "Thanks! Your email app should open with your enquiry ready to send.";
    form.reset();
  });
});
