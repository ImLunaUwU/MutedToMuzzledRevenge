(() => {
  const MUZZLE = {
    uri: "https://raw.githubusercontent.com/zoez22/muzzlemute/refs/heads/main/dog.png",
    width: 24,
    height: 24,
  };
  const unpatches = [];

  function boot() {
    const v = globalThis.vendetta;
    const registry = v.metro.findByProps("registerAsset", "getAssetByID");
    const uiAssets = v.ui && v.ui.assets;
    const rows = [];

    if (uiAssets) {
      for (const name of Object.keys(uiAssets)) {
        if (/mic|mute|headset|voice/i.test(name)) rows.push("ui " + name + " #" + uiAssets[name]);
      }
    }

    const hits = [];
    if (registry) {
      for (let id = 1; id <= 30000; id++) {
        let a;
        try { a = registry.getAssetByID(id); } catch (e) { continue; }
        if (!a || !a.name || !/mic|mute|headset|voice/i.test(a.name)) continue;
        rows.push(a.name + " #" + id);
        if (/MicrophoneSlash|ic_mic_muted/i.test(a.name)) hits.push(id);
      }
    }

    globalThis.__muzzle = {
      vendettaKeys: Object.keys(v),
      ui: v.ui ? Object.keys(v.ui) : [],
      registry: !!registry,
      rows,
    };

    if (!hits.length) return;
    const RN = v.metro.common.ReactNative;
    unpatches.push(v.patcher.before("render", RN.Image, (args) => {
      const props = args[0];
      const src = props && props.source;
      const id = typeof src === "number" ? src : src && src.uri && null;
      if (hits.indexOf(src) !== -1 || hits.indexOf(id) !== -1) props.source = MUZZLE;
    }));
  }

  return {
    start: boot,
    onLoad: boot,
    stop() { for (const u of unpatches) u(); unpatches.length = 0; },
    onUnload() { for (const u of unpatches) u(); unpatches.length = 0; },
  };
})();