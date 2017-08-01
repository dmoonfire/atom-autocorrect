"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents a single word inside the buffer that has been changed. This
 * includes also the location information for replacement.
 */
class ChangeableWord {
    constructor(word, range) {
        this.changed = false;
        this.word = word;
        this.originalWord = word;
        this.range = range;
    }
    /**
     * Replaces the current word with a new one. It only marks this as changed
     * if there was a difference.
     */
    replace(newWord) {
        if (this.word !== newWord) {
            this.word = newWord;
            this.changed = true;
        }
    }
    /**
     * Performs a replacement on the current word and replaces it if there is
     * a change.
     */
    replaceRegexp(regexp, replacement) {
        this.replace(this.word.replace(regexp, replacement));
    }
}
exports.ChangeableWord = ChangeableWord;
//# sourceMappingURL=ChangeableWord.js.map