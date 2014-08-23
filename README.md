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

## API (ACR122)

Devices have device-specific APIs.  Currently, the only supported device is the
ACR122.

### acr122.powerOn(cb)

Sends a command to power on the device.  This is automatically done as part of
the device opening and initialization.  You only have to call it if you power
down the device.

### acr122.setLedAndBuzzer(options, cb)
### acr122.setLed(options, cb)

Turns the red and/or green LEDs on and off, and optionally blinks them along
with the buzzer.  There are two modes: blinking mode and non-blinking mode.
Non-blinking mode just turns the LEDs on and off; to use non-blinking mode,
don't pass any of the blink-related options.  Blinking mode will blink the LEDs
and optionally the buzzer according to the options, and then stop with the LEDs
and buzzer off.

Options:

- `red`: Turn the red LED on (non-blinking mode), or blink the red LED
  (blinking mode).  Both `red` and `green` can be set.
- `green`: Turn the green LED on (non-blinking mode), or blink the green LED
  (blinking mode).  Both `red` and `green` can be set.
- `blinkDuration`: Duration to blink the LED in milliseconds, precision is
  100ms.  Minimum duration is 100ms.
- `blinkDutyCycle`: Proportion of the `blinkDuration` that the LEDs should be
  on and (optionally) the buzzer buzzing.  Between 0 and 1, defaults to 0.5
(50%).
- `blinkCount`: Number of times to repeat blink.  Defaults to 2.
- `buzzer`: Sound the buzzer when blinking.

Example of turning the red LED on forever:

    device.setLed({red: true }, cb);

Example of blinking the red and green LEDs (making a yellow light) 3 times,
with 300 ms on and 200 ms off, with the buzzer sounding:

    device.setLedAndBuzzer({red: true, green: true, blinkDuration: 500,
                            blinkDutyCycle: 0.6, blinkCount: 3, buzzer: true });

### acr122.getFirmwareVersion(cb)

Reads the firmware version from the ACR122 device and delivers it to the
callback as an ASCII string.

    device.getFirmwareVersion(function (err, version) {
      console.log('Version:', version); // Version: ACR122U213

### acr122.setCardBuzzer(on, cb)

If `on` is truthy, tells the ACR122 to buzz the buzzer when a card is near and
it is ready to read.

### acr122.setPICC([options], cb)

Sets the PICC mode to start polling cards from the reader.

Options:

- `auto`: Enable auto PICC polling (default: `true`)
- `autoAts`: Automatically issue ATS requests whenever an ISO14443-4 Type A tag
  is activated.  If enabled, prevents reading MiFARE tags.  Default: `false`.
- `pollingInterval`: Polling interval in milliseconds; only 250ms and 500ms are
  supported (default: `250`).
- `felica424k`: Detect FeliCa 424K tags (default: `true`).
- `felica424k`: Detect FeliCa 212K tags (default: `true`).
- `topaz`: Detect topaz tags (default: `true`).
- `iso14443B`: Detect ISO14443 Type B tags (default: `true`).
- `iso14443A`: Detect ISO14443-4 Type A tags (default: `true`).  Must be
  `true`, and `autoAts` must be `false`, for reading MiFARE tags.

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
