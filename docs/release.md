# Release process

Releases are created from Git tags. A tag named `vX.Y.Z` publishes one system version:

- Strapi backend image in GitHub Container Registry.
- Android `.apk` and `.aab` files attached to the GitHub Release.

The workflow does not create commits or tags. Prepare the version in a normal commit, then push a tag.

## Prepare a release

1. Update versions:

   ```bash
   pnpm release:prepare 1.2.0 --changelog
   ```

2. Review and commit the changed files.

3. Create and push the tag:

   ```bash
   git tag v1.2.0
   git push origin
   git push origin v1.2.0
   ```

## GitHub Actions secrets

Android release signing requires these repository secrets:

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

Generate a keystore once and store it outside the repository:

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore myd17-release.keystore \
  -alias myd17-release \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
base64 myd17-release.keystore > myd17-release.keystore.b64
```

Use the contents of `myd17-release.keystore.b64` as `ANDROID_KEYSTORE_BASE64`.

Add a repository variable named `EXPO_PUBLIC_STRAPI_URL`. The Android release workflow passes that value into Expo at build time, so release builds and GitHub Release artifacts point at the live Strapi instance.

## Release artifacts

After a successful tag release, download files from the GitHub Release page:

- `MyD17-vX.Y.Z.apk` for direct Android installation and testing.
- `MyD17-vX.Y.Z.aab` for Google Play distribution.

Dry-run workflow runs upload the same files as GitHub Actions artifacts instead of publishing a GitHub Release or GHCR image.

## Backend deployment

Create the production environment:

```bash
./myd17.sh install
```

Set the image version in `.env`:

```dotenv
MYD17_VERSION=1.2.0
```

Start a new installation or update an existing one:

```bash
./myd17.sh start    # first time
./myd17.sh update   # subsequent releases (backs up DB first)
```

The production Strapi container uses the released image and only mounts a persistent upload volume. Source code is not mounted into the container.
