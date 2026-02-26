System.register(
  [
    './common',
    './auth',
    './guest',
    './homeowner',
    './handyman',
    './chat',
    './attachment',
    './direct-offer',
  ],
  (exports_1, context_1) => {
    var __moduleName = context_1 && context_1.id
    function exportStar_1(m) {
      var exports = {}
      for (var n in m) {
        if (n !== 'default') exports[n] = m[n]
      }
      exports_1(exports)
    }
    return {
      setters: [
        (common_1_1) => {
          exportStar_1(common_1_1)
        },
        (auth_1_1) => {
          exportStar_1(auth_1_1)
        },
        (guest_1_1) => {
          exportStar_1(guest_1_1)
        },
        (homeowner_1_1) => {
          exportStar_1(homeowner_1_1)
        },
        (handyman_1_1) => {
          exportStar_1(handyman_1_1)
        },
        (chat_1_1) => {
          exportStar_1(chat_1_1)
        },
        (attachment_1_1) => {
          exportStar_1(attachment_1_1)
        },
        (direct_offer_1_1) => {
          exportStar_1(direct_offer_1_1)
        },
      ],
      execute: () => {},
    }
  }
)
