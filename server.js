import express from 'express';
import dotenv from 'dotenv';
import connectDB from './Database/mongoDB.js';
import index from './routes/index.js';
import session from 'express-session';
import MongoStore from 'connect-mongo';

dotenv.config();

const app = express();
const { PORT, MONGO_URI, SESSION_SECRET } = process.env;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', './views');

await connectDB();

app.use(session({
  secret: SESSION_SECRET || 'snfdlsinvdlxkvdxklnvdxzlbvb',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: MONGO_URI,
    collectionName: 'sessions',
    ttl: 60 * 60 * 24 * 7,  
  }),
  cookie: {
    httpOnly: true,           
    secure: process.env.NODE_ENV === 'production', 
    maxAge: 1000 * 60 * 60 * 24 * 7, 
    sameSite: 'lax',
  },
}));

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

app.use('', index);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));