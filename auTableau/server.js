// Importer express
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
const cors = require('cors');

// Configuration de CORS
const corsOptions = {
  origin: '*', // Permettre toutes les origines
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes autorisées
  allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisés
};
app.use(cors(corsOptions));

// Middleware pour gérer les données JSON envoyées dans les requêtes POST
app.use(express.json());
// Middleware pour servir des fichiers statiques (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Connexion à la base de données
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'luxar123', // N'oublie pas de vérifier ton mot de passe
  database: 'gestion_soutenances'
});

// Connecter à MySQL
connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à la base de données:', err);
    process.exit(1); // Quitter le processus si la connexion échoue
  }
  console.log('Connecté à la base de données MySQL');
});

// Définir une route GET pour la racine "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html')); // Envoie le fichier HTML
});

// pour obtenir les informations du tableau
app.get('/tableau', (req, res) => {
  const query = `
    SELECT id, name, className, classId 
    FROM tableau
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des données du tableau:', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération des données du tableau.' });
    }
    res.json(results);
  });
});

// Route POST pour ajouter un étudiant
app.post('/tableau', (req, res) => {
  const { id, name, className, classId } = req.body; // Récupérer les données envoyées depuis le client

  // Vérifier si tous les champs nécessaires sont présents
  if (!id || !name || !className || !classId) {
    return res.status(400).json({ error: 'Les champs id, name, className, et classId sont requis.' });
  }

  const query = `
    INSERT INTO tableau (id, name, className, classId)
    VALUES (?, ?, ?, ?)
  `;

  // Exécuter la requête SQL pour ajouter l'étudiant avec l'ID spécifié
  connection.query(query, [id, name, className, classId], (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'ajout de l\'étudiant au tableau:', err);
      return res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'étudiant.' });
    }
    res.status(201).json({ message: 'Étudiant ajouté avec succès', id: results.insertId });
  });
});

// Pour récupérer un étudiant aléatoire
app.get('/random-student', (req, res) => {
  const query = `
    SELECT id, name, classId 
    FROM etudiants 
    ORDER BY RAND() 
    LIMIT 1
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération d\'un étudiant:', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération d\'un étudiant.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'Aucun étudiant trouvé.' });
    }
    res.json(results[0]); // Retourne l'étudiant trouvé
  });
});

// Route pour récupérer les étudiants qui ne sont pas dans la table "tableau"
app.get('/students-not-in-tableau', (req, res) => {
  const query = `
    SELECT s.id, s.name, s.className
    FROM etudiants s
    LEFT JOIN tableau t ON s.id = t.id
    WHERE t.id IS NULL
  `;

  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des étudiants:', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération des étudiants.' });
    }
    res.json(results); // Retourne les étudiants qui ne sont pas dans "tableau"
  });
});

// Route pour supprimer un étudiant du tableau
app.delete('/tableau/:id', (req, res) => {
  const studentId = req.params.id; // Récupérer l'ID de l'étudiant depuis les paramètres d'URL

  // Requête SQL pour supprimer l'étudiant de la table 'tableau' par son ID
  const query = 'DELETE FROM tableau WHERE id = ?';
  
  connection.query(query, [studentId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la suppression de l\'étudiant du tableau:', err);
      return res.status(500).json({ error: 'Erreur lors de la suppression de l\'étudiant.' });
    }

    // Vérifier si une ligne a bien été supprimée
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Étudiant non trouvé dans le tableau.' });
    }

    res.sendStatus(204); // Réponse avec statut 204 No Content en cas de succès
  });
});


// Route pour obtenir tous les étudiants avec le nom de leur classe
app.get('/students', (req, res) => {
  const query = `
    SELECT e.id, e.name, c.name AS className 
    FROM etudiants e 
    JOIN classes c ON e.classId = c.id
  `;
  
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des étudiants:', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération des étudiants.' });
    }
    res.json(results);
  });
});

// Route pour ajouter un nouvel étudiant
app.post('/students', (req, res) => {
  const { name, classId } = req.body; // Récupérer name et classId

  // Vérifier que les champs ne sont pas vides
  if (!name || !classId) {
    return res.status(400).json({ error: 'Le nom et l\'ID de la classe sont requis.' });
  }

  // D'abord, récupérons le className correspondant à classId
  const getClassNameQuery = 'SELECT name FROM classes WHERE id = ?';
  connection.query(getClassNameQuery, [classId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération du nom de la classe:', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération du nom de la classe.' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: 'Classe non trouvée.' });
    }

    const className = results[0].name; // Récupérer le className

    // Maintenant, insérer l'étudiant avec className
    const insertStudentQuery = 'INSERT INTO etudiants (name, className, classId) VALUES (?, ?, ?)';
    connection.query(insertStudentQuery, [name, className, classId], (err, results) => {
      if (err) {
        console.error('Erreur lors de l\'ajout de l\'étudiant:', err);
        return res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'étudiant.' });
      }
      res.json({ id: results.insertId, name, className, classId });
    });
  });
});

