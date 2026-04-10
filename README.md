# Smart File Organizer 

A powerful, automated file management system built with the MERN stack (MongoDB, Express, React/Vanilla JS, Node.js). It automatically organizes your files based on custom rules, providing a clean and efficient digital workspace.

##  Features

-   **Smart Sorting**: Automatically categorizes files into folders (e.g., Images, Documents, Music) based on file extensions.
-   **Custom Rules**: Create your own sorting rules! Define which file types go where.
-   **File Preview**: Preview images, videos, audio, PDFs, and text files directly in the browser before downloading.
-   **Audit Trail**: detailed logs of all file movements and actions for complete transparency.
-   **Manual Upload**: Upload files directly through the dashboard for instant organization.
-   **Dashboard**: A clean, responsive interface to manage your files, view logs, and configure rules.

##  Tech Stack

-   **Frontend**: HTML5, CSS3 (Custom Design), JavaScript (ES6+)
-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB (Atlas)
-   **File Handling**: Multer for uploads, fs/path for file system operations

##  Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/SHIVIKA330/Smart-file-organiser.git
    cd Smart-file-organiser
    ```

2.  **Install Dependencies**
    Navigate to the backend folder and install the necessary packages:
    ```bash
    cd backend
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the `backend` directory and add your MongoDB connection string and port:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_string
    ```

4.  **Run the Application**
    Start the backend server:
    ```bash
    npm start
    ```
    The server will start on `http://localhost:5000`. Open `frontend/index.html` in your browser to start using the app.

##  Usage

1.  **Dashboard**: Upload files or run "Smart Sort" to organize existing files.
2.  **Folders**: Browse your organized files by category.
3.  **Rules**: Add new rules (e.g., name: `Code`, extensions: `js,py,html`, folder: `Projects`).
4.  **Logs**: Check the audit trail to see where your files are going.

##  Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

##  License

This project is licensed under the MIT License.
