export interface DatasetResult {
  id: string;
  name: string;
  description: string;
  url: string;
  downloadUrl?: string;
  size?: string;
  format?: string;
  license?: string;
  source: string;
}

export async function searchKaggle(query: string): Promise<DatasetResult[]> {
  try {
    const res = await fetch(`https://www.kaggle.com/api/v1/datasets/list?search=${encodeURIComponent(query)}`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).slice(0, 5).map((d: any) => ({
      id: d.ref,
      name: d.title,
      description: d.description || '',
      url: `https://www.kaggle.com/${d.ref}`,
      downloadUrl: `https://www.kaggle.com/${d.ref}/download`,
      size: d.size,
      source: 'Kaggle'
    }));
  } catch (e) {
    console.error("Kaggle Error", e);
    return [];
  }
}

export async function searchZenodo(query: string): Promise<DatasetResult[]> {
  try {
    const res = await fetch(`https://zenodo.org/api/records?q=${encodeURIComponent(query)}&type=dataset&size=5`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.hits?.hits || []).map((d: any) => ({
      id: d.id.toString(),
      name: d.metadata.title,
      description: d.metadata.description?.replace(/<[^>]*>/g, '') || '',
      url: d.links.html,
      downloadUrl: d.files?.[0]?.links?.self,
      size: d.files?.[0]?.size ? `${(d.files[0].size / 1024 / 1024).toFixed(2)} MB` : undefined,
      license: d.metadata.license?.id,
      source: 'Zenodo'
    }));
  } catch (e) {
    console.error("Zenodo Error", e);
    return [];
  }
}

export async function searchHarvardDataverse(query: string): Promise<DatasetResult[]> {
  try {
    const res = await fetch(`https://dataverse.harvard.edu/api/search?q=${encodeURIComponent(query)}&type=dataset&per_page=5`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data?.items || []).map((d: any) => ({
      id: d.global_id,
      name: d.name,
      description: d.description || '',
      url: d.url,
      source: 'Harvard Dataverse'
    }));
  } catch (e) {
    console.error("Dataverse Error", e);
    return [];
  }
}

export async function searchOpenML(query: string): Promise<DatasetResult[]> {
  try {
    const res = await fetch(`https://www.openml.org/api/v1/json/data/list/data_name/${encodeURIComponent(query)}/limit/5`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data?.dataset || []).map((d: any) => ({
      id: d.did.toString(),
      name: d.name,
      description: '',
      url: `https://www.openml.org/search?type=data&id=${d.did}`,
      format: d.format,
      source: 'OpenML'
    }));
  } catch (e) {
    console.error("OpenML Error", e);
    return [];
  }
}

export async function searchDatasets(query: string): Promise<DatasetResult[]> {
  const results = await Promise.allSettled([
    searchKaggle(query),
    searchZenodo(query),
    searchHarvardDataverse(query),
    searchOpenML(query)
  ]);

  const allDatasets: DatasetResult[] = [];
  results.forEach(res => {
    if (res.status === 'fulfilled') {
      allDatasets.push(...res.value);
    }
  });

  return allDatasets;
}
