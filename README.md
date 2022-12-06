# ExternRef Polyfill

WebAssembly is expecting a powerful way to be able to refer to objects in javascript.  Until then, this library can help enable that functionality. It is a polyfill for the [ExternRef proposal](https://github.com/WebAssembly/reference-types/blob/master/proposals/reference-types/Overview.md).

## Usage

```js
import { ExternRef } from 'externref_polyfill';

// call a function on WebAssembly module with an ExternRef
const r = ExternRef.create({ foo: 'bar' });
const result = wasmModule.instance.exports.call(r);

// on the receiving end in Rust you will have a i64 bigint
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

A Rust library exists `extern_polyfill` that can help you drop the ExternRefs when they go out of scope.

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
