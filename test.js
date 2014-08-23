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

var nfc = require('./lib/nfc');

nfc.open(function (err, dev) {
  console.log('Opened:', err, dev);
  dev.setLedAndBuzzer({ red: true,
                        green: false,
                        blinkDuration: 500,
                        blinkDutyCycle: 0.6,
                        blinkCount: 3,
                        buzzer: true }, function (err) {
    if (err) {
      console.log('Error blinking LED:', err);
    }
    dev.setCardBuzzer(true, function (err, result) {
      console.log('err: %s, result: %s', err, result);
      dev.getFirmwareVersion(function (err, version) {
        console.log('Version:', version);
        dev.setPICC(function (err, result) {
          console.log('Set PICC:', err, result);
          setTimeout(function () { console.log('timeout'); }, 5000);
        });
      });
    });
  });
});
