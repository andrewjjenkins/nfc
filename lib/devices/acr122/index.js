// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var async = require('async');
var ccid = require('../../ccid');
var open = require('../../open');

ACR122_LED_RED_ON = 0x01;
ACR122_LED_GREEN_ON = 0x02;
ACR122_LED_RED_SET = 0x04;
ACR122_LED_GREEN_SET = 0x08;
ACR122_LED_RED_BLINK_START_ON = 0x10;
ACR122_LED_GREEN_BLINK_START_ON = 0x20;
ACR122_LED_RED_BLINK = 0x40;
ACR122_LED_GREEN_BLINK = 0x80;
ACR122_LED_BUZZER_T1 = 0x01;
ACR122_LED_BUZZER_T2 = 0x02;

function Acr122(nfc) {
  this._nfc = nfc;
}

function init(nfc, properties, cb) {
  var acr = new Acr122(nfc);
  async.series([
    function (cb) { open.openInterface(nfc, properties.interface, cb); },
    function (cb) { acr.powerOn(cb); },
    ],
    function (err, results) {
      if (err) {
        cb(err);
      } else {
        cb(null, acr);
      }
    }
  );
}

Acr122.prototype.powerOn = function(cb) {
  ccid.send(this._nfc, { ccid: ccid.PC_TO_RDR_ICC_POWER_ON }, cb);
};

Acr122.prototype.setLedAndBuzzer = function(options, cb) {
  var stateControl = ACR122_LED_RED_SET | ACR122_LED_GREEN_SET;
  if (!options.blinkDuration) {
    if (options.red) {
      stateControl = stateControl | ACR122_LED_RED_ON;
    }
    if (options.green) {
      stateControl = stateControl | ACR122_LED_GREEN_ON;
    }
  } else {
    if (options.red) {
      stateControl = stateControl | ACR122_LED_RED_BLINK
        | ACR122_LED_RED_BLINK_START_ON;
    }
    if (options.green) {
      stateControl = stateControl | ACR122_LED_GREEN_BLINK
        | ACR122_LED_GREEN_BLINK_START_ON;
    }
  }

  var ledPacket = new Buffer([
      0xff, // Class
      0x00, // Ins
      0x40, // P1: LED State
      stateControl, // P2: User's desired state (updated below)
      0x04, // Lc
      // Next 4 bytes updated below.
      0x00, // T1 duration (units of 100ms)
      0x00, // T2 duration (units of 100ms)
      0x00, // Repetition count
      0x00, // Buzzer on during T2
    ]);

  if (options.blinkDuration) {
    var blinkBytes = ledPacket.slice(5);
    var blinkDuration = options.blinkDuration;
    var blinkDutyCycle = options.blinkDutyCycle || .5;
    var blinkCount = Math.floor(options.blinkCount) || 2;
    if (options.blinkDutyCycle >= 1 || options.blinkDutyCycle <= 0) {
      cb(new Error('Blink duty cycle must be between 0 and 1'));
      return;
    }
    if (options.blinkCount <= 0 || options.blinkCount > 255) {
      cb(new Error('Blink count must be between 0 and 256'));
    }
    if (options.blinkDuration < 100 || options.blinkDuration > 255*100) {
      // According to the driver docs, it's possible you could make longer
      // blinks as long as they fit after applying duty cycle; oh well.
      cb(new Error('Blink duration must be between 100ms and 25.5 seconds'));
      return;
    }
    var t1Duration = Math.floor(blinkDuration * blinkDutyCycle / 100);
    var t2Duration = Math.floor(blinkDuration * (1 - blinkDutyCycle) / 100);
    blinkBytes[0] = t1Duration;
    blinkBytes[1] = t2Duration;
    blinkBytes[2] = blinkCount;
    if (options.buzzer) {
      blinkBytes[3] = ACR122_LED_BUZZER_T1;
    }
  }
  console.log('LED packet:', ledPacket);
  ccid.send(this._nfc, { ccid: ccid.PC_TO_RDR_XFRBLOCK }, ledPacket, cb);
};
Acr122.prototype.setLed = Acr122.prototype.sedLedAndBuzzer;

Acr122.prototype.getFirmwareVersion = function(cb) {
  var getFirmwareVersionPacket = new Buffer([
      0xff, // Class
      0x00, // Ins
      0x48, // P1: Get Firmware Version
      0x00, // P2
      0x00, // Le
    ]);
  function parseResult(err, result) {
    if (err) {
      cb(err);
      return;
    }
    var version = result.data.toString('utf8');
    cb(null, version);
  }
  ccid.send(this._nfc, { ccid: ccid.PC_TO_RDR_XFRBLOCK },
            getFirmwareVersionPacket, parseResult);
};

module.exports = {
  init: init,
};
