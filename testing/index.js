(() => {
  const {
    getAssets,
    getAssetByName,
    addAssetOverride,
    removeAssetOverride,
    onAssetRegistered,
  } = revenge.assets;

  const MUZZLE = {
    uri: "https://raw.githubusercontent.com/zoez22/muzzlemute/refs/heads/main/dog.png",
    width: 24,
    height: 24,
  };

  const NAMES = ["MicrophoneSlashIcon", "ic_mic_muted", "ic_mic_muted_24px"];
  const applied = [];

  function list() {
    return [...getAssets()]
      .filter((a) => /mic|mute|headset|voice/i.test(a.name))
      .map((a) => a.name + " (" + a.type + ") #" + a.id);
  }

  function apply(name) {
    const asset = getAssetByName(name);
    if (!asset || applied.indexOf(name) !== -1) return;
    addAssetOverride(asset, MUZZLE);
    applied.push(name);
    console.log("[muzzle] overrode " + name + " #" + asset.id);
  }

  return {
    start() {
      console.log("[muzzle] assets\n" + list().join("\n"));
      for (const name of NAMES) {
        if (getAssetByName(name)) apply(name);
        else onAssetRegistered(name, () => apply(name));
      }
    },
    stop() {
      for (const name of applied) removeAssetOverride(name);
      applied.length = 0;
    },
  };
})();