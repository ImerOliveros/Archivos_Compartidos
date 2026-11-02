const categories = {
  music: {
    label: "Música",
    title: "Tu música,",
    titleTail: "a tu manera.",
    description: "Escucha y comparte descubrimientos musicales.",
    section: "Música para escuchar",
    eyebrow: "DESCUBRE",
    emptyTitle: "Todavía no hay música",
    emptyDescription: "Agrega música al catálogo público para compartirla con todos.",
    emptyIcon: "♫"
  },
  documents: {
    label: "Documentos",
    title: "Documentos,",
    titleTail: "a la mano.",
    description: "Documentos y archivos publicados en el catálogo.",
    section: "Documentos compartidos",
    eyebrow: "ARCHIVO PÚBLICO",
    emptyTitle: "Todavía no hay documentos",
    emptyDescription: "Los documentos que se publiquen aquí serán visibles para todos.",
    emptyIcon: "▤"
  },
  games: {
    label: "Juegos",
    title: "Juegos,",
    titleTail: "para descubrir.",
    description: "Enlaces y archivos de juegos publicados en el catálogo.",
    section: "Juegos compartidos",
    eyebrow: "DESCUBRE Y JUEGA",
    emptyTitle: "Todavía no hay juegos",
    emptyDescription: "Agrega enlaces o archivos públicos de juegos al catálogo.",
    emptyIcon: "⌘"
  },
  images: {
    label: "Imágenes",
    title: "Imágenes,",
    titleTail: "para compartir.",
    description: "Imágenes publicadas para que todos puedan verlas.",
    section: "Imágenes compartidas",
    eyebrow: "GALERÍA PÚBLICA",
    emptyTitle: "Todavía no hay imágenes",
    emptyDescription: "Agrega imágenes públicas al catálogo para mostrarlas aquí.",
    emptyIcon: "▧"
  },
  other: {
    label: "Otros",
    title: "Más cosas,",
    titleTail: "para compartir.",
    description: "Otros archivos publicados en el catálogo público.",
    section: "Otros archivos",
    eyebrow: "MÁS PARA DESCUBRIR",
    emptyTitle: "Todavía no hay otros archivos",
    emptyDescription: "Los archivos que agregues al catálogo serán públicos.",
    emptyIcon: "◈"
  }
};
const SUGGESTION_EMAIL = "oliverosimer7@gmail.com";

const elements = {
  addDialog: document.querySelector("#add-dialog"),
  breadcrumb: document.querySelector("#breadcrumb-current"),
  cancelSuggestion: document.querySelector("#cancel-suggestion"),
  closeDialog: document.querySelector("#close-dialog"),
  countBadges: document.querySelectorAll("[data-count]"),
  emailDraftLink: document.querySelector("#email-draft-link"),
  heroAdd: document.querySelector("#hero-add"),
  itemTotal: document.querySelector("#item-total"),
  library: document.querySelector("#library-view"),
  navItems: document.querySelectorAll(".nav-item"),
  pageDescription: document.querySelector("#page-description"),
  pageTitle: document.querySelector("#page-title"),
  player: document.querySelector("#player"),
  playerTitle: document.querySelector("#player-title"),
  search: document.querySelector("#search-input"),
  sectionEyebrow: document.querySelector("#section-eyebrow"),
  sectionTitle: document.querySelector("#section-title"),
  suggestionCategory: document.querySelector("#suggestion-category"),
  suggestionError: document.querySelector("#suggestion-error"),
  suggestionForm: document.querySelector("#suggestion-form"),
  suggestionNote: document.querySelector("#suggestion-note"),
  suggestionStatus: document.querySelector("#suggestion-status"),
  suggestionTitle: document.querySelector("#suggestion-title"),
  suggestionUrl: document.querySelector("#suggestion-url"),
  toast: document.querySelector("#toast"),
  audio: document.querySelector("#audio-player"),
  youtube: document.querySelector("#youtube-player"),
  closePlayer: document.querySelector("#close-player")
};

let items = [];
let currentCategory = "music";
let toastTimeout;

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("is-visible");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => elements.toast.classList.remove("is-visible"), 3200);
}

function getPublicUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, document.baseURI);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.href;
  } catch {
    return null;
  }
}

function youtubeVideoId(value) {
  const href = getPublicUrl(value);
  if (!href) return null;
  const url = new URL(href);
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  let id = "";
  if (host === "youtu.be") {
    id = url.pathname.split("/").filter(Boolean)[0] || "";
  } else if (host === "youtube.com" || host.endsWith(".youtube.com")) {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v") || "";
    } else {
      id = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] || "";
    }
  }
  return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
}

function formatSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let index = 0;
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index += 1;
  }
  return `${size.toFixed(size < 10 ? 1 : 0)} ${units[index]}`;
}

