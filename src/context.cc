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

#include "context.hh"

#define UNWRAP_CONTEXT(args)                                                  \
  NfcContext *obj = ObjectWrap::Unwrap<NfcContext>((args).This());            \
  if (!obj->nfcContext_) {                                                    \
    return v8::ThrowException(v8::String::NewSymbol("NFC context dead"));     \
  };


v8::Persistent<v8::Function> NfcContext::constructor_;

NfcContext::NfcContext() : nfcContext_(NULL), nfcDevice_(NULL) {
  nfc_init(&nfcContext_);
}

NfcContext::~NfcContext() {
  if (nfcContext_) {
    nfc_exit(nfcContext_);
    nfcContext_ = NULL;
  }
}

void NfcContext::init(v8::Handle<v8::Object> exports) {
  v8::Local<v8::FunctionTemplate> tpl =
    v8::FunctionTemplate::New(newInstance);
  tpl->SetClassName(v8::String::NewSymbol("NfcContext"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);
  tpl->PrototypeTemplate()->
    Set(v8::String::NewSymbol("open"),
        v8::FunctionTemplate::New(open)->GetFunction());
  constructor_ = v8::Persistent<v8::Function>::New(tpl->GetFunction());
  exports->Set(v8::String::NewSymbol("Context"), constructor_);
}

v8::Handle<v8::Value> NfcContext::newInstance(const v8::Arguments &args) {
  v8::HandleScope scope;

  if (!args.IsConstructCall()) {
    return v8::ThrowException(v8::String::New("Not called as constructor"));
  }

  NfcContext *nfcContext = new NfcContext();
  nfcContext->Wrap(args.This());
  return args.This();
}

v8::Handle<v8::Value> NfcContext::open(const v8::Arguments &args) {
  v8::HandleScope scope;
  UNWRAP_CONTEXT(args);

  if (obj->nfcDevice_) {
    return v8::ThrowException(
      v8::String::NewSymbol("Only one NFC device can be opened"));
  }

  // FIXME: Non-blocking
  obj->nfcDevice_ = nfc_open(obj->nfcContext_, NULL);
  if (obj->nfcDevice_ == NULL) {
    // FIXME: self.emit('error', ...)
    return v8::ThrowException(
      v8::String::NewSymbol("Unable to open NFC device"));
  }

  return args.This();
}

