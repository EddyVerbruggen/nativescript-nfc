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

export interface NfcApi {
  available(): Promise<boolean>;
  enabled(): Promise<boolean>;
  startListening(): Promise<any>;
  stopListening(): Promise<any>;
  writeTag(arg: WriteTagOptions): Promise<any>;
  eraseTag(): Promise<any>;
}

export class Common implements NfcApi {
  public available(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(false);
    });
  };

  public enabled(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      resolve(false);
    });
  };

  public startListening(): Promise<any> {
    return new Promise((resolve, reject) => {
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
      resolve();
    });
  };

  public eraseTag(): Promise<any> {
    return new Promise((resolve, reject) => {
      resolve();
    });
  };
}