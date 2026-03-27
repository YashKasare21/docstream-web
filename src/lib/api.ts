export interface ConvertResult {
  job_id: string;
  tex_url: string;
  pdf_url: string;
  processing_time: number;
}

export async function convertPDF(
  file: File,
  template: string
): Promise<ConvertResult> {
  // Mock implementation — replace with real API later
  void file;
  void template;
  await new Promise((resolve) => setTimeout(resolve, 13000));

  // Simulate occasional errors for testing
  if (Math.random() < 0.1) {
    throw new Error("AI structuring failed. Please try again.");
  }

  const jobId = "mock-job-" + Date.now();

  return {
    job_id: jobId,
    tex_url: "/mock/document.tex",
    pdf_url: "/mock/document.pdf",
    processing_time: 13.2,
  };
}
