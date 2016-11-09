export interface TextRecord {
    text: string;
    languageCode?: string;
    id?: Array<number>;
}
export interface UriRecord {
    uri: string;
    id?: Array<number>;
}
export interface WriteTagOptions {
    textRecords?: Array<TextRecord>;
    uriRecords?: Array<UriRecord>;
}
export interface NfcTagData {
    id: Array<number>;
    techList?: Array<string>;
}
export interface NfcApi {
    available(): Promise<boolean>;
    enabled(): Promise<boolean>;
    setOnTagDiscoveredListener(arg: (data: NfcTagData) => void): Promise<any>;
    writeTag(arg: WriteTagOptions): Promise<any>;
    eraseTag(): Promise<any>;
}
export declare class Common implements NfcApi {
    available(): Promise<boolean>;
    enabled(): Promise<boolean>;
    setOnTagDiscoveredListener(arg: (data: NfcTagData) => void): Promise<any>;
    stopListening(): Promise<any>;
    writeTag(arg: WriteTagOptions): Promise<any>;
    eraseTag(): Promise<any>;
}
