/** Host formats its own material facts and timezone; absent formatter means no label. */
export type MaterialReadyFormatter<Fact> = (fact: Fact) => string | undefined
export function materialReadyLabel<Fact>(
  fact: Fact,
  formatter?: MaterialReadyFormatter<Fact>,
): string | undefined {
  return formatter?.(fact)
}
