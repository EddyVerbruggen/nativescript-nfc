var nfc = new (require("nativescript-nfc").Nfc)();

describe("setOnNdefDiscoveredListener", function() {
  it("exists", function() {
    expect(nfc.setOnNdefDiscoveredListener).toBeDefined();
  });

  it("returns a promise", function() {
    expect(nfc.setOnNdefDiscoveredListener()).toEqual(jasmine.any(Promise));
  });
});
