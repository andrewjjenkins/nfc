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

var devices = {
  0x072f : {
    0x2200 : {
      stringDescriptors : {
        1 : 'Vendor',
        2 : 'Device',
      },
      driver : 'acr122',
      interface : 0,
    },
  },
};

// Walk the devices list, converting any string like '0x1234' into an integer,
// because the USB module wants a plain int.
var hex = /^0x[a-fA-f0-9]+/;
function convertHex(obj) {
  Object.keys(obj).forEach(function (key) {
    // If this is a simple object, recurse.
    if ((!!obj[key]) && (obj[key].constructor === Object)) {
      convertHex(obj[key]);
    }
    if (hex.exec(key)) {
      var parsedKey = parseInt(key, 16);
      obj[parsedKey] = obj[key];
      delete obj[key];
    }
  });
}
convertHex(devices);

module.exports = devices;
