System.register(["./client", "./store/auth", "./types", "./hooks", "./errors", "./utils"], function (exports_1, context_1) {
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
            function (client_1_1) {
                exportStar_1(client_1_1);
            },
            function (auth_1_1) {
                exportStar_1(auth_1_1);
            },
            function (types_1_1) {
                exportStar_1(types_1_1);
            },
            function (hooks_1_1) {
                exportStar_1(hooks_1_1);
            },
            function (errors_1_1) {
                exportStar_1(errors_1_1);
            },
            function (utils_1_1) {
                exportStar_1(utils_1_1);
            }
        ],
        execute: function () {
        }
    };
});
