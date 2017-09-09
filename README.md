VanderPool 0.1
==============
VanderPool is a lightweight, low-level tool for managing pools of structured ArrayBuffer data.

Why?
----
Suppose you have a structured data type built on top of an ArrayBuffer (say a TypedArray or DataView). Your program needs tons of these, and it frequently creates and destroys them. You could use a regular ol' object pool containing thousands of little ArrayBuffers, but wouldn't it be better if the underlying data was one big ArrayBuffer instead?

VanderPool gives you the one big ArrayBuffer and a safe, reliable, fast way to manage it. You may want to build an object pool on top of that, but that's none of VanderPool's business. It just handles keeping track of what segments of the buffer are in use and which parts are ready to be reused.

Usage
-----
```javascript
let VanderPool = require("vanderpool");

// suppose we want a pool of 1000 items of 8 bytes each
const pool = new VanderPool(8, 1000);

// VanderPool's allocator accepts a callback in the form 
// function(buffer, byteOffset, byteLength)

// you can pass the params directly to a DataView constructor
let dv = pool.allocate((buf, bo, bl) => new DataView(buf, bo, bl));

// or to any arbitrary object you want to use
let myObj = pool.allocate(myObjFactory);

// once you're done with it, call free with the offset:
pool.free(dv.byteOffset);

// (don't forget to keep track of this if you're using a custom object during allocations)
// keep in mind that TypedArrays expect an item length, not a byte length
let f32arr = pool.allocate((buf, bo, bl) => new Float32Array(buf, bo, 2));

// Also keep in mind if you're using TypedArrays the byte length of VanderPool members
// must be even multiples of the typed array's BYTES_PER_ELEMENT 
let pool2 = new VanderPool(7, 1000);
// the first one will work...
let f32arr = pool.allocate((buf, bo, bl) => new Float32Array(buf, bo, 1));
// but the second one will crap out
let f32arr2 = pool.allocate((buf, bo, bl) => new Float32Array(buf, bo, 1)); // RangeError
```

License
-------
MIT
