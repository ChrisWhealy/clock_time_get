const fs = require("fs")

const { WASI } = require("@wasmer/wasi")
const { lowerI64Imports } = require("@wasmer/wasm-transformer")

const wasmFilePath = "./clock_time_get.wasm"

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Instantiate a new WASI Instance
let wasi = new WASI({
  args: [wasmFilePath],
  env: {},
})

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Async function to run WASI module/instance
const startWasiTask =
  async pathToWasmFile => {
    // Fetch the WASM module and transform its interface
    // Transformation is needed because for testing, we need to pass an i64 to the exported Wasm function.
    // Currently, passing a JavaScript BigInt to a Wasm function is not supported without an intermediate transformation
    // step that converts the BigInt value into an array of u8.
    // See https://docs.wasmer.io/wasmer-js/wasmer-js-module-transformation for more details

    let { instance } = await WebAssembly.instantiate(
      lowerI64Imports(new Uint8Array(fs.readFileSync(pathToWasmFile))),
      { wasi_unstable: wasi.wasiImport },
    )

    // Start the WASI instance
    wasi.start(instance)

    // instance.exports.test(BigInt("0x0123DEADBEEF9876"))
    // instance.exports.test(BigInt("0xfedcba9876543210"))

    // Call the Wasm module that fetches the system time and writes it directly to standard out
    instance.exports.writeTimeNanos()

  }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Everything starts here
startWasiTask(wasmFilePath)
