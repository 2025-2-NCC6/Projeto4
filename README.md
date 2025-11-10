# 🌿 EnerSave - Sistema de Automação e Gestão Inteligente de Salas

## 📋 Descrição do Projeto

O **EnerSave** é um projeto interdisciplinar que integra IoT, automação e gestão inteligente de recursos para ambientes acadêmicos. O sistema foi desenvolvido para otimizar o uso de salas, controlar o acesso via RFID, monitorar equipamentos em tempo real e promover a economia de energia através de automação inteligente.

O projeto combina **hardware industrial** (placa DBX MIO Flex, Arduino/ESP32) com uma **aplicação web moderna** (Next.js + React), permitindo gerenciamento completo de reservas, controle remoto de equipamentos via relés, monitoramento de consumo energético em tempo real e geração de relatórios para tomada de decisões baseadas em dados.

### 🔑 Diferenciais do Projeto

- **Automação Industrial Real**: Utiliza a placa **DBX MIO Flex** para controle profissional de até 10 canais de relés
- **Monitoramento em Tempo Real**: Leitura de tensão, corrente, potência e energia via protocolo UDP
- **Economia de Energia**: Desliga equipamentos automaticamente quando salas não estão em uso
- **Controle de Acesso**: Sistema RFID/NFC integrado com banco de dados
- **Interface Web Moderna**: Dashboard responsivo com controles em tempo real

## ✨ Funcionalidades Principais

### Para Administradores
- 📊 **Dashboard completo** com métricas e estatísticas em tempo real
- 🏢 **Gerenciamento de salas** (cadastro, edição, exclusão e configuração)
- 👥 **Gestão de usuários** (cadastro, permissões e acompanhamento)
- 📅 **Sistema de reservas** com calendário interativo e grade horária
- 📈 **Relatórios e analytics** de uso e economia de energia
- 🛠️ **Controle de equipamentos** e relés via MQTT
- 🔍 **Logs de acesso** e auditoria

### Para Usuários
- 🎫 **Solicitação de reservas** de salas
- 📋 **Visualização de reservas ativas**
- 🔐 **Acesso via RFID/NFC**
- ⚠️ **Registro de problemas** nas salas
- 📊 **Dashboard pessoal** com histórico

### Sistema IoT
- 🔌 **Controle automático de relés** (iluminação, ar-condicionado)
- 📡 **Comunicação MQTT** em tempo real
- 🎴 **Leitura de cartões RFID/NFC**
- 📊 **Monitoramento de sensores** (presença, temperatura, luminosidade)
- 🤖 **Automação baseada em regras** e horários

## 📁 Estrutura de Pastas

