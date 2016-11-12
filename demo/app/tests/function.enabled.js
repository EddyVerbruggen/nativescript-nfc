var nfc = new (require("nativescript-nfc").Nfc)();

describe("enabled", function() {
  it("exists", function() {
    expect(nfc.enabled).toBeDefined();
  });

	it("returns a promise", function() {
		expect(nfc.enabled()).toEqual(jasmine.any(Promise));
	});

	it("resolves its promise with a boolean", function(done) {
		nfc.enabled().then(function(on) {
      expect(on).toEqual(jasmine.any(Boolean));
      done();
    });
  });
});
