# Fast-Router Benchmarks

## Performance Overview

Benchmarks run on **Apple M3 Pro** with **Deno 2.8.1**

### Route Lookup Performance

| Route Type            | Average Time | Operations/sec | Min      | Max      | p75      | p99      |
| --------------------- | ------------ | -------------- | -------- | -------- | -------- | -------- |
| **Static**            | 12.1 ns      | 82,940,000     | 11.0 ns  | 19.2 ns  | 12.1 ns  | 13.7 ns  |
| **Named Parameter**   | 80.3 ns      | 12,460,000     | 72.2 ns  | 103.7 ns | 81.3 ns  | 88.9 ns  |
| **Nested Parameter**  | 122.9 ns     | 8,139,000      | 111.5 ns | 158.8 ns | 124.3 ns | 133.8 ns |
| **Regex Parameter**   | 296.5 ns     | 3,373,000      | 274.8 ns | 333.9 ns | 302.1 ns | 313.1 ns |
| **Single Wildcard**   | 115.7 ns     | 8,646,000      | 104.3 ns | 149.2 ns | 117.0 ns | 127.9 ns |
| **Catch-all Globstar**| 151.4 ns     | 6,603,000      | 136.9 ns | 180.7 ns | 154.0 ns | 162.2 ns |
| **Any-method**        | 23.4 ns      | 42,770,000     | 21.2 ns  | 62.8 ns  | 23.8 ns  | 27.6 ns  |
| **Without Params**    | 80.3 ns      | 12,460,000     | 69.5 ns  | 230.0 ns | 79.6 ns  | 104.3 ns |
| **No Match**          | 64.5 ns      | 15,510,000     | 57.3 ns  | 120.0 ns | 65.6 ns  | 75.0 ns  |

### Key Metrics

- **Static Routes**: ~12 ns - Direct O(1) hash lookup
- **Named Parameter**: ~80 ns - Tree traversal + param extraction
- **Nested Parameter**: ~123 ns - Multiple segments with params
- **Regex Parameter**: ~297 ns - Tree traversal + RegExp validation
- **Single Wildcard**: ~116 ns - Tree traversal with wildcard match
- **Catch-all Globstar**: ~151 ns - Deep path with globstar capture
- **Any-method**: ~23 ns - Static cache hit with fallback method
- **Without Params**: ~80 ns - Param route skipping extraction
- **No Match**: ~65 ns - Tree traversal without match

## Running Benchmarks

```bash
deno task bench
```
