(() => {
  const React = vendetta.metro.common.React;
  const RN = vendetta.metro.common.ReactNative;
  const { before } = vendetta.patcher;
  const { findByProps } = vendetta.metro;
  const log = vendetta.logger;

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
  };

  const IDS = {
    2101: ICON.muted,    // voice_bar_mute_on
    2288: ICON.muted,    // voice_bar_mute_on
    2222: ICON.muted,    // MicrophoneSlashIcon
    2198: ICON.muted,    // ic_mic_muted_24px
    2812: ICON.muted,    // ic_mic_muted_dark_24px
    2813: ICON.muted,    // ic_mic_muted_light_24px
    2221: ICON.muted,    // MicrophoneDenyIcon
    2289: ICON.unmuted,  // voice_bar_mute_off
    2287: ICON.unmuted,  // MicrophoneIcon
    2105: ICON.unmuted,  // ic_mic_24px
    2863: ICON.unmuted,  // mic
  };

  function sourceId(src) {
    if (typeof src === "number") return src;
    if (src && typeof src.__packager_asset === "number") return src.__packager_asset;
    return null;
  }

  function labelState(p) {
    const t = String(p.accessibilityLabel || p["aria-label"] || p.label || "").toLowerCase();
    if (!t || /channel|server|notif|bell|volume|output|deafen/.test(t)) return "";
    if (t.includes("unmute")) return "muted";
    if (t.includes("mute")) return "unmuted";
    return "";
  }

  function overlayWrap(inner, style, icon) {
    return React.createElement(
      RN.View,
      {
        pointerEvents: "box-none",
        style: [{ alignItems: "center", justifyContent: "center" }, style],
      },
      React.createElement(RN.View, { style: { opacity: 0 } }, inner),
      React.createElement(RN.Image, {
        source: icon,
        resizeMode: "contain",
        pointerEvents: "none",
        style: {
          position: "absolute",
          width: 24,
          height: 24,
          top: "50%",
          left: "50%",
          marginTop: -12,
          marginLeft: -12,
        },
      })
    );
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
    if (!type || !props || props.__muzzleOv) return;

    const id = sourceId(props.source);
    if (type === RN.Image && id !== null && IDS[id]) {
      props.__muzzleOv = true;
      props.source = IDS[id];
      props.resizeMode = "contain";
      log.log("[muzzle-ov] asset #" + id);
      return;
    }

    const state = labelState(props);
    if (!state) return;
    props.__muzzleOv = true;
    props.children = overlayWrap(props.children, props.style, ICON[state]);
    log.log("[muzzle-ov] button " + state);
  }

  try {
    RN.Image.prefetch(ICON.muted.uri);
    RN.Image.prefetch(ICON.unmuted.uri);
  } catch (_) {}

  return {
    onLoad() {
      safe(() => {
        const rt = findByProps("jsx", "jsxs");
        if (!rt) return;
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