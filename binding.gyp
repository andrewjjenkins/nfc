{
  "targets": [ {
      "target_name": "nfc",
      "sources": [ "src/nfc.cc",
                   "src/context.cc" ],
      "link_settings": {
          "libraries": [ '../libnfc/libnfc/.libs/libnfc.a', '-lusb' ]
      },
      "include_dirs" : [ "libnfc/include" ]
  } ]
}
