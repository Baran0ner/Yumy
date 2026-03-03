# Maestro smoke scenarios

## Files
- `smoke-en.yaml`: Core navigation smoke for Today -> Barcode -> Goals -> Streaks.
- `smoke-paywall.yaml`: Guest hard paywall blocking smoke.

## Run
```bash
maestro test e2e/maestro/smoke-en.yaml
maestro test e2e/maestro/smoke-paywall.yaml
```

## Notes
- App id is set to `com.subsetapp.yummy`.
- Flows assume testIDs defined in RN screens.
