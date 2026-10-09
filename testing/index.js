(() => {
  const MUZZLE = {
    uri: "https://raw.githubusercontent.com/zoez22/muzzlemute/refs/heads/main/dog.png",
    width: 24,
    height: 24,
  };
  const NAMES = [
    "voice_bar_mute_on",
    "MicrophoneSlashIcon",
    "ic_mic_muted_24px",
    "ic_mic_muted_dark_24px",
    "ic_mic_muted_light_24px",
  ];
  const unpatches = [];

  function boot() {
    const v = globalThis.vendetta;
    const ids = [];
    for (const name of NAMES) {
      const id = v.ui.assets.getAssetIDByName(name);
      if (typeof id === "number") ids.push(id);
    }
    const RN = v.metro.common.ReactNative;
    unpatches.push(v.patcher.before("render", RN.Image, (args) => {
      const props = args[0];
      if (!props) return;
      const src = props.source;
      const id = typeof src === "number" ? src : src && src.__packager_asset;
      if (ids.indexOf(id) !== -1 || ids.indexOf(src) !== -1) props.source = MUZZLE;
    }));
    v.logger.log("[muzzle] swapped " + ids.join(","));
  }

  return {
    start: boot,
    onLoad: boot,
    stop() { for (const u of unpatches) u(); unpatches.length = 0; },
    onUnload() { for (const u of unpatches) u(); unpatches.length = 0; },
  };
})();