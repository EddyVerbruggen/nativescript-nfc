import {Observable} from "data/observable";
import {Nfc} from "nativescript-nfc";

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

  public doStartListening() {
    this.set("lastNfcTagRead", "Testing123");
    // TODO pass in callback function
    this.nfc.startListening().then(() => {
      console.log("Started listening for Nfc tags");
    }, (err) => {
      alert(err);
    });
  }

  public doStopListening() {
    this.nfc.stopListening().then(() => {
      console.log("Stopped listening for Nfc tags");
    }, (err) => {
      alert(err);
    });
  }

  public doWriteHello() {
    this.nfc.writeTag({
      textRecords: [
        {
          id: [1],
          text: "Hello"
        }
      ]
    }).then(() => {
      console.log("Wrote Hello");
    }, (err) => {
      alert(err);
    });
  }

  public doWriteGoodbye() {
    this.nfc.writeTag({
      textRecords: [
        {
          id: [2],
          text: "Goodbye"
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