const normalize = (p) => p.replace(/\\/g, "/");

export const filterTestFiles = (testFiles, filePatterns) => {
  if (filePatterns.length === 0) return testFiles;

  const normalizedPatterns = filePatterns.map(normalize);
  return testFiles.filter((file) => {
    const normalizedFile = normalize(file);
    return normalizedPatterns.some((pattern) => normalizedFile.includes(pattern));
  });
};
