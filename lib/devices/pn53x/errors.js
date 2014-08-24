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

var errors = {
  ERROR_TIMEOUT: [ 0x01, 'Time Out, the target has not answered' ],
  ERROR_CRC: [ 0x02, 'A CRC error has been detected by the CIU' ],
  ERROR_PARITY: [ 0x03, 'A Parity error has been detected by the CIU' ],
  ERROR_COLLISION_BITCOUNT: [ 0x04, 'During an anti-collision/select operation (ISO/IEC14443-3 Type A and ISO/IEC18092 106 kbps passive mode), an erroneous Bit Count has been detected' ],
  ERROR_MIFARE_FRAMING: [ 0x05, 'Framing error during MIFARE operation' ],
  ERROR_COLLISION_BITCOLLISION: [ 0x06, 'An abnormal bit-collision has been detected during bit wise anti-collision at 106 kbps' ],
  ERROR_NOBUFS: [ 0x07, 'Communication buffer size insufficient'],
  ERROR_RFNOBUFS: [ 0x09, 'RF Buffer overflow has been detected by the CIU'],
  ERROR_ACTIVE_TOOSLOW: [ 0x0a, 'In active communication mode, the RF field has not been switched on in time by the counterpart (as defined in NFCIP-1 standard)'],
  ERROR_RFPROTO: [ 0x0b, 'RF Protocol error' ],
  ERROR_TOOHOT: [ 0x0d, 'Temperature error: the internal temperature sensor has detected overheating, and therefore has automatically switched off the antenna drivers' ],
  ERROR_INTERNAL_NOBUFS: [ 0x0e, 'Internal buffer overflow' ],
  ERROR_INVAL: [ 0x10, 'Invalid parameter (range, format...)' ],
  ERROR_DEP_INVALID_COMMAND: [ 0x12, 'DEP Protocol: The PN533 configured in target mode does not support the command received from the initiator (the command received is not one of the following: ATR_REQ, WUP_REQ, PSL_REQ, DEP_REQ, DSL_REQ, RLS_REQ)' ],
  ERROR_DEP_BADDATA: [ 0x13, 'DEP Protocol, MIFARE or ISO/IEC14443-4: The data format does not match to the specification.  Depending on the RF protocol used, it can be: Bad length of RF received frame, Incorrect value of PCB or PFB, Invalid or unexpected RF received frame, NAD or DID incoherence.' ],
  ERROR_MIFARE_AUTH: [ 0x14, 'MIFARE: Authentication error' ],
  ERROR_NOSECURE: [ 0x18, 'Target or Initiator does not support NFC Secure'],
  ERROR_I2CBUSY: [ 0x19, 'I2C bus line is Busy. A TDA transaction is on going' ],
  ERROR_UIDCHECKSUM: [ 0x23, 'ISO/IEC14443-3: UID Check byte is wrong' ],
  ERROR_DEPSTATE: [ 0x25, 'DEP Protocol: Invalid device state, the system is in a state which does not allow the operation' ],
  ERROR_HCIINVAL: [ 0x26, 'Operation not allowed in this configuration (host controller interface)' ],
  ERROR_CONTEXT: [ 0x27, 'This command is not acceptable due to the current context of the PN533 (Initiator vs. Target, unknown target number, Target not in the good state, ...)' ],
  ERROR_RELEASED: [ 0x29, 'The PN533 configured as target has been released by its initiator' ],
  ERROR_CARDSWAPPED: [ 0x2a, 'PN533 and ISO/IEC14443-3B only: the ID of the card does not match, meaning that the expected card has been exchanged with another one.' ],
  ERROR_NOCARD: [ 0x2b, 'PN533 and ISO/IEC14443-3B only: the card previously activated has disappeared.' ],
  ERROR_MISMATCH: [ 0x2c, 'Mismatch between the NFCID3 initiator and the NFCID3 target in DEP 212/424 kbps passive.' ],
  ERROR_OVERCURRENT: [ 0x2d, 'An over-current event has been detected' ],
  ERROR_NONAD: [ 0x2e, 'NAD missing in DEP frame' ],
};

module.exports = errors;
