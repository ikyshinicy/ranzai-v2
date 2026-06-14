// /scripts/core/view.js
// RanzAI SPA Tool Loader
// Tugas: load file JS tool, mount ke #tool-container, jalankan render tool,
// dan sinkronkan URL hash seperti /dashboard#breakdown.

(function () {
  const loadedScripts = new Map();

  const TOOL_REGISTRY = {
    breakdown: {
      title: "RanzAI Breakdown",
      icon: "🔍",
      script: "/tools/breakdown/breakdown.js",
      globalPath: ["RanzTools", "breakdown"],
      fallbackGlobal: "RanzAIBreakdown"
    },

    design: {
      title: "RanzAI Design",
      icon: "🎨",
      script: "/tools/design/design.js?v=2",
      globalPath: ["RanzTools", "design"],
      fallbackGlobal: "RanzAIDesign"
    },

    write: {
      title: "RanzAI Write",
      icon: "✍️",
      script: "/tools/write/write.js",
      globalPath: ["RanzTools", "write"],
      fallbackGlobal: "RanzAIWrite"
    },

    gel: {
      title: "RanzAI Gel",
      icon: "✨",
      script: "/tools/gel/gel.js",
      globalPath: ["RanzTools", "gel"],
      fallbackGlobal: "RanzAIGel"
    },

    cut: {
      title: "RanzAI Cut",
      icon: "✂️",
      script: "/tools/cut/cut.js",
      globalPath: ["RanzTools", "cut"],
      fallbackGlobal: "RanzAICut"
    },

    convert: {
      title: "RanzAI Convert",
      icon: "📄",
      script: "/tools/convert/convert.js",
      globalPath: ["RanzTools", "convert"],
      fallbackGlobal: "RanzAIConvert"
    },
    
    payment: {
      title: "RanzAI Payment",
      icon: "💳",
      script: "/scripts/account/payment.js?v=3",
      globalPath: ["RanzTools", "payment"],
      fallbackGlobal: "RanzAIPayment"
    },

    doc: {
      title: "RanzAI Doc",
      icon: "📄",
      script: "/tools/doc/doc.js",
      globalPath: ["RanzTools", "doc"],
      fallbackGlobal: "RanzAIDoc"
    },

    vector: {
      title: "RanzAI Vector",
      icon: "✦",
      script: "/tools/vector/vector.js",
      globalPath: ["RanzTools", "vector"],
      fallbackGlobal: "RanzAIVector"
    },

    support: {
      title: "Bantuan & Support",
      icon: "🎧",
      script: "/scripts/account/support.js",
      globalPath: ["RanzTools", "support"],
      fallbackGlobal: "RanzAISupport"
    },

    terms: {
      title: "Syarat & Ketentuan",
      icon: "📋",
      script: "/scripts/account/terms.js",
      globalPath: ["RanzTools", "terms"],
      fallbackGlobal: "RanzAITerms"
    }
  };

  let currentToolKey = "home";
  let routerReady = false;

  function qs(selector) {
    return document.querySelector(selector);
  }

  function getNestedGlobal(path) {
    let current = window;

    for (const key of path) {
      if (!current || !current[key]) return null;
      current = current[key];
    }

    return current;
  }

  function getToolModule(toolKey) {
    const config = TOOL_REGISTRY[toolKey];

    if (!config) return null;

    const primary = getNestedGlobal(config.globalPath);

    if (primary && typeof primary.render === "function") {
      return primary;
    }

    const fallback = window[config.fallbackGlobal];

    if (fallback && typeof fallback.render === "function") {
      return fallback;
    }

    return null;
  }

  function loadScript(src) {
    if (loadedScripts.has(src)) {
      return loadedScripts.get(src);
    }

    const promise = new Promise(function (resolve, reject) {
      const existing = document.querySelector('script[data-ranzai-tool-script="' + src + '"]');

      if (existing) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = src;
      script.async = true;
      script.dataset.ranzaiToolScript = src;

      script.onload = function () {
        resolve();
      };

      script.onerror = function () {
        reject(new Error("Gagal memuat script tool: " + src));
      };

      document.body.appendChild(script);
    });

    loadedScripts.set(src, promise);

    return promise;
  }

  function updateHash(toolKey) {
    if (!routerReady) return;

    if (!toolKey || toolKey === "home") {
      history.replaceState(null, "", "/dashboard");
      return;
    }

    history.replaceState(null, "", "/dashboard#" + toolKey);
  }

  function getToolFromHash() {
    const hash = window.location.hash.replace("#", "").trim().toLowerCase();

    if (hash && TOOL_REGISTRY[hash]) {
      return hash;
    }

    return null;
  }

  function setActiveSidebar(toolKey) {
    document.querySelectorAll(".sidebar-tool, .sidebar-link").forEach(function (el) {
      el.classList.remove("active");
    });

    const home = qs("#sidebar-home");

    if (home && toolKey === "home") {
      home.classList.add("active");
      return;
    }

    const btn = qs('[data-tool="' + toolKey + '"]') || qs("#tool-btn-" + toolKey);

    if (btn) {
      btn.classList.add("active");
    }
  }

  function setTopbarTitle(text) {
    const title = qs("#topbarTitle");

    if (title) {
      title.textContent = text || "User Dashboard";
    }
  }

  function showToolLoading(show) {
    const loader = qs("#toolLoading");

    if (!loader) return;

    loader.classList.toggle("show", Boolean(show));
  }

  function showHomeView() {
    currentToolKey = "home";

    const homeView = qs("#view-home");
    const toolView = qs("#view-tool");
    const toolContainer = qs("#tool-container");

    if (toolContainer) {
      toolContainer.innerHTML = "";
    }

    window._ranzCurrentTool = null;

    if (toolView) {
      toolView.classList.remove("active");
    }

    if (homeView) {
      homeView.classList.add("active");
    }

    showToolLoading(false);
    setTopbarTitle("User Dashboard");
    setActiveSidebar("home");
    updateHash("home");

    if (typeof window.closeSidebar === "function") {
      window.closeSidebar();
    }
  }

  async function loadTool(toolKey) {
    const config = TOOL_REGISTRY[toolKey];

    const homeView = qs("#view-home");
    const toolView = qs("#view-tool");
    const toolContainer = qs("#tool-container");

    if (!config) {
      console.error("Tool tidak dikenal:", toolKey);
      return;
    }

    if (!toolContainer) {
      console.error("Container #tool-container tidak ditemukan.");
      return;
    }

    currentToolKey = toolKey;

    if (homeView) {
      homeView.classList.remove("active");
    }

    if (toolView) {
      toolView.classList.add("active");
    }

    setTopbarTitle(config.title);
    setActiveSidebar(toolKey);
    updateHash(toolKey);

    toolContainer.innerHTML = "";
    showToolLoading(true);

    // Lazy load CSS untuk tool ini (kalau ada)
    if (typeof window.loadToolCSS === "function") {
      window.loadToolCSS(toolKey);
    }

    try {
      await loadScript(config.script);

      const module = getToolModule(toolKey);

      if (!module) {
        throw new Error("Module render untuk " + toolKey + " tidak ditemukan.");
      }

      window._ranzCurrentTool = toolKey;

      module.render(toolContainer, {
        key: toolKey,
        title: config.title,
        icon: config.icon
      });
    } catch (error) {
      console.error(error);

      toolContainer.innerHTML =
        '<div class="tool-error-box">' +
          '<strong>Tool gagal dimuat.</strong>' +
          '<p>' + String(error.message || error) + '</p>' +
        '</div>';
    } finally {
      showToolLoading(false);

      if (typeof window.closeSidebar === "function") {
        window.closeSidebar();
      }
    }
  }

  function bindToolLinks() {
    document.querySelectorAll("[data-tool]").forEach(function (el) {
      el.addEventListener("click", function (event) {
        event.preventDefault();

        const toolKey = el.dataset.tool;

        if (toolKey) {
          loadTool(toolKey);
        }
      });
    });

    document.querySelectorAll("[data-dashboard-home]").forEach(function (el) {
      el.addEventListener("click", function (event) {
        event.preventDefault();
        showHomeView();
      });
    });
  }

  function bindHashChange() {
    window.addEventListener("hashchange", function () {
      const hashTool = getToolFromHash();

      if (hashTool) {
        if (hashTool !== currentToolKey) {
          loadTool(hashTool);
        }
      } else if (currentToolKey !== "home") {
        showHomeView();
      }
    });
  }

  function initViewRouter() {
    bindToolLinks();
    bindHashChange();

    routerReady = true;

    window.RanzView = {
      loadTool: loadTool,
      showHome: showHomeView,
      registry: TOOL_REGISTRY
    };

    const initialTool = getToolFromHash();

    if (initialTool) {
      loadTool(initialTool);
    }
  }

  window.RanzView = {
    loadTool: loadTool,
    showHome: showHomeView,
    registry: TOOL_REGISTRY,
    init: initViewRouter
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initViewRouter);
  } else {
    initViewRouter();
  }
})();
