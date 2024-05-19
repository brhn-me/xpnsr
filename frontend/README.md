# XPNSR Client Application

This React client application is designed to manage financial entities such as budgets, transactions, bills, categories, and users, utilizing the XPNSR API.

## Dependencies

This project is built using React and utilizes several key libraries:

- React (v17.x or later)
- React Router Dom (v6.x for navigation)
- Bootstrap (v5.x for styling)

## Setup and Installation

To get this project up and running on your local machine, follow these steps:

### Prerequisites

- Node.js (v14.x or later recommended)
- npm (v6.x or later)

### Cloning the Repository

First, clone the repository to your local machine:

```bash
git clone https://yourrepositoryurl.com
cd your-project-directory
```

### Installing Dependencies

Install the required npm packages by running:

```bash
npm install
```

### API Key Configuration

For the application to function correctly, you must configure the XPNSR API key. Replace the `XPNSR-API-KEY` in your fetch requests with an environment variable:

1. Create a `.env` file in the root of your project.
2. Add `REACT_APP_XPNSR_API_KEY=your_actual_api_key_here` to the `.env` file.
3. Modify the fetch headers in your API calls:

```javascript
headers: {
    'accept': 'application/json',
    'XPNSR-API-KEY': process.env.REACT_APP_XPNSR_API_KEY
}
```

**Note:** Never commit your `.env` files or any sensitive keys to your repository.

## Running the Application

To start the application, run:

```bash
npm start
```

This command will start the development server and open the application in your default web browser. The application should now be running on [http://localhost:3000](http://localhost:3000).

## Building for Production

To build the application for production, run:

```bash
npm run build
```

This command will create a `build` directory with a production build of your app.

## Running Tests

If you have tests set up, you can run them by executing:

```bash
npm test
```
