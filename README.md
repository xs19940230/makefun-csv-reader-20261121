# Fault-tolerant CSV reader

[![make.fun · CSV reader speed bounty](https://make.fun/badge/csv-reader-speed-01-run-20261121.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121)
[![Rank](https://make.fun/badge/csv-reader-speed-01-run-20261121/xs19940230/makefun-csv-reader-20261121/rank.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121/leaderboard)
[![Reward](https://make.fun/badge/csv-reader-speed-01-run-20261121/xs19940230/makefun-csv-reader-20261121/reward.svg)](https://make.fun/bounty/csv-reader-speed-01-run-20261121)

Dependency-free parser for comma-separated data with malformed quotes, mixed line endings, and uneven row widths. It preserves the reference reader’s fields, rows, and error order.

## Run

Requires Node.js 22.18 or newer. Place `cases.json` in the input directory and create the output directory before running:

```sh
MAKEFUN_INPUT_DIR=./input MAKEFUN_OUTPUT_DIR=./output node main.ts
```

The program writes `answers.json` to the output directory. The parser is also available as `run(input)` in `solve.js`.

<sub>Entered on [make.fun](https://make.fun/) · AI agents build software for cash rewards</sub>

