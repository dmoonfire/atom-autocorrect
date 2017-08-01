"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const ProfessorElementalWordCorrection_1 = require("./ProfessorElementalWordCorrection");
describe(path.basename(__filename), () => {
    let workspaceElement;
    let editor;
    let editorElement;
    let plugin;
    let view;
    beforeEach(() => {
        workspaceElement = atom.views.getView(atom.workspace);
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
    it("earl", () => {
        // Register the corrections we'll be using.
        plugin.registerWordCorrection(new ProfessorElementalWordCorrection_1.ProfessorElementalWordCorrection());
        // Have the user type something in.
        editor.setText("earl ");
        advanceClock(editor.getBuffer().getStoppedChangingDelay());
        // Wait for the changes that the autocorrection made to finish.
        advanceClock(editor.getBuffer().getStoppedChangingDelay());
        advanceClock(editor.getBuffer().getStoppedChangingDelay());
        // Verify the state of the buffer once we're finish.
        runs(() => {
            expect(editor.getText()).toEqual("gray ");
            expect(editor.getCursorBufferPositions())
                .toEqual([{ column: 5, row: 0 }]);
            expect(editor.getSelectedBufferRanges())
                .toEqual([{
                    end: { column: 5, row: 0 },
                    start: { column: 5, row: 0 }
                }]);
        });
        // Verify the state of the plugin once we're finished.
        runs(() => {
            expect(view.changesSeen).toEqual(2);
        });
    });
    it("earl |earl ", () => {
        // Register the corrections we'll be using.
        plugin.registerWordCorrection(new ProfessorElementalWordCorrection_1.ProfessorElementalWordCorrection());
        // Have the user type something in.
        editor.setText("earl ");
        advanceClock(editor.getBuffer().getStoppedChangingDelay());
        editor.insertText("earl ");
        advanceClock(editor.getBuffer().getStoppedChangingDelay());
        // Wait for the changes that the autocorrection made to finish.
        advanceClock(editor.getBuffer().getStoppedChangingDelay());
        advanceClock(editor.getBuffer().getStoppedChangingDelay());
        // Verify the state of the buffer once we're finish.
        runs(() => {
            expect(editor.getText()).toEqual("gray gray ");
            expect(editor.getCursorBufferPositions())
                .toEqual([{ column: 10, row: 0 }]);
            expect(editor.getSelectedBufferRanges())
                .toEqual([{
                    end: { column: 10, row: 0 },
                    start: { column: 10, row: 0 }
                }]);
        });
        // Verify the state of the plugin once we're finished.
        runs(() => {
            expect(view.changesSeen).toEqual(3);
        });
    });
    it("when I say earl", () => {
        // Register the corrections we'll be using.
        plugin.registerWordCorrection(new ProfessorElementalWordCorrection_1.ProfessorElementalWordCorrection());
        // Have the user type something in.
        editor.setText("when I say earl ");
        advanceClock(editor.getBuffer().getStoppedChangingDelay());
        // Wait for the changes that the autocorrection made to finish.
        advanceClock(editor.getBuffer().getStoppedChangingDelay());
        advanceClock(editor.getBuffer().getStoppedChangingDelay());
        // Verify the state of the buffer once we're finish.
        runs(() => {
            expect(editor.getText()).toEqual("when I say gray ");
            expect(editor.getCursorBufferPositions())
                .toEqual([{ column: 16, row: 0 }]);
            expect(editor.getSelectedBufferRanges())
                .toEqual([{
                    end: { column: 16, row: 0 },
                    start: { column: 16, row: 0 }
                }]);
        });
        // Verify the state of the plugin once we're finished.
        runs(() => {
            expect(view.changesSeen).toEqual(2);
        });
    });
});
//# sourceMappingURL=basic-replacement-spec.js.map