
# patch_i18n.py - Inject new i18n keys for IP rules module
import os

i18n_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'trading-risk-admin', 'js', 'i18n.js')
with open(i18n_path, 'r', encoding='utf-8') as f:
    content = f.read()

if "'blacklist'" in content and 'IP/CID Blacklist' in content:
    print('i18n already patched, skipping.')
    exit(0)

# ==== EN entries (insert before the closing 'no_data' line in EN block) ====
EN_ANCHOR = "            'no_data': 'No data'\n        },"
EN_NEW = """            'no_data': 'No data',
            // ---- IP Risk Rules ----
            'blacklist': 'IP/CID Blacklist',
            'blacklist_desc': 'Block known malicious IPs and client accounts. Any login or trade matching the blacklist will trigger an immediate alert.',
            'fake_ip': 'Fake / Proxy IP',
            'fake_ip_desc': 'Detect clients using data center IPs, cloud servers or VPN to fake their location. Track city-level roaming anomalies.',
            'hedge_ip': 'Position Hedge (IP)',
            'hedge_ip_desc': 'Detect cross-account hedging under the same IP within a defined time window. Identify organized arbitrage behavior.',
            'add_to_blacklist': 'Add to Blacklist',
            'bl_total': 'Total Blocked',
            'bl_ip_count': 'Blocked IPs',
            'bl_cid_count': 'Blocked CIDs',
            'bl_type': 'Type',
            'bl_value': 'Value (IP / CID)',
            'bl_reason': 'Block Reason',
            'bl_reason_placeholder': 'e.g. 2025 malicious hedging, IP used for arbitrage exploitation',
            'bl_added_by': 'Added By',
            'bl_added_at': 'Added At',
            'bl_remove': 'Remove',
            'bl_remove_confirm': 'Remove this entry from the blacklist?',
            'bl_fill_required': 'Please fill in Type, Value and Reason.',
            'bl_added': 'Entry added to blacklist.',
            'bl_removed': 'Entry removed from blacklist.',
            'blacklist_entries': 'Blacklist Entries',
            'bl_how_it_works_title': 'How Blacklisting Works',
            'bl_how_it_works_desc': 'When a new login session or trade event is detected via the Manager API, the system compares the client IP and Account CID against this blacklist. If any match is found, an immediate alert is pushed to the configured channels (Teams / Telegram / Lark). Operators can then review and take action from the Alert Records page.',
            'fakeip_config': 'Detection Config',
            'block_datacenters': 'Block Data Center IPs',
            'block_datacenters_desc': 'Flag logins from known cloud servers (AWS, Alibaba, Vultr, DigitalOcean, etc.)',
            'roaming_detection': 'Roaming Detection',
            'roaming_detection_desc': 'Alert when a client logs in from a city not in their trusted location list.',
            'exempted_accounts': 'Exempted Accounts (VIP)',
            'exempted_accounts_placeholder': 'Account ID or CID',
            'trusted_locations': 'Trusted Locations',
            'trusted_locations_count': 'trusted',
            'tl_account': 'Account',
            'tl_city': 'City / Country',
            'tl_ip': 'Trusted IP',
            'tl_note': 'Note',
            'tl_remove_confirm': 'Remove this trusted location?',
            'tl_removed': 'Trusted location removed.',
            'fakeip_recent_alerts': 'Recent Fake IP Alerts',
            'fakeip_resolved_location': 'Resolved Location',
            'fakeip_registered': 'Registered Country',
            'type': 'Type',
            'unresolved': 'Unresolved',
            'trusted': 'Trusted',
            'confirmed_risk': 'Confirmed Risk',
            'false_positive': 'False Positive',
            'trust_location': 'Trust Location',
            'trust_location_tip': 'Mark this city as safe for this client. No further alerts for this location.',
            'confirm_risk': 'Confirm Risk',
            'fakeip_how_works_title': 'Detection Logic',
            'fakeip_trigger_dc': 'Data Center / Proxy Detection',
            'fakeip_trigger_dc_desc': 'The system retrieves the ISP / ASN type of each login IP. If classified as a hosting provider or known VPN range, an alert is triggered.',
            'fakeip_trigger_roam': 'City-level Roaming Detection',
            'fakeip_trigger_roam_desc': 'Each client maintains a list of trusted cities. If a login occurs from a new city, an alert is triggered. Operators can whitelist it by clicking [Trust Location], which prevents future alerts for that city.',
            'hedge_config': 'Detection Config',
            'hedge_time_window': 'Analysis Time Window',
            'hedge_time_window_help': 'Monitors orders placed within this time span for opposing direction signals.',
            'hedge_min_lots': 'Min Lots (per-leg)',
            'symbol_filter_label': 'Symbol Filter',
            'all_if_empty': 'All symbols if empty',
            'save_config': 'Save Config',
            'config_saved': 'Configuration saved.',
            'hedge_recent_alerts': 'Recent Hedge Alerts',
            'hedge_account_a': 'Account A (Dir)',
            'hedge_account_b': 'Account B (Dir)',
            'hedge_lots': 'Lots A / B',
            'hedge_time_diff': 'Time Diff',
            'hedge_how_works_title': 'How Hedge Detection Works',
            'hedge_how_works_desc': 'The system groups incoming trades by IP address. Within the configured time window, if two different accounts share the same IP and open opposing positions on the same symbol, a hedge alert is triggered. This is a strong signal of organized cross-account arbitrage. Operators can confirm or dismiss the alert after investigation.',
            'actions': 'Actions',
            'trusted_by_operator': 'Confirmed by operator',
            'location_trusted_msg': 'location trusted for',
            'risk_confirmed_msg': 'Alert confirmed as real risk.',
            'marked_false_positive': 'Marked as false positive.'
        },"""

