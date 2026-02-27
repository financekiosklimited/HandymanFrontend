System.register(['./tamagui.config', './tokens', './statusColors'], (exports_1, context_1) => {
  const __moduleName = context_1 && context_1.id
  function exportStar_1(m) {
    const exports = {}
    for (const n in m) {
      if (n !== 'default') exports[n] = m[n]
    }
    exports_1(exports)
  }
  return {
    setters: [
      (tamagui_config_1_1) => {
        exportStar_1(tamagui_config_1_1)
      },
      (tokens_1_1) => {
        exportStar_1(tokens_1_1)
      },
      (statusColors_1_1) => {
        exportStar_1(statusColors_1_1)
      },
    ],
    execute: () => {},
  }
})
