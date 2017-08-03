import { NfcApi, NfcNdefData, NfcTagData, WriteTagOptions } from "./nfc.common";

// Note that this needs to be compiled with iOS 11 SDK because of NFCNDEFReaderSessionDelegate

// iOS 11 classes (not part of platform declarations, so defined those here)
declare const NFCNDEFReaderSession, NFCNDEFReaderSessionDelegate, NFCNDEFMessage: any;

// TODO https://developer.apple.com/documentation/corenfc?changes=latest_major&language=objc
export class Nfc implements NfcApi {

  private _available(): boolean {
    const bla = NFCNDEFReaderSession;
    console.log(">>> blaa " + bla);
    return NSClassFromString("NFCNDEFReaderSession") !== null;  };

  public available(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(this._available());
    });
  };

  public enabled(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(this._available());
    });
  };

  public setOnTagDiscoveredListener(arg: (data: NfcTagData) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve();
    });
  };

  public setOnNdefDiscoveredListener(arg: (data: NfcNdefData) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this._available()) {
        reject();
        return;
      }

      const delegate = NFCNDEFReaderSessionDelegateImpl.new().initWithResultCallback(() => { console.log('ok')});
      const queue = null;
      const invalidateAfterFirstRead = false;
      NFCNDEFReaderSession.initWithDelegateQueueInvalidateAfterFirstRead(delegate, queue, invalidateAfterFirstRead);

      resolve();
    });
  };

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
  public static ObjCProtocols = [NSClassFromString("NFCNDEFReaderSessionDelegate")];

  static new(): NFCNDEFReaderSessionDelegateImpl {
    return <NFCNDEFReaderSessionDelegateImpl>super.new();
  }

  private resultCallback: (message: any) => void;

  public initWithResultCallback(callback: (message: any) => void): NFCNDEFReaderSessionDelegateImpl {
    this.resultCallback = callback;
    return this;
  }

  // Called when the reader session finds a new tag
  readerSessionDidDetectNDEFs(session: any /* NFCNDEFReaderSession */, messages: NSArray<any /*NFCNDEFMessage>*/>): void {
    console.log(">> delegate readerSessionDidDetectNDEFs: " + messages);
    // if (result >= 0 && this.deviceConnectedCallback) {
    //   this.deviceConnectedCallback(deviceInfo.getName());
    // }
  }

  // Called when the reader session becomes invalid due to the specified error
  readerSessionDidInvalidateWithError(session: any /* NFCNDEFReaderSession */, error: NSError): void {
    console.log(">> delegate readerSessionDidInvalidateWithError: " + error.localizedDescription);
  }
}