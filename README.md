# DEP24-P11-HostelManagement

## OS Used

Development done on **Windows OS** 
 
## Running the Project

To run the DEP24-P11-HostelManagement project, follow these steps:

### Backend Setup
1. Create Virtual Environment and Activate it
    ```bash
    cd Backend
    python -m venv v1
    ```
    Activation for windows
    ```
    ./v1/Scripts/activate
    ```
    Activation for Linux
    ```
    source v1/bin/activate
    ```

2. Make sure all Python dependencies are installed using pip:

    ```bash
    pip install -r requirements.txt
    ```
3. Start the database and create superuser
    ```bash
    python3 manage.py makemigrations
    python3 manage.py migrate
    python3 manage.py createsuperuser
    ```

4. Start the Django development server:

    ```bash
    python3 manage.py runserver
    ```

   The backend server will run at `http://localhost:8000` by default.

### Frontend Setup

1. Open a new terminal.

2. Navigate to the `frontend` directory:

    ```bash
    cd frontend
    ```

3. Install Node.js dependencies using npm:

    ```bash
    npm install
    ```

4. Start the frontend development server:

    ```bash
    npm start
    ```

   The frontend development server will run at `http://localhost:3000` by default.

Now, you should be able to access the DEP24-P11-HostelManagement project by visiting `http://localhost:3000` in your web browser.

