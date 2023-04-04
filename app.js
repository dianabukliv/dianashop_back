const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
const port = process.env.port || 5000;
const cors = require('cors');

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.listen(port, () => console.log(`listening on ${port}`));

const DATABASE_URL =
  'mysql://96x5un9emmsz4mv0atxf:pscale_pw_fwYBlVVlcsCeRq4mDAyz0osonf0D0xQ95Vx1auKwAkh@aws.connect.psdb.cloud/my_library?ssl={"rejectUnauthorized":true}';

const connection = mysql.createConnection(DATABASE_URL);

const splitOnce = (str, on) => {
  [first, ...rest] = str.split(on);
  return rest.length > 0 ? [first, rest] : ['=', first];
};

const buildWhere = (query) => {
  const conditions = [];
  const values = [];
  Object.entries(query).forEach(([key, val]) => {
    const [operation, value] = splitOnce(val, '_');
    conditions.push(`${key} ${operation} ?`);
    values.push(value);
  });
  return {
    where: conditions.length === 0 ? 1 : conditions.join(' AND '),
    values,
  };
};

const getRecords = (req, res, name) => {
  try {
    const conditions = buildWhere(req.query);

    connection.query(
      `SELECT * FROM \`${name}\` WHERE ${conditions.where}`,
      conditions.values,
      (err, rows) => {
        connection.release();
        if (!err) {
          res.status(200).json({ data: rows });
        } else {
          res.status(500).json({ message: err.message });
        }
      }
    );
  } catch (_err) {
    res.status(500).json({ message: _err.message });
  }
};

const createRecord = (req, res, name) => {
  try {
    const values = req.body;

    connection.query(`INSERT INTO ${name} SET ?`, values, (err, rows) => {
      connection.release();
      if (!err) {
        res.status(200).json({
          message: `${name} з даними ${JSON.stringify(values)} створено`,
        });
      } else {
        res.status(500).json({ message: err.message });
      }
    });
  } catch (_err) {
    res.status(500).json({ message: _err.message });
  }
};

const deleteRecord = (req, res, name, pk) => {
  try {
    const conditions = pk.map((key) => `${key} = ?`);
    const params = [];
    for (i = 0; i < pk.length; i++) {
      params.push(req.params[`pk${i}`]);
    }

    connection.query(
      `DELETE FROM ${name} WHERE ${conditions.join(' AND ')}`,
      params,
      (err, _) => {
        connection.release();
        if (!err) {
          res.status(200).json({
            message: `${name} з ключами [${pk}] = [${params}] видалено`,
          });
        } else {
          res.status(500).json({ message: err.message });
        }
      }
    );
  } catch (_err) {
    res.status(500).json({ message: _err.message });
  }
};

app.get('/borrowings/', (req, res) => {
  getRecords(req, res, 'Видачі');
});

app.post('/create/borrowings/', (req, res) => {
  createRecord(req, res, 'Видачі');
});

app.delete('/delete/borrowings/:pk0', (req, res) => {
  deleteRecord(req, res, 'Видачі', ['код_читача']);
});

app.get('/books/', (req, res) => {
  getRecords(req, res, 'Книги');
});

app.post('/create/books/', (req, res) => {
  createRecord(req, res, 'Книги');
});

app.delete('/delete/books/:pk0&:pk1', (req, res) => {
  deleteRecord(req, res, 'Книги', ['шифр', 'код_видавництва']);
});

app.get('/readers/', (req, res) => {
  getRecords(req, res, 'Читачі');
});

app.post('/create/readers/', (req, res) => {
  createRecord(req, res, 'Читачі');
});

app.delete('/delete/readers/:pk0', (req, res) => {
  deleteRecord(req, res, 'Читачі', ['код']);
});

app.get('/productions/', (req, res) => {
  getRecords(req, res, 'Видавництва');
});

app.post('/create/productions/', (req, res) => {
  createRecord(req, res, 'Видавництва');
});

app.delete('/delete/productions/:pk0', (req, res) => {
  deleteRecord(req, res, 'Видавництва', ['код']);
});
