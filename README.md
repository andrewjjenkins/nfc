nfc
===

A node module that uses libnfc to interface with NFC reader/writers.

Status
======

**UNDER DEVELOPMENT**.  It can blink LEDs and beep on ACR122 NFC
reader/writers, but there isn't much useful beyond that.  (See test.js)

It is also chatty, and will log to your console.

Usage
=====

```
sudo apt-get install libusb-dev
git clone https://github.com/andrewjjenkins/nfc
cd nfc
npm install
(plug in an NFC reader that's compatible, currently ACR122)
node test.js
```

## API

```
var nfc = require('nfc');
nfc.open(function (err, device) {
  if (err) {
    throw err;
  }
  console.log('Opened NFC device:', device);
  device.setLed({red: true}, function (err, data) { ... });
});
```

### nfc.open(cb)

Walk the list of devices (in lib/devices.js), trying to open each one.  If
one succeeds, call the callback with the opened device.  If none can be
successfully opened, call the callback with an error.

LICENSE
=======
The nfc node module, documentation, tests, and build scripts are licensed
under the MIT license:

> Copyright Andrew Jenkins <andrewjjenkins@gmail.com>
  
> Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
> The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.
  
> THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
