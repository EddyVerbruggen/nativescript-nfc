import { Observable } from "data/observable";
export declare class HelloWorldModel extends Observable {
    message: string;
    private nfc;
    constructor();
    doCheckAvailable(): void;
    doCheckEnabled(): void;
    doStartListening(): void;
    doStopListening(): void;
    doWriteHello(): void;
    doWriteGoodbye(): void;
}
