"""Modular star helper: list Python functions and classes in source read from stdin.

The family key hashes the parsed structure, so layout and comments do not change it. Nothing is executed.
"""
import ast
import hashlib
import json
import sys

src = sys.stdin.buffer.read()
try:
    tree = ast.parse(src)
except (SyntaxError, ValueError) as exc:
    print(json.dumps({"issue": "Python parse failed: " + str(exc).splitlines()[0][:160], "functions": []}))
    sys.exit(0)

methods = set()
for node in ast.walk(tree):
    if isinstance(node, ast.ClassDef):
        for child in node.body:
            if isinstance(child, (ast.FunctionDef, ast.AsyncFunctionDef)):
                methods.add(id(child))

out = []
for node in ast.walk(tree):
    if not isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
        continue
    first = min([node.lineno] + [d.lineno for d in node.decorator_list])
    last = node.end_lineno
    if last - first + 1 < 3:
        continue
    kind = "class" if isinstance(node, ast.ClassDef) else ("method" if id(node) in methods else "function")
    key = hashlib.sha256(("py\0" + ast.dump(node, include_attributes=False)).encode()).hexdigest()
    out.append({"first": first, "last": last, "name": node.name, "kind": kind, "family": key})

print(json.dumps({"issue": None, "functions": out}))
