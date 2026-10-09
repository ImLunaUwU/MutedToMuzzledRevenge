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

  function labelOf(p) {
    if (!p) return "";
    return String(p.accessibilityLabel || p["aria-label"] || p.label || p.text || "").toLowerCase();
  }

  function stateOf(p) {
    const t = labelOf(p);
    if (!t) return "";
    if (/channel|server|notif|bell|volume|output|speaker/.test(t)) return "";
    if (t.includes("undeafen")) return "deafened";
    if (t.includes("deafen")) return "undeafened";
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
    const props = args[1];
    if (!props || props.__muzzleOv) return;
    const state = stateOf(props);
    if (!state) return;
    props.__muzzleOv = true;
    props.children = overlayWrap(props.children, props.style, ICON[state]);
    log.log("[muzzle-ov] wrapped " + state + " " + labelOf(props));
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