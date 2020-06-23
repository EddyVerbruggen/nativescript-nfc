import { NdefListenerOptions, NfcApi, NfcNdefData, NfcNdefRecord, NfcTagData, NfcUriProtocols, WriteTagOptions, TextRecord } from "./nfc.common";

export interface NfcSessionInvalidator {
  invalidateSession(): void;
}

export class Nfc implements NfcApi, NfcSessionInvalidator {
  private session: NFCNDEFReaderSession;
  private delegate: NFCNDEFReaderSessionDelegateImpl;
  private writeMode: false;

  private static _available(): boolean {
    const isIOS11OrUp = NSObject.instancesRespondToSelector("accessibilityAttributedLabel");
    if (isIOS11OrUp) {
      try {
        return NFCNDEFReaderSession.readingAvailable;
      } catch (e) {
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
  }

  public enabled(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(Nfc._available());
    });
  }

  private tagSession: NFCTagReaderSession;
  private tagDelegate: NFCTagReaderSessionDelegateImpl;

  public setOnTagDiscoveredListener(callback: (data: NfcTagData) => void): Promise<any> {

    console.log("nativescript-nfc ios: setOnTagDiscoveredListener");

    return new Promise((resolve, reject) => {
      if (!Nfc._available()) {
        reject();
        return;
      }

      if (callback === null) {
        console.log("callback = null");

        this.invalidateSession();
        resolve();
        return;
      }

      try {

        this.tagDelegate = NFCTagReaderSessionDelegateImpl.createWithOwnerResultCallbackAndOptions(
          new WeakRef(this),
          data => {
            if (!callback) {
              console.log("Tag discovered, but no listener was set via setOnTagDiscoveredListener. Ndef: " + JSON.stringify(data));
            } else {
              // execute on the main thread with this trick, so UI updates are not broken
              Promise.resolve().then(() => callback(data));
            }
          },
          {});

        this.tagSession = NFCTagReaderSession.alloc().initWithPollingOptionDelegateQueue(NFCPollingOption.ISO14443 | NFCPollingOption.ISO15693, this.tagDelegate, null);

        this.tagSession.beginSession();

        resolve();
      } catch (e) {
        console.log(JSON.stringify(e));
        reject(e);
      }
    });
  }

  public setOnNdefDiscoveredListener(callback: (data: NfcNdefData) => void, options?: NdefListenerOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!Nfc._available()) {
        reject();
        return;
      }

      if (callback === null) {
        this.invalidateSession();
        resolve();
        return;
      }

      try {
        this.delegate = NFCNDEFReaderSessionDelegateImpl.createWithOwnerResultCallbackAndOptions(
          new WeakRef(this),
          data => {
            if (!callback) {
              console.log("Ndef discovered, but no listener was set via setOnNdefDiscoveredListener. Ndef: " + JSON.stringify(data));
            } else {
              // execute on the main thread with this trick, so UI updates are not broken
              Promise.resolve().then(() => callback(data));
            }
          },
          options);

        this.session = NFCNDEFReaderSession.alloc().initWithDelegateQueueInvalidateAfterFirstRead(
          this.delegate,
          null,
          options && options.stopAfterFirstRead);

        if (options && options.scanHint) {
          this.session.alertMessage = options.scanHint;
        }

        this.session.beginSession();

        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

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
  }

