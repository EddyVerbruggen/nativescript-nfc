var nfc = new (require("nativescript-nfc").Nfc)();

describe("available", function() {
  it("exists", function() {
    expect(nfc.available).toBeDefined();
  });

	it("returns a promise", function() {
		expect(nfc.available()).toEqual(jasmine.any(Promise));
	});

	it("resolves its promise with a boolean", function(done) {
		nfc.available().then(function(avail) {
      expect(avail).toEqual(jasmine.any(Boolean));
      done();
    });
  });
});
