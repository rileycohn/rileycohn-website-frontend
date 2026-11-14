#!/usr/bin/env bash
# Deploy rileycohn.com: upload this repo's site files to S3, then invalidate CloudFront.
#
# Usage: scripts/deploy.sh [--dry-run]
#
# Finds the CloudFront distribution serving rileycohn.com and its S3 bucket
# automatically. Override with DISTRIBUTION_ID=... and BUCKET=... if needed.
#
# Never deletes anything in the bucket. Games such as /games/duel-dle/ are
# deployed separately and must survive this upload.
set -euo pipefail

DOMAIN="${DOMAIN:-rileycohn.com}"
DRY=""
[[ "${1:-}" == "--dry-run" ]] && DRY="--dryrun"
cd "$(dirname "$0")/.."

aws sts get-caller-identity --query Arn --output text >/dev/null

if [[ -z "${DISTRIBUTION_ID:-}" ]]; then
  DISTRIBUTION_ID=$(aws cloudfront list-distributions --output text \
    --query "DistributionList.Items[?Aliases.Items && contains(Aliases.Items, '${DOMAIN}')].Id | [0]")
fi
[[ -n "$DISTRIBUTION_ID" && "$DISTRIBUTION_ID" != "None" ]] || { echo "No CloudFront distribution found for $DOMAIN" >&2; exit 1; }

if [[ -z "${BUCKET:-}" ]]; then
  ORIGIN=$(aws cloudfront get-distribution --id "$DISTRIBUTION_ID" --output text \
    --query "Distribution.DistributionConfig.Origins.Items[?contains(DomainName, '.s3')].DomainName | [0]")
  BUCKET="${ORIGIN%%.s3*}"
fi
[[ -n "$BUCKET" && "$BUCKET" != "None" ]] || { echo "Could not work out the S3 bucket" >&2; exit 1; }

echo "Distribution: $DISTRIBUTION_ID"
echo "Bucket:       s3://$BUCKET"

EXCLUDES=(--exclude "*" --include "*.html" --include "*.css" --include "*.js" --include "*.png"
  --include "*.ico" --include "*.webmanifest" --include "robots.txt"
  --exclude ".git/*" --exclude "scripts/*" --exclude "games/duel-dle/*" --exclude "node_modules/*")

# HTML and the manifest: always revalidate, so changes show up right away.
aws s3 sync . "s3://$BUCKET" $DRY "${EXCLUDES[@]}" --exclude "*.css" --exclude "*.js" --exclude "*.png" --exclude "*.ico" \
  --cache-control "public, max-age=0, must-revalidate"
# CSS, JS and images: cache for an hour (file names are not content-hashed).
aws s3 sync . "s3://$BUCKET" $DRY "${EXCLUDES[@]}" --exclude "*.html" --exclude "*.webmanifest" --exclude "robots.txt" \
  --cache-control "public, max-age=3600"

if [[ -z "$DRY" ]]; then
  aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" \
    --paths "/" "/index.html" "/404.html" "/css/*" "/js/*" "/games/" "/games/index.html" "/projects/*" \
    --query "Invalidation.Id" --output text
  echo "Deployed. CloudFront usually finishes invalidating within a few minutes."
fi