function isValidItem(item) {
  if (!item || typeof item !== "object"
    || typeof item.id !== "string"
    || typeof item.title !== "string"
    || !categories[item.category]
    || !["youtube", "audio", "image", "file", "link"].includes(item.kind)
    || !getPublicUrl(item.url)) return false;
  if (item.kind === "youtube" && !youtubeVideoId(item.url)) return false;
  if (item.category === "music" && !["youtube", "audio", "link"].includes(item.kind)) return false;
  if (item.category === "images" && item.kind !== "image") return false;
  if (item.kind === "image" && item.category !== "images") return false;
  return item.title.trim().length > 0;
}

function getVisibleItems() {
  const query = elements.search.value.trim().toLocaleLowerCase();
  return items.filter((item) => item.category === currentCategory)
    .filter((item) => `${item.title} ${item.file_name || ""} ${item.url}`.toLocaleLowerCase().includes(query));
}

function actionButton(label, action, id, extraClass = "") {
  const button = createElement("button", `small-action ${extraClass}`.trim(), label);
  button.type = "button";
  button.dataset.action = action;
  button.dataset.id = id;
  return button;
}

function createCard(item) {
  const card = createElement("article", "item-card");
  const art = createElement("div", `item-art${item.kind === "image" ? " item-art-image" : ""}`);
  const symbol = item.category === "music" ? "♫"
    : item.category === "documents" ? "▤"
      : item.category === "games" ? "⌘"
        : item.category === "images" ? "▧" : "◈";

  if (item.kind === "image") {
    const image = document.createElement("img");
    image.src = getPublicUrl(item.url);
    image.alt = item.title;
    image.loading = "lazy";
    image.onerror = () => {
      image.remove();
      art.append(createElement("span", "item-art-symbol", symbol));
    };
    art.append(image);
  } else {
    art.append(createElement("span", "item-art-symbol", symbol));
  }
  art.append(createElement("span", "item-art-label", categories[item.category].label.toUpperCase()));

  const title = createElement("h3", "item-card-title", item.title);
  title.title = item.title;
  const meta = createElement("div", "item-card-meta");
  const metaText = item.kind === "youtube" ? "YOUTUBE"
    : item.kind === "audio" ? "AUDIO"
      : item.file_name || "ENLACE";
  meta.append(createElement("span", "item-tag", metaText));
  if (item.size_bytes) meta.append(createElement("span", "", formatSize(item.size_bytes)));

  const actions = createElement("div", "item-actions");
  if (item.kind === "youtube" || item.kind === "audio") {
    actions.append(actionButton("▶ Reproducir", "play", item.id));
  } else {
    const link = createElement("a", "small-action", item.kind === "link" ? "Abrir enlace ↗" : "Abrir / descargar ↓");
    link.href = getPublicUrl(item.url);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    if (item.file_name) link.download = item.file_name;
    actions.append(link);
  }
  card.append(art, title, meta, actions);
  return card;
}

function renderEmptyState(message) {
  const empty = createElement("div", "empty-state");
  if (message) {
    empty.append(createElement("h3", "", message));
    return empty;
  }
  const info = categories[currentCategory];
  empty.append(createElement("span", "empty-icon", info.emptyIcon));
  empty.append(createElement("h3", "", info.emptyTitle));
  empty.append(createElement("p", "", info.emptyDescription));
  const suggestionButton = createElement("button", "empty-action", "＋ Proponer contenido");
  suggestionButton.type = "button";
  suggestionButton.addEventListener("click", openSuggestionDialog);
  empty.append(suggestionButton);
  return empty;
}

function render() {
  const info = categories[currentCategory];
  const categoryItems = items.filter((item) => item.category === currentCategory);
  const visibleItems = getVisibleItems();
  elements.breadcrumb.textContent = info.label;
  elements.pageTitle.replaceChildren(document.createTextNode(info.title), createElement("span", "", info.titleTail));
  elements.pageDescription.textContent = info.description;
  elements.sectionTitle.replaceChildren(document.createTextNode(info.section), createElement("span", "heading-spark", "✳"));
  elements.sectionEyebrow.textContent = info.eyebrow;
  elements.itemTotal.textContent = `${categoryItems.length} ${categoryItems.length === 1 ? "elemento" : "elementos"}`;
  elements.countBadges.forEach((badge) => {
    badge.textContent = String(items.filter((item) => item.category === badge.dataset.count).length);
  });

  if (visibleItems.length === 0) {
    elements.library.replaceChildren(elements.search.value.trim() && categoryItems.length
      ? renderEmptyState("No encontramos contenido con ese nombre.")
      : renderEmptyState());
    return;
  }
  const grid = createElement("div", "item-grid");
  visibleItems.forEach((item) => grid.append(createCard(item)));
  elements.library.replaceChildren(grid);
}

function updateCategory(category) {
  if (!categories[category]) return;
  currentCategory = category;
  elements.navItems.forEach((button) => {
    const active = button.dataset.category === category;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-current", active ? "page" : "false");
  });
  render();
}

