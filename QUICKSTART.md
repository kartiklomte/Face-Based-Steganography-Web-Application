# 🚀 Quick Start Guide

## One-Command Start (Development)

### Terminal 1 - Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### Terminal 2 - Frontend
```bash
cd frontend
npm install
npm run dev
```

## Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger)

## First Time Setup Checklist

- [ ] Set up MongoDB Atlas account and get connection string
- [ ] Update `backend/.env` with MongoDB URI
- [ ] Update `backend/.env` with Gmail SMTP credentials (optional)
- [ ] Generate secure `SECRET_KEY` for JWT
- [ ] Both servers running without errors
- [ ] Frontend loads at localhost:5173
- [ ] Can register with face image
- [ ] Can login with same credentials
- [ ] Can send a test message

## Troubleshooting

### Face Recognition Issues
- Ensure lighting is good
- Position face in center of camera
- Use a clear, frontal face photo
- If still failing, try different image

### MongoDB Connection Error
- Check connection string in `.env`
- Verify IP is whitelisted in Atlas
- Ensure MongoDB URI is correct format

### Email Not Sending
- Verify SMTP credentials
- For Gmail: use App Password, not main password
- Check if firewall/antivirus blocks SMTP
- Verify email format of recipient

### Port Already in Use
- Change port in `.env` or environment
- Or kill process using the port

## Next Steps

1. Read the main README.md for full documentation
2. Test all features: Register, Login, Send, Receive
3. Customize styling in frontend/src/index.css
4. Deploy to production (add HTTPS, update CORS, etc.)

Happy coding! 🎉
