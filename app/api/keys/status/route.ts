import { jsonWithServer } from '@/lib/api';
import { getClerkIdentityKey } from '@/lib/clerkIdentity';
import { REGISTERED_KEYS_CSTORE_HKEY } from '@/lib/constants';
import { parseIdentityKey } from '@/lib/identityKey';
import { parseRegisteredKeyRecord } from '@/lib/passkey';
import type { RegisteredKeyRecord } from '@/lib/types';
import createEdgeSdk from '@ratio1/edge-sdk-ts';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const rawIdentity = url.searchParams.get('identity') ?? url.searchParams.get('address');
  const identity =
    rawIdentity && rawIdentity.trim().length > 0 ? parseIdentityKey(rawIdentity) : null;
  const clerkIdentity = identity ? null : await getClerkIdentityKey();
  const resolvedIdentity = identity ?? clerkIdentity;

  if (!resolvedIdentity) {
    return jsonWithServer({ success: false, error: 'Missing identity' }, { status: 400 });
  }

  try {
    const ratio1 = createEdgeSdk();
    const keysToCheck = [resolvedIdentity.storageKey, ...resolvedIdentity.legacyKeys];
    let record: RegisteredKeyRecord | null = null;
    for (const key of keysToCheck) {
      try {
        const value = await ratio1.cstore.hget<string>({
          hkey: REGISTERED_KEYS_CSTORE_HKEY,
          key,
        });
        record = parseRegisteredKeyRecord(value);
        if (record) break;
      } catch (error) {
        console.warn('[keys] hget failed', error);
      }
    }

    return jsonWithServer({
      success: true,
      identity: resolvedIdentity.value,
      identityKey: resolvedIdentity.storageKey,
      record,
      hasKey: Boolean(record),
      keyType: record?.type ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[keys] Failed to fetch status', error);
    return jsonWithServer({ success: false, error: message }, { status: 500 });
  }
}
