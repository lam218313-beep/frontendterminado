
import sys
import os
from fastapi.routing import APIRoute

# Add current dir to path so we can import app
sys.path.append(os.getcwd())

from app.main import app

print("Registered Routes:")
for route in app.routes:
    if isinstance(route, APIRoute):
        print(f"{route.methods} {route.path}")
