export const NfcUriProtocols = ["", "http://www.", "https://www.", "http://", "https://", "tel:", "mailto:", "ftp://anonymous:anonymous@", "ftp://ftp.", "ftps://", "sftp://", "smb://", "nfs://", "ftp://", "dav://", "news:", "telnet://", "imap:", "rtsp://", "urn:", "pop:", "sip:", "sips:", "tftp:", "btspp://", "btl2cap://", "btgoep://", "tcpobex://", "irdaobex://", "file://", "urn:epc:id:", "urn:epc:tag:", "urn:epc:pat:", "urn:epc:raw:", "urn:epc:", "urn:nfc:"];

export interface NdefListenerOptions {
  /**
   * iOS only (for now).
   * Default false.
   */
  stopAfterFirstRead?: boolean;
  /**
   * On iOS the scan UI can show a scan hint (fi. "Scan a tag").
   * By default no hint is shown.
   */
  scanHint?: string;
}

export interface TextRecord {
  /**
   * String of text to encode.
   */
  text: string;
  /**
   * ISO/IANA language code. Examples: 'fi', 'en-US'.
   * Default 'en'.
   */
  languageCode?: string;
  /**
   * Default [].
   */
  id?: Array<number>;
}

export interface UriRecord {
  /**
   * String representing the uri to encode.
   */
  uri: string;
  /**
   * Default [].
   */
  id?: Array<number>;
}

export interface WriteTagOptions {
  textRecords?: Array<TextRecord>;
  uriRecords?: Array<UriRecord>;
}

export interface NfcTagData {
  id?: Array<number>;
  techList?: Array<string>;
}

export interface NfcNdefRecord {
  id: Array<number>;
  tnf: number;
  type: number;
  payload: string;
  payloadAsHexString: string;
  payloadAsStringWithPrefix: string;
  payloadAsString: string;
}

export interface NfcNdefData extends NfcTagData {
  message: Array<NfcNdefRecord>;
  /**
   * Android only
   */
  type?: string;
  /**
   * Android only
   */
  maxSize?: number;
  /**
   * Android only
   */
  writable?: boolean;
  /**
   * Android only
   */
  canMakeReadOnly?: boolean;
}

export interface OnTagDiscoveredOptions {
  /**
   * On iOS the scan UI can show a message (fi. "Scan a tag").
   * By default no message is shown.
   */
  message?: string;
}

export interface NfcApi {
  available(): Promise<boolean>;
  enabled(): Promise<boolean>;
  writeTag(arg: WriteTagOptions): Promise<any>;
  eraseTag(): Promise<any>;
  /**
   * Set to null to remove the listener.
   */
  setOnTagDiscoveredListener(callback: (data: NfcTagData) => void): Promise<any>;
  /**
   * Set to null to remove the listener.
   */
  setOnNdefDiscoveredListener(callback: (data: NfcNdefData) => void, options?: NdefListenerOptions): Promise<any>;
}
