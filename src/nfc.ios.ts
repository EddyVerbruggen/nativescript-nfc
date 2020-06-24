import { NdefListenerOptions, NfcApi, NfcNdefData, NfcNdefRecord, NfcTagData, NfcUriProtocols, WriteTagOptions, TextRecord } from "./nfc.common";

export interface NfcSessionInvalidator {
  invalidateSession(): void;
}

export class Nfc implements NfcApi, NfcSessionInvalidator {
  private session: NFCReaderSession;
  private delegate: NFCNDEFReaderSessionDelegateImpl;
  private tagDelegate: NFCTagReaderSessionDelegateImpl;
  public writeMode: boolean = false;
  public shouldUseTagReaderSession: boolean = false;
  public messageToWrite: NFCNDEFMessage;

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

      this.writeMode = false;
      this.shouldUseTagReaderSession = true;
      try {
        this.startScanSession(callback, {});

        resolve();
      } catch (e) {
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

      this.writeMode = false;
      this.shouldUseTagReaderSession = false;
      try {
        this.startScanSession(callback, options);

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
    console.log("writeTag");

    return new Promise((resolve, reject) => {
      try {
        this.writeMode = true;
        this.shouldUseTagReaderSession = false;

        this.messageToWrite = NfcHelper.jsonToNdefRecords(arg);

        this.startScanSession(() => { }, {
          stopAfterFirstRead: false,
          scanHint: "Hold near writable NFC tag to update."
        });

        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  public eraseTag(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        this.writeMode = true;
        this.shouldUseTagReaderSession = false;

        this.messageToWrite = NfcHelper.ndefEmptyMessage();

        this.startScanSession((data) => {}, {
          stopAfterFirstRead: false,
          scanHint: "Hold near writable NFC tag to erase."
        });

        resolve();
      } catch (e) {
        reject(e);
      }
    });
  }

  /* Common Processing */

  startScanSession(callback: (data: NfcTagData) => void, options?: NdefListenerOptions) {
    if (this.shouldUseTagReaderSession) {
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
      this.session = NFCTagReaderSession.alloc().initWithPollingOptionDelegateQueue(NFCPollingOption.ISO14443 | NFCPollingOption.ISO15693, this.tagDelegate, null);
    } else {
      console.log("create and start  NFCNDEFReaderSession");

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
    }

    this.session.beginSession();
  }
}

class NfcHelper {

  public static ndefEmptyMessage(): NFCNDEFMessage {
    let type: NSData = NfcHelper.uint8ArrayToNSData([]);
    let id: NSData = NfcHelper.uint8ArrayToNSData([]);
    const payload: NSData = NfcHelper.uint8ArrayToNSData([]);
    let record = NFCNDEFPayload.alloc().initWithFormatTypeIdentifierPayload(NFCTypeNameFormat.Empty, type, id, payload);
    let records: NSMutableArray<NFCNDEFPayload> = NSMutableArray.new();
    records.addObject(record);
    return NFCNDEFMessage.alloc().initWithNDEFRecords(records);
  }

  public static jsonToNdefRecords(arg: WriteTagOptions): NFCNDEFMessage {
    let records: NSMutableArray<NFCNDEFPayload> = NSMutableArray.new();

    if (arg.textRecords !== null) {
      arg.textRecords.forEach((textRecord) => {
        let type: NSData = NfcHelper.uint8ArrayToNSData([0x54]);
        let ids = [];
        if (textRecord.id) {
          for (let j = 0; j < textRecord.id.length; j++) {
            ids.push(textRecord.id[j]);
          }
        }
        let id: NSData = NfcHelper.uint8ArrayToNSData(ids);

        let langCode = textRecord.languageCode || "en";
        let encoded = NfcHelper.stringToBytes(langCode + textRecord.text);
        encoded.unshift(langCode.length);

        let payloads = [];
        for (let n = 0; n < encoded.length; n++) {
          payloads[n] = encoded[n];
        }
        const payload: NSData = NfcHelper.uint8ArrayToNSData(payloads);
        let record = NFCNDEFPayload.alloc().initWithFormatTypeIdentifierPayload(NFCTypeNameFormat.NFCWellKnown, type, id, payload);
        records.addObject(record);
      });
    }

    // TODO: implement for URI records

    return NFCNDEFMessage.alloc().initWithNDEFRecords(records);
  }

  public static ndefToJson(message: NFCNDEFMessage): NfcNdefData {
    if (message === null) {
      return null;
    }

    return {
      message: this.messageToJSON(message)
    };
  }

  public static messageToJSON(message: NFCNDEFMessage): Array<NfcNdefRecord> {
    const result = [];
    for (let i = 0; i < message.records.count; i++) {
      result.push(this.recordToJSON(message.records.objectAtIndex(i)));
    }
    return result;
  }

  private static recordToJSON(record: NFCNDEFPayload): NfcNdefRecord {
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

  public static stringToBytes(input: string) {
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

  public static uint8ArrayToNSData(array): NSData {
    let data: NSMutableData = NSMutableData.alloc().initWithCapacity(array.count);
    for (let item of array) {
      data.appendBytesLength(new interop.Reference(interop.types.uint8, item), 1);
    }
    return data;
  }

  private static nsdataToHexString(data): string {
    let b = interop.bufferFromData(data);
    return this.buf2hexString(b);
  }

  private static nsdataToHexArray(data): Array<string> {
    let b = interop.bufferFromData(data);
    return this.buf2hexArray(b);
  }
  private static nsdataToASCIIString(data): string {
    return this.hex2a(this.nsdataToHexString(data));
  }

  private static hex2a(hexx) {
    const hex = hexx.toString(); // force conversion
    let str = '';
    for (let i = 0; i < hex.length; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }

  private static hexToDecArray(hexArray): any {
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

  private static buf2hexArray(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2));
  }

  private static buf2hexString(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
  }

  private static hexToDec(hex) {
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

  private static buf2hexArrayNr(buffer) { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => +(x.toString(16)));
  }
}

/* NFCTagReaderSessionDelegate */
class NFCTagReaderSessionDelegateImpl extends NSObject implements NFCTagReaderSessionDelegate {

  public static ObjCProtocols = [];

  private _owner: WeakRef<NfcSessionInvalidator>;
  private resultCallback: (message: any) => void;
  private options?: NdefListenerOptions;

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

  tagReaderSessionDidDetectTags(session: NFCTagReaderSession, tags: NSArray<NFCTag> | NFCTag[]): void {
    console.log("tagReaderSessionDidDetectTags");

    var tag = tags[0];

    // TODO: fill with UID
    var nfcTagData: NfcTagData = {
      id: [0],
      techList: []
    };
    session.invalidateSession();
    
    this.resultCallback(nfcTagData);
  }

  tagReaderSessionDidInvalidateWithError(session: NFCTagReaderSession, error: NSError): void {
    this._owner.get().invalidateSession();
  }
}

/* NFCNDEFReaderSessionDelegate */
class NFCNDEFReaderSessionDelegateImpl extends NSObject implements NFCNDEFReaderSessionDelegate {
  public static ObjCProtocols = [];

  private _owner: WeakRef<Nfc>;
  private resultCallback: (message: any) => void;
  private options?: NdefListenerOptions;

  public static new(): NFCNDEFReaderSessionDelegateImpl {
    try {
      NFCNDEFReaderSessionDelegateImpl.ObjCProtocols.push(NFCNDEFReaderSessionDelegate);
    } catch (ignore) {
    }
    return <NFCNDEFReaderSessionDelegateImpl>super.new();
  }

  public static createWithOwnerResultCallbackAndOptions(owner: WeakRef<Nfc>, callback: (message: any) => void, options?: NdefListenerOptions): NFCNDEFReaderSessionDelegateImpl {
    let delegate = <NFCNDEFReaderSessionDelegateImpl>NFCNDEFReaderSessionDelegateImpl.new();
    delegate._owner = owner;
    delegate.options = options;
    delegate.resultCallback = callback;
    return delegate;
  }

  readerSessionDidBecomeActive(session: NFCNDEFReaderSession): void {
    console.log("NFCNDEFReaderSessionDelegateImpl:readerSessionDidBecomeActive");
  }

  readerSessionDidDetectTags(session: NFCNDEFReaderSession, tags: NSArray<NFCNDEFTag> | NFCNDEFTag[]): void {
    console.log("NFCNDEFReaderSessionDelegateImpl:readerSessionDidDetectTags");

    let tag = tags[0];

    session.connectToTagCompletionHandler(tag, (error) => {
      console.log("connectToTagCompletionHandler");

      if (error) {
        console.log(error);
        session.invalidateSessionWithErrorMessage("Error connecting to tag.");
        return;
      }

      this.processNDEFTag(session, tag, this._owner.get().messageToWrite);
    });
  }

  // Called when the reader session finds a new tag
  readerSessionDidDetectNDEFs(session: NFCNDEFReaderSession, messages: NSArray<NFCNDEFMessage>): void {
    console.log("NFCNDEFReaderSessionDelegateImpl:readerSessionDidDetectNDEFs");

    if (this.options && this.options.stopAfterFirstRead) {
      setTimeout(() => this._owner.get().invalidateSession());
    }

    if (!this._owner.get().writeMode) {
      const firstMessage = messages[0];
      // execute on the main thread with this trick
      this.resultCallback(NfcHelper.ndefToJson(firstMessage));
    }
  }

  // Called when the reader session becomes invalid due to the specified error
  readerSessionDidInvalidateWithError(session: any /* NFCNDEFReaderSession */, error: NSError): void {
    this._owner.get().invalidateSession();
  }

  /* Helpers */
  private processNDEFTag(session: NFCReaderSession, tag: NFCNDEFTag, messageToWrite: NFCNDEFMessage) {
    NFCNDEFTag.prototype.queryNDEFStatusWithCompletionHandler.call(tag, (status: NFCNDEFStatus, number: number, error: NSError) => {
      console.log("queryNDEFStatusWithCompletionHandler");

      if (error) {
        console.log(error);
        session.invalidateSessionWithErrorMessage("Error getting tag status.");
        return;
      }

      if (messageToWrite) {
        this.writeNDEFTag(session, status, tag, messageToWrite);
      } else {
        this.readNDEFTag(session, status, tag);
      }
    });
  }

  private readNDEFTag(session: NFCReaderSession, status: NFCNDEFStatus, tag: NFCNDEFTag) {
    console.log("readNDEFTag");

    NFCNDEFTag.prototype.readNDEFWithCompletionHandler.call(tag, (message: NFCNDEFMessage, error: NSError) => {
      console.log("readNDEFWithCompletionHandler");

      if (this.options && this.options.stopAfterFirstRead) {
        setTimeout(() => this._owner.get().invalidateSession());
      }

      if (error && error.code != 403) {
        session.invalidateSessionWithErrorMessage("Read failed.");
        return;
      } else {
        session.alertMessage = "Tag successfully read.";
        session.invalidateSession();

        // execute on the main thread with this trick
        this.resultCallback(NfcHelper.ndefToJson(message));
      }
    });
  }

  private writeNDEFTag(session: NFCReaderSession, status: NFCNDEFStatus, tag: NFCNDEFTag, message: NFCNDEFMessage) {
    console.log("writeNDEFTag");
    console.log("Status: " + status);

    if (status == NFCNDEFStatus.NotSupported) {
      session.invalidateSessionWithErrorMessage("Tag is not NDEF compliant.");
    } else if (status === NFCNDEFStatus.ReadOnly) {
      session.invalidateSessionWithErrorMessage("Tag is read only.");
    } else if (status === NFCNDEFStatus.ReadWrite) {
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
}
