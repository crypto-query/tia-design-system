/**
 * Subsequence match — the Combobox's filter. Every letter of the query has to turn
 * up in the haystack, in order but not adjacent, so "mfu" finds "Momentum Futures".
 */
export function fuzzyMatch(haystack: string, query: string): boolean {
    const needle = query.trim().toLowerCase();

    if (!needle) return true;

    let matched = 0;

    for (const character of haystack.toLowerCase()) {
        if (character === needle[matched]) matched += 1;
        if (matched === needle.length) return true;
    }

    return false;
}
