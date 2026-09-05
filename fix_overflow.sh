for file in $(find src -type f -name "*.tsx"); do
  # Replace instances of `overflow-x-auto` with `overflow-x-auto scrollbar-none touch-pan-x`
  # Only if it doesn't already have scrollbar-none
  if grep -q "overflow-x-auto" "$file"; then
    if ! grep -q "scrollbar-none" "$file"; then
      sed -i 's/overflow-x-auto/overflow-x-auto scrollbar-none touch-pan-x/g' "$file"
    fi
  fi
done
