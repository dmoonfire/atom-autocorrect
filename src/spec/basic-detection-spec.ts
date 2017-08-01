import * as path from "path";
import * as autocorrect from "../index";
import { AutoCorrectPlugin } from "../AutoCorrectPlugin";
import { AutoCorrectView } from "../AutoCorrectView";

describe(path.basename(__filename), () => {
    let workspaceElement: any;
    let editor: any;
    let editorElement: any;
    let plugin: AutoCorrectPlugin;
    let view: AutoCorrectView;

    beforeEach(() => {
        workspaceElement = atom.views.getView(atom.workspace)

        runs(() => {
            atom.config.set("autocorrect.grammars", ["text.plain"]);
        });

        waitsForPromise(() => {
            return atom.packages.activatePackage('language-text');
        });

        waitsForPromise(() => {
            return atom.workspace.open("test.txt");
        });

        waitsForPromise(() => {
            return atom.packages.activatePackage("autocorrect")
                .then((module) => { plugin = module.mainModule.plugin; });
        });

        runs(() => {
          jasmine.attachToDOM(workspaceElement);
          editor = atom.workspace.getActiveTextEditor();
          view = plugin.getEditorView(editor);
          editorElement = atom.views.getView(editor);
        });
    });

    it("sees a single buffer change", () => {
        editor.setText("earl");
        advanceClock(editor.getBuffer().getStoppedChangingDelay());

        runs(() => {
            expect(view.changesSeen).toEqual(1);
        });
    });

    it("sees two changes after each other", () => {
        editor.setText("earl");
        advanceClock(editor.getBuffer().getStoppedChangingDelay());
        editor.insertText(" ");
        advanceClock(editor.getBuffer().getStoppedChangingDelay());

        runs(() => {
            expect(editor.getText()).toEqual("earl ");
            expect(view.changesSeen).toEqual(2);
        });
    });
});
