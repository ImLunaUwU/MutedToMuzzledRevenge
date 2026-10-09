import {
  addAssetOverride,
  getAssetByName,
  getAssets,
  onAssetRegistered,
} from "@revenge-mod/assets";

const MUZZLE_URI =
  "https://raw.githubusercontent.com/zoez22/muzzlemute/refs/heads/main/dog.png";

const CANDIDATE_NAMES = [
  "MicOffIcon",
  "MicOnIcon",
  "MicIcon",
  "VoiceCallIcon",
  "MuteIcon",
  "DeafenIcon",
  "UnmuteIcon",
  "AudioIcon",
];

function listMicLikeAssets() {
  return [...getAssets()]
    .filter((asset) => /mic|mute|voice|audio/i.test(asset.name))
    .map((asset) => ({ name: asset.name, type: asset.type, id: asset.id }));
}

function applyOverride(assetName) {
  const asset = getAssetByName(assetName);
  if (!asset) return;

  addAssetOverride(asset, {
    uri: MUZZLE_URI,
    width: 24,
    height: 24,
  });

  console.log(`[revenge-asset] override applied for ${assetName}`);
}

export default {
  start() {
    console.log("[revenge-asset] matching assets:", listMicLikeAssets());

    for (const name of CANDIDATE_NAMES) {
      const asset = getAssetByName(name);
      if (asset) {
        applyOverride(name);
      } else {
        onAssetRegistered(name, () => applyOverride(name));
      }
    }
  },

  stop() {
    console.log("[revenge-asset] stopped");
  },
};