import { strict as assert } from "node:assert";

export async function runSsrfStressTests(worker) {
  let passed = 0;
  let failed = 0;
  const env = { MEDIA_BUCKET: {}, NODE_ENV: "test", WEB_APP_URL: "https://khangviet.vn" };

  console.log("\n--- SUITE 4: SSRF DEFENSE VECTORS & ADVERSARIAL PAYLOADS ---");

  const ssrfVectors = [
    { label: "Loopback IPv4 (127.0.0.1)", url: "http://127.0.0.1/evil.png" },
    { label: "Localhost with port (localhost:8080)", url: "http://localhost:8080/image.jpg" },
    { label: "RFC1918 Class A (10.0.0.1)", url: "http://10.0.0.1/pic.png" },
    { label: "RFC1918 Class B (172.16.0.5)", url: "http://172.16.0.5/pic.png" },
    { label: "RFC1918 Class C (192.168.1.1)", url: "http://192.168.1.1/pic.png" },
    { label: "Cloud Metadata IP (169.254.169.254)", url: "http://169.254.169.254/latest/meta-data/" },
    { label: "IPv6 Loopback ([::1])", url: "http://[::1]/image.png" },
    { label: "Protocol Injection: javascript:", url: "javascript:alert(1)" },
    { label: "Protocol Injection: file://", url: "file:///etc/passwd" },
    { label: "Protocol Injection: ftp://", url: "ftp://example.com/test.png" },
    { label: "Decimal Integer IP (2130706433)", url: "http://2130706433/image.png" },
    { label: "Octal IP Representation (0177.0.0.1)", url: "http://0177.0.0.1/test.png" },
    { label: "Hexadecimal IP Representation (0x7f.0.0.1)", url: "http://0x7f.0.0.1/test.png" },
    { label: "IPv6 Unspecified ([::])", url: "http://[::]/image.png" },
    { label: "IPv6 Link-Local ([fe80::1])", url: "http://[fe80::1]/image.png" },
    { label: "IPv6 Unique Local fc00 ([fc00::1])", url: "http://[fc00::1]/image.png" },
    { label: "IPv6 Unique Local fd00 ([fd00::1])", url: "http://[fd00::1]/image.png" },
    { label: "IPv4-mapped IPv6 Loopback ([::ffff:127.0.0.1])", url: "http://[::ffff:127.0.0.1]/image.png" },
    { label: "IPv4-mapped IPv6 Metadata ([::ffff:169.254.169.254])", url: "http://[::ffff:169.254.169.254]/image.png" },
  ];

  for (const vec of ssrfVectors) {
    const res = await worker.request("/fetch-external", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: vec.url }),
    }, env);
    const body = await res.json().catch(() => ({}));
    if (res.status === 400 && body.error?.code === "SSRF_BLOCKED") {
      console.log(`  ✔ [PASS] Blocked SSRF: ${vec.label}`);
      passed++;
    } else {
      console.log(`  ✖ [FAIL] SSRF BYPASS: ${vec.label} (status: ${res.status}, body: ${JSON.stringify(body)})`);
      failed++;
    }
  }

  // Suite 5: Malformed Request Bodies to /fetch-external
  console.log("\n--- SUITE 5: MALFORMED REQUEST INPUTS TO /fetch-external ---");
  const malformedInputs = [
    { label: "Empty object {}", body: {} },
    { label: "Empty url string { url: '' }", body: { url: "" } },
    { label: "Non-string url { url: 12345 }", body: { url: 12345 } },
  ];
  for (const inp of malformedInputs) {
    const res = await worker.request("/fetch-external", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(inp.body),
    }, env);
    if (res.status === 400) {
      console.log(`  ✔ [PASS] Malformed input rejected: ${inp.label}`);
      passed++;
    } else {
      console.log(`  ✖ [FAIL] Malformed input: ${inp.label} got status ${res.status}`);
      failed++;
    }
  }

  return { passed, failed };
}
