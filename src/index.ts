import { AutoCorrectPlugin } from "./AutoCorrectPlugin";
import { AutoCorrectState } from "./AutoCorrectState";
import { WordCorrection } from "./WordCorrection";

const AutoCorrectEntry = {
    plugin: new AutoCorrectPlugin(),

    activate(state: any) {
        this.plugin.activate(state);
    },

    deactivate() {
        this.plugin.deactivate();
    },

    serialize(): any {
        return {};
    },

    registerWordCorrection(plugins: WordCorrection | WordCorrection[]) {
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
