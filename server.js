// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Imports
const fs  = require("fs")

const { WASI }            = require("@wasmer/wasi")
const { lowerI64Imports } = require("@wasmer/wasm-transformer")

const wasmFilePath = "./wasm_lib/clock_time_get.wasm"

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Instantiate a new WASI Instance
let wasi = new WASI({
  args : [wasmFilePath]
, env  : {}
})

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Async function to run WASI module/instance
const startWasiTask =
  async pathToWasmFile => {
    // Fetch the WASM module and transform its interface
    // This is needed because one of the aruments to wasi_unstable.clock_time_get
    // is an i64, and currently, passing a JavaScript BigInt to a WASM i64 is not
    // directly supported without first transforming the interface.
    // See https://docs.wasmer.io/wasmer-js/wasmer-js-module-transformation for
    // more details on this subject
    let wasmBytes        = new Uint8Array(fs.readFileSync(pathToWasmFile))
    let loweredWasmBytes = lowerI64Imports(wasmBytes)

    let { instance } = await WebAssembly.instantiate(loweredWasmBytes, {
      wasi_unstable: wasi.wasiImport
    })

    // Start the WASI instance (which in this case merely fires up the instance
    // without invoking any WASM functionality)
    wasi.start(instance)

    // What's the time, Mr WASI?
    // The response is written directly to standard out
    instance.exports.getTimeNanosStr()
  }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Everything starts here
startWasiTask(wasmFilePath)
