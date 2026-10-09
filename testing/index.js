import {
  addAssetOverride,
  getAssetByName,
  getAssets,
  removeAssetOverride,
} from "@revenge-mod/assets";

const ASSET_NAME = "MicOffIcon";
const MUZZLE = {
  uri: "https://raw.githubusercontent.com/zoez22/muzzlemute/refs/heads/main/dog.png",
  width: 24,
  height: 24,
};

function logAssetCandidates() {
  const matches = [...getAssets()]
    .filter((asset) => /mic|mute|voice|audio/i.test(asset.name))
    .map((asset) => `${asset.name} (${asset.type})`);

  console.log("[MutedToMuzzled:assets]", matches);
}

export default {
  start() {
    logAssetCandidates();

    const asset = getAssetByName(ASSET_NAME);
    if (!asset) {
      console.warn(
        `[MutedToMuzzled:assets] ${ASSET_NAME} is not registered yet; retry once Discord finishes loading the icon set.`
      );
      return;
    }

    console.log(`[MutedToMuzzled:assets] target asset:`, asset);
    addAssetOverride(ASSET_NAME, MUZZLE);
    console.log(`[MutedToMuzzled:assets] override active for ${ASSET_NAME}`);
  },

  stop() {
    removeAssetOverride(ASSET_NAME);
    console.log(`[MutedToMuzzled:assets] removed override for ${ASSET_NAME}`);
  },
};
