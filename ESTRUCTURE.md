# 🧠 Core da API de Bonus Hunt — NestJS + Prisma

Este projeto é uma **API modular** desenvolvida em **NestJS**, utilizando **Prisma ORM** para persistência de dados.  
O objetivo é gerenciar o ecossistema de **Bonus Hunts**, contemplando usuários, slots, provedores, hunts, moedas e favoritos.

---

## 📁 Estrutura do Projeto

A aplicação segue uma arquitetura modular clara e organizada, separando responsabilidades por domínio.

### 📂 `src/core`

Contém toda a **lógica central** da aplicação — módulos globais, autenticação, configuração e integração com o banco.

- **core.module.ts** — Módulo principal que conecta o Prisma e os módulos centrais (`auth`, `config`, `database`, etc).
- **auth/** — Módulo de autenticação JWT, contendo guards, estratégias e decorators.
- **config/** — Configuração de variáveis de ambiente via `@nestjs/config` e validação com `Joi`.
- **database/** — Integração com o Prisma ORM e injeção global do `PrismaService`.
- **common/** — Contém utilitários, DTOs e pipes globais (ex: `HttpExceptionFilter`, `ValidationPipe` global).

---

### 📂 `src/modules`

Contém os **módulos funcionais** da aplicação, representando entidades do domínio.

- **users/** — Gerenciamento de usuários (cadastro, login, atualização de perfil, upload de avatar, troca de senha).
- **hunts/** — Gerenciamento das sessões de jogo (histórico, status, controle de apostas).
- **slots/** — Informações sobre os jogos disponíveis (RTP, volatilidade, provedor **gestão de slots favoritos**).
- **providers/** — Fornecedores de slots (ex: Pragmatic, Hacksaw, NetEnt).
- **currencies/** — Moedas disponíveis para transações nas hunts.

---

### 📂 `src/main.ts`

Arquivo de **entrada da aplicação**:

- Inicializa o NestJS (`NestFactory`).
- Configura pipes e interceptors globais.
- Serve os assets estáticos (ex: imagens de avatar).
- Define o uso global do `JwtAuthGuard` e `ValidationPipe`.

---

### 📂 `src/app.module.ts`

Módulo raiz da aplicação, responsável por importar:

- `CoreModule` (módulos centrais)
- `UsersModule` (e outros módulos de domínio)
- `ConfigModule` (para variáveis de ambiente globais)

---

### 📄 `.env`

Arquivo de variáveis de ambiente, validado via **Joi**.  
Contém as configurações de banco, servidor e autenticação JWT.

---

## 🗃️ Estrutura do Banco de Dados

![Diagrama ER](https://lucid.app/lucidchart/62f8e2d2-12f0-4c8e-8178-84dadb929667/edit?viewport_loc=-2294%2C-126%2C2307%2C1134%2C0_0&invitationId=inv_dbbed79c-10b5-4417-9d96-a9d1ab6c8828)

### **📂 Tabelas e Relacionamentos**

#### 🧍‍♂️ `users`

- Armazena dados dos usuários autenticados.
- Campos principais:
  - `id` (UUID, PK)
  - `user_name`, `email`, `password_hash`
  - `avatar` (imagem)
  - `last_login`, `created_at`, `updated_at`
- Relacionamentos:
  - `1:N` com `hunts` → um usuário pode ter várias hunts
  - `N:N` com `slots` via `favorite_slots`

---

#### 🎰 `slots`

- Representa um slot machine (jogo).
- Campos principais:
  - `id` (UUID, PK)
  - `name`, `rtp`, `volatility`, `max_multiplier`
  - `active` (boolean)
- Relacionamentos:
  - `1:N` com `providers`
  - `N:N` com `users` (tabela `favorite_slots`)
  - `1:N` com `hunt_slots`

---

#### 🏢 `providers`

- Fornecedores de slots (ex: Pragmatic, Hacksaw, NetEnt).
- Campos:
  - `id`, `name`, `active`
- Relacionamentos:
  - `1:N` com `slots`

---

#### 💰 `currencies`

- Moedas suportadas na aplicação.
- Campos:
  - `code` (PK, ex: “USD”)
  - `name`, `symbol`
- Relacionamentos:
  - `1:N` com `hunts`

---

#### 🧭 `hunts`

- Representa uma sessão de jogo (caça).
- Campos:
  - `id` (UUID, PK)
  - `user_id` (FK → `users`)
  - `currency_code` (FK → `currencies`)
  - `start_balance`, `total_bet`, `total_win`
  - `status` (enum: `DRAFT`, `ACTIVE`, `FINISHED`)
  - `created_at`, `updated_at`, `saved_at`, `finished_at`
- Relacionamentos:
  - `1:N` com `hunt_slots`

---

#### 🎯 `hunt_slots`

- Slots específicos jogados dentro de uma hunt.
- Campos:
  - `id` (UUID, PK)
  - `hunt_id` (FK → `hunts`)
  - `slot_id` (FK → `slots`)
  - `bet_amount`, `win_amount`
  - `is_opened` (boolean)
  - `created_at`, `updated_at`
- Relacionamentos:
  - `N:1` com `hunts`
  - `N:1` com `slots`

---

#### ⭐ `favorite_slots`

- Relacionamento `N:N` entre `users` e `slots` para salvar favoritos.
- Campos:
  - `user_id` (PK, FK → `users`)
  - `slot_id` (PK, FK → `slots`)
  - `created_at`

---

### **🧮 Resumo de Relacionamentos**

| Relação                 | Tipo | Descrição                                |
| ----------------------- | ---- | ---------------------------------------- |
| `users` ↔ `hunts`      | 1:N  | Um usuário pode ter várias hunts         |
| `users` ↔ `slots`      | N:N  | Favoritos, via `favorite_slots`          |
| `providers` ↔ `slots`  | 1:N  | Um provedor fornece vários slots         |
| `slots` ↔ `hunt_slots` | 1:N  | Cada slot pode ser usado em várias hunts |
| `hunts` ↔ `hunt_slots` | 1:N  | Cada hunt contém várias jogadas          |
| `currencies` ↔ `hunts` | 1:N  | Uma moeda é usada em várias hunts        |

---

## ⚙️ Tecnologias e Dependências

- **NestJS** — Framework backend modular e escalável
- **Prisma ORM** — Mapeamento de banco de dados e geração de tipagens
- **PostgreSQL** — Banco de dados relacional principal
- **JWT** — Autenticação e controle de acesso
- **Multer** - Gerenciamento de upload de imagens de avatar(Perfil)
- **bcrypt** — Hash de senhas
- **class-validator / class-transformer** — Validação de DTOs
- **dotenv / @nestjs/config** — Gerenciamento de variáveis de ambiente
- **Joi** - Validação e schema do `.env` (via `ConfigModule`)

---

## 🚀 Setup e Execução

### 1️⃣ Clonar o repositório

```bash
git clone https://github.com/seuusuario/bonus-hunt-api.git
cd bonus-hunt-api
```

### 2️⃣ Instalar dependências

```bash
npm install
```

### 3️⃣ Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz com:

```bash
# Conexão com PostgreSQL
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/database?schema=public

# JWT
JWT_SECRET=sua_chave_secreta
JWT_EXPIRES_IN=1d

# Aplicaçlão
APP_URL=http://localhost:3000
PORT=3000
```

### 4️⃣ Gerar o client Prisma

```bash
npx prisma generate
```

### 5️⃣ Rodar as migrações

```bash
npx prisma migrate dev
```

### 6️⃣ Iniciar o servidor

```bash
npm run start:dev
```

---

## 🔐 Autenticação

O módulo `core/auth` implementa **JWT com PassportStrategy**.

### Decorators:

- `@Public()` — Define rotas sem autenticação
- `@User()` — Retorna o usuário autenticado na requisição

### Guards:

- `JwtAuthGuard` — Protege rotas autenticadas
- (Futuro) `RolesGuard` — Controle de permissões baseado em roles (Talvez nem exista, apenas suposição)

---

## 🔐 Autenticação JWT — Estrutura Completa

A autenticação é gerenciada pelo módulo `core/auth` e possui separação **clara das responsabilidades:**

### **1. Configuração (`jwt.module.ts`)**

O JWT é configurado **de forma assíncrona** e global, lendo variáveis do `.env` através do `ConfigService`

```ts
@Module({
  imports: [
    ConfigModule,
    NestJwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) =: ({
        secret: config.get<string>('JWT_SECRET'),
        signOptionÇ {
          expiresIn: config.get('JWT_EXPIRES_IN', '7d'),
        },
      }),
    }),
  ],
  exports: [NestJwtModule],
})
export class JwtModule
```

---

### **2. Estratégia JWT (`jwt.strategy.ts`)**

Responsável por extrair e validar o token de auntenticação.

```ts
@Injectable()
export class JwtStrategy extends PassportStrateg(Strategy) {
  constructor(private readonly config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
}
```

---

### **3. Guard de Autenticação (`jwt-auth.guard.ts`)**

Protege rotas privadas e permite esxeções via decorator `@Public`

```ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      'IS_PUBLIC_KEY',
      [context.getHandler(), context.getClass()],
    );
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

---

### **4. Service e controller de autenticação**

`auth.service.ts`

```ts
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const user = await this.usersService.signup(dto);
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    return { user, accessToken };
  }

  async signin(dto: SigninDto) {
    const user = await this.usersService.signin(dto);
    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwtService.signAsync(payload);
    return { user, accessToken };
  }
}
```

`auth.controller.ts`
Como temos apenas signin e signup no auth, passamos o decorator `@Public` diretamente no controller, para dizer que todas as rotas são publicas.

```ts
@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }
}
```

## 🧩 Padrão Repository

Cada módulo (ex: `users`, `providers`, `slots`, `hunts`) segue o padrão **Repository Pattern**,
isolando a lógica de persistência (Prisma) da camada de serviço.

Exemplo:

```ts
// users.repository.ts
@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
```

---

## 🧠 Próximos Passos

- [ ] Adicionar RolesGuard e controle granular de acesso
- [ ] Implementar testes unitários com Jest
- [ ] Adicionar Swagger para documentação das rotas
- [ ] Criar seeds iniciais (usuário admin, moedas, provedores)
- [ ] Adicionar cache em endpoints críticos (Redis)

---

## 🧾 Observações

- O projeto está em constante evolução.
- O foco atual é consolidar os módulos **Users**, **Slots**, **Providers** e **Hunts** com fluxo completo de criação e leitura.
- O **Prisma Schema** deve ser sincronizado sempre que o diagrama ER for alterado.

---

📌 **Autor:** Diogo  
🛠️ Projeto pessoal em desenvolvimento com foco em arquitetura limpa e modular.
