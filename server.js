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
    let wasmBytes        = new Uint8Array(fs.readFileSync(pathToWasmFile))
    let loweredWasmBytes = lowerI64Imports(wasmBytes)

    let { instance } = await WebAssembly.instantiate(loweredWasmBytes, {
//    let { instance } = await WebAssembly.instantiate(wasmBytes, {
      wasi_unstable: wasi.wasiImport
    })

    // Start the WASI instance
    // In this case, this does not invoke any WASM functionality
    wasi.start(instance)

    // What's the time, Mr WASI?
    // The response is written directly to standard out
    instance.exports.getTimeNanosStr()

    // Even with module transformation, this statement blows up...
    // console.log(`64-bit time value returned from WASM : ${instance.exports.getTimeNanosBin()}`)
  }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Everything starts here
startWasiTask(wasmFilePath)
