import os
import io
import json
import pandas as pd
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Optional, Dict, Any, List
from pydantic import BaseModel

from engine import DataCleaner, MarketBasketEngine, BusinessRecommendationEngine, GraphEngine
from report_generator import PDFReportGenerator

app = FastAPI(
    title="Market Basket Intelligence Platform API",
    description="Production grade Market Basket Analysis API with Apriori, FP-Growth, 3D Graph, AI Recommendations and Export Engine.",
    version="1.0.0"
)

# CORS Setup for Frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store for datasets
DATASET_STORE: Dict[str, Dict[str, Any]] = {}
SAMPLE_DIR = os.path.join(os.path.dirname(__file__), 'sample_data')


def load_benchmark(dataset_id: str) -> Dict[str, Any]:
    file_map = {
        "groceries": os.path.join(SAMPLE_DIR, "groceries.csv"),
        "tech": os.path.join(SAMPLE_DIR, "tech_electronics.csv")
    }
    path = file_map.get(dataset_id, os.path.join(SAMPLE_DIR, "groceries.csv"))
    df = pd.read_csv(path)
    clean_meta = DataCleaner.inspect_and_clean(df)
    DATASET_STORE[dataset_id] = clean_meta
    return clean_meta


@app.get("/api/health")
def health_check():
    return {"status": "online", "service": "Market Basket Intelligence Engine", "version": "1.0.0"}


@app.get("/api/datasets/benchmark/{dataset_id}")
def get_benchmark_dataset(dataset_id: str):
    clean_meta = load_benchmark(dataset_id)
    df_clean = clean_meta['clean_df']
    preview = df_clean.head(20).to_dict(orient='records')
    
    return {
        "dataset_id": dataset_id,
        "transaction_col": clean_meta['transaction_col'],
        "item_col": clean_meta['item_col'],
        "total_rows": clean_meta['total_rows'],
        "clean_rows": clean_meta['clean_rows'],
        "missing_rows": clean_meta['missing_rows'],
        "duplicate_rows": clean_meta['duplicate_rows'],
        "unique_transactions": clean_meta['unique_transactions'],
        "unique_items": clean_meta['unique_items'],
        "top_items": clean_meta['top_items'],
        "preview": preview
    }


