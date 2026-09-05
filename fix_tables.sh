for file in $(find src/pages/docs -type f -name "*.tsx"); do
  if grep -q "<table" "$file"; then
    if ! grep -q "overflow-x-auto" "$file"; then
      sed -i 's/<div className="ds-card p-4">/<div className="ds-card p-4 overflow-x-auto scrollbar-none touch-pan-x">/g' "$file"
    fi
  fi
done
