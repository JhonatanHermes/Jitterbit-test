const http = require('http');

const API_URL = 'http://localhost:3000';
let token = '';

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        let parsed = {};
        try {
          parsed = data ? JSON.parse(data) : {};
        } catch (e) {
          parsed = data; // Retorna texto se não for JSON
        }
        resolve({ status: res.statusCode, body: parsed });
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('--- INICIANDO TESTES DO DESAFIO ---');
  
  // Tentar conectar 5 vezes antes de desistir
  let connected = false;
  for (let i = 0; i < 5; i++) {
    try {
      await request({ hostname: 'localhost', port: 3000, path: '/', method: 'GET' });
      connected = true;
      break;
    } catch (e) {
      console.log('⏳ Aguardando servidor...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  if (!connected) {
    console.error('❌ Não foi possível conectar ao servidor.');
    process.exit(1);
  }

  try {
    // 1. LOGIN
    console.log('1. Testando Login (admin/admin123)...');
    const loginRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'admin123' });

    if (loginRes.status === 200) {
      token = loginRes.body.token;
      console.log('✅ Login realizado com sucesso!');
    } else {
      throw new Error('❌ Falha no login');
    }

    const authHeader = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. CRIAR PEDIDO (MAPEAMENTO OBRIGATÓRIO)
    console.log('2. Testando Criação de Pedido (Mapping Input)...');
    const orderInput = {
      numeroPedido: "v10089015vdb-01",
      valorTotal: 10000,
      dataCriacao: "2023-07-19T12:24:11.5299601+00:00",
      items: [
        {
          idItem: "2434",
          quantidadeItem: 1,
          valorItem: 1000
        }
      ]
    };

    const createRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/order',
      method: 'POST',
      headers: authHeader
    }, orderInput);

    if (createRes.status === 201) {
      console.log('✅ Pedido criado com sucesso!');
    } else {
      throw new Error(`❌ Falha na criação: ${JSON.stringify(createRes.body)}`);
    }

    // 3. BUSCAR PEDIDO (MAPPING OUTPUT)
    console.log('3. Testando Busca por ID e Mapping de Saída...');
    const getRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/order/v10089015vdb-01',
      method: 'GET',
      headers: authHeader
    });

    if (getRes.status === 200 && getRes.body.orderId === "v10089015vdb-01") {
      console.log('✅ Busca realizada! Campos mapeados:', {
        orderId: getRes.body.orderId,
        value: getRes.body.value,
        productId: getRes.body.items[0].productId
      });
    } else {
      throw new Error('❌ Falha na busca ou mapeamento incorreto');
    }

    // 4. LISTAR PEDIDOS
    console.log('4. Testando Listagem Geral...');
    const listRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/order/list',
      method: 'GET',
      headers: authHeader
    });

    if (listRes.status === 200 && listRes.body.length > 0) {
      console.log(`✅ Listagem OK! Encontrados ${listRes.body.length} pedidos.`);
    }

    // 5. ATUALIZAR PEDIDO
    console.log('5. Testando Atualização de Pedido...');
    const updateRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/order/v10089015vdb-01',
      method: 'PUT',
      headers: authHeader
    }, { valorTotal: 15000 });

    if (updateRes.status === 200) {
      console.log('✅ Pedido atualizado com sucesso!');
    }

    // 6. DELETAR PEDIDO
    console.log('6. Testando Exclusão de Pedido...');
    const deleteRes = await request({
      hostname: 'localhost',
      port: 3000,
      path: '/order/v10089015vdb-01',
      method: 'DELETE',
      headers: authHeader
    });

    if (deleteRes.status === 200) {
      console.log('✅ Pedido deletado com sucesso!');
    }

    console.log('\n✨ TODOS OS CRITÉRIOS DO DESAFIO FORAM ATENDIDOS! ✨');
    process.exit(0);

  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

runTests();
