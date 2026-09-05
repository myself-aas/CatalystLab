for file in $(find src -type f -name "*.tsx"); do
  # Replace global typography scales if they don't match the required tracker
  # Hero: text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-[-0.04em] leading-[1.05]
  # Section: text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.035em] leading-[1.12]
  # Card Titles: text-lg sm:text-xl font-medium tracking-[-0.02em]
  sed -i 's/text-4xl sm:text-5xl lg:text-6xl font-extrabold/text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.035em] leading-[1.12]/g' "$file"
  sed -i 's/text-4xl sm:text-5xl lg:text-6xl/text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-[-0.035em] leading-[1.12]/g' "$file"
done
