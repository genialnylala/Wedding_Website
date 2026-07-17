const byId = (id) => document.getElementById(id);

const SUPPORTED_LANGS = ["en", "pl", "el"];
const DEFAULT_LANG = "en";
const LANGUAGE_KEY = "wedding-site-language";
const SITE_BASE_URL = new URL(".", window.location.href);

const UI_TEXT = {
  en: {
    navStory: "Our Story",
    navSchedule: "Schedule",
    navTravel: "Travel",
    storyLabel: "Who are we?",
    storyTitle: "Our Story",
    scheduleLabel: "Schedule",
    scheduleTitle: "Wedding Weekend",
    travelLabel: "Travel",
    travelTitle: "Travel & Stay",
    faqTitle: "Guest Questions",
    errorTitle: "Content failed to load",
    errorBody: "Please check your content files in /content and try again."
  },
  pl: {
    navStory: "Nasza historia",
    navSchedule: "Plan",
    navTravel: "Podróż",
    storyLabel: "Kim jesteśmy?",
    storyTitle: "Nasza historia",
    scheduleLabel: "Plan",
    scheduleTitle: "Weekend ślubny",
    travelLabel: "Podróż",
    travelTitle: "Dojazd i nocleg",
    faqTitle: "Pytania gości",
    errorTitle: "Nie udało się wczytać treści",
    errorBody: "Sprawdź pliki w /content i spróbuj ponownie."
  },
  el: {
    navStory: "Η ιστορία μας",
    navSchedule: "Πρόγραμμα",
    navTravel: "Ταξίδι",
    storyLabel: "Ποιοι είμαστε;",
    storyTitle: "Η ιστορία μας",
    scheduleLabel: "Πρόγραμμα",
    scheduleTitle: "Πρόγραμμα γάμου",
    travelLabel: "Ταξίδι",
    travelTitle: "Μετακίνηση και διαμονή",
    faqTitle: "Ερωτήσεις καλεσμένων",
    errorTitle: "Δεν ήταν δυνατή η φόρτωση περιεχομένου",
    errorBody: "Ελέγξτε τα αρχεία στο /content και δοκιμάστε ξανά."
  }
};

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

function resolveAssetUrl(input) {
  if (typeof input !== "string") {
    return "";
  }
  const value = input.trim();
  if (!value) {
    return "";
  }
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) {
    return value;
  }
  if (value.startsWith("/")) {
    return new URL(value.slice(1), SITE_BASE_URL).toString();
  }
  return value;
}

function setText(id, value) {
  const element = byId(id);
  if (!element) {
    throw new Error(`Missing element: #${id}`);
  }
  element.textContent = value;
}

function normalizeLanguage(input) {
  if (!input) {
    return null;
  }
  const short = input.toLowerCase().slice(0, 2);
  return SUPPORTED_LANGS.includes(short) ? short : null;
}

function getSelectedLanguage() {
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  const urlLanguage = normalizeLanguage(fromUrl);
  if (urlLanguage) {
    return urlLanguage;
  }

  const storedLanguage = normalizeLanguage(window.localStorage.getItem(LANGUAGE_KEY));
  if (storedLanguage) {
    return storedLanguage;
  }

  return normalizeLanguage(navigator.language) || DEFAULT_LANG;
}

