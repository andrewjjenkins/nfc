#!/usr/bin/env bash
cd libnfc
autoreconf -is
./configure --enable-static --disable-shared --with-pic
make
