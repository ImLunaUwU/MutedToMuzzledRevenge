(() => {
  const MUZZLE = {
    uri: "https://raw.githubusercontent.com/zoez22/muzzlemute/refs/heads/main/dog.png",
    width: 24,
    height: 24,
  };
  const NAMES = ["MicrophoneSlashIcon", "ic_mic_muted", "ic_mic_muted_24px"];
  const applied = [];
  let assets;

  function list() {
    return [...assets.getAssets()]
      .filter((a) => /mic|mute|headset|voice/i.test(a.name))
      .map((a) => a.name + " (" + a.type + ") #" + a.id);
  }

  function apply(name) {
    const asset = assets.getAssetByName(name);
    if (!asset || applied.indexOf(name) !== -1) return;
    assets.addAssetOverride(asset, MUZZLE);
    applied.push(name);
    console.log("[muzzle] overrode " + name + " #" + asset.id);
  }

  return {
    start(api) {
      assets = (api && (api.assets || (api.unscoped && api.unscoped.assets))) || null;
      if (!assets) {
        console.log("[muzzle] no assets on api. keys: " + (api ? Object.keys(api).join(",") : "start() got nothing"));
        return;
      }
      console.log("[muzzle] assets\n" + list().join("\n"));
      for (const name of NAMES) {
        if (assets.getAssetByName(name)) apply(name);
        else assets.onAssetRegistered(name, () => apply(name));
      }
    },
    stop() {
      if (!assets) return;
      for (const name of applied) assets.removeAssetOverride(name);
      applied.length = 0;
    },
  };
})();