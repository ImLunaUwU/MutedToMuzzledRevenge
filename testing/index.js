(() => {
  function boot() {
    const out = { step: "boot" };
    try {
      const v = globalThis.vendetta;
      out.vendettaKeys = v ? Object.keys(v) : null;
      out.metroKeys = v && v.metro ? Object.keys(v.metro) : null;
      out.uiKeys = v && v.ui ? Object.keys(v.ui) : null;
      const assets = v && v.ui && v.ui.assets;
      out.assetType = assets ? typeof assets : "missing";
      if (assets && typeof assets === "object") {
        out.rows = Object.keys(assets)
          .filter((name) => /mic|mute|headset|voice/i.test(name))
          .map((name) => name + " #" + assets[name]);
      }
      out.step = "done";
    } catch (e) {
      out.step = "threw";
      out.error = String(e && e.stack || e);
    }
    globalThis.__muzzle = out;
  }

  return { start: boot, onLoad: boot, stop() {}, onUnload() {} };
})();