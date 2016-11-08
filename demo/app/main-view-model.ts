import {Observable} from "data/observable";
import {Nfc} from "nativescript-nfc";

export class HelloWorldModel extends Observable {
  public message: string;
  private nfc: Nfc;

  constructor() {
    super();

    this.nfc = new Nfc();
    this.message = this.nfc.message;
  }
}