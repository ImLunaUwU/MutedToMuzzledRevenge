(() => {
  const MUZZLE = {
    uri: "https://raw.githubusercontent.com/zoez22/muzzlemute/refs/heads/main/dog.png",
    width: 24,
    height: 24,
  };
  const NAMES = ["MicrophoneSlashIcon", "ic_mic_muted", "ic_mic_muted_24px"];
  const applied = [];
  let assets;

  function say(msg) {
    globalThis.__muzzleLog = (globalThis.__muzzleLog || "") + msg + "\n";
    try { console.log(msg); } catch (e) {}
  }

  function boot(api) {
    say("[muzzle] boot keys: " + (api ? Object.keys(api).join(",") : "none"));
    assets = (api && (api.assets || (api.unscoped && api.unscoped.assets))) || null;
    if (!assets) return;
    const rows = [...assets.getAssets()]
      .filter((a) => /mic|mute|headset|voice/i.test(a.name))
      .map((a) => a.name + " (" + a.type + ") #" + a.id);
    globalThis.__muzzle = rows;
    say("[muzzle] assets\n" + rows.join("\n"));
    for (const name of NAMES) {
      const asset = assets.getAssetByName(name);
      if (!asset || applied.indexOf(name) !== -1) {
        if (!asset) assets.onAssetRegistered(name, () => boot(api));
        continue;
      }
      assets.addAssetOverride(asset, MUZZLE);
      applied.push(name);
      say("[muzzle] overrode " + name + " #" + asset.id);
    }
  }

  function halt() {
    if (!assets) return;
    for (const name of applied) assets.removeAssetOverride(name);
    applied.length = 0;
  }

  return {
    start: boot,
    onLoad: boot,
    stop: halt,
    onUnload: halt,
  };
})();