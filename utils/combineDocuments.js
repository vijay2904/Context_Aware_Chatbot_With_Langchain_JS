export function combineDocuments(documents) {
    return documents.map((doc) => doc.pageContent).join('\n\n');
}
