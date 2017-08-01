/**
 * Represents a single word inside the buffer that has been changed. This
 * includes also the location information for replacement.
 */
export class ChangeableWord {
    public word: string;
    public originalWord: string;
    public changed: boolean = false;
    public range: TextBuffer.IRange;

    constructor(word: string, range: TextBuffer.IRange) {
        this.word = word;
        this.originalWord = word;
        this.range = range;
    }

    /**
     * Replaces the current word with a new one. It only marks this as changed
     * if there was a difference.
     */
    public replace(newWord: string): void {
        if (this.word !== newWord) {
            this.word = newWord;
            this.changed = true;
        }
    }

    /**
     * Performs a replacement on the current word and replaces it if there is
     * a change.
     */
    public replaceRegexp(regexp: RegExp, replacement: any): void {
        this.replace(this.word.replace(regexp, replacement));
    }
}
