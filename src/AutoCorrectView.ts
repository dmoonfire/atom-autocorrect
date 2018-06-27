const Atom = require("atom");
const _ = require("underscore-plus");
import { AutoCorrectState } from "./AutoCorrectState";
import { ChangeableWord } from "./ChangeableWord";
import * as fakeAtom from "./fake-atom";

export class AutoCorrectView {
    /**
     * A diagnostic number to indicate how many buffer changes have been seen
     * by the view. This is used for knowing when operations have completed
     * in unit testing.
     */
    public changesSeen: number = 0;

    private checkRegexp = /([\n\s.\"])/;
    private state: AutoCorrectState;
    private editor: fakeAtom.IEditor;
    private enabled = true;

    /**
     * Contains the persistent subscriptions on the editor buffer.
     */
    private editorSubscriptions = new Atom.CompositeDisposable();

    /**
     * Contains the subscriptions for buffer events. These will only be
     * populated if we are listening to the buffer.
     */
    private bufferSubscriptions = new Atom.CompositeDisposable();

    constructor(state: AutoCorrectState, editor: fakeAtom.IEditor) {
        // Save the member variables for later.
        this.state = state;
        this.editor = editor;

        // Attach to the various events on the editor.
        this.editorSubscriptions.add(
            editor.onDidChangeGrammar(() => { this.subscribe(); }));
        this.editorSubscriptions.add(
            atom.config.onDidChange(
                "autocorrect.grammars",
                () => { this.subscribe(); }));

        // See if we need to register listeners for this editor based on the
        // grammar.
        this.subscribe();
    }

    /**
     * Gets the unique identifier for this view.
     */
    public get id() { return this.editor.id; }

    public destroy() {
        this.bufferSubscriptions.dispose();
        this.editorSubscriptions.dispose();
    }

    /**
     * Starts listening to various events if the editor represents a grammar
     * that the plugin operators on.
     */
    public subscribe(): void {
        // We default to unsubscribing the events. This handles when a grammar
        // changes from one we handle to one we don't.
        this.unsubscribe();

        // Figure out the current grammar of the editor. We also determine if
        // it is the list of grammars we are listening to.
        const grammar = this.editor.getGrammar().scopeName;
        const pluginGrammars = atom.config.get("autocorrect.grammars");
        const isAttachable = _.contains(
            pluginGrammars,
            grammar);

        // If we aren't attaching, then we don't care about the events.
        if (!isAttachable) {
            return;
        }

        // We are going to attach to the editor and listen to additional events.
        this.bufferSubscriptions.add(
            this.editor.onDidStopChanging(
                (args: fakeAtom.OnDidStopChangingArgs) => {
                    this.onBufferChange(args);
                }));
    }

    /**
     * Stops listening to any events or callbacks on the editor.
     */
    public unsubscribe(): void {
        this.bufferSubscriptions.dispose();
        this.bufferSubscriptions = new Atom.CompositeDisposable();
    }

    /**
     * Triggered when the buffer changes. This is what looks for the text
     * changed and determines if we need to look for autocorrections.
     */
    private onBufferChange(args: fakeAtom.OnDidStopChangingArgs): void {
        // We can have multiple ranges if the user has multiple insert points,
        // such as using alt-shift to insert across multiple lines. We need to
        // deal with each one.
        this.changesSeen++;

        for (const change of args.changes) {
            this.processChange(change);
        }
    }

    private processChange(change: fakeAtom.TextChange): void {
        // If we are not enabled, then don't do anything.
        if (!this.enabled)
        {
            return;
        }

        // We only care if we see a character that indicates autocomplete
        // should be checked. In most cases, this is a whitespace or
        // terminating punctuation (e.g., not ones used in contractions).
        // We only have to check newText because we don't care if someone
        // deletes to a check point, only added.
        if (!change.newText.match(this.checkRegexp)) {
            return;
        }

        // We want to find the full word before each of the triggers.
        // These words may be outside of the new range, such as someone
        // hitting a space 300 ms after typing "teh", so we have to track
        // back through the buffer to find each one. Also, the user may have
        // written the entire word as part of the delayed change, such as
        // "and teh there was" which means we want to break it into three
        // words ("and", "teh", "there"). "was" wouldn't be processed since
        // it didn't end with a trigger. If there was something ahead of
        // "and", then that should also include with the first word.
        let wordChanges = this.getWordChanges(change.newRange);

        // HACK: Occasionally, we get undefined words from the changes. Strip
        // these out until we can figure out the reason.
        wordChanges = wordChanges.filter((wc) => { return !!wc.word; });

        // Go through each of the word changes and see if there are corrections
        // for them registered with the plugin. Since these are ordered, the
        // later ones may operate on changes from a previous once, such as one
        // handling double capital letters ("TEh") and then one fixing phrases
        // such as "teh" to "the".
        //
        // We also want to know if something changed because we have to do a lot
        // more work to actually handle the replacement.
        let hasChanged = false;

        for (const wordChange of wordChanges) {
            for (const correction of this.state.wordCorrections) {
                correction.correctWord(this.editor, wordChange);
                hasChanged = hasChanged || wordChange.changed;
            }
        }

        // If we don't have changes, there is nothing to do.
        if (!hasChanged) {
            return;
        }

        // If we have changes, we need to save the cursor and selection, replace
        // the changed words (while adjusting for the altered ranges), and then
        // restore the selection.
        this.replaceWords(wordChanges.filter((wc) => wc.changed));
    }

    private getWordChanges(range: TextBuffer.IRange): ChangeableWord[] {
        // Start by splitting the word into its obvious word segments. We have
        // a capture group in checkRegexp, so this will also return the
        // triggers as their own entry in the resulting array. There will
        // always be at least one before a trigger and one after.
        const text = this.editor.getTextInRange(range);
        const tokens = text.split(this.checkRegexp);

        // Since there is always one after, we can just get rid of that since
        // it will either be text which we don't process because it didn't end
        // in a trigger or it is blank and we don't care.
        tokens.splice(tokens.length - 1, 1);

        // The first one needs to be extended back until we get to a line
        // trigger. If we are at the start of the range, we don't need to
        // do this.
        const buffer = this.editor.buffer;
        let characterIndex = buffer.characterIndexForPosition(range.start);

        if (range.start.column > 0) {
            // Get the text before the starting point.
            const leadingRange = {
                end: { column: range.start.column, row: range.start.row },
                start: { column: 0, row: range.start.row },
            } as TextBuffer.IRange;
            let leadingText = this.editor.getTextInRange(leadingRange);

            // Look for a trigger. If we don't find one, add the entire line.
            // Otherwise, just add the leading text.
            const leadingIndex = lastIndexOf(leadingText, this.checkRegexp);

            if (leadingIndex >= 0) {
                leadingText = leadingText.substring(leadingIndex + 1);
            }

            // Shift the start column back by the length of the text.
            characterIndex -= leadingText.length;
            tokens[0] = leadingText + tokens[0];
        }

        // At this point, we have an array with at least two items. The leading
        // is the text before the trigger, then a trigger, then either more
        // text or triggers.
        //
        // While we go through this, we also need to build up ranegs for each
        // of the words as we go. We do this by converting the starting
        // position to a character index, then add each element as we go.
        let lastWasTrigger = false;
        let lastWordRange: TextBuffer.IRange = tokens;
        const changes: ChangeableWord[] = [];

        for (let rangeIndex = 0; rangeIndex < tokens.length; rangeIndex++) {
            // We have to advance the character index.
            const startCharacterIndex = characterIndex;
            const rangeText = tokens[rangeIndex];

            characterIndex += rangeText.length;

            // See if we are a trigger. If we aren't, then we don't need to
            // worry about processing (yet). We do this so if we have two
            // triggers in a row, then we can easily skip it.
            if (!rangeText.match(this.checkRegexp)) {
                // Keep track of our last state for the trigger element.
                lastWasTrigger = false;
                lastWordRange = {
                    end: buffer
                        .positionForCharacterIndex(characterIndex),
                    start: buffer
                        .positionForCharacterIndex(startCharacterIndex),
                } as TextBuffer.IRange;

                // Update our pointers and move on.
                continue;
            }

            // If we are preceeding a trigger, then we don't have to do
            // anything.
            if (lastWasTrigger) {
                continue;
            }

            lastWasTrigger = true;

            // Get the previous word, that's what we care about, and wrap it
            // in the appropriate object.
            const word = tokens[rangeIndex - 1];
            const wordChange = new ChangeableWord(word, lastWordRange);

            changes.push(wordChange);
        }

        // Return the gathered changes.
        return changes;
    }

    /**
     * Goes through the changeable words and replaces each one in the buffer
     * in rapid succession. This ensures everything will be in a single
     * update when we see onDidStopChanging again.
     */
    private replaceWords(changes: ChangeableWord[]): void {
        const editor = this.editor;
        const buffer = editor.buffer;

        for (const change of changes) {
            buffer.setTextInRange(change.range, change.word);
        }
    }

    /**
     * Alternates the enabled state for the current view.
     */
    public toggle(): void
    {
        this.enabled = !this.enabled;
    }
}

function lastIndexOf(input: string, search: RegExp): number {
    for (let i = input.length; i > 0; i--) {
        if (input.substring(i).match(search)) {
            return i;
        }
    }

    return -1;
}
