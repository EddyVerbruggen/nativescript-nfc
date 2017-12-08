import * as observable from "tns-core-modules/data/observable";
import { alert } from "tns-core-modules/ui/dialogs";
import { Nfc, NfcTagData, NfcNdefData } from "nativescript-nfc";

export class HelloWorldModel extends observable.Observable {
  public lastNdefDiscovered: string = "Press a button...";
  private nfc: Nfc;

  constructor() {
    super();
    this.nfc = new Nfc();
  }

  public doCheckAvailable() {
    this.nfc.available().then((avail) => {
      console.log("Available? " + avail);
      alert("" + avail);
    }, (err) => {
      alert(err);
    });
  }

  public doCheckEnabled() {
    this.nfc.enabled().then((on) => {
      console.log("Enabled? " + on);
      alert("" + on);
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
      console.log(err);
    });
  }

  public doStopTagListener() {
    this.nfc.setOnTagDiscoveredListener(null).then(() => {
      console.log("OnTagDiscovered nulled");
    }, (err) => {
      console.log(err);
    });
  }

  public doStartNdefListener() {
    this.nfc.setOnNdefDiscoveredListener((data: NfcNdefData) => {
      if (data.message) {
        let tagMessages = [];
        // data.message is an array of records, so:
        data.message.forEach(record => {
          console.log("Read record: " + JSON.stringify(record));
          tagMessages.push(record.payloadAsString);
        });
        this.set("lastNdefDiscovered", "Read: " + tagMessages.join(", "));
      }
    }, {
      stopAfterFirstRead: true,
      scanHint: "Scan a tag, baby!"
    })
        .then(() => this.set("lastNdefDiscovered", "Listening..."))
        .catch(err => alert(err));
  }

  public doStopNdefListener() {
    this.nfc.setOnNdefDiscoveredListener(null).then(() => {
      this.set("lastNdefDiscovered", "Stopped listening.");
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
      this.set("lastNdefDiscovered", "Wrote text 'Hello!'");
    }, (err) => {
      console.log(err);
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
      this.set("lastNdefDiscovered", "Wrote uri 'https://www.telerik.com");
    }, (err) => {
      console.log(err);
    });
  }

  public doEraseTag() {
    this.nfc.eraseTag().then(() => {
      this.set("lastNdefDiscovered", "Tag erased");
    }, (err) => {
      console.log(err);
    });
  }
}