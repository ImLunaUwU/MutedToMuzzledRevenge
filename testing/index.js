(() => {
  function boot() {
    const g = globalThis;
    const keys = Object.getOwnPropertyNames(g).filter((k) =>
      /revenge|vendetta|bunny|metro|asset|discord|__r|modules/i.test(k)
    );
    const out = {
      keys,
      hasR: typeof g.__r,
      hasVendetta: typeof g.vendetta,
      hasRevenge: typeof g.revenge,
      assets: [],
    };

    let registry;
    const require = g.__r;
    if (typeof require === "function" && require.m) {
      for (const id of Object.keys(require.m)) {
        let mod;
        try { mod = require(id); } catch (e) { continue; }
        const x = mod && (mod.default || mod);
        if (x && x.getAssetByID && x.registerAsset) {
          registry = x;
          break;
        }
      }
    }

    if (registry) {
      for (let id = 1; id <= 20000; id++) {
        let a;
        try { a = registry.getAssetByID(id); } catch (e) { continue; }
        if (!a || !a.name) continue;
        if (/mic|mute|headset|voice/i.test(a.name)) out.assets.push(a.name + " #" + id);
      }
    }

    g.__muzzle = out;
  }

  return { start: boot, onLoad: boot, stop() {}, onUnload() {} };
})();