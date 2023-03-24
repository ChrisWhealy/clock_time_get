import { readFileSync } from "fs"
import { WASI } from 'wasi'

const wasmFilePath = "./bin/clock_time_get.wasm"

const testVals = [
  "0xdeadbeefdeadbeef",
  "0xbadc0ffee0ddf00d",
]

let wasmMem8

let wasi = new WASI({ args: [], env: {} })
let hostEnvironment = { wasi: wasi.wasiImport }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const startWasmModule =
  async pathToWasmFile => {
    // Fetch the WASM module and instantiate
    let { instance } = await WebAssembly.instantiate(
      new Uint8Array(readFileSync(pathToWasmFile)),
      hostEnvironment,
    )

    wasmMem8 = new Uint8Array(instance.exports.memory.buffer)
    wasi.initialize(instance)

    return instance.exports
  }

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Off we go!
startWasmModule(wasmFilePath)
  .then(wasmFns => {
    testVals.forEach((testVal, idx) => {
      let timePtr = wasmFns.test_i64ToHexStr(BigInt(testVal))
      let result = `0x${new TextDecoder().decode(wasmMem8.slice(timePtr, timePtr + 16))}`

      if (result === testVals[idx]) {
        console.log(`Test ${idx} ✅`)
      } else {
        console.error(`Test ${idx} ❌ Got ${result}, expected ${testVals[idx]}`)
      }
    })
  })
