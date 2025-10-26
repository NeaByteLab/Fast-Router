# Fast-Router Benchmarks

## Performance Overview

Benchmarks run on **Apple M3 Pro** with **Deno 2.5.4**

### Route Lookup Performance

| Route Type    | Average Time | Operations/sec | Min      | Max      | p75      | p99      |
| ------------- | ------------ | -------------- | -------- | -------- | -------- | -------- |
| **Static**    | 12.7 ns      | 78,490,000     | 12.0 ns  | 32.2 ns  | 13.0 ns  | 16.8 ns  |
| **Parameter** | 79.5 ns      | 12,580,000     | 74.5 ns  | 106.1 ns | 80.9 ns  | 94.3 ns  |
| **Nested**    | 119.5 ns     | 8,372,000      | 115.2 ns | 144.7 ns | 121.2 ns | 131.1 ns |
| **No Match**  | 59.3 ns      | 16,860,000     | 56.4 ns  | 70.0 ns  | 60.1 ns  | 67.2 ns  |

### Key Metrics

- **Static Routes**: ~13 ns - Direct O(1) hash lookup
- **Parameter Routes**: ~80 ns - Tree traversal + param extraction
- **Nested Routes**: ~120 ns - Multiple segments with params
- **No Match**: ~60 ns - Tree traversal without match

## Running Benchmarks

```bash
deno task bench
```
