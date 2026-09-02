# Texto para a apresentacao

## Slide 1 - Titulo

**CI/CD e Observabilidade de uma API Node.js**

Texto para falar:

> O objetivo do trabalho foi automatizar a verificacao, a entrega e o monitoramento de uma
> API de locacao de veiculos. Utilizamos GitHub Actions, Docker, Terraform, LocalStack,
> Prometheus e Grafana.

## Slide 2 - Problema que queremos resolver

- Evitar publicar codigo que nao compila ou que quebra testes.
- Detectar problemas de seguranca e qualidade antes do deploy.
- Fazer deploy de forma repetivel.
- Saber se a aplicacao esta funcionando e recebendo requisicoes.

Texto para falar:

> Sem automacao, uma pessoa precisa executar varias verificacoes manualmente e pode esquecer
> alguma etapa. O pipeline transforma essas verificacoes em um processo padronizado.

## Slide 3 - GitHub Actions e CI

**GitHub Actions** e a ferramenta de automacao integrada ao GitHub. Um workflow e escrito em
YAML e possui jobs e passos.

Jobs implementados no CI:

- **SAST com Semgrep:** procura padroes de vulnerabilidade sem executar a aplicacao.
- **Build:** gera o Prisma Client e compila TypeScript para JavaScript.
- **Lint & Quality:** ESLint encontra problemas de codigo e Prettier verifica a formatacao.
- **Testes:** Jest valida regras de negocio e calcula a cobertura dos testes.

Texto para falar:

> CI significa integracao continua. A cada push ou pull request, o codigo passa pelas mesmas
> verificacoes. Se qualquer job falhar, o codigo precisa ser corrigido antes de continuar.

## Slide 4 - Docker e Docker Hub

**Docker** empacota a API e suas dependencias em uma imagem reproduzivel. Um container e uma
instancia em execucao dessa imagem.

**Docker Hub** armazena e distribui as imagens.

Tags utilizadas:

- `latest`: ultima versao aprovada.
- SHA do commit: identifica exatamente qual codigo esta na imagem.

Texto para falar:

> A tag do commit permite voltar ou investigar uma versao especifica. Assim, nao dependemos
> apenas da tag latest, que muda a cada publicacao.

## Slide 5 - Terraform, LocalStack e EC2

**Terraform** e uma ferramenta de Infraestrutura como Codigo. Em vez de criar recursos
manualmente no console, descrevemos a infraestrutura em arquivos `.tf`.

**LocalStack** emula servicos da AWS no computador, sem criar recursos reais e sem gerar
custos. Neste projeto ele emula o servico EC2.

O Terraform cria no LocalStack:

- Um Security Group para API e Grafana.
- Uma instancia EC2 emulada.

**EC2** e o servico de maquinas virtuais da AWS. Aqui usamos uma representacao local criada
pelo LocalStack e executamos os containers no mesmo Docker host.

Texto para falar:

> Toda a configuracao do Terraform ficou em um unico arquivo main.tf. O provider aponta para
> localhost na porta 4566, que e a porta principal do LocalStack.

## Slide 6 - Pipeline CD

Fluxo do CD:

```text
CI aprovado na main
        |
Build e Push Docker
        |
Terraform cria EC2 no LocalStack
        |
Deploy local com Docker Compose
        |
Verificacao do /health
```

Texto para falar:

> CD significa entrega continua. O workflow usa somente um commit aprovado pelo CI, publica
> a imagem, cria a EC2 emulada e atualiza os containers na maquina do runner self-hosted.

## Slide 7 - Prometheus

**Prometheus** e uma ferramenta de coleta e armazenamento de metricas em series temporais.
Ele usa o modelo pull: consulta periodicamente o endpoint `/metrics` da API.

Configuracao do trabalho:

- Intervalo de coleta: 5 segundos.
- Alvo: container `api`, porta `3000`.
- Endpoint: `/metrics`.

Texto para falar:

> Uma serie temporal e um valor associado ao tempo. Por exemplo, podemos acompanhar como o
> numero de requisicoes ou o consumo de memoria muda durante a demonstracao.

## Slide 8 - Grafana

**Grafana** consulta fontes de dados e transforma as metricas em paineis visuais.

O dashboard mostra:

