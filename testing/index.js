(() => {
  const MUZZLE = {
    uri: "https://raw.githubusercontent.com/zoez22/muzzlemute/refs/heads/main/dog.png",
    width: 24,
    height: 24,
  };
  const IDS = [2101, 2288, 2222, 2198, 2812, 2813];
  const unpatches = [];

  function swap(args) {
    const props = args[1];
    if (!props) return;
    const src = props.source;
    const id = typeof src === "number" ? src : src && src.__packager_asset;
    if (IDS.indexOf(id) !== -1 || IDS.indexOf(src) !== -1) props.source = MUZZLE;
  }

  function boot() {
    const out = { step: "boot", ids: IDS };
    try {
      const v = globalThis.vendetta;
      const React = v.metro.common.React;
      unpatches.push(v.patcher.before("createElement", React, swap));
      if (React.jsx) unpatches.push(v.patcher.before("jsx", React, swap));
      if (React.jsxs) unpatches.push(v.patcher.before("jsxs", React, swap));
      out.step = "patched";
    } catch (e) {
      out.step = "threw";
      out.error = String((e && e.stack) || e);
    }
    globalThis.__muzzle = out;
  }

  function halt() {
    for (const u of unpatches) u();
    unpatches.length = 0;
  }

  return { start: boot, onLoad: boot, stop: halt, onUnload: halt };
})();