# Context_Aware_Chatbot_With_LangChain_JS

## Overview
This project is a context-aware chatbot built using LangChain JS, a framework that helps developers create reasoning applications by abstracting common functionalities. The chatbot leverages embeddings, vector stores, and chains to process and respond to user queries effectively.

## Features
1. **Embeddings**  
   - Embeddings are mathematical representations of text that AI understands. They are used to plot relationships between words in vector space.
   - This project uses embeddings to encode text and store them in a vector database (Supabase).

2. **Vector Store Integration**  
   - Supabase is used as the vector store to store and retrieve embeddings efficiently.
   - The project includes functionality to store documents and perform similarity searches using embeddings.

3. **Templates and Prompts**  
   - Templates are used to create dynamic prompts for the chatbot.
   - Prompts are designed to guide the chatbot in generating context-aware responses.

4. **Chains**  
   - Chains are used to combine multiple steps in the reasoning process.
   - The project uses `RunnableSequence` to create a pipeline of operations, such as generating standalone questions, retrieving relevant documents, and generating answers.

5. **.pipe() Method**  
   - The `.pipe()` method is used to connect different components, such as prompts, LLMs, and output parsers, into a seamless workflow.

6. **Retrieval from Vector Store**  
   - The chatbot retrieves relevant documents from the vector store based on user queries.
   - The retrieved documents are used as context for generating accurate responses.

7. **LLM Integration**  
   - The project integrates a language model (LLM) to process prompts and generate responses.
   - The LLM is configured with a specific model and API key.

## Project Workflow
1. **Text Preprocessing**  
   - Input text is split into smaller chunks using a text splitter.
   - Each chunk is embedded and stored in the vector store.

2. **Document Storage**  
   - Documents are stored in the Supabase vector store with metadata for efficient retrieval.

3. **Query Processing**  
   - User queries are converted into standalone questions using a prompt template.
   - Relevant documents are retrieved from the vector store based on the query.

4. **Response Generation**  
   - The chatbot generates responses using the retrieved context and a predefined answer template.
   - The response is processed and returned to the user.

## How to Run the Project
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd Context_Aware_Chatbot_With_LangChain_JS

## How to Run the Project (Continued)

2. **Install Dependencies**  
   Install all the required dependencies for the project using the following command:
   ```bash
   npm install

3. **Set Up Environment Variables**  
   Create a `.env` file in the root directory of the project and add the following environment variables:
   ```env
   SB_API_KEY=<your-supabase-api-key>
   SB_API_URL=<your-supabase-url>
   OPENAI_API_KEY=<your-openai-api-key>

   ** Replace <your-supabase-api-key>, <your-supabase-url>, and <your-openai-api-key> with your actual API keys and URLs.

4. **Ensure Supabase Database Setup**  
   - Verify that the `documents` table exists in your Supabase database with the following schema:
     ```sql
     create table if not exists documents (
         id uuid primary key default gen_random_uuid(),
         text text,
         embedding vector(1536) -- Adjust the dimension to match your embeddings
     );
     ```
   - Create the `match_documents` function in your Supabase database to enable similarity searches:
     ```sql
     create or replace function public.match_documents(
         query_embedding vector(768), -- Adjust the dimension to match your embeddings
         similarity_threshold float, 
         match_count int
     )
     returns table(
         id uuid,
         text text,
         similarity float
     )
     language plpgsql
     as $$
     begin
         return query
         select
             id,
             text,
             1 - (documents.embedding <=> query_embedding) as similarity
         from
             documents
         where
             1 - (documents.embedding <=> query_embedding) > similarity_threshold
         order by
             similarity desc
         limit match_count;
     end;
     $$;
     ```
   - Ensure that the `documents` table and `match_documents` function are correctly set up in your Supabase database to enable the chatbot to perform similarity searches.