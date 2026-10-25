import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.security import create_access_token

@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="session")
def admin_token():
    # User ID 1 is Admin in seed data
    token = create_access_token(subject=1)
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="session")
def artisan_token():
    # User ID 2 is Ramesh Kumar Ansari (Artisan) in seed data
    token = create_access_token(subject=2)
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="session")
def buyer_token():
    # User ID 5 is FabCraft (Buyer) in seed data
    token = create_access_token(subject=5)
    return {"Authorization": f"Bearer {token}"}
