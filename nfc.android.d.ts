import { NfcApi, NfcTagData, NfcNdefData, WriteTagOptions } from "./nfc.common";
export declare class Nfc implements NfcApi {
    private pendingIntent;
    private intentFilters;
    private techLists;
    constructor();
    available(): Promise<boolean>;
    enabled(): Promise<boolean>;
    setOnTagDiscoveredListener(arg: (data: NfcTagData) => void): Promise<any>;
    setOnNdefDiscoveredListener(arg: (data: NfcNdefData) => void): Promise<any>;
    eraseTag(): Promise<any>;
    writeTag(arg: WriteTagOptions): Promise<any>;
    private writeNdefMessage(message, tag);
    private jsonToNdefRecords(input);
    private stringToBytes(input);
}
