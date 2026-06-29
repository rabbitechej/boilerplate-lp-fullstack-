#!/usr/bin/env python3
"""Gera o Manual Docker da RabbiTech em PDF (A4)."""

from __future__ import annotations

import argparse
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase import pdfmetrics
from reportlab.platypus import (
    BaseDocTemplate,
    Frame,
    Image,
    KeepTogether,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)

PAGE_W, PAGE_H = A4
MARGIN_X = 28 * mm
TOP = 32 * mm
BOTTOM = 17 * mm

DARK = colors.HexColor("#12171C")
DARK_2 = colors.HexColor("#1B2835")
FOOT = colors.HexColor("#40474E")
PAPER = colors.HexColor("#D8E0E8")
PANEL = colors.HexColor("#E7ECF1")
BLUE = colors.HexColor("#1473C9")
BLUE_2 = colors.HexColor("#2E8AD4")
MID = colors.HexColor("#8C99A5")
WHITE = colors.white
TEXT = colors.HexColor("#172029")
GREEN = colors.HexColor("#298A62")
ORANGE = colors.HexColor("#D77B27")
RED = colors.HexColor("#B84343")


def register_fonts() -> tuple[str, str, str]:
    candidates = [
        (
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
        ),
        (
            "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
            "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation2/LiberationMono-Regular.ttf",
        ),
    ]
    for regular, bold, mono in candidates:
        if all(Path(item).exists() for item in (regular, bold, mono)):
            pdfmetrics.registerFont(TTFont("RabbiSans", regular))
            pdfmetrics.registerFont(TTFont("RabbiSansBold", bold))
            pdfmetrics.registerFont(TTFont("RabbiMono", mono))
            pdfmetrics.registerFontFamily(
                "RabbiSans", normal="RabbiSans", bold="RabbiSansBold",
                italic="RabbiSans", boldItalic="RabbiSansBold",
            )
            pdfmetrics.registerFontFamily(
                "RabbiMono", normal="RabbiMono", bold="RabbiMono",
                italic="RabbiMono", boldItalic="RabbiMono",
            )
            return "RabbiSans", "RabbiSansBold", "RabbiMono"
    return "Helvetica", "Helvetica-Bold", "Courier"


SANS, BOLD, MONO = register_fonts()
BASE = getSampleStyleSheet()
STYLES = {
    "chapter": ParagraphStyle(
        "Chapter", parent=BASE["Heading1"], fontName=BOLD, fontSize=14.5,
        leading=18, textColor=WHITE, spaceAfter=10 * mm,
    ),
    "h2": ParagraphStyle(
        "H2", parent=BASE["Heading2"], fontName=BOLD, fontSize=11,
        leading=14, textColor=TEXT, spaceBefore=2.2 * mm, spaceAfter=2.2 * mm,
    ),
    "body": ParagraphStyle(
        "Body", parent=BASE["BodyText"], fontName=SANS, fontSize=8.8,
        leading=12.2, textColor=TEXT, spaceAfter=2.5 * mm,
    ),
    "small": ParagraphStyle(
        "Small", parent=BASE["BodyText"], fontName=SANS, fontSize=7.4,
        leading=10, textColor=TEXT,
    ),
    "bullet": ParagraphStyle(
        "Bullet", parent=BASE["BodyText"], fontName=SANS, fontSize=8.5,
        leading=11.6, leftIndent=5 * mm, firstLineIndent=-3.5 * mm,
        bulletIndent=1 * mm, textColor=TEXT, spaceAfter=1.3 * mm,
    ),
    "code": ParagraphStyle(
        "Code", parent=BASE["Code"], fontName=MONO, fontSize=7.2,
        leading=10, textColor=colors.HexColor("#DCEBFA"),
    ),
    "callout": ParagraphStyle(
        "Callout", parent=BASE["BodyText"], fontName=SANS, fontSize=8.2,
        leading=11.5, textColor=TEXT,
    ),
    "toc": ParagraphStyle(
        "TOC", parent=BASE["BodyText"], fontName=SANS, fontSize=9,
        leading=12, textColor=TEXT,
    ),
}


class ManualDoc(BaseDocTemplate):
    def __init__(self, output: str, logo: str | None):
        super().__init__(
            output,
            pagesize=A4,
            title="RabbiTech — Manual Docker",
            author="RabbiTech",
            subject="Manual completo de Docker e Docker Compose",
            leftMargin=MARGIN_X,
            rightMargin=MARGIN_X,
            topMargin=TOP,
            bottomMargin=BOTTOM,
        )
        self.logo = logo
        frame = Frame(
            MARGIN_X, BOTTOM, PAGE_W - 2 * MARGIN_X, PAGE_H - TOP - BOTTOM,
            id="body", leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0,
        )
        self.addPageTemplates([
            PageTemplate(id="manual", frames=[frame], onPage=self.draw_page),
        ])

    def draw_page(self, canvas, doc):
        if doc.page == 1:
            self.draw_cover(canvas)
            return
        canvas.saveState()
        canvas.setFillColor(PAPER)
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        canvas.setFillColor(DARK)
        canvas.rect(0, PAGE_H - 28 * mm, PAGE_W, 28 * mm, fill=1, stroke=0)
        if self.logo and Path(self.logo).exists():
            canvas.drawImage(
                self.logo, 22 * mm, PAGE_H - 19 * mm, 12 * mm, 11.3 * mm,
                preserveAspectRatio=True, mask="auto",
            )
        canvas.setFillColor(WHITE)
        canvas.setFont(BOLD, 9)
        canvas.drawString(38 * mm, PAGE_H - 11 * mm, "RabbiTech")
        canvas.setFillColor(colors.HexColor("#AAB4BE"))
        canvas.setFont(SANS, 5.8)
        canvas.drawString(38 * mm, PAGE_H - 15.3 * mm, "Empresa Júnior de Ciências da Computação — UTFPR")
        canvas.setFillColor(DARK)
        canvas.rect(0, 0, PAGE_W, 10 * mm, fill=1, stroke=0)
        canvas.setFont(SANS, 5.8)
        canvas.setFillColor(MID)
        canvas.drawString(10 * mm, 3.5 * mm, "RabbiTech — Manual Docker")
        canvas.drawRightString(PAGE_W - 10 * mm, 3.5 * mm, f"Página {doc.page}")
        canvas.restoreState()

    def draw_cover(self, canvas):
        canvas.saveState()
        canvas.setFillColor(DARK)
        canvas.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)
        canvas.setFillColor(DARK_2)
        canvas.ellipse(-31 * mm, PAGE_H - 92 * mm, 38 * mm, PAGE_H + 18 * mm, fill=1, stroke=0)
        canvas.ellipse(PAGE_W - 52 * mm, -30 * mm, PAGE_W + 20 * mm, 86 * mm, fill=1, stroke=0)
        if self.logo and Path(self.logo).exists():
            canvas.drawImage(
                self.logo, PAGE_W / 2 - 30 * mm, PAGE_H - 126 * mm,
                60 * mm, 56.5 * mm, preserveAspectRatio=True, mask="auto",
            )
        canvas.setFillColor(WHITE)
        canvas.setFont(BOLD, 29)
        canvas.drawCentredString(PAGE_W / 2, PAGE_H - 164 * mm, "MANUAL DOCKER")
        canvas.setFillColor(MID)
        canvas.setFont(SANS, 11)
        canvas.drawCentredString(PAGE_W / 2, PAGE_H - 173 * mm, "Guia Completo para Membros da RabbiTech")
        canvas.setStrokeColor(MID)
        canvas.line(49 * mm, PAGE_H - 178 * mm, PAGE_W - 49 * mm, PAGE_H - 178 * mm)
        canvas.setFillColor(colors.HexColor("#CCD4DC"))
        canvas.setFont(SANS, 7.8)
        canvas.drawCentredString(
            PAGE_W / 2, PAGE_H - 184 * mm,
            "Imagens • Containers • Dockerfile • Compose • Volumes • Redes • Boas Práticas",
        )
        canvas.setFillColor(FOOT)
        canvas.rect(0, 0, PAGE_W, 28 * mm, fill=1, stroke=0)
        if self.logo and Path(self.logo).exists():
            canvas.drawImage(
                self.logo, 10 * mm, 6 * mm, 16 * mm, 15 * mm,
                preserveAspectRatio=True, mask="auto",
            )
        canvas.setFillColor(WHITE)
        canvas.setFont(BOLD, 8.5)
        canvas.drawString(30 * mm, 16 * mm, "RabbiTech")
        canvas.setFillColor(MID)
        canvas.setFont(SANS, 6)
        canvas.drawString(30 * mm, 10 * mm, "Empresa Júnior de Ciências da Computação — UTFPR")
        canvas.drawRightString(PAGE_W - 10 * mm, 10 * mm, "2026 • v1.0")
        canvas.restoreState()