@app.post("/api/datasets/upload")
async def upload_dataset(
    file: UploadFile = File(...),
    transaction_col: Optional[str] = Form(None),
    item_col: Optional[str] = Form(None)
):
    try:
        contents = await file.read()
        filename = file.filename or "uploaded.csv"
        
        if filename.endswith('.xlsx') or filename.endswith('.xls'):
            df = pd.read_excel(io.BytesIO(contents))
        else:
            df = pd.read_csv(io.BytesIO(contents))

        clean_meta = DataCleaner.inspect_and_clean(df, transaction_col, item_col)
        dataset_id = f"upload_{hash(filename)}_{len(df)}"
        DATASET_STORE[dataset_id] = clean_meta
        
        preview = clean_meta['clean_df'].head(20).to_dict(orient='records')

        return {
            "dataset_id": dataset_id,
            "filename": filename,
            "transaction_col": clean_meta['transaction_col'],
            "item_col": clean_meta['item_col'],
            "total_rows": clean_meta['total_rows'],
            "clean_rows": clean_meta['clean_rows'],
            "missing_rows": clean_meta['missing_rows'],
            "duplicate_rows": clean_meta['duplicate_rows'],
            "unique_transactions": clean_meta['unique_transactions'],
            "unique_items": clean_meta['unique_items'],
            "top_items": clean_meta['top_items'],
            "preview": preview
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process dataset file: {str(e)}")


class MineRequest(BaseModel):
    dataset_id: str
    min_support: float = 0.02
    min_confidence: float = 0.2
    min_lift: float = 1.0
    algorithm: str = "fpgrowth"  # 'apriori' or 'fpgrowth'


@app.post("/api/analyze/mine")
def mine_association_rules(req: MineRequest):
    if req.dataset_id not in DATASET_STORE:
        # Fallback load benchmark
        clean_meta = load_benchmark(req.dataset_id)
    else:
        clean_meta = DATASET_STORE[req.dataset_id]

    df_clean = clean_meta['clean_df']
    tx_col = clean_meta['transaction_col']
    item_col = clean_meta['item_col']

    # Pivot to basket
    basket_df = DataCleaner.pivot_to_basket(df_clean, tx_col, item_col)

    # Run chosen algorithm
    mining_result = MarketBasketEngine.run_mining(
        basket_df,
        algorithm=req.algorithm,
        min_support=req.min_support,
        min_confidence=req.min_confidence,
        min_lift=req.min_lift
    )

    # Run performance comparison
    perf_comparison = MarketBasketEngine.compare_performance(
        basket_df,
        min_support=req.min_support,
        min_confidence=req.min_confidence,
        min_lift=req.min_lift
    )

    # Generate business recommendations
    recommendations = BusinessRecommendationEngine.generate_recommendations(mining_result['rules'])

    # Build 3D Graph structure
    graph_payload = GraphEngine.build_network_graph(mining_result['rules'], clean_meta['top_items'])

    return {
        "dataset_id": req.dataset_id,
        "parameters": {
            "min_support": req.min_support,
            "min_confidence": req.min_confidence,
            "min_lift": req.min_lift,
            "algorithm": req.algorithm
        },
        "diagnostics": {
            "total_rows": clean_meta['total_rows'],
            "clean_rows": clean_meta['clean_rows'],
            "unique_transactions": clean_meta['unique_transactions'],
            "unique_items": clean_meta['unique_items']
        },
        "mining_result": mining_result,
        "performance_benchmark": perf_comparison,
        "business_recommendations": recommendations,
        "graph_3d": graph_payload
    }


class CopilotRequest(BaseModel):
    message: str
    rules: List[Dict[str, Any]] = []
    top_items: List[str] = []


@app.post("/api/copilot/chat")
def copilot_chat(req: CopilotRequest):
    msg_lower = req.message.lower()
    
    if "cross-sell" in msg_lower or "cross sell" in msg_lower:
        if req.rules:
            r = req.rules[0]
            reply = f"Top Cross-Selling Opportunity: Customers buying [{r.get('antecedent_str')}] have a {r.get('lift')}x affinity to also purchase [{r.get('consequent_str')}]. We recommend setting up an immediate checkout modal recommendation."
        else:
            reply = "To uncover cross-sell opportunities, run the mining engine with min_confidence around 0.2 and min_lift > 1.2."
            
    elif "layout" in msg_lower or "shelf" in msg_lower or "aisle" in msg_lower:
        reply = "Retail Store Layout Insight: Position strong co-occurrence SKUs in adjacent bays within the same aisle to boost impulse conversions. For high-lift pairs (Lift > 2.5), placing them 1 aisle apart increases store traversal time while maintaining purchase intent."
        
    elif "discount" in msg_lower or "bundle" in msg_lower or "promo" in msg_lower:
        reply = "Promotional Bundling Strategy: Combine primary high-volume anchor products with high-margin secondary consequents. Offer a 10-15% combo bundle discount to lock in basket expansion."
        
    else:
        num_rules = len(req.rules)
        reply = f"Market Basket AI Assistant initialized. Currently analyzing {num_rules} active association rules. Ask me about shelf layout optimizations, cross-selling triggers, bundle pricing, or what-if scenario forecasts."

    return {"response": reply}


class WhatIfRequest(BaseModel):
    antecedent: str
    consequent: str
    discount_pct: float = 10.0
    current_aov: float = 45.0
    lift: float = 2.4


@app.post("/api/copilot/whatif")
def copilot_whatif(req: WhatIfRequest):
    baseline_conversion = min(0.95, 0.25 * req.lift)
    projected_conversion = min(0.98, baseline_conversion * (1 + (req.discount_pct / 100.0) * 0.5))
    
    aov_uplift = req.current_aov * (projected_conversion - baseline_conversion) * 0.4
    new_aov = round(req.current_aov + aov_uplift, 2)
    revenue_growth_pct = round(((new_aov - req.current_aov) / req.current_aov) * 100, 2)

    return {
        "antecedent": req.antecedent,
        "consequent": req.consequent,
        "discount_pct": req.discount_pct,
        "baseline_conversion_pct": round(baseline_conversion * 100, 1),
        "projected_conversion_pct": round(projected_conversion * 100, 1),
        "current_aov": req.current_aov,
        "projected_aov": new_aov,
        "aov_uplift": round(aov_uplift, 2),
        "revenue_growth_pct": revenue_growth_pct,
        "executive_summary": f"Applying a {req.discount_pct}% bundle discount on [{req.antecedent} + {req.consequent}] is projected to increase cart attachment rate by {round((projected_conversion - baseline_conversion)*100, 1)}%, lifting AOV from ${req.current_aov} to ${new_aov} (+{revenue_growth_pct}%)."
    }


class ExportPDFRequest(BaseModel):
    dataset_name: str = "Groceries Retail Dataset"
    diagnostics: Dict[str, Any]
    performance: Dict[str, Any]
    rules: List[Dict[str, Any]]
    recommendations: List[Dict[str, Any]]


@app.post("/api/export/pdf")
def export_pdf_report(req: ExportPDFRequest):
    try:
        pdf_bytes = PDFReportGenerator.generate_pdf(
            dataset_name=req.dataset_name,
            diagnostics=req.diagnostics,
            performance=req.performance,
            rules=req.rules,
            recommendations=req.recommendations
        )
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=market_basket_intelligence_report.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF Generation error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
