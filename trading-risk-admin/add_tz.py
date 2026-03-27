import re

file_path = "js/mock-data.js"
with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
count = 0
for line in lines:
    if "{ alert_id:" in line:
        if "'DS001'" in line:
            offset = -300
        elif "'DS003'" in line:
            offset = 660
        else:
            offset = 0
        line = line.replace("{ alert_id:", f"{{ server_timezone_offset: {offset}, alert_id:")
        count += 1
    new_lines.append(line)

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print(f"Updated mock-data.js, changed {count} lines")
