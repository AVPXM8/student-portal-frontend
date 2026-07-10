import fs from 'fs';
import path from 'path';

const PDF_DIRECTORY = path.join(process.cwd(), 'public', 'pyqPdf');

/**
 * Generates a URL-friendly slug from a filename
 */
export function generateSlug(filename) {
  return filename
    .replace(/\.[^/.]+$/, "") // Remove extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, ''); // Trim hyphens
}

/**
 * Categorizes and builds the resource data object entirely from local files
 */
export async function getDynamicResources() {
  const data = {};

  if (!fs.existsSync(PDF_DIRECTORY)) return data;

  const files = fs.readdirSync(PDF_DIRECTORY).filter(f => f.toLowerCase().endsWith('.pdf'));

  console.log(`Categorizing ${files.length} local PDFs...`);

  files.forEach(file => {
    const name = file.replace(/\.[^/.]+$/, "");
    const slug = generateSlug(file);
    const yearMatch = name.match(/\d{4}/);
    const year = yearMatch ? yearMatch[0] : null;
    const isTopicWise = name.toLowerCase().includes('topic wise') || name.toLowerCase().includes('topicwise');
    
    // Determine Category (Case-insensitive matching)
    const upperName = name.toUpperCase();
    let category = 'General Resources';
    
    if (upperName.includes('NIMCET')) category = 'NIMCET';
    else if (upperName.includes('CUET')) category = 'CUET PG';
    else if (upperName.includes('JAMIA')) category = 'JAMIA';
    else if (upperName.includes('MAH-CET') || upperName.includes('MAHCET')) category = 'MAH-CET';
    else if (upperName.includes('AMU')) category = 'AMU';
    else if (upperName.includes('WB-JECA') || upperName.includes('JECA')) category = 'WB-JECA';
    else if (upperName.includes('VITMEE')) category = 'VITMEE';
    else if (upperName.includes('IGDTUW')) category = 'IGDTUW';
    else if (upperName.includes('TU MCA') || upperName.includes('TU-MCA')) category = 'TU MCA';

    if (!data[category]) {
      data[category] = { yearwise: [], topicwise: [] };
    }

    const item = {
      id: slug,
      title: name,
      year: year,
      url: `/resources/viewer/${slug}`,
      slug: slug,
      isLocal: true,
      isNew: year === '2025' || year === '2024'
    };

    const targetList = isTopicWise ? data[category].topicwise : data[category].yearwise;
    
    // Avoid duplicates by slug
    const exists = targetList.find(i => i.slug === slug);
    if (!exists) {
      targetList.push(item);
    }
  });

  // Sort by year descending for yearwise
  Object.keys(data).forEach(cat => {
    data[cat].yearwise.sort((a, b) => (b.year || 0) - (a.year || 0));
  });

  console.log('Final Resource Categories:', Object.keys(data));
  return data;
}

/**
 * Gets all PDF files (flat list from local filesystem)
 */
export async function getAllPdfs() {
  const allResources = [];
  
  if (fs.existsSync(PDF_DIRECTORY)) {
    const files = fs.readdirSync(PDF_DIRECTORY).filter(file => file.endsWith('.pdf'));
    files.forEach(file => {
      const name = file.replace(/\.[^/.]+$/, "");
      const slug = generateSlug(file);
      
      allResources.push({
        name: name,
        slug: slug,
        fileName: file,
        isLocal: true,
        url: `/api/pdf/${slug}`
      });
    });
  }

  return allResources;
}

export async function getPdfBySlug(slug) {
  const allPdfs = await getAllPdfs();
  return allPdfs.find(pdf => pdf.slug === slug);
}

export function getPdfPath(fileName) {
  return path.join(PDF_DIRECTORY, fileName);
}
