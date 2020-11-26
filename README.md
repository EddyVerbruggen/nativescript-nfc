# NativeScript NFC plugin

[![NPM version][npm-image]][npm-url]
[![Downloads][downloads-image]][npm-url]
[![Twitter Follow][twitter-image]][twitter-url]

[npm-image]: http://img.shields.io/npm/v/nativescript-nfc.svg
[npm-url]: https://npmjs.org/package/nativescript-nfc
[downloads-image]: http://img.shields.io/npm/dm/nativescript-nfc.svg
[twitter-image]: https://img.shields.io/twitter/follow/eddyverbruggen.svg?style=social&label=Follow%20me
[twitter-url]: https://twitter.com/eddyverbruggen

<img src="https://raw.githubusercontent.com/EddyVerbruggen/nativescript-nfc/master/screenshots/ios-demo-before-scan.PNG" width="180px" height="320px"/> <img src="https://raw.githubusercontent.com/EddyVerbruggen/nativescript-nfc/master/screenshots/ios-demo-after-scan.PNG" width="180px" height="320px"/> <img src="https://raw.githubusercontent.com/EddyVerbruggen/nativescript-nfc/master/screenshots/android-demo.png" width="180px" height="320px"/>

## Installation

From the command prompt go to your app's root folder and execute:

### NativeScript Version 7+:

```bash
ns plugin add nativescript-nfc
```

### NativeScript Version 6 and below:

```bash
tns plugin add nativescript-nfc@4.1.0
```

## iOS Setup

