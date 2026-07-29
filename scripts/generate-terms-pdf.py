from html import escape
import json
from pathlib import Path
import shutil

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
CONTENT_PATH = ROOT / "tmp" / "pdfs" / "terms-content.json"
PUBLIC_DIRECTORY = ROOT / "public" / "legal"
QA_DIRECTORY = ROOT / "output" / "pdf"


def normalize_text(value: str) -> str:
    return (
        value.replace("\u2018", "'")
        .replace("\u2019", "'")
        .replace("\u201c", '"')
        .replace("\u201d", '"')
        .replace("\u2011", "-")
        .replace("\u2013", "-")
        .replace("\u2014", "-")
    )


def paragraph_text(value: str) -> str:
    return escape(normalize_text(value))


def draw_page(canvas, document):
    canvas.saveState()
    width, height = A4
    canvas.setStrokeColor(document.brand_border)
    canvas.line(22 * mm, height - 18 * mm, width - 22 * mm, height - 18 * mm)
    canvas.setFillColor(document.brand_primary)
    canvas.setFont("Helvetica-Bold", 8.5)
    canvas.drawString(22 * mm, height - 14 * mm, "OLGISH CAKES")
    canvas.setFillColor(document.brand_muted)
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(width - 22 * mm, height - 14 * mm, f"Terms version {document.terms_version}")
    canvas.setStrokeColor(document.brand_border)
    canvas.line(22 * mm, 16 * mm, width - 22 * mm, 16 * mm)
    canvas.setFillColor(document.brand_muted)
    canvas.drawString(22 * mm, 11 * mm, "olgishcakes.co.uk/terms")
    canvas.drawRightString(width - 22 * mm, 11 * mm, f"Page {document.page}")
    canvas.restoreState()


def build_pdf(content: dict, output_path: Path):
    palette = content["colors"]
    brand_primary = colors.HexColor(palette["primary"])
    brand_secondary = colors.HexColor(palette["secondary"])
    brand_text = colors.HexColor(palette["text"])
    brand_muted = colors.HexColor(palette["muted"])
    brand_background = colors.HexColor(palette["background"])
    brand_border = colors.HexColor(palette["border"])

    document = SimpleDocTemplate(
        str(output_path),
        pagesize=A4,
        leftMargin=22 * mm,
        rightMargin=22 * mm,
        topMargin=25 * mm,
        bottomMargin=22 * mm,
        title=normalize_text(content["title"]),
        author="Olgish Cakes",
        subject="Terms of Service",
    )
    document.brand_primary = brand_primary
    document.brand_muted = brand_muted
    document.brand_border = brand_border
    document.terms_version = content["version"]

    base = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "LegalTitle",
        parent=base["Title"],
        fontName="Helvetica-Bold",
        fontSize=24,
        leading=29,
        textColor=brand_primary,
        alignment=TA_CENTER,
        spaceAfter=6 * mm,
    )
    subtitle_style = ParagraphStyle(
        "LegalSubtitle",
        parent=base["BodyText"],
        fontName="Helvetica",
        fontSize=11,
        leading=16,
        textColor=brand_muted,
        alignment=TA_CENTER,
        spaceAfter=4 * mm,
    )
    metadata_style = ParagraphStyle(
        "LegalMetadata",
        parent=base["BodyText"],
        fontName="Helvetica-Bold",
        fontSize=8.5,
        leading=12,
        textColor=brand_primary,
        alignment=TA_CENTER,
        spaceAfter=7 * mm,
    )
    heading_style = ParagraphStyle(
        "LegalHeading",
        parent=base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=13.5,
        leading=17,
        textColor=brand_primary,
        spaceBefore=5 * mm,
        spaceAfter=2.5 * mm,
        keepWithNext=True,
    )
    body_style = ParagraphStyle(
        "LegalBody",
        parent=base["BodyText"],
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=brand_text,
        spaceAfter=2.6 * mm,
        allowWidows=0,
        allowOrphans=0,
    )
    link_style = ParagraphStyle(
        "LegalLink",
        parent=body_style,
        fontSize=8.5,
        leading=12,
        textColor=brand_primary,
        leftIndent=4 * mm,
    )
    item_style = ParagraphStyle(
        "LegalItem",
        parent=body_style,
        leftIndent=5 * mm,
        firstLineIndent=-4 * mm,
        spaceAfter=1.8 * mm,
    )
    summary_style = ParagraphStyle(
        "LegalSummary",
        parent=body_style,
        fontSize=9,
        leading=13,
        spaceAfter=0,
    )

    story = [
        Spacer(1, 7 * mm),
        Paragraph(paragraph_text(content["title"]), title_style),
        Paragraph(paragraph_text(content["subtitle"]), subtitle_style),
        Paragraph(
            f"Last updated: {paragraph_text(content['updated'])} &nbsp;&nbsp;|&nbsp;&nbsp; Version: {paragraph_text(content['version'])}",
            metadata_style,
        ),
    ]

    summary_rows = [
        [Paragraph("<b>Quick summary</b>", heading_style)]
    ]
    for item in content["summary"]:
        summary_rows.append([
            Paragraph(f"<font color='{palette['secondary']}'>●</font>&nbsp;&nbsp;{paragraph_text(item)}", summary_style)
        ])

    summary_table = Table(summary_rows, colWidths=[161 * mm], hAlign="LEFT")
    summary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), brand_background),
        ("BOX", (0, 0), (-1, -1), 0.8, brand_border),
        ("ROUNDEDCORNERS", [8]),
        ("LEFTPADDING", (0, 0), (-1, -1), 6 * mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6 * mm),
        ("TOPPADDING", (0, 0), (-1, 0), 2 * mm),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 1 * mm),
        ("TOPPADDING", (0, 1), (-1, -1), 1.5 * mm),
        ("BOTTOMPADDING", (0, 1), (-1, -1), 1.5 * mm),
    ]))
    story.extend([summary_table, Spacer(1, 3 * mm)])

    for section in content["sections"]:
        story.append(Paragraph(paragraph_text(section["title"]), heading_style))
        for paragraph in section["paragraphs"]:
            story.append(Paragraph(paragraph_text(paragraph), body_style))
        for item in section.get("items", []):
            story.append(Paragraph(f"- {paragraph_text(item)}", item_style))
        for link in section.get("links", []):
            label = paragraph_text(link["label"])
            href = paragraph_text(link["href"])
            story.append(Paragraph(f"{label}: <link href='{href}'>{href}</link>", link_style))

        if section["id"] == "complaints-law-and-contact":
            business = content["business"]
            address = business["address"]
            contact_lines = [
                f"{business['tradingName']}, operated by {business['proprietor']}",
                business["email"],
                business["phone"],
                f"{address['street']}, {address['city']}, {address['postcode']}, {address['country']}",
            ]
            for line in contact_lines:
                story.append(Paragraph(paragraph_text(line), body_style))

    document.build(story, onFirstPage=draw_page, onLaterPages=draw_page)


def main():
    content = json.loads(CONTENT_PATH.read_text(encoding="utf-8"))
    filename = f"olgish-cakes-terms-{content['version']}.pdf"
    PUBLIC_DIRECTORY.mkdir(parents=True, exist_ok=True)
    QA_DIRECTORY.mkdir(parents=True, exist_ok=True)
    public_path = PUBLIC_DIRECTORY / filename
    qa_path = QA_DIRECTORY / filename
    build_pdf(content, public_path)
    shutil.copy2(public_path, qa_path)
    print(public_path)


if __name__ == "__main__":
    main()