def rich(text: str) -> str:
    # ReportLab não resolve famílias TTF customizadas dentro da tag <font>.
    # Courier é usado apenas nos pequenos trechos inline; blocos usam RabbiMono.
    return text.replace("name='RabbiMono'", "name='Courier'")


def p(text: str, style: str = "body") -> Paragraph:
    return Paragraph(rich(text), STYLES[style])


def bullet(text: str) -> Paragraph:
    return Paragraph(f"■&nbsp;&nbsp;{text}", STYLES["bullet"])


def heading(text: str) -> Paragraph:
    return p(text, "h2")


def code(title: str, lines: list[str]) -> Table:
    content = "<br/>".join(escape(line).replace(" ", "&nbsp;") for line in lines)
    table = Table([
        [Paragraph(f"<b>$ {escape(title)}</b>", ParagraphStyle(
            "CodeTitle", fontName=SANS, fontSize=6.6, leading=8, textColor=MID,
        ))],
        [Paragraph(content, STYLES["code"])],
    ], colWidths=[PAGE_W - 2 * MARGIN_X], hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), DARK),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#273747")),
        ("LINEBELOW", (0, 0), (-1, 0), 0.35, colors.HexColor("#33495D")),
        ("LEFTPADDING", (0, 0), (-1, -1), 7),
        ("RIGHTPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ]))
    return table


def callout(label: str, text: str, color=BLUE) -> Table:
    label_p = Paragraph(f"<b>{escape(label)}</b>", ParagraphStyle(
        "CalloutLabel", fontName=BOLD, fontSize=8, textColor=WHITE, alignment=TA_CENTER,
    ))
    text_p = Paragraph(rich(text), STYLES["callout"])
    table = Table([[label_p, text_p]], colWidths=[28 * mm, PAGE_W - 2 * MARGIN_X - 28 * mm])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), color),
        ("BACKGROUND", (1, 0), (1, 0), PANEL),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BOX", (0, 0), (-1, -1), 0.4, colors.HexColor("#B5C1CC")),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
    ]))
    return table


def table(headers: list[str], rows: list[list[str]], widths=None, font_size=7.2) -> Table:
    data = [
        [Paragraph(f"<b>{escape(cell)}</b>", ParagraphStyle(
            "TH", fontName=BOLD, fontSize=font_size, textColor=WHITE,
        )) for cell in headers]
    ]
    for row in rows:
        data.append([
            Paragraph(rich(cell), ParagraphStyle(
                "TD", fontName=MONO if idx == 0 else SANS, fontSize=font_size,
                leading=font_size + 2.3, textColor=TEXT,
            ))
            for idx, cell in enumerate(row)
        ])
    result = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    result.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), DARK),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#EDF1F5"), colors.HexColor("#DCE4EB")]),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.HexColor("#BBC5CE")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return result


def chapter(story: list, number: str, title: str):
    if story and not isinstance(story[-1], PageBreak):
        story.append(PageBreak())
    story.append(p(f"{number} — {title.upper()}", "chapter"))


def gap(story: list, size=3):
    story.append(Spacer(1, size * mm))