function setActiveLanguageButton(lang) {
  const buttons = document.querySelectorAll(".lang-btn");
  for (const button of buttons) {
    const isActive = button.getAttribute("data-lang") === lang;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
}

function applyLanguageToUrl(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.history.replaceState({}, "", url);
}

function applyUiText(lang) {
  const dictionary = UI_TEXT[lang] || UI_TEXT[DEFAULT_LANG];
  document.documentElement.lang = lang;

  const labeledElements = document.querySelectorAll("[data-i18n]");
  for (const element of labeledElements) {
    const key = element.getAttribute("data-i18n");
    if (!key) {
      continue;
    }
    const value = dictionary[key];
    if (value) {
      element.textContent = value;
    }
  }
}

function renderSchedule(events) {
  const list = byId("schedule-list");
  if (!list) {
    throw new Error("Missing schedule list element.");
  }

  list.innerHTML = "";
  for (const event of events) {
    const item = document.createElement("li");
    const title = document.createElement("p");
    title.className = "event-title";
    title.textContent = event.title;

    const dateAndTime = document.createElement("p");
    dateAndTime.className = "event-meta";
    dateAndTime.textContent = `${event.date} • ${event.time}`;

    const location = document.createElement("p");
    location.className = "event-meta";
    location.textContent = event.location;

    item.append(title, dateAndTime, location);
    list.appendChild(item);
  }
}

function renderTravel(details) {
  const list = byId("travel-list");
  if (!list) {
    throw new Error("Missing travel list element.");
  }

  list.innerHTML = "";
  for (const detail of details) {
    const item = document.createElement("li");
    const label = document.createElement("p");
    label.className = "event-title";
    label.textContent = detail.label;

    const value = document.createElement("p");
    value.className = "detail-value";
    value.textContent = detail.value;

    item.append(label, value);
    list.appendChild(item);
  }
}

function renderFaq(faqItems) {
  const container = byId("faq-list");
  if (!container) {
    throw new Error("Missing FAQ list element.");
  }

  container.innerHTML = "";
  for (const faq of faqItems) {
    const item = document.createElement("div");
    item.className = "faq-item";
    const question = document.createElement("p");
    question.className = "faq-question";
    question.textContent = faq.question;

    const answer = document.createElement("p");
    answer.className = "faq-answer";
    answer.textContent = faq.answer;

    item.append(question, answer);
    container.appendChild(item);
  }
}

function renderDispersedPhotos(photos) {
  const containers = document.querySelectorAll(".photo-scatter");
  const validPhotos = (Array.isArray(photos) ? photos : [])
    .map((photo) => resolveAssetUrl(photo))
    .filter(Boolean);
  const rotations = ["-2deg", "1.8deg", "-1.2deg", "2.2deg", "-1.6deg"];
  let photoIndex = 0;

  for (const container of containers) {
    container.innerHTML = "";
    if (!validPhotos.length) {
      container.hidden = true;
      continue;
    }

    container.hidden = false;
    const parsedCount = Number.parseInt(container.getAttribute("data-count") || "2", 10);
    const count = Number.isNaN(parsedCount) ? 2 : Math.max(1, parsedCount);
    for (let i = 0; i < count; i += 1) {
      const figure = document.createElement("figure");
      figure.className = "scatter-photo";
      figure.style.setProperty("--scatter-rotation", rotations[(photoIndex + i) % rotations.length]);

      const image = document.createElement("img");
      image.src = validPhotos[photoIndex % validPhotos.length];
      image.alt = "Wedding photo";
      image.loading = "lazy";
      image.decoding = "async";

      figure.appendChild(image);
      container.appendChild(figure);
      photoIndex += 1;
    }
  }
}

function getVideoSource(videoUrl) {
  const url = videoUrl.trim();
  const youtubeShort = url.match(/^https?:\/\/(?:www\.)?youtu\.be\/([^?&/]+)/i);
  if (youtubeShort) {
    return { provider: "youtube", id: youtubeShort[1] };
  }

  const youtubeWatch = url.match(/^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([^?&/]+)/i);
  if (youtubeWatch) {
    return { provider: "youtube", id: youtubeWatch[1] };
  }

  const youtubeEmbed = url.match(/^https?:\/\/(?:www\.)?youtube(?:-nocookie)?\.com\/embed\/([^?&/]+)/i);
  if (youtubeEmbed) {
    return { provider: "youtube", id: youtubeEmbed[1] };
  }

  const vimeoPlayer = url.match(/^https?:\/\/player\.vimeo\.com\/video\/([0-9]+)/i);
  if (vimeoPlayer) {
    return { provider: "vimeo", id: vimeoPlayer[1] };
  }

  const vimeo = url.match(/^https?:\/\/(?:www\.)?vimeo\.com\/([0-9]+)/i);
  if (vimeo) {
    return { provider: "vimeo", id: vimeo[1] };
  }

  return null;
}

function toBackgroundEmbedUrl(videoUrl) {
  const source = getVideoSource(videoUrl);
  if (!source) {
    return null;
  }
  if (source.provider === "youtube") {
    return `https://www.youtube-nocookie.com/embed/${source.id}?autoplay=1&mute=1&controls=0&loop=1&playlist=${source.id}&modestbranding=1&rel=0&playsinline=1`;
  }
  if (source.provider === "vimeo") {
    return `https://player.vimeo.com/video/${source.id}?background=1&autoplay=1&muted=1&loop=1&title=0&byline=0&portrait=0`;
  }
  throw new Error("Unsupported video provider.");
}

function renderHeroMedia(videoUrl) {
  const container = byId("hero-media");
  if (!container) {
    throw new Error("Missing hero media container.");
  }

  const value = resolveAssetUrl(videoUrl);
  container.innerHTML = "";
  if (!value) {
    return;
  }

  const isDirectVideo = /\.(mp4|webm|ogg)(\?.*)?$/i.test(value);
  if (isDirectVideo) {
    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = value;
    container.appendChild(video);
    return;
  }

  const embedUrl = toBackgroundEmbedUrl(value);
  if (!embedUrl) {
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.src = embedUrl;
  iframe.title = "Header background video";
  iframe.loading = "eager";
  iframe.allow = "autoplay; fullscreen; picture-in-picture";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  container.appendChild(iframe);
}

function setHeroBackground(imageUrl) {
  const resolvedImageUrl = resolveAssetUrl(imageUrl);
  if (!resolvedImageUrl) {
    document.documentElement.style.removeProperty("--hero-image");
    return;
  }
  const safeUrl = resolvedImageUrl.replace(/"/g, '\\"');
  document.documentElement.style.setProperty("--hero-image", `url("${safeUrl}")`);
}

async function fetchLocalizedData(lang, fileName) {
  try {
    return await fetchJson(`content/${fileName}.${lang}.json`);
  } catch {
    return fetchJson(`content/${fileName}.json`);
  }
}

async function renderWebsite(lang) {
  const [site, schedule, travel, faq] = await Promise.all([
    fetchLocalizedData(lang, "site"),
    fetchLocalizedData(lang, "schedule"),
    fetchLocalizedData(lang, "travel"),
    fetchLocalizedData(lang, "faq")
  ]);

  applyUiText(lang);
  setActiveLanguageButton(lang);
  setText("hero-date", site.weddingDate);
  setText("hero-title", site.heroTitle);
  setText("hero-subtitle", site.heroSubtitle);
  setText("story-text", site.story);
  setText("footer-note", site.footerNote);
  setHeroBackground(site.heroImageUrl);
  renderHeroMedia(site.heroVideoUrl || site.videoUrl);
  renderDispersedPhotos(site.photos);
  renderSchedule(schedule.events);
  renderTravel(travel.details);
  renderFaq(faq.items);
}

function showError(error, lang) {
  console.error(error);
  const main = document.querySelector("main");
  if (!main || document.getElementById("content-error")) {
    return;
  }
  const text = UI_TEXT[lang] || UI_TEXT[DEFAULT_LANG];
  const errorBanner = document.createElement("section");
  errorBanner.id = "content-error";
  errorBanner.className = "section card";
  const title = document.createElement("h2");
  title.textContent = text.errorTitle;
  const body = document.createElement("p");
  body.textContent = text.errorBody;
  errorBanner.append(title, body);
  main.prepend(errorBanner);
}

function setupRevealAnimations() {
  const cards = document.querySelectorAll(".animate-up");
  if (!cards.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.15, rootMargin: "0px 0px -30px 0px" }
  );

  for (const card of cards) {
    observer.observe(card);
  }
}

function setupLanguageSwitcher(initialLang) {
  const buttons = document.querySelectorAll(".lang-btn");
  for (const button of buttons) {
    button.addEventListener("click", async () => {
      const lang = button.getAttribute("data-lang");
      if (!lang || !SUPPORTED_LANGS.includes(lang)) {
        return;
      }
      window.localStorage.setItem(LANGUAGE_KEY, lang);
      applyLanguageToUrl(lang);
      try {
        await renderWebsite(lang);
      } catch (error) {
        showError(error, lang);
      }
    });
  }
  setActiveLanguageButton(initialLang);
}

async function start() {
  const lang = getSelectedLanguage();
  applyLanguageToUrl(lang);
  setupLanguageSwitcher(lang);
  try {
    await renderWebsite(lang);
    setupRevealAnimations();
  } catch (error) {
    showError(error, lang);
  }
}

start();
