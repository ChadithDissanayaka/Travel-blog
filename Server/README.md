# REST Countries Middleware Service

This is a secure API middleware service built with Node.js, Express, and SQLite3. It integrates with the [REST Countries API](https://restcountries.com) to provide streamlined country information.

## Features

- **User Registration & Login:** Implement password encryption using bcrypt for secure authentication.
- **API Key Management:** Provide functionality to generate, list, and revoke API keys.
- **Country Data:** Fetch and display data such as country name, currency, capital, languages, and flag from a third-party API like REST Countries.
- **Security:** Use middleware to authenticate requests with API keys.
- **Containerized:** A Dockerfile for easy deployment in a containerized environment.
- **Health Check:** An endpoint to check the health and status of the API.

## Getting Started

### Prerequisites

- Node.js and npm
- Docker (optional)

### Installation

1. Clone the repository.
2. Install dependencies:
   npm install
3. streamlint install (optional to test api using documnetation) 
pip install streamlit

4. run streamlint - streamlit run app.py (optional)

5. bulid docker image (optional) - docker build -t rest-countries-middleware . 

6. run docker container port 3000 (optional) - docker run -p 3000:3000 rest-countries-middleware 

7. run server in locally use - npm strart
