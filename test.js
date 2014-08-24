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
var async = require('async');

function resultPrinter(command, label) {
  return function (cb) {
    function printResult(err, result) {
      if (err) {
        console.log('(%s) Error: ', label, err);
        cb(err);
        return;
      }
      console.log('(%s) Result: ', label, result);
      cb();
    }
    command(printResult);
  };
}

nfc.open(function (err, dev) {
  console.log('Opened:', err, dev);
  async.series([
    resultPrinter(function (cb) {
      dev.setLedAndBuzzer({ red: true,
                            green: false,
                            blinkDuration: 500,
                            blinkDutyCycle: 0.6,
                            blinkCount: 3,
                            buzzer: true },
                          cb);
    }, "setLedAndBuzzer"),
    resultPrinter(function (cb) { dev.setCardBuzzer(true, cb) }, "buzzer"),
    resultPrinter(function (cb) { dev.getDeviceFirmwareVersion(cb) }, "devFW"),
    resultPrinter(function (cb) { dev.getChipFirmwareVersion(cb) }, "chipFW"),
    resultPrinter(function (cb) { dev.setPICC(cb) }, "setPICC"),
    ],
    function doneCb(err, result) {
      console.log('Done with async, sleeping 1.5s');
      setTimeout(function () { console.log('Done'); }, 1500);
    }
  );
});
