# clock_time_get

A small WebAssembly Text program that calls the native "OS" function `clock_time_get` and writes the returned value to standard out using a WASI call to `fd_write`

To run this small demo, do the following

1. Clone this repo into some local development directory

    ```bash
    $ cd <some_development_directory>
    $ git clone https://github.com/ChrisWhealy/clock_time_get.git
    ```

1. Install the required packages

    ```bash
    $ npm i
    npm notice created a lockfile as package-lock.json. You should commit this file.
    npm WARN clock-time-get@1.0.0 No description

    added 8 packages from 7 contributors and audited 9 packages in 2.819s
    found 0 vulnerabilities
    ```

1. Run the WASM module, and you should see output similar to the following:

    ```bash
    $ node server.js 
    000036fadb30d49f
    ```

## Coding

Thw WebAssembly text [source code](./wasm_lib/clock_time_get.wat) contains lots of explanatory comments and (shock, horror!) meaningful variable names...

Hopefully, this will make the program flow almost entirely self-explanatory


## Known Issues

There is a discrepancy between the [documented interface to the WASI function `clock_time_get`](https://github.com/WebAssembly/WASI/blob/master/phases/snapshot/docs.md#-clock_time_getid-clockid-precision-timestamp---errno-timestamp) and the interface needed to make this program actually work

The docs say the interface should use the type declaration:

```WebAssemblyText
(type $__wasi-clockTimeFnType (func (param i32 i64) (result i64)))
(import "wasi_unstable" "clock_time_get" (func $wasi_unstable.clock_time_get (type $__wasi-clockTimeFnType)))
```

But I can only get it to work using:

```WebAssemblyText
(type $__wasi-clockTimeFnType (func (param i32 i64 i32) (result i32)))
(import "wasi_unstable" "clock_time_get" (func $wasi_unstable.clock_time_get (type $__wasi-clockTimeFnType)))
```

