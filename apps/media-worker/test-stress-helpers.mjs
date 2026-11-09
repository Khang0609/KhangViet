import { generateSampleImage } from "./test-fixtures.mjs";

export function createFailingBucket(failureType = "both") {
  return {
    put: async () => {
      if (failureType === "put" || failureType === "both") {
        throw new Error("R2_STORAGE_QUOTA_EXCEEDED");
      }
      return { key: "mock.webp", size: 100 };
    },
    get: async () => {
      if (failureType === "get" || failureType === "both") {
        throw new Error("R2_SERVICE_UNAVAILABLE");
      }
      return null;
    },
  };
}

export function createMockBucketWithData(initialKey, initialData) {
  const store = new Map();
  if (initialKey && initialData) {
    store.set(initialKey, initialData);
  }
  return {
    put: async (key, value, options) => {
      store.set(key, { value, options });
      return { key, size: value.length };
    },
    get: async (key) => {
      const item = store.get(key);
      if (!item) return null;
      return {
        body: item.value,
        size: item.value.length,
        httpEtag: '"stress-etag-999"',
        httpMetadata: item.options?.httpMetadata,
      };
    },
  };
}

export { generateSampleImage };
