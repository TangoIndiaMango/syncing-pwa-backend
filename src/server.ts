import express from 'express';
import bodyParser from 'body-parser';
import syncRoutes from './routes/sync.routes';
import cors from 'cors';

const app = express();
app.use(cors());

const port = 3000;

app.use(bodyParser.json());
app.use(syncRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
