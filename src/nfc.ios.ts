import {
  NdefListenerOptions, NfcApi, NfcNdefData, NfcNdefRecord, NfcTagData, NfcUriProtocols,
  WriteTagOptions
} from "./nfc.common";

// iOS 11 classes (not part of platform declarations, so defined those here)
declare const NFCNDEFReaderSession, NFCNDEFReaderSessionDelegate, NFCNDEFMessage: any;

export interface NfcSessionInvalidator {
  invalidateSession(): void;
}

// TODO https://developer.apple.com/documentation/corenfc?changes=latest_major&language=objc
export class Nfc implements NfcApi, NfcSessionInvalidator {

  private session; /* NFCNDEFReaderSession */
  private delegate;

  private static _available(): boolean {
    const isIOS11OrUp = NSObject.instancesRespondToSelector("accessibilityAttributedLabel");
    if (isIOS11OrUp) {
      try {
        return NFCNDEFReaderSession.readingAvailable;
      } catch (e) {
        console.log(">>> e: " + e);
        return false;
      }
    } else {
      return false;
    }
  }

  public available(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(Nfc._available());
    });
  };

  public enabled(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(Nfc._available());
    });
  };

  public setOnTagDiscoveredListener(arg: (data: NfcTagData) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve();
    });
  };

  public setOnNdefDiscoveredListener(arg: (data: NfcNdefData) => void, options?: NdefListenerOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!Nfc._available()) {
        reject();
        return;
      }

      if (arg === null) {
        this.invalidateSession();
        resolve();
        return;
      }

      try {
        this.delegate = NFCNDEFReaderSessionDelegateImpl.createWithOwnerResultCallbackAndOptions(
            new WeakRef(this),
            data => {
              if (!arg) {
                console.log("Ndef discovered, but no listener was set via setOnNdefDiscoveredListener. Ndef: " + JSON.stringify(data));
              } else {
                arg(data);
              }
            },
            options);

        this.session = NFCNDEFReaderSession.alloc().initWithDelegateQueueInvalidateAfterFirstRead(this.delegate, null, options.stopAfterFirstRead);
        this.session.beginSession();

        resolve();
      } catch (e) {
        reject(e);
      }
    });
  };

  invalidateSession(): void {
    if (this.session) {
      this.session.invalidateSession();
      this.session = undefined;
    }
  }

  public stopListening(): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve();
    });
  };

  public writeTag(arg: WriteTagOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      reject("Not available on iOS");
    });
  };

  public eraseTag(): Promise<any> {
    return new Promise((resolve, reject) => {
      reject("Not available on iOS");
    });
  };
}

class NFCNDEFReaderSessionDelegateImpl extends NSObject /* implements NFCNDEFReaderSessionDelegate */ {
  public static ObjCProtocols = [];

  private _owner: WeakRef<NfcSessionInvalidator>;
  private resultCallback: (message: any) => void;
  private options?: NdefListenerOptions;

  public static new(): NFCNDEFReaderSessionDelegateImpl {
    try {
      NFCNDEFReaderSessionDelegateImpl.ObjCProtocols.push(NFCNDEFReaderSessionDelegate)
    } catch (e) {
      console.log(">>> delegate new: " + e);
    }
    return <NFCNDEFReaderSessionDelegateImpl>super.new();
  }

  public static createWithOwnerResultCallbackAndOptions(owner: WeakRef<NfcSessionInvalidator>, callback: (message: any) => void, options?: NdefListenerOptions): NFCNDEFReaderSessionDelegateImpl {
    let delegate = <NFCNDEFReaderSessionDelegateImpl>NFCNDEFReaderSessionDelegateImpl.new();
    delegate._owner = owner;
    delegate.options = options;
    delegate.resultCallback = callback;
    return delegate;
  }

  // Called when the reader session finds a new tag
  readerSessionDidDetectNDEFs(session: any /* NFCNDEFReaderSession */, messages: NSArray<any /*NFCNDEFMessage>*/>): void {
    // TODO align with Android, and decode (the first one?). Inspiration: https://github.com/scottire/phonegap-nfc/blob/master/src/ios/NFC.m
    console.log(">> delegate readerSessionDidDetectNDEFs: " + messages);
    // "(\n    \"TNF=1, Payload Type=<54>, Payload ID=<>, Payload=<02656e48 69207468 65726521>\",\n    \"TNF=1, Payload Type=<54>, Payload ID=<>, Payload=<02656e57 65642046 65622032 35203230 31352031 313a3334 3a323120 474d542b 30313030 20284345 5429>\",\n    \"TNF=1, Payload Type=<55>, Payload ID=<>, Payload=<03706c75 67696e73 2e74656c 6572696b 2e636f6d 2f706c75 67696e2f 6e6663>\"\n)"

    const firstMessage = messages[0];
    console.log(">> delegate readerSessionDidDetectNDEFs: firstMessage: " + firstMessage);

    if (this.options && this.options.stopAfterFirstRead) {
      setTimeout(() => this._owner.get().invalidateSession());
    }
    this.resultCallback(this.ndefToJson(firstMessage));
  }

