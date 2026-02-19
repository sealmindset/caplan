#!/usr/bin/env python3
"""
Interactive setup script for Container App Template.

Prompts for placeholder values and replaces them throughout the codebase.
"""

import os
import re
import sys
from pathlib import Path
from typing import Optional


PLACEHOLDERS = {
    "__APP_NAME__": {
        "prompt": "Application name (lowercase, hyphens only)",
        "example": "my-api",
        "validate": lambda x: bool(re.match(r"^[a-z0-9-]{3,48}$", x)),
        "error": "Must be 3-48 characters, lowercase letters, numbers, and hyphens only",
    },
    "__APP_TYPE__": {
        "prompt": "Application type",
        "example": "node, python, or java",
        "validate": lambda x: x in ("node", "python", "java"),
        "error": "Must be one of: node, python, java",
    },
    "__COST_CENTER__": {
        "prompt": "Cost center code",
        "example": "100.0000.99010.4315",
        "validate": lambda x: bool(re.match(r"^\d{3}\.\d{4}\.\d{5}\.\d{4}$", x)),
        "error": "Must be format XXX.XXXX.XXXXX.XXXX (e.g., 100.0000.99010.4315)",
    },
    "__DATA_SECURITY__": {
        "prompt": "Data security classification",
        "example": "C-IU (Internal Use), C-IR (Internal Restricted), C-IC (Confidential), C-IP (Public)",
        "validate": lambda x: x.upper() in ("C-IU", "C-IR", "C-IC", "C-IP"),
        "error": "Must be one of: C-IU, C-IR, C-IC, C-IP",
    },
    "__OWNER__": {
        "prompt": "Owner name (team or individual)",
        "example": "Cloud Compute",
        "validate": lambda x: len(x) >= 2,
        "error": "Owner name must be at least 2 characters",
    },
    "__RESOURCE_GROUP__": {
        "prompt": "Azure resource group name",
        "example": "rg-myapp-dev",
        "validate": lambda x: len(x) >= 3,
        "error": "Resource group name must be at least 3 characters",
    },
    "__ENVIRONMENT_ID__": {
        "prompt": "Container Apps Environment ID",
        "example": "/subscriptions/.../resourceGroups/.../providers/Microsoft.App/managedEnvironments/...",
        "validate": lambda x: x.startswith("/subscriptions/") and "managedEnvironments" in x,
        "error": "Must be a valid Container Apps Environment resource ID",
    },
    "__ACR_SERVER__": {
        "prompt": "Azure Container Registry server URL",
        "example": "myacr.azurecr.io",
        "validate": lambda x: x.endswith(".azurecr.io"),
        "error": "Must end with .azurecr.io",
    },
    "__AUTH_CLIENT_ID__": {
        "prompt": "Azure AD App Registration Client ID (or 'skip' to disable auth)",
        "example": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
        "validate": lambda x: x.lower() == "skip" or bool(re.match(r"^[a-f0-9-]{36}$", x.lower())),
        "error": "Must be a valid UUID format or 'skip'",
        "optional": True,
    },
}

FILE_EXTENSIONS = {".tf", ".yml", ".yaml", ".json", ".toml", ".xml", ".md"}

EXCLUDED_DIRS = {
    ".git",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv",
    "target",
    ".terraform",
}


def get_input(placeholder: str, config: dict) -> Optional[str]:
    """Prompt user for a placeholder value with validation."""
    prompt = config["prompt"]
    example = config["example"]
    validate = config["validate"]
    error_msg = config["error"]
    optional = config.get("optional", False)

    while True:
        print(f"\n{placeholder}")
        print(f"  {prompt}")
        print(f"  Example: {example}")

        value = input("  > ").strip()

        if not value:
            if optional:
                return None
            print(f"  Error: Value is required")
            continue

        if optional and value.lower() == "skip":
            return None

        if not validate(value):
            print(f"  Error: {error_msg}")
            continue

        return value


def find_files(root: Path) -> list[Path]:
    """Find all files that might contain placeholders."""
    files = []
    for path in root.rglob("*"):
        if path.is_file() and path.suffix in FILE_EXTENSIONS:
            if not any(excluded in path.parts for excluded in EXCLUDED_DIRS):
                files.append(path)
    return files


def replace_in_file(filepath: Path, replacements: dict[str, str]) -> int:
    """Replace placeholders in a file. Returns count of replacements made."""
    try:
        content = filepath.read_text()
        original = content
        count = 0

        for placeholder, value in replacements.items():
            occurrences = content.count(placeholder)
            if occurrences > 0:
                content = content.replace(placeholder, value)
                count += occurrences

        if content != original:
            filepath.write_text(content)
            return count
        return 0
    except (IOError, UnicodeDecodeError):
        return 0


def cleanup_unused_apps(app_type: str, root: Path):
    """Remove unused app directories."""
    import shutil

    apps_dir = root / "apps"

    # Validate apps_dir is within root
    try:
        apps_dir.resolve().relative_to(root.resolve())
    except ValueError:
        print("  Error: Invalid apps directory path")
        return

    keep = {app_type}
    all_types = {"node", "python", "java"}

    to_remove = all_types - keep

    print(f"\nWould you like to remove unused app directories? ({', '.join(to_remove)})")
    response = input("  [y/N] > ").strip().lower()

    if response == "y":
        for app in to_remove:
            app_path = apps_dir / app
            # Validate path is strictly within apps_dir
            try:
                app_path.resolve().relative_to(apps_dir.resolve())
            except ValueError:
                print(f"  Skipping invalid path: {app_path}")
                continue
            if app_path.exists() and app_path.is_dir():
                shutil.rmtree(app_path)
                print(f"  Removed {app_path}")


def main():
    """Main setup flow."""
    print("=" * 60)
    print("Container App Template Setup")
    print("=" * 60)
    print("\nThis script will replace all __PLACEHOLDER__ values in the codebase.")
    print("Press Ctrl+C at any time to cancel.\n")

    root = Path(__file__).parent

    # Collect values
    values = {}
    for placeholder, config in PLACEHOLDERS.items():
        value = get_input(placeholder, config)
        if value is not None:
            values[placeholder] = value
        elif config.get("optional"):
            # For optional auth, we might want to remove the auth config
            print(f"  Skipping {placeholder}")

    # Confirm
    print("\n" + "=" * 60)
    print("Values to replace:")
    print("=" * 60)
    for placeholder, value in values.items():
        print(f"  {placeholder} -> {value}")

    print("\nProceed with replacement?")
    response = input("  [y/N] > ").strip().lower()

    if response != "y":
        print("Cancelled.")
        sys.exit(0)

    # Replace
    files = find_files(root)
    total_replacements = 0

    print("\nReplacing placeholders...")
    for filepath in files:
        count = replace_in_file(filepath, values)
        if count > 0:
            print(f"  Updated: {filepath.relative_to(root)}")
            total_replacements += count

    print(f"\nDone! Updated {total_replacements} occurrences across {len(files)} files.")

    # Cleanup
    if "__APP_TYPE__" in values:
        cleanup_unused_apps(values["__APP_TYPE__"], root)

    print("\nNext steps:")
    print("  1. Review the changes: git diff")
    print("  2. Configure GitHub secrets (see README.md)")
    print("  3. Commit and push: git add . && git commit -m 'feat: configure app'")


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nCancelled.")
        sys.exit(1)
