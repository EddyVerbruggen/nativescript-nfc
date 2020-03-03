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
      alert("NFC Available: " + avail);
    }, (err) => {
      alert(err);
    });
  }

  public doCheckEnabled() {
    this.nfc.enabled().then((on) => {
      console.log("Enabled? " + on);
      alert("NFC Enabled: " + on);
    }, (err) => {
      alert(err);
    });
  }

  public doStartTagListener() {
    let that = this;
    this.nfc.setOnTagDiscoveredListener((data: NfcTagData) => {
      console.log("Tag discovered! " + JSON.stringify(data));
      that.set("lastNdefDiscovered", data.id + " => " + data.techList.join(", "));
    }).then(() => {
      console.log("TagListener Listening...");
      this.set("lastNdefDiscovered", "Listening...");
    }, (err) => {
      console.log(err);
    });
  }

  public doStopTagListener() {
    this.nfc.setOnTagDiscoveredListener(null).then(() => {
      console.log("OnTagDiscovered nulled");
      this.set("lastNdefDiscovered", "Stopped listening.");
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
    }).then(() => {
      console.log("NdefListener Listening...");
      this.set("lastNdefDiscovered", "Listening...");
    }).catch(err => alert(err));
  }

  public doStopNdefListener() {
    this.nfc.setOnNdefDiscoveredListener(null).then(() => {
      console.log("OnNdefDiscovered nulled");
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
      console.log("Wrote text 'Hello!'");
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
      console.log("Wrote uri 'https://www.telerik.com'");
      this.set("lastNdefDiscovered", "Wrote uri 'https://www.telerik.com'");
    }, (err) => {
      console.log(err);
    });
  }

  public doEraseTag() {
    this.nfc.eraseTag().then(() => {
      console.log("Tag erased");
      this.set("lastNdefDiscovered", "Tag erased");
    }, (err) => {
      console.log(err);
    });
  }
}