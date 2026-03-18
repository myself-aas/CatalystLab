export async function getOpenAccessPdf(doi: string): Promise<string | undefined> {
  try {
    const response = await fetch(`https://api.unpaywall.org/v2/${doi}?email=catalyst@example.com`);
    if (!response.ok) return undefined;
    
    const data = await response.json();
    return data.best_oa_location?.url_for_pdf;
  } catch (error) {
    return undefined;
  }
}
