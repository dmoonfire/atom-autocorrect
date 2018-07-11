# Plugins

Like `spell-check` and `autocomplete`, `autocorrect` is written around plugins that provide the actual corrections. This allows for users to only choose the corrections they are looking for and avoid the overhead of unneeded tasks. In many ways, this is more important because autocorrections are done in real time (when the user pauses) and have more restrictions to avoid locking up the UI.

## Examples

This is the current list of known plugins for `autocorrect`:

* [autocorrect-en](https://github.com/dmoonfire/atom-autocorrect-en): Handles a few common English typos. Written in Typescript.

## Services

A package can signal that it is able to handle automatic corrections by providing the `autocorrect-word` service. If installed, `autocorrect` will use it to provide corrections.

    "providedServices": {
      "autocorrect-word": {
        "versions": {
          "1.0.0": "methodName"
        }
      }
    }

The `methodName` is the name of a method on the implemented plugin. In TypeScript, this could be implemented as:

    import { EnglishWordCorrection } from "./EnglishWordCorrection";

    const EnglishWordCorrectionEntry = {
        plugin: new EnglishWordCorrection(),

        provideWordCorrection(): EnglishWordCorrection {
            return this.plugin;
        },
    };

    module.exports = EnglishWordCorrectionEntry;

In Coffee, it would look like:

    module.exports =
      instance: null

      activate: (@state) ->

      provideWordCorrection: ->
        @plugin

## Plugin Signature

In the above examples, `this.plugin` and `@plugin` would be an instance of the class with the following [interface](../src/WordCorrection.ts):

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
         * @param {ChangeableWord} change: The word that could be corrected.
         */
        correctWord(buffer: AtomCore.Ieditor, change: ChangeableWord): void;
    }

The `correctWord` function will be called for every word as the user has finished changing or typing it. This is a time-critical function since it can block the UI, make sure the execution is as short as possible.

`ChangeableWord` is an instance that allows for the word to be replaced. If there is no change, then the implementing plugin should ignore it.

    export class ChangeableWord {
        public word: string;
        public originalWord: string;
        public changed: boolean = false;
        public range: TextBuffer.Irange;

        /**
         * Replaces the current word with a new one. It only marks this as changed
         * if there was a difference.
         */
        public replace(newWord: string): void;

        /**
         * Performs a replacement on the current word and replaces it if there is
         * a change.
         */
        public replaceRegexp(regexp: RegExp, replacement: any): void;
    }

Changing the word using `replace` will cause that word to be substituted.
