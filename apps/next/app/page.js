System.register(['app/features/guest/home/screen'], (exports_1, context_1) => {
  'use client'
  let screen_1
  const __moduleName = context_1 && context_1.id
  return {
    setters: [
      (screen_1_1) => {
        screen_1 = screen_1_1
      },
    ],
    execute: () => {
      exports_1('default', screen_1.GuestHomeScreen)
    },
  }
})
