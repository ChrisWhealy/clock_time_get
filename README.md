# Calling `clock_time_get` from WebAssembly

A small WebAssembly Text program that uses the [WebAssembly System Interface](https://wasi.dev/) (WASI) to call two native "OS" functions: `clock_time_get` and `fd_write`.

This basic application simply writes the raw CPU clock time as a hexadecimal string to standard out.
That said, the majority of code in this example is concerned with converting a little-endian `i64` into printable ASCII&hellip;  😃

## Prerequisites

Install the [WebAssembly Binary Toolkit](https://github.com/WebAssembly/wabt)

## Local Execution

1. Clone this repo

    ```bash
    $ cd <some_development_directory>
    $ git clone https://github.com/ChrisWhealy/clock_time_get.git
    ```

1. Install the required NPM packages

    ```bash
    $ cd ./clock_time_get
    $ npm i
    ```

1. Compile the WebAssembly Text program

    ```bash
    $ wat2wasm ./src/clock_time_get.wat
    ```

    This will create the file `clock_time_get.wasm`

1. Run the NodeJS file `server.js` that executes this WASM module.
   You should see output similar to the following:

    ```bash
    $ node server.js
    00070041b44d076e
    ```

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
