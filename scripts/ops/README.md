# Ops Scripts (Script-First / No Heredoc Workflow)

This folder is the dedicated place for operational scripts used in this repository.

## Account Safety Scripts

### 1) `enforce-aws-account.sh`
Hard stop if the current AWS profile resolves to the wrong account (and optionally wrong region).

```bash
scripts/ops/enforce-aws-account.sh <expected_account_id> [profile] [expected_region]
```

Example:

```bash
scripts/ops/enforce-aws-account.sh 788184849448 Dugod us-east-1
```

### 2) `dugod-preflight.sh`
Preflight gate for DuGod mutations. Must pass before any deploy/apply command.

```bash
scripts/ops/dugod-preflight.sh [profile] [region]
```

Example:

```bash
scripts/ops/dugod-preflight.sh Dugod us-east-1
```

### 3) `iam-audit-dugod.sh`
Audits users, roles, access keys, and account summary in DuGod account.

```bash
scripts/ops/iam-audit-dugod.sh [profile] [region]
```

Example:

```bash
scripts/ops/iam-audit-dugod.sh Dugod us-east-1
```

### 4) `verify-s3-dugod-only.sh`
Verifies S3 access is limited to `dugodofficial-*` buckets only. Blocks deployment if other buckets are accessible.

```bash
scripts/ops/verify-s3-dugod-only.sh [profile] [region]
```

Example:

```bash
scripts/ops/verify-s3-dugod-only.sh Dugod us-east-1
```

This is automatically called by `dugod-preflight.sh`.

## Policy Templates

Policy templates are in:

`scripts/ops/policies/`

Current templates:

- `dugod-deploy-minimum-policy.json` - Base least-privilege policy for deploy users/roles
- `dugod-s3-only-policy.json` - Restricts S3 access to only `dugodofficial-*` buckets

Use these as base least-privilege policies for deploy users/roles.

## Recommended Safe Sequence Before Any Change

1. `scripts/ops/dugod-preflight.sh Dugod us-east-1`
2. `scripts/ops/iam-audit-dugod.sh Dugod us-east-1`
3. Run your deploy/mutation command only after preflight passes.

## Note

Per your request, operational work should use reusable script files from this folder (instead of ad-hoc heredoc terminal blocks).
