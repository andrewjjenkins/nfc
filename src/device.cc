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

#include "device.hh"
#include "util.hh"

v8::Persistent<v8::Function> NfcDevice::constructor_;

NfcDevice::NfcDevice(NfcContext *c, nfc_device *d)
  : nfcContext_(c), nfcDevice_(d)
{}

NfcDevice::~NfcDevice() {
  nfc_close(nfcDevice_);
  nfcDevice_ = NULL;
}

void NfcDevice::init(v8::Handle<v8::Object> exports) {
  v8::Local<v8::FunctionTemplate> tpl =
    v8::FunctionTemplate::New(newInstance);
  tpl->SetClassName(v8::String::NewSymbol("NfcDevice"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);
  tpl->PrototypeTemplate()->
    Set(v8::String::NewSymbol("initiatorInit"),
        v8::FunctionTemplate::New(initiatorInit)->GetFunction());
  tpl->PrototypeTemplate()->
    Set(v8::String::NewSymbol("initiatorListPassiveTargets"),
        v8::FunctionTemplate::New(initiatorListPassiveTargets)->GetFunction());
  constructor_ = v8::Persistent<v8::Function>::New(tpl->GetFunction());
  //exports->Set(v8::String::NewSymbol("Device"), constructor_);
}

v8::Handle<v8::Value> NfcDevice::makeNewInstance(NfcContext *c, nfc_device *d) {
  v8::HandleScope scope;
  v8::Handle<v8::Object> obj(constructor_->NewInstance());
  NfcDevice *dev = new NfcDevice(c, d);
  dev->Wrap(obj);

  // NOTE(andrew): These could be ExternalStringResources for perf.
  obj->Set(v8::String::NewSymbol("name"),
           v8::String::New(nfc_device_get_name(dev->nfcDevice())));
  obj->Set(v8::String::NewSymbol("connstring"),
           v8::String::New(nfc_device_get_connstring(dev->nfcDevice())));

  return scope.Close(obj);
}

v8::Handle<v8::Value> NfcDevice::newInstance(const v8::Arguments &args) {
  ERROR_UNLESS_CONSTRUCTOR_CALL(args);
  return args.This();
}

v8::Handle<v8::Value> NfcDevice::initiatorInit(const v8::Arguments &args) {
  return THROW_UNIMPL_ERROR();
}

v8::Handle<v8::Value> NfcDevice::
initiatorListPassiveTargets(const v8::Arguments &args) {
  return THROW_UNIMPL_ERROR();
}
