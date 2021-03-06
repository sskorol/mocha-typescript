import { assert } from "chai";
import { only, skip, skipOnError, slow, suite, test, timeout, trait } from "../../../index";

declare var describe;
declare var it;

suite("vanila tdd suite", () => {
    test("vanila test", () => {});
    test("vanila failing test", () => { throw new Error("x"); });
    test("vanila asinc", (done) => setTimeout(done, 5));
    test("Vanila promise", () => new Promise((resolve, reject) => setTimeout(resolve, 5)));
    test.pending("pending", () => {});
    test.skip("skipped", () => {});
});

describe("vanila bdd suite", () => {
    it("vanila test", () => {});
    it("vanila failing test", () => { throw new Error("x"); });
    it("vanila asinc", (done) => setTimeout(done, 5));
    it("Vanila promise", () => new Promise((resolve, reject) => setTimeout(resolve, 5)));
    it.skip("skipped", () => {});
});

@suite class Simple {
    @test public test() {}
}

@suite(timeout(10))
class Timeouts {
    @test public pass1(done) {
        setTimeout(done, 1);
    }
    @test public pass2(done) {
        setTimeout(done, 20);
    }
    @test public pass3(done) {
        setTimeout(done, 1);
    }
}

@suite(trait((ctx) => ctx.timeout(10)))
class InlineTrait {
    @test public timeout(done) {}
}

@suite(skipOnError)
class StockSequence {
    @test public step1() {}
    @test public step2() { throw new Error("Failed"); }
    @test public step3() { /* should be skipped */ }
    @test public step4() { /* should be skipped */ }
}

declare var beforeEach;
declare var afterEach;

const customSkipOnError = trait(function(ctx, ctor) {
    beforeEach(function() {
        if (ctor.__skip_all) {
            this.skip();
        }
    });
    afterEach(function() {
        if (this.currentTest.state === "failed") {
            ctor.__skip_all = true;
        }
    });
});

@suite(customSkipOnError)
class CustomSequence {
    @test public step1() {}
    @test public step2() { throw new Error("Failed"); }
    @test public step3() { /* should be skipped */ }
    @test public step4() { /* should be skipped */ }
}

@suite("name and trait", customSkipOnError)
class CustomSequence2 {
    @test public step1() {}
    @test public step2() { throw new Error("Failed"); }
    @test public step3() { /* should be skipped */ }
}

@suite(slow(10))
class Slows {
    @test public pass1(done) {
        setTimeout(done, 1);
    }
    @test public pass2(done) {
        setTimeout(done, 20);
    }
    @test public pass3(done) {
        setTimeout(done, 1);
    }
}

@suite("mocha typescript")
class Basic {
    @test public "assert pass"() {
    }

    @test() public "assert pass 2"() {
    }

    @test public "test fail"() {
        throw new Error("Fail intentionally!");
    }

    @test() public "test fail 2"() {
        throw new Error("Fail intentionally!");
    }

    @test.skip public "test skip"() {
    }

    @test(timeout(5))
    public "test intentinally timeout"(done) {
        setTimeout(done, 10);
    }

    @test(timeout(20))
    public "test intentinall fail due error before timeout"(done) {
        setTimeout(() => done("Ooopsss..."), 5);
    }

    @test(timeout(100), slow(20))
    public "test won't timeout but will be redish slow"(done) {
        setTimeout(done, 30);
    }

    @test(timeout(100), slow(20))
    public "test won't timeout but will be yellowish slow"(done) {
        setTimeout(done, 15);
    }
}

@suite.skip
class Skipped1 {
    @test public test() {}
}

@suite.skip()
class Skipped2 {
    @test public test() {}
}

@suite.pending
class Pending1 {
    @test public pending() {}
}

@suite.pending()
class Pending2 {
    @test public pending() {}
}

@suite.pending(skipOnError)
class Pending3 {
    @test public pending() {}
}

@suite("custom suite name")
class Test {
    @test("custom test name") public test() {}
}

@suite class InstanceTests {
    public static calls = [];
    public static beforeInstance;
    public before() {
        InstanceTests.calls.push("before");
        assert.isTrue(this instanceof InstanceTests);
        InstanceTests.beforeInstance = this;
    }
    @test public test() {
        InstanceTests.calls.push("test");
        assert.isTrue(this instanceof InstanceTests);
        assert.equal(this, InstanceTests.beforeInstance);
    }
    public after() {
        InstanceTests.calls.push("after");
        assert.isTrue(this instanceof InstanceTests);
        assert.equal(this, InstanceTests.beforeInstance);
    }
    @test public testFailing() {
        InstanceTests.calls.push("testFailing");
        assert.isTrue(false);
    }
    @test public beforeAfterCalled() {
        assert.deepEqual(InstanceTests.calls, ["before", "test", "after", "before", "testFailing", "after", "before"]);
    }
}

function task(): Promise<void> {
    return new Promise<void>((resolve) => setTimeout(resolve, 1));
}

@suite class AsyncInstanceTests {
    public static calls = [];
    public static beforeInstance;
    public async before() {
        AsyncInstanceTests.calls.push("before");
        assert.isTrue(this instanceof AsyncInstanceTests);
        AsyncInstanceTests.beforeInstance = this;
        await task();
    }
    @test public async test() {
        AsyncInstanceTests.calls.push("test");
        assert.isTrue(this instanceof AsyncInstanceTests);
        assert.equal(this, AsyncInstanceTests.beforeInstance);
    }
    public async after() {
        await task();
        AsyncInstanceTests.calls.push("after");
        assert.isTrue(this instanceof AsyncInstanceTests);
        assert.equal(this, AsyncInstanceTests.beforeInstance);
        await task();
    }
    @test public async testFailing() {
        AsyncInstanceTests.calls.push("testFailing");
        assert.isTrue(false);
        await task();
    }
    @test public async beforeAfterCalled() {
        assert.deepEqual(AsyncInstanceTests.calls, ["before", "test", "after", "before", "testFailing", "after", "before"]);
        await task();
    }
    public toString() {
        return "AsyncInstanceTests";
    }
}
