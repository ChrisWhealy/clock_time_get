const wasmFilePath = "./bin/clock_time_get.wasm"

let wasmMem64
let wasmMem32
let wasmMem8

// WebAssembly host environment supplied by the browser must provide an emulation of the required WASI functions
let hostEnvironment = {
  "wasi": {
    "clock_time_get": (_clockId, _precision, memLoc) =>
      // The clock id is ignored because in the browser, we only have access to the realtime clock
      wasmMem64.setBigUint64(memLoc, BigInt(Date.now()) * 1000000n, true),

    "fd_write": (fd, memLoc, _strCount, bytesWrittenLoc) => {
      let strPtr = wasmMem32[memLoc >>> 2]
      let strLen = wasmMem32[(memLoc >>> 2) + 1]

      console[fd === 1 ? "log" : "error"](new TextDecoder().decode(wasmMem8.slice(strPtr, strPtr + strLen)))

      wasmMem32[bytesWrittenLoc >>> 2] = strLen
    },
  },
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const startWasm = async pathToWasmFile => {
  // Fetch the WASM module and instantiate
  let wasmMod = await WebAssembly.instantiateStreaming(fetch(pathToWasmFile), hostEnvironment)

  wasmMem64 = new DataView(wasmMod.instance.exports.memory.buffer)
  wasmMem32 = new Uint32Array(wasmMod.instance.exports.memory.buffer)
  wasmMem8 = new Uint8Array(wasmMod.instance.exports.memory.buffer)

  return wasmMod.instance.exports
}

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Everything starts here
startWasm(wasmFilePath)
  .then(wasmFns => {
    let timeLoc = wasmFns.getTimeNanos(1, true)
    let timeStr = new TextDecoder().decode(wasmMem8.slice(timeLoc, timeLoc + 16))

    document.getElementById("time").innerText = timeStr
  })
