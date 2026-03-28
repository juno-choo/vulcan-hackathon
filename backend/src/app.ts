import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';

import authRouter from './routes/auth';
import lookupsRouter from './routes/lookups';
import workshopsRouter from './routes/workshops';
import bookingsRouter from './routes/bookings';
import snapshotsRouter from './routes/snapshots';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

app.use('/api/auth', authRouter);
app.use('/api/lookups', lookupsRouter);
app.use('/api/workshops', workshopsRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/snapshots', snapshotsRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Vulcan API running on http://localhost:${PORT}`);
});
