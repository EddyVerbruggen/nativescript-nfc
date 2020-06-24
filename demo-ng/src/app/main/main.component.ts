import { Component, OnInit } from "@angular/core";
import * as observable from "tns-core-modules/data/observable";
import { Nfc, NfcNdefData, NfcTagData } from "nativescript-nfc";

@Component({
    selector: "ns-main",
    templateUrl: "./main.component.html"
})
export class MainComponent extends observable.Observable implements OnInit {

    public lastNdefDiscovered: string = "Press a button...";
    private nfc: Nfc;

    constructor() {
        super();
        this.nfc = new Nfc();
    }
    ngOnInit(): void { }

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

    public doStartNdefListener() {

        this.nfc.setOnNdefDiscoveredListener((data: NfcNdefData) => {
            if (data.message) {
                let tagMessages = [];
                // data.message is an array of records, so:
                data.message.forEach(record => {
                    console.log("Read record: " + JSON.stringify(record));
                    tagMessages.push(record.payloadAsString);
                });
                alert(tagMessages.join(", "));
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
                    text: "Hello3"
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
