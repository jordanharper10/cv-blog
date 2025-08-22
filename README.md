# CV · Blog

A personal **CV and Blog web application** built for self-hosting on a Raspberry Pi.  
It combines a clean CV/Resume layout with a blog, portfolio, and life timeline — all editable through a web admin panel.

---

## Features

- **Public site**
  - Profile header (name, tagline, location, social links, certs)
  - Portfolio of coding projects (with links to GitHub/demo)
  - Blog posts (markdown + image uploads)
  - Timeline of key life/career events
  - Printable **CV page** styled like a real resume (2-column layout)
- **Admin panel**
  - Login/authentication with bcrypt + JWT cookies
  - CRUD for:
    - Profile/general info
    - Contact methods & socials (with icons)
    - Skills & certifications
    - Timeline entries
    - Projects
    - Blog posts
  - File upload (images, assets)
- **Stack**
  - Frontend: React + Vite + Tailwind, served by Nginx (`:443`)
  - Backend: Node.js + Express, served on port `:8443` via systemd
  - Database: SQLite (stored locally on Pi)

---

## Quickstart

### 1. Clone the Repo
```
git clone https://github.com/yourusername/cv-blog.git
cd cv-blog
```

### 2. Install Dependences
#### Frontend
```
cd web
npm install
```

#### Backend
```
cd ../api
npm install
```

### 3. Initialise the Database
```
cd ../api
npm run init:db
```
This will create `../data/app.db` with the required schema.

### 4. Add an Admin User
Generate a bcrypt hash for your user
`node -e "console.log(require('bcrypt').hashSync('yourpassword', 12))"`

Insert into the database:
`sqlite3 ../data/app.db "INSERT INTO users(email, password_hash) VALUES('you@example.com', 'HASH_HERE');"`

### 5. Build the Frontend
```
cd ../web
npm run build
```

### 6. Run the Backend
Copy the example environment and edit to your desired settings:
`cp .env.example .env`

Run the server for testing:
```
cd ../api
npm start
```

Production server setup:
`cp cv-blog-api.service.example /etc/systemd/system/cv-blog-api.service`

Modify the systemd file with your required settings.

Enable and start the service:
```
sudo systemctl enable cv-blog-api
sudo systemctl start cv-blog-api
```

### 7. Run the Frontend
Copy the Nginx configuration and modify to your desired settings:
```
cd ../web
sudo cp nginx.cv-blog.example /etc/nginx/sites-available/cv-blog
sudo ln -s /etc/nginx/sites-available/cv-blog /etc/nginx/sites-enabled/cv-blog
sudo systemctl reload nginx
```

For other web servers, consult the relevant documentation for frontend file service.

### Development
Run the frontend in dev mode:
`cd web && npm run dev`

Run the backend in dev mode:
`cd api && npm run dev`

## Project Structure
```
cv-blog/
├── api/           # Express backend (port 8443)
│   ├── server.js
│   ├── db.js
│   └── ...
├── web/           # React frontend (Vite + Tailwind)
│   ├── src/
│   ├── public/
│   └── ...
├── data/          # SQLite database files
├── uploads/       # Uploaded files
└── README.md
```

