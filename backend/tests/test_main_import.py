import unittest
from unittest.mock import patch

from app.main import safe_import_router


class SafeImportRouterTests(unittest.TestCase):
    def test_returns_none_when_import_fails(self):
        with patch("app.main.importlib.import_module", side_effect=ImportError("boom")):
            module = safe_import_router("app.api.v1.products")
            self.assertIsNone(module)


if __name__ == "__main__":
    unittest.main()
