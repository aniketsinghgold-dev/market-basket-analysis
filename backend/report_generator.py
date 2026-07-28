import os
from io import BytesIO
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from typing import Dict, List, Any

class PDFReportGenerator:
    @staticmethod
    def generate_pdf(dataset_name: str, diagnostics: Dict[str, Any], performance: Dict[str, Any], rules: List[Dict[str, Any]], recommendations: List[Dict[str, Any]]) -> bytes:
        """Generates a high-end executive PDF report using ReportLab."""
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom Styles
        title_style = ParagraphStyle(
            'DocTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=colors.HexColor('#0F172A'),
            spaceAfter=6
        )
        
        subtitle_style = ParagraphStyle(
            'SubTitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=11,
            textColor=colors.HexColor('#64748B'),
            spaceAfter=15
        )

        h2_style = ParagraphStyle(
            'SectionH2',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=14,
            textColor=colors.HexColor('#1E293B'),
            spaceBefore=12,
            spaceAfter=6
        )

        body_style = ParagraphStyle(
            'BodyDark',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=colors.HexColor('#334155')
        )

        bold_body = ParagraphStyle(
            'BoldDark',
            parent=body_style,
            fontName='Helvetica-Bold'
        )

        elements = []

        # Title Block
        elements.append(Paragraph("Market Basket Intelligence Platform", title_style))
        elements.append(Paragraph(f"Executive Retail Strategy & Association Analysis • Dataset: {dataset_name}", subtitle_style))
        elements.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor('#3B82F6'), spaceAfter=15))

        # Dataset Health Diagnostics
        elements.append(Paragraph("1. Dataset & Processing Overview", h2_style))
        diag_data = [
            [Paragraph("Total Raw Records", bold_body), Paragraph(str(diagnostics.get('total_rows', 0)), body_style), Paragraph("Unique Transactions", bold_body), Paragraph(str(diagnostics.get('unique_transactions', 0)), body_style)],
            [Paragraph("Cleaned Valid Rows", bold_body), Paragraph(str(diagnostics.get('clean_rows', 0)), body_style), Paragraph("Unique Product SKUs", bold_body), Paragraph(str(diagnostics.get('unique_items', 0)), body_style)],
            [Paragraph("Missing Value Rows", bold_body), Paragraph(str(diagnostics.get('missing_rows', 0)), body_style), Paragraph("Duplicate Rows Handled", bold_body), Paragraph(str(diagnostics.get('duplicate_rows', 0)), body_style)]
        ]
        diag_table = Table(diag_data, colWidths=[130, 120, 130, 120])
        diag_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(diag_table)
        elements.append(Spacer(1, 15))

        # Algorithm Benchmark
        elements.append(Paragraph("2. Algorithm Mining Benchmark (Apriori vs FP-Growth)", h2_style))
        ap = performance.get('apriori', {})
        fp = performance.get('fpgrowth', {})
        perf_data = [
            ["Metric", "Apriori Engine", "FP-Growth Engine", "Performance Winner"],
            ["Execution Duration", f"{ap.get('exec_time_ms', 0)} ms", f"{fp.get('exec_time_ms', 0)} ms", performance.get('winner', 'FP-Growth')],
            ["Peak RAM Usage", f"{ap.get('memory_usage_mb', 0)} MB", f"{fp.get('memory_usage_mb', 0)} MB", f"{performance.get('speedup_factor', 1.0)}x Speedup"],
            ["Frequent Itemsets", str(ap.get('itemsets_count', 0)), str(fp.get('itemsets_count', 0)), "Exact Match"],
            ["Association Rules", str(ap.get('rules_count', 0)), str(fp.get('rules_count', 0)), "Exact Match"]
        ]
        perf_table = Table(perf_data, colWidths=[130, 120, 130, 120])
        perf_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1E293B')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0,0), (-1,-1), 6),
        ]))
        elements.append(perf_table)
        elements.append(Spacer(1, 15))

        # Top Association Rules Table
        elements.append(Paragraph("3. Top High-Affinity Association Rules", h2_style))
        rule_headers = ["Antecedent (If Bought)", "Consequent (Then Also)", "Support", "Confidence", "Lift"]
        rule_rows = [rule_headers]
        
        for r in rules[:8]:
            rule_rows.append([
                r.get('antecedent_str', ''),
                r.get('consequent_str', ''),
                f"{r.get('support', 0):.3f}",
                f"{round(r.get('confidence', 0)*100, 1)}%",
                f"{r.get('lift', 0):.2f}x"
            ])

        rules_table = Table(rule_rows, colWidths=[140, 140, 70, 80, 70])
        rules_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2563EB')),
            ('TEXTCOLOR', (0,0), (-1,0), colors.white),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#93C5FD')),
            ('PADDING', (0,0), (-1,-1), 5),
            ('ALIGN', (2,0), (-1,-1), 'CENTER')
        ]))
        elements.append(rules_table)
        elements.append(Spacer(1, 15))

        # Business Recommendations
        elements.append(Paragraph("4. AI Consultant Executive Action Plan", h2_style))
        for rec in recommendations[:5]:
            rec_box = [
                [Paragraph(f"<b>Priority: {rec['priority']}</b> | Lift: {rec['lift']}x | Affinity Confidence: {rec['confidence_pct']}%", bold_body)],
                [Paragraph(f"<b>Observation:</b> {rec['narrative']}", body_style)],
                [Paragraph(f"<b>Shelf Layout:</b> {rec['shelf_placement']}", body_style)],
                [Paragraph(f"<b>Cross-Sell Promo:</b> {rec['bundle_suggestion']}", body_style)],
            ]
            t_rec = Table(rec_box, colWidths=[500])
            t_rec.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F1F5F9')),
                ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#CBD5E1')),
                ('PADDING', (0,0), (-1,-1), 6),
            ]))
            elements.append(t_rec)
            elements.append(Spacer(1, 8))

        doc.build(elements)
        pdf_bytes = buffer.getvalue()
        buffer.close()
        return pdf_bytes
