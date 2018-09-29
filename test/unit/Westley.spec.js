const Westley = require("../../source/node/Westley.js");
const uuid = require("uuid/v4");

describe("Westley", function() {
    beforeEach(function() {
        this.westley = new Westley();
    });

    describe("clear", function() {
        it("clears the necessary properties", function() {
            Object.assign(this.westley, {
                _dataset: { test: 1 },
                _history: [1]
            });
            this.westley.clear();
            expect(this.westley.getDataset()).to.deep.equal({});
            expect(this.westley.getHistory()).to.deep.equal([]);
        });
    });

    describe("execute", function() {
        it("executes commands", function() {
            const id = uuid();
            this.westley.execute(`cgr 0 ${id}`);
            expect(this.westley.getDataset().groups.find(group => group.id === id)).to.be.an("object");
        });

        it("marks the instance as dirty", function() {
            expect(this.westley.isDirty).to.be.false;
            this.westley.execute(`cgr 0 ${uuid()}`);
            expect(this.westley.isDirty).to.be.true;
        });
    });
});
