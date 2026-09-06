import sys
import os

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import pytest

if __name__ == "__main__":
    exit_code = pytest.main([
        "-p", "no:pytest_ethereum",
        "tests/",
        "-v",
        "--tb=short"
    ])
    sys.exit(exit_code)
