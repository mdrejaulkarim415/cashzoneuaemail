(() => {
  "use strict";

  /* ---------------------------------------------------------------------
     Configuration
     --------------------------------------------------------------------- */

  const DEFAULT_CHROME = 155;
  const CHROME_VERSIONS = Array.from({ length: 11 }, (_, index) => 160 - index);
  const MAX_HISTORY = 50;
  const EMAIL_API = "/api/claim-email";
  const EMAIL_PATTERN = /^[a-z]{4,30}@gmail\.com$/;
  const LOCAL_PREVIEW_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1", "[::1]"]);

  const STORAGE_KEYS = {
    profiles: "cashzone_profiles_v1",
    usedEmails: "cashzone_used_emails_v1",
    total: "cashzone_total_profiles_v1",
    preferences: "cashzone_preferences_v1",
  };

  const FIRST_NAMES = [
    "james", "john", "robert", "michael", "william", "david", "richard", "joseph",
    "thomas", "charles", "christopher", "daniel", "matthew", "anthony", "mark",
    "donald", "steven", "paul", "andrew", "joshua", "kenneth", "kevin", "brian",
    "george", "timothy", "ronald", "edward", "jason", "jeffrey", "ryan", "jacob",
    "gary", "nicholas", "eric", "jonathan", "stephen", "larry", "justin", "scott",
    "brandon", "benjamin", "samuel", "gregory", "alexander", "frank", "patrick",
    "raymond", "jack", "dennis", "jerry", "tyler", "aaron", "jose", "adam",
    "nathan", "henry", "douglas", "zachary", "peter", "kyle", "noah", "ethan",
    "jeremy", "walter", "christian", "keith", "roger", "terry", "austin", "sean",
    "gerald", "carl", "harold", "dylan", "arthur", "lawrence", "jordan", "jesse",
    "bryan", "billy", "bruce", "gabriel", "joe", "logan", "alan", "juan",
    "albert", "willie", "elijah", "wayne", "randy", "vincent", "mason", "roy",
    "ralph", "bobby", "russell", "bradley", "philip", "eugene", "louis", "harry",
    "howard", "fred", "marcus", "tony", "luis", "carlos", "miguel", "alex",
    "oscar", "jayden", "aiden", "lucas", "liam", "oliver", "hudson", "leo",
    "carter", "wyatt", "grayson", "hunter", "connor", "ian", "cole", "max",
    "dean", "spencer", "colin", "grant", "travis", "derek", "shane", "trevor",
    "chad", "jared", "caleb", "mitchell", "dominic", "adrian", "xavier",
    "emmanuel", "diego", "javier", "sergio", "fernando", "ricardo", "roberto",
    "marcos",
    "mary", "patricia", "jennifer", "linda", "elizabeth", "barbara", "susan",
    "jessica", "sarah", "karen", "nancy", "lisa", "betty", "margaret", "sandra",
    "ashley", "kimberly", "emily", "donna", "michelle", "carol", "amanda",
    "dorothy", "melissa", "deborah", "stephanie", "rebecca", "sharon", "laura",
    "cynthia", "kathleen", "amy", "angela", "shirley", "anna", "brenda",
    "pamela", "emma", "nicole", "helen", "samantha", "katherine", "christine",
    "debra", "rachel", "carolyn", "janet", "catherine", "maria", "heather",
    "diane", "ruth", "julie", "olivia", "joyce", "virginia", "victoria",
    "kelly", "lauren", "christina", "joan", "evelyn", "judith", "megan",
    "andrea", "cheryl", "hannah", "jacqueline", "martha", "gloria", "teresa",
    "ann", "sara", "madison", "frances", "kathryn", "janice", "jean",
    "abigail", "alice", "julia", "judy", "sophia", "grace", "denise", "amber",
    "doris", "marilyn", "danielle", "beverly", "isabella", "theresa", "diana",
    "natalie", "brittany", "charlotte", "marie", "kayla", "alexis", "lori",
  ];

  const LAST_NAMES = [
    "smith", "johnson", "williams", "brown", "jones", "garcia", "miller", "davis",
    "rodriguez", "martinez", "hernandez", "lopez", "gonzalez", "wilson",
    "anderson", "thomas", "taylor", "moore", "jackson", "martin", "lee", "perez",
    "thompson", "white", "harris", "sanchez", "clark", "ramirez", "lewis",
    "robinson", "walker", "young", "allen", "king", "wright", "scott", "torres",
    "nguyen", "hill", "flores", "green", "adams", "nelson", "baker", "hall",
    "rivera", "campbell", "mitchell", "carter", "roberts", "gomez", "phillips",
    "evans", "turner", "diaz", "parker", "cruz", "edwards", "collins", "reyes",
    "stewart", "morris", "morales", "murphy", "cook", "rogers", "gutierrez",
    "ortiz", "morgan", "cooper", "peterson", "bailey", "reed", "kelly", "howard",
    "ramos", "kim", "cox", "ward", "richardson", "watson", "brooks", "chavez",
    "wood", "james", "bennett", "gray", "mendoza", "ruiz", "hughes", "price",
    "alvarez", "castillo", "sanders", "patel", "myers", "long", "ross", "foster",
    "jimenez", "powell", "jenkins", "perry", "russell", "sullivan", "bell",
    "coleman", "butler", "henderson", "barnes", "gonzales", "fisher", "vasquez",
    "simmons", "romero", "jordan", "patterson", "alexander", "hamilton", "graham",
    "reynolds", "griffin", "wallace", "moreno", "west", "cole", "hayes", "bryant",
    "herrera", "gibson", "ellis", "tran", "medina", "aguilar", "stevens",
    "murray", "ford", "castro", "marshall", "owens", "harrison", "fernandez",
    "mcdonald", "woods", "washington", "kennedy", "wells", "vargas", "henry",
    "chen", "freeman", "webb", "tucker", "guzman", "burns", "crawford", "olson",
    "simpson", "porter", "hunter", "gordon", "mendez", "silva", "shaw", "snyder",
    "mason", "dixon", "munoz", "hunt", "hicks", "holmes", "palmer", "wagner",
    "black", "robertson", "boyd", "rose", "stone", "salazar", "fox", "warren",
    "mills", "meyer", "rice", "schmidt", "garza", "daniels", "ferguson",
    "nichols", "stephens", "soto", "weaver", "ryan", "gardner", "payne", "grant",
    "dunn", "kelley", "spencer", "hawkins", "arnold", "pierce", "vazquez",
    "hansen", "peters", "santos", "hart", "bradley", "knight", "elliott",
    "cunningham", "duncan", "armstrong", "hudson", "carroll", "lane", "riley",
    "andrews", "alvarado", "ray", "delgado", "berry", "perkins", "hoffman",
    "johnston", "matthews", "pena", "richards", "contreras", "willis",
    "carpenter", "lawrence", "sandoval", "guerrero", "george", "chapman", "rios",
    "estrada", "ortega", "watkins", "greene", "nunez", "wheeler", "valdez",
    "harper", "burke", "larson", "santiago", "maldonado", "morrison", "franklin",
    "carlson", "austin", "dominguez", "carr", "lawson", "jacobs", "obrien",
    "lynch", "singh", "vega", "bishop", "montgomery", "oliver", "jensen",
    "harvey", "williamson", "gilbert", "dean", "sims", "espinoza", "howell",
    "wong", "reid", "hanson", "le", "mccoy", "garrett", "burton", "fuller",
    "wang", "weber", "welch", "rojas", "lucas", "marquez", "fields", "park",
    "yang", "little", "banks", "padilla", "day", "walsh", "bowman", "schultz",
    "luna", "fowler", "mejia", "davidson", "acosta", "brewer", "may", "holland",
    "juarez", "newman", "pearson", "curtis", "cortez", "douglas", "schneider",
    "barrett", "navarro", "figueroa", "keller", "avila", "wade", "molina",
    "stanley", "hopkins", "campos", "barnett", "bates", "chambers", "caldwell",
    "beck", "lambert", "miranda", "byrd", "craig", "ayala", "lowe", "frazier",
    "powers", "neal", "leonard", "gregory", "carrillo", "sutton", "fleming",
    "rhodes", "shelton", "schwartz", "norris", "jennings", "watts", "duran",
    "walters", "cohen", "mcdaniel", "moran", "parks", "steele", "vaughn",
    "becker", "holt", "deleon", "barker", "benson", "hartman", "hale", "leon",
    "moss", "lloyd", "bullock", "hwang", "robles",
  ].filter((name, index, list) => list.indexOf(name) === index);

  const COPY_ICON = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"></path></svg>';

  /* ---------------------------------------------------------------------
     Elements
     --------------------------------------------------------------------- */

  const el = {
    manualVersion: document.getElementById("manualVersion"),
    versionSelect: document.getElementById("versionSelect"),
    selectWrap: document.getElementById("selectWrap"),
    versionHint: document.getElementById("versionHint"),
    versionHelp: document.getElementById("versionHelp"),
    generateBtn: document.getElementById("generateBtn"),
    ctaGenerateBtn: document.getElementById("ctaGenerateBtn"),
    uaOutput: document.getElementById("uaOutput"),
    emailOutput: document.getElementById("emailOutput"),
    outputStatus: document.getElementById("outputStatus"),
    outputStatusText: document.getElementById("outputStatusText"),
    outputStack: document.getElementById("outputStack"),
    uaChromeBadge: document.getElementById("uaChromeBadge"),
    emailBadge: document.getElementById("emailBadge"),
    copyUaBtn: document.getElementById("copyUaBtn"),
    copyEmailBtn: document.getElementById("copyEmailBtn"),
    copyAllBtn: document.getElementById("copyAllBtn"),
    metaPlatform: document.getElementById("metaPlatform"),
    metaChrome: document.getElementById("metaChrome"),
    metaTime: document.getElementById("metaTime"),
    historyBody: document.getElementById("historyBody"),
    historyCount: document.getElementById("historyCount"),
    historyUnique: document.getElementById("historyUnique"),
    statProfiles: document.getElementById("statProfiles"),
    statEmails: document.getElementById("statEmails"),
    exportBtn: document.getElementById("exportBtn"),
    clearBtn: document.getElementById("clearBtn"),
    serviceStatus: document.getElementById("serviceStatus"),
    serviceStatusText: document.getElementById("serviceStatusText"),
    toast: document.getElementById("toast"),
    toastText: document.getElementById("toastText"),
    year: document.getElementById("year"),
  };

  /* ---------------------------------------------------------------------
     State
     --------------------------------------------------------------------- */

  const state = {
    profiles: [],
    usedEmails: new Set(),
    totalGenerated: 0,
    current: null,
    service: "checking",
    servicePromise: null,
    generating: false,
  };

  let toastTimer = 0;

  /* ---------------------------------------------------------------------
     Storage helpers
     --------------------------------------------------------------------- */

  function readStorage(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function writeStorage(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      // The generator still works for this tab when storage is unavailable.
    }
  }

  function removeStorage(key) {
    try {
      window.localStorage.removeItem(key);
    } catch (error) {
      // Ignore storage restrictions.
    }
  }

  function readProfiles() {
    const saved = readStorage(STORAGE_KEYS.profiles, []);
    if (!Array.isArray(saved)) return [];

    const seen = new Set();
    return saved
      .filter((profile) => {
        if (!profile || typeof profile !== "object") return false;
        if (typeof profile.email !== "string" || typeof profile.ua !== "string") return false;
        if (!profile.email || !profile.ua) return false;
        if (seen.has(profile.email.toLowerCase())) return false;
        seen.add(profile.email.toLowerCase());
        return true;
      })
      .slice(0, MAX_HISTORY)
      .map((profile) => ({
        id: String(profile.id || makeProfileId()),
        email: profile.email.toLowerCase(),
        ua: profile.ua,
        chrome: Number(profile.chrome) || extractChromeVersion(profile.ua),
        scope: profile.scope === "global" || profile.scope === "local" ? profile.scope : null,
        generatedAt: isDate(profile.generatedAt) ? profile.generatedAt : new Date().toISOString(),
      }));
  }

  function readUsedEmails() {
    const saved = readStorage(STORAGE_KEYS.usedEmails, []);
    if (!Array.isArray(saved)) return new Set();

    const result = new Set();
    saved.forEach((value) => {
      if (typeof value === "string" && value.indexOf("@") > 0) {
        result.add(value.toLowerCase());
      }
    });
    return result;
  }

  function readPreferences() {
    const saved = readStorage(STORAGE_KEYS.preferences, {});
    const manual = Boolean(saved && saved.manual);
    const version = Number(saved && saved.version);
    return {
      manual,
      version: CHROME_VERSIONS.includes(version) ? version : DEFAULT_CHROME,
    };
  }

  /* ---------------------------------------------------------------------
     Utilities
     --------------------------------------------------------------------- */

  function randomInt(max) {
    if (max <= 0) return 0;

    if (window.crypto && typeof window.crypto.getRandomValues === "function") {
      const ceiling = Math.floor(0x100000000 / max) * max;
      const buffer = new Uint32Array(1);
      do {
        window.crypto.getRandomValues(buffer);
      } while (buffer[0] >= ceiling);
      return buffer[0] % max;
    }

    return Math.floor(Math.random() * max);
  }

  function pick(list) {
    return list[randomInt(list.length)];
  }

  function makeProfileId() {
    return "profile_" + Date.now().toString(36) + "_" + randomInt(0x7fffffff).toString(36);
  }

  function buildUserAgent(majorVersion) {
    return "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/" +
      majorVersion + ".0.0.0 Safari/537.36";
  }

  function extractChromeVersion(userAgent) {
    const match = String(userAgent).match(/Chrome\/(\d+)/);
    return match ? Number(match[1]) : DEFAULT_CHROME;
  }

  function isDate(value) {
    if (typeof value !== "string" && !(value instanceof Date)) return false;
    return !Number.isNaN(new Date(value).getTime());
  }

  function formatDateParts(isoDate) {
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) {
      return { date: "Unknown date", time: "—" };
    }

    return {
      date: new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date),
      time: new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }).format(date),
    };
  }

  function formatMetaTime(isoDate) {
    const parts = formatDateParts(isoDate);
    return parts.time === "—" ? "—" : parts.time + " · " + parts.date;
  }

  function makeUniqueEmail() {
    const used = state.usedEmails;

    for (let attempt = 0; attempt < 260; attempt += 1) {
      const handle = pick(FIRST_NAMES) + pick(LAST_NAMES);
      const email = handle + "@gmail.com";
      if (!used.has(email)) return email;
    }

    // A deterministic fallback keeps the promise of no repeats even after
    // thousands of generated profiles.
    const offset = randomInt(FIRST_NAMES.length);
    for (let firstIndex = 0; firstIndex < FIRST_NAMES.length; firstIndex += 1) {
      const first = FIRST_NAMES[(firstIndex + offset) % FIRST_NAMES.length];
      for (let lastIndex = 0; lastIndex < LAST_NAMES.length; lastIndex += 1) {
        const last = LAST_NAMES[(lastIndex + offset) % LAST_NAMES.length];
        const email = first + last + "@gmail.com";
        if (!used.has(email)) return email;
      }
    }

    // Extremely unlikely, but still letters-only and unique.
    const first = pick(FIRST_NAMES);
    const middle = String.fromCharCode(97 + randomInt(26));
    const last = pick(LAST_NAMES);
    const stem = first + middle + last;
    let counter = 0;
    let suffix = "";
    let candidate = stem + "@gmail.com";

    while (used.has(candidate)) {
      counter += 1;
      suffix = toLetters(counter);
      candidate = stem + suffix + "@gmail.com";
    }

    return candidate;
  }

  function isLocalPreviewHost() {
    return window.location.protocol === "file:" ||
      LOCAL_PREVIEW_HOSTS.has(window.location.hostname);
  }

  function setServiceStatus(mode) {
    state.service = mode;
    el.serviceStatus.classList.toggle("is-local", mode === "local");
    el.serviceStatus.classList.toggle("is-error", mode === "unavailable");

    if (mode === "global") {
      el.serviceStatusText.textContent = "Global unique";
      el.serviceStatus.title = "Connected to the shared global email registry";
    } else if (mode === "local") {
      el.serviceStatusText.textContent = "Local preview";
      el.serviceStatus.title = "Local preview only: global reservation is not active";
    } else {
      el.serviceStatusText.textContent = "Registry offline";
      el.serviceStatus.title = "The global email registry could not be reached";
    }
  }

  async function detectEmailService() {
    if (state.servicePromise) return state.servicePromise;

    state.servicePromise = (async () => {
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 6000);

      try {
        const response = await fetch(EMAIL_API, {
          method: "GET",
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload || payload.ok !== true || payload.mode !== "global") {
          throw new Error("Global email registry unavailable.");
        }

        setServiceStatus("global");
      } catch (error) {
        setServiceStatus(isLocalPreviewHost() ? "local" : "unavailable");
      } finally {
        window.clearTimeout(timer);
      }
    })();

    return state.servicePromise;
  }

  async function claimGlobalEmail() {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 25000);

    try {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        const response = await fetch(EMAIL_API, {
          method: "POST",
          cache: "no-store",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });

        const payload = await response.json().catch(() => null);
        if (!response.ok || !payload || payload.ok !== true) {
          throw new Error(
            (payload && payload.error) ||
            "The global registry could not reserve an email. Please try again."
          );
        }

        const email = String(payload.email || "").toLowerCase();
        if (!EMAIL_PATTERN.test(email)) {
          throw new Error("The global registry returned an invalid email address.");
        }

        // Very old local history may contain an address generated before the
        // shared registry existed. Reserve another one instead of repeating it
        // on this device.
        if (!state.usedEmails.has(email)) {
          return email;
        }
      }
    } catch (error) {
      if (error && error.name === "AbortError") {
        throw new Error("The global registry took too long to respond. Please try again.");
      }
      throw error;
    } finally {
      window.clearTimeout(timer);
    }

    throw new Error("Could not reserve an email that is new on this device. Please try again.");
  }

  function setGenerating(isGenerating) {
    state.generating = isGenerating;
    el.generateBtn.disabled = isGenerating;
    el.ctaGenerateBtn.disabled = isGenerating;
    el.generateBtn.setAttribute("aria-busy", String(isGenerating));
    el.ctaGenerateBtn.setAttribute("aria-busy", String(isGenerating));

    if (isGenerating) {
      setOutputStatus(
        state.service === "local" ? "Local preview…" : "Reserving globally…",
        false
      );
    }
  }

  function toLetters(value) {
    const alphabet = "abcdefghijklmnopqrstuvwxyz";
    let number = Math.max(1, value);
    let result = "";
    while (number > 0) {
      number -= 1;
      result = alphabet.charAt(number % 26) + result;
      number = Math.floor(number / 26);
    }
    return result;
  }

  function isEditableElement(target) {
    if (!target || !(target instanceof Element)) return false;
    const tag = target.tagName;
    return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable;
  }

  /* ---------------------------------------------------------------------
     Clipboard + toast
     --------------------------------------------------------------------- */

  function fallbackCopy(text) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (error) {
      copied = false;
    }

    textarea.remove();
    return copied;
  }

  async function copyText(text) {
    if (!text) return false;

    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {
        // Fall back to the textarea method below.
      }
    }

    return fallbackCopy(text);
  }

  function showToast(message) {
    el.toastText.textContent = message;
    el.toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      el.toast.classList.remove("is-visible");
    }, 2600);
  }

  function setCopyLabel(button, label) {
    const text = button.querySelector("span");
    if (!text) return;
    if (!button.dataset.originalLabel) {
      button.dataset.originalLabel = text.textContent;
    }
    text.textContent = label;
  }

  function restoreCopyLabel(button) {
    const text = button.querySelector("span");
    if (text && button.dataset.originalLabel) {
      text.textContent = button.dataset.originalLabel;
    }
  }

  async function handleCopy(button, text, successMessage) {
    if (!text) return false;
    const copied = await copyText(text);

    if (copied) {
      setCopyLabel(button, "Copied");
      window.clearTimeout(button._copyTimer);
      button._copyTimer = window.setTimeout(() => restoreCopyLabel(button), 1600);
      showToast(successMessage || "Copied to clipboard");
    } else {
      showToast("Couldn’t copy automatically. Please select and copy manually.");
    }

    return copied;
  }

  /* ---------------------------------------------------------------------
     Rendering
     --------------------------------------------------------------------- */

  function populateVersionSelect() {
    const fragment = document.createDocumentFragment();

    CHROME_VERSIONS.forEach((version) => {
      const option = document.createElement("option");
      option.value = String(version);
      option.textContent = "Chrome " + version + ".0.0.0" + (version === DEFAULT_CHROME ? " (Default)" : "");
      fragment.appendChild(option);
    });

    el.versionSelect.replaceChildren(fragment);
  }

  function applyVersionPreference(preferences) {
    el.manualVersion.checked = preferences.manual;
    el.versionSelect.value = String(preferences.manual ? preferences.version : DEFAULT_CHROME);
    updateVersionUi(preferences.manual);
  }

  function updateVersionUi(isManual) {
    el.versionSelect.disabled = !isManual;
    el.selectWrap.classList.toggle("is-disabled", !isManual);
    el.versionHint.textContent = isManual
      ? "On: pick a version below"
      : "Off: uses Chrome " + DEFAULT_CHROME + ".0.0.0";
    el.versionHelp.textContent = isManual
      ? "Your selected version will be used for the next generated profile."
      : "The default reproduces Chrome " + DEFAULT_CHROME + ".0.0.0 exactly.";
  }

  function savePreferences() {
    writeStorage(STORAGE_KEYS.preferences, {
      manual: el.manualVersion.checked,
      version: Number(el.versionSelect.value) || DEFAULT_CHROME,
    });
  }

  function setOutputStatus(label, live) {
    el.outputStatusText.textContent = label;
    el.outputStatus.classList.toggle("is-live", Boolean(live));
  }

  function renderEmptyOutput() {
    state.current = null;
    el.uaOutput.textContent = "Click “Generate profile” to create your first user agent.";
    el.uaOutput.classList.add("is-placeholder");
    el.emailOutput.textContent = "yourname@gmail.com";
    el.emailOutput.classList.add("is-placeholder");
    el.uaChromeBadge.textContent = "Chrome " + DEFAULT_CHROME;
    el.emailBadge.textContent = "Not generated";
    el.metaPlatform.textContent = "Windows NT 10.0";
    el.metaChrome.textContent = "—";
    el.metaTime.textContent = "—";
    el.copyUaBtn.disabled = true;
    el.copyEmailBtn.disabled = true;
    el.copyAllBtn.disabled = true;
    setOutputStatus("Waiting", false);
  }

  function renderProfile(profile, options) {
    if (!profile) {
      renderEmptyOutput();
      return;
    }

    state.current = profile;
    el.uaOutput.textContent = profile.ua;
    el.uaOutput.classList.remove("is-placeholder");
    el.emailOutput.textContent = profile.email;
    el.emailOutput.classList.remove("is-placeholder");
    el.uaChromeBadge.textContent = "Chrome " + profile.chrome;
    el.emailBadge.textContent = profile.scope === "global"
      ? "Global unique"
      : profile.scope === "local"
        ? "Local preview"
        : "Saved";
    el.metaPlatform.textContent = "Windows NT 10.0";
    el.metaChrome.textContent = "Chrome " + profile.chrome + ".0.0.0";
    el.metaTime.textContent = formatMetaTime(profile.generatedAt);
    el.copyUaBtn.disabled = false;
    el.copyEmailBtn.disabled = false;
    el.copyAllBtn.disabled = false;
    setOutputStatus(options && options.restored ? "Restored" : "Profile ready", true);

    if (options && options.animate) {
      el.outputStack.classList.remove("just-generated");
      // Restart the CSS animation when generating quickly in a row.
      void el.outputStack.offsetWidth;
      el.outputStack.classList.add("just-generated");
      window.setTimeout(() => {
        el.outputStack.classList.remove("just-generated");
      }, 620);
    }
  }

  function createIconButton(label, action, profileId) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "icon-btn";
    button.title = label;
    button.setAttribute("aria-label", label);
    button.dataset.historyAction = action;
    button.dataset.profileId = profileId;
    button.innerHTML = COPY_ICON;
    return button;
  }

  function renderHistory() {
    const profiles = state.profiles;
    el.historyBody.replaceChildren();

    if (profiles.length === 0) {
      const row = document.createElement("tr");
      row.className = "empty-row";

      const cell = document.createElement("td");
      cell.colSpan = 4;

      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML =
        '<span class="empty-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 6h16v12H4zM4 9h16M8 14h3"></path></svg></span>' +
        "<span><strong>No profiles yet</strong><small>Your generated profiles will appear here.</small></span>";

      cell.appendChild(empty);
      row.appendChild(cell);
      el.historyBody.appendChild(row);
      updateStats();
      return;
    }

    const fragment = document.createDocumentFragment();

    profiles.forEach((profile) => {
      const row = document.createElement("tr");

      const emailCell = document.createElement("td");
      const emailWrap = document.createElement("div");
      emailWrap.className = "email-cell";

      const avatar = document.createElement("span");
      avatar.className = "row-avatar";
      avatar.textContent = profile.email.charAt(0).toUpperCase();
      avatar.setAttribute("aria-hidden", "true");

      const copyWrap = document.createElement("span");
      copyWrap.className = "row-email-wrap";

      const email = document.createElement("strong");
      email.textContent = profile.email;

      const subtitle = document.createElement("small");
      subtitle.textContent = profile.scope === "global"
        ? "Globally reserved"
        : profile.scope === "local"
          ? "Local preview"
          : "US-style Gmail";

      copyWrap.append(email, subtitle);
      emailWrap.append(avatar, copyWrap);
      emailCell.appendChild(emailWrap);

      const chromeCell = document.createElement("td");
      const version = document.createElement("span");
      version.className = "version-chip";
      version.textContent = profile.chrome + ".0.0.0";
      chromeCell.appendChild(version);

      const dateCell = document.createElement("td");
      const dateWrap = document.createElement("span");
      dateWrap.className = "row-date";
      const dateParts = formatDateParts(profile.generatedAt);
      const date = document.createElement("span");
      date.textContent = dateParts.date;
      const time = document.createElement("small");
      time.textContent = dateParts.time;
      dateWrap.append(date, time);
      dateCell.appendChild(dateWrap);

      const actionCell = document.createElement("td");
      const actions = document.createElement("div");
      actions.className = "row-actions";
      actions.append(
        createIconButton("Copy email", "email", profile.id),
        createIconButton("Copy user agent", "ua", profile.id)
      );
      actionCell.appendChild(actions);

      row.append(emailCell, chromeCell, dateCell, actionCell);
      fragment.appendChild(row);
    });

    el.historyBody.appendChild(fragment);
    updateStats();
  }

  function updateStats() {
    el.historyCount.textContent = String(state.profiles.length);
    el.historyUnique.textContent = String(state.usedEmails.size);
    el.statProfiles.textContent = String(state.totalGenerated);
    el.statEmails.textContent = String(state.usedEmails.size);
  }

  function persistState() {
    writeStorage(STORAGE_KEYS.profiles, state.profiles);
    writeStorage(STORAGE_KEYS.usedEmails, Array.from(state.usedEmails));
    writeStorage(STORAGE_KEYS.total, state.totalGenerated);
  }

  /* ---------------------------------------------------------------------
     Generation
     --------------------------------------------------------------------- */

  async function generateProfile(shouldScroll) {
    if (state.generating) return;

    if (state.service === "checking") {
      await detectEmailService();
    } else if (state.service === "unavailable") {
      state.servicePromise = null;
      await detectEmailService();
    }

    if (state.service === "unavailable") {
      setOutputStatus("Registry offline", false);
      showToast("The global email registry is offline. Please try again shortly.");
      return;
    }

    const version = el.manualVersion.checked
      ? Number(el.versionSelect.value) || DEFAULT_CHROME
      : DEFAULT_CHROME;

    setGenerating(true);

    try {
      const scope = state.service === "local" ? "local" : "global";
      const email = scope === "global" ? await claimGlobalEmail() : makeUniqueEmail();
      const profile = {
        id: makeProfileId(),
        email,
        ua: buildUserAgent(version),
        chrome: version,
        scope,
        generatedAt: new Date().toISOString(),
      };

      state.usedEmails.add(email);
      state.profiles.unshift(profile);
      state.profiles = state.profiles.slice(0, MAX_HISTORY);
      state.totalGenerated += 1;

      persistState();
      renderProfile(profile, { animate: true });
      renderHistory();
      showToast(
        scope === "global"
          ? "New profile generated — email reserved globally."
          : "Local preview generated — global reservation is not active."
      );

      if (shouldScroll) {
        window.setTimeout(() => {
          const outputPanel = document.querySelector(".output-panel");
          if (outputPanel) {
            outputPanel.scrollIntoView({
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
              block: "center",
            });
          }
        }, 60);
      }
    } catch (error) {
      console.error("Could not generate a profile.", error);
      setOutputStatus("Not reserved", false);
      showToast(
        error && error.message
          ? error.message
          : "Could not reserve a globally unique email. Please try again."
      );
    } finally {
      setGenerating(false);
    }
  }

  /* ---------------------------------------------------------------------
     CSV export & clearing
     --------------------------------------------------------------------- */

  function csvEscape(value) {
    const text = String(value === null || value === undefined ? "" : value);
    if (/[",\r\n]/.test(text)) {
      return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  }

  function exportCsv() {
    if (state.profiles.length === 0) {
      showToast("Generate a profile before exporting.");
      return;
    }

    const header = ["Email", "User Agent", "Chrome Version", "Platform", "Generated At"];
    const rows = state.profiles.map((profile) => [
      profile.email,
      profile.ua,
      profile.chrome + ".0.0.0",
      "Windows NT 10.0; Win64; x64",
      profile.generatedAt,
    ]);

    const csv = "\uFEFF" + [header, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 10);

    anchor.href = url;
    anchor.download = "cashzone-profiles-" + stamp + ".csv";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast("CSV exported — " + state.profiles.length + " profile" + (state.profiles.length === 1 ? "" : "s") + ".");
  }

  function clearHistory() {
    if (state.profiles.length === 0 && state.usedEmails.size === 0) {
      showToast("History is already empty.");
      return;
    }

    const shouldClear = window.confirm(
      "Clear all profiles saved on this device?\n\nThe shared global email registry is not affected. Every address already reserved there will still never be issued again."
    );

    if (!shouldClear) return;

    state.profiles = [];
    state.usedEmails = new Set();
    state.totalGenerated = 0;
    state.current = null;

    removeStorage(STORAGE_KEYS.profiles);
    removeStorage(STORAGE_KEYS.usedEmails);
    removeStorage(STORAGE_KEYS.total);
    renderEmptyOutput();
    renderHistory();
    showToast("History cleared. A fresh email set is ready.");
  }

  /* ---------------------------------------------------------------------
     Event wiring
     --------------------------------------------------------------------- */

  function bindEvents() {
    el.manualVersion.addEventListener("change", () => {
      if (!el.manualVersion.checked) {
        el.versionSelect.value = String(DEFAULT_CHROME);
      }
      updateVersionUi(el.manualVersion.checked);
      savePreferences();
    });

    el.versionSelect.addEventListener("change", () => {
      savePreferences();
    });

    el.generateBtn.addEventListener("click", () => {
      void generateProfile(false);
    });
    el.ctaGenerateBtn.addEventListener("click", () => {
      void generateProfile(true);
    });

    el.copyUaBtn.addEventListener("click", () => {
      if (!state.current) return;
      handleCopy(el.copyUaBtn, state.current.ua, "User agent copied.");
    });

    el.copyEmailBtn.addEventListener("click", () => {
      if (!state.current) return;
      handleCopy(el.copyEmailBtn, state.current.email, "Email address copied.");
    });

    el.copyAllBtn.addEventListener("click", () => {
      if (!state.current) return;
      const profile = state.current;
      const text = [
        "User Agent: " + profile.ua,
        "Email: " + profile.email,
        "Chrome: " + profile.chrome + ".0.0.0",
        "Platform: Windows NT 10.0; Win64; x64",
        "Generated: " + profile.generatedAt,
      ].join("\n");
      handleCopy(el.copyAllBtn, text, "Full profile copied.");
    });

    el.historyBody.addEventListener("click", (event) => {
      const button = event.target.closest("[data-history-action]");
      if (!button) return;

      const profile = state.profiles.find((item) => item.id === button.dataset.profileId);
      if (!profile) return;

      if (button.dataset.historyAction === "email") {
        handleCopy(button, profile.email, "Email address copied.");
      } else if (button.dataset.historyAction === "ua") {
        handleCopy(button, profile.ua, "User agent copied.");
      }
    });

    el.exportBtn.addEventListener("click", exportCsv);
    el.clearBtn.addEventListener("click", clearHistory);

    document.addEventListener("keydown", (event) => {
      if (event.defaultPrevented || event.repeat) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditableElement(event.target)) return;

      if (event.key.toLowerCase() === "g") {
        event.preventDefault();
        void generateProfile(false);
      }
    });
  }

  /* ---------------------------------------------------------------------
     Initialisation
     --------------------------------------------------------------------- */

  function init() {
    populateVersionSelect();

    const preferences = readPreferences();
    applyVersionPreference(preferences);

    state.profiles = readProfiles();
    state.usedEmails = readUsedEmails();
    state.profiles.forEach((profile) => state.usedEmails.add(profile.email));

    const storedTotal = Number(readStorage(STORAGE_KEYS.total, 0));
    state.totalGenerated = Number.isFinite(storedTotal) && storedTotal >= 0
      ? Math.max(storedTotal, state.profiles.length)
      : state.profiles.length;

    if (el.year) {
      el.year.textContent = String(new Date().getFullYear());
    }

    bindEvents();

    if (state.profiles.length > 0) {
      renderProfile(state.profiles[0], { restored: true });
    } else {
      renderEmptyOutput();
    }

    renderHistory();
    persistState();
    void detectEmailService();
  }

  init();
})();
