import { readFileSync } from "fs"
import { WASI } from 'wasi'

const wasmFilePath = "./bin/clock_time_get.wasm"

const testVal1 = "0xDEADBEEFDEADBEEF"
const testVal2 = "0xBADC0FFEE0DDF00D"

let wasi = new WASI({ args: [], env: {} })

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Async function to run WASI module/instance
const startWasiTask =
  async pathToWasmFile => {
    let { instance } = await WebAssembly.instantiate(
      new Uint8Array(readFileSync(pathToWasmFile)),
      { wasi_unstable: wasi.wasiImport },
    )

    // The WASI library requires that start() is always called first.
    // In our case though, it is just a dummy function that does nothing
    wasi.start(instance)

    return instance.exports
  }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Everything starts here
startWasiTask(wasmFilePath)
  .then(wasmFns => {
    // wasmFns.test_i64ToHexStr(BigInt(testVal1))
    // wasmFns.test_i64ToHexStr(BigInt(testVal2))

    wasmFns.writeTimeNanos()
  })
