// Loads every ./en/*.json file and merges them. Each feature area keeps its own
// file (common.json, fees.json, …) so areas can be translated independently.
const files = import.meta.glob('./en/*.json', { eager: true, import: 'default' });

export default defineI18nLocale(() => Object.assign({}, ...Object.keys(files).sort().map((k) => files[k])));
