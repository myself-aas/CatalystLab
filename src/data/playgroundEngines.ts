/**
 * Engine ids the `/playground/:engineId` route accepts.
 *
 * The route is a generated page family: one page per engine, twelve of them.
 * It used to answer any string with a 200 and the home page's metadata, then
 * quietly rewrite to `/playground/master` once JavaScript ran, which turns
 * every invented id into a duplicate of one real page. The server now answers
 * an unknown id with a redirect to the canonical one, and this list is what it
 * checks against.
 *
 * The sidebar (`src/components/playground/PlaygroundNavSidebar.tsx`) keeps the
 * presentation data (icons, costs) because it is a React module;
 * `src/tests/unit/programmaticSeo.test.ts` fails if the two lists diverge.
 */
export const PLAYGROUND_ENGINE_IDS: readonly string[] = [
  'master',
  'health',
  'latency',
  'ssl',
  'headers',
  'dns',
  'eco',
  'ai_ready',
  'repo',
  'compliance',
  'migration',
  'llmo'
];

export function isPlaygroundEngineId(value: string): boolean {
  return PLAYGROUND_ENGINE_IDS.includes(value);
}