- Total de requisicoes.
- Requisicoes por segundo separadas pelo status HTTP.
- Tempo de resposta p95.
- Memoria usada pela API.

Texto para falar:

> O p95 representa um tempo que 95% das requisicoes nao ultrapassaram. Ele ajuda a enxergar
> lentidao que uma simples media poderia esconder.

## Slide 9 - Instrumentacao da API

A API recebeu somente tres elementos relacionados a observabilidade:

- `/health`: informa se o processo esta respondendo.
- `/metrics`: publica as metricas no formato Prometheus.
- Middleware: conta requisicoes e mede o tempo de resposta.

Texto para falar:

> As regras de aluguel, usuario e veiculo nao foram alteradas. A instrumentacao foi mantida
> separada para reduzir o impacto no projeto original.

## Slide 10 - Arquitetura final

```text
Usuario ---> localhost:3000 ---> API ---> PostgreSQL
                        |
                        `-- /metrics <--- Prometheus
                                           |
Usuario ---> localhost:3001 ---> Grafana --------'
```

Texto para falar:

> PostgreSQL e Prometheus nao foram expostos diretamente na internet. A comunicacao acontece
> pela rede interna criada pelo Docker Compose.

## Slide 11 - Demonstracao ao vivo

### Preparacao antes da aula

1. Confirmar que os workflows CI e CD estao verdes.
2. Confirmar que o runner self-hosted e o Docker Desktop estao ligados.
3. Testar `http://localhost:3000/health`.
4. Testar o login em `http://localhost:3001`.
5. Deixar GitHub Actions, terminal, API e Grafana abertos em abas separadas.
6. Guardar uma captura de tela do dashboard como plano de contingencia.

### Passo a passo durante a apresentacao

1. Abrir **GitHub > Actions > CI** e mostrar os quatro jobs verdes.
2. Abrir **Actions > CD** e mostrar os jobs Docker, Terraform e Deploy.
3. Abrir `http://localhost:3000/health` e mostrar `{"status":"ok"}`.
4. Opcionalmente abrir `http://localhost:3000/metrics` e mostrar que os dados sao texto.
5. Entrar no Grafana com usuario `admin`.
6. Abrir **Dashboards > Observabilidade > API Observabilidade**.
7. Selecionar os ultimos 15 minutos e manter a atualizacao em 5 segundos.
8. Gerar trafego no PowerShell:

```powershell
1..50 | ForEach-Object {
  Invoke-RestMethod http://localhost:3000/health | Out-Null
  Start-Sleep -Milliseconds 200
}
```

9. Voltar ao Grafana e mostrar o aumento no total e na taxa de requisicoes.
10. Explicar que a memoria e uma metrica real do processo Node.js e que o p95 foi calculado
    a partir do histograma de duracao.

Frase sugerida para a demonstracao:

> Agora vou gerar cinquenta requisicoes reais. A API registra cada resposta, o Prometheus
> coleta os novos valores e o Grafana atualiza os paineis. Por isso existe um pequeno atraso
> de aproximadamente cinco segundos.

## Slide 12 - Conclusao

- O CI protege a qualidade antes da integracao.
- O CD torna a entrega reproduzivel e rastreavel.
- Terraform padroniza a infraestrutura.
- Prometheus coleta metricas reais.
- Grafana transforma as metricas em informacao visual.

Texto para falar:

> O resultado e um fluxo completo: alteramos o codigo, validamos automaticamente, publicamos
> uma imagem, atualizamos a infraestrutura e observamos a aplicacao em execucao.

## Perguntas que podem aparecer

**Por que usar a tag do commit alem de latest?**

Porque ela e imutavel e identifica exatamente a versao implantada.

**Prometheus e Grafana fazem a mesma coisa?**

Nao. Prometheus coleta e armazena metricas; Grafana consulta esses dados e cria visualizacoes.

**Por que o Prometheus nao esta aberto na internet?**

Porque somente o Grafana precisa consulta-lo. Reduzir portas publicas diminui a superficie de
ataque.

**O que acontece se um teste falhar?**

O CI fica vermelho e o CD nao inicia, pois ele depende de um CI aprovado na `main`.

**O que significa cobertura de testes?**

E a porcentagem do codigo exercitada durante os testes. Ela ajuda a encontrar partes sem
validacao, mas cobertura alta sozinha nao garante que os testes sejam bons.
