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
  type: string;
  payload: string;
  payloadAsHexString: string;
  payloadAsStringWithPrefix: string;
  payloadAsString: string;
}

export interface NfcNdefData extends NfcTagData {
  type: string;
  maxSize: number;
  writable: boolean;
  message: Array<NfcNdefRecord>;
  canMakeReadOnly: boolean;
}

export interface NfcApi {
  available(): Promise<boolean>;
  enabled(): Promise<boolean>;
  writeTag(arg: WriteTagOptions): Promise<any>;
  eraseTag(): Promise<any>;
  /**
   * Set to null to remove the listener.
   */
  setOnTagDiscoveredListener(arg: (data: NfcTagData) => void): Promise<any>;
  /**
   * Set to null to remove the listener.
   */
  setOnNdefDiscoveredListener(arg: (data: NfcNdefData) => void): Promise<any>;
}
