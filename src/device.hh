// Copyright Andrew Jenkins <andrewjjenkins@gmail.com>
//
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

#ifndef DEVICE_HH
#define DEVICE_HH

#include <node.h>
#include <v8.h>
#include <nfc/nfc.h>

class NfcContext;

class NfcDevice : public node::ObjectWrap {
 public:
  NfcDevice(NfcContext *c, nfc_device *d);
  virtual ~NfcDevice(); //FIXME free device
  static void init(v8::Handle<v8::Object> exports);

  static v8::Handle<v8::Value> makeNewInstance(NfcContext *c, nfc_device *d);

  NfcContext *parent() const { return nfcContext_; }

 private:  
  // Javascript methods
  static v8::Handle<v8::Value> newInstance(const v8::Arguments &args);
  static v8::Handle<v8::Value> initiatorInit(const v8::Arguments &args);
  static v8::Handle<v8::Value> initiatorListPassiveTargets(const v8::Arguments &args);

  // Singeton javascript helpers
  static v8::Persistent<v8::Function> constructor_;

  nfc_device *nfcDevice() const { return nfcDevice_; }

  // State
  NfcContext *nfcContext_;
  nfc_device *nfcDevice_;
};

#endif // DEVICE_HH