  public writeTag(arg: WriteTagOptions): Promise<any> {
    return new Promise((resolve, reject) => {
      try {



        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  public eraseTag(): Promise<any> {
    return new Promise((resolve, reject) => {
      reject("Not available on iOS");
    });
  }
}

/* Common Processing */


/* NFCTagReaderSessionDelegate */
class NFCTagReaderSessionDelegateImpl extends NSObject implements NFCTagReaderSessionDelegate {

  public static ObjCProtocols = [];

  private _owner: WeakRef<NfcSessionInvalidator>;
  private resultCallback: (message: any) => void;
  private options?: NdefListenerOptions;
  private writeMode:boolean = true;

  public static new(): NFCTagReaderSessionDelegateImpl {
    try {
      NFCTagReaderSessionDelegateImpl.ObjCProtocols.push(NFCTagReaderSessionDelegate);
    } catch (ignore) {
    }
    return <NFCTagReaderSessionDelegateImpl>super.new();
  }

  public static createWithOwnerResultCallbackAndOptions(owner: WeakRef<NfcSessionInvalidator>, callback: (message: any) => void, options?: NdefListenerOptions): NFCTagReaderSessionDelegateImpl {
    let delegate = <NFCTagReaderSessionDelegateImpl>NFCTagReaderSessionDelegateImpl.new();
    delegate._owner = owner;
    delegate.options = options;
    delegate.resultCallback = callback;
    return delegate;
  }

  tagReaderSessionDidBecomeActive?(session: NFCTagReaderSession): void {
    console.log("tagReaderSessionDidBecomeActive");
  }
  tagReaderSessionDidDetectTags?(session: NFCTagReaderSession, tags: NSArray<NFCTag> | NFCTag[]): void {
    console.log("tagReaderSessionDidDetectTags");

    var tag = tags[0];
    //let uid = this.getTagUID(tag);

    session.connectToTagCompletionHandler(tag, (error) => {
      console.log("connectToTagCompletionHandler");

      console.log(error);
      if (error) {
        console.log(error); 
        session.invalidateSessionWithErrorMessage("Error connecting to tag.");
        return;
      }

      const ndefTag: NFCNDEFTag = new interop.Reference<NFCNDEFTag>(interop.types.id, tag).value;

      NFCNDEFTag.prototype.queryNDEFStatusWithCompletionHandler.call(ndefTag, (status: NFCNDEFStatus, number: number, error: NSError) => {
        console.log("queryNDEFStatusWithCompletionHandler");

        if (error) {
          console.log(error);
          session.invalidateSessionWithErrorMessage("Error getting tag status.");
          return;
        }

        if (true) {
          this.writeNDEFTag(session, status, ndefTag);
        } else {
          /* just read tag */
        }
      });
    });
  }

  public writeNDEFTag(session: NFCReaderSession, status: NFCNDEFStatus, tag: NFCNDEFTag) {
    console.log("writeNDEFTag");
    console.log("Status: " + status);

    if (status == NFCNDEFStatus.NotSupported) {
      session.invalidateSessionWithErrorMessage("Tag is not NDEF compliant.");
    } else if (status === NFCNDEFStatus.ReadOnly) {
      session.invalidateSessionWithErrorMessage("Tag is read only.");
    } else if (status === NFCNDEFStatus.ReadWrite) {

      /* input messages */
      let txtRecords: Array<TextRecord> = [];
      let txtRecord: TextRecord = { "text": "this is a test", "languageCode": "en" };
      txtRecords.push(txtRecord);

      /* prepare message to write */
      let records: NSMutableArray<NFCNDEFPayload> = NSMutableArray.new();

      txtRecords.forEach((textRecord) => {
        let type: NSData = this.uint8ArrayToNSData([0x54]);

        let ids = [];
        if (textRecord.id) {
          for (let j = 0; j < textRecord.id.length; j++) {
            ids.push(textRecord.id[j]);
          }
        }
        let id: NSData = this.uint8ArrayToNSData(ids);

        let langCode = textRecord.languageCode || "en";
        let encoded = this.stringToBytes(langCode + textRecord.text);
        encoded.unshift(langCode.length);

        let payloads = [];
        for (let n = 0; n < encoded.length; n++) {
          payloads[n] = encoded[n];
        }
        const payload: NSData = this.uint8ArrayToNSData(payloads);

        let record = NFCNDEFPayload.alloc().initWithFormatTypeIdentifierPayload(NFCTypeNameFormat.NFCWellKnown, type, id, payload);

        records.addObject(record);
      });

      let message: NFCNDEFMessage = NFCNDEFMessage.alloc().initWithNDEFRecords(records);

      console.log(message);

      NFCNDEFTag.prototype.writeNDEFCompletionHandler.call(tag, message, (error: NSError) => {
        if (error) {
          console.log(error);
          session.invalidateSessionWithErrorMessage("Write failed.");
        } else {
          session.alertMessage = "Wrote data to NFC tag.";
          session.invalidateSession();
        }
      });
    }
  }

  private stringToBytes(input: string) {
    let bytes = [];
    for (let n = 0; n < input.length; n++) {
      let c = input.charCodeAt(n);
      if (c < 128) {
        bytes[bytes.length] = c;
      } else if ((c > 127) && (c < 2048)) {
        bytes[bytes.length] = (c >> 6) | 192;
        bytes[bytes.length] = (c & 63) | 128;
      } else {
        bytes[bytes.length] = (c >> 12) | 224;
        bytes[bytes.length] = ((c >> 6) & 63) | 128;
        bytes[bytes.length] = (c & 63) | 128;
      }
    }
    return bytes;
  }

  uint8ArrayToNSData(array): NSData {
    let data: NSMutableData = NSMutableData.alloc().initWithCapacity(array.count);
    for (let item of array) {
      data.appendBytesLength(new interop.Reference(interop.types.uint8, item), 1);
    }
    return data;
  }

  tagReaderSessionDidInvalidateWithError(session: NFCTagReaderSession, error: NSError): void {
    console.log("tagReaderSessionDidInvalidateWithError");
    console.log(error);
  }

  getTagUID(tag: NFCTag): any {
    let uid: NSData = null;
    let type = "Unknown";

    if (NFCTag.prototype.asNFCMiFareTag.call(tag) === tag) {
      tag.type = NFCTagType.MiFare;
      type = "MiFare";

      let mifareTag: NFCMiFareTag = <NFCMiFareTag>NFCTag.prototype.asNFCMiFareTag.call(tag);

      console.log(mifareTag); // OK: displays <NFCMiFareTag: 0x2809bda70>

      uid = NSData.alloc().initWithData(mifareTag.identifier);

      console.log(uid); // ISSUE: it displays {length = 0, bytes = 0x}

      /* 
      
        Probably some more processing of uid is needed to convert from big-endian bytes to string:
        https://stackoverflow.com/questions/46504035/little-endian-byte-order-ios-ble-scan-response
        https://stackoverflow.com/questions/46518084/nativescript-get-string-from-interop-reference

        let str = NSString.alloc().initWithDataEncoding(mifareTag.identifier, NSUTF16BigEndianStringEncoding);
        console.log(str);

      */
    } else if (NFCTag.prototype.asNFCISO15693Tag.apply(tag) === tag) {
      tag.type = NFCTagType.ISO15693;
      type = "ISO15693";
    } else if (NFCTag.prototype.asNFCISO7816Tag.apply(tag) === tag) {
      tag.type = NFCTagType.ISO7816Compatible;
      type = "NFCISO7816";
    } else if (NFCTag.prototype.asNFCFeliCaTag.apply(tag) === tag) {
      tag.type = NFCTagType.FeliCa;
      type = "FeilCa";
    }

    console.log("Tag Type: " + type + " ( " + tag.type + " )");

    return this.nsdataToHexArray(uid);
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

  private hex2a(hexx) {
    const hex = hexx.toString(); // force conversion
    let str = '';
    for (let i = 0; i < hex.length; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }

  private hexToDecArray(hexArray): any {
    let resultArray = [];
    for (let i = 0; i < hexArray.length; i++) {
      let result = 0, digitValue;
      const hex = hexArray[i].toLowerCase();
      for (let j = 0; j < hex.length; j++) {
        digitValue = '0123456789abcdefgh'.indexOf(hex[j]);
        result = result * 16 + digitValue;
      }
      resultArray.push(result);
    }
    return JSON.stringify(resultArray);
  }

  private buf2hexArray(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2));
  }

  private buf2hexString(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  }
}

/* NFCNDEFReaderSessionDelegate */
class NFCNDEFReaderSessionDelegateImpl extends NSObject implements NFCNDEFReaderSessionDelegate {
  public static ObjCProtocols = [];

  private _owner: WeakRef<NfcSessionInvalidator>;
  private resultCallback: (message: any) => void;
  private options?: NdefListenerOptions;

  public static new(): NFCNDEFReaderSessionDelegateImpl {
    try {
      NFCNDEFReaderSessionDelegateImpl.ObjCProtocols.push(NFCNDEFReaderSessionDelegate);
    } catch (ignore) {
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
  readerSessionDidDetectNDEFs(session: NFCNDEFReaderSession, messages: NSArray<NFCNDEFMessage>): void {
    const firstMessage = messages[0];
    if (this.options && this.options.stopAfterFirstRead) {
      setTimeout(() => this._owner.get().invalidateSession());
    }

    // execute on the main thread with this trick
    this.resultCallback(this.ndefToJson(firstMessage));
  }

  // Called when the reader session becomes invalid due to the specified error
  readerSessionDidInvalidateWithError(session: any /* NFCNDEFReaderSession */, error: NSError): void {
    this._owner.get().invalidateSession();
  }

  private ndefToJson(message: NFCNDEFMessage): NfcNdefData {
    if (message === null) {
      return null;
    }

    return {
      message: this.messageToJSON(message),
    };
  }

  private messageToJSON(message: NFCNDEFMessage): Array<NfcNdefRecord> {
    const result = [];
    for (let i = 0; i < message.records.count; i++) {
      result.push(this.recordToJSON(message.records.objectAtIndex(i)));
    }
    return result;
  }

  private recordToJSON(record: NFCNDEFPayload): NfcNdefRecord {
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

    return {
      tnf: record.typeNameFormat, // "typeNameFormat" (1 = well known) - see https://developer.apple.com/documentation/corenfc/nfctypenameformat?changes=latest_major&language=objc
      type: decimalType,
      id: this.hexToDecArray(this.nsdataToHexArray(record.identifier)),
      payload: this.hexToDecArray(payloadAsHexArray),
      payloadAsHexString: this.nsdataToHexString(record.payload),
      payloadAsStringWithPrefix: payloadAsStringWithPrefix,
      payloadAsString: payloadAsString
    };
  }

  private hexToDec(hex) {
    if (hex === undefined) {
      return undefined;
    }

    let result = 0, digitValue;
    hex = hex.toLowerCase();
    for (let i = 0; i < hex.length; i++) {
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
    const hex = hexx.toString(); // force conversion
    let str = '';
    for (let i = 0; i < hex.length; i += 2)
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
    let resultArray = [];
    for (let i = 0; i < hexArray.length; i++) {
      let result = 0, digitValue;
      const hex = hexArray[i].toLowerCase();
      for (let j = 0; j < hex.length; j++) {
        digitValue = '0123456789abcdefgh'.indexOf(hex[j]);
        result = result * 16 + digitValue;
      }
      resultArray.push(result);
    }
    return JSON.stringify(resultArray);
  }
}