iOS requires you to enable 'NFC Tag Reading' for your App ID [here](https://developer.apple.com/account/ios/identifier/bundle).

Also, add this to your `App_Resources/iOS/app.entitlements` (mind the name!) file:

```xml
<key>com.apple.developer.nfc.readersession.formats</key>
<array>
	<string>NDEF</string>
</array>
```

The [demo app](demo) has this:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>com.apple.developer.nfc.readersession.formats</key>
	<array>
		<string>NDEF</string>
	</array>
</dict>
</plist>
```

## Android Setup

> ⚠️ Since plugin version 4.0.0 this section is no longer needed, but you'll HAVE to run NativeScript 5.4.0 or newer. If you're using an older NativeScript, please stick to a plugin version < 4.0.0.

Update the `activity` entry in your `App_Resources/Android/AndroidManifest.xml` file:

```xml
<activity
        android:name="com.tns.NativeScriptNfcActivity"
        android:label="@string/title_activity_kimera"
        android:configChanges="keyboardHidden|orientation|screenSize">
```

So replace `com.tns.NativeScriptActivity` with `com.tns.NativeScriptNfcActivity`.

#### Webpack (again, no longer needed from plugin version 4.0.0)

If you're using Webpack to bundle your app you'll need to add 1 line of configuration in case you're targeting Android.

- Open `webpack.config.js` (it's in the root of your project).
- Look for an Array named `appComponents`, which likely contains stuff like `"tns-core-modules/ui/frame"`.
- Add `resolve(__dirname, "node_modules/nativescript-nfc/nfc-activity.android.js")` [as shown here](https://github.com/EddyVerbruggen/nativescript-nfc/blob/6dfa0ff4f77cab5ab7f494ac3055f728ce51d131/demo/webpack.config.js#L17).

## Demo app (those screenshots above)

Want to dive in quickly? Check out [the demo](https://github.com/EddyVerbruggen/nativescript-nfc/tree/master/demo)!

You can run the demo app from the root of the project by typing `npm run demo.ios.device` or `npm run demo.android`.

> [This is what it looks like in action on iOS](https://twitter.com/eddyverbruggen/status/899617497741185025)!

## API

### `available`

Not all devices have an NFC chip we can tap in to (and on iOS you need to build with Xcode 9+), so check this beforehand:

##### JavaScript

```js
// require the plugin
var Nfc = require("nativescript-nfc").Nfc;

// instantiate the plugin
var nfc = new Nfc();

nfc.available().then(function (avail) {
  console.log(avail ? "Yes" : "No");
});
```

##### TypeScript

```typescript
// require the plugin
import { Nfc } from "nativescript-nfc";

// instantiate the plugin
let nfc = new Nfc();

nfc.available().then(avail => {
  console.log(avail ? "Yes" : "No");
});
```

### `enabled`

A device may have an NFC chip, but it needs to be turned on ✅ in order to be available for this plugin. So if `available` returns `true` and `enabled` returns `false` you should prompt the user to turn NFC on in the device settings.

##### JavaScript

```js
nfc.enabled().then(function (on) {
  console.log(on ? "Yes" : "No");
});
```

##### TypeScript

```typescript
nfc.enabled().then(on => {
  console.log(on ? "Yes" : "No");
});
```

### `setOnNdefDiscoveredListener`

You may want to get notified when an Ndef tag was discovered. You can pass in a callback function that gets invoked when that is the case.

Note that blank/erased NFC tags are not returned here, but through `setOnTagDiscoveredListener` instead.

See the [definition of NfcNdefData](https://github.com/EddyVerbruggen/nativescript-nfc/blob/master/nfc.common.d.ts#L27-L33) to learn what is returned to the callback function.

For iOS you can pass in these options (see the TypeScript example below):

- `stopAfterFirstRead: boolean` (default `false`): don't continue scanning after a tag was read.
- `scanHint: string` (default `undefined`): Show a little hint in the scan UI.

##### JavaScript

```js
nfc
  .setOnNdefDiscoveredListener(function (data) {
    // see the TypeScript example below
  })
  .then(function () {
    console.log("OnNdefDiscovered listener added");
  });
```

##### TypeScript

```typescript
import { NfcNdefData } from "nativescript-nfc";

nfc
  .setOnNdefDiscoveredListener(
    (data: NfcNdefData) => {
      // data.message is an array of records, so:
      if (data.message) {
        for (let m in data.message) {
          let record = data.message[m];
          console.log(
            "Ndef discovered! Message record: " + record.payloadAsString
          );
        }
      }
    },
    {
      // iOS-specific options
      stopAfterFirstRead: true,
      scanHint: "Scan a tag, baby!"
    }
  )
  .then(() => {
    console.log("OnNdefDiscovered listener added");
  });
```

You can pass in `null` instead of a callback function if you want to remove the listener.

##### TypeScript

```typescript
nfc.setOnNdefDiscoveredListener(null).then(() => {
  console.log("OnNdefDiscovered listener removed");
});
```

### `setOnTagDiscoveredListener` (Android only)

You may want to get notified when an NFC tag was discovered.
You can pass in a callback function that gets invoked when that is the case.

Note that Ndef tags (which you may have previously written data to) are not returned here,
but through `setOnNdefDiscoveredListener` instead.

See the [definition of NfcTagData](https://github.com/EddyVerbruggen/nativescript-nfc/blob/master/nfc.common.d.ts#L14-L17) to learn what is returned to the callback function.

##### JavaScript

```js
nfc
  .setOnTagDiscoveredListener(function (data) {
    console.log("Discovered a tag with ID " + data.id);
  })
  .then(function () {
    console.log("OnTagDiscovered listener added");
  });
```

##### TypeScript

```typescript
import { NfcTagData } from "nativescript-nfc";

nfc
  .setOnTagDiscoveredListener((data: NfcTagData) => {
    console.log("Discovered a tag with ID " + data.id);
  })
  .then(() => {
    console.log("OnTagDiscovered listener added");
  });
```

You can pass in `null` instead of a callback function if you want to remove the listener.

##### TypeScript

```typescript
nfc.setOnTagDiscoveredListener(null).then(() => {
  console.log("OnTagDiscovered listener removed");
});
```

### `writeTag` (Android only)

You can write to a tag as well with this plugin. At the moment you can write either plain text or a Uri. The latter will launch the browser on an Android device if the tag is scanned (unless an app handling Ndef tags itself is active at that moment, like an app with this plugin - so just close the app to test this feature).

Note that you can write multiple items to an NFC tag so the input is an object with Arrays of various types (`textRecord` and `uriRecord` are currently supported). See the [TypeScript definition](https://github.com/EddyVerbruggen/nativescript-nfc/blob/master/nfc.common.d.ts#L10-L13) for details, but these examples should get you going:

##### Writing 2 textRecords in JavaScript

```js
nfc
  .writeTag({
    textRecords: [
      {
        id: [1],
        text: "Hello"
      },
      {
        id: [3, 7],
        text: "Goodbye"
      }
    ]
  })
  .then(
    function () {
      console.log("Wrote text records 'Hello' and 'Goodbye'");
    },
    function (err) {
      alert(err);
    }
  );
```

##### Writing a uriRecord in TypeScript

```typescript
nfc
  .writeTag({
    uriRecords: [
      {
        id: [100],
        uri: "https://www.progress.com"
      }
    ]
  })
  .then(
    () => {
      console.log("Wrote Uri record 'https://www.progress.com");
    },
    err => {
      alert(err);
    }
  );
```

### `eraseTag` (Android only)

And finally, you can erase all content from a tag if you like.

##### JavaScript

```js
nfc.eraseTag().then(function () {
  console.log("Tag erased");
});
```

##### TypeScript

```typescript
nfc.eraseTag().then(() => {
  console.log("Tag erased");
});
```

## Tips

### Writing to an empty tag

You first need to "discover" it with `setOnTagDiscoveredListener` (see below). While you're still "near" the tag you can call `writeTag`.

### Writing to a non-empty tag

Same as above, but discovery is done through `setOnNdefDiscoveredListener`.

## Future work

- Peer to peer communication between two NFC-enabled devices.
- Support for writing other types in addition to 'text' and 'uri'.
