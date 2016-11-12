var nfc = new (require("nativescript-nfc").Nfc)();

describe("writeTag", function() {
  it("exists", function() {
    expect(nfc.writeTag).toBeDefined();
  });

	it("returns a promise", function() {
		expect(nfc.writeTag()).toEqual(jasmine.any(Promise));
	});
});
