var nfc = new (require("nativescript-nfc").Nfc)();

describe("setOnTagDiscoveredListener", function() {
  it("exists", function() {
    expect(nfc.setOnTagDiscoveredListener).toBeDefined();
  });

	it("returns a promise", function() {
		expect(nfc.setOnTagDiscoveredListener()).toEqual(jasmine.any(Promise));
	});
});
