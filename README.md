# clock_time_get

A small WebAssembly Text program that calls the native "OS" function `clock_time_get` and writes the returned value to standard out using a WASI call to `fd_write`
