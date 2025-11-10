-- Script para criar sala de exemplo para testar o painel
-- Execute este script no MySQL

USE automacao_campus;

-- Criar sala de exemplo
INSERT INTO sala (nome, tipo, predio, patrocinada, empresa_patrocinadora, ativo) 
VALUES 
  ('Lab. Informática 301', 'lab_info', 'A', FALSE, NULL, TRUE),
  ('Sala de Aula 205', 'aula', 'B', FALSE, NULL, TRUE),
  ('Lab. Maker 102', 'lab_make', 'A', TRUE, 'FECAP Tech', TRUE),
  ('Auditório Principal', 'teatro', 'C', FALSE, NULL, TRUE);

-- Criar professor de exemplo (se ainda não existir)
INSERT IGNORE INTO usuario (nome, email, tipo, tag_uid, ativo) 
VALUES 
  ('Prof. João Silva', 'joao.silva@fecap.br', 'professor', NULL, TRUE),
  ('Prof. Maria Santos', 'maria.santos@fecap.br', 'professor', NULL, TRUE);

-- Criar horários fixos de exemplo (segunda-feira)
INSERT INTO horario_fixo (sala_id, usuario_id, dia_semana, hora_inicio, hora_fim)
SELECT 
  s.id,
  u.id,
  'seg',
  '14:00:00',
  '16:00:00'
FROM sala s
CROSS JOIN usuario u
WHERE s.nome = 'Lab. Informática 301'
  AND u.nome = 'Prof. João Silva'
LIMIT 1;

-- Criar mais horários
INSERT INTO horario_fixo (sala_id, usuario_id, dia_semana, hora_inicio, hora_fim)
SELECT 
  s.id,
  u.id,
  'ter',
  '10:00:00',
  '12:00:00'
FROM sala s
CROSS JOIN usuario u
WHERE s.nome = 'Sala de Aula 205'
  AND u.nome = 'Prof. Maria Santos'
LIMIT 1;

-- Verificar salas criadas
SELECT id, nome, tipo, predio, ativo FROM sala ORDER BY id;

