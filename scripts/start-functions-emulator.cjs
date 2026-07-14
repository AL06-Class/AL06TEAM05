const { spawn } = require("node:child_process");

const extraArgs = process.argv.slice(2);
const child = spawn(
  "firebase",
  ["emulators:start", "--only", "functions", ...extraArgs],
  {
    env: {
      ...process.env,
      FUNCTIONS_DISCOVERY_TIMEOUT: "30000"
    },
    shell: true,
    stdio: "inherit"
  }
);

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
