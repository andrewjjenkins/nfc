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

#include <node.h>
#include <v8.h>
#include <nfc/nfc.h>

class NFC {
 public:
  static v8::Handle<v8::Value> version(const v8::Arguments &args);
};

v8::Handle<v8::Value> NFC::version(const v8::Arguments &args) {
  v8::HandleScope scope;
  const char *cVer = nfc_version();
  v8::Handle<v8::String> ver(v8::String::NewSymbol(cVer));
  return scope.Close(ver);
}

void init(v8::Handle<v8::Object> exports) {
  exports->Set(v8::String::NewSymbol("version"),
      v8::FunctionTemplate::New(NFC::version)->GetFunction());
}

NODE_MODULE(nfc, init)
