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
Not all devices have an NFC chip we can tap into. iPhones for instance.. so check this beforehand:

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
A device may have an NFC chip, but it needs to be turned on in order to be available for this plugin. So if `available` returns `true` and `enabled` returns `false` you should prompt the user to turn NFC on in the device settings.

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

Not that Ndef tags (which you may have previously written data to) are not returned here,
but through `setOnNdefDiscoveredListener` instead.

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

## Future work
* Peer to peer communication between two NFC enabled devices.
* Support for writing other types in addition to 'text' and 'uri'.