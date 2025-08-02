export interface YakPDFRequest {
  source: {
    html: string;
  };
  pdf: {
    format: 'A4' | 'Letter' | 'Legal';
    scale: number;
    printBackground: boolean;
    margin?: {
      top?: string;
      right?: string;
      bottom?: string;
      left?: string;
    };
  };
  wait: {
    for: 'navigation' | 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
    waitUntil?: 'load' | 'domcontentloaded' | 'networkidle0' | 'networkidle2';
    timeout: number;
  };
}

export interface YakPDFResponse {
  success: boolean;
  data?: ArrayBuffer;
  error?: string;
}

export interface GenerateResumeRequest {
  html: string;
  filename: string;
}

export interface GenerateResumeResponse {
  success: boolean;
  error?: string;
}