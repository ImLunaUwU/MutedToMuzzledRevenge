(() => {
  function boot() {
    const out = { step: "boot" };
    try {
      const v = globalThis.vendetta;
      const assets = v.ui.assets;
      const keys = Object.keys(assets);
      out.assetKeyCount = keys.length;
      out.assetKeySample = keys.slice(0, 40);
      out.registry = false;
      out.seen = 0;
      out.rows = [];

      const registry = v.metro.findByProps("registerAsset", "getAssetByID");
      out.registry = !!registry;
      if (registry) {
        for (let id = 1; id <= 8000; id++) {
          let a;
          try { a = registry.getAssetByID(id); } catch (e) { continue; }
          if (!a || !a.name) continue;
          out.seen++;
          if (/mic|mute|headset|voice|microphone/i.test(a.name)) {
            out.rows.push(a.name + " #" + id);
          }
        }
      }
      out.step = "done";
    } catch (e) {
      out.step = "threw";
      out.error = String((e && e.stack) || e);
    }
    globalThis.__muzzle = out;
  }

  return { start: boot, onLoad: boot, stop() {}, onUnload() {} };
})();