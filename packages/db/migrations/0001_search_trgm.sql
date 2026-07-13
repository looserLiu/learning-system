CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 知识条目的 trigram 索引（加速模糊搜索）
CREATE INDEX IF NOT EXISTS knowledge_title_trgm_idx ON knowledge_items USING gin (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS knowledge_content_trgm_idx ON knowledge_items USING gin (content gin_trgm_ops);

-- 标签名称的 trigram 索引
CREATE INDEX IF NOT EXISTS tags_name_trgm_idx ON tags USING gin (name gin_trgm_ops);
