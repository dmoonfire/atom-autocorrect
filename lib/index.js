"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AutoCorrectPlugin_1 = require("./AutoCorrectPlugin");
const AutoCorrectEntry = {
    plugin: new AutoCorrectPlugin_1.AutoCorrectPlugin(),
    activate(state) {
        this.plugin.activate(state);
    },
    deactivate() {
        this.plugin.deactivate();
    },
    serialize() {
        return {};
    },
    registerWordCorrection(plugins) {
        // Normalize this into an array.
        if (!(plugins instanceof Array)) {
            plugins = [plugins];
        }
        // Go through the arrays and register them.
        for (const plugin of plugins) {
            this.plugin.registerWordCorrection(plugin);
        }
    },
};
module.exports = AutoCorrectEntry;
//# sourceMappingURL=index.js.map