def build_story() -> list:
    s: list = [Spacer(1, 1), PageBreak()]

    chapter(s, "00", "Sumário")
    toc_rows = [
        ["01", "Docker: propósito e problema resolvido", "p. 3"],
        ["02", "Conceitos e arquitetura", "p. 4"],
        ["03", "Instalação e verificação", "p. 5"],
        ["04", "Primeiros containers", "p. 6"],
        ["05", "Imagens e ciclo de vida", "p. 7"],
        ["06", "Dockerfile e build", "p. 8–9"],
        ["07", "Volumes, redes e persistência", "p. 10–11"],
        ["08", "Docker Compose", "p. 12–13"],
        ["09", "Fluxo RabbiTech", "p. 14"],
        ["10", "Segurança e configuração", "p. 15"],
        ["11", "Diagnóstico e manutenção", "p. 16–17"],
        ["12", "Registry, publicação e CI", "p. 18"],
        ["13", "Referência rápida", "p. 19–20"],
        ["14", "Exercícios e checklist", "p. 21"],
        ["15", "Fontes oficiais", "p. 22"],
    ]
    s.append(table(["CAP.", "CONTEÚDO", "PÁGINA"], toc_rows, [18 * mm, 113 * mm, 20 * mm], 8))
    gap(s, 7)
    s.append(callout(
        "COMO USAR",
        "Leia do início ao fim na primeira vez. Depois mantenha as páginas de referência rápida "
        "abertas durante o trabalho. Comandos destrutivos estão marcados com atenção.",
    ))
    gap(s, 4)
    s.append(p(
        "<b>Escopo.</b> Este manual cobre o conjunto de comandos necessário no trabalho diário da equipe: "
        "Docker Engine/Desktop, imagens, containers, Dockerfile, Compose, volumes, redes, logs, limpeza e registry. "
        "Para opções menos frequentes, use <font name='RabbiMono'>docker &lt;comando&gt; --help</font>.",
    ))

    chapter(s, "01", "Docker: propósito e problema resolvido")
    s.append(heading("A dor: “na minha máquina funciona”"))
    s.append(p(
        "Projetos modernos dependem de versão do Node, banco, bibliotecas do sistema, variáveis de ambiente, "
        "portas e ferramentas auxiliares. Quando cada pessoa configura tudo manualmente, as máquinas divergem. "
        "O onboarding fica lento, bugs de ambiente consomem horas e a produção pode executar algo diferente do que foi testado.",
    ))
    s.append(heading("O que o Docker faz"))
    s.append(p(
        "Docker empacota aplicação, runtime e dependências em uma <b>imagem reproduzível</b>. A imagem inicia um "
        "<b>container isolado</b>. O repositório passa a declarar como o sistema é construído e executado; a equipe "
        "precisa instalar Docker, clonar o projeto e executar poucos comandos.",
    ))
    s.append(table(
        ["DOR", "SEM DOCKER", "COM DOCKER"],
        [
            ["Versões diferentes", "Cada máquina instala sua versão.", "A imagem fixa runtime e dependências."],
            ["Onboarding", "Checklist manual longo e frágil.", "Clone + docker compose up."],
            ["Banco local", "Instalação e limpeza manuais.", "Serviço isolado com volume próprio."],
            ["CI e produção", "Ambientes montados separadamente.", "A mesma imagem segue pelo pipeline."],
            ["Conflitos", "Serviços disputam portas e bibliotecas.", "Cada projeto possui rede e serviços próprios."],
            ["Rollback", "Reconfiguração ou novo deploy completo.", "Execute uma tag anterior da imagem."],
        ],
        [38 * mm, 55 * mm, 58 * mm],
    ))
    gap(s, 5)
    s.append(callout(
        "REGRA MENTAL",
        "<b>Imagem</b> é o molde imutável. <b>Container</b> é uma execução desse molde. "
        "<b>Dockerfile</b> fabrica a imagem. <b>Compose</b> coordena vários containers.",
        GREEN,
    ))
    s.append(heading("O que Docker não resolve sozinho"))
    for text in [
        "Não substitui testes, revisão de código, observabilidade, backup ou gestão de segredos.",
        "Não garante que desenvolvimento e produção sejam idênticos; configurações e infraestrutura ainda importam.",
        "Não é uma máquina virtual completa: containers compartilham o kernel do host e precisam de limites e atualizações.",
    ]:
        s.append(bullet(text))

    chapter(s, "02", "Conceitos e arquitetura")
    s.append(table(
        ["CONCEITO", "SIGNIFICADO"],
        [
            ["Docker client", "O comando docker. Envia solicitações ao daemon."],
            ["Daemon / Engine", "Serviço dockerd que constrói imagens e gerencia containers, redes e volumes."],
            ["Image", "Template somente leitura, versionado por nome e tag."],
            ["Container", "Processo isolado criado a partir de uma imagem."],
            ["Registry", "Servidor de imagens: Docker Hub, GHCR ou registry privado."],
            ["Dockerfile", "Receita declarativa para construir uma imagem."],
            ["Compose", "Arquivo YAML que define uma aplicação com múltiplos serviços."],
            ["Volume", "Armazenamento persistente administrado pelo Docker."],
            ["Bind mount", "Arquivo ou pasta do host montado dentro do container."],
            ["Network", "Rede virtual para comunicação por nome entre serviços."],
        ],
        [38 * mm, 113 * mm],
    ))
    gap(s, 5)
    s.append(heading("Fluxo de uma aplicação"))
    s.append(code("fluxo conceitual", [
        "Dockerfile --docker build--> image:tag --docker run--> container",
        "compose.yaml ----------------docker compose up--------> varios containers",
        "registry <-- docker push / docker pull --> maquina ou servidor",
    ]))
    gap(s, 4)
    s.append(heading("Container x máquina virtual"))
    s.append(table(
        ["CONTAINER", "MÁQUINA VIRTUAL"],
        [
            ["Compartilha o kernel do host.", "Inclui um sistema operacional convidado completo."],
            ["Inicializa normalmente em segundos.", "Inicialização e imagem geralmente maiores."],
            ["Ótimo para empacotar serviços.", "Útil quando é necessário outro kernel/SO completo."],
            ["Isolamento por namespaces e cgroups.", "Isolamento via hypervisor."],
        ],
        [75.5 * mm, 75.5 * mm],
    ))

    chapter(s, "03", "Instalação e verificação")
    s.append(heading("Windows — Docker Desktop com WSL 2"))
    s.append(p(
        "Instale/atualize o WSL 2, baixe o Docker Desktop no site oficial e selecione o backend WSL 2. "
        "Após instalar, abra o Docker Desktop e aguarde o Engine ficar ativo.",
    ))
    s.append(code("PowerShell como administrador", [
        "wsl --install",
        "wsl --update",
        "wsl --version",
    ]))
    s.append(heading("macOS"))
    s.append(p(
        "Baixe o Docker Desktop correspondente ao processador Apple Silicon ou Intel, mova para Aplicativos e abra. "
        "Alternativamente, com Homebrew: <font name='RabbiMono'>brew install --cask docker</font>.",
    ))
    s.append(heading("Ubuntu — Engine oficial"))
    s.append(p(
        "Use o repositório APT oficial do Docker. As instruções completas mudam com a distribuição; consulte "
        "<link href='https://docs.docker.com/engine/install/ubuntu/' color='#1473C9'>docs.docker.com/engine/install/ubuntu</link>. "
        "O conjunto instalado deve incluir Engine, CLI, containerd, Buildx e o plugin Compose.",
    ))
    s.append(code("Ubuntu — após configurar o repositório oficial", [
        "sudo apt update",
        "sudo apt install docker-ce docker-ce-cli containerd.io \\",
        "  docker-buildx-plugin docker-compose-plugin",
        "sudo systemctl enable --now docker",
        "sudo usermod -aG docker $USER   # requer sair e entrar novamente",
    ]))
    s.append(callout(
        "SEGURANÇA",
        "Membros do grupo <font name='RabbiMono'>docker</font> possuem privilégios equivalentes a root. "
        "Não adicione usuários não confiáveis e não exponha o socket Docker.",
        ORANGE,
    ))
    gap(s, 3)
    s.append(heading("Verificação obrigatória"))
    s.append(code("terminal", [
        "docker version",
        "docker info",
        "docker compose version",
        "docker run --rm hello-world",
    ]))

    chapter(s, "04", "Primeiros containers")
    s.append(heading("Executar um servidor Nginx"))
    s.append(code("terminal", [
        "docker pull nginx:1.28-alpine",
        "docker run --name meu-nginx -d -p 8080:80 nginx:1.28-alpine",
        "docker ps",
        "curl http://localhost:8080",
        "docker logs meu-nginx",
        "docker stop meu-nginx",
        "docker start meu-nginx",
        "docker rm -f meu-nginx",
    ]))
    gap(s, 4)
    s.append(heading("Anatomia de docker run"))
    s.append(code("modelo", [
        "docker run [opcoes] IMAGEM[:TAG] [COMANDO] [ARGUMENTOS]",
        "docker run --name api -d -p 5000:5000 --env-file .env minha-api:1.0",
    ]))
    s.append(table(
        ["OPÇÃO", "FUNÇÃO"],
        [
            ["--name api", "Nome previsível para operar o container."],
            ["-d", "Executa em segundo plano (detached)."],
            ["-it", "Terminal interativo; combinação de -i e -t."],
            ["--rm", "Remove automaticamente quando terminar."],
            ["-p 8080:80", "Publica porta HOST:CONTAINER."],
            ["-e NOME=valor", "Define uma variável de ambiente."],
            ["--env-file .env", "Carrega variáveis de um arquivo."],
            ["-v origem:destino", "Monta volume ou pasta."],
            ["--network nome", "Conecta a uma rede Docker."],
            ["--restart unless-stopped", "Política de reinício."],
        ],
        [48 * mm, 103 * mm],
    ))
    s.append(callout(
        "ATENÇÃO",
        "<font name='RabbiMono'>-p 8080:80</font> não troca a porta interna. Significa: porta 8080 da sua máquina "
        "encaminha para a porta 80 do container.",
        ORANGE,
    ))

    chapter(s, "05", "Imagens e ciclo de vida")
    s.append(heading("Consultar e administrar imagens"))
    s.append(code("imagens", [
        "docker image ls",
        "docker pull node:22-bookworm-slim",
        "docker image inspect node:22-bookworm-slim",
        "docker history node:22-bookworm-slim",
        "docker tag minha-api:local rabbitech/minha-api:1.0.0",
        "docker image rm minha-api:local",
        "docker image prune              # remove imagens sem uso",
        "docker image prune -a           # remove todas sem container associado",
    ]))
    s.append(heading("Consultar e administrar containers"))
    s.append(code("containers", [
        "docker container ls            # somente ativos",
        "docker container ls -a         # todos",
        "docker container inspect api",
        "docker container stats",
        "docker container top api",
        "docker container stop api",
        "docker container start api",
        "docker container restart api",
        "docker container rename api api-antiga",
        "docker container rm api",
        "docker container rm -f api     # força remoção",
        "docker container prune         # remove todos os parados",
    ]))
    s.append(heading("Estados importantes"))
    s.append(p(
        "<b>created</b> → criado, ainda não iniciado; <b>running</b> → processo principal ativo; "
        "<b>exited</b> → processo terminou; <b>restarting</b> → política de restart em ação; "
        "<b>paused</b> → processos suspensos; <b>dead</b> → falha de remoção/estado inconsistente.",
    ))
    s.append(callout(
        "PRINCÍPIO",
        "Containers são descartáveis. Estado importante deve ficar em volume, banco externo ou serviço de objetos. "
        "Nunca trate o filesystem interno do container como backup.",
        GREEN,
    ))

    chapter(s, "06", "Dockerfile e build")
    s.append(heading("Dockerfile mínimo para uma API Node"))
    s.append(code("Dockerfile", [
        "FROM node:22-bookworm-slim",
        "WORKDIR /app",
        "COPY package.json package-lock.json ./",
        "RUN npm ci --omit=dev",
        "COPY . .",
        "ENV NODE_ENV=production",
        "USER node",
        "EXPOSE 5000",
        'CMD ["node", "dist/server.js"]',
    ]))
    s.append(table(
        ["INSTRUÇÃO", "PROPÓSITO"],
        [
            ["FROM", "Define a imagem-base; fixe uma tag específica."],
            ["WORKDIR", "Define o diretório para comandos seguintes."],
            ["COPY", "Copia arquivos do contexto para a imagem."],
            ["RUN", "Executa durante o build e cria uma camada."],
            ["ARG", "Variável somente de build; não use para segredos."],
            ["ENV", "Variável disponível na imagem/container."],
            ["USER", "Troca o usuário; evite executar como root."],
            ["EXPOSE", "Documenta a porta; não publica no host."],
            ["CMD", "Comando padrão executado ao iniciar."],
            ["ENTRYPOINT", "Executável principal, menos fácil de sobrescrever."],
            ["HEALTHCHECK", "Define como verificar a saúde do serviço."],
        ],
        [38 * mm, 113 * mm],
    ))
    s.append(heading("Construir e executar"))
    s.append(code("terminal", [
        "docker build -t minha-api:local .",
        "docker build --no-cache -t minha-api:local .",
        "docker build --build-arg VITE_API_URL=/api/v1 -t frontend:local .",
        "docker run --rm -p 5000:5000 --env-file .env minha-api:local",
    ]))

    chapter(s, "06.1", "Build multi-stage e contexto")
    s.append(heading("Imagem de produção multi-stage"))
    s.append(code("Dockerfile", [
        "FROM node:22-bookworm-slim AS build",
        "WORKDIR /app",
        "COPY package*.json ./",
        "RUN npm ci",
        "COPY tsconfig*.json ./",
        "COPY src ./src",
        "RUN npm run build",
        "",
        "FROM node:22-bookworm-slim AS runtime",
        "ENV NODE_ENV=production",
        "WORKDIR /app",
        "COPY package*.json ./",
        "RUN npm ci --omit=dev && npm cache clean --force",
        "COPY --from=build --chown=node:node /app/dist ./dist",
        "USER node",
        'CMD ["node", "dist/server.js"]',
    ]))
    s.append(heading(".dockerignore"))
    s.append(code(".dockerignore", [
        "node_modules",
        "dist",
        ".git",
        ".env",
        ".env.*",
        "*.log",
        "coverage",
    ]))
    s.append(p(
        "O contexto é o diretório final de <font name='RabbiMono'>docker build ... CONTEXTO</font>. "
        "Tudo que não estiver no <font name='RabbiMono'>.dockerignore</font> pode ser enviado ao daemon. "
        "Excluir dependências, builds, Git e segredos reduz tempo, tamanho e risco.",
    ))
    s.append(heading("Boas práticas de build"))
    for text in [
        "Copie manifests e instale dependências antes de copiar o código para aproveitar o cache.",
        "Use npm ci com lockfile, tags específicas e imagens oficiais menores.",
        "Separe compilação e runtime; o runtime não precisa de TypeScript nem ferramentas de teste.",
        "Use formato JSON em CMD/ENTRYPOINT para sinais de encerramento chegarem ao processo.",
        "Nunca copie .env, chaves SSH, tokens ou credenciais para uma imagem.",
    ]:
        s.append(bullet(text))

    chapter(s, "07", "Volumes, bind mounts e persistência")
    s.append(table(
        ["TIPO", "QUANDO USAR", "EXEMPLO"],
        [
            ["Volume nomeado", "Banco e dados persistentes.", "mongo_data:/data/db"],
            ["Bind mount", "Código/config local em desenvolvimento.", "./src:/app/src"],
            ["tmpfs", "Dados temporários e sensíveis em memória.", "--tmpfs /tmp"],
        ],
        [35 * mm, 66 * mm, 50 * mm],
    ))
    s.append(heading("Comandos de volume"))
    s.append(code("terminal", [
        "docker volume ls",
        "docker volume create dados-app",
        "docker volume inspect dados-app",
        "docker run -d --name mongo -v dados-app:/data/db mongo:8.0",
        "docker volume rm dados-app",
        "docker volume prune             # remove volumes não utilizados",
    ]))
    s.append(heading("Bind mount para desenvolvimento"))
    s.append(code("terminal", [
        "docker run --rm -it \\",
        "  --mount type=bind,src=\"$PWD\",dst=/app \\",
        "  -w /app node:22-bookworm-slim npm test",
    ]))
    s.append(callout(
        "PERIGO",
        "<font name='RabbiMono'>docker compose down -v</font> e <font name='RabbiMono'>docker volume prune</font> "
        "podem apagar bancos locais. Confirme backups e liste os volumes antes de executar.",
        RED,
    ))
    gap(s, 3)
    s.append(heading("Backup simples de volume"))
    s.append(code("exemplo genérico", [
        "docker run --rm -v dados-app:/data -v \"$PWD\":/backup \\",
        "  alpine tar czf /backup/dados-app.tgz -C /data .",
        "",
        "docker run --rm -v dados-app:/data -v \"$PWD\":/backup \\",
        "  alpine tar xzf /backup/dados-app.tgz -C /data",
    ]))
    s.append(p(
        "Para bancos reais, prefira ferramentas consistentes do próprio banco, como "
        "<font name='RabbiMono'>mongodump</font>/<font name='RabbiMono'>mongorestore</font> ou "
        "<font name='RabbiMono'>pg_dump</font>/<font name='RabbiMono'>pg_restore</font>.",
    ))

    chapter(s, "07.1", "Redes e comunicação")
    s.append(heading("Princípio central"))
    s.append(p(
        "Dentro de uma rede Docker, containers se encontram pelo <b>nome do serviço/container</b>. "
        "No Compose, a API usa <font name='RabbiMono'>mongodb://mongo:27017/banco</font>, não "
        "<font name='RabbiMono'>localhost</font>. Dentro do container, localhost aponta para ele próprio.",
    ))
    s.append(code("redes", [
        "docker network ls",
        "docker network create rede-app",
        "docker network inspect rede-app",
        "docker run -d --name banco --network rede-app mongo:8.0",
        "docker run --rm --network rede-app alpine ping -c 2 banco",
        "docker network connect rede-app api",
        "docker network disconnect rede-app api",
        "docker network rm rede-app",
        "docker network prune",
    ]))
    s.append(heading("Porta publicada x porta exposta"))
    s.append(table(
        ["SITUAÇÃO", "CONFIGURAÇÃO"],
        [
            ["Somente outros serviços precisam acessar", "Não publique. Use rede interna e porta do container."],
            ["O navegador/host precisa acessar", "Publique com ports / -p."],
            ["Restringir acesso ao host local", "127.0.0.1:5000:5000."],
            ["Frontend Nginx chama API no Compose", "proxy_pass http://api:5000."],
        ],
        [60 * mm, 91 * mm],
    ))
    s.append(callout(
        "SEGURANÇA",
        "Publique apenas portas necessárias. Bancos normalmente não precisam de porta no host quando a API está na mesma rede.",
        ORANGE,
    ))

    chapter(s, "08", "Docker Compose")
    s.append(heading("compose.yaml: aplicação com frontend, API e MongoDB"))
    s.append(code("compose.yaml — exemplo reduzido", [
        "services:",
        "  frontend:",
        "    build: ./frontend",
        '    ports: ["8080:80"]',
        "    depends_on:",
        "      api:",
        "        condition: service_healthy",
        "  api:",
        "    build: ./backend",
        "    environment:",
        "      PORT: 5000",
        "      MONGODB_URI: mongodb://mongo:27017/app",
        "    depends_on:",
        "      mongo:",
        "        condition: service_healthy",
        "  mongo:",
        "    image: mongo:8.0",
        "    volumes:",
        "      - mongo_data:/data/db",
        "volumes:",
        "  mongo_data:",
    ]))
    s.append(p(
        "Cada item em <font name='RabbiMono'>services</font> gera um serviço. O Compose cria rede, DNS e nomes. "
        "<font name='RabbiMono'>build</font> constrói uma imagem; <font name='RabbiMono'>image</font> usa uma imagem pronta; "
        "<font name='RabbiMono'>volumes</font> preserva dados.",
    ))
    s.append(callout(
        "IMPORTANTE",
        "<font name='RabbiMono'>depends_on</font> controla ordem. Para aguardar prontidão real, combine "
        "<font name='RabbiMono'>healthcheck</font> com <font name='RabbiMono'>condition: service_healthy</font>.",
        BLUE,
    ))

    chapter(s, "08.1", "Operação com Compose")
    s.append(code("fluxo principal", [
        "docker compose config                 # valida e renderiza",
        "docker compose build                  # constrói imagens",
        "docker compose up                     # primeiro plano",
        "docker compose up -d                  # segundo plano",
        "docker compose up -d --build          # reconstrói e sobe",
        "docker compose ps",
        "docker compose logs -f",
        "docker compose logs -f api",
        "docker compose exec api sh",
        "docker compose run --rm api npm test",
        "docker compose restart api",
        "docker compose stop",
        "docker compose start",
        "docker compose down",
        "docker compose down -v                # APAGA volumes",
    ]))
    s.append(heading("Comandos úteis adicionais"))
    s.append(code("compose", [
        "docker compose pull",
        "docker compose build --no-cache api",
        "docker compose up -d --scale worker=3",
        "docker compose top",
        "docker compose stats",
        "docker compose images",
        "docker compose cp api:/app/arquivo ./arquivo",
        "docker compose --env-file .env.dev up -d",
        "docker compose -f compose.yaml -f compose.prod.yaml up -d",
        "docker compose down --remove-orphans",
    ]))
    s.append(p(
        "<b>exec x run:</b> <font name='RabbiMono'>exec</font> entra em um serviço já ativo. "
        "<font name='RabbiMono'>run --rm</font> cria um container temporário com a configuração do serviço.",
    ))

    chapter(s, "09", "Fluxo RabbiTech neste boilerplate")
    s.append(heading("Arquitetura Docker validada"))
    s.append(table(
        ["SERVIÇO", "IMAGEM", "RESPONSABILIDADE"],
        [
            ["frontend", "Imagem própria: Vite → Nginx", "Serve a SPA e encaminha /api para a API."],
            ["api", "Imagem própria: TypeScript → Node", "Executa Express, autenticação e regras da aplicação."],
            ["mongo", "Imagem oficial mongo:8.0", "Persiste dados no volume mongo_data."],
        ],
        [28 * mm, 53 * mm, 70 * mm],
        6.8,
    ))
    s.append(p(
        "Frontend e backend possuem <b>Dockerfiles e imagens independentes</b>. Assim, cada parte pode ser "
        "reconstruída, atualizada e diagnosticada separadamente. O Compose conecta os três serviços pela rede interna.",
        "small",
    ))
    s.append(heading("Primeira execução"))
    s.append(code("raiz do projeto", [
        "git clone <url-do-repositorio>",
        "cd boilerplate-lp-fullstack-",
        "cp .env.docker.example .env",
        "# preencha JWT_SECRET, Cloudinary e administrador quando necessário",
        "docker compose config",
        "docker compose up --build",
        "# se 8080 estiver ocupada: APP_PORT=18080 docker compose up --build",
    ]))
    s.append(heading("Validar os serviços"))
    s.append(code("smoke tests", [
        "docker compose ps                 # frontend, api e mongo: healthy",
        "curl http://localhost:8080/health",
        "curl http://localhost:8080/api/v1/health",
        "curl http://localhost:8080/api/v1/ready",
        "docker compose logs --tail=100",
    ]))
    s.append(heading("Inicialização e rotina"))
    s.append(code("terminal", [
        "docker compose exec api npm run admin:create:prod",
        "docker compose exec api npm run seed:prod",
        "docker compose up -d --build",
        "docker compose down               # mantém o volume MongoDB",
    ]))
    s.append(heading("Quando reconstruir?"))
    s.append(table(
        ["ALTERAÇÃO", "AÇÃO"],
        [
            ["Código copiado no Dockerfile", "docker compose up -d --build"],
            ["package.json / lockfile", "Reconstruir a imagem."],
            ["Variável runtime da API", "Recriar o serviço: up -d api."],
            ["VITE_API_URL", "Rebuild do frontend; Vite embute no build."],
            ["Somente dados do Mongo", "Nenhum rebuild; volume preserva dados."],
            ["Dockerfile ou nginx.conf", "Rebuild do serviço afetado."],
        ],
        [62 * mm, 89 * mm],
    ))
    s.append(callout(
        "PADRÃO DA EQUIPE",
        "O <font name='RabbiMono'>compose.yaml</font>, Dockerfiles e lockfiles devem ser versionados. "
        "Arquivos <font name='RabbiMono'>.env</font>, volumes e credenciais nunca devem entrar no Git.",
        GREEN,
    ))

    chapter(s, "10", "Configuração, segredos e segurança")
    s.append(heading("Variáveis: build-time x runtime"))
    s.append(table(
        ["TIPO", "EXEMPLO", "OBSERVAÇÃO"],
        [
            ["Build ARG", "ARG VITE_API_URL", "Embute configuração no artefato; não é segredo."],
            ["Runtime ENV", "MONGODB_URI", "Fornecida ao iniciar o container."],
            ["Arquivo .env", "docker compose --env-file", "Local e ignorado pelo Git."],
            ["Secret manager", "CI/cloud/Swarm/K8s", "Preferido para produção."],
        ],
        [34 * mm, 50 * mm, 67 * mm],
    ))
    s.append(heading("Checklist de segurança"))
    for text in [
        "Use imagens oficiais, tags específicas e atualize regularmente.",
        "Execute como usuário não root e mantenha o filesystem imutável quando possível.",
        "Não use ARG/ENV/COPY para segredos no Dockerfile; camadas preservam histórico.",
        "Não monte /var/run/docker.sock em containers sem necessidade e análise de risco.",
        "Publique somente portas indispensáveis; restrinja banco à rede interna.",
        "Defina limites de CPU/memória e healthchecks em ambientes compartilhados.",
        "Faça scan de vulnerabilidades e gere SBOM no pipeline.",
        "Mantenha HTTPS, cookies Secure e NODE_ENV=production fora do ambiente local.",
    ]:
        s.append(bullet(text))
    s.append(code("inspeção de imagem com Docker Scout, se disponível", [
        "docker scout quickview minha-api:1.0.0",
        "docker scout cves minha-api:1.0.0",
        "docker sbom minha-api:1.0.0",
    ]))
    s.append(callout(
        "NUNCA",
        "Não envie <font name='RabbiMono'>.env</font> para o registry, não grave tokens no Dockerfile e não use "
        "credenciais de produção no Compose local.",
        RED,
    ))

    chapter(s, "11", "Logs, inspeção e diagnóstico")
    s.append(heading("Roteiro de diagnóstico"))
    s.append(code("1. estado", [
        "docker compose ps",
        "docker ps -a --filter name=api",
        "docker inspect api --format '{{.State.Status}} {{.State.ExitCode}}'",
    ]))
    s.append(code("2. logs", [
        "docker compose logs --tail=200 api",
        "docker compose logs -f --since=10m api",
        "docker logs --timestamps api",
    ]))
    s.append(code("3. processo, ambiente e rede", [
        "docker compose exec api sh",
        "docker compose exec api env",
        "docker compose exec api node -v",
        "docker compose exec api node -e \"require('net').connect(27017,'mongo')\"",
        "docker inspect api",
        "docker network inspect boilerplate-lp_default",
    ]))
    s.append(code("4. recursos e eventos", [
        "docker stats",
        "docker system df",
        "docker events --since 10m",
        "docker compose top",
    ]))
    s.append(heading("Copiar arquivos"))
    s.append(code("terminal", [
        "docker cp api:/app/log.txt ./log.txt",
        "docker cp ./config.json api:/app/config.json",
        "docker compose cp api:/app/log.txt ./log.txt",
    ]))
    s.append(callout(
        "DICA",
        "Leia primeiro o <b>primeiro erro útil</b> do log. Mensagens seguintes frequentemente são efeito cascata.",
        BLUE,
    ))

    chapter(s, "11.1", "Problemas comuns e manutenção")
    s.append(table(
        ["SINTOMA", "CAUSA PROVÁVEL / AÇÃO"],
        [
            ["Cannot connect to daemon", "Abra Docker Desktop ou inicie: sudo systemctl start docker."],
            ["unknown command: compose", "Plugin Compose não instalado/antigo. Instale docker-compose-plugin."],
            ["port is already allocated", "Outra aplicação usa a porta. docker ps e altere APP_PORT."],
            ["Container sai imediatamente", "O processo principal terminou. Consulte docker logs."],
            ["API não conecta ao banco", "Use hostname do serviço (mongo), não localhost."],
            ["Mudança não apareceu", "Reconstrua: docker compose up -d --build."],
            ["Build ignora mudanças", "Revise contexto/.dockerignore ou use --no-cache para diagnosticar."],
            ["Permission denied no volume", "Alinhe UID/GID ou permissões; evite chmod 777."],
            ["No space left on device", "docker system df; remova recursos sem uso conscientemente."],
            ["Cookie não funciona localmente", "HTTPS/Secure/NODE_ENV incompatíveis com ambiente local."],
        ],
        [52 * mm, 99 * mm],
        6.8,
    ))
    gap(s, 4)
    s.append(heading("Limpeza consciente"))
    s.append(code("terminal", [
        "docker system df",
        "docker container prune",
        "docker image prune",
        "docker builder prune",
        "docker network prune",
        "docker volume prune              # pode apagar dados",
        "docker system prune              # containers, redes e cache sem uso",
        "docker system prune -a --volumes # DESTRUTIVO: revise antes",
    ]))
    s.append(callout(
        "ANTES DE LIMPAR",
        "Execute <font name='RabbiMono'>docker system df</font>, "
        "<font name='RabbiMono'>docker ps -a</font> e <font name='RabbiMono'>docker volume ls</font>. "
        "Nunca use limpeza agressiva por hábito.",
        RED,
    ))

    chapter(s, "12", "Registry, tags e publicação")
    s.append(heading("Tags devem identificar artefatos"))
    s.append(p(
        "Use tags imutáveis como versão semântica e SHA do commit. <font name='RabbiMono'>latest</font> é um alias, "
        "não uma garantia de versão. Produção deve apontar para tag ou digest conhecido.",
    ))
    s.append(code("Docker Hub — exemplo", [
        "docker login",
        "docker build -t rabbitech/minha-api:1.4.0 ./backend",
        "docker tag rabbitech/minha-api:1.4.0 rabbitech/minha-api:latest",
        "docker push rabbitech/minha-api:1.4.0",
        "docker push rabbitech/minha-api:latest",
        "docker pull rabbitech/minha-api:1.4.0",
        "docker logout",
    ]))
    s.append(code("GitHub Container Registry — exemplo", [
        "echo \"$GHCR_TOKEN\" | docker login ghcr.io -u USUARIO --password-stdin",
        "docker build -t ghcr.io/rabbitech/minha-api:$GIT_SHA ./backend",
        "docker push ghcr.io/rabbitech/minha-api:$GIT_SHA",
    ]))
    s.append(heading("Pipeline recomendado"))
    for text in [
        "Rodar lint, typecheck e testes antes do build.",
        "Construir uma única imagem a partir de commit identificado.",
        "Escanear vulnerabilidades e registrar SBOM.",
        "Publicar no registry com SHA e versão.",
        "Promover a mesma imagem entre homologação e produção; só a configuração muda.",
        "Executar smoke test/healthcheck e manter estratégia de rollback.",
    ]:
        s.append(bullet(text))
    s.append(callout(
        "RASTREABILIDADE",
        "O deploy deve responder: qual commit gerou esta imagem, qual pipeline a validou e qual tag/digest está em execução?",
        GREEN,
    ))

    chapter(s, "13", "Referência rápida — containers e imagens")
    rows = [
        ["docker ps", "Lista containers ativos."],
        ["docker ps -a", "Lista todos os containers."],
        ["docker run --rm IMAGE", "Executa e remove ao terminar."],
        ["docker run -d --name N IMAGE", "Executa em segundo plano."],
        ["docker stop|start|restart N", "Controla execução."],
        ["docker rm -f N", "Remove container à força."],
        ["docker logs -f N", "Acompanha logs."],
        ["docker exec -it N sh", "Abre shell no container."],
        ["docker inspect N", "Mostra configuração/estado."],
        ["docker stats", "Uso de CPU e memória."],
        ["docker cp N:/origem destino", "Copia do container."],
        ["docker image ls", "Lista imagens."],
        ["docker pull IMAGE:TAG", "Baixa imagem."],
        ["docker build -t N:T .", "Constrói e nomeia imagem."],
        ["docker tag A:T B:T", "Cria outra tag."],
        ["docker push IMAGE:TAG", "Publica imagem."],
        ["docker image rm IMAGE", "Remove imagem."],
        ["docker history IMAGE", "Exibe camadas."],
        ["docker login|logout", "Autentica/desautentica."],
    ]
    s.append(table(["COMANDO", "AÇÃO"], rows, [78 * mm, 73 * mm], 6.9))
    gap(s, 4)
    s.append(callout(
        "AJUDA",
        "<font name='RabbiMono'>docker --help</font>, <font name='RabbiMono'>docker run --help</font> e "
        "<font name='RabbiMono'>docker compose --help</font> exibem a referência instalada na sua versão.",
        BLUE,
    ))

    chapter(s, "13.1", "Referência rápida — Compose, rede e dados")
    rows = [
        ["docker compose config", "Valida e renderiza configuração."],
        ["docker compose up -d --build", "Constrói e inicia serviços."],
        ["docker compose ps", "Mostra estado dos serviços."],
        ["docker compose logs -f S", "Acompanha logs do serviço."],
        ["docker compose exec S sh", "Shell em serviço ativo."],
        ["docker compose run --rm S CMD", "Tarefa temporária."],
        ["docker compose restart S", "Reinicia serviço."],
        ["docker compose down", "Remove containers/rede; mantém volume."],
        ["docker compose down -v", "Remove também volumes: cuidado."],
        ["docker network ls", "Lista redes."],
        ["docker network inspect N", "Detalha rede e membros."],
        ["docker volume ls", "Lista volumes."],
        ["docker volume inspect N", "Detalha volume."],
        ["docker system df", "Exibe uso de disco."],
        ["docker container prune", "Remove containers parados."],
        ["docker image prune", "Remove imagens sem uso."],
        ["docker builder prune", "Remove cache de build."],
        ["docker volume prune", "Remove volumes sem uso: cuidado."],
        ["docker system prune", "Limpeza combinada."],
    ]
    s.append(table(["COMANDO", "AÇÃO"], rows, [82 * mm, 69 * mm], 6.9))
    gap(s, 4)
    s.append(table(
        ["PRECISO...", "USE"],
        [
            ["ver por que caiu", "docker compose logs --tail=200 serviço"],
            ["entrar no container", "docker compose exec serviço sh"],
            ["rebuildar um serviço", "docker compose up -d --build serviço"],
            ["validar YAML/variáveis", "docker compose config"],
            ["parar sem perder banco", "docker compose down"],
            ["descobrir uso de disco", "docker system df"],
        ],
        [60 * mm, 91 * mm],
        7,
    ))

    chapter(s, "14", "Exercícios e checklist")
    s.append(heading("Exercício 1 — ciclo básico"))
    for text in [
        "Execute nginx:1.28-alpine em localhost:8081, dê um nome ao container e rode em segundo plano.",
        "Liste, inspecione logs, pare, inicie novamente e remova o container.",
        "Explique a diferença entre imagem e container para outra pessoa.",
    ]:
        s.append(bullet(text))
    s.append(heading("Exercício 2 — persistência e rede"))
    for text in [
        "Crie uma rede e um volume nomeado.",
        "Inicie MongoDB conectado à rede e ao volume.",
        "Use um container temporário na mesma rede para resolver o hostname do banco.",
        "Remova o container e confirme que o volume continua existindo.",
    ]:
        s.append(bullet(text))
    s.append(heading("Exercício 3 — projeto RabbiTech"))
    for text in [
        "Configure .env, valide com docker compose config e suba o boilerplate.",
        "Confirme healthchecks, acesse frontend e API e acompanhe logs.",
        "Crie o administrador, rode o seed e reinicie a stack sem perder dados.",
        "Altere um texto do frontend, faça rebuild somente do serviço e valide.",
    ]:
        s.append(bullet(text))
    s.append(heading("Checklist antes do PR"))
    checklist = [
        ["□", "Dockerfile multi-stage e imagem-base com tag definida."],
        ["□", ".dockerignore exclui Git, .env, dependências e artefatos."],
        ["□", "Container não executa como root sem justificativa."],
        ["□", "Healthcheck e encerramento via SIGTERM funcionam."],
        ["□", "Dados persistentes estão em volume; nenhum segredo foi copiado."],
        ["□", "docker compose config, build e testes passaram."],
        ["□", "README informa portas, variáveis, comandos e procedimento de reset."],
    ]
    s.append(table(["", "VERIFICAÇÃO"], checklist, [10 * mm, 141 * mm], 7.5))

    chapter(s, "15", "Fontes oficiais e encerramento")
    s.append(heading("Documentação consultada"))
    sources = [
        ("Visão geral do Docker", "https://docs.docker.com/get-started/docker-overview/"),
        ("Instalação do Docker Engine", "https://docs.docker.com/engine/install/"),
        ("Docker Desktop", "https://docs.docker.com/desktop/"),
        ("Referência da CLI", "https://docs.docker.com/reference/cli/docker/"),
        ("Referência do Compose", "https://docs.docker.com/reference/cli/docker/compose/"),
        ("Dockerfile", "https://docs.docker.com/reference/dockerfile/"),
        ("Boas práticas de build", "https://docs.docker.com/build/building/best-practices/"),
        ("Volumes", "https://docs.docker.com/engine/storage/volumes/"),
        ("Redes", "https://docs.docker.com/engine/network/"),
        ("Cheat sheet oficial", "https://docs.docker.com/get-started/docker_cheatsheet.pdf"),
    ]
    source_rows = [
        [name, f"<link href='{url}' color='#1473C9'>{url}</link>"]
        for name, url in sources
    ]
    s.append(table(["TEMA", "LINK"], source_rows, [48 * mm, 103 * mm], 6.5))
    gap(s, 7)
    s.append(callout(
        "PRÓXIMO PASSO",
        "Execute os exercícios com um projeto descartável. Docker se torna previsível quando a equipe entende "
        "o ciclo imagem → container → logs → descarte e trata dados/segredos separadamente.",
        GREEN,
    ))
    gap(s, 8)
    s.append(p(
        "<b>Padrão operacional RabbiTech:</b> arquivos declarativos versionados, builds reproduzíveis, "
        "imagens identificáveis, segredos fora do Git e dados persistentes com backup.",
    ))
    s.append(Spacer(1, 18 * mm))
    thanks = ParagraphStyle(
        "Thanks", fontName=BOLD, fontSize=18, leading=22, textColor=DARK, alignment=TA_CENTER,
    )
    s.append(Paragraph("CONSTRUA UMA VEZ.<br/>EXECUTE DE FORMA PREVISÍVEL.", thanks))
    return s


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", required=True)
    parser.add_argument("--logo")
    args = parser.parse_args()
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    doc = ManualDoc(str(output), args.logo)
    doc.build(build_story())
    print(output)


if __name__ == "__main__":
    main()
