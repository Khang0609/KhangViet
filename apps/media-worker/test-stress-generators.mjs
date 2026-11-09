import crypto from "node:crypto";
import { generateSampleImage } from "./test-fixtures.mjs";

export function createAdversarialPayloads() {
  const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const corruptPng = Buffer.concat([pngHeader, crypto.randomBytes(64)]);

  const jpegHeader = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
  const corruptJpeg = Buffer.concat([jpegHeader, crypto.randomBytes(32)]);

  const gifHeader = Buffer.from("GIF89a");
  const corruptGif = Buffer.concat([gifHeader, crypto.randomBytes(64)]);

  const bmpHeader = Buffer.from([0x42, 0x4d]);
  const corruptBmp = Buffer.concat([bmpHeader, crypto.randomBytes(64)]);

  return {
    corruptPng,
    corruptJpeg,
    corruptGif,
    corruptBmp,
    plainText: Buffer.from("Hello, this is a plain text file, not an image."),
    fakePdf: Buffer.from("%PDF-1.7\n1 0 obj\n<< /Type /Catalog >>\nendobj"),
    randomBytes: crypto.randomBytes(1024),
    zeroBytes: Buffer.alloc(0),
  };
}

export function createDimensionSamples() {
  return [
    { w: 1, h: 1, expectedAspect: "square", expW: 1, expH: 1 },
    { w: 1000, h: 1, expectedAspect: "wide", expW: 1000, expH: 1 },
    { w: 1, h: 1000, expectedAspect: "portrait", expW: 1, expH: 1000 },
    { w: 500, h: 500, expectedAspect: "square", expW: 500, expH: 500 },
    { w: 104, h: 100, expectedAspect: "square", expW: 104, expH: 100 },
    { w: 1600, h: 1200, expectedAspect: "landscape", expW: 1600, expH: 1200 },
    { w: 1920, h: 800, expectedAspect: "wide", expW: 1920, expH: 800 },
    { w: 800, h: 1200, expectedAspect: "portrait", expW: 800, expH: 1200 },
    { w: 2560, h: 2560, expectedAspect: "square", expW: 2560, expH: 2560 },
    { w: 3000, h: 2000, expectedAspect: "landscape", expW: 2560, expH: 1707 },
    { w: 2000, h: 3000, expectedAspect: "portrait", expW: 1707, expH: 2560 },
    { w: 3200, h: 3200, expectedAspect: "square", expW: 2560, expH: 2560 },
  ];
}

export { generateSampleImage };
