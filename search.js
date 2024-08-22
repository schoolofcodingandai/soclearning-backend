// // Meilisearch
// const { MeiliSearch } = require("meilisearch");

// /**
//  * @description Connects to the search server
//  */
// const client = new MeiliSearch({
//     host: process.env.MEILI_HOST,
//     apiKey: process.env.MEILI_API_KEY
// });
// console.log("Connected to search server");

// /**
//  * @description Add document to index
//  * @param {String} indexName
//  * @param {Object} document
//  * @returns {Boolean}
//  */
// const addDocumentToIndex = (indexName, document) => {
//     const index = client.index(indexName, {
//         primaryKey: "_id",
//         sortableAttributes: ["created_at"],
//         rankingRules: ['sort', 'words', 'typo', 'proximity', 'attribute', 'exactness']
//     });

//     index.addDocuments(document)
//         .then(res => {
//             return true;
//         })
//         .catch(error => {
//             throw new Error(`error adding document to search index: ${error}`);
//         })
// }

// /**
//  * @description Update document in search index
//  * @param {String} indexName
//  * @param {Object} document
//  * @returns {Boolean}
//  */
// const updateDocumentInIndex = (indexName, document) => {
//     const index = client.index(indexName);

//     index.updateDocuments([
//         document
//     ])
//         .then(res => {
//             return true;
//         })
//         .catch(error => {
//             throw new Error(`error updating documents in search index: ${error}`);
//         })
// }

// /**
//  * @description Search from meilisearch
//  * @param {String} indexName
//  * @param {String} keyword
//  * @param {String} parameters
//  * @returns {Boolean}
//  */
// const searchDocuments = async (indexName, keyword, parameters) => {
//     const index = client.index(indexName);
//     const result = await index.search(keyword, parameters);
//     return result;
// }

// /**
//  * @description Delete document from index
//  * @param {String} indexName
//  * @param {String} _id
//  * @returns
//  */
// const deleteDocumentFromIndex = async (indexName, _id) => {
//     const index = client.index(indexName);

//     const result = await index.deleteDocument(_id);

//     return true;
// }

// /**
//  * @description Delete an entire search index
//  * @param {String} indexName
//  * @returns
//  */
// const deleteSearchIndex = async (indexName) => {
//     const index = client.index(indexName);

//     const result = await index.delete();

//     return true;
// }

// module.exports = {
//     addDocumentToIndex,
//     updateDocumentInIndex,
//     searchDocuments,
//     deleteDocumentFromIndex,
//     deleteSearchIndex
// };