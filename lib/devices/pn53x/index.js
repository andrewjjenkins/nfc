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

// See documentation:
// http://www.nxp.com/documents/user_manual/157830_PN533_um080103.pdf

var ccid = require('../../ccid');
var binary = require('binary');

var bits = {
  FIRMWARE_SUPPORTS_ISO18092: 0x04,
  FIRMWARE_SUPPORTS_ISO14443B: 0x02,
  FIRMWARE_SUPPORTS_ISO14443A: 0x01,
  RATE_106_KBPS: 0x00,
  RATE_212_KBPS: 0x01,
  RATE_424_KBPS: 0x02,
  RATE_847_KBPS: 0x03,
  MODULATION_MIFARE_ISO14443: 0x00,
  MODULATION_FELICA: 0x10,
  MODULATION_ISO18092_ACTIVE: 0x01,
  MODULATION_JEWEL: 0x02,
};

function Pn53x(nfc) {
  this._nfc = nfc;
}

Pn53x.prototype.getChipFirmwareVersion = function(cb) {
  var pkt = new Buffer([
      0xd4,
      0x02,
  ]);
  function parseResult(err, result) {
    if (err) {
      cb(err);
      return;
    }
    var parsed = binary.parse(result.data)
      .word16be('d503')
      .word8('icRaw')
      .word8('verRaw')
      .word8('revRaw')
      .word8('supportRaw')
      .word16le('errorStatusRaw')
      .vars;
    var version = { raw: parsed };
    if (parsed.d503 != 0xd503) {
      // Pass 'version' along anyway even though we didn't parse it, because
      // this may be a pn53x that we've never seen before.
      cb(new Error('Received unexpected response to getChipFirmwareVersion (' +
              parsed.d503 + ', expected ' + 0xd503),
         version);
      return;
    }
    switch (parsed.icRaw) {
      case 0x33:
        version.ic = 'PN533';
        break;
      case 0x32:
        version.ic = 'PN532';
        break;
      case 0x31:
        version.ic = 'PN531';
        break;
      default:
        version.ic = 'UNKNOWN';
    }
    version.version = parsed.verRaw + '.' + parsed.revRaw;
    version.iso18092 = (parsed.supportRaw &
                        bits.FIRMWARE_SUPPORTS_ISO18092) ? true : false;
    version.iso18443B = (parsed.supportRaw &
                         bits.FIRMWARE_SUPPORTS_ISO14443B) ? true : false;
    version.iso18443A = (parsed.supportRaw &
                         bits.FIRMWARE_SUPPORTS_ISO14443A) ? true : false;
    cb(null, version);
  }
  this.writeChip(pkt, parseResult);
};

function convertRateByteToRate(rateByte) {
  if (rateByte == bits.RATE_106_KBPS) {
    return '106Kbps';
  } else if (rateByte == bits.RATE_212_KBPS) {
    return '212Kbps';
  } else if (rateByte == bits.RATE_424_KBPS) {
    return '424Kbps';
  } else if (rateByte == bits.RATE_847_KBPS) {
    return '847Kbps';
  } else {
    return 'Unknown';
  }
}

function convertModulationByteToModulation(modByte) {
  if (modByte == bits.MODULATION_MIFARE_ISO14443) {
    return 'MiFare/RFA/ISO14443-3A/ISO14443-3B/ISO18092 passive 106Kbps';
  } else if (modByte == bits.MODULATION_FELICA) {
    return 'FeliCa/ISO18092 passive 212/424 Kbps';
  } else if (modByte == bits.MODULATION_ISO18092_ACTIVE) {
    return 'ISO18092 active';
  } else if (modByte == bits.MODULATION_JEWEL) {
    return 'Innovision Jewel';
  } else {
    return 'Unknown';
  }
}

Pn53x.prototype.getGeneralStatus = function(cb) {
  var pkt = new Buffer([
      0xd4,
      0x04,
  ]);
  function parseResult(err, result) {
    var i;
    if (err) {
      cb(err);
      return;
    }
    console.log('About to parse:', result.data);
    var parsed = binary.parse(result.data)
      .word16be('d505')
      .word8('err')
      .word8('field')
      .word8('nbTg')
      .vars;
    var status = { raw: parsed, tags: [] };

    if (parsed.d505 != 0xd505) {
      cb(new Error('Received unexpected response to getGeneralStatus (' +
              parsed.d505 + ', expected ' + 0xd505),
         status);
      return;
    }

    //FIXME(andrew): Parse the error

    status.field = parsed.field ? true : false;

    for (i = 0; i < parsed.nbTg + 0; ++i) {
      var tagOffset = 5 + 3*i;
      var tagRaw = result.data.slice(tagOffset, tagOffset + 4);
      if (tagRaw.length < 4) {
        status.tags[i] = {};
        cb(new Error('Mismatch in tag count: ' + parsed.nbTg + ' reported, ' +
            i + ' found'),
           status);
        return;
      }
      var tag = {
        'raw' : binary.parse(tagRaw)
         .word8('tg')
         .word8('brRx')
         .word8('brTx')
         .word8('type')
         .vars,
      };
      tag.rxRate = convertRateByteToRate(tag.raw.brRx);
      tag.txRate = convertRateByteToRate(tag.raw.brTx);
      tag.type = convertModulationByteToModulation(tag.raw.type);
      status.tags[i] = tag;
    }
    cb(null, status);
  }
  this.writeChip(pkt, parseResult);
};

module.exports = {
  Pn53x: Pn53x,
};

Object.keys(bits).forEach(function (key) {
  module.exports[key] = bits[key];
});
