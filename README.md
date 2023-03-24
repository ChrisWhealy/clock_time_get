# Calling `clock_time_get` from WebAssembly

Generally speaking, the host environment can make any functionality avaliable to the WebAssembly guest module; however, the object of the exercise here is to call two "OS" level functions: `clock_time_get` and `fd_write`.

***IMPORTANT***<br>
The term "OS" has delberately been placed in quotation marks to indicate that the functions being called might not be implemented directly by the machine's operating system.
In fact, all WebAssembly knows is that its host environment has provided an implementation of these functions.
In one sense, how these functions have been implemented is really neither here nor there.

## WebAssembly System Interface (WASI)

Having just said that WebAssembly does not care how these external functions have been implemented, let me now slightly contradict myself...

The typical develpment scenario is that you will write your application in some high level language, such as Rust, then specify WebAssembly as your compilation target.

If your Rust program were compiled to some other target, then the compiled code would be typically be invoked directly by the operating, and all the operations within your program that interact with the operating system (such as opening/writing/closing files etc) would run as normal.

However, as soon as you make WebAssembly your compilation target, your program is immediately isolated (or "sand-boxed") from the host environment, and any access to parts of the system such as the filesystem or the network are explicitly blocked - unlss your WebAssembly program makes a specific request for such access.

This is where the [WebAssembly System Interface](https://wasi.dev/) is needed.
WASI is an emulation layer that provides all the functions an application (written say in Rust) would expect to call in the operating system.

NodeJS provides an out-of-the-box WASI implementation; however, in order to make use of this particular library, `node` must be invoked with the command line flag `--experimental-wasi-unstable-preview1`.

In a browser, multiple WASI emulation libraries have been writtem but to keep things simple, I have provided a minimal implementation of only the two WASI functions we are calling `clock_time_get` and `fd_write`.

## NodeJS Implementation

The values of the four system clocks as hexadecimal strings to standard out:

| Clock Id | Description
|---|---
| 0 | Realtime clock
| 1 | Monotonic clock
| 2 | Process CPU time
| 3 | Thread CPU time

## Browser Implementation

Only the value of the realtime system clock (id `0`) is written to both the browser's console and the browser screen.
This is because the browser must provide an emulation of all the WASI functions needed by the `.wasm` module, and in this case, only the realtime clock (clock id `0`) has been implemented.

## Prerequisites

Install the [WebAssembly Binary Toolkit](https://github.com/WebAssembly/wabt) and compile the WebAssembly Text program.

```bash
npm run build

> clock-time-get@1.1.0 build
> wat2wasm ./src/clock_time_get.wat -o ./bin/clock_time_get.wasm
```

The file `clock_time_get.wasm` now exists in the `./bin` directory.

## Local Execution &mdash; Server Side

```bash
npm run start

> clock-time-get@1.1.0 start
> node --experimental-wasi-unstable-preview1 ./server.mjs

(node:8547) ExperimentalWarning: WASI is an experimental feature. This feature could change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
Realtime clock   : 174f546271481168
Monotonic clock  : 000251a89dd61edc
Process CPU time : 0000000004137cd0
Thread CPU time  : 0000000003e41030
```

## Local Execution &mdash; Client Side

  Start the local Python3 HTTP server

``` bash
python3 noCacheHttpServer.py
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

Point your browser to <http://localhost:8080> and you will see the realtime clock value on both the browser screen and in the browser's console.

## Coding

The WebAssembly Text [source code](./src/clock_time_get.wat) uses meaningful variable names and contains lots of explanatory comments.

Hopefully, this will make understanding the WebAssembly program flow almost entirely self-explanatory.
Its worth pointing out that the bulk of the coding in this module is concerned with translating the bytes of an `i64` value into an ASCII text string.
