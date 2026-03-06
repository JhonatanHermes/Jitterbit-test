const { spawn } = require('child_process');
const path = require('path');

console.log('--- INICIANDO ORQUESTRADOR DE TESTE ---');

const server = spawn('node', [path.join(__dirname, 'index.js')], { stdio: 'inherit' });

setTimeout(() => {
  const tests = spawn('node', [path.join(__dirname, 'testDesafio.js')], { stdio: 'inherit' });
  
  tests.on('exit', (code) => {
    console.log(`--- TESTES FINALIZADOS COM CÓDIGO ${code} ---`);
    server.kill();
    process.exit(code);
  });
}, 5000);
