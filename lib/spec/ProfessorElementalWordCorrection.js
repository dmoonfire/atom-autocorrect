"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Professor Elements is a steampunk-themed rapper who has quite a few enjoyable
 * songs. One of them, A Cup of Brown Joy, has a chorus of:
 *
 * Now, when I say "Earl Grey," you say "Yes, please!"
 *
 * Now, we want something simplier, so this is a correction that changes any
 * reference of "earl" into "gray", a same-length correction.
 */
class ProfessorElementalWordCorrection {
    constructor() {
        this.id = "professor-elemental";
    }
    correctWord(editor, change) {
        if (change.word === "earl") {
            change.replace("gray");
        }
        if (change.word === "Earl") {
            change.replace("Gray");
        }
    }
}
exports.ProfessorElementalWordCorrection = ProfessorElementalWordCorrection;
//# sourceMappingURL=ProfessorElementalWordCorrection.js.map