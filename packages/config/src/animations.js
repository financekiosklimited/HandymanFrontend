System.register(["@tamagui/animations-react-native"], function (exports_1, context_1) {
    "use strict";
    var animations_react_native_1, animations;
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [
            function (animations_react_native_1_1) {
                animations_react_native_1 = animations_react_native_1_1;
            }
        ],
        execute: function () {
            exports_1("animations", animations = animations_react_native_1.createAnimations({
                '100ms': {
                    type: 'timing',
                    duration: 100,
                },
                bouncy: {
                    damping: 9,
                    mass: 0.9,
                    stiffness: 150,
                },
                lazy: {
                    damping: 18,
                    stiffness: 50,
                },
                medium: {
                    damping: 15,
                    stiffness: 120,
                    mass: 1,
                },
                slow: {
                    damping: 15,
                    stiffness: 40,
                },
                quick: {
                    damping: 20,
                    mass: 1.2,
                    stiffness: 250,
                },
                tooltip: {
                    damping: 10,
                    mass: 0.9,
                    stiffness: 100,
                },
                // Micro-interactions - instant feedback for buttons/cards
                micro: {
                    type: 'timing',
                    duration: 100,
                },
                // Press feedback - spring animation for tactile feel
                press: {
                    damping: 20,
                    mass: 0.5,
                    stiffness: 300,
                },
            }));
        }
    };
});
