import { createAdversarialPayloads, createDimensionSamples, generateSampleImage } from "./test-stress-generators.mjs";

export async function testMultipartSuite(worker, env, record) {
  const p = createAdversarialPayloads();

  // Valid PNG
  const validPng = generateSampleImage(400, 200, "png");
  const form1 = new FormData();
  form1.append("file", new Blob([validPng], { type: "image/png" }), "valid.png");
  const res1 = await worker.request("/upload", { method: "POST", body: form1 }, env);
  const data1 = await res1.json();
  record("MP-01 Valid PNG Upload", res1.status === 200 && data1.success === true, `status=${res1.status}`);

  // Missing file field
  const form2 = new FormData();
  form2.append("not_file", "123");
  const res2 = await worker.request("/upload", { method: "POST", body: form2 }, env);
  record("MP-02 Missing File Field", res2.status === 400, `status=${res2.status}`);

  // Zero bytes file
  const form3 = new FormData();
  form3.append("file", new Blob([p.zeroBytes], { type: "image/png" }), "empty.png");
  const res3 = await worker.request("/upload", { method: "POST", body: form3 }, env);
  record("MP-03 Zero Bytes File", res3.status === 400, `status=${res3.status}`);

  // Non-image text
  const form4 = new FormData();
  form4.append("file", new Blob([p.plainText], { type: "text/plain" }), "doc.txt");
  const res4 = await worker.request("/upload", { method: "POST", body: form4 }, env);
  record("MP-04 Plain Text File", res4.status === 415 || res4.status === 422, `status=${res4.status}`);

  // Non-image PDF
  const form5 = new FormData();
  form5.append("file", new Blob([p.fakePdf], { type: "application/pdf" }), "doc.pdf");
  const res5 = await worker.request("/upload", { method: "POST", body: form5 }, env);
  record("MP-05 PDF File", res5.status === 415 || res5.status === 422, `status=${res5.status}`);

  // Corrupt JPEG
  const form6 = new FormData();
  form6.append("file", new Blob([p.corruptJpeg], { type: "image/jpeg" }), "corrupt.jpg");
  const res6 = await worker.request("/upload", { method: "POST", body: form6 }, env);
  record("MP-06 Corrupt JPEG Buffer", res6.status === 415 || res6.status === 422, `status=${res6.status}`);

  // Corrupt PNG Header
  const form7 = new FormData();
  form7.append("file", new Blob([p.corruptPng], { type: "image/png" }), "corrupt.png");
  const res7 = await worker.request("/upload", { method: "POST", body: form7 }, env);
  const data7 = await res7.json();
  const passPng = (res7.status === 415 || res7.status === 422) && data7.success === false;
  record("MP-07 Corrupt PNG Buffer", passPng, `status=${res7.status}, success=${data7.success}`);

  // Corrupt GIF Header
  const form8 = new FormData();
  form8.append("file", new Blob([p.corruptGif], { type: "image/gif" }), "corrupt.gif");
  const res8 = await worker.request("/upload", { method: "POST", body: form8 }, env);
  const data8 = await res8.json();
  const passGif = (res8.status === 415 || res8.status === 422) && data8.success === false;
  record("MP-08 Corrupt GIF Buffer", passGif, `status=${res8.status}, success=${data8.success}`);

  // Corrupt BMP Header
  const form9 = new FormData();
  form9.append("file", new Blob([p.corruptBmp], { type: "image/bmp" }), "corrupt.bmp");
  const res9 = await worker.request("/upload", { method: "POST", body: form9 }, env);
  const data9 = await res9.json();
  const passBmp = (res9.status === 415 || res9.status === 422) && data9.success === false;
  record("MP-09 Corrupt BMP Buffer", passBmp, `status=${res9.status}, success=${data9.success}`);

  // Random binary
  const form10 = new FormData();
  form10.append("file", new Blob([p.randomBytes], { type: "application/octet-stream" }), "rnd.bin");
  const res10 = await worker.request("/upload", { method: "POST", body: form10 }, env);
  record("MP-10 Random Garbage Buffer", res10.status === 415 || res10.status === 422, `status=${res10.status}`);
}
