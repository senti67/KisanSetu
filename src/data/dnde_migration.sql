-- ====================================================================
-- KisanSetu Infrastructure Procurement Module
-- Deterministic Normative Dependency Engine (DNDE)
-- PostgreSQL Migration Script: pgvector, Standards & Normative Relationships
-- ====================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create Enum for Standard Relationship Types
DO $$ BEGIN
  CREATE TYPE standard_relation_type AS ENUM (
    'NORMATIVE_REF',   -- Mandatory referenced standard
    'SUPERSEDED_BY',   -- Withdrawn/obsolete standard replaced by newer standard
    'ALLIED_TESTING'   -- Quality verification and test procedure standard
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create 'standards' Table
-- Stores Bureau of Indian Standards (BIS) and allied infrastructure standards
CREATE TABLE IF NOT EXISTS standards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_code VARCHAR(100) NOT NULL UNIQUE,       -- e.g. 'IS 456:2000', 'IS 383:2016'
  title VARCHAR(500) NOT NULL,                -- e.g. 'Plain and Reinforced Concrete - Code of Practice'
  abstract TEXT NOT NULL,                     -- Scope, specifications, and applicability
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'SUPERSEDED', 'WITHDRAWN'
  embedding vector(768),                      -- 768-dimensional embedding for semantic specification matching
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Index for exact code queries and status lookups
CREATE INDEX IF NOT EXISTS idx_standards_is_code ON standards(is_code);
CREATE INDEX IF NOT EXISTS idx_standards_status ON standards(status);

-- Vector Cosine Similarity Search Index (HNSW for sub-millisecond retrieval)
CREATE INDEX IF NOT EXISTS idx_standards_embedding_hnsw 
ON standards USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 4. Create 'standard_relationships' Table
-- Normative Directed Acyclic Graph (DAG) for Indian Standards
CREATE TABLE IF NOT EXISTS standard_relationships (
  source_id UUID NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES standards(id) ON DELETE CASCADE,
  relation_type standard_relation_type NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (source_id, target_id, relation_type)
);

CREATE INDEX IF NOT EXISTS idx_std_rel_source ON standard_relationships(source_id);
CREATE INDEX IF NOT EXISTS idx_std_rel_target ON standard_relationships(target_id);
CREATE INDEX IF NOT EXISTS idx_std_rel_type ON standard_relationships(relation_type);

-- 5. Recursive Common Table Expression (CTE) Function
-- Traverses the standard_relationships graph starting from a given standard_id
-- and returns all normative dependencies, allied testing, and supersession chains.
CREATE OR REPLACE FUNCTION get_normative_dependencies(start_standard_id UUID, max_depth INT DEFAULT 5)
RETURNS TABLE (
  standard_id UUID,
  is_code VARCHAR(100),
  title VARCHAR(500),
  status VARCHAR(50),
  relation_type standard_relation_type,
  depth INT,
  path TEXT[],
  parent_is_code VARCHAR(100),
  is_superseded BOOLEAN,
  replacement_code VARCHAR(100),
  replacement_id UUID
) AS $$
WITH RECURSIVE normative_tree AS (
  -- Anchor member: root standard
  SELECT
    s.id AS standard_id,
    s.is_code,
    s.title,
    s.status,
    NULL::standard_relation_type AS relation_type,
    0 AS depth,
    ARRAY[s.is_code::TEXT] AS path,
    NULL::VARCHAR(100) AS parent_is_code
  FROM standards s
  WHERE s.id = start_standard_id

  UNION ALL

  -- Recursive member: traverse outgoing relationships
  SELECT
    child.id AS standard_id,
    child.is_code,
    child.title,
    child.status,
    sr.relation_type,
    nt.depth + 1 AS depth,
    nt.path || child.is_code::TEXT AS path,
    nt.is_code AS parent_is_code
  FROM normative_tree nt
  JOIN standard_relationships sr ON sr.source_id = nt.standard_id
  JOIN standards child ON child.id = sr.target_id
  WHERE nt.depth < max_depth
    -- Cycle protection
    AND NOT (child.is_code::TEXT = ANY(nt.path))
)
SELECT
  nt.standard_id,
  nt.is_code,
  nt.title,
  nt.status,
  nt.relation_type,
  nt.depth,
  nt.path,
  nt.parent_is_code,
  (
    nt.status = 'SUPERSEDED' 
    OR EXISTS (
      SELECT 1 FROM standard_relationships rep 
      WHERE rep.source_id = nt.standard_id AND rep.relation_type = 'SUPERSEDED_BY'
    )
  ) AS is_superseded,
  (
    SELECT rep_s.is_code 
    FROM standard_relationships rep 
    JOIN standards rep_s ON rep_s.id = rep.target_id 
    WHERE rep.source_id = nt.standard_id AND rep.relation_type = 'SUPERSEDED_BY'
    LIMIT 1
  ) AS replacement_code,
  (
    SELECT rep.target_id 
    FROM standard_relationships rep 
    WHERE rep.source_id = nt.standard_id AND rep.relation_type = 'SUPERSEDED_BY'
    LIMIT 1
  ) AS replacement_id
FROM normative_tree nt
WHERE nt.depth > 0
ORDER BY nt.depth ASC, nt.is_code ASC;
$$ LANGUAGE sql STABLE;

-- 6. Helper Function: Traverse by IS Code directly
CREATE OR REPLACE FUNCTION get_normative_dependencies_by_code(start_is_code VARCHAR, max_depth INT DEFAULT 5)
RETURNS TABLE (
  standard_id UUID,
  is_code VARCHAR(100),
  title VARCHAR(500),
  status VARCHAR(50),
  relation_type standard_relation_type,
  depth INT,
  path TEXT[],
  parent_is_code VARCHAR(100),
  is_superseded BOOLEAN,
  replacement_code VARCHAR(100),
  replacement_id UUID
) AS $$
DECLARE
  root_id UUID;
BEGIN
  SELECT id INTO root_id FROM standards WHERE standards.is_code ILIKE ('%' || start_is_code || '%') LIMIT 1;
  IF root_id IS NULL THEN
    RETURN;
  END IF;
  RETURN QUERY SELECT * FROM get_normative_dependencies(root_id, max_depth);
END;
$$ LANGUAGE plpgsql STABLE;

-- ====================================================================
-- 7. Seed Data: Indian Standards for Mandi & Rural Infrastructure
-- ====================================================================

-- Insert Core Standards
INSERT INTO standards (id, is_code, title, abstract, status)
VALUES
  ('a0000001-0000-0000-0000-000000000001', 'IS 456:2000', 'Plain and Reinforced Concrete - Code of Practice', 'General requirements for structural use of plain and reinforced concrete in buildings, bridges, godowns, and mandi infrastructure.', 'ACTIVE'),
  ('a0000001-0000-0000-0000-000000000002', 'IS 383:2016', 'Coarse and Fine Aggregate for Concrete - Specification', 'Requirements for natural and manufactured coarse and fine aggregates for use in concrete production.', 'ACTIVE'),
  ('a0000001-0000-0000-0000-000000000003', 'IS 432 (Part 1):1982', 'Specification for Mild Steel and Medium Tensile Steel Bars', 'Historical standard for mild steel grade I bars in reinforced concrete. Superseded by IS 1786 for structural reinforcement.', 'SUPERSEDED'),
  ('a0000001-0000-0000-0000-000000000004', 'IS 1786:2008', 'High Strength Deformed Steel Bars and Wires for Concrete Reinforcement', 'Specifications for high strength deformed steel (TMT) bars (Fe 415, Fe 500, Fe 550, Fe 600) for concrete reinforcement.', 'ACTIVE'),
  ('a0000001-0000-0000-0000-000000000005', 'IS 269:2015', 'Ordinary Portland Cement - Specification', 'Consolidated Indian Standard for 33, 43, and 53 grade Ordinary Portland Cement, superseding IS 8112 and IS 12269.', 'ACTIVE'),
  ('a0000001-0000-0000-0000-000000000006', 'IS 8112:1989', '43 Grade Ordinary Portland Cement - Specification', 'Withdrawn standard for 43 grade OPC. Consolidated into IS 269:2015.', 'SUPERSEDED'),
  ('a0000001-0000-0000-0000-000000000007', 'IS 12269:1987', '53 Grade Ordinary Portland Cement - Specification', 'Withdrawn standard for 53 grade OPC. Consolidated into IS 269:2015.', 'SUPERSEDED'),
  ('a0000001-0000-0000-0000-000000000008', 'IS 516:2021', 'Method of Tests for Strength of Concrete', 'Mandatory sampling, curing, and compressive strength testing procedures for structural concrete cubes and cylinders.', 'ACTIVE'),
  ('a0000001-0000-0000-0000-000000000009', 'IS 1199:2018', 'Fresh Concrete - Methods of Sampling, Testing and Analysis', 'Covers slump cone workability, compaction factor, density, and air content of freshly mixed concrete.', 'ACTIVE'),
  ('a0000001-0000-0000-0000-000000000010', 'IS 10262:2019', 'Concrete Mix Proportioning - Guidelines', 'Design mix procedures for standard concrete (M15-M60) and self-compacting concrete.', 'ACTIVE'),
  ('a0000001-0000-0000-0000-000000000011', 'IS 800:2007', 'General Construction in Steel - Code of Practice', 'Code of practice for structural steel trusses, mandi auction sheds, steel framing, and godown canopies.', 'ACTIVE'),
  ('a0000001-0000-0000-0000-000000000012', 'IS 2062:2011', 'Hot Rolled Medium and High Tensile Structural Steel', 'Steel grades for structural steel fabrication (E250, E350, E450).', 'ACTIVE'),
  ('a0000001-0000-0000-0000-000000000013', 'IS 1608:2018', 'Metallic Materials - Tensile Testing', 'Tensile testing methods for metallic structural components, welds, and reinforcement bars.', 'ACTIVE'),
  ('a0000001-0000-0000-0000-000000000014', 'IS 1904:2021', 'Design and Construction of Foundations in Soils', 'General requirements for shallow and deep foundations in soils for rural infrastructure.', 'ACTIVE'),
  ('a0000001-0000-0000-0000-000000000015', 'IS 1893 (Part 1):2016', 'Criteria for Earthquake Resistant Design of Structures', 'Seismic design provisions for civil structures and storage depots.', 'ACTIVE'),
  ('a0000001-0000-0000-0000-000000000016', 'IS 607:1971', 'Code of Practice for Construction of Bagged Storage Food Grain Godowns', 'Specifications for plinth height, damp-proofing, fumigation tightness, and ventilation in mandi grain storage.', 'ACTIVE'),
  ('a0000001-0000-0000-0000-000000000017', 'IS 1436:1991', 'Weighbridges - Specification for Weighing Road Vehicles', 'Metrological, civil pit, and load cell requirements for electronic mandi weighbridges.', 'ACTIVE')
ON CONFLICT (is_code) DO UPDATE 
SET title = EXCLUDED.title, abstract = EXCLUDED.abstract, status = EXCLUDED.status;

-- Insert Normative & Supersession Relationships
INSERT INTO standard_relationships (source_id, target_id, relation_type, notes)
VALUES
  -- IS 456 (Concrete) Normative References
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002', 'NORMATIVE_REF', 'Mandatory aggregate quality criteria under Cl. 5.3'),
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000004', 'NORMATIVE_REF', 'Mandatory high-yield strength reinforcement bars under Cl. 5.6'),
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000005', 'NORMATIVE_REF', 'Mandatory cement conforming to IS 269 under Cl. 5.1'),
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000010', 'NORMATIVE_REF', 'Concrete mix proportioning guidelines under Cl. 9'),
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000008', 'ALLIED_TESTING', 'Mandatory 7-day and 28-day compressive strength testing under Cl. 15'),
  ('a0000001-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000009', 'ALLIED_TESTING', 'Slump cone workability testing under Cl. 7'),

  -- Supersession Chains
  ('a0000001-0000-0000-0000-000000000003', 'a0000001-0000-0000-0000-000000000004', 'SUPERSEDED_BY', 'Mild steel bars under IS 432 superseded by TMT bars under IS 1786'),
  ('a0000001-0000-0000-0000-000000000006', 'a0000001-0000-0000-0000-000000000005', 'SUPERSEDED_BY', 'IS 8112 (43 grade) consolidated into IS 269:2015'),
  ('a0000001-0000-0000-0000-000000000007', 'a0000001-0000-0000-0000-000000000005', 'SUPERSEDED_BY', 'IS 12269 (53 grade) consolidated into IS 269:2015'),

  -- IS 800 (Structural Steel Trusses & Sheds)
  ('a0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000012', 'NORMATIVE_REF', 'Structural steel sections conforming to IS 2062'),
  ('a0000001-0000-0000-0000-000000000011', 'a0000001-0000-0000-0000-000000000013', 'ALLIED_TESTING', 'Tensile and yield testing conforming to IS 1608'),

  -- IS 607 (Mandi Grain Godowns)
  ('a0000001-0000-0000-0000-000000000016', 'a0000001-0000-0000-0000-000000000001', 'NORMATIVE_REF', 'Floor slab and structural RCC columns must conform to IS 456'),
  ('a0000001-0000-0000-0000-000000000016', 'a0000001-0000-0000-0000-000000000014', 'NORMATIVE_REF', 'Substructure foundation design must conform to IS 1904'),

  -- IS 1436 (Mandi Weighbridges)
  ('a0000001-0000-0000-0000-000000000017', 'a0000001-0000-0000-0000-000000000001', 'NORMATIVE_REF', 'Reinforced foundation pit and approach ramps conform to IS 456')
ON CONFLICT (source_id, target_id, relation_type) DO UPDATE
SET notes = EXCLUDED.notes;
