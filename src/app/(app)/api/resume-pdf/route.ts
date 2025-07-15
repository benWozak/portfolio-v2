import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import latex from 'node-latex';
import { Readable } from 'stream';
import { 
  escapeLatex, 
  formatPhoneNumber, 
  escapeUrl, 
  formatDate 
} from '@/utils/functions/format';

function generateSkillsContent(skills: any[]): string {
  return skills.map((skill, index) => {
    const title = escapeLatex(skill.skill_title);
    const items = escapeLatex(skill.skill_items);
    
    // Adds less vertical space after each item, except the last one
    const verticalSpace = index < skills.length - 1 ? '\\\\[0.2em]' : '\\\\';
    
    return `${title} & ${items} ${verticalSpace}`;
  }).join('\n    ');
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const name = searchParams.get('name');
  console.log('GET request received with name:', name);
  
  // Fetch resume data
  let resumeData;
  try {
    // Attempt to load the data file
    const dataPath = path.join(process.cwd(), 'public', 'resume.json');
    const rawData = await fs.readFile(dataPath, 'utf-8');
    resumeData = JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading resume data:', error);
    return NextResponse.json({ success: false, error: 'Failed to load resume data' }, { status: 500 });
  }
  
  return await generateLatexPDF(resumeData);
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    return await generateLatexPDF(data);
  } catch (error) {
    console.error('Error parsing request JSON:', error);
    return NextResponse.json({ success: false, error: 'Invalid JSON in request body' }, { status: 400 });
  }
}

async function generateLatexPDF(data: any) {
  try {
    const templateName = "resume_v1";
    
    const templatePath = path.join(process.cwd(), 'latex', 'templates', templateName, `${templateName}.tex`);

    try {
      await fs.access(templatePath);
    } catch (error) {
      console.error('Template file not found:', templatePath, error);
      return NextResponse.json({ success: false, error: 'Template not found' }, { status: 404 });
    }

    let template = await fs.readFile(templatePath, 'utf-8');

    // Replace placeholders with data
    template = template.replace(/FULL_NAME/g, escapeLatex(data.full_name));
    template = template.replace(/PHONE/g, escapeLatex(formatPhoneNumber(data.phone)));
    template = template.replace(/EMAIL/g, escapeLatex(data.email));
    template = template.replace(/SUMMARY/g, escapeLatex(data.summary));

    template = template.replace(/LINKEDIN/g, escapeUrl(data.socials.linkedin_url));
    template = template.replace(/GITHUB/g, escapeUrl(data.socials.github_url));
    template = template.replace(/PORTFOLIO/g, escapeUrl(data.socials.portfolio_url));

    template = template.replace(/ED_INSTITUTION/g, escapeLatex(data.education.institution));
    template = template.replace(/ED_LOCATION/g, escapeLatex(data.education.location));
    template = template.replace(/ED_DATE/g, escapeLatex(`${formatDate(data.education.duration.startDate)} - ${formatDate(data.education.duration.endDate)}`));
    template = template.replace(/ED_DEGREE/g, escapeLatex(data.education.degree));

    // Handle experience entries
    data.experience.forEach((exp: any, index: number) => {
      const companyPlaceholder = `COMPANY_${index + 1}`;
      const datePlaceholder = `DATE_${index + 1}`;
      const titlePlaceholder = `TITLE_${index + 1}`;

      template = template.replace(new RegExp(companyPlaceholder, 'g'), escapeLatex(exp.company));
      template = template.replace(new RegExp(datePlaceholder, 'g'), 
        `${formatDate(exp.duration.startDate)} - ${formatDate(exp.duration.endDate)}`
      );
      template = template.replace(new RegExp(titlePlaceholder, 'g'), escapeLatex(exp.position));

      // Replace bullet points
      exp.description.forEach((bullet: string, bulletIndex: number) => {
        const bulletPlaceholder = `COMP_${index + 1}_BULLET_${bulletIndex + 1}`;
        template = template.replace(new RegExp(bulletPlaceholder, 'g'), escapeLatex(bullet));
      });
    });

    const skillsContent = generateSkillsContent(data.skills);
    template = template.replace(/SKILLS/g, skillsContent);

    // Generate PDF from LaTeX
    const input = Readable.from(template);
    const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      const pdf = latex(input, {
        inputs: path.join(process.cwd(), 'latex', 'templates', templateName),
      });
      pdf.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdf.on('end', () => resolve(Buffer.concat(chunks)));
      pdf.on('error', (err) => {
        console.error('LaTeX compilation error:', err);
        reject(new Error('LaTeX compilation failed'));
      });
    });

    // Save PDF file
    const timestamp = Date.now();
    const fileName = `resume_${timestamp}.pdf`;
    const pdfPath = path.join(process.cwd(), 'public', fileName);
    await fs.writeFile(pdfPath, pdfBuffer);

    return NextResponse.json({ 
      success: true, 
      pdfPath: `/${fileName}` // Return the public URL
    });
  } catch (error) {
    console.error('Error generating LaTeX PDF:', error);
    return NextResponse.json({ 
      success: false, 
      error: (error as Error).message 
    }, { status: 500 });
  }
}