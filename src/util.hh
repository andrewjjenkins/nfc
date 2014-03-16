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

#ifndef UTIL_HH
#define UTIL_HH

#include <node.h>
#include <v8.h>

// Error objects for passing to callbacks
#define RUN_ERROR(msg)                                                        \
  v8::Exception::Error(v8::String::NewSymbol(("NFC runtime error: " msg)))
#define TYPE_ERROR(msg)                                                       \
  v8::Exception::TypeError(v8::String::NewSymbol(("NFC type error: " msg)))
#define UNIMPL_ERROR()                                                        \
  v8::Exception::Error(v8::String::NewSymbol(("NFC unimplemented")))

// Throwing synchronous errors
#define THROW_RUN_ERROR(msg)      v8::ThrowException(RUN_ERROR(msg));
#define THROW_TYPE_ERROR(msg)     v8::ThrowException(TYPE_ERROR(msg));
#define THROW_UNIMPL_ERROR()      v8::ThrowException(UNIMPL_ERROR());

// Misc error helpers
#define ERROR_UNLESS_CONSTRUCTOR_CALL(args)                                   \
  if (!args.IsConstructCall()) {                                              \
    THROW_TYPE_ERROR("Not called as constructor");                            \
  }                                                                           \

#endif // UTIL_HH
