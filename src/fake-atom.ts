/**
 * The interfaces in this module are ones coming out of Atom that don't
 * appear to be defined in the typings file. These should be merged into Atom's
 * once I can figure out where they are.
 */
import * as Atom from "atom";
import * as TextBuffer from "text-buffer";

/**
 * Adds in the additional signatures that IEditor appears to have but the types
 * does not.
 */
export interface IEditor extends AtomCore.IEditor {
    onDidChangeGrammar(args: any): void;
}

/**
 * Signature to describe the onDidStopChanging callback.
 */
type OnDidStopChangingCallback = (args: OnDidStopChangingArgs) => void;

/**
 * Arguments given for the IEditor.onDidStopChanging callback.
 */
export interface OnDidStopChangingArgs {
    changes: TextChange[];
}

/**
 * Represents a single text change.
 */
export interface TextChange {
    newRange: TextBuffer.IRange;
    newText: string;
    oldRange: TextBuffer.IRange;
    oldText: string;
}
