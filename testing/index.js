(() => {
  const React = vendetta.metro.common.React;
  const RN = vendetta.metro.common.ReactNative;
  const { before } = vendetta.patcher;
  const { findByProps } = vendetta.metro;
  const log = vendetta.logger;

  const MUZZLE = {
    uri: "https://raw.githubusercontent.com/zoez22/muzzlemute/refs/heads/main/dog.png",
    width: 24,
    height: 24,
  };

  // voice_bar_mute_on, MicrophoneSlashIcon, ic_mic_muted_*
  const IDS = [2101, 2288, 2222, 2198, 2812, 2813];

  function labelOf(p) {
    if (!p) return "";
    return String(
      p.accessibilityLabel || p["aria-label"] || p.label || p.text || ""
    ).toLowerCase();
  }

  function isMutedMicButton(p) {
    const t = labelOf(p);
    if (!t) return false;
    if (/channel|server|notif|bell|volume|højttaler|deaf/.test(t)) return false;
    if (t.includes("unmute")) return true;
    if (t.includes("afmute")) return true;
    if (t.includes("slå mikrofon til")) return true;
    if (t.includes("slå lyden til") && t.includes("mikrofon")) return true;
    const st = p.accessibilityState || {};
    if ((t.includes("mute") || t.includes("mikrofon") || t.includes("mic")) && st.checked === true)
      return true;
    return false;
  }

  function sourceId(src) {
    if (typeof src === "number") return src;
    if (src && typeof src.__packager_asset === "number") return src.__packager_asset;
    return null;
  }

  function overlayWrap(inner, style) {
    return React.createElement(
      RN.View,
      {
        pointerEvents: "box-none",
        style: [{ alignItems: "center", justifyContent: "center" }, style],
      },
      React.createElement(RN.View, { style: { opacity: 0 } }, inner),
      React.createElement(RN.Image, {
        source: MUZZLE,
        resizeMode: "contain",
        pointerEvents: "none",
        style: { position: "absolute", width: 22, height: 22 },
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
    if (type === RN.Image && id !== null && IDS.indexOf(id) !== -1) {
      props.__muzzleOv = true;
      props.source = MUZZLE;
      log.log("[muzzle-ov] asset " + id);
      return;
    }

    if (!isMutedMicButton(props)) return;
    props.__muzzleOv = true;
    props.children = overlayWrap(props.children, props.style);
    log.log("[muzzle-ov] wrapped " + labelOf(props));
  }

  try {
    RN.Image.prefetch(MUZZLE.uri);
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
        return () => {
          a();
          b();
        };
      });
      safe(() => before("createElement", React, hookArgs));
    },
    onUnload() {
      unpatches.forEach((u) => {
        try { u(); } catch (_) {}
      });
    },
  };
})();