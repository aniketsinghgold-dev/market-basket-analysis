import time
import tracemalloc
import pandas as pd
import numpy as np
from mlxtend.frequent_patterns import apriori, fpgrowth, association_rules
import networkx as nx
from typing import Dict, List, Any, Optional

class DataCleaner:
    @staticmethod
    def inspect_and_clean(df: pd.DataFrame, transaction_col: Optional[str] = None, item_col: Optional[str] = None) -> Dict[str, Any]:
        """Auto-detects columns, cleans missing values, reports diagnostics."""
        cols = [str(c).strip() for c in df.columns]
        df.columns = cols
        
        # Auto-detect Transaction Column if not provided
        if not transaction_col or transaction_col not in df.columns:
            for c in df.columns:
                c_lower = c.lower()
                if any(k in c_lower for k in ['trans', 'order', 'invoice', 'id', 'bill', 'receipt']):
                    transaction_col = c
                    break
            if not transaction_col:
                transaction_col = df.columns[0]
                
        # Auto-detect Item Column if not provided
        if not item_col or item_col not in df.columns:
            for c in df.columns:
                c_lower = c.lower()
                if any(k in c_lower for k in ['item', 'product', 'description', 'name', 'sku', 'title']):
                    item_col = c
                    break
            if not item_col:
                item_col = df.columns[1] if len(df.columns) > 1 else df.columns[0]

        total_rows = len(df)
        missing_rows = df[[transaction_col, item_col]].isnull().any(axis=1).sum()
        duplicate_rows = df.duplicated(subset=[transaction_col, item_col]).sum()
        
        # Clean dataframe
        df_clean = df.dropna(subset=[transaction_col, item_col]).copy()
        df_clean[item_col] = df_clean[item_col].astype(str).str.strip()
        df_clean[transaction_col] = df_clean[transaction_col].astype(str).str.strip()
        
        # Remove empty item strings or placeholders
        df_clean = df_clean[~df_clean[item_col].isin(['', 'nan', 'NAN', 'None', 'NULL', 'null', 'NONE'])]

        unique_transactions = df_clean[transaction_col].nunique()
        unique_items = df_clean[item_col].nunique()
        top_items = df_clean[item_col].value_counts().head(10).to_dict()

        return {
            "transaction_col": transaction_col,
            "item_col": item_col,
            "total_rows": total_rows,
            "missing_rows": int(missing_rows),
            "duplicate_rows": int(duplicate_rows),
            "clean_rows": len(df_clean),
            "unique_transactions": int(unique_transactions),
            "unique_items": int(unique_items),
            "top_items": top_items,
            "clean_df": df_clean
        }

    @staticmethod
    def pivot_to_basket(df: pd.DataFrame, transaction_col: str, item_col: str) -> pd.DataFrame:
        """Transforms long transaction log into one-hot encoded matrix."""
        basket = (df.groupby([transaction_col, item_col])[item_col]
                  .count().unstack().reset_index().fillna(0)
                  .set_index(transaction_col))
        
        # Binary encoding
        basket_encoded = basket.map(lambda x: True if x > 0 else False)
        return basket_encoded


