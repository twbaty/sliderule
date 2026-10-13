# N909-ES scale definitions

These are the front-side scale labels and layout represented in the supplied
reference photos. Positions are normalized to the rule length: `x = 0` is the
left end and `x = 1` is the right end. `theta` is in degrees. The tick patterns
below define the generated graduations; numeric scales label the values listed
in the `labels` column.

| Order / section | Scale | Position formula | Range | Ink | Tick subdivisions by interval |
| --- | --- | --- | --- | --- | --- |
| Fixed top stator, 1 | K | `log10(v) / 3` | 1–1000 | black | For each decade `10^n`: mantissa 1–2 by 0.1, 2–5 by 0.1, 5–10 by 0.2 |
| Fixed top stator, 2 | A | `log10(v) / 2` | 1–100 | black | For each decade `10^n`: mantissa 1–2 by 0.1, 2–5 by 0.1, 5–10 by 0.2 |
| Slide, 1 | CI | `1 - log10(v)` | 1–10, read right to left | red | 1–2 by 0.1, 2–5 by 0.1, 5–10 by 0.2 |
| Slide, 2 | C | `log10(v)` | 1–10 | black | 1–2 by 0.1, 2–5 by 0.1, 5–10 by 0.2; gauge mark at π |
| Fixed bottom stator, 1 | D | `log10(v)` | 1–10 | black | 1–2 by 0.1, 2–5 by 0.1, 5–10 by 0.2; gauge mark at π |
| Fixed bottom stator, 2 | L | `v` | 0–1 | black | 0–1 by 0.01 |
| Fixed bottom stator, 3 | S | `1 + log10(sin(theta))` | 5.7391704773°–90° | red | 6°–90° by 1° |
| Fixed bottom stator, 4 | T | `1 + log10(tan(theta))` | 5.7105931375°–45° | red | 6°–45° by 1° |
| Fixed bottom stator, 5 | ST | `2 + log10(tan(theta))` | 0.5729386977°–5.7105931375° | red | 0.6°–5.7° by 0.1° |

The logarithmic subdivisions repeat by decade for A and K. The displayed front
references identify K and A on the upper fixed bar and the existing lesson
identifies L on the lower fixed bar; the C/D, inverse, and trig scales complete
the generated front-side model.

The archived virtual-page source names back-side stator and slider images and
has a flip control, but those images are not present in `extracted_assets/`.
Consequently their labels, ranges, and metric-conversion markings cannot be
identified from the allowed references and are deliberately not guessed or
rendered. A back-side page can be added when those reference photos are
available.
