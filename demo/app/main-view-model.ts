import { Observable } from "data/observable";
import { Nfc, NfcTagData, NfcNdefData } from "nativescript-nfc";

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
      console.log("Tag discovered! " + data.id);
      that.set("lastTagDiscovered", data.id);
    }).then(() => {
      console.log("OnTagDiscovered Listener set");
    }, (err) => {
      alert(err);
    });
  }

  public doStopTagListener() {
    this.nfc.setOnTagDiscoveredListener(null).then(() => {
      console.log("OnTagDiscovered nulled");
    }, (err) => {
      alert(err);
    });
  }

  public doStartNdefListener() {
    let that = this;
    this.nfc.setOnNdefDiscoveredListener((data: NfcNdefData) => {
      // data.message is an array of records, so:
      if (data.message) {
        for (let m in data.message) {
          let record = data.message[m];
          console.log("Ndef discovered! Message record: " + record.payloadAsString);
          that.set("lastNdefDiscovered", record.payloadAsString);
        }
      }
    }).then(() => {
      console.log("OnNdefDiscoveredListener set");
    }, (err) => {
      alert(err);
    });
  }

  public doStopNdefListener() {
    this.nfc.setOnNdefDiscoveredListener(null).then(() => {
      console.log("OnNdefDiscoveredListener nulled");
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
      console.log("Wrote text 'Hello!'");
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
      console.log("Wrote uri 'https://www.telerik.com");
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