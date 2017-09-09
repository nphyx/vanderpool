"use strict";

// This is based on current Javascript maximums for ArrayBuffers

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.default = VanderPool;
var MAX_POOL_SIZE = exports.MAX_POOL_SIZE = Math.pow(2, 21);

function calculatePoolSize(itemLength) {
	return MAX_POOL_SIZE - MAX_POOL_SIZE % itemLength;
}

/**
 * Makes the smallest array possible that can contain every address in a pool.
 */
function createFreedList(maxIndex) {
	if (maxIndex < Math.pow(2, 8)) return new Uint8Array(maxIndex);else if (maxIndex < Math.pow(2, 16)) return new Uint16Array(maxIndex);else return new Uint32Array(maxIndex);
}

/**
 * VanderPool constructor.
 * @param {int} itemLength length in bytes of a single member of the pool
 * @param {int} itemCount number of members in the pool
 * @property {ArrayBuffer} buffer ArrayBuffer backing the pool
 * @property {Uint8Array} freed list of freed offsets ready for reuse
 * @property {int} itemLength size in bytes of pool member
 * @property {int} byteLength size of pool in bytes
 * @return {VanderPool}
 */
function VanderPool(itemLength, itemCount) {
	var byteLength = 0 | 0;

	if (itemCount) {
		if (itemLength * itemCount > MAX_POOL_SIZE) {
			throw new Error("requested buffer byteLength is too large");
		} else byteLength = itemLength * itemCount;
	} else byteLength = calculatePoolSize(itemLength);

	var buffer = new ArrayBuffer(byteLength);
	// The freed list's length is the maximum possible number of members
	// We could do this smarter by minimizing fragmentation
	var freed = createFreedList(itemCount ? itemCount : byteLength / itemLength);
	var next = 0;
	var freedPos = 0;

	Object.defineProperties(this, {
		"buffer": { get: function get() {
				return buffer;
			} },
		"itemLength": { get: function get() {
				return itemLength;
			} },
		"byteLength": { get: function get() {
				return byteLength;
			} }
	});

	function popFree() {
		freedPos--;
		var offset = freed[freedPos] * itemLength;
		freed[freedPos] = 0;
		return offset;
	}

	/**
  * Allocates a new chunk of the pool.  The callback is executed immediately and its
  * return value is returned out of allocate.
  * @Example
  * ```javascript
  * let vp = new VanderPool(8, 100); // a pool of 100 items of 7 bytes each
  * // you can pass the params directly to a DataView constructor
  * let dv = vp.allocate((buf, bo, bl) => 
  *     new DataView(buf, bo, bl));
  * // keep in mind that TypedArrays expect an item length, not a byte length
  * let f32arr = vp.allocate((buf, bo, bl) => 
  *     new Float32Array(buf, bo, bl/Float32Array.BYTES_PER_ELEMENT));
  * ```
  * @param {function} cb callback `function(buffer, byteOffset, itemLength)`
  * @return {mixed} return value of callback function
  * @throws {Error} when buffer is full
  */
	this.allocate = function (cb) {
		var offset = 0 | 0;
		if (freedPos > 0) offset = popFree();else if (next < byteLength - 1) {
			offset = next;
			next = next + itemLength;
		} else throw new Error("buffer is full");
		return cb(buffer, offset, itemLength);
	};

	/**
  * Frees an allocation at the given starting offset. You need to keep track of this
  * value if you're using a custom object in allocate(). 
  * @Example
  * ```javascript
  * let vp = new VanderPool(8, 100); // a pool of 100 items of 7 bytes each
  * let dv = vp.allocate(DataView);
  * // DataViews and TypedArrays keep the offset in the byteOffset property
  * vp.free(DataView.byteOffset); 
  * ```
  * @param {offset} the start offset of the chunk to be freed
  * @return {undefined}
  */
	this.free = function (offset) {
		freed[freedPos] = offset === 0 ? offset : offset / itemLength;
		freedPos++;
	};

	return this;
}