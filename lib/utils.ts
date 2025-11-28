/**
 * Utility functions for Next.js page components
 */

/**
 * Resolves searchParams from Promise/Object pattern to plain object
 * Next.js 15+ uses Promise<SearchParams>, but older versions may pass object directly
 * 
 * @template T - The type of searchParams object
 * @param searchParams - Either a Promise<SearchParams> or SearchParams object
 * @returns Resolved SearchParams object
 * 
 * @example
 * ```typescript
 * const resolved = await getSearchParams(searchParams);
 * const page = resolved.page;
 * ```
 */
export async function getSearchParams<T extends Record<string, string | string[] | undefined>>(
  searchParams: Promise<T> | T
): Promise<T> {
  return searchParams instanceof Promise ? await searchParams : searchParams;
}

/**
 * Resolves params from Promise/Object pattern to plain object
 * Next.js 15+ uses Promise<Params>, but older versions may pass object directly
 * 
 * @template T - The type of params object
 * @param params - Either a Promise<Params> or Params object
 * @returns Resolved Params object
 * 
 * @example
 * ```typescript
 * const resolved = await getParams(params);
 * const id = resolved.id;
 * ```
 */
export async function getParams<T extends Record<string, string | string[] | undefined>>(
  params: Promise<T> | T
): Promise<T> {
  return params instanceof Promise ? await params : params;
}




