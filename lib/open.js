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

var usb = require('usb');
var async = require('async');
var devices = require('./devices');
var util = require('util');
var winston = require('winston');

// FIXME(andrew): This should be an option that's passed into openNfc.
var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      colorize: true
    })
  ],
});

function usbDeviceOpener(nfc, devString) {
  return function (cb) {
    // Appears there is only a synchronous open exposed in the API.
    try {
      nfc.dev.open();
    } catch (e) {
      logger.info('Failed to open %s:', devString, e);
      cb(e);
    }
    cb();
  };
}

function usbDeviceResetter(nfc, devString) {
  return function (cb) {
    nfc.dev.reset(function(err) {
      if (err) {
        logger.warn('Failed to reset %s:', devString, e);
      }
      cb(err);
    });
  };
}

function deviceInfoGetter(nfc, properties) {
  return function getDeviceInfo(cb) {
    function makeInfoDecorator(index, property) {
      return function (cb) {
        nfc.dev.getStringDescriptor(index, function (err, data) {
          if (err) {
            logger.warn('Failed to get %s from %s:', property,
              devString, err);
            cb(err);
            return;
          }
          nfc[property] = data;
          cb();
        });
      };
    }
    stringDescriptorGetters = [];
    Object.keys(properties.stringDescriptors).forEach(function (index) {
      stringDescriptorGetters.push(
        makeInfoDecorator(index, properties.stringDescriptors[index])
      );
    });
    async.series(stringDescriptorGetters, function (err, data) {
      if (err) {
        logger.warn('Failed to enumerate all descriptors');
        cb(err);
        return;
      }
      cb(null, nfc);
    });
  };
}

function openInterface(nfc, intfIndex, cb) {
  var intf = nfc.dev.interface(intfIndex);
  if (!intf) {
    cb(new Error('Could not get interface %d', intfIndex));
    return;
  }

  intf.endpoints.forEach(function (ep, index) {
    if (ep.transferType === usb.LIBUSB_TRANSFER_TYPE_BULK) {
      if (ep.direction === 'in') {
        logger.debug('Using interface %d endpoint %d as bulk in',
          intfIndex, ep.address);
        nfc.in = ep;
      } else if (ep.direction === 'out') {
        logger.debug('Using interface %d endpoint %d as bulk out',
          intfIndex, ep.address);
        nfc.out = ep;
      } else {
        logger.info('Unknown bulk endpoint type %d:', ep.address, ep);
      }
    }
  });
  if (!nfc.out || !nfc.in) {
    cb(new Error('Failed to get bulk in and out endpoints'));
    return;
  }

  // FIXME: Alternate setting?

  // Looks like this is only synchronous
  try {
    intf.claim();
  } catch (err) {
    cb(err);
    return;
  }
  cb();
}

function driverSetupper(nfc, properties) {
  var driverName = properties.driver;
  return function (cb) {
    try {
      var driver = require('./devices/' + driverName);
      driver.init(nfc, properties, cb);
    } catch (e) {
      throw e;
      cb(new Error('Failed to load driver ' + driverName + ':' + e));
      return;
    }
  };
}

function openNfc(cb) {
  // Set once we successfully open and init an NFC reader.
  var openedNfc;

  function checkDevOpened(devOpened) {
    if (devOpened) {
      cb(null, openedNfc);
    } else {
      cb(new Error('Could not open any NFC device'));
    }
  }

  function tryEachDevice(vendor, vendorId, cb) {
    async.some(Object.keys(vendor),
      function tryOpenDevice(deviceId, cb) {
        var devString = util.format('%d:%d (0x%s:0x%s)',
                                    vendorId,
                                    deviceId,
                                    parseInt(vendorId).toString(16),
                                    parseInt(deviceId).toString(16));
        var properties = vendor[deviceId];
        var dev = usb.findByIds(vendorId, deviceId);
        var nfc;
        if (!dev) {
          logger.debug('Failed to find %s', devString);
          cb(false);
          return;
        }
        var nfc = {dev: dev, lastSequenceSent: 0};
        async.series([
          usbDeviceOpener(nfc, devString),
          usbDeviceResetter(nfc, devString),
          deviceInfoGetter(nfc, properties),
          driverSetupper(nfc, properties),
        ], function (err, results) {
          if (err) {
            cb(false);
          } else {
            openedNfc = results[results.length - 1];
            cb(true);
          }
        });
      },
      function (devOpened) {
        cb(devOpened);
      }
    );
  }
  function tryEachVendor(vendors, cb) {
    async.some(Object.keys(vendors),
        function tryVendor(vendorId) {
          tryEachDevice(vendors[vendorId], vendorId, cb);
        },
        cb);
  }
  tryEachVendor(devices, checkDevOpened);
}

module.exports = {
  open: openNfc,
  openInterface: openInterface,
};

