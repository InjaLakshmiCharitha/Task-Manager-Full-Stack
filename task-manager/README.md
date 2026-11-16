# Task Manager Application

A full-stack Task Manager application built using Django REST Framework, React, and MySQL. It allows users to manage tasks, organize them into categories, set priorities and due dates, track progress, and manage their daily activities.

## Technologies Used

### Backend
- Python
- Django
- Django REST Framework
- MySQL
- Django REST Framework Simple JWT
- django-filter
- python-decouple

### Frontend
- React
- Vite
- JavaScript
- Axios
- React Router
- CSS

## Project Structure

```text
task-manager/
│
├── backend/
│   ├── accounts/
│   ├── tasks/
│   ├── config/
│   ├── manage.py
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── docker-compose.yml
├── nginx.conf
└── README.md
```

## Backend Setup

### 1. Clone the Repository

```bash
git clone <your-github-repository-url>
cd task-manager
```

### 2. Navigate to Backend

```bash
cd backend
```

### 3. Create a Virtual Environment

```bash
python -m venv venv
```

Activate it on Windows:

```powershell
venv\Scripts\activate
```

### 4. Install Dependencies

```bash
python -m pip install -r requirements.txt
```

### 5. Configure Environment Variables

Create a `.env` file inside the backend folder using `.env.example` as a reference.

Configure the following values according to your local MySQL setup:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True

DB_NAME=task_manager_db
DB_USER=your_mysql_username
DB_PASSWORD=your_mysql_password
DB_HOST=localhost
DB_PORT=3306
```

Add any additional variables required by your existing settings, such as email configuration.

Do not upload your actual `.env` file to GitHub.

### 6. Create the MySQL Database

Open MySQL and execute:

```sql
CREATE DATABASE task_manager_db;
```

### 7. Apply Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 8. Create Django Admin Account

```bash
python manage.py createsuperuser
```

Follow the prompts to create your administrator account.

### 9. Start the Backend Server

```bash
python manage.py runserver
```

Backend URL:

```text
http://127.0.0.1:8000/
```

Django Admin:

```text
http://127.0.0.1:8000/admin/
```

## Frontend Setup

### 1. Open a New Terminal

Navigate to the frontend folder:

```bash
cd task-manager/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the frontend folder.

```env
VITE_API_URL=http://127.0.0.1:8000/api/
```

### 4. Start the Frontend

```bash
npm run dev
```

Frontend URL:

```text
http://localhost:5173/
```

## Test User Credentials

Register a new user through the application.

| Field | Value |
|---|---|
| Registration | `/register` |
| Login | `/login` |
| Authentication | JWT |

**Demo account:** Enter the email address and password of the test account you created during registration.

Do not publish real passwords or private credentials in the public repository.

## API Endpoints

All API endpoints are available under:

```text
http://127.0.0.1:8000/api/
```

### Authentication APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register/` | Register a new user |
| POST | `/api/auth/login/` | User login |
| POST | `/api/auth/token/refresh/` | Refresh access token |
| GET | `/api/auth/me/` | Get logged-in user profile |
| POST | `/api/auth/change-password/` | Change password |
| POST | `/api/auth/logout/` | Logout and blacklist refresh token |

### Category APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/categories/` | Get all categories |
| POST | `/api/categories/` | Create a category |
| GET | `/api/categories/{id}/` | Get category details |
| PUT/PATCH | `/api/categories/{id}/` | Update a category |
| DELETE | `/api/categories/{id}/` | Delete a category |

### Task APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks/` | Get all tasks |
| POST | `/api/tasks/` | Create a task |
| GET | `/api/tasks/{id}/` | Get task details |
| PUT/PATCH | `/api/tasks/{id}/` | Update a task |
| DELETE | `/api/tasks/{id}/` | Delete a task |
| POST | `/api/tasks/{id}/toggle-complete/` | Toggle task completion |
| GET | `/api/tasks/dashboard/` | Get dashboard statistics |

### Subtask APIs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/subtasks/` | Get subtasks |
| POST | `/api/subtasks/` | Create a subtask |
| GET | `/api/subtasks/{id}/` | Get subtask details |
| PUT/PATCH | `/api/subtasks/{id}/` | Update a subtask |
| DELETE | `/api/subtasks/{id}/` | Delete a subtask |

### Task Search, Filtering and Ordering

The task API supports filtering and searching.

Examples:

```text
/api/tasks/?status=To Do
/api/tasks/?priority=High
/api/tasks/?search=project
/api/tasks/?ordering=due_date
/api/tasks/?page=2
```

Available filters include status, priority, category, and due-date conditions. Search supports task titles and descriptions.

## Application Features

- User registration and login
- JWT authentication and token refresh
- User profile management
- Password change
- Category creation, editing, and deletion
- Task creation, editing, and deletion
- Task priorities and due dates
- Task completion tracking
- Search, filtering, sorting, and pagination
- Dashboard with task statistics
- Subtask management
- Kanban board
- Dark mode
- Daily and weekly recurring tasks
- Email reminders for tasks due tomorrow

## Running Backend Tests

Navigate to the backend directory and activate the virtual environment.

Run:

```bash
python manage.py test
```

## Frontend Production Build

Navigate to the frontend directory.

Run:

```bash
npm run build
```

## Docker

The project includes Docker configuration files for containerized deployment.

To start the configured services:

```bash
docker compose up --build
```

Refer to the Docker configuration and environment variables for the required database and service settings.

## Author

Task Manager Application – Full Stack Development Project

**Backend:** Django REST Framework  
**Frontend:** React  
**Database:** MySQL