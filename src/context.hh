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

#ifndef CONTEXT_HH
#define CONTEXT_HH

#include <node.h>
#include <v8.h>
#include <nfc/nfc.h>

class NfcContext : public node::ObjectWrap {
 public:
  NfcContext();
  virtual ~NfcContext();
  static void init(v8::Handle<v8::Object> exports);

  nfc_context *nfcContext() const { return nfcContext_; }

 private:  
  // Javascript methods
  static v8::Handle<v8::Value> newInstance(const v8::Arguments &args);
  static v8::Handle<v8::Value> open(const v8::Arguments &args);

  // uv work methods
  static void doOpen(uv_work_t *req);
  static void afterOpen(uv_work_t *req, int status);

  // Singleton javascript helpers
  static v8::Persistent<v8::Function> constructor_;

  // State
  nfc_context *nfcContext_;
};

#endif // CONTEXT_HH
