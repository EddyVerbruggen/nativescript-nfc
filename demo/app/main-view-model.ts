import {Observable} from "data/observable";
import {Nfc, NfcTagData, NfcNdefData} from "nativescript-nfc";

export class HelloWorldModel extends Observable {
  public message: string;
  private nfc: Nfc;

  constructor() {
    super();
    this.nfc = new Nfc();
  }

  public doCheckAvailable() {
    this.nfc.available().then((avail) => {
      console.log("Available? " + avail);
      alert(avail);
    }, (err) => {
      alert(err);
    });
  }

  public doCheckEnabled() {
    this.nfc.enabled().then((on) => {
      console.log("Enabled? " + on);
      alert(on);
    }, (err) => {
      alert(err);
    });
  }

  public doStartTagListener() {
    let that = this;
    this.nfc.setOnTagDiscoveredListener((data: NfcTagData) => {
      that.set("lastTagDiscovered", data.id);
    }).then(() => {
      console.log("Listener set");
    }, (err) => {
      alert(err);
    });
  }

  public doStopTagListener() {
    this.nfc.setOnTagDiscoveredListener(null).then(() => {
      console.log("Listener nulled");
    }, (err) => {
      alert(err);
    });
  }

  public doStartNdefListener() {
    let that = this;
    this.nfc.setOnNdefDiscoveredListener((data: NfcNdefData) => {
      that.set("lastNdefDiscovered", data.message);
    }).then(() => {
      console.log("Listener set");
    }, (err) => {
      alert(err);
    });
  }

  public doStopNdefListener() {
    this.nfc.setOnNdefDiscoveredListener(null).then(() => {
      console.log("Listener nulled");
    }, (err) => {
      alert(err);
    });
  }

  public doWriteText() {
    this.nfc.writeTag({
      textRecords: [
        {
          id: [1],
          text: "Hello!"
        }
      ]
    }).then(() => {
      console.log("Wrote Hello");
    }, (err) => {
      alert(err);
    });
  }

  public doWriteUri() {
    this.nfc.writeTag({
      uriRecords: [
        {
          id: [2, 5],
          uri: "https://www.telerik.com"
        }
      ]
    }).then(() => {
      console.log("Wrote Goodbye");
    }, (err) => {
      alert(err);
    });
  }

  public doEraseTag() {
    this.nfc.eraseTag().then(() => {
      console.log("Tag erased");
    }, (err) => {
      alert(err);
    });
  }
}