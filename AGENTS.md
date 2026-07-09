# AGENTS.md

This is a personal Kubernetes learning repo (github.com/famo7/kubernetes), **not** the upstream kubernetes/kubernetes.

## Structure

- 4 Node.js Express apps, each in its own directory: `log_output/`, `log_reader/`, `todo_app/`, `ping_pong/`
- `log_reader/` is deployed as a **sidecar** inside `log_output/`'s pod (shared `emptyDir` volume)
- Each app has `manifests/` with Kubernetes YAML (deployment, service, ingress as needed)
- Exercise submissions live on **git tags** (`1.1` through `1.10`), each on its own branch
- All apps use CommonJS (`require()`), not ES modules. Express 5 (`^5.2.1`).

## Development

No tests, no CI, no linting, no typechecking, no codegen.

```bash
# Run an app locally
cd <app_dir> && npm install && npm start

# Build and push Docker image (Docker Hub user: famo1901)
docker build -t famo1901/<image>:<tag> <app_dir>
docker push famo1901/<image>:<tag>

# Apply Kubernetes manifests
kubectl apply -f <app_dir>/manifests/

# Tag and release (creates commit + annotated tag + push)
./release.sh <tag> "<message>"
# Example: ./release.sh 1.10 "log output with sidecar"
```

## Image naming convention

Images are tagged per exercise version: `famo1901/<app-name>:<version>` (e.g., `famo1901/log-output:1.10`).