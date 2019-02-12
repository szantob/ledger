docker build --tag ledger .
docker run -p 8080:8080 -p 3000:3000 --name ledger -d ledger