System.register(['./time'], (exports_1, context_1) => {
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
      (time_1_1) => {
        exportStar_1(time_1_1)
      },
    ],
    execute: () => {},
  }
})
