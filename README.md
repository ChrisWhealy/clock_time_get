# Calling `clock_time_get` from WebAssembly

A small WebAssembly Text program that uses the [WebAssembly System Interface](https://wasi.dev/) (WASI) to call two native "OS" functions: `clock_time_get` and `fd_write`.

This basic application simply writes the CPU clock time in nanoseconds to standard out.

## Prequisites

The WebAssembly Text file `clock_time_get.wat` must be compiled into a WASM module.  Different tools are available for this, but two of the simplest are:

1. The `wat2wasm` command line tool found in the [WebAssembly Binary Toolkit](https://github.com/WebAssembly/wabt)

    `wabt` can either be installed by building it directly from the Git repository listed above, or if you already have the [WebAssembly Package Manager](https://wapm.io/package/wabt) installed, you can install it using the command `wapm install wabt`.

1. In Microsoft's Visual Studio Code editor, open the `.wat` file, right-click anywhere in the source code and select "Save as WebAssembly binary file"

## Setup Instructions

1. Clone this repo into some local development directory

    ```bash
    $ cd <some_development_directory>
    $ git clone https://github.com/ChrisWhealy/clock_time_get.git
    ```

1. Change into the `wasm_lib` directory and run the command to compile the WebAssembly Text file

    ```bash
    $ cd wasm_lib
    $ wat2wasm clock_time_get.wat
    ```

    This will create the file `clock_time_get.wasm`

1. Change back to the main repo folder and install the required packages

    ```bash
    $ cd ..
    $ npm i
    npm notice created a lockfile as package-lock.json. You should commit this file.
    npm WARN clock-time-get@1.0.0 No description

    added 8 packages from 7 contributors and audited 9 packages in 2.819s
    found 0 vulnerabilities
    ```

1. Run the NodeJS file `server.js` that then executes this WASM module.  You should see output similar to the following:

    ```bash
    $ node server.js 
    000036fadb30d49f
    ```

## Coding

The WebAssembly Text [source code](./wasm_lib/clock_time_get.wat) contains lots of explanatory comments and (shock, horror!) meaningful variable names...

Hopefully, this will make understanding the WebAssembly program flow almost entirely self-explanatory.  Its worth pointing out that the bulk of the coding in this module is concerned with translating the binary time value into an ASCII text string.

