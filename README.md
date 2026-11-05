# VetClin Internação — Sistema de Internação Veterinária

Sistema web para gestão da **ala de internação** de clínicas e hospitais veterinários: mapa de boxes, prescrição com cálculo automático de dose, checagem de medicações por horário, monitoramento, calculadora de soro e boletim médico para o tutor.

## Funcionalidades

| Módulo | O que faz |
| --- | --- |
| **Mapa de internação** | Boxes por ala (Cães, Gatos, UTI, Isolamento), ocupação, gravidade (estável/atenção/crítico), próxima medicação, atrasos, soro em curso, alta prevista. |
| **Agenda de medicações** | Todas as doses de todos os pacientes nas próximas 2/6/12/24 h, com destaque para as atrasadas e botão de checagem rápida. |
| **Nova internação** | Dados do paciente e tutor, box, entrada, alta prevista, queixa, anamnese, alergias, jejum/isolamento e **diagnóstico por seleção** (~150 diagnósticos organizados por sistema, com busca e opção de texto livre). |
| **Prescrição** | Bulário com ~80 fármacos (Cerenia/maropitant, opioides, dipirona, AINEs, antibióticos, corticoides, anticonvulsivantes, insulinas...). Escolhe o fármaco → sugere a dose da espécie → **calcula mg e mL/comprimidos pelo peso**, alerta dose fora da faixa e contraindicações em gatos, gera os horários (SID, BID, TID, QID...), duração, SOS, diluição. |
| **Mapa de execução** | Grade de 24 h por medicação. Toque no horário → aplicado / não aplicado (com motivo), responsável e hora real. |
| **Monitoramento** | Comeu / bebeu / vomitou / urinou / fezes em botões rápidos, temperatura, FC, FR, PAS, glicemia, TPC, SpO₂, peso, escala de dor, consciência, mucosas, hidratação. Valores fora da referência em vermelho e gráficos de evolução. |
| **Soro / fluidoterapia** | Manutenção (AAHA ou mL/kg/dia), déficit por % de desidratação, perdas, mL/h, gotas/min (macro e micro), seg/gota, bolus de choque. Calculadora de **KCl** (tabela de Scott + limite 0,5 mEq/kg/h) e de **infusão contínua (CRI)**. |
| **Boletim médico** | Gerado automaticamente com base nos registros (alimentação, água, vômito, urina, fezes, dor, parâmetros, tratamento em linguagem leiga, alta prevista). Editável, com envio direto pelo **WhatsApp**, copiar, imprimir/PDF e histórico. |
| **Alta** | Alta, óbito ou transferência; receita para casa (copia medicações orais), orientações prontas, retorno, sumário de alta para impressão e envio ao tutor. Libera o box automaticamente. |
| **Profissionais** | Cadastro da equipe (veterinários com CRMV, enfermeiros, auxiliares, estagiários, recepção), ativar/desativar e quem está de plantão. O CRMV do veterinário responsável assina o boletim e a alta. |
| **Configurações** | Dados da clínica, alas e quantidade de boxes, backup/restauração. |

> As doses do bulário são referências da literatura veterinária para apoio à decisão. A prescrição final é sempre responsabilidade do médico-veterinário.

## Como rodar

```bash
npm install
npm run dev        # desenvolvimento em http://localhost:5173
npm run build      # gera a versão de produção em dist/
npm run build:single  # gera um único arquivo dist-single/index.html (funciona offline)
```

## Publicação

O workflow `.github/workflows/deploy.yml` publica automaticamente no **GitHub Pages** a cada push na `main`
(ative em *Settings → Pages → Source: GitHub Actions*).

## Dados

Nesta versão os dados ficam salvos no navegador (localStorage) do computador/tablet usado. Use **Configurações → Exportar backup** regularmente.
O acesso de vários computadores ao mesmo tempo (multiusuário, login e nuvem) exige um backend — a camada de dados está isolada em `src/store.tsx` para facilitar essa migração.

## Estrutura

```
src/
  data/        bulário (medicamentos) e diagnósticos
  utils/       cálculos (dose, soro, KCl, CRI), boletim, impressão, formatação
  components/  modal, chips, calculadoras, checagem de dose, seletor de diagnóstico
  pages/       mapa, agenda, internação, pacientes, calculadoras, bulário, configurações
  pages/paciente/  abas da ficha do paciente
```
