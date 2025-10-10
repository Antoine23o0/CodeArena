#!/usr/bin/env python3
"""Simple sandbox runner for CodeArena submissions.

The script receives a JSON payload on stdin with the following structure:

{
  "language": "python" | "javascript",
  "code": "print('hello')",
  "testCases": [{"input": "", "expectedOutput": ""}, ...],
  "timeLimitMs": 3000
}

It executes the code once per test case and returns a JSON report on stdout.
"""

import json
import os
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass
from typing import List


@dataclass
class TestCaseResult:
    input_data: str
    expected_output: str
    output: str
    passed: bool


class ExecutionError(Exception):
    """Raised when the runner payload is invalid."""


COMMAND_BUILDERS = {
    "python": lambda script_path: ["python3", script_path],
    "javascript": lambda script_path: ["node", script_path],
}


def load_payload() -> dict:
    try:
        raw_payload = sys.stdin.read()
        return json.loads(raw_payload)
    except json.JSONDecodeError as exc:
        raise ExecutionError(f"Invalid payload: {exc}") from exc


def create_script(language: str, code: str) -> str:
    suffix = ".py" if language == "python" else ".js"
    fd, path = tempfile.mkstemp(suffix=suffix)
    with os.fdopen(fd, "w", encoding="utf-8") as handle:
        handle.write(code)
    return path


def run_single_case(command: List[str], input_payload: str, timeout: float):
    start_time = time.perf_counter()
    completed = subprocess.run(
        command,
        input=input_payload.encode("utf-8"),
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=timeout,
    )
    elapsed = (time.perf_counter() - start_time) * 1000
    stdout = completed.stdout.decode("utf-8", errors="ignore")
    stderr = completed.stderr.decode("utf-8", errors="ignore")
    return completed.returncode, stdout, stderr, elapsed


def classify_error(stderr: str) -> str:
    lowered = stderr.lower()
    if "syntaxerror" in lowered or "syntax error" in lowered or "unexpected token" in lowered:
        return "Compilation Error"
    return "Runtime Error"


def evaluate(payload: dict) -> dict:
    language = payload.get("language", "python")
    code = payload.get("code")
    test_cases = payload.get("testCases", [])
    timeout_ms = int(payload.get("timeLimitMs") or 3000)

    if language not in COMMAND_BUILDERS:
        raise ExecutionError(f"Unsupported language: {language}")
    if not isinstance(code, str) or not code.strip():
        raise ExecutionError("Source code is required")
    if not isinstance(test_cases, list):
        raise ExecutionError("testCases must be a list")

    script_path = create_script(language, code)
    command = COMMAND_BUILDERS[language](script_path)
    results: List[TestCaseResult] = []
    total_time = 0.0
    aggregated_stdout = []
    aggregated_stderr = []
    status = "Accepted"

    try:
        if not test_cases:
            # Run once to ensure the program executes without crashing.
            test_cases = [{"input": "", "expectedOutput": ""}]

        for test_case in test_cases:
            input_payload = str(test_case.get("input", ""))
            expected_output = str(test_case.get("expectedOutput", ""))
            try:
                return_code, stdout, stderr, elapsed = run_single_case(
                    command,
                    input_payload,
                    timeout_ms / 1000,
                )
            except subprocess.TimeoutExpired as exc:
                status = "Time Limit Exceeded"
                results.append(
                    TestCaseResult(
                        input_data=input_payload,
                        expected_output=expected_output,
                        output="",
                        passed=False,
                    )
                )
                aggregated_stderr.append(str(exc))
                break

            total_time += elapsed
            aggregated_stdout.append(stdout)
            if stderr:
                aggregated_stderr.append(stderr)

            if return_code != 0:
                status = classify_error(stderr)
                results.append(
                    TestCaseResult(
                        input_data=input_payload,
                        expected_output=expected_output,
                        output=stdout,
                        passed=False,
                    )
                )
                break

            normalized_output = stdout.strip()
            normalized_expected = expected_output.strip()
            passed = normalized_output == normalized_expected
            if not passed and status == "Accepted":
                status = "Wrong Answer"

            results.append(
                TestCaseResult(
                    input_data=input_payload,
                    expected_output=expected_output,
                    output=stdout,
                    passed=passed,
                )
            )

        return {
            "status": status,
            "executionTimeMs": total_time,
            "stdout": "\n".join(s for s in aggregated_stdout if s),
            "stderr": "\n".join(s for s in aggregated_stderr if s),
            "testResults": [
                {
                    "input": result.input_data,
                    "expectedOutput": result.expected_output,
                    "output": result.output,
                    "passed": result.passed,
                }
                for result in results
            ],
        }
    finally:
        try:
            os.remove(script_path)
        except OSError:
            pass


def main():
    try:
        payload = load_payload()
        report = evaluate(payload)
        json.dump(report, sys.stdout)
    except ExecutionError as exc:
        sys.stderr.write(str(exc))
        sys.exit(1)
    except Exception as exc:  # pragma: no cover - defensive
        sys.stderr.write(f"Runner failure: {exc}")
        sys.exit(1)


if __name__ == "__main__":
    main()
