// Pour ajouter une classe
document.getElementById('classForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const className = document.getElementById('className').value;

    // Envoyer la requête POST pour ajouter une classe
    fetch('/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: className })
    })
    .then(response => {
        if (!response.ok) throw new Error('Erreur lors de l\'ajout de la classe');
        return response.json();
    })
    .then(data => {
        console.log('Classe ajoutée:', data);
        loadClasses(); // Recharger la liste des classes
        document.getElementById('classForm').reset(); // Réinitialiser le formulaire
    })
    .catch(error => console.error('Erreur:', error));
});
// Pour ajouter un étudiant
document.getElementById('studentForm')?.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const classId = document.getElementById('classDropdown').value;

    fetch('/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, classId })
    })
    .then(response => {
        if (!response.ok) throw new Error('Erreur lors de l\'ajout de l\'étudiant');
        return response.json();
    })
    .then(data => {
        console.log('Étudiant ajouté:', data);
        loadStudents(); // Recharger la liste des étudiants
        loadStudents2();
        document.getElementById('studentForm').reset(); // Réinitialiser le formulaire
    })
    .catch(error => console.error('Erreur:', error));
});

// Pour supprimer un étudiant
function deleteStudent(studentId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
        return; // Annule la suppression si l'utilisateur ne confirme pas
    }

    fetch(`/students/${studentId}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) throw new Error('Erreur lors de la suppression de l\'étudiant');
            console.log(`Étudiant avec l'ID ${studentId} supprimé avec succès.`);
            loadStudents(); // Recharger la liste des étudiants
            loadStudents2();
        })
        .catch(error => console.error('Erreur:', error));
}

// Pour supprimer un étudiant depuis tableau
function deleteStudentTableau(studentId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
        return; // Annule la suppression si l'utilisateur ne confirme pas
    }

    fetch(`/tableau/${studentId}`, { method: 'DELETE' })
        .then(response => {
            if (!response.ok) throw new Error('Erreur lors de la suppression de l\'étudiant du tableau');
            console.log(`Étudiant avec l'ID ${studentId} supprimé avec succès du tableau.`);
            loadStudents(); 
            loadStudents2(); 
            loadTableauStudents();
        })
        .catch(error => console.error('Erreur:', error));
}

