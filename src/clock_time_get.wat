(module
  ;; Host functions provided by WASI
  (import "wasi" "clock_time_get"
    (func $wasi_clock_time_get
          (param i32 i64 i32)
          (result i32)
    )
  )
  (import "wasi" "fd_write"
    (func $wasi_fd_write
          (param i32 i32 i32 i32)
          (result i32)
    )
  )

  (memory (export "memory") 1
    ;; 00 -> 15  16b ASCII character lookup table
    ;; 16         8b i64 system clock value
    ;; 24        16b i64 system clock value as ASCII string
    ;; 44         8b fd_write output string offset + length
    ;; 52         4b Number of bytes written by fd_write
  )

  ;; Memory offsets
  (global $time_loc          i32 (i32.const 16))
  (global $i64_str_loc       i32 (i32.const 24))
  (global $fd_write_data_loc i32 (i32.const 44))

  ;; ASCII lookup table where each character occurs at its corresponding offset
  (data (i32.const 0) "0123456789abcdef")

  ;; - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ;; Convert the 8 bytes of an i64 into a 16 character ASCII hex string.
  (func $i64_to_hex_str
    (local $str_loc     i32)
    (local $loop_offset i32)
    (local $this_byte   i32)

    ;; Set offset of current string byte to the output string's start offset
    (local.set $str_loc (global.get $i64_str_loc))
    (local.set $loop_offset (i32.add (global.get $time_loc) (i32.const 7)))

    ;; Using little-endian byte order (working from right to left), parse each byte of the i64
    (loop $next_byte
      (local.set $this_byte (i32.load8_u (local.get $loop_offset)))

      ;; Store top half of the current byte as an ASCII chararcter and bump the output offset
      (i32.store8
        (local.get $str_loc)
        (i32.load8_u (i32.shr_u (i32.and (local.get $this_byte) (i32.const 0xF0)) (i32.const 4)))
      )
      (local.set $str_loc (i32.add (local.get $str_loc) (i32.const 1)))

      ;; Store bottom half of the current byte as an ASCII chararcter and bump the output offset
      (i32.store8
        (local.get $str_loc)
        (i32.load8_u (i32.and (local.get $this_byte) (i32.const 0x0F)))
      )
      (local.set $str_loc (i32.add (local.get $str_loc) (i32.const 1)))

      (local.set $loop_offset (i32.sub (local.get $loop_offset) (i32.const 1)))
      (br_if $next_byte (i32.ge_u (local.get $loop_offset) (global.get $time_loc)))
    )
  )

  ;; - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ;; Append a line feed character to the supplied string, then write it to standard out
  (func $println
        (param $str_loc i32)
        (param $str_len i32)

    ;; Append a line feed character to the end of the string
    (i32.store (i32.add (local.get $str_loc) (local.get $str_len)) (i32.const 0x0A))

    ;; Store offset and (length + 1) of the data on which fd_write will operate
    (i32.store (global.get $fd_write_data_loc) (local.get $str_loc))
    (i32.store
      (i32.add (global.get $fd_write_data_loc) (i32.const 4))
      (i32.add (local.get $str_len) (i32.const 1))
    )

    ;; Write the string to standard out, returning the number of bytes written
    (call $wasi_fd_write
      (i32.const 1)                   ;; fd 1 = standard out
      (global.get $fd_write_data_loc) ;; Location of string data's offset/length
      (i32.const 1)                   ;; Number of strings to write
      (i32.const 52)                  ;; fd_write stores the number of bytes written at this location
    )

    ;; We don't care about the number of bytes written
    drop
  )

  ;; *******************************************************************************************************************
  ;; Public API
  ;; *******************************************************************************************************************

  ;; - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ;; Fetch the raw system clock time to standard out
  (func (export "getTimeNanos")
        (param $clock_id         i32)
        (param $write_to_console i32)
        (result i32)

    ;; What's the time Mr WASI?
    (call $wasi_clock_time_get
      (local.get $clock_id)
      (i64.const 1)          ;; Precision
      (global.get $time_loc) ;; Write clock time to this location
    )
    drop

    ;; Convert i64 to ASCII
    (call $i64_to_hex_str)

    (if (local.get $write_to_console)
      (call $println (global.get $i64_str_loc) (i32.const 16))
    )

    ;; Return pointer to i64 string for anyone that cares
    (global.get $i64_str_loc)
  )

  ;; - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  ;; Supply test value to function i64_to_hex_str
  (func (export "test_i64ToHexStr")
        (param $i64_arg i64)
        (result i32)

    ;; Store the test value at the same location $wasi_clock_time_get writes its data
    (i64.store (global.get $time_loc) (local.get $i64_arg))

    (call $i64_to_hex_str)
    (global.get $i64_str_loc)
  )
)
