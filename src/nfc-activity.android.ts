import { setActivityCallbacks, AndroidActivityCallbacks } from "tns-core-modules/ui/frame";
import * as application from "tns-core-modules/application";
import { nfcIntentHandler } from "./";

@JavaProxy("com.tns.NativeScriptNfcActivity")
class Activity extends android.support.v7.app.AppCompatActivity {
  private _callbacks: AndroidActivityCallbacks;

  public onCreate(savedInstanceState: android.os.Bundle): void {
    if (!this._callbacks) {
      setActivityCallbacks(this);
    }
    this._callbacks.onCreate(this, savedInstanceState, super.onCreate);
  }

  public onSaveInstanceState(outState: android.os.Bundle): void {
    this._callbacks.onSaveInstanceState(this, outState, super.onSaveInstanceState);
  }

  public onStart(): void {
    this._callbacks.onStart(this, super.onStart);
  }

  public onStop(): void {
    this._callbacks.onStop(this, super.onStop);
  }

  public onDestroy(): void {
    this._callbacks.onDestroy(this, super.onDestroy);
  }

  public onBackPressed(): void {
    this._callbacks.onBackPressed(this, super.onBackPressed);
  }

  public onRequestPermissionsResult(requestCode: number, permissions: any, grantResults: any): void {
    this._callbacks.onRequestPermissionsResult(this, requestCode, permissions, grantResults, undefined /*TODO: Enable if needed*/);
  }

  public onActivityResult(requestCode: number, resultCode: number, data: android.content.Intent): void {
    this._callbacks.onActivityResult(this, requestCode, resultCode, data, super.onActivityResult);
  }

  public onNewIntent(intent: android.content.Intent): void {
    super.onNewIntent(intent);
    const activity = application.android.foregroundActivity || application.android.startActivity;
    if (activity) {
      activity.setIntent(intent);
      nfcIntentHandler.savedIntent = intent;
      nfcIntentHandler.parseMessage();
    }
  }
}
