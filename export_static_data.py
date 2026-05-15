#!/usr/bin/env python3
"""
Export static data from LightRAG storage for the frontend-only Vercel build.

Run from project root:
    python scripts/export_static_data.py

Outputs to:
    frontend/public/static-data/
        documents.json
        buckets.json
        graph/
            {bucket_id}.json
            cross-domain.json
        chunks/
            {bucket_id}.json
"""
import json
import os
import unicodedata
from pathlib import Path

STORAGE_DIR = Path("backend/lightrag_storage")
DOCS_JSON   = Path("backend/data/documents.json")
OUT_DIR     = Path("frontend/public/static-data")


def normalize(name: str) -> str:
    return unicodedata.normalize("NFC", name).strip().lower()


def export_graph(bucket_id: str, graphml_path: Path) -> dict:
    try:
        import networkx as nx
    except ImportError:
        raise SystemExit("networkx not installed — run: pip install networkx")

    G = nx.read_graphml(str(graphml_path))

    nodes = []
    for node_id, data in G.nodes(data=True):
        nodes.append({
            "id":          node_id,
            "name":        data.get("entity_name") or data.get("id") or node_id,
            "type":        data.get("entity_type", "unknown"),
            "description": data.get("description", ""),
            "degree":      G.degree(node_id),
        })

    edges = []
    for src, dst, data in G.edges(data=True):
        edges.append({
            "source":      src,
            "target":      dst,
            "description": data.get("description") or data.get("relation", ""),
            "weight":      float(data.get("weight", 1.0)),
        })

    return {
        "bucket_id":  bucket_id,
        "node_count": len(nodes),
        "edge_count": len(edges),
        "nodes":      nodes,
        "edges":      edges,
    }


def export_chunks(chunks_path: Path) -> list:
    with open(chunks_path, encoding="utf-8") as f:
        raw = json.load(f)
    chunks = []
    for chunk_id, chunk in raw.items():
        chunks.append({
            "id":    chunk_id,
            "text":  chunk.get("content", ""),
            "tokens": chunk.get("tokens", 0),
            "order": chunk.get("chunk_order_index", 0),
        })
    chunks.sort(key=lambda x: x["order"])
    return chunks


def compute_cross_domain(graphs: dict) -> dict:
    entity_buckets: dict[str, dict[str, str]] = {}
    for bucket_id, gdata in graphs.items():
        for node in gdata["nodes"]:
            key = normalize(node["name"])
            if key not in entity_buckets:
                entity_buckets[key] = {}
            entity_buckets[key][bucket_id] = node["name"]

    bucket_ids = list(graphs.keys())

    shared = [
        {
            "entity":  key,
            "display": list(occ.values())[0],
            "buckets": list(occ.keys()),
            "count":   len(occ),
        }
        for key, occ in entity_buckets.items()
        if len(occ) >= 2
    ]
    shared.sort(key=lambda x: -x["count"])

    matrix: dict[str, dict[str, int]] = {b: {b2: 0 for b2 in bucket_ids} for b in bucket_ids}
    for entry in shared:
        bs = entry["buckets"]
        for i, b1 in enumerate(bs):
            for b2 in bs[i + 1:]:
                matrix[b1][b2] += 1
                matrix[b2][b1] += 1

    return {
        "buckets":             bucket_ids,
        "shared_entity_count": len(shared),
        "shared_entities":     shared,
        "overlap_matrix":      matrix,
    }


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (OUT_DIR / "graph").mkdir(exist_ok=True)
    (OUT_DIR / "chunks").mkdir(exist_ok=True)

    # ── Documents ──────────────────────────────────────────────────────────────
    raw_docs = json.loads(DOCS_JSON.read_text(encoding="utf-8"))
    clean_docs = [
        {k: v for k, v in d.items() if k not in {"file_url"}}
        for d in raw_docs
    ]
    (OUT_DIR / "documents.json").write_text(
        json.dumps(clean_docs, indent=2, ensure_ascii=False), encoding="utf-8"
    )
    print(f"  Documents: {len(clean_docs)} records")

    # ── Per-bucket graph + chunks ──────────────────────────────────────────────
    graphs: dict[str, dict] = {}

    for bucket_dir in sorted(STORAGE_DIR.iterdir()):
        if not bucket_dir.is_dir():
            continue
        bucket_id = bucket_dir.name

        graphml = bucket_dir / "graph_chunk_entity_relation.graphml"
        if graphml.exists():
            gdata = export_graph(bucket_id, graphml)
            graphs[bucket_id] = gdata
            out = OUT_DIR / "graph" / f"{bucket_id}.json"
            out.write_text(json.dumps(gdata, ensure_ascii=False), encoding="utf-8")
            print(f"  Graph  {bucket_id}: {gdata['node_count']} nodes, {gdata['edge_count']} edges")
        else:
            print(f"  Graph  {bucket_id}: no graphml — skipped")

        chunks_path = bucket_dir / "kv_store_text_chunks.json"
        if chunks_path.exists():
            chunks = export_chunks(chunks_path)
            out = OUT_DIR / "chunks" / f"{bucket_id}.json"
            out.write_text(json.dumps(chunks, ensure_ascii=False), encoding="utf-8")
            print(f"  Chunks {bucket_id}: {len(chunks)} chunks")
        else:
            print(f"  Chunks {bucket_id}: no chunk store — skipped")

    # ── Buckets list ───────────────────────────────────────────────────────────
    bucket_ids = list(graphs.keys())
    (OUT_DIR / "buckets.json").write_text(
        json.dumps(bucket_ids, ensure_ascii=False), encoding="utf-8"
    )
    print(f"  Buckets: {bucket_ids}")

    # ── Cross-domain ───────────────────────────────────────────────────────────
    if graphs:
        cross = compute_cross_domain(graphs)
        (OUT_DIR / "graph" / "cross-domain.json").write_text(
            json.dumps(cross, ensure_ascii=False), encoding="utf-8"
        )
        print(f"  Cross-domain: {cross['shared_entity_count']} shared entities")
    else:
        print("  Cross-domain: no graphs found — skipped")

    print(f"\nDone. Static data at: {OUT_DIR.resolve()}/")


if __name__ == "__main__":
    main()
