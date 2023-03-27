import { readFileSync } from "fs"
import { WASI } from 'wasi'

const wasmFilePath = "./bin/clock_time_get.wasm"
const clockIdMap = new Map()

clockIdMap.set(0, "Realtime clock   :")
clockIdMap.set(1, "Monotonic clock  :")
clockIdMap.set(2, "Process CPU time :")
clockIdMap.set(3, "Thread CPU time  :")

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
  .then(wasmFns =>
    clockIdMap.forEach((desc, clockId) => {
      let timePtr = wasmFns.getTimeNanos(clockId, false)
      console.log(`${desc} ${new TextDecoder().decode(wasmMem8.slice(timePtr, timePtr + 16))}`)
    })
  )
