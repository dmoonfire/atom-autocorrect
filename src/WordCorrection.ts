import { ChangeableWord } from "./ChangeableWord";

/**
 * Describes the interface of an external plugin that provides autocorrection
 * for words.
 */
export interface WordCorrection {
    /**
     * Contains the unique identifier for this plugin.
     */
    id: string;

    /**
     * Determines if the word needs to be corrected by the plugin. If it has,
     * then it is assumed that change.replace() is called.
     *
     * @param {IEditor} buffer The buffer associated with the word being
     * changed.
     * @param
     */
    correctWord(buffer: AtomCore.IEditor, change: ChangeableWord): void;
}
