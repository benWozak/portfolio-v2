import { ResumeData } from '@/types/resume';
import { getPayload } from 'payload';
import configPromise from '../payload.config';
import { draftMode } from 'next/headers';
import { unstable_cache } from 'next/cache';

// Transform Payload resume data to match existing ResumeData interface
function transformPayloadResume(payloadResume: any): ResumeData {
  return {
    full_name: payloadResume.full_name,
    phone: payloadResume.phone,
    email: payloadResume.email,
    summary: payloadResume.summary,
    socials: payloadResume.socials,
    experience: payloadResume.experience?.map((exp: any) => ({
      company: exp.company,
      position: exp.position,
      duration: exp.duration,
      description: exp.description?.map((item: any) => item.item) || [],
    })) || [],
    skills: payloadResume.skills || [],
    education: payloadResume.education,
  };
}

// Cached function to fetch resume from Payload
const getCachedResumeFromPayload = unstable_cache(
  async () => {
    try {
      const payload = await getPayload({ config: configPromise });
      
      const result = await payload.find({
        collection: 'resume' as any,
        where: {
          isActive: {
            equals: true,
          },
        },
        draft: false, // Production data only for cached version
        limit: 1,
      });
      
      if (result.docs.length > 0) {
        return transformPayloadResume(result.docs[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Payload resume fetch error:', error);
      return null;
    }
  },
  ['resume-active'],
  {
    tags: ['resume-data'],
    revalidate: 604800, // 1 week in seconds
  }
);

export async function getActiveResume(isDraftMode?: boolean): Promise<ResumeData | null> {
  const { isEnabled } = await draftMode();
  const shouldUseDraft = isDraftMode ?? isEnabled;
  
  // If in draft mode, bypass cache and fetch directly
  if (shouldUseDraft) {
    try {
      const payload = await getPayload({ config: configPromise });
      
      const result = await payload.find({
        collection: 'resume' as any,
        where: {
          isActive: {
            equals: true,
          },
        },
        draft: shouldUseDraft,
        limit: 1,
      });
      
      if (result.docs.length > 0) {
        return transformPayloadResume(result.docs[0]);
      }
    } catch (error) {
      console.error('Payload resume fetch error:', error);
    }
  } else {
    // Use cached version for production
    const cachedResume = await getCachedResumeFromPayload();
    if (cachedResume) {
      return cachedResume;
    }
  }
  
  // No fallback data available
  return null;
}

export async function getResumeById(id: string, isDraftMode?: boolean): Promise<ResumeData | null> {
  try {
    const payload = await getPayload({ config: configPromise });
    
    const { isEnabled } = await draftMode();
    const shouldUseDraft = isDraftMode ?? isEnabled;
    
    const doc = await payload.findByID({
      collection: 'resume' as any,
      id,
      draft: shouldUseDraft,
    });
    
    if (doc) {
      return transformPayloadResume(doc);
    }
  } catch (error) {
    console.error('Payload resume fetch error:', error);
  }
  
  // Fallback to active resume
  return getActiveResume(isDraftMode);
}