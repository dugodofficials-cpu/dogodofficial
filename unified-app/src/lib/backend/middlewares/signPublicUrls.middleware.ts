import { NextFunction, Request, Response } from 'express';
import s3PublicService from '@backend/utils/s3Public';

// Fields that hold a storage key for a public-facing image (album covers,
// product images, ebook cover art, user profile pictures). The bucket isn't
// publicly readable, so every response gets these resolved to a fresh
// presigned URL just before it's sent, instead of persisting a permanent URL.
const SIGNABLE_FIELDS = new Set(['imageUrl', 'picture', 'images', 'bookCoverArt']);

function looksLikeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

async function signValue(value: unknown): Promise<unknown> {
  if (typeof value !== 'string' || !value || looksLikeUrl(value)) return value;
  try {
    return await s3PublicService.getSignedUrl(value);
  } catch (error) {
    console.error('signPublicUrls: failed to sign storage key', value, error);
    return value;
  }
}

async function transformNode(node: unknown): Promise<unknown> {
  if (Array.isArray(node)) {
    return Promise.all(node.map(transformNode));
  }
  if (node && typeof node === 'object') {
    const entries = await Promise.all(
      Object.entries(node as Record<string, unknown>).map(async ([field, value]) => {
        if (SIGNABLE_FIELDS.has(field)) {
          const signed = Array.isArray(value) ? await Promise.all(value.map(signValue)) : await signValue(value);
          return [field, signed] as const;
        }
        return [field, await transformNode(value)] as const;
      })
    );
    return Object.fromEntries(entries);
  }
  return node;
}

export function signPublicUrls(req: Request, res: Response, next: NextFunction): void {
  const originalJson = res.json.bind(res);
  res.json = ((body: unknown) => {
    if (body === undefined) return originalJson(body);
    const plainBody = JSON.parse(JSON.stringify(body));
    transformNode(plainBody)
      .then(signedBody => originalJson(signedBody))
      .catch(error => {
        console.error('signPublicUrls: failed to sign response body, sending unsigned', error);
        originalJson(plainBody);
      });
    return res;
  }) as Response['json'];
  next();
}

export default signPublicUrls;
