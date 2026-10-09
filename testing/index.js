(() => {
  const React = vendetta.metro.common.React;
  const RN = vendetta.metro.common.ReactNative;
  const { before } = vendetta.patcher;
  const { findByProps } = vendetta.metro;
  const log = vendetta.logger;
  const assets = vendetta.ui.assets;

  const ICON = {
    muted: {
      uri: "https://raw.githubusercontent.com/zoez22/muzzlemute/refs/heads/main/nobark.png",
      width: 24,
      height: 24,
    },
    unmuted: {
      uri: "https://raw.githubusercontent.com/zoez22/muzzlemute/refs/heads/main/barkbark.png",
      width: 24,
      height: 24,
    },
    deafened: {
      uri: "https://raw.githubusercontent.com/zoez22/muzzlemute/refs/heads/main/caged.png",
      width: 24,
      height: 24,
    },
    undeafened: {
      uri: "https://raw.githubusercontent.com/zoez22/muzzlemute/refs/heads/main/open_cage.png",
      width: 24,
      height: 24,
    },
  };

  function sourceId(src) {
    if (typeof src === "number") return src;
    if (src && typeof src.__packager_asset === "number") return src.__packager_asset;
    return null;
  }

  function stateForAsset(id) {
    let a;
    try { a = assets.getAssetByID(id); } catch (e) { return ""; }
    const n = String((a && a.name) || "").toLowerCase();
    if (!n) return "";
    if (/channel|volume|bell|notif/.test(n)) return "";
    if (/deafen_off|undeafen/.test(n)) return "undeafened";
    if (/deafen|headset_deafened/.test(n)) return "deafened";
    if (/mute_off|unmute/.test(n)) return "unmuted";
    if (/microphoneicon$|^mic$|ic_mic_24px/.test(n)) return "unmuted";
    if (/mute_on|muted|slash|deny/.test(n)) return "muted";
    return "";
  }

  const unpatches = [];
  function safe(fn) {
    try {
      const u = fn();
      if (typeof u === "function") unpatches.push(u);
    } catch (e) {
      log.log("[muzzle-ov] " + String(e && e.message));
    }
  }

  function hookArgs(args) {
    const type = args[0];
    const props = args[1];
    if (type !== RN.Image || !props || props.__muzzleOv) return;
    const id = sourceId(props.source);
    if (id === null) return;
    const state = stateForAsset(id);
    if (!state) return;
    props.__muzzleOv = true;
    props.source = ICON[state];
    props.resizeMode = "contain";
    log.log("[muzzle-ov] " + state + " #" + id);
  }

  try {
    RN.Image.prefetch(ICON.muted.uri);
    RN.Image.prefetch(ICON.unmuted.uri);
    RN.Image.prefetch(ICON.deafened.uri);
    RN.Image.prefetch(ICON.undeafened.uri);
  } catch (_) {}

  return {
    onLoad() {
      safe(() => {
        const rt = findByProps("jsx", "jsxs");
        if (!rt) {
          log.log("[muzzle-ov] no jsx");
          return;
        }
        const a = before("jsx", rt, hookArgs);
        const b = before("jsxs", rt, hookArgs);
        return () => { a(); b(); };
      });
      safe(() => before("createElement", React, hookArgs));
    },
    onUnload() {
      unpatches.forEach((u) => { try { u(); } catch (_) {} });
    },
  };
})();