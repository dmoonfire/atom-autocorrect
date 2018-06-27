const Atom = require("atom");
import { AutoCorrectState } from "./AutoCorrectState";
import { AutoCorrectView } from "./AutoCorrectView";
import { IEditor } from "./fake-atom";
import { WordCorrection } from "./WordCorrection";

export class AutoCorrectPlugin implements AutoCorrectState {
    public wordCorrections: WordCorrection[] = [];
    private editorViews = new WeakMap<AtomCore.IEditor, AutoCorrectView>();
    private views: AutoCorrectView[] = [];
    private subscriptions = new Atom.CompositeDisposable();

    public activate(state: any) {
        // Events subscribe in atom's system can easily be cleaned up with a
        // CompositeDisposable on the deactivate.
        this.subscriptions = new Atom.CompositeDisposable();

        // Register the commands for this plugin. These are described in the
        // keybindings.
        this.subscriptions.add(
            atom.commands.add(
                "atom-workspace",
                {
                    "autocorrect:toggle": () => this.toggle(),
                }));

        // We also need to register listeners for new buffers so we can activate
        // when the user opens a new window.
        this.subscriptions.add(
            atom.workspace.observeTextEditors(
                (editor: IEditor) => { this.attachEditor(editor); }));
    }

    public deactivate() {
        for (const view of this.views) {
            view.destroy();
        }

        this.subscriptions.dispose();
        this.editorViews = new WeakMap<AtomCore.IEditor, AutoCorrectView>();
        this.views = [];
    }

    public getEditorView(editor: IEditor): AutoCorrectView {
        return this.editorViews.get(editor) as AutoCorrectView;
    }

    public registerWordCorrection(wordCorrection: WordCorrection): void {
        this.wordCorrections.push(wordCorrection);
    }

    private attachEditor(editor: IEditor) {
        const view = new AutoCorrectView(this, editor);
        this.editorViews.set(editor, view);
        this.views.push(view);
    }

    private toggle() {
        // Get the editor for the current buffer. If we can't find one, there
        // is nothing to do.
        const editor = atom.workspace.getActiveTextEditor();

        if (!editor)
        {
            return;
        }

        // Get the view for the editor.
        const view = this.editorViews.get(editor);

        if (!view)
        {
            return;
        }

        // Have the view toggle itself.
        view.toggle();
    }
}
