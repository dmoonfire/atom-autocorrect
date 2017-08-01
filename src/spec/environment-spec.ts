import * as path from "path";
import * as autocorrect from "../index";
import * as jasmine from "jasmine-node";

describe(path.basename(__filename), () => {
    it("works", () => {
        expect(1).toEqual(1);
    });
});