class MarketBasketEngine:
    @staticmethod
    def run_mining(basket_df: pd.DataFrame, algorithm: str = 'fpgrowth', min_support: float = 0.02, min_confidence: float = 0.2, min_lift: float = 1.0) -> Dict[str, Any]:
        """Runs Apriori or FP-Growth with high-resolution memory and time tracking."""
        tracemalloc.start()
        t0 = time.perf_counter()
        
        if algorithm == 'apriori':
            frequent_itemsets = apriori(basket_df, min_support=min_support, use_colnames=True)
        else:
            frequent_itemsets = fpgrowth(basket_df, min_support=min_support, use_colnames=True)
            
        t1 = time.perf_counter()
        current_mem, peak_mem = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        
        exec_time_ms = round((t1 - t0) * 1000, 3)
        peak_mem_mb = round(peak_mem / (1024 * 1024), 3)

        rules_list = []
        if not frequent_itemsets.empty:
            rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=min_confidence)
            
            # Filter by min_lift
            rules = rules[rules['lift'] >= min_lift]
            
            # Compute Conviction & Leverage if missing or inf
            rules = rules.copy()
            rules['antecedents'] = rules['antecedents'].apply(lambda x: list(x))
            rules['consequents'] = rules['consequents'].apply(lambda x: list(x))
            rules['antecedent_len'] = rules['antecedents'].apply(len)
            rules['consequent_len'] = rules['consequents'].apply(len)
            
            # Sanitize inf or NaN values for JSON safety
            rules.replace([np.inf, -np.inf], 999.99, inplace=True)
            rules.fillna(0.0, inplace=True)

            for idx, row in rules.iterrows():
                rules_list.append({
                    "id": f"rule_{idx}",
                    "antecedents": row['antecedents'],
                    "consequents": row['consequents'],
                    "antecedent_str": ", ".join(row['antecedents']),
                    "consequent_str": ", ".join(row['consequents']),
                    "support": round(float(row['support']), 4),
                    "confidence": round(float(row['confidence']), 4),
                    "lift": round(float(row['lift']), 4),
                    "leverage": round(float(row['leverage']), 4),
                    "conviction": round(float(row['conviction']), 4),
                    "rule_length": int(row['antecedent_len'] + row['consequent_len'])
                })

        # Process frequent itemsets output
        frequent_list = []
        if not frequent_itemsets.empty:
            for idx, row in frequent_itemsets.iterrows():
                items = list(row['itemsets'])
                frequent_list.append({
                    "itemset": items,
                    "itemset_str": ", ".join(items),
                    "length": len(items),
                    "support": round(float(row['support']), 4)
                })

        # Sort itemsets & rules
        frequent_list.sort(key=lambda x: x['support'], reverse=True)
        rules_list.sort(key=lambda x: x['lift'], reverse=True)

        return {
            "algorithm": algorithm,
            "exec_time_ms": exec_time_ms,
            "memory_usage_mb": peak_mem_mb,
            "total_frequent_itemsets": len(frequent_list),
            "total_rules": len(rules_list),
            "frequent_itemsets": frequent_list,
            "rules": rules_list
        }

    @staticmethod
    def compare_performance(basket_df: pd.DataFrame, min_support: float = 0.02, min_confidence: float = 0.2, min_lift: float = 1.0) -> Dict[str, Any]:
        """Runs side-by-side performance benchmarking of Apriori vs FP-Growth."""
        apriori_res = MarketBasketEngine.run_mining(basket_df, 'apriori', min_support, min_confidence, min_lift)
        fpgrowth_res = MarketBasketEngine.run_mining(basket_df, 'fpgrowth', min_support, min_confidence, min_lift)
        
        speedup = round(apriori_res['exec_time_ms'] / max(fpgrowth_res['exec_time_ms'], 0.001), 2)
        
        return {
            "apriori": {
                "exec_time_ms": apriori_res['exec_time_ms'],
                "memory_usage_mb": apriori_res['memory_usage_mb'],
                "itemsets_count": apriori_res['total_frequent_itemsets'],
                "rules_count": apriori_res['total_rules']
            },
            "fpgrowth": {
                "exec_time_ms": fpgrowth_res['exec_time_ms'],
                "memory_usage_mb": fpgrowth_res['memory_usage_mb'],
                "itemsets_count": fpgrowth_res['total_frequent_itemsets'],
                "rules_count": fpgrowth_res['total_rules']
            },
            "speedup_factor": speedup,
            "winner": "FP-Growth" if fpgrowth_res['exec_time_ms'] <= apriori_res['exec_time_ms'] else "Apriori"
        }


