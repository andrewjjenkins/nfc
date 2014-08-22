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

var ccid = require('../../ccid');

function powerOn(nfc, cb) {
  var powerOnPacket = new Buffer([
      0x62, // CCID
      0x00, 0x00, 0x00, 0x00, // Length
      0x00, // Slot
      0x00, // Sequence
      0x01, // Voltage (5V)
      0x00, 0x00, // Reserved
    ]);
  ccid.send(nfc, powerOnPacket, cb);
}

function redLedOn(nfc, cb) {
  var redLedOnPacket = new Buffer([
      0x6f, // CCID Type: XfrBlock
      0x09, 0x00, 0x00, 0x00, // Length
      0x00, // Slot
      0x00, // Seq
      0x00, // Block waiting timeout
      0x00, 0x00, // TPDU, reserved
      0xff, // Class
      0x00, // Ins
      0x40, // P1: LED State
      0x04, // P2: Turn on red LED
      0x04, // Lc
      0x02, // T1 duration (units of 100ms)
      0x03, // T2 duration (units of 100ms)
      0x02, // Repetition count
      0x01, // Buzzer on during T2
    ]);
  ccid.send(nfc, redLedOnPacket, cb);
}

function getFirmwareVersion(nfc, cb) {
  var getFirmwareVersionPacket = new Buffer([
      0x6f, // CCID
      0x05, 0x00, 0x00, 0x00, // Length
      0x00, // Slot
      0x00, // Seq
      0x00, // Block waiting timeout
      0xff, // Class
      0x00, // Ins
      0x48, // P1: Get Firmware Version
      0x00, // P2
      0x00, // Le
    ]);
  ccid.send(nfc, getFirmwareVersionPacket, cb);
}

module.exports = {
  powerOn: powerOn,
  redLedOn: redLedOn,
  getFirmwareVersion: getFirmwareVersion,
};
