import { WordCorrection } from "../WordCorrection";
import { ChangeableWord } from "../ChangeableWord";

/**
 * Professor Elements is a steampunk-themed rapper who has quite a few enjoyable
 * songs. One of them, A Cup of Brown Joy, has a chorus of:
 *
 * Now, when I say "Earl Grey," you say "Yes, please!"
 *
 * Now, we want something simplier, so this is a correction that changes any
 * reference of "earl" into "gray", a same-length correction.
 */
export class ProfessorElementalWordCorrection implements WordCorrection {
    public id: string = "professor-elemental";

    public correctWord(editor: AtomCore.IEditor, change: ChangeableWord): void {
        if (change.word === "earl") {
            change.replace("gray");
        }

        if (change.word === "Earl") {
            change.replace("Gray");
        }
    }
}
