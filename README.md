# E-commerce Deployment with Terraform & Docker

A simple five-service Node.js application deployed on AWS EC2 for the Hero Vired DevOps assignment.

## Services

| Service | Container port |
| --- | ---: |
| Frontend | 3000, published on host port 80 |
| User | 3001 |
| Products | 3002 |
| Orders | 3003 |
| Cart | 3004 |

The frontend displays sample products, cart details, orders, and backend health. All containers run on one Ubuntu EC2 instance using a Docker network.

## Project folders

- `services/` — Application code and five Dockerfiles.
- `terraform/` — VPC, public subnet, routing, security group, EC2, IAM, and Docker bootstrap.
- `scripts/` — Build, push, deploy, and verify scripts.
- `tests/` — Application integration tests.
- `compose.yaml` — Local container setup.

## Run locally

Requires Node.js 22+, Docker Compose v2, Bash, Python 3, and curl.

```bash
node --test tests/services.test.js
docker compose up -d --build --wait
bash scripts/verify.sh http://127.0.0.1
```

Open **http://localhost**.

## Publish and deploy

Requires Terraform 1.6+, configured AWS credentials, and Docker Hub access. Images must be public for EC2 to pull them.

```bash
export DOCKERHUB_NAMESPACE=sammsulhoquechoudhary
export IMAGE_TAG=1.0.0
docker login --username "$DOCKERHUB_NAMESPACE"
bash scripts/build-push.sh
bash scripts/deploy.sh
```

Use your Docker Hub namespace if it differs. The deployment script automatically approves creation of billable AWS resources.

Defaults: **ap-south-1**, **t3.small**, Ubuntu 22.04, private IP **10.42.1.25**. AWS assigns the public IP. Only frontend port 80 is publicly allowed; backend ingress is restricted to the application security group.

## Verify

```bash
APP_URL="$(terraform -chdir=terraform output -raw frontend_url)"
bash scripts/verify.sh "$APP_URL"
```

## Clean up

```bash
docker compose down
terraform -chdir=terraform destroy
```

**Scope:** Sample data only; no database, authentication, or payments. Docker Hub publishing and AWS deployment must be performed with authenticated accounts; no live deployment is claimed.
