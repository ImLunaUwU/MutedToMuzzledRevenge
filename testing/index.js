const {
  addAssetOverride,
  getAssetByName,
  getAssets,
  removeAssetOverride,
} = require("@revenge-mod/assets");

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

  const ASSET_TARGETS = [
    "MicOffIcon",
    "MuteIcon",
    "UnmuteIcon",
    "DeafenIcon",
    "UndeafenIcon",
    "VoiceChannelMuteIcon",
    "VoiceChannelUnmuteIcon",
    "VoiceChannelDeafenIcon",
    "VoiceChannelUndeafenIcon",
  ];

  function labelOf(p) {
    if (!p) return "";
    const value =
      p.accessibilityLabel ||
      p["aria-label"] ||
      p.label ||
      p.text ||
      p.name ||
      "";
    return String(value).toLowerCase();
  }

  function stateInfo(p) {
    const st = p && (p.accessibilityState || p.state || {});
    return {
      checked: typeof st.checked === "boolean" ? st.checked : null,
      selected: typeof st.selected === "boolean" ? st.selected : null,
      disabled: typeof st.disabled === "boolean" ? st.disabled : null,
    };
  }

  function looksLikeVoiceToggle(p) {
    if (!p) return false;
    const text = labelOf(p);
    const state = stateInfo(p);

    if (!text && state.checked == null && state.selected == null) return false;
    if (
      /channel|server|notif|bell|volume|speaker|audio/.test(text) &&
      !/mute|mic|microphone|deaf|voice/.test(text)
    ) {
      return false;
    }

    return (
      /mute|unmute|mic|microphone|deaf|undeaf|voice|speaker/.test(text) ||
      state.checked != null ||
      state.selected != null
    );
  }

  function logAssetCandidates() {
    try {
      const entries = [...getAssets()]
        .filter((asset) => /mic|mute|voice|audio|deaf|speaker/i.test(asset.name))
        .map((asset) => `${asset.name} (${asset.type})`);
      log.log("[MutedToMuzzled:data] asset candidates:", entries);
    } catch (e) {
      log.log("[MutedToMuzzled:data] asset scan failed:", String(e && e.message));
    }
  }

  function logAssetTargets() {
    for (const name of ASSET_TARGETS) {
      try {
        const asset = getAssetByName(name);
        log.log("[MutedToMuzzled:data] asset probe:", name, asset || "missing");
      } catch (e) {
        log.log("[MutedToMuzzled:data] asset probe failed:", name, String(e && e.message));
      }
    }
  }

  function hookVoiceControl(args) {
    const type = args[0];
    const props = args[1];
    if (!type || !props || props.__mutedToMuzzledProbe) return;
    if (!looksLikeVoiceToggle(props)) return;

    props.__mutedToMuzzledProbe = true;

    const info = {
      type: type && (type.displayName || type.name || String(type)),
      label: labelOf(props),
      state: stateInfo(props),
      source: props.source || props.icon || props.children || null,
      debug: {
        hasChildren: !!props.children,
        hasSource: !!(props.source || props.icon),
      },
    };

    log.log("[MutedToMuzzled:data] voice control observed:", info);

    if (props.source && typeof props.source === "object" && props.source.uri) {
      log.log("[MutedToMuzzled:data] source uri:", props.source.uri);
    }

    if (props.icon && typeof props.icon === "string") {
      log.log("[MutedToMuzzled:data] icon name:", props.icon);
    }
  }

  const unpatches = [];
  function safe(fn) {
    try {
      const u = fn();
      if (typeof u === "function") unpatches.push(u);
    } catch (e) {
      log.log("[MutedToMuzzled:data] safe hook failed:", String(e && e.message));
    }
  }

  function applyDirectAssetOverride() {
    try {
      const target = getAssetByName("MicOffIcon");
      if (target) {
        addAssetOverride("MicOffIcon", MUZZLE);
        log.log("[MutedToMuzzled:data] direct asset override active for MicOffIcon");
      } else {
        log.log("[MutedToMuzzled:data] MicOffIcon not yet registered; waiting for Discord to finish loading assets");
      }
    } catch (e) {
      log.log("[MutedToMuzzled:data] direct override failed:", String(e && e.message));
    }
  }

  return {
    onLoad() {
      logAssetCandidates();
      logAssetTargets();
      applyDirectAssetOverride();

      safe(() => {
        const rt = findByProps("jsx", "jsxs");
        if (!rt) {
          log.log("[MutedToMuzzled:data] no JSX runtime found");
          return;
        }

        const a = before("jsx", rt, hookVoiceControl);
        const b = before("jsxs", rt, hookVoiceControl);
        return () => {
          a();
          b();
        };
      });

      safe(() => before("createElement", React, hookVoiceControl));
    },
    onUnload() {
      try {
        removeAssetOverride("MicOffIcon");
      } catch (_) {}

      unpatches.forEach((u) => {
        try {
          u();
        } catch (_) {}
      });
    },
  };
})();
