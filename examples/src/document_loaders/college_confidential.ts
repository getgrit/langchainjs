import { CollegeConfidentialLoader } from "langchain/document_loaders/web/college_confidential";

export const college_confidential = const run = async () => {
  const loader = new CollegeConfidentialLoader(
    "https://www.collegeconfidential.com/colleges/brown-university/"
  );
  const docs = await loader.load();
  console.log({ docs });
};