ZH_ANCHOR = "        'zh': {"
ZH_NEW_ENTRIES = """            // ---- IP 风控规则 (在 deposit_withdrawal 之后追加) ----
            'blacklist': 'IP/CID 黑名单',
            'blacklist_desc': '封锁已知恶意 IP 和客户账号。命中黑名单的登录或交易将立即触发告警。',
            'fake_ip': 'Fake IP 检测',
            'fake_ip_desc': '检测使用数据中心 IP、云服务器或 VPN 伪装属地的客户。以城市级颗粒度追踪漫游异常。',
            'hedge_ip': '跨账号 IP 对冲检测',
            'hedge_ip_desc': '在设定的时间窗口内，检测同一 IP 下不同账号开立反向仓位的对冲套利行为。',
            'add_to_blacklist': '添加黑名单',
            'bl_total': '黑名单总数',
            'bl_ip_count': '已封锁 IP',
            'bl_cid_count': '已封锁 CID',
            'bl_type': '类型',
            'bl_value': 'IP / CID 值',
            'bl_reason': '封锁原因',
            'bl_reason_placeholder': '例如：2025年恶意对冲套利，同IP多账号反向开仓',
            'bl_added_by': '添加人',
            'bl_added_at': '添加时间',
            'bl_remove': '移除',
            'bl_remove_confirm': '确定从黑名单中移除此条目？',
            'bl_fill_required': '请填写类型、IP/CID 值和原因。',
            'bl_added': '已添加至黑名单。',
            'bl_removed': '已从黑名单移除。',
            'blacklist_entries': '黑名单条目',
            'bl_how_it_works_title': '黑名单工作原理',
            'bl_how_it_works_desc': '每当通过 Manager API 检测到新登录会话或交易事件时，系统会将客户 IP 和账号 CID 与此黑名单进行比对。若命中，系统立即向配置的频道（Teams / Telegram / Lark）推送告警。风控操作员可在告警记录页面进行核查和处理。',
            'fakeip_config': '检测配置',
            'block_datacenters': '拦截数据中心 IP',
            'block_datacenters_desc': '标记来自已知云服务器的登录（阿里云、AWS、Vultr、DigitalOcean 等）',
            'roaming_detection': '漫游检测',
            'roaming_detection_desc': '客户从其受信任城市列表以外的城市登录时发出告警。',
            'exempted_accounts': 'VIP 豁免账户',
            'exempted_accounts_placeholder': '输入账户 ID 或 CID',
            'trusted_locations': '受信任地点',
            'trusted_locations_count': '已信任',
            'tl_account': '账户',
            'tl_city': '城市 / 国家',
            'tl_ip': '受信任 IP',
            'tl_note': '备注',
            'tl_remove_confirm': '移除此受信任位置？',
            'tl_removed': '受信任位置已移除。',
            'fakeip_recent_alerts': '近期 Fake IP 告警',
            'fakeip_resolved_location': '解析位置',
            'fakeip_registered': '注册地区',
            'type': '类型',
            'unresolved': '待处理',
            'trusted': '已信任',
            'confirmed_risk': '确认风险',
            'false_positive': '误报',
            'trust_location': '设为安全',
            'trust_location_tip': '将此城市标记为该客户的安全地点，后续不再提醒。',
            'confirm_risk': '确认风险',
            'fakeip_how_works_title': '检测逻辑说明',
            'fakeip_trigger_dc': '数据中心/代理检测',
            'fakeip_trigger_dc_desc': '系统解析每次登录 IP 的 ISP/ASN 类型。若属于托管服务商或已知 VPN 网段，则触发告警。',
            'fakeip_trigger_roam': '城市级漫游检测',
            'fakeip_trigger_roam_desc': '每位客户维护一份受信任城市列表。从新城市登录时触发告警。风控员可点击【设为安全】将该城市加入白名单，后续不再提醒。',
            'hedge_config': '检测配置',
            'hedge_time_window': '分析时间窗口',
            'hedge_time_window_help': '在该时间范围内，监控是否出现同 IP 反向持仓信号。',
            'hedge_min_lots': '最小手数(单腿)',
            'symbol_filter_label': '品种过滤',
            'all_if_empty': '留空则监控全品种',
            'save_config': '保存配置',
            'config_saved': '配置已保存。',
            'hedge_recent_alerts': '近期对冲告警',
            'hedge_account_a': '账户 A (方向)',
            'hedge_account_b': '账户 B (方向)',
            'hedge_lots': '手数 A / B',
            'hedge_time_diff': '时差',
            'hedge_how_works_title': '对冲检测工作原理',
            'hedge_how_works_desc': '系统以 IP 地址为分组键，监控传入的交易流。在配置的时间窗口内，若两个不同账户共享同一 IP 并对同一品种开立反向仓位，则触发对冲告警。这是有组织的跨账号套利的强烈信号。风控员可在核查后确认或驳回告警。',
            'actions': '操作',
            'trusted_by_operator': '已由风控确认',
            'location_trusted_msg': '地点已设为安全：',
            'risk_confirmed_msg': '告警已确认为真实风险。',
            'marked_false_positive': '已标记为误报。'"""

if "'blacklist'" in content:
    print('i18n already patched.')
    exit(0)

# Patch EN block
if EN_ANCHOR in content:
    content = content.replace(EN_ANCHOR, EN_NEW, 1)
    print('EN block patched.')
else:
    print('ERROR: EN anchor not found')
    exit(1)

# Patch ZH block - find the 'deposit_withdrawal' zh entry and add after
zh_anchor_insert = "            'deposit_withdrawal': '出入金监控',"
if zh_anchor_insert in content:
    content = content.replace(zh_anchor_insert, zh_anchor_insert + '\n' + ZH_NEW_ENTRIES + ',', 1)
    print('ZH block patched.')
else:
    print('ERROR: ZH anchor not found. Searching...')
    idx = content.find("deposit_withdrawal")
    print(repr(content[idx-50:idx+200]))
    exit(1)

with open(i18n_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('i18n.js saved successfully.')