  // Called when the reader session becomes invalid due to the specified error
  readerSessionDidInvalidateWithError(session: any /* NFCNDEFReaderSession */, error: NSError): void {
    console.log(">> delegate readerSessionDidInvalidateWithError: " + error.localizedDescription);
    this._owner.get().invalidateSession()
  }

  private ndefToJson(message: any /*NFCNDEFMessage */): NfcNdefData {
    if (message === null) {
      return null;
    }

    let ndefJson: NfcNdefData = {
      message: this.messageToJSON(message),
    };

    return ndefJson;
  }

  private messageToJSON(message: any /*NFCNDEFMessage */): Array<NfcNdefRecord> {
    const result = [];
    for (let i = 0, l = message.records.count; i < l; i++) {
      result.push(this.recordToJSON(message.records.objectAtIndex(i)));
    }
    return result;
  }

  private recordToJSON(record: any /*NFCNDEFPayload*/): NfcNdefRecord {
    let payloadAsHexArray = this.nsdataToHexArray(record.payload);
    let payloadAsString = this.nsdataToASCIIString(record.payload);
    let payloadAsStringWithPrefix = payloadAsString;
    const recordType = this.nsdataToHexArray(record.type);
    const decimalType = this.hexToDec(recordType[0]);
    if (decimalType === 84) {
      let languageCodeLength: number = +payloadAsHexArray[0];
      payloadAsString = payloadAsStringWithPrefix.substring(languageCodeLength + 1);
    } else if (decimalType === 85) {
      let prefix = NfcUriProtocols[payloadAsHexArray[0]];
      if (!prefix) {
        prefix = "";
      }
      payloadAsString = prefix + payloadAsString.slice(1);
    }

    let b = interop.bufferFromData(record.payload);

    // console.log(">> b t: " + typeof b);
    // console.log(">> b: " + b);
    // console.log(">> b.l: " + b.byteLength);
    // console.log(">> buf2hexArrayNr: " + this.buf2hexArrayNr(b));

    return {
      tnf: record.typeNameFormat, // "typeNameFormat" (1 = well known) - see https://developer.apple.com/documentation/corenfc/nfctypenameformat?changes=latest_major&language=objc
      type: decimalType,
      id: this.byteArrayToJSArray(record.identifier),
      payload: this.hexToDecArray(payloadAsHexArray),
      payloadAsHexString: this.nsdataToHexString(record.payload),
      payloadAsStringWithPrefix: payloadAsStringWithPrefix,
      payloadAsString: payloadAsString
    };
  }

  private byteArrayToJSArray(bytes): Array<number> {
    let result = [];
    for (let i = 0; i < bytes.length; i++) {
      result.push(bytes[i]);
    }
    return result;
  }

  private hexToDec(hex) {
    var result = 0, digitValue;
    hex = hex.toLowerCase();
    for (var i = 0; i < hex.length; i++) {
      digitValue = '0123456789abcdefgh'.indexOf(hex[i]);
      result = result * 16 + digitValue;
    }
    return result;
  }

  private buf2hexString(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  }

  private buf2hexArray(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2));
  }

  private buf2hexArrayNr(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => +(x.toString(16)));
  }

  private hex2a(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }

  private nsdataToHexString(data): string {
    let b = interop.bufferFromData(data);
    return this.buf2hexString(b);
  }

  private nsdataToHexArray(data): Array<string> {
    let b = interop.bufferFromData(data);
    return this.buf2hexArray(b);
  }

  private nsdataToASCIIString(data): string {
    return this.hex2a(this.nsdataToHexString(data));
  }

  private hexToDecArray(hexArray): any {
    console.log(">> hexToDecArray: " + hexArray);
    var resultArray = [];
    for (var i = 0; i < hexArray.length; i++) {
      var result = 0, digitValue;
      var hex = hexArray[i].toLowerCase();
      // console.log(">> hex: " + hex);
      for (var j = 0; j < hex.length; j++) {
        digitValue = '0123456789abcdefgh'.indexOf(hex[j]);
        result = result * 16 + digitValue;
      }
      resultArray.push(result);
    }
    console.log(">> resultArray: " + JSON.stringify(resultArray));
    console.log(">> resultArray.l: " + resultArray.length);
    console.log(">> resultArray.j: " + resultArray.join(''));
    console.log(">> resultArray.: " + ("" + resultArray));
    return JSON.stringify(resultArray);
  }
}