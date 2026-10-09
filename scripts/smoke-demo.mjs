import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:net";

async function freePort() {
  const server = createServer();
  await new Promise((resolve,reject) => {
    server.once("error",reject);
    server.listen(0,"127.0.0.1",resolve);
  });
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const port=address.port;
  await new Promise(resolve=>server.close(resolve));
  return port;
}

if (process.env.DEMO_MODE !== "true" || !process.env.DATABASE_URL?.endsWith("/portfolio-demo.sqlite")) {
  throw new Error("Smoke tests refuse to run without explicit isolated demo mode and database.");
}

const port=await freePort();
const app=spawn(process.execPath,["node_modules/next/dist/bin/next","start","--hostname","127.0.0.1","--port",String(port)],{
  cwd: process.cwd(), env:{...process.env,NODE_ENV:"production"},stdio:["ignore","pipe","pipe"],
});
let recentLogs="";
for(const stream of [app.stdout,app.stderr]) stream.on("data",d=>{recentLogs=(recentLogs+String(d)).slice(-3500)});
const origin=`http://127.0.0.1:${port}`;
try {
  let online=false;
  for(let i=0;i<120;i++) {
    if(app.exitCode!==null)break;
    try {
      const r=await fetch(origin,{signal:AbortSignal.timeout(900)});
      if(r.status===200){online=true;break}
    }catch {/* Startup still underway */}
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  assert.ok(online,`Built Next server did not start: ${recentLogs}`);
  for (const [path,mustContain] of [
    ["/","DEMO FICTICIA"],
    ["/temas/1","DEMO FICTICIA"],
    ["/temas/1/test?mode=quick","EJEMPLO FICTICIO"],
    ["/temas/1/test?mode=complete","EJEMPLO FICTICIO"],
  ]) {
    const response=await fetch(origin+path,{signal:AbortSignal.timeout(12000)});
    const html=await response.text();
    assert.equal(response.status,200,`GET ${path} failed: ${html.slice(0,350)}`);
    assert.ok(html.includes(mustContain),`GET ${path}: expected visible demo marker ${mustContain}`);
  }
  console.log("Next.js synthetic demo smoke passed: dashboard, topic and both test modes.");
} finally {
  if(app.exitCode===null) {
    app.kill("SIGTERM");
    await Promise.race([
      new Promise(resolve=>app.once("exit",resolve)),
      new Promise(resolve=>setTimeout(resolve,1600)),
    ]);
    if(app.exitCode===null) app.kill("SIGKILL");
  }
}
