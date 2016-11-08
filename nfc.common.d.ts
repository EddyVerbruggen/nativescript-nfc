export interface TextRecord {
    text: string;
    languageCode?: string;
    id?: Array<number>;
}
export interface WriteTagOptions {
    textRecords?: Array<TextRecord>;
}
export interface NfcApi {
    available(): Promise<boolean>;
    enabled(): Promise<boolean>;
    startListening(): Promise<any>;
    stopListening(): Promise<any>;
    writeTag(arg: WriteTagOptions): Promise<any>;
    eraseTag(): Promise<any>;
}
export declare class Common implements NfcApi {
    available(): Promise<boolean>;
    enabled(): Promise<boolean>;
    startListening(): Promise<any>;
    stopListening(): Promise<any>;
    writeTag(arg: WriteTagOptions): Promise<any>;
    eraseTag(): Promise<any>;
}
