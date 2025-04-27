(async () => {
    const langchain = await import('langchain');
    })();

import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { readFile } from 'fs/promises';
import { createClient } from '@supabase/supabase-js';
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { PromptTemplate } from '@langchain/core/prompts';

import dotenv from 'dotenv';

dotenv.config();

(async () => {
    try {
        // Read the input text file
        const text = await readFile('my-info.txt', 'utf-8');

        // Split the text into chunks
        const textSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 80,
            chunkOverlap: 20,
            separators: ['\n\n', '\n', ' ', ''],
        });

        const output = await textSplitter.createDocuments([text]);

        output.forEach((doc, index) => {
            doc.metadata = { ...doc.metadata, id: `doc-${index}` }; // Assign a unique ID
        });

        // Retrieve environment variables
        const sbApiKey = process.env.SB_API_KEY;
        const sbApiUrl = process.env.SB_API_URL;
        const openAIApiKey = process.env.OPENAI_API_KEY;

        if (!sbApiKey || !sbApiUrl || !openAIApiKey) {
            throw new Error("Missing required environment variables: SB_API_KEY, SB_API_URL, or OPENAI_API_KEY");
        }

        // Initialize Supabase client
        const client = createClient(sbApiUrl, sbApiKey);
        // Create llm
        const llm = new GoogleGenerativeAIEmbeddings({ apiKey: openAIApiKey });

        // Use Google Generative AI embeddings
        const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey: openAIApiKey });

        // Store documents in Supabase Vector Store
        await SupabaseVectorStore.fromDocuments(
            output,
            embeddings,
            {
                client,
                tableName: 'documents', // Ensure this table exists in your Supabase database
                queryName: 'match_documents', // Ensure this query is defined in Supabase
                textKey: 'text', // Column for storing text
                metadataKeys: ['id','source'], // Metadata columns
            }
        );

        const standAloneQuestionTemplate = `You are a helpful assistant. Answer the question based on the provided context. If the answer is not in the text, say "I don't know".\n\nContext:\n{context}\n\nQuestion:\n{question}`;
        const standAloneQuestionPrompt = PromptTemplate.fromTemplate(standAloneQuestionTemplate);

        const standAloneQuestionChain = standAloneQuestionPrompt.pipe(llm);
        const response = await standAloneQuestionChain.invoke({
            question: "Who are you and what do you do?",
        })


        console.log("Documents successfully stored in Supabase Vector Store!");
    } catch (error) {
        console.error('Error fetching the file or processing text:', error);
    }
})();