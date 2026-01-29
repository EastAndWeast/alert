// 产品映射模块 - Symbol Mapping Engine (升级版：支持动态分类)

const ProductsModule = {
    // 获取当前用户可见的产品映射
    getMappings() {
        var user = MockData.currentUser;
        var sourceIds = MockData.getUserSourceIds(user);
        return MockData.productMappings.filter(function (m) {
            return sourceIds.indexOf(m.source_id) >= 0;
        });
    },

    getCategories() {
        return MockData.productCategories;
    },

    render() {
        var user = MockData.currentUser;
        var sourceIds = MockData.getUserSourceIds(user);
        var dataSources = MockData.dataSources.filter(function (ds) {
            return sourceIds.indexOf(ds.source_id) >= 0;
        });
        var mappings = this.getMappings();
        var categories = this.getCategories();
        var isReadOnly = Permissions.isReadOnly(user);

        var html = '<div class="page-content">';

        // 页面头部
        html += '<div class="page-header">';
        html += '<div class="page-header-left">';
        html += '<span class="rule-icon-large">📦</span>';
        html += '<div><h2>Symbol Mapping Engine</h2><p class="text-muted">' + I18n.t('symbol_mapping_engine_desc') + '</p></div>';
        html += '</div>';
        if (!isReadOnly) {
            html += '<div class="header-actions">';
            html += '<button class="btn btn-secondary" onclick="ProductsModule.showCategoryManager()">📁 ' + I18n.t('manage_categories') + '</button>';
            html += '<button class="btn btn-primary" onclick="ProductsModule.showAddMappingModal()"><span>➕</span> ' + I18n.t('add_mapping') + '</button>';
            html += '</div>';
        }
        html += '</div>';

        // 产品大类概览卡片
        html += '<div class="category-overview">';
        html += '<h3>📁 ' + I18n.t('product_category_definition') + '</h3>';
        html += '<div class="category-grid">';
        for (var i = 0; i < categories.length; i++) {
            var cat = categories[i];
            var count = mappings.filter(function (m) { return m.product_category === cat.id; }).length;
            html += '<div class="category-card">';
            html += '<div class="category-icon">' + cat.icon + '</div>';
            html += '<div class="category-info">';
            html += '<div class="category-name">' + I18n.t(cat.id + '_category_name') + '</div>';
            html += '<div class="category-desc">' + I18n.t(cat.id + '_category_desc') + '</div>';
            html += '<div class="category-count">' + count + ' ' + I18n.t('unit_mapping_records') + '</div>';
            html += '</div>';
            html += '</div>';
        }
        html += '</div></div>';

        // 数据源选择和过滤
        html += '<div class="filter-bar">';
        html += '<div class="filter-group"><span class="filter-label">' + I18n.t('datasource_label') + '：</span>';
        html += '<select class="filter-select" id="sourceFilter" onchange="ProductsModule.filterMappings()">';
        html += '<option value="all">' + I18n.t('all_datasources') + '</option>';
        for (var j = 0; j < dataSources.length; j++) {
            html += '<option value="' + dataSources[j].source_id + '">' + dataSources[j].source_name + '</option>';
        }
        html += '</select></div>';
        html += '<div class="filter-group"><span class="filter-label">' + I18n.t('category_label') + '：</span>';
        html += '<select class="filter-select" id="categoryFilter" onchange="ProductsModule.filterMappings()">';
        html += '<option value="all">' + I18n.t('all_categories') + '</option>';
        for (var k = 0; k < categories.length; k++) {
            html += '<option value="' + categories[k].id + '">' + categories[k].name + '</option>';
        }
        html += '</select></div>';
        html += '<div class="filter-group"><span class="filter-label">' + I18n.t('search_label') + '：</span>';
        html += '<input type="text" class="form-control" id="searchFilter" placeholder="' + I18n.t('placeholder_search_symbol') + '" onkeyup="ProductsModule.filterMappings()" style="width: 200px;">';
        html += '</div></div>';

        // 映射表格
        html += '<div class="section-card">';
        html += '<div class="section-header"><h3>🔗 ' + I18n.t('symbol_mapping_list') + '</h3><span class="badge badge-info">' + mappings.length + ' ' + I18n.t('unit_records') + '</span></div>';
        html += '<div class="section-body" style="padding:0;">';
        html += '<table class="data-table"><thead><tr>';
        html += '<th>' + I18n.t('datasource_header') + '</th><th>' + I18n.t('raw_symbol_header') + '</th><th>' + I18n.t('unified_code_header') + '</th><th>' + I18n.t('product_category_header') + '</th><th>' + I18n.t('matching_rule_header') + '</th><th>' + I18n.t('status_header') + '</th>';
        if (!isReadOnly) html += '<th>操作</th>';
        html += '</tr></thead><tbody id="mappingTableBody">';
        html += this.renderMappingRows(mappings, isReadOnly);
        html += '</tbody></table>';
        html += '</div></div>';

        // 批量导入区域
        if (!isReadOnly) {
            html += '<div class="section-card mt-4">';
            html += '<div class="section-header"><h3>📤 ' + I18n.t('batch_operations') + '</h3></div>';
            html += '<div class="section-body">';
            html += '<div class="batch-actions">';
            html += '<button class="btn btn-secondary" onclick="ProductsModule.showBatchImportModal()">📥 ' + I18n.t('batch_import') + '</button>';
            html += '<button class="btn btn-secondary" onclick="ProductsModule.exportMappings()">📤 ' + I18n.t('export_config') + '</button>';
            html += '<button class="btn btn-secondary" onclick="ProductsModule.autoDetect()">🔍 ' + I18n.t('auto_detect_new') + '</button>';
            html += '</div></div></div>';
        }

        html += '</div>';
        return html;
    },

    renderMappingRows(mappings, isReadOnly) {
        var self = this;
        var categories = this.getCategories();
        return mappings.map(function (m) {
            var cat = categories.find(function (c) { return c.id === m.product_category; });
            var catName = cat ? I18n.t(cat.id + '_category_name') : m.product_category;
            var catIcon = cat ? cat.icon : '❓';
            var matchType = m.match_pattern ? I18n.t('wildcard_matching') : I18n.t('exact_matching');

            var row = '<tr data-id="' + m.id + '">';
            row += '<td><span class="badge badge-' + (m.platform === 'MT4' ? 'primary' : 'success') + '">' + Utils.getSourceName(m.source_id) + '</span></td>';
            row += '<td><code class="symbol-code">' + m.raw_product_name + '</code></td>';
            row += '<td><strong>' + m.unified_product_code + '</strong></td>';
            row += '<td><span class="category-badge">' + catIcon + ' ' + catName + '</span></td>';
            row += '<td><span class="match-type ' + (m.match_pattern ? 'wildcard' : 'exact') + '">' + matchType + '</span></td>';
            row += '<td><label class="switch" style="transform: scale(0.8);"><input type="checkbox" ' + (m.enabled ? 'checked' : '') + ' onchange="ProductsModule.toggleMapping(' + m.id + ')"><span class="switch-slider"></span></label></td>';
            if (!isReadOnly) {
                row += '<td><button class="btn btn-sm btn-secondary" onclick="ProductsModule.editMapping(' + m.id + ')">' + I18n.t('edit') + '</button> ';
                row += '<button class="btn btn-sm btn-danger" onclick="ProductsModule.deleteMapping(' + m.id + ')">' + I18n.t('delete') + '</button></td>';
            }
            row += '</tr>';
            return row;
        }).join('');
    },

    filterMappings() {
        var sourceFilter = document.getElementById('sourceFilter').value;
        var categoryFilter = document.getElementById('categoryFilter').value;
        var searchFilter = document.getElementById('searchFilter').value.toLowerCase();
        var isReadOnly = Permissions.isReadOnly(MockData.currentUser);

        var mappings = this.getMappings();

        var filtered = mappings.filter(function (m) {
            if (sourceFilter !== 'all' && m.source_id !== sourceFilter) return false;
            if (categoryFilter !== 'all' && m.product_category !== categoryFilter) return false;
            if (searchFilter && m.raw_product_name.toLowerCase().indexOf(searchFilter) < 0 &&
                m.unified_product_code.toLowerCase().indexOf(searchFilter) < 0) return false;
            return true;
        });

        document.getElementById('mappingTableBody').innerHTML = this.renderMappingRows(filtered, isReadOnly);
    },

    toggleMapping(id) {
        var mapping = MockData.productMappings.find(function (m) { return m.id === id; });
        if (mapping) {
            mapping.enabled = !mapping.enabled;
            App.showToast('success', mapping.unified_product_code + ' ' + (mapping.enabled ? I18n.t('enabled') : I18n.t('disabled')));
        }
    },

    deleteMapping(id) {
        if (!confirm(I18n.t('delete_mapping_confirm'))) return;
        var index = MockData.productMappings.findIndex(function (m) { return m.id === id; });
        if (index > -1) {
            MockData.productMappings.splice(index, 1);
            App.showToast('success', I18n.t('mapping_deleted'));
            Router.refresh();
        }
    },

    // --- 分类管理逻辑 ---

    showCategoryManager() {
        var self = this;
        var categories = this.getCategories();

        var html = '<div style="margin-bottom: 20px;">';
        html += '<button class="btn btn-primary btn-sm" onclick="ProductsModule.showAddCategoryForm()">+ ' + I18n.t('add_category') + '</button>';
        html += '</div>';

        html += '<div class="table-container"><table class="table">';
        html += '<thead><tr><th>' + I18n.t('icon_header') + '</th><th>ID</th><th>' + I18n.t('name_header') + '</th><th>' + I18n.t('description_header') + '</th><th>' + I18n.t('actions_header') + '</th></tr></thead>';
        html += '<tbody>';

        categories.forEach(function (cat) {
            html += '<tr>';
            html += '<td>' + cat.icon + '</td>';
            html += '<td>' + cat.id + '</td>';
            html += '<td><strong>' + I18n.t(cat.id + '_category_name') + '</strong></td>';
            html += '<td>' + I18n.t(cat.id + '_category_desc') + '</td>';
            html += '<td>';
            html += '<button class="btn btn-sm btn-secondary" onclick="ProductsModule.editCategory(\'' + cat.id + '\')">' + I18n.t('edit') + '</button> ';
            html += '<button class="btn btn-sm btn-danger" onclick="ProductsModule.deleteCategory(\'' + cat.id + '\')">' + I18n.t('delete') + '</button>';
            html += '</td></tr>';
        });

        html += '</tbody></table></div>';

        App.showModal(I18n.t('product_category_management'), html);
        // 隐藏默认的确认/取消按钮，使用自定义交互
        document.getElementById('modalFooter').style.display = 'none';

        // 恢复 Footer 显示以便其他模态框使用 (hook modal close)
        var closeBtn = document.getElementById('modalClose');
        var originOnClick = closeBtn.onclick;
        // 简单处理：路由刷新会重置模态框状态，或者手动关闭时重置
    },

    showAddCategoryForm() {
        var self = this;
        var html = '<form id="categoryForm">';
        html += '<div class="form-group"><label>' + I18n.t('category_id_label') + ' * (' + I18n.t('english_required') + ')</label><input type="text" name="id" class="form-control" required placeholder="' + I18n.t('placeholder_category_id') + '"></div>';
        html += '<div class="form-group"><label>' + I18n.t('category_name_label') + ' *</label><input type="text" name="name" class="form-control" required placeholder="' + I18n.t('placeholder_category_name_input') + '"></div>';
        html += '<div class="form-group"><label>' + I18n.t('icon_label') + ' (Emoji)</label><input type="text" name="icon" class="form-control" value="📦" placeholder="例如: 🥇"></div>';
        html += '<div class="form-group"><label>' + I18n.t('description_label') + '</label><input type="text" name="description" class="form-control" placeholder="' + I18n.t('placeholder_short_desc') + '"></div>';
        html += '</form>';
        html += '<div class="modal-footer-custom" style="margin-top:20px; text-align:right;">';
        html += '<button class="btn btn-secondary" onclick="ProductsModule.showCategoryManager()">' + I18n.t('back') + '</button> ';
        html += '<button class="btn btn-primary" onclick="ProductsModule.saveCategory(true)">' + I18n.t('save') + '</button>';
        html += '</div>';

        // 覆盖模态框内容，不关闭模态框
        document.getElementById('modalTitle').textContent = I18n.t('add_product_category');
        document.getElementById('modalBody').innerHTML = html;
        document.getElementById('modalFooter').style.display = 'none';
    },

    editCategory(id) {
        var cat = MockData.productCategories.find(function (c) { return c.id === id; });
        if (!cat) return;

        var html = '<form id="categoryForm">';
        html += '<input type="hidden" name="id" value="' + cat.id + '">';
        html += '<div class="form-group"><label>' + I18n.t('category_id_label') + '</label><input type="text" class="form-control" value="' + cat.id + '" disabled></div>';
        html += '<div class="form-group"><label>' + I18n.t('category_name_label') + ' *</label><input type="text" name="name" class="form-control" required value="' + I18n.t(cat.id + '_category_name') + '"></div>';
        html += '<div class="form-group"><label>' + I18n.t('icon_label') + ' (Emoji)</label><input type="text" name="icon" class="form-control" value="' + cat.icon + '"></div>';
        html += '<div class="form-group"><label>' + I18n.t('description_label') + '</label><input type="text" name="description" class="form-control" value="' + I18n.t(cat.id + '_category_desc') + '"></div>';
        html += '</form>';
        html += '<div class="modal-footer-custom" style="margin-top:20px; text-align:right;">';
        html += '<button class="btn btn-secondary" onclick="ProductsModule.showCategoryManager()">' + I18n.t('back') + '</button> ';
        html += '<button class="btn btn-primary" onclick="ProductsModule.saveCategory(false)">' + I18n.t('save') + '</button>';
        html += '</div>';

        document.getElementById('modalTitle').textContent = I18n.t('edit_product_category');
        document.getElementById('modalBody').innerHTML = html;
        document.getElementById('modalFooter').style.display = 'none';
    },

    saveCategory(isNew) {
        var form = document.getElementById('categoryForm');
        var formData = new FormData(form);
        var id = isNew ? formData.get('id') : formData.get('id'); // isNew时从input取，编辑时从hidden取
        var data = {
            id: id,
            name: formData.get('name'),
            icon: formData.get('icon'),
            description: formData.get('description')
        };

        if (isNew) {
            if (!id) { App.showToast('error', I18n.t('error_category_id_required')); return; }
            if (MockData.addProductCategory(data)) {
                App.showToast('success', I18n.t('category_added'));
                this.showCategoryManager();
            } else {
                App.showToast('error', I18n.t('error_category_id_exists'));
            }
        } else {
            if (MockData.updateProductCategory(id, data)) {
                App.showToast('success', I18n.t('category_updated'));
                this.showCategoryManager();
            } else {
                App.showToast('error', I18n.t('error_update_failed'));
            }
        }
    },

    deleteCategory(id) {
        var mappings = MockData.productMappings.filter(function (m) { return m.product_category === id; });
        if (mappings.length > 0) {
            App.showToast('warning', I18n.t('error_cannot_delete_category_prefix') + ' ' + mappings.length + ' ' + I18n.t('error_cannot_delete_category_suffix'));
            return;
        }

        if (confirm(I18n.t('delete_category_confirm_prefix') + ' ' + id + ' ' + I18n.t('delete_category_confirm_suffix'))) {
            if (MockData.deleteProductCategory(id)) {
                App.showToast('success', I18n.t('category_deleted'));
                this.showCategoryManager(); // 刷新列表
            }
        }
    },

    // --- 映射管理逻辑 ---

    showAddMappingModal() {
        var user = MockData.currentUser;
        var sourceIds = MockData.getUserSourceIds(user);
        var dataSources = MockData.dataSources.filter(function (ds) {
            return sourceIds.indexOf(ds.source_id) >= 0;
        });
        var self = this;
        var categories = this.getCategories();

        var html = '<form id="mappingForm">';
        html += '<div class="form-group"><label>' + I18n.t('datasource_label') + ' *</label><select name="source_id" class="form-control" required>';
        dataSources.forEach(function (ds) {
            html += '<option value="' + ds.source_id + '">' + ds.source_name + ' (' + ds.platform_type + ')</option>';
        });
        html += '</select></div>';

        html += '<div class="form-group"><label>' + I18n.t('raw_symbol_label') + ' *</label>';
        html += '<input type="text" name="raw_product_name" class="form-control" required placeholder="' + I18n.t('placeholder_raw_symbol') + '">';
        html += '<small class="text-muted">' + I18n.t('wildcard_help') + '</small></div>';

        html += '<div class="form-group"><label>' + I18n.t('unified_code_label') + ' *</label>';
        html += '<input type="text" name="unified_product_code" class="form-control" required placeholder="' + I18n.t('placeholder_unified_code') + '"></div>';

        html += '<div class="form-group"><label>' + I18n.t('product_category_header') + ' *</label><select name="product_category" class="form-control" required>';
        categories.forEach(function (cat) {
            html += '<option value="' + cat.id + '">' + cat.icon + ' ' + I18n.t(cat.id + '_category_name') + '</option>';
        });
        html += '</select></div>';

        html += '<div class="form-group"><label><input type="checkbox" name="match_pattern"> ' + I18n.t('use_wildcard_matching') + '</label></div>';
        html += '</form>';

        // 恢复 Footer
        document.getElementById('modalFooter').style.display = 'flex';
        App.showModal(I18n.t('add_symbol_mapping'), html);
        document.getElementById('modalConfirm').onclick = function () { self.saveMapping(); };
    },

    editMapping(id) {
        var mapping = MockData.productMappings.find(function (m) { return m.id === id; });
        if (!mapping) return;
        var self = this;
        var categories = this.getCategories();

        var html = '<form id="mappingForm">';
        html += '<input type="hidden" name="id" value="' + id + '">';

        html += '<div class="form-group"><label>' + I18n.t('datasource_label') + '</label>';
        html += '<input type="text" class="form-control" value="' + Utils.getSourceName(mapping.source_id) + '" disabled></div>';

        html += '<div class="form-group"><label>' + I18n.t('raw_symbol_label') + ' *</label>';
        html += '<input type="text" name="raw_product_name" class="form-control" required value="' + mapping.raw_product_name + '"></div>';

        html += '<div class="form-group"><label>' + I18n.t('unified_code_label') + ' *</label>';
        html += '<input type="text" name="unified_product_code" class="form-control" required value="' + mapping.unified_product_code + '"></div>';

        html += '<div class="form-group"><label>' + I18n.t('product_category_header') + ' *</label><select name="product_category" class="form-control" required>';
        categories.forEach(function (cat) {
            html += '<option value="' + cat.id + '"' + (cat.id === mapping.product_category ? ' selected' : '') + '>' + cat.icon + ' ' + I18n.t(cat.id + '_category_name') + '</option>';
        });
        html += '</select></div>';

        html += '<div class="form-group"><label><input type="checkbox" name="match_pattern"' + (mapping.match_pattern ? ' checked' : '') + '> ' + I18n.t('use_wildcard_matching') + '</label></div>';
        html += '</form>';

        // 恢复 Footer
        document.getElementById('modalFooter').style.display = 'flex';
        App.showModal(I18n.t('edit_symbol_mapping'), html);
        document.getElementById('modalConfirm').onclick = function () { self.saveMapping(); };
    },

    saveMapping() {
        var form = document.getElementById('mappingForm');
        var formData = new FormData(form);
        var id = formData.get('id');

        if (id) {
            // 编辑
            var mapping = MockData.productMappings.find(function (m) { return m.id === parseInt(id); });
            if (mapping) {
                mapping.raw_product_name = formData.get('raw_product_name');
                mapping.unified_product_code = formData.get('unified_product_code');
                mapping.product_category = formData.get('product_category');
                mapping.match_pattern = formData.get('match_pattern') === 'on';
                App.showToast('success', I18n.t('mapping_updated'));
            }
        } else {
            // 新增
            var newMapping = {
                id: MockData.productMappings.length + 1,
                source_id: formData.get('source_id'),
                platform: MockData.dataSources.find(function (ds) { return ds.source_id === formData.get('source_id'); }).platform_type,
                raw_product_name: formData.get('raw_product_name'),
                unified_product_code: formData.get('unified_product_code'),
                product_category: formData.get('product_category'),
                match_pattern: formData.get('match_pattern') === 'on',
                enabled: true
            };
            MockData.productMappings.push(newMapping);
            App.showToast('success', I18n.t('mapping_created'));
        }

        App.hideModal();
        Router.refresh();
    },

    showBatchImportModal() {
        var self = this;
        var html = '<form id="batchImportForm">';
        html += '<div class="form-group"><label>' + I18n.t('batch_import_format_label') + ' (' + I18n.t('one_per_line') + ')</label>';
        html += '<textarea name="importData" class="form-control" rows="10" placeholder="' + I18n.t('placeholder_batch_import') + '"></textarea></div>';
        html += '</form>';

        // 恢复 Footer
        document.getElementById('modalFooter').style.display = 'flex';
        App.showModal(I18n.t('batch_import_mappings'), html);
        document.getElementById('modalConfirm').onclick = function () { self.batchImport(); };
    },

    batchImport() {
        var form = document.getElementById('batchImportForm');
        var data = new FormData(form).get('importData');
        var lines = data.trim().split('\n');
        var imported = 0;
        var user = MockData.currentUser;
        var defaultSourceId = MockData.getUserSourceIds(user)[0];

        for (var i = 0; i < lines.length; i++) {
            var parts = lines[i].split(',');
            if (parts.length >= 3) {
                MockData.productMappings.push({
                    id: MockData.productMappings.length + 1,
                    source_id: defaultSourceId,
                    platform: 'MT5',
                    raw_product_name: parts[0].trim(),
                    unified_product_code: parts[1].trim(),
                    product_category: parts[2].trim(),
                    match_pattern: parts[0].indexOf('*') >= 0,
                    enabled: true
                });
                imported++;
            }
        }

        App.hideModal();
        App.showToast('success', I18n.t('imported_prefix') + ' ' + imported + ' ' + I18n.t('unit_records'));
        Router.refresh();
    },

    exportMappings() {
        var mappings = this.getMappings();
        var csv = mappings.map(function (m) {
            return [m.raw_product_name, m.unified_product_code, m.product_category].join(',');
        }).join('\n');

        var blob = new Blob([csv], { type: 'text/csv' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'symbol_mappings.csv';
        a.click();
        App.showToast('success', I18n.t('export_success'));
    },

    autoDetect() {
        App.showToast('info', I18n.t('auto_detect_help'));
    }
};
