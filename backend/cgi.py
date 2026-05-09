"""Small compatibility shim providing `parse_header` for environments
where the standard-library `cgi` module is unavailable (Python 3.13+).

This minimal implementation only implements `parse_header(header_value)`
which returns (value, params_dict) similar to the legacy stdlib behaviour.
It is intentionally small and only parses simple ;key=value pairs used by
feedparser for Content-Type parsing.
"""

from typing import Tuple, Dict


def parse_header(header_value: str) -> Tuple[str, Dict[str, str]]:
    if not header_value:
        return "", {}

    # split on semicolons, first part is main value
    parts = [p.strip() for p in header_value.split(";") if p is not None]
    main = parts[0].lower() if parts else ""
    params = {}
    for p in parts[1:]:
        if not p:
            continue
        if "=" in p:
            k, v = p.split("=", 1)
            k = k.strip().lower()
            v = v.strip()
            if len(v) >= 2 and v[0] == '"' and v[-1] == '"':
                v = v[1:-1]
            params[k] = v
        else:
            # parameter without value (rare) -> map to empty string
            params[p.lower()] = ""

    return main, params
