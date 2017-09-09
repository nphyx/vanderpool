"use strict";
require("should");

import VanderPool from "../src/index";

describe("VanderPools", function() {
	it("should be the default member of its module", function() {
		VanderPool.should.be.a.Function();
		(new VanderPool(1000, 1)).should.be.an.Object();
	});
	it("should construct a VanderPool object", function() {
		let vp = new VanderPool(10, 10);
		(vp.buffer instanceof ArrayBuffer).should.be.true();
		vp.itemLength.should.be.a.Number().eql(10);
		vp.byteLength.should.be.a.Number().eql(100);
		vp.allocate.should.be.a.Function();
		vp.free.should.be.a.Function();
		// should also support omitting length paramter
		vp = new VanderPool(16);
		(vp.buffer instanceof ArrayBuffer).should.be.true();
		vp.itemLength.should.be.a.Number().eql(16);
		vp.byteLength.should.be.a.Number().eql(Math.pow(2, 21));
		vp.allocate.should.be.a.Function();
		vp.free.should.be.a.Function();
	});
	it("should allocate chunks of memory", function() {
		let vp = new VanderPool(8, 1000);
		let dv = vp.allocate((buf, bo, bl) => new DataView(buf, bo, bl));
		dv.byteOffset.should.eql(0);
		dv.byteLength.should.eql(8);
		let f32 = vp.allocate((buf, bo, bl) => 
			new Float32Array(buf, bo, bl/Float32Array.BYTES_PER_ELEMENT));
		f32.byteOffset.should.eql(8);
		f32.byteLength.should.eql(8);
		let uint32 = vp.allocate((buf, bo, bl) => 
			new Uint32Array(buf, bo, bl/Uint32Array.BYTES_PER_ELEMENT));
		uint32.byteOffset.should.eql(16);
		uint32.byteLength.should.eql(8);
	});
	it("should free and reuse chunks", function() {
		let vp = new VanderPool(8, 1000);
		let dv = vp.allocate((buf, bo, bl) => new DataView(buf, bo, bl));
		dv.byteOffset.should.eql(0);
		vp.free(dv.byteOffset);
		let dv2 = vp.allocate((buf, bo, bl) => new DataView(buf, bo, bl));
		dv2.byteOffset.should.eql(0);
		let f32 = vp.allocate((buf, bo, bl) => 
			new Float32Array(buf, bo, bl/Float32Array.BYTES_PER_ELEMENT));
		f32.byteOffset.should.eql(8);
		let i8 = vp.allocate((buf, bo, bl) => 
			new Int8Array(buf, bo, bl/Int8Array.BYTES_PER_ELEMENT));
		i8.byteOffset.should.eql(16);
		vp.free(f32.byteOffset);
		let uint32 = vp.allocate((buf, bo, bl) => 
			new Uint32Array(buf, bo, bl/Uint32Array.BYTES_PER_ELEMENT));
		// this should end up being the same offset that the f32 used
		uint32.byteOffset.should.eql(f32.byteOffset);
	});
	it("should throw an error when the requested buffer size is too large", function() {
		let vp;
		(() => vp = new VanderPool(1, Math.pow(2, 21))).should.not.throw();
		(() => vp = new VanderPool(1, Math.pow(2, 21)+1)).should.throw();
	});
	it("should throw an error when full", function() {
		let vp = new VanderPool(8, 10);
		let allocated = [];
		const makeFloat32 = (buf, bo, bl) => 
				new Float32Array(buf, bo, bl/Float32Array.BYTES_PER_ELEMENT)
		for(let i = 0; i < 10; ++i) {
			allocated[i] = vp.allocate(makeFloat32);
		}
		(() => vp.allocate(makeFloat32)).should.throw();
	});
});
