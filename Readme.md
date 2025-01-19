# News Aggregator App

## Problem Statement

The goal of this project was to build a **News Aggregator** application that collects news articles from Hacker News, organizes them, and provides them in a structured format to the user. Initially, one approach we considered was using an **RSS feed** from the Y Combinator (YC) website to collect articles. However, since this was a project assignment, I decided to implement a more custom approach where I **scraped the YC website** to gather news articles dynamically.

This project demonstrates my ability to:

- Scrape data from [Hacker News](https://news.ycombinator.com/)
- Organize and store data in a MySQL database
- Implement WebSocket for real-time updates
- Collect and expose metrics for monitoring
- Implement comprehensive logging
- Containerize the application using Docker for production

## Approach

Initially, my approach was to use the **RSS feed** provided by Y Combinator to gather articles about startups and technology. This would have been a quick solution to get data. However, as part of the assignment, I decided to build a more involved solution that would involve **scraping** the news articles directly from the Y Combinator website and processing the data.

### Web Scraping

To scrape news articles from the Y Combinator website, I used the **Playwright** library with Node.js. Playwright allows for automated browsing and scraping of web pages, making it suitable for scraping news from dynamic websites.

The scraper fetches the latest posts from HackerNews' homepage, extracts information from the published stories such as article titles, URLs, and publication dates, segregates them by finding the new stories on the page by comparing the previously available stories and stores them in a **MySQL database**. It also broadcast the data to all the connected clients to the websocket.

### Database Design

For the database, I used **MySQL** to store news articles. The database contains a table that holds information such as:

- Article Id
- Article Title
- Publish Date
- URL
- Created At
- Updated At

I used **Prisma** as an ORM to interact with the database and manage migrations, ensuring that the database schema is consistent with the model.

### Index Page

As this was a backend task, I have created an html and have passed it as a response when user tries to get the index of the application. The html page will autoconnect to the websocket and will show the count of stories published in past 5 minutes. The message will fade away after 10 seconds. When new story is broadcasted by the server through the websockets, the new story will be shown by frontend at the top with the hyperlink to the url.

## Metrics

To track the performance and health of the application, we use **Prometheus** and **Grafana** for monitoring. The application exposes several important metrics that can be scraped by Prometheus and visualized using Grafana.

### Metrics Collected:

1. **Successful Scrapes (`successful_scrapes_total`)**: The total number of successful scraping attempts made by the application.
2. **Failed Scrapes (`failed_scrapes_total`)**: The total number of failed scraping attempts.
3. **News Processed (`news_processed_total`)**: The number of news stories processed by the application.
4. **WebSocket Active Connections (`connected_clients_total`)**: The number of active WebSocket connections.
5. **WebSocket Messages Sent (`websocket_messages_sent_total`)**: The total number of messages sent over WebSocket connections.
6. **Database Queries (`db_queries_total`)**: The total number of database queries executed.
7. **Database Connection Errors (`db_connection_errors_total`)**: The total number of database connection errors encountered by the application.

These metrics are exposed on the `/metrics` endpoint and can be scraped by **Prometheus**.

### Exposing Metrics:

The app exposes the metrics via the `/metrics` endpoint. Prometheus can scrape this endpoint periodically to collect performance data.

To visualize these metrics, you can go to **Grafana**, where you can create dashboards for real-time monitoring of the app's performance.

![Grafana Image](./screenshots/Screenshot4.png)

### Example Metrics URL:

Once the application is running, metrics can be accessed at:

```bash
/metrics endpoint
```

## Logging

The application uses **Winston** as a logging library to provide comprehensive logging functionality, including different log levels, log file storage, and console logging. This is essential for debugging and monitoring the application in both development and production environments.

### Log Levels

Winston supports the following log levels:

- **error**: Used for critical errors that require immediate attention.
- **warn**: Used for warnings, indicating potential issues that may not immediately affect the application.
- **info**: Used for general information about the app’s operations, such as startup or configuration details.
- **http**: Used for HTTP-specific logs, typically when a request is made to the server.
- **debug**: Used for detailed debugging information, useful for troubleshooting and development.

### Log Output

1. **Console Logs**: In non-production environments, logs are printed to the console with color coding to highlight different log levels.
   - The logs include a timestamp, log level, and message for better readability.

2. **File Logs**: Logs are saved to files in the `logs/` directory:
   - `logs/error.log`: Stores error-level logs in JSON format.
   - `logs/combined.log`: Stores all logs (except debug) in JSON format.

### Log File Rotation

Winston can be easily configured to support log file rotation if needed, preventing log files from growing indefinitely. You can use the `winston-daily-rotate-file` transport to rotate logs based on daily or size-based limits.

### Example Log Entries:

A typical log entry looks like this:

```text
2025-01-19 10:00:00 [INFO]: Application started
2025-01-19 10:05:00 [ERROR]: Unable to connect to the database
```

### Customizing Log Levels

You can customize the log level by modifying the NODE_ENV environment variable. In production, the log level defaults to info, while in development, it defaults to debug to provide more detailed logging.
Using the Logger

To log messages within the application, use the following methods available on the logger object:

    logger.error(message): Logs an error message.
    logger.warn(message): Logs a warning message.
    logger.info(message): Logs an informational message.
    logger.http(message): Logs HTTP request-related messages.
    logger.debug(message): Logs debugging information.

## Technologies Used

- **Node.js** for the back-end
- **Playwright** for web scraping
- **Prisma** as the ORM for interacting with MySQL
- **MySQL** for database management
- **HTML & CSS** for the front-end
- **Docker** for containerizing the application
- **Prometheus** for collecting app metrics
- **Grafana** for visualizing and monitoring metrics
- **Docker Compose** for running MySQL and the app in separate containers

## How to Run

There are multiple ways to run this application: using Docker Compose, running the app with Docker directly, or running just the app by passing the `DATABASE_URL` manually. Below are the instructions for each method.

### Shell Script: `run.sh`

The `run.sh` script is designed to automate the setup and initialization of the News Aggregator App. It performs the following tasks:

1. **Environment Setup**: Configures necessary environment variables and checks for required dependencies.
2. **Temporary Loading Server**: Starts a temporary server that displays a "Loading" page to inform users that the services are being initialized. This server runs on port 8080 and serves a simple HTML page indicating that the application is loading.
3. **Cleanup**: Stops the temporary loading server once the main application is ready to serve requests.

The script ensures a smooth and user-friendly startup experience by providing visual feedback during the initialization process.

### Option 1: Using Docker Compose (Recommended)

1. Clone the repository:

    ```bash
    git clone https://github.com/Saurav-Navdhare/TakeHomeAssignment_FrontPage.git
    cd TakeHomeAssignment_FrontPage
    ```

2. Configure the `mysql.env` file to include the MySQL environment variables:

    ```env
    MYSQL_ROOT_PASSWORD=rootpassword
    MYSQL_DATABASE=root
    MYSQL_USER=myapp
    MYSQL_PASSWORD=rootpassword
    MYSQL_HOST=mysql
    MYSQL_PORT=3306
    DATABASE_URL=mysql://root:rootpassword@mysql:3306/appdb
    ```

3. Build and run the app and database containers:

    ```bash
    docker-compose up --build
    ```

4. Once the containers are up and running, access the application in your browser at:

    ```bash
    http://localhost:8080
    ```

5. Metrics will be available at:

    ```bash
    http://localhost:8080/metrics
    ```
6. Grafana will be available at:
    ```bash
    http://localhost:3000
    ```
    Grafana default login username and password will be admin:admin respectively.

### Option 2: Running the App Using Docker Directly

If you prefer to run the app and database without using Docker Compose, follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/Saurav-Navdhare/TakeHomeAssignment_FrontPage.git
    cd TakeHomeAssignment_FrontPage
    ```

4. Build the **App** container:

    ```bash
    docker build -t app-image .
    ```

5. Run the app container, passing the `DATABASE_URL` environment variable:

    ```bash
    docker run --name my-app -p 8080:8080 -e DATABASE_URL=<MYSQL Database URL>
    ```

6. Access the application in your browser at:

    ```bash
    http://localhost:8080
    ```

7. Metrics will be available at:

    ```bash
    http://localhost:8080/metrics
    ```

### Option 3: Running the App by Passing the `DATABASE_URL`

If you want to run the app locally and pass the database URL directly, you can follow these steps:

1. Clone the repository:

    ```bash
    git clone https://github.com/Saurav-Navdhare/TakeHomeAssignment_FrontPage.git
    cd TakeHomeAssignment_FrontPage
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

3. Set up the MySQL database (either locally or using Docker, as explained above).

4. Set `.env` for the app:

    ```bash
    DATABASE_URL=<MYSQL Database URL>
    ```
5. Install playwright dependencies by running:
    ```bash
    npx playwright install
    npx playwright install-deps
    ```
6. Setup prisma by executing this
    ```bash
    npx prisma generate
    ```
7.  Run the app:
    ```bash
    npm run start
    ```

8. Metrics will be available at:

    ```bash
    http://localhost:8080/metrics
    ```

## Screenshots

Below are some screenshots showing the app in action:

- Wait page, it will be displayed as services are being up
    ![App wait screenshot](./screenshots/wait.png)

- On connection
    ![App Screenshot 1](./screenshots/Screenshot1.png)

- Receiving news
    ![App Screenshot 2](./screenshots/Screenshot2.png)

- Metrics
    ![App Screenshot 3](./screenshots/Screenshot3.png)

- Grafana
    ![App Screenshot 4](./screenshots/Screenshot4.png)

- MySQL data
    ![MySQL data](./screenshots/MySQL.png)