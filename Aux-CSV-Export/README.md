## XPNSR Auxiliary CSV/Excel Export Service

This auxiliary service for the XPNSR application is designed to handle the generation and export of financial data (bills, transactions, and budgets) into CSV and Excel formats. This service ensures that heavy processing tasks do not interfere with the performance of the main application server.

## Features

- **Data Export**: Allows the export of bills, transactions, and budgets into CSV and Excel formats.
- **Performance Efficiency**: Runs as a separate service to minimize load on the main API server.
- **Ease of Use**: Integrated directly with the client for triggering data export operations via HTTP requests.

## Technology Stack

- **Node.js**: For server-side logic.
- **Express**: Simplifies routing for HTTP requests.
- **MySQL2**: Handles database operations.
- **json2csv**: Converts JSON data to CSV format.
- **excel4node**: Generates Excel files.
- **fs (File System)**: Manages file operations.

## Prerequisites

Before you can run this service, you need the following installed:
- Node.js
- npm (Node Package Manager)

Ensure you have access to a MySQL database with the appropriate schema set up for the XPNSR application.

## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/brhn-me/xpnsr.git
   cd Aux-CSV-Export` 

2.  **Install Dependencies:**
    
    `npm install` 
    
3.  **Set Environment Variables:** 
        
        Create a `.env` file in the root directory and update the following settings
    
         DB_HOST=localhost
         DB_USER=root
         DB_PASS=123456
         DB_NAME=xpnsr
         PORT=5000

## Running the Service

To start the service, run:

`npm start` 

This command will start the server on `localhost` at the port specified in your `.env` file (default 5000).

## Usage

The service provides endpoints to generate reports for bills, budgets, and transactions:

-   **Generate Bills Report:**
   
    
    `GET /generate/report/bills` 
    
-   **Generate Budgets Report:**
    
    
    `GET /generate/report/budgets` 
    
-   **Generate Transactions Report:**
        
    `GET /generate/report/transactions` 
    

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.