// Pour supprimer une classe
function deleteClass(classId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
        return; // Annule la suppression si l'utilisateur ne confirme pas
    }

    fetch(`/classes/${classId}`, {
        method: 'DELETE', // Utilise la méthode DELETE
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erreur lors de la suppression de la classe');
        }
        console.log(`Classe avec l'ID ${classId} supprimée avec succès.`);
        // Recharger les classes après suppression
        loadClasses(); // Recharger la liste pour afficher les changements
    })
    .catch(error => console.error('Erreur:', error));
}
// Pour charger les classes dans un dropdown
function loadClassesInDropdown(dropdown) {
    dropdown.innerHTML = '';
    fetch('/classes')
        .then(response => {
            if (!response.ok) throw new Error('Erreur lors du chargement des classes');
            return response.json();
        })
        .then(data => {
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Sélectionner une classe';
            dropdown.appendChild(defaultOption);
            data.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = cls.name;
                dropdown.appendChild(option);
            });
        })
        .catch(error => console.error('Erreur:', error));
}
// Pour charger les classes
function loadClasses() {
    fetch('/classes')
        .then(response => {
            if (!response.ok) throw new Error('Erreur lors du chargement des classes');
            return response.json();
        })
        .then(data => {
            const classList = document.getElementById('classList');
            if (classList) {
                classList.innerHTML = ''; // Clear the list before populating
                data.forEach(cls => {
                    const li = document.createElement('li');
                    li.innerHTML = `
                        ${cls.name}
                        <button onclick="editClass(${cls.id}, '${cls.name}')" aria-label="Modifier la classe ${cls.name}">Modifier</button>
                        <button onclick="deleteClass(${cls.id})" aria-label="Supprimer la classe ${cls.name}">Supprimer</button>`;
                    classList.appendChild(li);
                });
            }

            const classDropdown = document.getElementById('classDropdown');
            if (classDropdown) {
                classDropdown.innerHTML = '<option value="">Sélectionner une classe</option>'; // Reset dropdown
                data.forEach(cls => {
                    const option = document.createElement('option');
                    option.value = cls.id;
                    option.textContent = cls.name;
                    classDropdown.appendChild(option);
                });
            }
        })
        .catch(error => console.error('Erreur:', error));
}
// Pour charger les étudiants
function loadStudents() {
    fetch('/students')
        .then(response => {
            if (!response.ok) throw new Error('Erreur lors du chargement des étudiants');
            return response.json(); // Change to JSON
        })
        .then(data => {
            const studentList = document.getElementById('studentList');
            if (!studentList) return;
            studentList.innerHTML = ''; // Clear the list before populating
            data.forEach(student => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${student.name} - Classe: ${student.className} 
                    <button onclick="editStudent(${student.id}, '${student.name}', ${student.classId})" aria-label="Modifier l'étudiant ${student.name}">Modifier</button> 
                    <button onclick="deleteStudent(${student.id})" aria-label="Supprimer l'étudiant ${student.name}">Supprimer</button>`;
                studentList.appendChild(li);
            });
        })
        .catch(error => console.error('Erreur:', error));
}
// Fonction pour charger les étudiants qui ne sont pas dans la table "tableau"
function loadStudents2() {
    fetch('/students-not-in-tableau') // Assurez-vous que l'endpoint corresponde à votre route backend
        .then(response => {
            if (!response.ok) throw new Error('Erreur lors du chargement des étudiants');
            return response.json(); // Convertir la réponse en JSON
        })
        .then(data => {
            const studentList = document.getElementById('studentList2');
            if (!studentList) return; // Vérifier si l'élément existe
            studentList.innerHTML = ''; // Vider la liste avant de la remplir
            data.forEach(student => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${student.name} - Classe: ${student.className}`;
                studentList.appendChild(li);
            });
        })
        .catch(error => console.error('Erreur:', error));
}

// section tableau, pour les etudiants au tableau
function loadTableauStudents() {
    fetch('/tableau')
        .then(response => {
            if (!response.ok) throw new Error('Erreur lors du chargement des étudiants du tableau');
            return response.json(); // Traiter la réponse en JSON
        })
        .then(data => {
            const tableauList = document.getElementById('tableauList');
            if (!tableauList) return;
            tableauList.innerHTML = ''; // Vider la liste avant de la peupler
            data.forEach(student => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${student.name}
                     <button onclick="deleteStudentTableau(${student.id})" aria-label="Supprimer l'étudiant ${student.name}">Supprimer</button>`;
                tableauList.appendChild(li);
            });
        })
        .catch(error => console.error('Erreur:', error));
}

// Fonction pour ajouter un étudiant aléatoire
function addRandomStudent() {
    fetch('http://localhost:3000/random-student')
      .then(response => {
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Il n\'y a plus d\'élèves disponibles à ajouter.');
          }
          throw new Error('Erreur lors de la récupération d\'un étudiant aléatoire.');
        }
        return response.json();
      })
      .then(student => {
        const { id, name, classId } = student; // Récupérer les détails de l'étudiant
        const className = "Nom de la classe";

        // Envoyer les données (avec l'ID inclus) au serveur pour ajouter l'étudiant au tableau
        return fetch('http://localhost:3000/tableau', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ id, name, className, classId }) // Inclure l'ID dans la requête POST
        });
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            if (response.status === 400 && data.error === 'Cet étudiant est déjà dans le tableau.') {
              throw new Error('Cet étudiant est déjà dans le tableau.');
            } else {
              throw new Error('Erreur lors de l\'ajout de l\'étudiant au tableau.');
            }
          });
        }
        return response.json();
      })
      .then(data => {
        console.log('Étudiant ajouté avec succès:', data);
        loadStudents2();
        loadTableauStudents();
      })
      .catch(error => {
        // Afficher des pop-ups en cas d'erreur
        if (error.message === 'Cet étudiant est déjà dans le tableau.') {
          alert('Erreur : Cet étudiant est déjà présent dans le tableau.');
        } else if (error.message === 'Il n\'y a plus d\'élèves disponibles à ajouter.') {
          alert('Erreur : Il n\'y a plus d\'élèves disponibles à ajouter.');
        } else {
          alert('Erreur : ' + error.message);
        }
        console.error('Erreur:', error);
      });
}


// Ajouter l'écouteur d'événements au bouton
document.getElementById('addRandomStudentBtn').addEventListener('click', addRandomStudent);

// Fonction pour ouvrir le formulaire de modification d'une classe
function editClass(classId, currentName) {
    const newName = prompt('Modifier le nom de la classe:', currentName);
    if (newName) {
        fetch(`/classes/${classId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName })
        })
        .then(response => {
            if (!response.ok) throw new Error('Erreur lors de la modification de la classe');
            console.log(`Classe avec l'ID ${classId} modifiée avec succès.`);
            loadClasses(); // Recharger les classes après modification
            loadStudents();
            loadStudents2();
        })
        .catch(error => console.error('Erreur:', error));
    }
}