```
Projeto4/
│
├── Banner/                                    # Materiais de apresentação
│   └── Banner_PI_80x120_2025_2 EnerSave2.pptx
│
├── documentos/                                # Documentação acadêmica
│   ├── ENTREGA 1/
│   │   ├── ENTREGA 1 - Inovação e Empreendedorismo/
│   │   ├── ENTREGA 1 - Projeto Interdisciplinar Internet das Coisas/
│   │   ├── ENTREGA 1 - Redes de Computadores e Cibersegurança/
│   │   ├── ENTREGA 1 - Sistemas Embarcados e Robótica/
│   │   │   ├── codigo.ino                    # Código Arduino (sistema de senha/RFID)
│   │   │   └── Relatório Protótipo - PI.pdf
│   │   └── ENTREGA 1 - Teoria da Computação e Linguagens Formais/
│   │
│   └── ENTREGA 2/
│       ├── ENTREGA 2 - Inovação e Empreendedorismo/
│       │   └── CANVAS PI.pdf                 # Business Model Canvas
│       ├── ENTREGA 2 - Projeto Interdisciplinar Internet das Coisas/
│       ├── ENTREGA 2 - Redes de Computadores e Cibersegurança/
│       │   ├── Plano_Flex_DBXMIO_2025.pdf
│       │   ├── Plano_Recuperacao_Desastres_Enerserve_2025.pdf
│       │   └── Security Audit Report.pdf
│       ├── ENTREGA 2 - Sistemas Embarcados e Robótica/
│       └── ENTREGA 2 - Teoria da Computação e Linguagens Formais/
│
├── src/                                       # Código-fonte principal
│   │
│   ├── automacao/                            # Aplicação Web (Next.js)
│   │   ├── app/                              # Rotas e páginas
│   │   │   ├── admin-faculdade/              # Área administrativa
│   │   │   │   ├── alertas/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── planejamento/
│   │   │   │   ├── planejamento-reservas/
│   │   │   │   ├── salas/
│   │   │   │   ├── simulacao-sala/
│   │   │   │   ├── solicitacoes/
│   │   │   │   └── usuarios/
│   │   │   │
│   │   │   ├── usuario/                      # Área do usuário
│   │   │   │   ├── dashboard/
│   │   │   │   ├── minhas-reservas/
│   │   │   │   ├── problemas/
│   │   │   │   └── solicitar-reserva/
│   │   │   │
│   │   │   ├── api/                          # API Routes (Backend)
│   │   │   │   ├── acesso/
│   │   │   │   ├── acesso-sala/
│   │   │   │   ├── admin/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── equipamentos/
│   │   │   │   ├── logs/
│   │   │   │   ├── problemas/
│   │   │   │   ├── registrations/
│   │   │   │   ├── reservas/
│   │   │   │   ├── rfid/
│   │   │   │   ├── salas/
│   │   │   │   ├── sensores/
│   │   │   │   └── usuarios/
│   │   │   │
│   │   │   ├── login/
│   │   │   └── globals.css
│   │   │
│   │   ├── components/                       # Componentes React
│   │   │   ├── admin/                        # Componentes administrativos
│   │   │   ├── layout/                       # Layouts e estruturas
│   │   │   ├── sala-painel/                  # Painel de controle de salas
│   │   │   ├── totem/                        # Interface de totem/kiosk
│   │   │   └── ui/                           # Componentes UI (shadcn/ui)
│   │   │
│   │   ├── contexts/                         # Context API do React
│   │   │   ├── sidebar-context.tsx
│   │   │   └── user-context.tsx
│   │   │
│   │   ├── hooks/                            # Custom React Hooks
│   │   │   ├── use-mobile.ts
│   │   │   ├── use-rfid-stream.ts
│   │   │   └── use-toast.ts
│   │   │
│   │   ├── lib/                              # Bibliotecas e utilitários
│   │   │   ├── api/
│   │   │   ├── mqtt/                         # Cliente MQTT
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   ├── validations/
│   │   │   ├── prisma.ts
│   │   │   ├── relay-mapping.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── prisma/                           # ORM e banco de dados
│   │   │   ├── migrations/
│   │   │   └── schema.prisma
│   │   │
│   │   ├── public/                           # Arquivos públicos
│   │   │   ├── logo-enerSave.png
│   │   │   └── logo-enerSave2.png
│   │   │
│   │   ├── scripts/                          # Scripts SQL e utilitários
│   │   │   └── seed-sala-exemplo.sql
│   │   │
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── next.config.mjs
│   │
│   ├── ENVIOPARASISTEMA.ino                  # Código Arduino/ESP32 (IoT)
│   │
│   └── servidor/                             # Servidor MIO (comunicação com DBX MIO)
│       └── servidor/
│           ├── server.js                     # Servidor Node.js (HTTP + UDP)
│           ├── CONFIG.md                     # Guia de configuração do MIO
│           ├── package.json
│           └── src/
│               └── mio-udp.js                # Cliente UDP para DBX MIO
│
└── README.md                                  # Este arquivo
```

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Next.js 16** - Framework React com SSR
- **React 18.2** - Biblioteca de interface do usuário
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 4** - Framework CSS utilitário
- **shadcn/ui** - Componentes UI (Radix UI)
- **Framer Motion** - Animações
- **FullCalendar** - Calendário interativo
- **Recharts** - Gráficos e visualizações
- **Zod** - Validação de schemas
- **React Hook Form** - Gerenciamento de formulários

### Backend
- **Next.js API Routes** - Backend serverless
- **Prisma 6** - ORM (Object-Relational Mapping)
- **Node.js** - Runtime JavaScript
- **MQTT** - Protocolo de mensageria IoT
- **Nodemailer** - Envio de e-mails

### Hardware/IoT
- **DBX MIO Flex** - Placa de automação industrial (controle de relés via UDP)
- **Arduino/ESP32** - Microcontrolador
- **Módulo RFID/NFC** - Leitura de cartões
- **Relés** - Controle de equipamentos (10 canais)
- **Sensores** - Monitoramento ambiental (temperatura, corrente, tensão, potência)
- **LEDs** - Feedback visual

### Banco de Dados
- **MySQL** - Banco de dados relacional (via Prisma)

### Comunicação
- **UDP Protocol** - Comunicação com a placa DBX MIO Flex (comandos e leituras)
- **MQTT Protocol** - Comunicação IoT em tempo real
- **WebSockets** - Comunicação bidirecional
- **REST API** - Endpoints HTTP para frontend

