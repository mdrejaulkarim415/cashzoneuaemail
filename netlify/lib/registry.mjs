import { randomInt } from "node:crypto";
import { FIRST_NAMES, LAST_NAMES } from "./names.mjs";

export const MAX_HANDLE_LENGTH = 30;

function pick(items) {
  return items[randomInt(items.length)];
}

function randomLetters(length) {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let result = "";

  for (let index = 0; index < length; index += 1) {
    result += alphabet[randomInt(alphabet.length)];
  }

  return result;
}

function makeBaseHandle() {
  return pick(FIRST_NAMES) + pick(LAST_NAMES);
}

export async function reserveHandle(store, handle) {
  if (!/^[a-z]{4,30}$/.test(handle) || handle.length > MAX_HANDLE_LENGTH) {
    return false;
  }

  const result = await store.set(
    handle,
    JSON.stringify({
      email: handle + "@gmail.com",
      reservedAt: new Date().toISOString(),
    }),
    { onlyIfNew: true }
  );

  return Boolean(result && result.modified === true);
}

export async function claimUniqueEmail(store) {
  // The common path keeps natural first+last handles. After a few collisions,
  // a short random suffix is added so high traffic does not stall on popular names.
  for (let attempt = 0; attempt < 18; attempt += 1) {
    const base = makeBaseHandle();
    const suffixLength = attempt < 6 ? 0 : 2;
    const handle = suffixLength
      ? base + randomLetters(Math.min(suffixLength, MAX_HANDLE_LENGTH - base.length))
      : base;

    if (await reserveHandle(store, handle)) {
      return handle + "@gmail.com";
    }
  }

  // Last-resort candidates keep the address letters-only and under Gmail's
  // 30-character local-part limit while still reserving through the same
  // atomic registry.
  for (let suffixLength = 4; suffixLength <= 8; suffixLength += 1) {
    for (let attempt = 0; attempt < 12; attempt += 1) {
      const base = makeBaseHandle();
      if (base.length + suffixLength > MAX_HANDLE_LENGTH) continue;

      const handle = base + randomLetters(suffixLength);
      if (await reserveHandle(store, handle)) {
        return handle + "@gmail.com";
      }
    }
  }

  return null;
}
