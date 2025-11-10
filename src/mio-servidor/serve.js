import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { sendToMio } from "./src/mio-udp.js";

dotenv.config();

// Importar listener - ele inicia automaticamente ao ser importado
import "./src/mio-udp.js";
const app = express();
app.use(cors());
app.use(bodyParser.json());

//  API principal
app.post("/mio/relay", async (req, res) => {
  const { action, relay } = req.body;

  if (!action || relay === undefined)
    return res.status(400).json({ error: "Parâmetros inválidos" });

  try {
    const result = await sendToMio({ action, relay });
    console.log(result);
    res.json({ ok: true, message: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint para receber leituras do MIO via HTTP (webhook)
app.post("/mio/leitura", async (req, res) => {
  const dados = req.body;
  
  console.log(" Leitura recebida via HTTP:", dados);
  
  try {
    // Encaminhar para Next.js
    const response = await fetch(`${process.env.NEXT_API_URL || "http://localhost:3000"}/api/sensores/leitura`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dados_mio: dados,
        timestamp: new Date().toISOString(),
      }),
    });
    
    const result = await response.json();
    res.json({ ok: true, saved: result.success });
  } catch (err) {
    console.error("Erro ao processar leitura:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Endpoint para solicitar leitura de um relay específico
app.post("/mio/solicitar-leitura", async (req, res) => {
  const { relay_id } = req.body;
  
  console.log(` Solicitando leitura do Relay ${relay_id}`);
  
  try {
    // Enviar comando para a placa MIO solicitar status/leitura
    const comando = {
      command: "relay_status",
      id: relay_id,
    };
    
    await sendToMio({ action: "STATUS", relay: relay_id });
    
    res.json({ 
      ok: true, 
      message: `Leitura solicitada para Relay ${relay_id}. Aguarde resposta UDP na porta 20109.` 
    });
  } catch (err) {
    console.error("Erro ao solicitar leitura:", err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: " Servidor MIO ativo",
    endpoints: {
      relay: "POST /mio/relay - Controlar relays",
      leitura: "POST /mio/leitura - Receber leituras de sensores",
    },
    config: {
      mio_ip: process.env.MIO_IP || "não configurado",
      mio_port: process.env.MIO_PORT || "não configurado",
      listening_port: 20109,
    },
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n${"=".repeat(60)}`);
  console.log(` Servidor MIO rodando em http://localhost:${PORT}`);
  console.log(`${"=".repeat(60)}`);
  console.log(`\n📡 Configuração da placa MIO:`);
  console.log(`   IP: ${process.env.MIO_IP || '⚠️  NÃO CONFIGURADO'}`);
  console.log(`   Porta Envio (UDP): ${process.env.MIO_PORT || '⚠️  NÃO CONFIGURADO'}`);
  console.log(`   Porta Escuta (UDP): 20109`);
  
  console.log(`\n APIs Disponíveis:`);
  console.log(`   POST /mio/relay   → Controlar relays`);
  console.log(`   POST /mio/leitura → Receber leituras de sensores`);
  console.log(`   GET  /            → Status do servidor`);
  
  console.log(`\n Integração:`);
  console.log(`   Next.js: ${process.env.NEXT_API_URL || 'http://localhost:3000'}`);
  
  if (!process.env.MIO_IP || !process.env.MIO_PORT) {
    console.log(`\n ATENÇÃO: Configure o arquivo .env com:`);
    console.log(`   MIO_IP=192.168.1.100  (IP da sua placa)`);
    console.log(`   MIO_PORT=20108`);
    console.log(`   NEXT_API_URL=http://localhost:3000`);
    console.log(`\ Veja CONFIG.md para mais detalhes`);
  } else {
    console.log(`\n Sistema pronto!`);
    console.log(`   - Envio de comandos: `);
    console.log(`   - Captura de leituras: `);
    console.log(`   - Salvamento no banco: `);
  }
  console.log(`\n${"=".repeat(60)}\n`);
});