// Route pour obtenir toutes les classes
app.get('/classes', (req, res) => {
  const query = 'SELECT * FROM classes';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des classes:', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération des classes.' });
    }
    res.json(results);
  });
});
// Route pour obtenir toutes les classes
app.get('/classes', (req, res) => {
  const getClassesQuery = 'SELECT id, name FROM classes';
  connection.query(getClassesQuery, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des classes:', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération des classes.' });
    }
    res.json(results);
  });
});

// Route pour ajouter une nouvelle classe
app.post('/classes', (req, res) => {
  const { name } = req.body;

  // Vérifiez que le nom n'est pas vide
  if (!name) {
    return res.status(400).json({ error: 'Le nom de la classe est requis.' });
  }

  const query = 'INSERT INTO classes (name) VALUES (?)';
  connection.query(query, [name], (err, results) => {
    if (err) {
      console.error('Erreur lors de l\'ajout de la classe:', err);
      return res.status(500).json({ error: 'Erreur lors de l\'ajout de la classe.' });
    }
    res.json({ id: results.insertId, name });
  });
});
// Route pour supprimer un étudiant
app.delete('/students/:id', (req, res) => {
  const studentId = req.params.id;
  const query = 'DELETE FROM etudiants WHERE id = ?';
  connection.query(query, [studentId], (err, results) => {
      if (err) {
        console.error('Erreur lors de la suppression de l\'étudiant:', err);
        return res.status(500).json({ error: 'Erreur lors de la suppression de l\'étudiant.' });
      }
      if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Étudiant non trouvé.' });
      }
      res.sendStatus(204); // Pas de contenu
  });
});



// Route pour supprimer une classe
app.delete('/classes/:id', (req, res) => {
  const classId = req.params.id;

  // Requête SQL pour supprimer la classe par son ID
  const sql = 'DELETE FROM classes WHERE id = ?';
  connection.query(sql, [classId], (error, results) => {
      if (error) {
          console.error('Erreur lors de la suppression de la classe:', error);
          return res.status(500).json({ error: 'Erreur lors de la suppression de la classe' });
      }
      // Vérifiez si des lignes ont été supprimées
      if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Classe non trouvée' });
      }
      // Renvoie un statut 204 No Content si la suppression a réussi
      res.status(204).send();
  });
});
// Route pour modifier un étudiant
app.put('/students/:id', (req, res) => {
  const studentId = req.params.id;
  const { name, classId } = req.body; // Récupérer le nouveau nom et classId

  // Vérifier que les champs ne sont pas vides
  if (!name || !classId) {
    return res.status(400).json({ error: 'Le nom et la classe sont requis.' });
  }

  // Vérifier si la classe existe
  const getClassNameQuery = 'SELECT name FROM classes WHERE id = ?';
  connection.query(getClassNameQuery, [classId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération du nom de la classe:', err);
      return res.status(500).json({ error: 'Erreur lors de la récupération du nom de la classe.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Classe non trouvée.' });
    }

    const className = results[0].name;

    // Mettre à jour l'étudiant avec le nouveau nom et la nouvelle classe
    const updateStudentQuery = 'UPDATE etudiants SET name = ?, className = ?, classId = ? WHERE id = ?';
    connection.query(updateStudentQuery, [name, className, classId, studentId], (err) => {
      if (err) {
        console.error('Erreur lors de la mise à jour de l\'étudiant:', err);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'étudiant.' });
      }
      res.json({ message: 'Étudiant modifié avec succès.' });
    });
  });
});
// Route pour modifier une classe
app.put('/classes/:id', (req, res) => {
  debugger;
  const classId = req.params.id;
  const { name } = req.body; // Récupérer le nom de la classe

  // Vérifiez que le nom n'est pas vide
  if (!name) {
    return res.status(400).json({ error: 'Le nom de la classe est requis.' });
  }
  // Mettre à jour la classe
  const updateClassQuery = `
    UPDATE classes 
    SET name = ? 
    WHERE id = ?`;
  connection.query(updateClassQuery, [name, classId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la mise à jour de la classe:', err);
      return res.status(500).json({ error: 'Erreur lors de la mise à jour de la classe.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Classe non trouvée.' });
    }

    res.json({ id: classId, name });
  });
});



// Démarrer le serveur
const PORT = 3000; // Vous pouvez changer le port si nécessaire
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
