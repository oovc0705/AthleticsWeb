-- 创建管理员操作记录表
CREATE TABLE IF NOT EXISTS admin_operation_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    admin_name VARCHAR(50) NOT NULL,
    operation_type VARCHAR(20) NOT NULL CHECK (operation_type IN ('create', 'update', 'delete')),
    target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('athlete', 'event', 'news', 'user')),
    target_id INTEGER,
    target_title VARCHAR(200),
    target_content JSONB,
    original_content JSONB,
    source_page VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引提高查询性能
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_operation_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_operation_type ON admin_operation_logs(operation_type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_target_type ON admin_operation_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_operation_logs(created_at);

-- 为操作记录表添加更新时间的触发器函数
CREATE TRIGGER IF NOT EXISTS update_admin_operation_logs_updated_at 
    BEFORE UPDATE ON admin_operation_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();