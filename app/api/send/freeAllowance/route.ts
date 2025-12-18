import { jsonWithServer } from '@/lib/api';
import { getFreeSendAllowance } from '@/lib/freeSends';
import { parseIdentityKey } from '@/lib/identityKey';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const identityInput = url.searchParams.get('identity') ?? url.searchParams.get('address');

  if (!identityInput) {
    return jsonWithServer({ success: false, error: 'Missing identity' }, { status: 400 });
  }
  const identity = parseIdentityKey(identityInput);
  if (!identity) {
    return jsonWithServer({ success: false, error: 'Invalid identity' }, { status: 400 });
  }

  try {
    const allowance = await getFreeSendAllowance(identity.storageKey);
    return jsonWithServer({ success: true, allowance });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[freeAllowance] Failed to fetch allowance', error);
    return jsonWithServer({ success: false, error: message }, { status: 500 });
  }
}
