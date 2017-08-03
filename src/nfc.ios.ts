import { NfcApi, NfcNdefData, NfcTagData, WriteTagOptions } from "./nfc.common";

// iOS 11 classes (not part of platform declarations, so defined those here)
declare const NFCNDEFReaderSession, NFCNDEFReaderSessionDelegate, NFCNDEFMessage: any;


// TODO https://developer.apple.com/documentation/corenfc?changes=latest_major&language=objc
export class Nfc implements NfcApi {

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

  public setOnNdefDiscoveredListener(arg: (data: NfcNdefData) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!Nfc._available()) {
        reject();
        return;
      }

      try {
        const delegate = NFCNDEFReaderSessionDelegateImpl.new().initWithResultCallback((data) => { console.log('data read: ' + data)});
        const queue = null; // not sure this is allowed
        const invalidateAfterFirstRead = false;
        const session = NFCNDEFReaderSession.alloc().initWithDelegateQueueInvalidateAfterFirstRead(delegate, queue, invalidateAfterFirstRead);
        session.beginSession();

        resolve();
      } catch (e) {
        reject(e);
      }
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
  public static ObjCProtocols = [];

  static new(): NFCNDEFReaderSessionDelegateImpl {
    try {
      NFCNDEFReaderSessionDelegateImpl.ObjCProtocols.push(NFCNDEFReaderSessionDelegate)
    } catch (e) {
      console.log(">>> delegate new: " + e);
    }
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
    // "(\n    \"TNF=1, Payload Type=<54>, Payload ID=<>, Payload=<02656e48 69207468 65726521>\",\n    \"TNF=1, Payload Type=<54>, Payload ID=<>, Payload=<02656e57 65642046 65622032 35203230 31352031 313a3334 3a323120 474d542b 30313030 20284345 5429>\",\n    \"TNF=1, Payload Type=<55>, Payload ID=<>, Payload=<03706c75 67696e73 2e74656c 6572696b 2e636f6d 2f706c75 67696e2f 6e6663>\"\n)"
    this.resultCallback(messages);
  }

  // Called when the reader session becomes invalid due to the specified error
  readerSessionDidInvalidateWithError(session: any /* NFCNDEFReaderSession */, error: NSError): void {
    console.log(">> delegate readerSessionDidInvalidateWithError: " + error.localizedDescription);
  }
}