function openSuggestionDialog() {
  elements.suggestionForm.reset();
  elements.suggestionError.hidden = true;
  elements.suggestionStatus.hidden = true;
  elements.emailDraftLink.hidden = true;
  elements.emailDraftLink.removeAttribute("href");
  elements.suggestionForm.querySelector("#prepare-suggestion").hidden = false;
  elements.addDialog.showModal();
  elements.suggestionTitle.focus();
}

function prepareSuggestion(event) {
  event.preventDefault();
  elements.suggestionError.hidden = true;
  const title = elements.suggestionTitle.value.trim();
  const url = getPublicUrl(elements.suggestionUrl.value.trim());
  if (!title) {
    elements.suggestionError.textContent = "Escribe un nombre para la propuesta.";
    elements.suggestionError.hidden = false;
    return;
  }
  if (!url) {
    elements.suggestionError.textContent = "Escribe un enlace válido que empiece con http:// o https://.";
    elements.suggestionError.hidden = false;
    return;
  }

  const subject = `Propuesta para Mi espacio: ${title}`;
  const body = [
    "Hola, quiero proponer este contenido para la biblioteca pública:",
    "",
    `Categoría: ${elements.suggestionCategory.value}`,
    `Nombre: ${title}`,
    `Enlace: ${url}`,
    elements.suggestionNote.value.trim() ? `Nota: ${elements.suggestionNote.value.trim()}` : "",
    "",
    "Entiendo que la propuesta se revisará antes de publicarse y que el contenido aprobado será público."
  ].filter(Boolean).join("\n");
  elements.emailDraftLink.href = `mailto:${SUGGESTION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  elements.emailDraftLink.hidden = false;
  elements.suggestionForm.querySelector("#prepare-suggestion").hidden = true;
  elements.suggestionStatus.textContent = "Propuesta preparada. Abre tu aplicación de correo y pulsa Enviar para mandarla.";
  elements.suggestionStatus.hidden = false;
}

function closePlayer() {
  elements.audio.pause();
  elements.audio.removeAttribute("src");
  elements.audio.load();
  elements.audio.hidden = true;
  elements.youtube.src = "about:blank";
  elements.youtube.hidden = true;
  elements.player.hidden = true;
}

function playItem(item) {
  closePlayer();
  elements.playerTitle.textContent = item.title;
  if (item.kind === "youtube") {
    const id = youtubeVideoId(item.url);
    if (!id) {
      showToast("El enlace de YouTube no parece válido.");
      return;
    }
    elements.audio.hidden = true;
    elements.youtube.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`;
    elements.youtube.hidden = false;
  } else if (item.kind === "audio") {
    elements.audio.src = getPublicUrl(item.url);
    elements.audio.hidden = false;
    elements.player.hidden = false;
    void elements.audio.play().catch((error) => {
      if (error instanceof DOMException && error.name === "AbortError") return;
      console.error("No se pudo reproducir el archivo de audio.", error);
      showToast("No se pudo reproducir. Revisa que el enlace sea a un archivo de audio compatible.");
    });
    return;
  }
  elements.player.hidden = false;
}

function handleLibraryAction(event) {
  const button = event.target.closest("button[data-action='play']");
  if (!button) return;
  const item = items.find((entry) => entry.id === button.dataset.id);
  if (item) playItem(item);
}

async function loadLibrary() {
  try {
    const response = await fetch("./library.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`library.json respondió con HTTP ${response.status}.`);
    const manifest = await response.json();
    if (!manifest || !Array.isArray(manifest.items)) {
      throw new Error("library.json debe contener una lista de elementos llamada items.");
    }
    items = manifest.items.filter((item) => {
      const valid = isValidItem(item);
      if (!valid) console.error("Se omitió una entrada inválida de library.json.", item);
      return valid;
    });
    render();
  } catch (error) {
    console.error("No se pudo cargar el catálogo público.", error);
    elements.library.replaceChildren(renderEmptyState("No se pudo cargar library.json. Revisa que el sitio esté publicado correctamente."));
    elements.itemTotal.textContent = "Error al cargar";
    showToast("No se pudo cargar el catálogo público.");
  }
}

elements.navItems.forEach((button) => {
  button.addEventListener("click", () => updateCategory(button.dataset.category));
});
document.querySelector("#open-add").addEventListener("click", openSuggestionDialog);
elements.heroAdd.addEventListener("click", openSuggestionDialog);
elements.cancelSuggestion.addEventListener("click", () => elements.addDialog.close());
elements.closeDialog.addEventListener("click", () => elements.addDialog.close());
elements.suggestionForm.addEventListener("submit", prepareSuggestion);
elements.search.addEventListener("input", render);
elements.library.addEventListener("click", handleLibraryAction);
elements.closePlayer.addEventListener("click", closePlayer);
document.addEventListener("keydown", (event) => {
  if (event.key === "/" && !elements.addDialog.open
    && !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) {
    event.preventDefault();
    elements.search.focus();
  }
});

loadLibrary();
