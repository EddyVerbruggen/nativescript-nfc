import {
  NdefListenerOptions,
  NfcApi,
  NfcNdefData,
  NfcNdefRecord,
  NfcTagData,
  NfcUriProtocols,
  WriteTagOptions
} from "./nfc.common";

import { Utils } from "@nativescript/core";

export interface NfcSessionInvalidator {
  invalidateSession(): void;
}

export class Nfc implements NfcApi, NfcSessionInvalidator {
  private session: NFCNDEFReaderSession;
  private delegate: NFCNDEFReaderSessionDelegateImpl;

  private static _available(): boolean {
    const isIOS11OrUp = NSObject.instancesRespondToSelector(
      "accessibilityAttributedLabel"
    );
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

  public setOnTagDiscoveredListener(
    callback: (data: NfcTagData) => void
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve();
    });
  }

  public setOnNdefDiscoveredListener(
    callback: (data: NfcNdefData) => void,
    options?: NdefListenerOptions
  ): Promise<any> {
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
              console.log(
                "Ndef discovered, but no listener was set via setOnNdefDiscoveredListener. Ndef: " +
                  JSON.stringify(data)
              );
            } else {
              // execute on the main thread with this trick, so UI updates are not broken
              Utils.mainThreadify(() => {
                  callback(data)
              })
            }
          },
          options
        );

        this.session = NFCNDEFReaderSession.alloc().initWithDelegateQueueInvalidateAfterFirstRead(
          this.delegate,
          null,
          options && options.stopAfterFirstRead
        );

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
      reject("Not available on iOS");
    });
  }

  public eraseTag(): Promise<any> {
    return new Promise((resolve, reject) => {
      reject("Not available on iOS");
    });
  }
}