### UI/UX
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas
- **Sonner** - Notificações toast
- **next-themes** - Tema dark/light

## 🚀 Como Executar o Projeto

### Pré-requisitos

**Software:**
- Node.js 18+ instalado
- npm ou pnpm
- Banco de dados (PostgreSQL ou MySQL)
- Arduino IDE (para programar o hardware)

**Hardware (opcional para testes reais):**
- Placa DBX MIO Flex (automação industrial)
- Arduino/ESP32 com módulo RFID
- Rede local (para comunicação UDP com o DBX MIO)

### Instalação - Aplicação Web

```bash
# Navegue até o diretório da aplicação
cd src/automacao

# Instale as dependências
npm install
# ou
pnpm install

# Configure as variáveis de ambiente
# Crie um arquivo .env com:
# DATABASE_URL="sua_connection_string"
# MQTT_BROKER_URL="mqtt://seu_broker:1883"
# NEXT_PUBLIC_API_URL="http://localhost:3000"

# Execute as migrações do banco de dados
npx prisma migrate dev

# Inicie o servidor de desenvolvimento
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

### Instalação - Servidor MIO (Comunicação com DBX MIO)

```bash
# Navegue até o diretório do servidor
cd src/servidor/servidor

# Instale as dependências
npm install

# Configure as variáveis de ambiente
# Crie um arquivo .env com:
# PORT=3001
# MIO_IP="192.168.1.100"  (IP da placa DBX MIO)
# MIO_PORT=20108
# NEXT_API_URL="http://localhost:3000"

# Execute o servidor
npm start
# ou
node server.js
```

O servidor MIO ficará disponível em `http://localhost:3001`

### Instalação - Hardware (Arduino/ESP32)

1. Abra o arquivo `src/ENVIOPARASISTEMA.ino` na Arduino IDE
2. Instale as bibliotecas necessárias:
   - Adafruit_LiquidCrystal
   - Keypad
   - MQTT (PubSubClient)
   - WiFi/ESP32
3. Configure as credenciais WiFi e MQTT no código
4. Faça upload para o microcontrolador

## 🏭 DBX MIO Flex - Placa de Automação Industrial

### O que é o DBX MIO?

O **DBX MIO Flex** é uma placa de automação industrial utilizada no projeto EnerSave para controlar equipamentos de forma inteligente e remota. É o coração do sistema IoT, responsável por:

- **Controlar relés** - Liga/desliga equipamentos (iluminação, ar-condicionado, projetores)
- **Monitorar consumo** - Lê dados de tensão, corrente, potência e energia
- **Comunicação UDP** - Recebe comandos e envia leituras via rede local
- **Automação em tempo real** - Responde a comandos da aplicação web instantaneamente

### Especificações Técnicas

- **Protocolo**: UDP (User Datagram Protocol)
- **Porta de Comandos**: 20108 (padrão)
- **Porta de Leituras**: 20109 (padrão)
- **Canais de Relés**: 10 canais independentes
- **Tensão de Operação**: 12-24V DC
- **Conectividade**: Ethernet RJ45
- **Formato de Dados**: JSON

### Como Funciona no Projeto

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│  Next.js    │  HTTP   │  MIO Server  │   UDP   │  DBX MIO    │
│  Frontend   ├────────▶│  (Node.js)   ├────────▶│  Flex       │
│  (Web App)  │         │  Port 3001   │         │  Hardware   │
└─────────────┘         └──────────────┘         └─────────────┘
                               │                         │
                               │ ◄───────────────────────┘
                               │   Leituras (UDP)
                               ▼
                        ┌──────────────┐
                        │   Prisma     │
                        │   Database   │
                        └──────────────┘
```

### Configuração do Servidor MIO

```bash
# 1. Navegue até o diretório do servidor
cd src/servidor/servidor

# 2. Crie o arquivo .env com as configurações
cat > .env << EOF
PORT=3001
MIO_IP=192.168.1.100       # IP da placa MIO (ajustar conforme sua rede)
MIO_PORT=20108             # Porta UDP para enviar comandos
NEXT_API_URL=http://localhost:3000
EOF

# 3. Instale as dependências
npm install

# 4. Inicie o servidor MIO
npm start
```

### Testando a Conexão com o DBX MIO

#### 1. Verificar Status do Servidor
```bash
curl http://localhost:3001
```

#### 2. Controlar um Relé
```bash
# Ligar relé 1 (ex: iluminação)
curl -X POST http://localhost:3001/mio/relay \
  -H "Content-Type: application/json" \
  -d '{"action":"ON","relay":1}'

