# ExternRef Polyfill
 
WebAssembly is expecting a powerful way to be able to refer to objects in JavaScript using a concept called [ExternRef](https://github.com/WebAssembly/reference-types/blob/master/proposals/reference-types/Overview.md).  Until then, this library can help enable that functionality in a similar pattern that will make it easy to convert over in some future.  Some useful things this library does:

* throws exceptions if you try to load a externref value that's been deleted
* throws exceptions if you try to delete an externref that's already been deleted
* isn't dependent on wasm_bindgen

## Usage

```js
import { ExternRef } from 'externref_polyfill';

// call a function on WebAssembly module with an ExternRef
const r = ExternRef.create({ foo: 'bar' });
const result = wasmModule.instance.exports.call(r);

// on the receiving end in Rust you will have a i64/bigint handle of the externref
#[no_mangle]
fn call(r: i64) {
  // do something with ref
  do_something_with_ref(r);
}

// on the receiving end in JavaScript
function do_something_with_ref(r: bigint) {
  const value = ExternRef.load(r);
  
  // do something with the value of the ExternRef
  console.log(value.foo);
  
  // then when you are done with the 
  ExternRef.delete(r);
}
```

Remember it's important to delete your ExternRefs when you are done with them.  Otherwise they will leak memory.

A Rust library exists `externref_polyfill` that can help you drop the ExternRefs when they go out of scope.

```rust
use externref_polyfill::ExternRef;

extern "C" {
  fn do_something_with(r:i64);
}

#[no_mangle]
fn call(r: ExternRef) {
    const owned_extern_ref:ExternRef = r.into();
    
    // goes out of scope here and auto drops
}
```

It relies on a single function exposed to the WebAssembly module `externref_drop` that will drop the ExternRef when it is called.

```javascript
//instantiate WebAssembly module
const wasmModule = await WebAssembly.instantiate(wasmBytes, {
  env: {
    externref_drop: (externRef) => {
      ExternRef.delete(externRef);
    }
  }
});
```

# Example: Echo

```rust
// Rust WebAssembly module echo.wasm

use externref_polyfill::ExternRef;

extern "C" {
    fn echo_echo(output_extern_ref: i64);
}

#[no_mangle]
pub fn echo(input: i64) {
    let extern_ref_input:ExternRef = input.into();
    unsafe {
        echo_echo(extern_ref_input.value);
    }
}
```

```typescript
const response = await fetch('echo.wasm');
const wasmBytes = await response.arrayBuffer();
const wasmModule = await WebAssembly.instantiate(wasmBytes, {
  env: {
    externref_drop: (externRef:bigint) => {
      console.log(`dropped externref with value ${JSON.stringify(ExternRef.load(externRef))}`);
      ExternRef.delete(externRef);
    },
    echo_echo: (externRef:bigint) => {
      console.log(ExternRef.load(externRef)+"...");
    }
  }
});
const textExternRef = ExternRef.create("Hello, World!");
wasmModule.instance.exports.echo(textExternRef);
```