@NativeClass()
class NFCNDEFReaderSessionDelegateImpl
  extends NSObject
  implements NFCNDEFReaderSessionDelegate {
  public static ObjCProtocols = [];

  private _owner: WeakRef<NfcSessionInvalidator>;
  private resultCallback: (message: any) => void;
  private options?: NdefListenerOptions;

  public static new(): NFCNDEFReaderSessionDelegateImpl {
    try {
      NFCNDEFReaderSessionDelegateImpl.ObjCProtocols.push(
        NFCNDEFReaderSessionDelegate
      );
    } catch (ignore) {}
    return <NFCNDEFReaderSessionDelegateImpl>super.new();
  }

  public static createWithOwnerResultCallbackAndOptions(
    owner: WeakRef<NfcSessionInvalidator>,
    callback: (message: any) => void,
    options?: NdefListenerOptions
  ): NFCNDEFReaderSessionDelegateImpl {
    let delegate = <NFCNDEFReaderSessionDelegateImpl>(
      NFCNDEFReaderSessionDelegateImpl.new()
    );
    delegate._owner = owner;
    delegate.options = options;
    delegate.resultCallback = callback;
    return delegate;
  }

  readerSessionDidBecomeActive(session: NFCNDEFReaderSession): void {
    // ignore, but by implementing this function we suppress a log about it not being implemented ;)
  }

  // Called when the reader session finds a new tag
  readerSessionDidDetectNDEFs(
    session: NFCNDEFReaderSession,
    messages: NSArray<NFCNDEFMessage>
  ): void {
    const firstMessage = messages[0];
    if (this.options && this.options.stopAfterFirstRead) {
      setTimeout(() => this._owner.get().invalidateSession());
    }

    // execute on the main thread with this trick
    this.resultCallback(NFCNDEFReaderSessionDelegateImpl.ndefToJson(firstMessage));
  }

  /*readerSessionDidDetectTags(
    session: NFCNDEFReaderSession,
    tags: NSArray<NFCNDEFTag> | NFCNDEFTag[]
  ): void {
    
    // TODO prolly remember the tags for when the app wants to write to it (also: check Android impl for possibly sth similar)
    const nfcNdefTag = tags[0];
    session.connectToTagCompletionHandler(nfcNdefTag, (error: NSError) => {
      console.log(">> connected to tag, error: " + error);
    });

    // TODO either Text or URI
    const payload: NFCNDEFPayload = NFCNDEFPayload.wellKnownTypeTextPayloadWithStringLocale("EddyIOS", NSLocale.currentLocale);
    console.log(">> payload: " + payload);

    const ndefMessage: NFCNDEFMessage = NFCNDEFMessage.alloc().initWithNDEFRecords([payload]);
    console.log(">> ndefMessage: " + ndefMessage);

    if (nfcNdefTag.writeNDEFCompletionHandler) {
      nfcNdefTag.writeNDEFCompletionHandler(ndefMessage, (error: NSError) => {
        console.log(">> writeNDEFCompletionHandler, error: " + error);
      });
    }
   
  }*/

  // Called when the reader session becomes invalid due to the specified error
  readerSessionDidInvalidateWithError(
    session: any /* NFCNDEFReaderSession */,
    error: NSError
  ): void {
    this._owner.get().invalidateSession();
  }

  private static ndefToJson(message: NFCNDEFMessage): NfcNdefData {
    if (message === null) {
      return null;
    }

    return {
      message: NFCNDEFReaderSessionDelegateImpl.messageToJSON(message)
    };
  }

  private static messageToJSON(message: NFCNDEFMessage): Array<NfcNdefRecord> {
    const result = [];
    for (let i = 0; i < message.records.count; i++) {
      result.push(NFCNDEFReaderSessionDelegateImpl.recordToJSON(message.records.objectAtIndex(i)));
    }
    return result;
  }

  private static recordToJSON(record: NFCNDEFPayload): NfcNdefRecord {
    let payloadAsHexArray = NFCNDEFReaderSessionDelegateImpl.nsdataToHexArray(record.payload);
    let payloadAsString = NFCNDEFReaderSessionDelegateImpl.nsdataToASCIIString(record.payload);
    let payloadAsStringWithPrefix = payloadAsString;
    const recordType = NFCNDEFReaderSessionDelegateImpl.nsdataToHexArray(record.type);
    const decimalType = NFCNDEFReaderSessionDelegateImpl.hexToDec(recordType[0]);
    if (decimalType === 84) {
      let languageCodeLength: number = +payloadAsHexArray[0];
      payloadAsString = payloadAsStringWithPrefix.substring(
        languageCodeLength + 1
      );
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
      id: NFCNDEFReaderSessionDelegateImpl.hexToDecArray(NFCNDEFReaderSessionDelegateImpl.nsdataToHexArray(record.identifier)),
      payload: NFCNDEFReaderSessionDelegateImpl.hexToDecArray(payloadAsHexArray),
      payloadAsHexString: NFCNDEFReaderSessionDelegateImpl.nsdataToHexString(record.payload),
      payloadAsStringWithPrefix: payloadAsStringWithPrefix,
      payloadAsString: payloadAsString
    };
  }

  private static hexToDec(hex) {
    if (hex === undefined) {
      return undefined;
    }

    let result = 0,
      digitValue;
    hex = hex.toLowerCase();
    for (let i = 0; i < hex.length; i++) {
      digitValue = "0123456789abcdefgh".indexOf(hex[i]);
      result = result * 16 + digitValue;
    }
    return result;
  }

  private static buf2hexString(buffer) {
    // buffer is an ArrayBuffer
    return Array.prototype.map
      .call(new Uint8Array(buffer), x => ("00" + x.toString(16)).slice(-2))
      .join("");
  }

  private static buf2hexArray(buffer) {
    // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x =>
      ("00" + x.toString(16)).slice(-2)
    );
  }

  private static buf2hexArrayNr(buffer) {
    // buffer is an ArrayBuffer
    return Array.prototype.map.call(
      new Uint8Array(buffer),
      x => +x.toString(16)
    );
  }

  private static hex2a(hexx) {
    const hex = hexx.toString(); // force conversion
    let str = "";
    for (let i = 0; i < hex.length; i += 2)
      str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
  }

  private static nsdataToHexString(data): string {
    let b = interop.bufferFromData(data);
    return NFCNDEFReaderSessionDelegateImpl.buf2hexString(b);
  }

  private static nsdataToHexArray(data): Array<string> {
    let b = interop.bufferFromData(data);
    return NFCNDEFReaderSessionDelegateImpl.buf2hexArray(b);
  }

  private static nsdataToASCIIString(data): string {
    return NFCNDEFReaderSessionDelegateImpl.hex2a(NFCNDEFReaderSessionDelegateImpl.nsdataToHexString(data));
  }

  private static hexToDecArray(hexArray): any {
    let resultArray = [];
    for (let i = 0; i < hexArray.length; i++) {
      let result = 0,
        digitValue;
      const hex = hexArray[i].toLowerCase();
      for (let j = 0; j < hex.length; j++) {
        digitValue = "0123456789abcdefgh".indexOf(hex[j]);
        result = result * 16 + digitValue;
      }
      resultArray.push(result);
    }
    return JSON.stringify(resultArray);
  }
}
