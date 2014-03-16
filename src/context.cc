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

#include <string.h>

#include "context.hh"
#include "device.hh"
#include "util.hh"

#define UNWRAP_CONTEXT(args)                                                  \
  NfcContext *obj = ObjectWrap::Unwrap<NfcContext>((args).This());            \
  if (!obj->nfcContext_) {                                                    \
    return v8::ThrowException(v8::String::NewSymbol("NFC context dead"));     \
  };

v8::Persistent<v8::Function> NfcContext::constructor_;

NfcContext::NfcContext() : nfcContext_(NULL) {
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
  ERROR_UNLESS_CONSTRUCTOR_CALL(args);
  NfcContext *nfcContext = new NfcContext();
  nfcContext->Wrap(args.This());
  return args.This();
}

struct NfcOpenData {
  NfcContext *nfcContext;
  nfc_connstring connstring;
  v8::Persistent<v8::Function> doneCb;
  nfc_device *openedDev;
  // FIXME: Error string
};

v8::Handle<v8::Value> NfcContext::open(const v8::Arguments &args) {
  v8::HandleScope scope;
  UNWRAP_CONTEXT(args);

  if (!args[0]->IsString()) {
    return THROW_TYPE_ERROR("First argument must be string, "
                            "can be \"\" for any");
  }
  v8::String::AsciiValue connstringVal(args[0]);
  if (connstringVal.length() > NFC_BUFSIZE_CONNSTRING) {
    return THROW_TYPE_ERROR("First argument must be shorter than "
                            "NFC_BUFSIZE_CONNSTRING");
  }
  if (!args[1]->IsFunction()) {
    return THROW_TYPE_ERROR("Second argument must be callback");
  }
  v8::Handle<v8::Function> cb(v8::Handle<v8::Function>::Cast(args[1]));

  NfcOpenData *openData(new NfcOpenData);
  openData->nfcContext = obj;
  openData->connstring[0] = '\0'; // In case connstring is empty
  // Safe length because checked against NFC_BUFSIZE_CONNSTRING above
  strncpy(openData->connstring, *connstringVal, connstringVal.length());
  openData->doneCb = v8::Persistent<v8::Function>::New(cb);
  uv_work_t *req = new uv_work_t;
  req->data = openData;
  // NOTE(andrew): I think this should be env->event_loop() but env isn't
  // exposed publicly yet.  Is this intentional?  Do I need to manage my own
  // uv_loop?  For now, just use the default one, which node happens to turn.
  req->loop = uv_default_loop();
  req->work_cb = doOpen;
  req->after_work_cb = afterOpen;

  obj->Ref();

  if (uv_queue_work(uv_default_loop(), req, doOpen, afterOpen) < 0) {
    openData->doneCb.Dispose();
    delete openData;
    delete req;
    return THROW_RUN_ERROR("Failed to start open operation");
  }
  return args.This();
}

void NfcContext::doOpen(uv_work_t *req) {
  NfcOpenData *openData = reinterpret_cast<NfcOpenData *>(req->data);
  if (openData->connstring[0] == '\0') {
    openData->openedDev = nfc_open(openData->nfcContext->nfcContext(), NULL);
  } else {
    openData->openedDev = nfc_open(openData->nfcContext->nfcContext(),
                                   openData->connstring);
  }
}

void NfcContext::afterOpen(uv_work_t *req, int status) {
  v8::HandleScope scope;
  //FIXME: entering v8 context?

  NfcOpenData *openData = reinterpret_cast<NfcOpenData *>(req->data);
  if (openData->openedDev == NULL) {
    // FIXME: Get the error string
    v8::Handle<v8::Value> err(v8::String::
                              NewSymbol("Failed to open NFC device"));
    openData->doneCb->Call(openData->nfcContext->handle_, 1, &err);
    openData->doneCb.Dispose();
    openData->nfcContext->Unref();
    delete openData;
    return;
  }

  const int argc = 2;
  v8::Handle<v8::Value> argv[argc];
  argv[0] = v8::Null();
  argv[1] = NfcDevice::makeNewInstance(openData->nfcContext, openData->openedDev);
  openData->doneCb->Call(openData->nfcContext->handle_, argc, argv);
  openData->doneCb.Dispose();
  openData->nfcContext->Unref();
  delete openData;
}

