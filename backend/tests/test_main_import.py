import unittest
from unittest.mock import patch

from app.main import app, safe_import_router


class MainAppTests(unittest.TestCase):
    def test_router_prefixes_are_not_doubled(self):
        paths = [route.path for route in app.routes if hasattr(route, "path")]
        self.assertIn("/api/v1/auth/register", paths)
        self.assertNotIn("/api/v1/auth/auth/register", paths)
        self.assertIn("/api/v1/products/featured", paths)
        self.assertNotIn("/api/v1/products/products/featured", paths)

    def test_returns_none_when_import_fails(self):
        with patch("app.main.importlib.import_module", side_effect=ImportError("boom")):
            module = safe_import_router("app.api.v1.products")
            self.assertIsNone(module)


if __name__ == "__main__":
    unittest.main()
