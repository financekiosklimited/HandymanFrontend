System.register(["./useJobs", "./useHandymen", "./useReimbursementCategories"], function (exports_1, context_1) {
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
            function (useJobs_1_1) {
                exportStar_1(useJobs_1_1);
            },
            function (useHandymen_1_1) {
                exportStar_1(useHandymen_1_1);
            },
            function (useReimbursementCategories_1_1) {
                exportStar_1(useReimbursementCategories_1_1);
            }
        ],
        execute: function () {
        }
    };
});
