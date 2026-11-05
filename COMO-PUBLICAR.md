# Como colocar o VetClin Internação no ar

São 3 etapas: **Supabase** (banco de dados e login), **Netlify** (site) e **primeiro acesso**.
Leva uns 20 minutos. Use o e-mail da VetClin em tudo.

---

## 1. Supabase — banco de dados

1. Entre em **supabase.com** → *Start your project* → entre com o e-mail da VetClin.
2. Clique em **New project**:
   - Name: `vetclin`
   - Database password: crie uma senha forte e **guarde** (não é usada no dia a dia, mas é a chave mestra do banco).
   - Region: **South America (São Paulo)**.
   - Plano: **Free**.
3. Quando o projeto terminar de criar, no menu lateral abra **SQL Editor** → **New query**.
4. Abra o arquivo [`supabase/schema.sql`](supabase/schema.sql) deste repositório, copie **todo** o conteúdo, cole no editor e clique em **Run**. Deve aparecer *Success*.
5. Menu **Authentication** → **Sign In / Providers** → **Email**:
   - Desligue **Confirm email** e salve. Assim, quando você cadastrar um profissional com senha provisória, ele já consegue entrar na hora.
   - (Se preferir deixar ligado, cada pessoa precisa clicar no link que chega no e-mail antes do primeiro acesso.)
6. Menu **Project Settings** → **API Keys** (ou **Data API**). Copie dois valores:
   - **Project URL** — algo como `https://abcdxyz.supabase.co`
   - **anon public key** (ou **Publishable key**) — um texto longo.

   ⚠️ Nunca use a chave *service_role* / *secret* no site.

## 2. Netlify — o site

1. Entre em **netlify.com** → *Sign up* com a conta do GitHub.
2. **Add new site** → **Import an existing project** → **GitHub** → escolha o repositório `SaS-interna-o-`.
3. Em *Branch to deploy*, escolha a branch do sistema (hoje: `claude/saas-internacao-veterinaria-ndvuhr`, ou `main` depois de juntar).
   As configurações de build já vêm do arquivo `netlify.toml` — não precisa mexer.
4. Antes de publicar, em **Environment variables** (ou depois em *Site configuration → Environment variables*), adicione:

   | Key | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | o Project URL do passo 1.6 |
   | `VITE_SUPABASE_ANON_KEY` | a anon/publishable key do passo 1.6 |

5. Clique em **Deploy**. Em 1–2 minutos o site fica no ar num endereço como `vetclin-internacao.netlify.app`
   (dá para trocar o nome em *Site configuration → Change site name*, ou ligar um domínio próprio).
6. Volte no Supabase → **Authentication** → **URL Configuration** e coloque esse endereço em **Site URL**.
   É para onde vai o link de “Esqueci minha senha”.

> Se mudar as variáveis depois, faça um novo deploy (*Deploys → Trigger deploy*), porque elas entram no site na hora da construção.

## 3. Primeiro acesso

1. Abra o endereço do site. Vai aparecer **Primeiro acesso**: crie a conta do **administrador** (seu nome, e-mail da VetClin e uma senha).
   Só a primeira conta vira administradora automaticamente.
2. No menu, abra **Painel administrativo** → **Novo usuário** e cadastre cada profissional:
   - **Administrador**: tudo, inclusive usuários e configurações.
   - **Médico-veterinário**: interna, prescreve, ajusta soro, boletim e alta. Informe o **CRMV** (sai na assinatura dos documentos).
   - **Auxiliar / Enfermagem**: vê os pacientes, checa medicações e registra monitoramento e anotações. **Não** interna, não prescreve, não mexe no soro, não emite boletim nem dá alta.
3. Passe para cada pessoa o endereço do site, o e-mail e a senha provisória. Ela pode trocar a senha em “Esqueci minha senha”.
4. Em **Configurações**, confira nome, endereço e telefone da clínica e as alas/boxes.

Para tirar o acesso de alguém: Painel administrativo → **Bloquear**. O histórico do que a pessoa fez continua salvo.

## 4. Instalar como aplicativo (celular e computador)

- **Android (Chrome)**: abra o site → menu ⋮ → **Instalar aplicativo** / **Adicionar à tela inicial**.
- **iPhone (Safari)**: abra o site → botão Compartilhar → **Adicionar à Tela de Início**.
- **Computador (Chrome/Edge)**: ícone de instalar na barra de endereço.

Fica com o ícone da VetClin e abre em tela cheia, como um aplicativo.

## 5. Como funciona sem internet

- Cada aparelho precisa ter **entrado com internet pelo menos uma vez**.
- Sem internet, o sistema continua abrindo e funcionando: checar medicação, registrar monitoramento, prescrever etc.
  O rodapé do menu mostra **“Sem internet • N pendente(s)”**.
- Tudo fica guardado no aparelho e é **enviado sozinho quando a internet volta**.
- Se duas pessoas mexerem no mesmo paciente ao mesmo tempo, o sistema junta as duas coisas (por exemplo: uma checou a medicação e a outra registrou a temperatura — ficam as duas). Só se as duas mudarem **exatamente o mesmo campo** vale a última enviada.
- Precisam de internet: login no primeiro acesso do aparelho, cadastro de usuários, histórico de atividades e envio de boletim pelo WhatsApp.

## 6. Cuidados com o plano gratuito

- O Supabase gratuito **pausa o projeto depois de 7 dias sem nenhum uso**. Com a clínica usando todo dia isso não acontece; se pausar, é só entrar no supabase.com e clicar em *Restore*.
- O plano gratuito **não guarda cópias automáticas**. Uma vez por semana: Painel administrativo → **Sincronização e backup** → **Baixar backup** e guarde o arquivo (Google Drive, pendrive).
- Limites do plano gratuito (500 MB de banco, 50 mil usuários) sobram para a internação da clínica por bastante tempo.
- Quando a clínica crescer ou quiser backup automático diário, o plano **Pro** do Supabase resolve sem mudar nada no sistema.
