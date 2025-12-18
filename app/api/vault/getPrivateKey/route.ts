import { jsonWithServer } from '@/lib/api';
import { getClerkIdentityKey } from '@/lib/clerkIdentity';
import { VAULT_CSTORE_HKEY } from '@/lib/constants';
import { parseIdentityKey } from '@/lib/identityKey';
import type { VaultKeyRecord } from '@/lib/types';
import {
  createVaultRecord,
  decryptPrivateKey,
  getVaultPrivateKeySecret,
  parseVaultRecord,
} from '@/lib/vault';
import { buildVaultAccessMessage } from '@/lib/vaultAccess';
import createEdgeSdk from '@ratio1/edge-sdk-ts';
import { getAddress, isHex, recoverMessageAddress } from 'viem';

export const runtime = 'nodejs';

interface PrivateKeyRequest {
  address?: string;
  identity?: string;
  signature?: string;
  message?: string;
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

export async function POST(request: Request) {
  let body: PrivateKeyRequest;

  try {
    body = (await request.json()) as PrivateKeyRequest;
  } catch {
    return jsonWithServer({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { address, identity, signature, message } = body;
  const rawIdentity = isString(identity) && identity.trim().length > 0 ? identity : address;
  const parsedIdentity = rawIdentity ? parseIdentityKey(rawIdentity) : null;
  const clerkIdentity = await getClerkIdentityKey();
  const walletIdentity = parsedIdentity?.kind === 'wallet' ? parsedIdentity : null;
  const emailIdentity = parsedIdentity?.kind === 'email' ? parsedIdentity : null;

  if (walletIdentity) {
    if (!isString(signature) || signature.trim().length === 0 || !isHex(signature)) {
      return jsonWithServer({ success: false, error: 'Invalid signature' }, { status: 400 });
    }
    if (!isString(message) || message.trim().length === 0) {
      return jsonWithServer({ success: false, error: 'Missing message' }, { status: 400 });
    }
  } else if (clerkIdentity) {
    if (emailIdentity && emailIdentity.value !== clerkIdentity.value) {
      return jsonWithServer({ success: false, error: 'Identity mismatch' }, { status: 403 });
    }
  } else {
    return jsonWithServer({ success: false, error: 'Missing identity' }, { status: 400 });
  }

  const resolvedIdentity = walletIdentity ?? emailIdentity ?? clerkIdentity;
  if (!resolvedIdentity) {
    return jsonWithServer({ success: false, error: 'Missing identity' }, { status: 400 });
  }

  let normalizedAddress: string | null = null;
  if (resolvedIdentity.kind === 'wallet') {
    try {
      normalizedAddress = getAddress(resolvedIdentity.value);
    } catch {
      return jsonWithServer({ success: false, error: 'Invalid address' }, { status: 400 });
    }
    const expectedMessage = buildVaultAccessMessage(normalizedAddress);
    if (message !== expectedMessage) {
      return jsonWithServer({ success: false, error: 'Unexpected message' }, { status: 400 });
    }

    try {
      const recovered = await recoverMessageAddress({
        message,
        signature: signature as `0x${string}`,
      });
      if (getAddress(recovered) !== normalizedAddress) {
        return jsonWithServer(
          { success: false, error: 'Signature does not match address' },
          { status: 401 }
        );
      }
    } catch (error) {
      console.warn('[vault] Failed to recover address from signature', error);
      return jsonWithServer(
        { success: false, error: 'Failed to validate signature' },
        { status: 400 }
      );
    }
  }

  try {
    const ratio1 = createEdgeSdk();
    const keysToCheck = [resolvedIdentity.storageKey, ...resolvedIdentity.legacyKeys];
    const secret = getVaultPrivateKeySecret();

    let record: VaultKeyRecord | null = null;

    for (const key of keysToCheck) {
      try {
        const existingValue = await ratio1.cstore.hget<string>({
          hkey: VAULT_CSTORE_HKEY,
          key,
        });
        record = parseVaultRecord(existingValue);
        if (record) break;
      } catch (error) {
        console.warn('[vault] hget failed', error);
      }
    }

    if (!record) {
      record = createVaultRecord(secret);
      await ratio1.cstore.hset({
        hkey: VAULT_CSTORE_HKEY,
        key: resolvedIdentity.storageKey,
        value: JSON.stringify(record),
      });
    }

    const privateKey = decryptPrivateKey(record.privateKey, secret).toString('base64');

    return jsonWithServer({
      success: true,
      type: 'vault',
      publicKey: record.publicKey,
      privateKey,
      createdAt: record.createdAt,
    });
  } catch (error) {
    const messageText = error instanceof Error ? error.message : 'Unknown error';
    console.error('[vault] Failed to resolve private key', error);
    return jsonWithServer({ success: false, error: messageText }, { status: 500 });
  }
}
