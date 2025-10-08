import os
import subprocess
import time

print("Sandbox Python démarré, en attente de code utilisateur...")

while True:
    if os.path.exists("user_code.py"):
        try:
            result = subprocess.run(
                ["python3", "user_code.py"],
                capture_output=True,
                text=True,
                timeout=int(os.environ.get("TIMEOUT", 5))
            )
            print("=== OUTPUT ===")
            print(result.stdout)
            print("=== ERRORS ===")
            print(result.stderr)
        except subprocess.TimeoutExpired:
            print("❌ Le code a dépassé le temps limite")
        os.remove("user_code.py")  # Supprimer après exécution
    time.sleep(1)