class BusinessRecommendationEngine:
    @staticmethod
    def generate_recommendations(rules: List[Dict[str, Any]], top_n: int = 15) -> List[Dict[str, Any]]:
        """Generates executive consultant level plain-English retail business recommendations."""
        recommendations = []
        
        for rule in rules[:top_n]:
            ant = rule['antecedent_str']
            cons = rule['consequent_str']
            lift = rule['lift']
            conf = round(rule['confidence'] * 100, 1)
            supp = round(rule['support'] * 100, 1)
            
            # Determine priority tier based on Lift & Confidence
            if lift >= 3.0 and conf >= 60:
                priority = "CRITICAL"
                badge_color = "amber"
            elif lift >= 2.0 and conf >= 40:
                priority = "HIGH"
                badge_color = "emerald"
            else:
                priority = "MEDIUM"
                badge_color = "blue"

            # Plain English Story
            narrative = f"Customers purchasing [{ant}] show a strong {lift}x affinity to also acquire [{cons}], present in {conf}% of target transactions."
            
            # Cross-Selling Strategy
            cross_sell = f"Configure digital checkout upsell modal: Trigger [{cons}] pop-up recommendations immediately when [{ant}] is added to the cart."

            # Shelf & Layout Strategy
            shelf_placement = f"Physical Store Layout: Place [{cons}] adjacent to [{ant}] in Aisle/Bay to minimize customer distance and capture high-intent impulse purchases."

            # Bundle & Promo Package
            bundle_discount = max(5, int(min(25, (lift - 1.0) * 10)))
            bundle = f"Launch '{ant} & {cons} Value Pack' bundled together with a target {bundle_discount}% combo discount."

            # Inventory Strategy
            inventory = f"Demand Planning: Maintain safety stock ratio for [{cons}] at 1.5x during promotional campaigns featuring [{ant}]."

            recommendations.append({
                "rule_id": rule['id'],
                "antecedents": rule['antecedents'],
                "consequents": rule['consequents'],
                "priority": priority,
                "badge_color": badge_color,
                "lift": lift,
                "confidence_pct": conf,
                "support_pct": supp,
                "narrative": narrative,
                "cross_sell_strategy": cross_sell,
                "shelf_placement": shelf_placement,
                "bundle_suggestion": bundle,
                "inventory_strategy": inventory
            })
            
        return recommendations


class GraphEngine:
    @staticmethod
    def build_network_graph(rules: List[Dict[str, Any]], top_items: Dict[str, int]) -> Dict[str, Any]:
        """Constructs 3D node network payload with position hints and styling attributes."""
        G = nx.DiGraph()
        
        # Collect nodes
        nodes_dict = {}
        for rule in rules:
            for item in rule['antecedents'] + rule['consequents']:
                if item not in nodes_dict:
                    freq = top_items.get(item, 5)
                    nodes_dict[item] = {
                        "id": item,
                        "label": item,
                        "frequency": freq,
                        "degree": 0
                    }
                    
        # Add edges
        edges = []
        for idx, rule in enumerate(rules[:30]):
            ant_str = rule['antecedent_str']
            cons_str = rule['consequent_str']
            
            # Increment degrees
            for a in rule['antecedents']:
                for c in rule['consequents']:
                    if a in nodes_dict and c in nodes_dict:
                        nodes_dict[a]['degree'] += 1
                        nodes_dict[c]['degree'] += 1
                        
                        edges.append({
                            "id": f"e_{idx}_{a}_{c}",
                            "source": a,
                            "target": c,
                            "lift": rule['lift'],
                            "confidence": rule['confidence'],
                            "support": rule['support'],
                            "weight": max(1.0, round(rule['lift'], 2))
                        })

        # Calculate 3D sphere positions using networkx spring layout
        nodes_list = list(nodes_dict.values())
        if len(nodes_list) > 0:
            for n in nodes_list:
                G.add_node(n['id'])
            for e in edges:
                G.add_edge(e['source'], e['target'], weight=e['weight'])

            pos_2d = nx.spring_layout(G, k=0.5, iterations=50)
            for n in nodes_list:
                xy = pos_2d.get(n['id'], [0.0, 0.0])
                # Generate 3D coordinates
                n['x'] = float(xy[0] * 20.0)
                n['y'] = float(xy[1] * 20.0)
                n['z'] = float(np.random.uniform(-10.0, 10.0))
                # Sizing based on degree & frequency
                n['size'] = float(min(4.5, max(1.2, np.log1p(n['frequency']) * 0.8)))

        return {
            "nodes": nodes_list,
            "edges": edges
        }
