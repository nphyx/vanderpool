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
let dv = vp.allocate((buf, bo, bl) => 
    new DataView(buf, bo, bl));

// keep in mind that TypedArrays expect an item length, not a byte length
let f32arr = vp.allocate((buf, bo, bl) => 
    new Float32Array(buf, bo, bl/Float32Array.BYTES_PER_ELEMENT));
// (also keep in mind if you're using TypedArrays the byte length of VanderPool members
// must be an even multiple of the byte length of an element in that array)

// or to any arbitrary object you want to use
let myObj = vp.allocate(myObjFactory);

// once you're done with it, call free with the offset:
pool.free(dv.byteOffset);
// (don't forget to keep track of this if you're using a custom object during allocations)
```

License
-------
MIT