// Fonction pour ouvrir le formulaire de modification d'un étudiant
function editStudent(studentId, currentName, currentClassId) {
    selectedStudentId = studentId; // Sauvegarder l'ID de l'étudiant sélectionné

    // Préremplir le champ de nom de l'étudiant
    document.getElementById('studentName').value = currentName;

    // Charger les classes disponibles pour le select
    fetch('/classes')
        .then(response => response.json())
        .then(classes => {
            const classSelect = document.getElementById('studentClass');
            classSelect.innerHTML = ''; // Vider la liste actuelle

            classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = cls.name;
                if (cls.id === currentClassId) {
                    option.selected = true; // Pré-sélectionner la classe actuelle
                }
                classSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Erreur lors du chargement des classes:', error));

    // Afficher le modal
    modal.style.display = "block";
}  

// Pour activer les fonctions
window.onload = () => {
    loadStudents();
    loadClasses();
    loadStudents2();
    loadTableauStudents();
};

// Sélection des éléments du DOM
const modal = document.getElementById("editStudentModal");
const span = document.getElementsByClassName("close")[0];
const form = document.getElementById("editStudentForm");
let selectedStudentId;
// Fonction pour ouvrir le modal et pré-remplir les champs
function openEditModal(studentId, currentName, currentClassId) {
    selectedStudentId = studentId;

    // Préremplir le champ de nom de l'étudiant
    document.getElementById('studentName').value = currentName;

    // Charger les classes disponibles dans le dropdown
    fetch('/classes')
        .then(response => response.json())
        .then(classes => {
            const classSelect = document.getElementById('studentClass');
            classSelect.innerHTML = ''; // Vider la liste actuelle

            // Ajouter les options des classes
            classes.forEach(cls => {
                const option = document.createElement('option');
                option.value = cls.id;
                option.textContent = cls.name;
                if (cls.id === currentClassId) {
                    option.selected = true; // Pré-sélectionner la classe actuelle
                }
                classSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Erreur lors du chargement des classes:', error));

    modal.style.display = "block"; // Afficher le modal
}
// Lorsque l'utilisateur clique sur "x", fermer le modal
span.onclick = function() {
    modal.style.display = "none";
}

// Lorsque l'utilisateur clique en dehors du modal, le fermer
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Lorsque le formulaire de modification est soumis
form.onsubmit = function(event) {
    event.preventDefault(); // Empêcher le rechargement de la page

    const name = document.getElementById('studentName').value;
    const classId = document.getElementById('studentClass').value;

    fetch(`/students/${selectedStudentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, classId })
    })
    .then(response => {
        if (!response.ok) throw new Error('Erreur lors de la modification de l\'étudiant');
        console.log(`Étudiant avec l'ID ${selectedStudentId} modifié avec succès.`);
        loadStudents(); // Recharger la liste des étudiants
        loadStudents2();
        modal.style.display = "none"; // Fermer le modal
    })
    .catch(error => console.error('Erreur:', error));
}
