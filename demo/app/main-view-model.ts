import * as observable from "tns-core-modules/data/observable";
import { alert } from "tns-core-modules/ui/dialogs";
import { Nfc, NfcTagData, NfcNdefData } from "nativescript-nfc";

export class HelloWorldModel extends observable.Observable {
  public lastNdefDiscovered: string = "";
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
    const that = this;
    this.nfc.setOnNdefDiscoveredListener((data: NfcNdefData) => {
      if (data.message) {
        let tagMessages = [];
        // data.message is an array of records, so:
        data.message.forEach(record => {
          console.log(">>> record.tnf: " + record.tnf);
          console.log(">>> record.type: " + record.type);
          console.log(">>> record.payload: " + record.payload);
          console.log(">>> record.payloadAsString: " + record.payloadAsString);
          console.log(">>> record.payloadAsHexString: " + record.payloadAsHexString);
          tagMessages.push(record.payloadAsString);
        });
        that.set("lastNdefDiscovered", "Read: " + tagMessages.join(", "));
        console.log("Read: " + tagMessages.join(", "));
        alert({
          title: "Ndef tag contents read:",
          message: " - " + tagMessages.join("\n - "),
          okButtonText: "OK :)"
        });
      }
    }, {stopAfterFirstRead: true}).then(() => {
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