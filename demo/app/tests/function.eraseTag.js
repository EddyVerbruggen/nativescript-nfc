var nfc = new (require("nativescript-nfc").Nfc)();

describe("eraseTag", function() {
  it("exists", function() {
    expect(nfc.eraseTag).toBeDefined();
  });

	it("returns a promise", function() {
		expect(nfc.eraseTag()).toEqual(jasmine.any(Promise));
	});
});
