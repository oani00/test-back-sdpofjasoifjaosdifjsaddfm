import os

def js_to_single_txt(root_dir, output_file):
    entries = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip node_modules directories
        dirnames[:] = [d for d in dirnames if d != 'node_modules']
        for filename in filenames:
            if filename.endswith('.js'):
                js_path = os.path.join(dirpath, filename)
                rel_path = os.path.relpath(js_path, root_dir)
                with open(js_path, 'r', encoding='utf-8') as js_file:
                    content = js_file.read()
                entries.append(f"<{rel_path}>\n{content}\n</{rel_path}>\n")
    with open(output_file, 'w', encoding='utf-8') as out_file:
        out_file.writelines(entries)

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, 'code.txt')
    js_to_single_txt(script_dir, output_path)
