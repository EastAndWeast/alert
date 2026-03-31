
# patch_nav.py - Patch index.html nav
import os

base = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'trading-risk-admin')
html_path = os.path.join(base, 'index.html')

with open(html_path, 'r', encoding='utf-8') as f:
    content = f.read()

if 'rules-blacklist' in content:
    print('Nav already patched, skipping nav step.')
else:
    # The file uses \n line endings (confirmed from debug output)
    OLD = '<li><a href="#rules-deposit" class="nav-link" data-page="rules-deposit"\n                                    data-i18n="deposit_withdrawal">Deposit & Withdrawal</a></li>\n                        </ul>'
    NEW = '<li><a href="#rules-deposit" class="nav-link" data-page="rules-deposit"\n                                    data-i18n="deposit_withdrawal">Deposit & Withdrawal</a></li>\n                            <li style="margin-top:6px;padding-top:6px;border-top:1px dashed var(--border-color);"><a href="#rules-blacklist" class="nav-link" data-page="rules-blacklist"\n                                    data-i18n="blacklist">IP/CID Blacklist</a></li>\n                            <li><a href="#rules-fakeip" class="nav-link" data-page="rules-fakeip"\n                                    data-i18n="fake_ip">Fake / Proxy IP</a></li>\n                            <li><a href="#rules-hedge-ip" class="nav-link" data-page="rules-hedge-ip"\n                                    data-i18n="hedge_ip">Position Hedge (IP)</a></li>\n                        </ul>'
    if OLD in content:
        content = content.replace(OLD, NEW, 1)
        print('Nav patched successfully.')
    else:
        print('ERROR: Still not found. Dumping raw chars around marker:')
        idx = content.find('rules-deposit')
        snippet = content[idx-10:idx+250]
        for i, c in enumerate(snippet):
            print(i, repr(c))
        exit(1)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(content)
print('index.html saved.')
