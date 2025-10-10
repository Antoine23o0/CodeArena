import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

const resolveRunnerPath = () => {
  if (process.env.RUNNER_PATH) {
    return process.env.RUNNER_PATH;
  }
  return path.resolve(process.cwd(), '../runner/run.py');
};

const RUNNER_PATH = resolveRunnerPath();

if (!fs.existsSync(RUNNER_PATH)) {
  throw new Error(`Runner introuvable à l'emplacement ${RUNNER_PATH}. Définissez RUNNER_PATH.`);
}

export const runSubmission = (payload) =>
  new Promise((resolve, reject) => {
    const processPayload = JSON.stringify(payload);
    const runner = spawn('python3', [RUNNER_PATH], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env },
    });

    let stdout = '';
    let stderr = '';

    runner.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    runner.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    runner.on('error', (error) => {
      reject(error);
    });

    runner.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(stderr || `Runner exited with code ${code}`));
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        reject(new Error(`Unable to parse runner response: ${error.message}`));
      }
    });

    runner.stdin.write(processPayload);
    runner.stdin.end();
  });

