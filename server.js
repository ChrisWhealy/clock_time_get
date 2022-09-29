const fs = require("fs")
const { WASI } = require("@wasmer/wasi")
const { lowerI64Imports } = require("@wasmer/wasm-transformer")

const wasmFilePath = "./clock_time_get.wasm"

const testVal1 = "0xDEADBEEFDEADBEEF"
const testVal2 = "0xBADC0FFEE0DDF00D"

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
    let { instance } = await WebAssembly.instantiate(
      // Transform the Wasm module so that i64 values can be used in function interfaces
      lowerI64Imports(
        // Fetch the WASM module
        new Uint8Array(fs.readFileSync(pathToWasmFile))
      ),
      // Grant access to the host functions imported by Wasm
      { wasi_unstable: wasi.wasiImport },
    )

    // Start the WASI instance
    wasi.start(instance)

    return instance.exports
  }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Everything starts here
startWasiTask(wasmFilePath)
  .then(wasmFns => {
    wasmFns.test_i64ToHexStr(BigInt(testVal1))
    wasmFns.test_i64ToHexStr(BigInt(testVal2))

    wasmFns.writeTimeNanos()
  })
