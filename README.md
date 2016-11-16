# NativeScript NFC plugin

## Installation
From the command prompt go to your app's root folder and execute:

```
tns plugin add nativescript-nfc
```

## Demo app
Want to dive in quickly? Check out [the demo](demo)! Otherwise, continue reading.

You can run the demo app from the root of the project by typing `npm run demo.ios.device` or `npm run demo.android`.

<img src="https://raw.githubusercontent.com/EddyVerbruggen/nativescript-nfc/master/screenshots/android-demo.png" width="360px"/>

## API

### `available`
Not all devices have an NFC chip we can tap in to. iPhones for instance 😕 .. so check this beforehand:

##### JavaScript
```js
// require the plugin
var Nfc = require("nativescript-nfc").Nfc;

// instantiate the plugin
var nfc = new Nfc();

nfc.available().then(
  function(avail) {
    console.log(avail ? "Yes" : "No");
  }
);
```

##### TypeScript
```js
// require the plugin
import {Nfc} from "nativescript-nfc";

// instantiate the plugin
let nfc = new Nfc();

nfc.available().then((avail) => {
    console.log(avail ? "Yes" : "No");
});
```

### `enabled`
A device may have an NFC chip, but it needs to be turned on ✅ in order to be available for this plugin. So if `available` returns `true` and `enabled` returns `false` you should prompt the user to turn NFC on in the device settings.

##### JavaScript
```js
nfc.enabled().then(
  function(on) {
    console.log(on ? "Yes" : "No");
  }
);
```

##### TypeScript
```js
nfc.enabled().then((on) => {
    console.log(on ? "Yes" : "No");
});
```

### `setOnTagDiscoveredListener`
You may want to get notified when an NFC tag was discovered.
You can pass in a callback function that gets invoked when that is the case.

Note that Ndef tags (which you may have previously written data to) are not returned here,
but through `setOnNdefDiscoveredListener` instead.

See the [definition of NfcTagData](https://github.com/EddyVerbruggen/nativescript-nfc/blob/master/nfc.common.d.ts#L14-L17) to learn what is returned to the callback function.

##### JavaScript
```js
nfc.setOnTagDiscoveredListener(function(data) {
  console.log("Discovered a tag with ID " + data.id);
}).then(
  function() {
    console.log("OnTagDiscovered listener added");
  }
);
```

##### TypeScript
```js
import {NfcTagData} from "nativescript-nfc";

nfc.setOnTagDiscoveredListener((data: NfcTagData) => {
  console.log("Discovered a tag with ID " + data.id);  
}).then(() => {
    console.log("OnTagDiscovered listener added");
});
```

You can pass in `null` instead of a callback function if you want to remove the listener.

##### TypeScript
```js
nfc.setOnTagDiscoveredListener(null).then(() => {
    console.log("OnTagDiscovered listener removed");
});
```

### `setOnNdefDiscoveredListener`
You may want to get notified when an Ndef tag was discovered.
You can pass in a callback function that gets invoked when that is the case.

Note that blank/erased NFC tags are not returned here, but through `setOnTagDiscoveredListener` instead.

See the [definition of NfcNdefData](https://github.com/EddyVerbruggen/nativescript-nfc/blob/master/nfc.common.d.ts#L27-L33) to learn what is returned to the callback function.

##### JavaScript
```js
nfc.setOnNdefDiscoveredListener(function(data) {
    // see the TypeScript example below
}).then(
  function() {
    console.log("OnNdefDiscovered listener added");
  }
);
```

##### TypeScript
```js
import {NfcNdefData} from "nativescript-nfc";

nfc.setOnNdefDiscoveredListener((data: NfcNdefData) => {
  // data.message is an array of records, so:
  if (data.message) {
    for (let m in data.message) {
      let record = data.message[m];
      console.log("Ndef discovered! Message record: " + record.payloadAsString);
    }
  }
}).then(() => {
    console.log("OnNdefDiscovered listener added");
});
```

You can pass in `null` instead of a callback function if you want to remove the listener.

##### TypeScript
```js
nfc.setOnNdefDiscoveredListener(null).then(() => {
    console.log("OnNdefDiscovered listener removed");
});
```

### `writeTag`
You can write to a tag as well with this plugin. At the moment you can write either plain text or a Uri. The latter will launch the browser on an Android device if the tag is scanned (unless an app handling Ndef tags itself is active at that moment, like an app with this plugin - so just close the app to test this feature).

Note that you can write multiple items to an NFC tag so the input is an object with Arrays of various types (`textRecord` and `uriRecord` are currently supported). See the [TypeScript definition](https://github.com/EddyVerbruggen/nativescript-nfc/blob/master/nfc.common.d.ts#L10-L13) for details, but these examples should get you going:

##### Writing 2 textRecords in JavaScript
```js
nfc.writeTag({
    textRecords: [
        {
          id: [1],
          text: "Hello"
        },
        {
          id: [3,7],
          text: "Goodbye"
        }
    ]
}).then(function() {
    console.log("Wrote text records 'Hello' and 'Goodbye'");
}, function(err) {
    alert(err);
});
```

##### Writing a uriRecord in TypeScript
```js
nfc.writeTag({
    uriRecords: [
        {
          id: [100],
          uri: "https://www.progress.com"
        }
    ]
}).then(() => {
    console.log("Wrote Uri record 'https://www.progress.com");
}, (err) => {
    alert(err);
});
```

### `eraseTag`
And finally, you can erase all content from a tag if you like.

##### JavaScript
```js
nfc.eraseTag().then(
  function() {
    console.log("Tag erased");
  }
);
```

##### TypeScript
```js
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
* Peer to peer communication between two NFC-enabled devices.
* Support for writing other types in addition to 'text' and 'uri'.
