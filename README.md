# Calling `clock_time_get` from WebAssembly

A small WebAssembly Text program that uses the [WebAssembly System Interface](https://wasi.dev/) provided by NodeJS to call two native "OS" functions: `clock_time_get` and `fd_write`.

This basic application simply writes the raw CPU clock time as a hexadecimal string to standard out.
That said, the majority of code in this example is concerned with converting a little-endian `i64` into printable ASCII&hellip;  😃

## Prerequisites

Install the [WebAssembly Binary Toolkit](https://github.com/WebAssembly/wabt)

## Local Execution

1. Compile the WebAssembly Text program

    ```bash
    $ wat2wasm ./src/clock_time_get.wat -o ./bin/clock_time_get.wasm
    ```

    The file `clock_time_get.wasm` now exists in the `bin/` directory.

1. Run the program that executes this WASM module.
   You should see output similar to the following:

    ```bash
    $ npm run start

    > clock-time-get@1.1.0 start
    > node --experimental-wasi-unstable-preview1 ./server.mjs

    (node:60922) ExperimentalWarning: WASI is an experimental feature. This feature could change at any time
    (Use `node --trace-warnings ...` to show where the warning was created)
    174057f55779b2f0
    ```

    Notice that in order to make use of the NodeJS `WASI` library, the command line flag `--experimental-wasi-unstable-preview1` must be given.

1. If you wish to see the test output, uncomment the commented lines at the end of file `server.js` shown below:

   ```javascript
   startWasiTask(wasmFilePath)
     .then(wasmFns => {
       // wasmFns.test_i64ToHexStr(BigInt(testVal1))
       // wasmFns.test_i64ToHexStr(BigInt(testVal2))

       wasmFns.writeTimeNanos()
   })
   ```

## Coding

The WebAssembly Text [source code](./src/clock_time_get.wat) uses meaningful variable names and contains lots of explanatory comments.

Hopefully, this will make understanding the WebAssembly program flow almost entirely self-explanatory.
Its worth pointing out that the bulk of the coding in this module is concerned with translating the bytes of an `i64` value into an ASCII text string.
