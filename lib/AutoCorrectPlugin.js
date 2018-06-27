"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Atom = require("atom");
const AutoCorrectView_1 = require("./AutoCorrectView");
class AutoCorrectPlugin {
    constructor() {
        this.wordCorrections = [];
        this.editorViews = new WeakMap();
        this.views = [];
        this.subscriptions = new Atom.CompositeDisposable();
    }
    activate(state) {
        // Events subscribe in atom's system can easily be cleaned up with a
        // CompositeDisposable on the deactivate.
        this.subscriptions = new Atom.CompositeDisposable();
        // Register the commands for this plugin. These are described in the
        // keybindings.
        this.subscriptions.add(atom.commands.add("atom-workspace", {
            "autocorrect:toggle": () => this.toggle(),
        }));
        // We also need to register listeners for new buffers so we can activate
        // when the user opens a new window.
        this.subscriptions.add(atom.workspace.observeTextEditors((editor) => { this.attachEditor(editor); }));
    }
    deactivate() {
        for (const view of this.views) {
            view.destroy();
        }
        this.subscriptions.dispose();
        this.editorViews = new WeakMap();
        this.views = [];
    }
    getEditorView(editor) {
        return this.editorViews.get(editor);
    }
    registerWordCorrection(wordCorrection) {
        this.wordCorrections.push(wordCorrection);
    }
    attachEditor(editor) {
        const view = new AutoCorrectView_1.AutoCorrectView(this, editor);
        this.editorViews.set(editor, view);
        this.views.push(view);
    }
    toggle() {
        // Get the editor for the current buffer. If we can't find one, there
        // is nothing to do.
        const editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
            return;
        }
        // Get the view for the editor.
        const view = this.editorViews.get(editor);
        if (!view) {
            return;
        }
        // Have the view toggle itself.
        view.toggle();
    }
}
exports.AutoCorrectPlugin = AutoCorrectPlugin;
//# sourceMappingURL=AutoCorrectPlugin.js.map