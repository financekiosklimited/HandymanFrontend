System.register(["./useCities", "./useCategories", "./useHandymanCategories", "./chat"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function exportStar_1(m) {
        var exports = {};
        for (var n in m) {
            if (n !== "default") exports[n] = m[n];
        }
        exports_1(exports);
    }
    return {
        setters: [
            function (useCities_1_1) {
                exportStar_1(useCities_1_1);
            },
            function (useCategories_1_1) {
                exportStar_1(useCategories_1_1);
            },
            function (useHandymanCategories_1_1) {
                exportStar_1(useHandymanCategories_1_1);
            },
            function (chat_1_1) {
                exportStar_1(chat_1_1);
            }
        ],
        execute: function () {
        }
    };
});
