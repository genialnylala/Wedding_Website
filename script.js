const byId = (id) => document.getElementById(id);

const SUPPORTED_LANGS = ["en", "pl", "el"];
const DEFAULT_LANG = "en";
const LANGUAGE_KEY = "wedding-site-language";
const SITE_BASE_URL = new URL(".", window.location.href);

const UI_TEXT = {
  en: {
    dateLabel: "Wedding date",
    locationLabel: "Location",
    countdownLabel: "Day countdown",
    countdownToday: "Today!",
    countdownDaysLeftSingular: "day",
    countdownDaysLeftPlural: "days",
    countdownDaysAgoSingular: "day",
    countdownDaysAgoPlural: "days",
    storyLabel: "Who are we?",
    storyTitle: "Who are we?",
    scheduleLabel: "Schedule",
    scheduleTitle: "Wedding Weekend",
    travelLabel: "Travel",
    travelTitle: "Travel & Stay",
    faqTitle: "Guest Questions",
    errorTitle: "Content failed to load",
    errorBody: "Please check your content files in /content and try again."
  },
  pl: {
    dateLabel: "Data ślubu",
    locationLabel: "Miejsce",
    countdownLabel: "Odliczanie",
    countdownToday: "Dzisiaj!",
    countdownDaysLeftSingular: "dzień",
    countdownDaysLeftPlural: "dni",
    countdownDaysAgoSingular: "dzień",
    countdownDaysAgoPlural: "dni",
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
    dateLabel: "Ημερομηνία γάμου",
    locationLabel: "Τοποθεσία",
    countdownLabel: "Αντίστροφη μέτρηση",
    countdownToday: "Σήμερα!",
    countdownDaysLeftSingular: "μέρα",
    countdownDaysLeftPlural: "μέρες",
    countdownDaysAgoSingular: "μέρα",
    countdownDaysAgoPlural: "μέρες",
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
  const requestUrl = new URL(path, SITE_BASE_URL);
  const response = await fetch(requestUrl.toString());
  if (!response.ok) {
    throw new Error(`Failed to load ${requestUrl.toString()}: ${response.status} ${response.statusText}`);
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
  if (/^http:\/\//i.test(value) && window.location.protocol === "https:") {
    return value.replace(/^http:\/\//i, "https://");
  }
  if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(value)) {
    return value;
  }
  if (value.startsWith("/")) {
    return new URL(value.slice(1), SITE_BASE_URL).toString();
  }
  return new URL(value, SITE_BASE_URL).toString();
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

function renderInline(text) {
  const fragment = document.createDocumentFragment();
  const parts = String(text).split(/\*\*(.+?)\*\*/g);
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 1) {
      const strong = document.createElement("strong");
      strong.textContent = parts[i];
      fragment.appendChild(strong);
    } else if (parts[i]) {
      fragment.appendChild(document.createTextNode(parts[i]));
    }
  }
  return fragment;
}

function renderBlocks(container, blocks) {
  for (const block of blocks) {
    if (block.type === "paragraph") {
      const p = document.createElement("p");
      p.className = "rich-paragraph";
      p.appendChild(renderInline(block.text));
      container.appendChild(p);
    } else if (block.type === "heading3") {
      const h = document.createElement("h3");
      h.className = "rich-subheading";
      h.textContent = block.text;
      container.appendChild(h);
    } else if (block.type === "list") {
      const ul = document.createElement("ul");
      ul.className = "rich-list";
      for (const item of block.items) {
        const li = document.createElement("li");
        li.appendChild(renderInline(item));
        ul.appendChild(li);
      }
      container.appendChild(ul);
    } else if (block.type === "callout") {
      const div = document.createElement("div");
      div.className = "rich-callout";
      if (block.title) {
        const titleEl = document.createElement("p");
        titleEl.className = "rich-callout-title";
        titleEl.textContent = block.title;
        div.appendChild(titleEl);
      }
      const textEl = document.createElement("p");
      textEl.className = "rich-callout-text";
      textEl.appendChild(renderInline(block.text));
      div.appendChild(textEl);
      container.appendChild(div);
    }
  }
}

function renderSchedule(scheduleData) {
  const container = byId("schedule-content");
  if (!container) {
    throw new Error("Missing schedule content element.");
  }

  container.innerHTML = "";

  if (scheduleData.days) {
    if (scheduleData.celebration) {
      const celebDiv = document.createElement("div");
      celebDiv.className = "rich-section";
      const celebHeading = document.createElement("h3");
      celebHeading.className = "rich-section-heading";
      celebHeading.textContent = scheduleData.celebration.heading;
      celebDiv.appendChild(celebHeading);
      renderBlocks(celebDiv, scheduleData.celebration.blocks || []);
      container.appendChild(celebDiv);
    }

    const daysDiv = document.createElement("div");
    daysDiv.className = "rich-section";
    for (const day of scheduleData.days) {
      const dayDiv = document.createElement("div");
      dayDiv.className = "schedule-day";

      const dayTitle = document.createElement("h3");
      dayTitle.className = "schedule-day-title";
      dayTitle.textContent = day.title;
      dayDiv.appendChild(dayTitle);

      if (day.date) {
        const datePara = document.createElement("p");
        datePara.className = "schedule-day-date";
        datePara.textContent = day.date;
        dayDiv.appendChild(datePara);
      }

      for (const slot of (day.slots || [])) {
        const slotDiv = document.createElement("div");
        slotDiv.className = "schedule-slot";

        const timeEl = document.createElement("p");
        timeEl.className = "schedule-slot-time";
        timeEl.textContent = slot.time;

        const titleEl = document.createElement("p");
        titleEl.className = "schedule-slot-title";
        titleEl.appendChild(renderInline(slot.title));

        slotDiv.append(timeEl, titleEl);

        for (const note of (slot.notes || [])) {
          const noteEl = document.createElement("p");
          noteEl.className = "schedule-slot-note";
          noteEl.appendChild(renderInline(note));
          slotDiv.appendChild(noteEl);
        }

        dayDiv.appendChild(slotDiv);
      }

      if (day.checklist) {
        const callout = document.createElement("div");
        callout.className = "rich-callout";
        const calloutTitle = document.createElement("p");
        calloutTitle.className = "rich-callout-title";
        calloutTitle.textContent = "Don't forget:";
        callout.appendChild(calloutTitle);
        const ul = document.createElement("ul");
        ul.className = "rich-list";
        for (const item of day.checklist) {
          const li = document.createElement("li");
          li.textContent = item;
          ul.appendChild(li);
        }
        callout.appendChild(ul);
        dayDiv.appendChild(callout);
      }

      daysDiv.appendChild(dayDiv);
    }
    container.appendChild(daysDiv);
  } else if (scheduleData.events) {
    const list = document.createElement("ul");
    list.className = "event-list";
    for (const event of scheduleData.events) {
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
    container.appendChild(list);
  }
}

function renderTravel(travelData) {
  const container = byId("travel-content");
  if (!container) {
    throw new Error("Missing travel content element.");
  }

  container.innerHTML = "";

  if (travelData.sections) {
    for (const section of travelData.sections) {
      const sectionDiv = document.createElement("div");
      sectionDiv.className = "rich-section";
      if (section.heading) {
        const h = document.createElement("h3");
        h.className = "rich-section-heading";
        h.textContent = section.heading;
        sectionDiv.appendChild(h);
      }
      renderBlocks(sectionDiv, section.blocks || []);
      container.appendChild(sectionDiv);
    }
    if (travelData.finalNote) {
      const noteDiv = document.createElement("div");
      noteDiv.className = "rich-section rich-final-note";
      if (travelData.finalNote.heading) {
        const h = document.createElement("h3");
        h.className = "rich-section-heading";
        h.textContent = travelData.finalNote.heading;
        noteDiv.appendChild(h);
      }
      const p = document.createElement("p");
      p.className = "rich-paragraph";
      p.appendChild(renderInline(travelData.finalNote.text));
      noteDiv.appendChild(p);
      container.appendChild(noteDiv);
    }
  } else if (travelData.details) {
    const list = document.createElement("ul");
    list.className = "details-list";
    for (const detail of travelData.details) {
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
    container.appendChild(list);
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

function parseWeddingDate(site) {
  const fromIso = typeof site.weddingDateIso === "string" ? site.weddingDateIso.trim() : "";
  if (fromIso) {
    const parsed = new Date(fromIso);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
    console.error(`Invalid weddingDateIso value: "${site.weddingDateIso}"`);
  }

  const fromDisplayDate = typeof site.weddingDate === "string" ? site.weddingDate.trim() : "";
  if (fromDisplayDate) {
    const parsed = new Date(fromDisplayDate);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
    console.error(`Invalid weddingDate value: "${site.weddingDate}"`);
  }

  return null;
}

function formatCountdownText(dayDifference, lang) {
  const dictionary = UI_TEXT[lang] || UI_TEXT[DEFAULT_LANG];
  if (dayDifference === 0) {
    return dictionary.countdownToday;
  }
  const absolute = Math.abs(dayDifference);
  const unit = absolute === 1 ? dictionary.countdownDaysLeftSingular : dictionary.countdownDaysLeftPlural;
  return `${absolute} ${unit}`;
}

function renderWeddingDetails(site, lang) {
  setText("wedding-date", site.weddingDate || "—");
  const locationEl = byId("wedding-location");
  if (!locationEl) throw new Error("Missing element: #wedding-location");
  locationEl.textContent = site.weddingLocation || "—";
  if (site.weddingChurchName) {
    const church = document.createElement("span");
    church.className = "wedding-highlight-church";
    if (site.weddingLocationUrl) {
      const link = document.createElement("a");
      link.href = site.weddingLocationUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = site.weddingChurchName;
      church.appendChild(link);
    } else {
      church.textContent = site.weddingChurchName;
    }
    locationEl.appendChild(church);
  }

  const weddingDate = parseWeddingDate(site);
  if (!weddingDate) {
    setText("day-countdown", "—");
    return;
  }

  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const weddingUtc = Date.UTC(weddingDate.getUTCFullYear(), weddingDate.getUTCMonth(), weddingDate.getUTCDate());
  const dayDifference = Math.round((weddingUtc - todayUtc) / 86400000);
  setText("day-countdown", formatCountdownText(dayDifference, lang));
}

function isCounterPhoto(photoUrl) {
  return /gallery-3\.png(?:[?#].*)?$/i.test(photoUrl);
}

function renderCounterPhoto(photos) {
  const container = byId("counter-photo");
  const image = byId("counter-photo-image");
  const note = byId("counter-photo-note");
  if (!container || !image) {
    throw new Error("Missing counter photo elements.");
  }

  const validPhotos = (Array.isArray(photos) ? photos : [])
    .map((photo) => resolveAssetUrl(photo))
    .filter(Boolean);
  const counterPhoto = validPhotos.find((photo) => isCounterPhoto(photo)) || "";
  if (!counterPhoto) {
    container.hidden = true;
    if (note) note.hidden = true;
    image.removeAttribute("src");
    return;
  }

  image.src = counterPhoto;
  container.hidden = false;
  if (note) note.hidden = false;
}

function renderDispersedPhotos(photos) {
  const containers = document.querySelectorAll(".photo-scatter");
  const validPhotos = (Array.isArray(photos) ? photos : [])
    .map((photo) => resolveAssetUrl(photo))
    .filter((photo) => photo && !isCounterPhoto(photo));
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

function renderHeroMedia(videoUrl, fallbackImageUrl) {
  const container = byId("hero-media");
  if (!container) {
    throw new Error("Missing hero media container.");
  }

  const value = resolveAssetUrl(videoUrl);
  container.innerHTML = "";

  if (value) {
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
    if (embedUrl) {
      const iframe = document.createElement("iframe");
      iframe.src = embedUrl;
      iframe.title = "Header background video";
      iframe.loading = "eager";
      iframe.allow = "autoplay; fullscreen; picture-in-picture";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      container.appendChild(iframe);
      return;
    }
  }

  const imageUrl = resolveAssetUrl(fallbackImageUrl);
  if (imageUrl) {
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = "";
    img.draggable = false;
    container.appendChild(img);
  }
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
  setText("hero-title", site.heroTitle);
  setText("hero-subtitle", site.heroSubtitle);
  renderWeddingDetails(site, lang);
  setText("story-text", site.story);
  setText("footer-note", site.footerNote);
  renderHeroMedia(site.heroVideoUrl || site.videoUrl, site.heroImageUrl);
  renderCounterPhoto(site.photos);
  renderDispersedPhotos(site.photos);
  renderSchedule(schedule);
  renderTravel(travel);
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
