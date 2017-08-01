import { WordCorrection } from "./WordCorrection";

export interface AutoCorrectState {
    /**
     * A list of the currently loaded word correction plugins.
     */
    wordCorrections: WordCorrection[];
}
