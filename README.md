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

const BYTE_LENGTH = 7; // this is how long each data segment is, in bytes 
// suppose we want a pool of 1000 items
const pool = new VanderPool(1000, BYTE_LENGTH);

// the allocate method returns a byte offset, which we can use to create a new DataView
let dv = new DataView(pool.buffer, pool.allocate(), BYTE_LENGTH);

// this could just as easily be a TypedArray (keeping in mind normal TypedArray rules)
let i8 = new Int8Array(pool.buffer, pool.allocate(), BYTE_LENGTH);

// once you're done with it, call free with the offset:
pool.free(dv.byteOffset);
```

License
-------
MIT
