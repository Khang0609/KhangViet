import { createAdversarialPayloads, createDimensionSamples, generateSampleImage } from "./test-stress-generators.mjs";

export async function testRawBlobSuite(worker, env, record) {
  const p = createAdversarialPayloads();
  const validJpg = generateSampleImage(200, 400, "jpeg");

  // Valid JPEG Paste
  const r1 = await worker.request("/upload", { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: validJpg }, env);
  const d1 = await r1.json();
  record("RB-01 Valid JPEG Raw Blob", r1.status === 200 && d1.success === true, `status=${r1.status}`);

  // Zero bytes body
  const r2 = await worker.request("/upload", { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: p.zeroBytes }, env);
  record("RB-02 Zero Bytes Raw Body", r2.status === 400, `status=${r2.status}`);

  // Plain text raw body
  const r3 = await worker.request("/upload", { method: "POST", headers: { "Content-Type": "text/plain" }, body: p.plainText }, env);
  record("RB-03 Plain Text Raw Body", r3.status === 415 || r3.status === 422, `status=${r3.status}`);

  // Corrupt JPEG Raw Body
  const r4 = await worker.request("/upload", { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: p.corruptJpeg }, env);
  record("RB-04 Corrupt JPEG Raw Body", r4.status === 415 || r4.status === 422, `status=${r4.status}`);

  // Corrupt PNG Raw Body
  const r5 = await worker.request("/upload", { method: "POST", headers: { "Content-Type": "image/png" }, body: p.corruptPng }, env);
  const d5 = await r5.json();
  const passPng = (r5.status === 415 || r5.status === 422) && d5.success === false;
  record("RB-05 Corrupt PNG Raw Body", passPng, `status=${r5.status}, success=${d5.success}`);
}

export async function testDimensionSuite(worker, env, record) {
  const samples = createDimensionSamples();
  for (const item of samples) {
    const raw = generateSampleImage(item.w, item.h, "jpeg");
    const res = await worker.request("/upload", { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: raw }, env);
    const d = await res.json();
    const isOk = res.status === 200 && d.data?.aspect_ratio === item.expectedAspect &&
      d.data?.width_px === item.expW && d.data?.height_px === item.expH;
    record(
      `DIM-${item.w}x${item.h} (${item.expectedAspect})`,
      isOk,
      `status=${res.status}, dim=${d.data?.width_px}x${d.data?.height_px}, aspect=${d.data?.aspect_ratio}`
    );
  }
}

export async function testWebpMagicSuite(worker, env, store, record) {
  const raw = generateSampleImage(120, 120, "jpeg");
  const res = await worker.request("/upload", { method: "POST", headers: { "Content-Type": "image/jpeg" }, body: raw }, env);
  const d = await res.json();
  const key = d.data?.r2_key;
  const item = store.get(key);
  const b = item?.value;

  const isRiff = b && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46;
  const isWebp = b && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50;
  record("WEBP-01 Stored Object RIFF/WEBP Magic Bytes", Boolean(isRiff && isWebp), `key=${key}`);

  const fRes = await worker.request(`/file/${key}`, {}, env);
  const fb = new Uint8Array(await fRes.arrayBuffer());
  const fRiff = fb[0] === 0x52 && fb[1] === 0x49 && fb[2] === 0x46 && fb[3] === 0x46;
  const fWebp = fb[8] === 0x57 && fb[9] === 0x45 && fb[10] === 0x42 && fb[11] === 0x50;
  record("WEBP-02 Preview Stream RIFF/WEBP Magic Bytes", fRes.status === 200 && fRiff && fWebp, `status=${fRes.status}`);
}
