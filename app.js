const { MongoClient } = require('mongodb');
const fs = require('fs');
const readline = require('readline');


const uri = 'mongodb+srv://fmboya:cs20@mongo.kyn7lg2.mongodb.net/?appName=mongo';

const dbName = 'Stock';
const collectionName = 'PublicCompanies';

// CSV file name
const csvFile = 'companies.csv';

async function main() {
    const client = new MongoClient(uri);
    
    try {
        // Connect to MongoDB
        await client.connect();
        console.log('Connected to MongoDB Atlas');
        
        const db = client.db(dbName);
        const collection = db.collection(collectionName);
        
        // Create readline interface to read file line by line
        const fileStream = fs.createReadStream(csvFile);
        const rl = readline.createInterface({
            input: fileStream,
            crlfDelay: Infinity
        });
        
        let isFirstLine = true;
        let count = 0;
        
        // Read file line by line
        for await (const line of rl) {
            // Skip header line
            if (isFirstLine) {
                console.log('Header: ' + line);
                isFirstLine = false;
                continue;
            }
            
            // Skip empty lines
            if (line.trim() === '') {
                continue;
            }
            
            // Parse the CSV line
            const parts = line.split(',');
            
            if (parts.length >= 3) {
                const company = parts[0].trim();
                const ticker = parts[1].trim();
                const price = parseFloat(parts[2].trim());
                
                // Create document
                const document = {
                    company: company,
                    ticker: ticker,
                    price: price
                };
                
                // Display in console
                console.log(`${company}, ${ticker}, ${price}`);
                
                // Insert into database
                await collection.insertOne(document);
                count++;
            }
        }
        
        console.log(`\nSuccessfully inserted ${count} documents into the database`);
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        console.log('Connection closed');
    }
}

main();