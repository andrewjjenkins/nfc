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

// See documentation for the protocol at:
// http://www.usb.org/developers/devclass_docs/DWG_Smart-Card_CCID_Rev110.pdf

var binary = require('binary');

var PKTBUFSIZE = 1024;

bits = {
  RDR_TO_PC_DATABLOCK: 0x80,
  RDR_TO_PC_SLOTSTATUS: 0x81,
  RDR_TO_PC_PARAMS: 0x82,
  RDR_TO_PC_ESCAPE: 0x83,
  RDR_TO_PC_DATARATE_AND_CLOCKFREQUENCY: 0x84,
  PC_TO_RDR_ICC_POWER_ON: 0x62,
  PC_TO_RDR_ICC_POWER_OFF: 0x63,
  PC_TO_RDR_GET_SLOT_STATUS: 0x65,
  PC_TO_RDR_XFRBLOCK: 0x6f,
}

function parseRdrToPCDataBlock(slice, parsed) {
  parsed.chainParameter = binary.parse(slice).word8('chainParameter')
                          .vars.chainParameter;
  parsed.data = slice.slice(1);
  return parsed;
}

function parseRdrToPCSlotStatus(slice, parsed) {
  parsed.clockStatus = binary.parse(slice).word8('clockStatus')
                       .vars.clockStatus;
  return parsed;
}

function parseRdrToPCParams(slice, parsed) {
  parsed.protoNum = binary.parse(slice).word8('protoNum')
                    .vars.protoNum;
  // FIXME(andrew): Parse T=0 and T=1 data types
  parsed.data = slice.slice(1);
  return parsed;
}

function parseRdrToPCEscape(slice, parsed) {
  // Byte 9 is reserved
  parsed.data = slice.slice(1);
  return parsed;
}

function parseRdrToPCDataRateAndClockFrequency(slice, parsed) {
  if (parsed.length < 8) {
    throw new Error('Data Rate and Clock Frequency response too short (' +
          parsed.length + ', expected 8)');
  }
  var vars = binary.parse(slice)
    .word8('reserved')
    .word32lu('clockFrequency')
    .word32lu('dataRate')
    .vars;
  parsed.clockFrequency = vars.clockFrequency;
  parsed.dataRate = vars.dataRate;
  return parsed;
}

function parseCcidPacket(buf) {
  var parsed = binary.parse(buf)
    .word8('ccid')
    .word32lu('length')
    .word8('slot')
    .word8('seq')
    .word8('status')
    .word8('error')
    .vars;

  if (parsed.ccid === bits.RDR_TO_PC_DATABLOCK) {
    parseRdrToPCDataBlock(buf.slice(9), parsed);
  } else if (parsed.ccid === bits.RDR_TO_PC_SLOTSTATUS) {
    parseRdrToPCSlotStatus(buf.slice(9), parsed);
  } else if (parsed.ccid === bits.RDR_TO_PC_PARAMS) {
    parseRdrToPCParams(buf.slice(9), parsed);
  } else if (parsed.ccid === bits.RDR_TO_PC_ESCAPE) {
    parseRdrToPCEscape(buf.slice(9), parsed);
  } else if (parsed.ccid === bits.RDR_TO_PC_DATARATE_AND_CLOCKFREQUENCY) {
    parseRdrToPCDataRateAndClockFrequency(buf.slice(9), parsed);
  } else {
    throw new Error('Unknown RDR_TO_PC message type ' + parsed.ccid);
  }
  return parsed;
}

function sendCcid(nfc, options, payload, cb) {
  var parsed;
  var seq = nfc.lastSequenceSent;
  nfc.lastSequenceSent++;

  // Payload is optional; some packets don't have payloads.
  var payloadLength;
  if (!cb) {
    payloadLength = 0;
    cb = payload;
  } else {
    payloadLength = payload.length;
  }

  if (arguments.length < 3 ||
      (!options.ccid && payloadLength == 0)) {
    throw new Error('Invalid usage of ccid.send(nfc, options, payload, cb)');
  }

  var pkt = new Buffer(10 + payloadLength);
  pkt.writeUInt8(options.ccid || bits.PC_TO_RDR_XFRBLOCK, 0);
  pkt.writeUInt32LE(payloadLength, 1);
  pkt.writeUInt8(options.slot || 0x00, 5);
  pkt.writeUInt8(seq, 6);
  pkt.writeUInt8(options.blockWait || 0x00, 7);
  pkt.writeUInt16LE(options.tpdu || 0, 8);
  if (payloadLength) {
    payload.copy(pkt, 10);
  }


  var outDone = false;
  var outDoneTimeout;
  nfc.in.transfer(PKTBUFSIZE, function (err, data) {
    if (err) {
      cb(err);
      return;
    }
    try {
      parsed = parseCcidPacket(data);
    } catch (err) {
      cb(err);
      return;
    }
    if (parsed.seq != seq) {
      cb(new Error('Sequence mismatch: ' + parsed.seq + '!=' + seq));
      return;
    }
    if (outDone) {
      cb(null, parsed);
    } else {
      outDoneTimeout = setTimeout(function () {
        cb(new Error('Out never completed, but got a packet'));
      });
    }
  });
  nfc.out.transfer(pkt, function (err) {
    if (outDoneTimeout) {
      clearTimeout(outDoneTimeout);
      if (err) {
        cb(err);
      } else {
        cb(null, parsed);
      }
    } else {
      outDone = true;
      if (err) {
        cb(err);
      }
    }
  });
}

module.exports = {
  parse: parseCcidPacket,
  send: sendCcid,
};

Object.keys(bits).forEach(function (key) {
  module.exports[key] = bits[key];
});