# Desligar relé 1
curl -X POST http://localhost:3001/mio/relay \
  -H "Content-Type: application/json" \
  -d '{"action":"OFF","relay":1}'
```

#### 3. Simular Leituras de Sensores
```bash
# Simular leitura de energia
node scripts/test-sensor.js energia

# Simular leitura de temperatura
node scripts/test-sensor.js temperatura
```

### Mapeamento de Relés

| Relé | Equipamento         | Função                          |
|------|---------------------|---------------------------------|
| 1    | Iluminação Sala 1   | Liga/desliga luzes             |
| 2    | Ar-condicionado 1   | Controla climatização          |
| 3    | Iluminação Sala 2   | Liga/desliga luzes             |
| 4    | Ar-condicionado 2   | Controla climatização          |
| 5    | Projetor Sala 1     | Liga/desliga equipamento       |
| 6    | Tomadas Inteligentes| Controla alimentação           |
| 7-10 | Reserva             | Disponível para expansão       |

### Formato de Comandos

**Comando HTTP (API → Servidor MIO)**
```json
{
  "action": "ON",     // "ON" ou "OFF"
  "relay": 1          // Número do relé (1-10)
}
```

**Comando UDP (Servidor MIO → DBX MIO)**
```json
{
  "command": "relay_set",
  "id": 1,            // ID do relé
  "value": 1          // 1 = ligar, 0 = desligar
}
```

**Resposta de Leitura (DBX MIO → Servidor)**
```json
{
  "relay_id": 1,
  "voltage": 220.5,    // Tensão em Volts
  "current": 2.3,      // Corrente em Amperes
  "power": 506.15,     // Potência em Watts
  "energy": 1.245,     // Energia acumulada em kWh
  "temperature": 24.5, // Temperatura ambiente
  "timestamp": "2025-11-10T14:30:00Z"
}
```

### Solução de Problemas

#### Problema: "MIO_IP não configurado"
**Solução**: Crie o arquivo `.env` no diretório `src/servidor/servidor/` com o IP correto da placa.

#### Problema: Relés não respondem
**Checklist**:
- ✅ Placa MIO está ligada e conectada à rede?
- ✅ IP no arquivo `.env` está correto?
- ✅ Computador e placa estão na mesma rede local?
- ✅ Firewall não está bloqueando a porta UDP 20108?
- ✅ Servidor MIO está rodando (`npm start`)?

#### Problema: Não recebe leituras
**Solução**: Verifique se a placa está configurada para enviar dados UDP para o IP do servidor na porta 20109.

### Como Descobrir o IP da Placa MIO

**Opção 1: Pelo Roteador**
1. Acesse o painel administrativo do seu roteador (geralmente `192.168.1.1`)
2. Procure por "Dispositivos Conectados" ou "DHCP Clients"
3. Identifique o dispositivo "MIO" ou pelo endereço MAC

**Opção 2: Scanner de Rede**
```bash
# Windows
arp -a

# Linux/Mac
sudo nmap -sn 192.168.1.0/24
```

### Integração com o Sistema

O DBX MIO está integrado em múltiplas partes do sistema:

1. **Dashboard Admin** - Controle manual de equipamentos
2. **Sistema de Reservas** - Ativação automática ao iniciar reserva
3. **Alertas** - Notificações de consumo anormal
4. **Analytics** - Gráficos de consumo energético
5. **Simulação de Sala** - Teste de equipamentos antes da reserva

### Documentação Completa

Para mais detalhes sobre configuração e troubleshooting, consulte:
- `src/servidor/servidor/CONFIG.md` - Guia completo de configuração
- `documentos/ENTREGA 2/Redes de Computadores e Cibersegurança/Plano_Flex_DBXMIO_2025.pdf`

## 👥 Equipe e Disciplinas Envolvidas

Este projeto interdisciplinar integra conhecimentos de:

- **Inovação e Empreendedorismo** - Business Model Canvas, análise de mercado
- **Projeto Interdisciplinar Internet das Coisas** - Arquitetura IoT, integração de sistemas
- **Redes de Computadores e Cibersegurança** - Segurança, planos de recuperação, auditoria
- **Sistemas Embarcados e Robótica** - Programação Arduino, sensores, atuadores
- **Teoria da Computação e Linguagens Formais** - Algoritmos, estruturas de dados

## 📄 Licença

Este projeto foi desenvolvido para fins acadêmicos.

## 📞 Contato

Para mais informações sobre o projeto, consulte a documentação na pasta `documentos/`.

---

**Desenvolvido pela equipe EnerSave - 2025**
