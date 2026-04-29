import fs from 'fs';
import path from 'path';
import { PYQ_DATA } from '../data/resourceData';

const PDF_DIRECTORY = path.join(process.cwd(), 'data', 'pyqPdf');

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
 * Categorizes and builds the entire PYQ_DATA object from local files and static data
 */
export async function getDynamicResources() {
  const data = JSON.parse(JSON.stringify(PYQ_DATA)); // Deep copy static data

  // Initialize slugs for static data if they don't exist
  Object.keys(data).forEach(cat => {
    ['yearwise', 'topicwise'].forEach(type => {
      data[cat][type] = data[cat][type].map(item => ({
        ...item,
        slug: item.slug || generateSlug(item.title)
      }));
    });
  });

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
    
    // Avoid duplicates by title or slug
    const exists = targetList.find(i => i.title === name || i.slug === slug);
    if (!exists) {
      targetList.push(item);
    } else {
      // If it exists in static data, mark it as local so the viewer uses the local file
      exists.isLocal = true;
      exists.url = `/resources/viewer/${slug}`;
      exists.slug = slug;
    }
  });

  console.log('Final Resource Categories:', Object.keys(data));
  return data;
}

/**
 * Gets all PDF files (flat list from both local and static data)
 */
export async function getAllPdfs() {
  const allResources = [];
  
  // 1. Add static data
  Object.keys(PYQ_DATA).forEach(cat => {
    ['yearwise', 'topicwise'].forEach(type => {
      PYQ_DATA[cat][type].forEach(item => {
        const slug = item.slug || generateSlug(item.title);
        allResources.push({
          name: item.title,
          slug: slug,
          url: item.url,
          isLocal: false
        });
      });
    });
  });

  // 2. Add local files (and override if local exists)
  if (fs.existsSync(PDF_DIRECTORY)) {
    const files = fs.readdirSync(PDF_DIRECTORY).filter(file => file.endsWith('.pdf'));
    files.forEach(file => {
      const name = file.replace(/\.[^/.]+$/, "");
      const slug = generateSlug(file);
      
      const existing = allResources.find(r => r.slug === slug || r.name === name);
      if (existing) {
        existing.isLocal = true;
        existing.fileName = file;
        existing.url = `/api/pdf/${slug}`; // Internal API for local files
      } else {
        allResources.push({
          name: name,
          slug: slug,
          fileName: file,
          isLocal: true,
          url: `/api/pdf/${slug}`
        });
      }
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
