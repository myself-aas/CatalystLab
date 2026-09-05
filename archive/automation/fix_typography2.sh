for file in $(find src/components/home src/pages -type f -name "*.tsx"); do
  sed -i 's/text-4xl sm:text-6xl lg:text-7xl/text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[1.05]/g' "$file"
  # Let's just fix the classNames directly in components that matter
done
