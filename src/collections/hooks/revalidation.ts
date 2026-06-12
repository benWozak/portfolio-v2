import { revalidatePath, revalidateTag } from 'next/cache'
import type {
  BasePayload,
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  RequestContext,
} from 'payload'

type RevalidationOptions = {
  tags?: string[]
  /** Resolve paths to revalidate; falsy entries are skipped. previousDoc is undefined on delete. */
  paths?: (doc: any, previousDoc?: any) => (string | false | null | undefined)[]
}

function revalidate(
  options: RevalidationOptions,
  payload: BasePayload,
  context: RequestContext,
  doc: any,
  previousDoc?: any,
): void {
  // Local API callers (scripts, seeds) can opt out via context: { disableRevalidate: true }
  if (context?.disableRevalidate) {
    return
  }

  try {
    const tags = options.tags ?? []
    const paths = (options.paths?.(doc, previousDoc) ?? []).filter(
      (p): p is string => typeof p === 'string' && p.length > 0,
    )

    for (const tag of tags) {
      revalidateTag(tag)
    }
    for (const path of paths) {
      revalidatePath(path)
    }

    payload.logger.info(`Revalidated tags [${tags.join(', ')}] paths [${paths.join(', ')}]`)
  } catch (err) {
    // revalidateTag/revalidatePath throw outside a Next.js request scope
    // (e.g. tsx scripts using the Local API) — never block the write for that.
    payload.logger.error({ msg: 'Cache revalidation failed', err })
  }
}

/**
 * Builds afterChange/afterDelete hooks that call revalidateTag/revalidatePath
 * directly (Payload 3 is Next-native, so hooks run inside Next route handlers).
 */
export function createRevalidationHooks(options: RevalidationOptions): {
  afterChange: CollectionAfterChangeHook
  afterDelete: CollectionAfterDeleteHook
} {
  return {
    afterChange: ({ doc, previousDoc, req: { payload, context } }) => {
      revalidate(options, payload, context, doc, previousDoc)
      return doc
    },
    afterDelete: ({ doc, req: { payload, context } }) => {
      revalidate(options, payload, context, doc)
      return doc
    },
  }
}
