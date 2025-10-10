#!/usr/bin/env python3

"""Simple sandbox runner for CodeArena submissions.

The script receives a JSON payload on stdin with the following structure:

{
  "language": "python" | "java" | "c",
  "code": "print('hello')",
  "testCases": [{"input": "", "expectedOutput": ""}, ...],
  "timeLimitMs": 3000
}

It executes the code once per test case and returns a JSON report on stdout.
"""

import json
import os
import shutil
import subprocess
import sys
import tempfile
import time
from dataclasses import dataclass
from typing import Callable, List, Tuple


@dataclass
class TestCaseResult:
    input_data: str
    expected_output: str
    output: str
    passed: bool


class ExecutionError(Exception):
    """Raised when the runner payload is invalid."""


class CompilationError(Exception):
    """Raised when the source cannot be compiled."""

    def __init__(self, message: str, stderr: str = ""):
        super().__init__(message)
        self.stderr = stderr


def create_python_script(code: str) -> Tuple[List[str], Callable[[], None]]:
    fd, path = tempfile.mkstemp(suffix=".py")
    with os.fdopen(fd, "w", encoding="utf-8") as handle:
        handle.write(code)

    def cleanup() -> None:
        try:
            os.remove(path)
        except OSError:
            pass

    return ["python3", path], cleanup


def create_java_command(code: str) -> Tuple[List[str], Callable[[], None]]:
    temp_dir = tempfile.mkdtemp()
    source_path = os.path.join(temp_dir, "Main.java")
    with open(source_path, "w", encoding="utf-8") as handle:
        handle.write(code)

    compilation = subprocess.run(
        ["javac", source_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if compilation.returncode != 0:
        stderr = compilation.stderr.decode("utf-8", errors="ignore")
        raise CompilationError("Java compilation failed", stderr=stderr)

    command = ["java", "-cp", temp_dir, "Main"]

    def cleanup() -> None:
        shutil.rmtree(temp_dir, ignore_errors=True)

    return command, cleanup


def create_c_command(code: str) -> Tuple[List[str], Callable[[], None]]:
    temp_dir = tempfile.mkdtemp()
    source_path = os.path.join(temp_dir, "main.c")
    binary_path = os.path.join(temp_dir, "a.out")
    with open(source_path, "w", encoding="utf-8") as handle:
        handle.write(code)

    compilation = subprocess.run(
        ["gcc", source_path, "-std=c11", "-O2", "-pipe", "-o", binary_path],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    if compilation.returncode != 0:
        stderr = compilation.stderr.decode("utf-8", errors="ignore")
        raise CompilationError("C compilation failed", stderr=stderr)

    def cleanup() -> None:
        shutil.rmtree(temp_dir, ignore_errors=True)

    return [binary_path], cleanup


COMMAND_BUILDERS = {
    "python": create_python_script,
    "java": create_java_command,
    "c": create_c_command,
}


def load_payload() -> dict:
    try:
        raw_payload = sys.stdin.read()
        return json.loads(raw_payload)
    except json.JSONDecodeError as exc:
        raise ExecutionError(f"Invalid payload: {exc}") from exc


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
    try:
        command, cleanup = COMMAND_BUILDERS[language](code)
    except CompilationError as exc:
        return {
            "status": "Compilation Error",
            "executionTimeMs": 0,
            "stdout": "",
            "stderr": exc.stderr or str(exc),
            "testResults": [],
        }
    except Exception as exc:
        raise ExecutionError(str(exc)) from exc

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
        cleanup()


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
