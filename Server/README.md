# REST TRAVEL-BLOG Service

This is a secure Apilication built with Node.js, Express, and SQLite3. It integrates with the [REST Countries API](https://restcountries.com) to provide streamlined country information.

## Features
- **User Registration & Login:** Implement password encryption using bcrypt for secure authentication.
- **API Key Management:** Provide functionality to generate, list, and revoke API keys.
- **Country Data:** Fetch and display data such as country name, currency, capital, languages, and flag from a third-party API like REST Countries.
- **Security:** Use middleware to authenticate requests with API keys(contry routes) and CSRF protection for sensitive endpoints.
- **Containerized:** A Dockerfile for easy deployment in a containerized environment.
- **Health Check:** An endpoint to check the health and status of the API.

- **Blog Post Management:**
  - Registered users can create, edit, and delete their own blog posts about the countries they have visited.
  - Each blog post must include:
    - Title
    - Content
    - Country name
    - Date of visit
    - image
  - Blog posts are stored in a SQLite database and are publicly viewable by all users, including unregistered visitors.

- **Blog Search and Filtering:**
  - Users can search for blog posts by:
    - Country name
    - Blog poster’s username
  - Search results are displayed in a paginated list, including relevant metadata such as:
    - Title
    - Author
    - Content
    - Country
    - Date of visit
    - image
  - Users can sort blog posts by:
    - Newest
    - Most liked
    - Most commented    

- **User Following System:**
  - Registered users can follow and unfollow other users.
  - A user's profile page displays a list of their followers and the users they are following.
  - Users can view blog posts from the users they follow in a separate feed.

- **Comment and Interaction System:**
  - Users can like or dislike blog posts.
  - The total number of likes and dislikes is displayed on each blog post.
  

## Getting Started

### Prerequisites

- Node.js and npm
- Docker (optional)

### Installation

1. Clone the repository.
2. Install dependencies:
   npm install

3. Create an `.env` file in the root directory and add the following:
   plaintext
   JWT_SECRET=your_jwt_secret
   CSRF_SECRET=your_csrf_secret
   DATABASE_PATH=path_to_your_database

4. bulid docker image (optional) - docker build -t travel-blog . 

5. run docker container port 3000 (optional) - docker run -p 3000:3000 travel-blog 

6. run server in locally use - npm strart
